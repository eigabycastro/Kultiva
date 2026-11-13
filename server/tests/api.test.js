/* Testes de integração: sobem a API em memória (Supertest) contra o banco do DATABASE_URL.
   Cada execução cria os próprios usuários e ofertas, então não depende do seed. */
import bcrypt from 'bcryptjs'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { criarApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const app = criarApp()
const tag = Date.now()
const senha = 'senhaDeTeste1'
let tokenProdutor, tokenVarejista, tokenAdmin, oferta, varejistaId
const ids = { usuarios: [], produto: null }

const auth = (t) => ({ Authorization: `Bearer ${t}` })
const login = async (email) => (await request(app).post('/api/auth/login').send({ email, senha })).body.token

beforeAll(async () => {
  const senhaHash = await bcrypt.hash(senha, 4)
  const produto = await prisma.produto.create({ data: { nome: `Teste ${tag}`, foto: 'tomate', categoria: 'Legumes', unidadePadrao: 'kg' } })
  ids.produto = produto.id
  const base = { senhaHash, cidade: 'Pouso Alegre', uf: 'MG' }
  const produtor = await prisma.usuario.create({
    data: {
      ...base,
      nome: 'Produtor Teste',
      email: `produtor.${tag}@teste.com`,
      perfil: 'PRODUTOR',
      organizacao: 'Sítio Teste',
      latitude: -22.29,
      longitude: -45.96,
      propriedades: { create: { nome: 'Sítio Teste', cep: '37550-000', cidade: 'Pouso Alegre', uf: 'MG', latitude: -22.29, longitude: -45.96 } },
    },
    include: { propriedades: true },
  })
  const varejista = await prisma.usuario.create({
    data: { ...base, nome: 'Varejista Teste', email: `varejista.${tag}@teste.com`, perfil: 'VAREJISTA', organizacao: 'Mercado Teste', latitude: -22.2266, longitude: -45.9389 },
  })
  const admin = await prisma.usuario.create({ data: { ...base, nome: 'Admin Teste', email: `admin.${tag}@teste.com`, perfil: 'ADMIN' } })
  ids.usuarios.push(produtor.id, varejista.id, admin.id)
  varejistaId = varejista.id

  tokenProdutor = await login(produtor.email)
  tokenVarejista = await login(varejista.email)
  tokenAdmin = await login(admin.email)

  const r = await request(app)
    .post('/api/ofertas')
    .set(auth(tokenProdutor))
    .send({ propriedadeId: produtor.propriedades[0].id, produtoId: produto.id, preco: '5,00', unidade: 'kg', quantidade: 100, pedidoMinimo: 10, dataColheita: '2026-11-10' })
  oferta = r.body
})

afterAll(async () => {
  await prisma.pedido.deleteMany({ where: { OR: [{ varejistaId: { in: ids.usuarios } }, { produtorId: { in: ids.usuarios } }] } })
  await prisma.demanda.deleteMany({ where: { produtoId: ids.produto } })
  await prisma.usuario.deleteMany({ where: { id: { in: ids.usuarios } } })
  await prisma.produto.delete({ where: { id: ids.produto } })
  await prisma.$disconnect()
})

describe('autenticação e perfis', () => {
  it('bloqueia rota privada sem token (401)', async () => {
    const r = await request(app).get('/api/ofertas')
    expect(r.status).toBe(401)
  })
  it('recusa login com senha errada', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: `produtor.${tag}@teste.com`, senha: 'errada123' })
    expect(r.status).toBe(401)
    expect(r.body.error).toBe('E-mail ou senha incorretos.')
  })
  it('varejista não pode cadastrar oferta (403)', async () => {
    const r = await request(app).post('/api/ofertas').set(auth(tokenVarejista)).send({})
    expect(r.status).toBe(403)
  })
  it('produtor não acessa a administração (403)', async () => {
    expect((await request(app).get('/api/admin/usuarios').set(auth(tokenProdutor))).status).toBe(403)
  })
  it('valida o corpo com mensagens claras (400)', async () => {
    const r = await request(app).post('/api/propriedades').set(auth(tokenProdutor)).send({ nome: '' })
    expect(r.status).toBe(400)
    expect(r.body.details.map((d) => d.campo)).toEqual(expect.arrayContaining(['nome', 'cep']))
  })
  it('admin bloqueia um usuário e ele perde o acesso', async () => {
    const r = await request(app).patch(`/api/admin/usuarios/${varejistaId}/bloqueio`).set(auth(tokenAdmin)).send({ bloqueado: true })
    expect(r.body.bloqueado).toBe(true)
    expect((await request(app).get('/api/auth/me').set(auth(tokenVarejista))).status).toBe(403)
    await request(app).patch(`/api/admin/usuarios/${varejistaId}/bloqueio`).set(auth(tokenAdmin)).send({ bloqueado: false })
  })
})

describe('regra de negócio: pedido e estoque', () => {
  it('a oferta foi criada com 100 kg disponíveis', () => {
    expect(oferta.quantidadeDisponivel).toBe(100)
    expect(oferta.preco).toBe(5)
  })

  it('bloqueia pedido acima do estoque (409)', async () => {
    const r = await request(app).post('/api/pedidos').set(auth(tokenVarejista)).send({ itens: [{ ofertaId: oferta.id, quantidade: 101 }] })
    expect(r.status).toBe(409)
    expect(r.body.error).toMatch(/Estoque insuficiente/)
  })

  it('bloqueia pedido abaixo do mínimo (400)', async () => {
    const r = await request(app).post('/api/pedidos').set(auth(tokenVarejista)).send({ itens: [{ ofertaId: oferta.id, quantidade: 5 }] })
    expect(r.status).toBe(400)
  })

  it('aceitar baixa o estoque; o segundo aceite sem estoque é bloqueado', async () => {
    const p1 = await request(app).post('/api/pedidos').set(auth(tokenVarejista)).send({ itens: [{ ofertaId: oferta.id, quantidade: 70 }] })
    const p2 = await request(app).post('/api/pedidos').set(auth(tokenVarejista)).send({ itens: [{ ofertaId: oferta.id, quantidade: 40 }] })
    expect(p1.status).toBe(201)
    expect(p1.body.status).toBe('PENDENTE')
    expect(p1.body.total).toBe(350)

    // criar o pedido não reserva estoque
    expect((await prisma.oferta.findUnique({ where: { id: oferta.id } })).quantidadeDisponivel).toBe(100)

    const a1 = await request(app).patch(`/api/pedidos/${p1.body.id}/status`).set(auth(tokenProdutor)).send({ acao: 'aceitar' })
    expect(a1.status).toBe(200)
    expect(a1.body.status).toBe('ACEITO')
    expect((await prisma.oferta.findUnique({ where: { id: oferta.id } })).quantidadeDisponivel).toBe(30)

    const a2 = await request(app).patch(`/api/pedidos/${p2.body.id}/status`).set(auth(tokenProdutor)).send({ acao: 'aceitar' })
    expect(a2.status).toBe(409)
    expect((await prisma.oferta.findUnique({ where: { id: oferta.id } })).quantidadeDisponivel).toBe(30)

    // cancelar um pedido aceito devolve o estoque
    const c = await request(app).patch(`/api/pedidos/${p1.body.id}/status`).set(auth(tokenVarejista)).send({ acao: 'cancelar', motivo: 'teste' })
    expect(c.body.status).toBe('CANCELADO')
    expect((await prisma.oferta.findUnique({ where: { id: oferta.id } })).quantidadeDisponivel).toBe(100)
  })

  it('oferta zerada vira ESGOTADA', async () => {
    const p = await request(app).post('/api/pedidos').set(auth(tokenVarejista)).send({ itens: [{ ofertaId: oferta.id, quantidade: 100 }] })
    await request(app).patch(`/api/pedidos/${p.body.id}/status`).set(auth(tokenProdutor)).send({ acao: 'aceitar' })
    const o = await prisma.oferta.findUnique({ where: { id: oferta.id } })
    expect(o.quantidadeDisponivel).toBe(0)
    expect(o.status).toBe('ESGOTADA')
  })

  it('varejista não pode aceitar pedido (transição inválida para o perfil)', async () => {
    const lista = await request(app).get('/api/pedidos?grupo=andamento').set(auth(tokenVarejista))
    const r = await request(app).patch(`/api/pedidos/${lista.body.data[0].id}/status`).set(auth(tokenVarejista)).send({ acao: 'aceitar' })
    expect(r.status).toBe(409)
  })

  it('o produtor é notificado dos pedidos recebidos', async () => {
    const r = await request(app).get('/api/notificacoes?tipo=PEDIDO').set(auth(tokenProdutor))
    expect(r.body.total).toBeGreaterThan(0)
  })
})

describe('busca e Procura-se', () => {
  it('busca filtra por raio e pagina', async () => {
    const r = await request(app).get(`/api/ofertas?produtoId=${ids.produto}&raioKm=1&pageSize=5`).set(auth(tokenVarejista))
    expect(r.status).toBe(200)
    expect(r.body.total).toBe(0) // a oferta de teste está a ~8 km e esgotada
    expect(r.body).toMatchObject({ page: 1, pageSize: 5 })
  })

  it('publicar demanda notifica o produtor compatível', async () => {
    await prisma.oferta.update({ where: { id: oferta.id }, data: { quantidadeDisponivel: 50, status: 'ATIVA' } })
    const r = await request(app)
      .post('/api/demandas')
      .set(auth(tokenVarejista))
      .send({ produtoId: ids.produto, quantidade: 40, unidade: 'kg', precoMaximo: 6, prazo: '2099-01-01', raioKm: 30 })
    expect(r.status).toBe(201)
    expect(r.body.produtoresAvisados).toBe(1)

    const n = await request(app).get('/api/notificacoes?tipo=DEMANDA').set(auth(tokenProdutor))
    expect(n.body.data[0].titulo).toMatch(/procura 40 kg/)

    const regiao = await request(app).get('/api/demandas?compativeis=true').set(auth(tokenProdutor))
    expect(regiao.body.data.some((d) => d.id === r.body.id && d.compativel)).toBe(true)
  })
})

describe('chat de negociação e catálogo', () => {
  let produtorId
  beforeAll(async () => {
    produtorId = (await request(app).get('/api/auth/me').set(auth(tokenProdutor))).body.id
  })

  it('varejista manda mensagem e o produtor vê a conversa com não lida', async () => {
    const r = await request(app).post(`/api/mensagens/${produtorId}`).set(auth(tokenVarejista)).send({ texto: 'Tem tomate para sexta?', ofertaId: oferta.id })
    expect(r.status).toBe(201)
    expect(r.body.minha).toBe(true)

    const lista = await request(app).get('/api/mensagens/conversas').set(auth(tokenProdutor))
    const conversa = lista.body.data.find((c) => c.contato.id === varejistaId)
    expect(conversa.naoLidas).toBe(1)
    expect(conversa.ultima.texto).toBe('Tem tomate para sexta?')

    // abrir a conversa marca como lida e traz a oferta negociada
    const aberta = await request(app).get(`/api/mensagens/${varejistaId}`).set(auth(tokenProdutor))
    expect(aberta.body.oferta.id).toBe(oferta.id)
    expect(aberta.body.mensagens).toHaveLength(1)
    const depois = await request(app).get('/api/mensagens/conversas').set(auth(tokenProdutor))
    expect(depois.body.naoLidas).toBe(0)

    const n = await request(app).get('/api/notificacoes?tipo=MENSAGEM').set(auth(tokenProdutor))
    expect(n.body.data[0].link).toBe(`/produtor/negociacoes?com=${varejistaId}`)
  })

  it('não permite conversa com admin, consigo mesmo nem mensagem vazia', async () => {
    const adminId = (await request(app).get('/api/auth/me').set(auth(tokenAdmin))).body.id
    expect((await request(app).post(`/api/mensagens/${adminId}`).set(auth(tokenVarejista)).send({ texto: 'oi' })).status).toBe(404) // admin não participa do chat
    expect((await request(app).post(`/api/mensagens/${varejistaId}`).set(auth(tokenVarejista)).send({ texto: 'oi' })).status).toBe(400)
    expect((await request(app).post(`/api/mensagens/${produtorId}`).set(auth(tokenVarejista)).send({ texto: '   ' })).status).toBe(400)
  })

  it('produtor cadastra um produto novo e o nome repetido reaproveita o mesmo', async () => {
    const nome = `Pimentão teste ${tag}`
    const a = await request(app).post('/api/produtos').set(auth(tokenProdutor)).send({ nome, categoria: 'Legumes', unidadePadrao: 'kg' })
    expect(a.status).toBe(201)
    expect(a.body.foto).toBe('outro')
    const b = await request(app).post('/api/produtos').set(auth(tokenProdutor)).send({ nome: nome.toUpperCase(), categoria: 'Legumes', unidadePadrao: 'kg' })
    expect(b.status).toBe(200)
    expect(b.body.id).toBe(a.body.id)
    await prisma.produto.delete({ where: { id: a.body.id } })
  })

  it('calendário e previsão respondem para o produtor e bloqueiam o varejista', async () => {
    const cal = await request(app).get('/api/calendario').set(auth(tokenProdutor))
    expect(cal.status).toBe(200)
    expect(cal.body.eventos.some((e) => e.tipo === 'colheita')).toBe(true)
    expect((await request(app).get('/api/previsao').set(auth(tokenProdutor))).status).toBe(200)
    expect((await request(app).get('/api/calendario').set(auth(tokenVarejista))).status).toBe(403)
  })
})
