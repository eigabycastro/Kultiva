import { Router } from 'express'
import { z } from 'zod'
import { badRequest, forbidden, notFound } from '../lib/errors.js'
import { distanciaKm } from '../lib/geo.js'
import { iniciais } from '../lib/format.js'
import { paginacao, paginado } from '../lib/pagination.js'
import { prisma } from '../lib/prisma.js'
import { serializarDemanda } from '../lib/serializers.js'
import { booleano, data, dinheiro, idParam, inteiroPositivo, textoOpcional } from '../lib/schemas.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'
import { notificarProdutoresDaDemanda, ofertasCompativeis } from '../services/match.js'

// CRUD do "Procura-se" (demandas publicadas pelo varejista)
const r = Router()
const incluir = { produto: true, varejista: true }
const hoje = () => new Date(new Date().toDateString())

const contarProdutores = (ofertas) => new Set(ofertas.map((o) => o.propriedade.produtorId)).size

/* ---------- Lista: varejista vê as suas; produtor vê as abertas da região ---------- */
const listaSchema = z.object({
  status: z.enum(['ABERTA', 'ENCERRADA']).optional(),
  q: z.string().trim().max(80).optional(),
  compativeis: booleano,
  urgentes: booleano,
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
})

r.get('/', validar(listaSchema, 'query'), async (req, res) => {
  const f = req.filtros
  const u = req.usuario
  const pag = paginacao(req.query, { padrao: 12 })
  const busca = f.q && { produto: { nome: { contains: f.q, mode: 'insensitive' } } }

  if (u.perfil === 'VAREJISTA' || u.perfil === 'ADMIN') {
    const where = { ...(u.perfil === 'VAREJISTA' && { varejistaId: u.id }), ...(f.status && { status: f.status }), ...busca }
    const [total, lista] = await Promise.all([
      prisma.demanda.count({ where }),
      prisma.demanda.findMany({ where, include: incluir, orderBy: [{ status: 'asc' }, { prazo: 'asc' }], skip: pag.skip, take: pag.take }),
    ])
    const comMatch = await Promise.all(
      lista.map(async (d) => {
        const ofertas = d.status === 'ABERTA' ? await ofertasCompativeis({ ...d, origem: d.varejista }) : []
        const melhor = ofertas.reduce((m, o) => (m == null || Number(o.preco) < m ? Number(o.preco) : m), null)
        return serializarDemanda(d, { produtoresCompativeis: contarProdutores(ofertas), melhorPreco: melhor })
      }),
    )
    return res.json(paginado(comMatch, total, pag))
  }

  // PRODUTOR: demandas abertas cuja distância até alguma propriedade dele cabe no raio da demanda
  const [propriedades, minhas, demandas] = await Promise.all([
    prisma.propriedade.findMany({ where: { produtorId: u.id } }),
    prisma.oferta.findMany({
      where: { propriedade: { produtorId: u.id }, status: 'ATIVA', quantidadeDisponivel: { gt: 0 } },
      include: { produto: true },
    }),
    prisma.demanda.findMany({
      where: { status: 'ABERTA', prazo: { gte: hoje() }, varejista: { bloqueado: false }, ...busca },
      include: incluir,
      orderBy: { prazo: 'asc' },
    }),
  ])

  let lista = demandas
    .map((d) => {
      const km = Math.min(...propriedades.map((p) => distanciaKm(p, d.varejista) ?? Infinity))
      const oferta = minhas.find(
        (o) => o.produtoId === d.produtoId && (d.precoMaximo == null || Number(o.preco) <= Number(d.precoMaximo)),
      )
      return { d, km, oferta }
    })
    .filter((x) => x.km <= x.d.raioKm)
  const totalRegiao = lista.length
  const totalCompativeis = lista.filter((x) => x.oferta).length
  if (f.compativeis) lista = lista.filter((x) => x.oferta)
  if (f.urgentes) lista = lista.filter((x) => new Date(x.d.prazo) - Date.now() < 3 * 864e5)

  const pagina = lista.slice(pag.skip, pag.skip + pag.take).map(({ d, km, oferta }) =>
    serializarDemanda(d, {
      distanciaKm: km,
      compativel: Boolean(oferta),
      minhaOferta: oferta && {
        id: oferta.id,
        quantidadeDisponivel: oferta.quantidadeDisponivel,
        unidade: oferta.unidade,
        produto: oferta.produto.nome,
      },
    }),
  )
  res.json({ ...paginado(pagina, lista.length, pag), totalRegiao, totalCompativeis })
})

/* ---------- Prévia do match antes de publicar ---------- */
const previaSchema = z.object({
  produtoId: z.coerce.number().int().positive('Escolha o produto.'),
  raioKm: z.coerce.number().int().min(1).max(500).default(30),
  precoMaximo: z.coerce.number().positive().optional(),
})

r.get('/previa', permitir('VAREJISTA'), validar(previaSchema, 'query'), async (req, res) => {
  const ofertas = await ofertasCompativeis({ ...req.filtros, origem: req.usuario })
  const produtores = [...new Map(ofertas.map((o) => [o.propriedade.produtorId, o.propriedade.produtor])).values()]
  res.json({ produtores: produtores.length, iniciais: produtores.slice(0, 6).map((p) => iniciais(p.organizacao || p.nome)) })
})

r.get('/:id', validar(idParam, 'params'), async (req, res) => {
  const d = await prisma.demanda.findUnique({ where: { id: req.params.id }, include: incluir })
  if (!d || (req.usuario.perfil === 'VAREJISTA' && d.varejistaId !== req.usuario.id)) throw notFound('Demanda não encontrada.')
  res.json(serializarDemanda(d))
})

/* ---------- Criar / editar / encerrar / excluir (dono) ---------- */
const FREQUENCIAS = ['Compra única', 'Semanal', 'Quinzenal', 'Mensal']
const demandaSchema = z.object({
  produtoId: inteiroPositivo('O produto'),
  quantidade: inteiroPositivo('A quantidade'),
  unidade: z.enum(['kg', 'maço', 'caixa', 'unidade', 'dúzia'], { errorMap: () => ({ message: 'Unidade inválida.' }) }),
  precoMaximo: dinheiro('o preço máximo').optional().nullable(),
  prazo: data('O prazo de entrega'),
  frequencia: z.enum(FREQUENCIAS).default('Compra única'),
  raioKm: z.coerce.number().int().min(1, 'Raio mínimo de 1 km.').max(200, 'Raio máximo de 200 km.').default(30),
  observacoes: textoOpcional('As observações', 500),
})

async function minhaDemanda(req) {
  const d = await prisma.demanda.findUnique({ where: { id: req.params.id }, include: incluir })
  if (!d) throw notFound('Demanda não encontrada.')
  if (d.varejistaId !== req.usuario.id) throw forbidden('Esta demanda não é sua.')
  return d
}

function prazoValido(prazo) {
  if (prazo < hoje()) {
    const mensagem = 'O prazo de entrega não pode estar no passado.'
    throw badRequest(mensagem, [{ campo: 'prazo', mensagem }])
  }
}

r.post('/', permitir('VAREJISTA'), validar(demandaSchema), async (req, res) => {
  prazoValido(req.body.prazo)
  const d = await prisma.demanda.create({ data: { ...req.body, varejistaId: req.usuario.id }, include: incluir })
  const produtoresAvisados = await notificarProdutoresDaDemanda(d, req.usuario)
  res.status(201).json(serializarDemanda(d, { produtoresAvisados }))
})

r.put('/:id', permitir('VAREJISTA'), validar(idParam, 'params'), validar(demandaSchema), async (req, res) => {
  await minhaDemanda(req)
  prazoValido(req.body.prazo)
  const d = await prisma.demanda.update({ where: { id: req.params.id }, data: req.body, include: incluir })
  res.json(serializarDemanda(d))
})

const statusSchema = z.object({ status: z.enum(['ABERTA', 'ENCERRADA'], { errorMap: () => ({ message: 'Status deve ser ABERTA ou ENCERRADA.' }) }) })

r.patch('/:id/status', permitir('VAREJISTA'), validar(idParam, 'params'), validar(statusSchema), async (req, res) => {
  const atual = await minhaDemanda(req)
  if (req.body.status === 'ABERTA') prazoValido(atual.prazo)
  const d = await prisma.demanda.update({ where: { id: atual.id }, data: { status: req.body.status }, include: incluir })
  res.json(serializarDemanda(d))
})

r.delete('/:id', permitir('VAREJISTA'), validar(idParam, 'params'), async (req, res) => {
  await minhaDemanda(req)
  await prisma.demanda.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default r
