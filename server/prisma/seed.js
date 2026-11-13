/* Dados de demonstração (Sul de Minas). Todas as contas usam a senha: kultiva123
   Rode com: npm run db:seed  (apaga e recria tudo) */
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SENHA = 'kultiva123'

const dia = (n, hora = 9) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hora, 0, 0, 0)
  return d
}

const PRODUTOS = [
  ['Alface crespa', 'alface', 'Hortaliças', 'maço'],
  ['Alface americana', 'alface', 'Hortaliças', 'maço'],
  ['Couve manteiga', 'couve', 'Hortaliças', 'maço'],
  ['Tomate italiano', 'tomate', 'Legumes', 'kg'],
  ['Tomate cereja', 'tomate', 'Legumes', 'caixa'],
  ['Cenoura', 'cenoura', 'Legumes', 'kg'],
  ['Morango', 'morango', 'Frutas', 'caixa'],
  ['Banana prata', 'banana', 'Frutas', 'kg'],
]

// [email, nome, organização, cidade, lat, lng, extras]
const PRODUTORES = [
  ['joao@sitioboavista.com.br', 'João Silva', 'Sítio Boa Vista', 'Pouso Alegre', -22.2905, -45.9602, { telefone: '(35) 99812-4410', documento: 'CPF 123.456.789-00', cep: '37550-000', endereco: 'Estrada do Cervo, km 4' }],
  ['marta@fazendasantaluzia.com.br', 'Marta Reis', 'Fazenda Santa Luzia', 'Santa Rita do Sapucaí', -22.2522, -45.7036, { cep: '37540-000' }],
  ['paulo@chacararecanto.com.br', 'Paulo Lima', 'Chácara Recanto', 'Borda da Mata', -22.2736, -46.1653, { cep: '37564-000' }],
  ['contato@hortadaserra.com.br', 'Rosa Andrade', 'Horta da Serra', 'Cachoeira de Minas', -22.3511, -45.7808, { cep: '37545-000' }],
  ['irmaos@sitiodoisirmaos.com.br', 'Carlos Pereira', 'Sítio Dois Irmãos', 'Estiva', -22.4578, -46.0181, { cep: '37542-000' }],
  ['vendas@fazendaagualimpa.com.br', 'Helena Costa', 'Fazenda Água Limpa', 'Silvianópolis', -22.0272, -45.8353, { cep: '37560-000' }],
]

// [email, nome, organização, tipo, cidade, lat, lng, extras]
const VAREJISTAS = [
  ['compras@mercadomais.com.br', 'Sônia Martins', 'Mercado Mais', 'Supermercado', 'Pouso Alegre', -22.2266, -45.9389, { telefone: '(35) 3421-8890', documento: 'CNPJ 12.345.678/0001-90', endereco: 'Av. Dr. Lisboa, 1200', cep: '37550-000' }],
  ['cozinha@sabordaterra.com.br', 'Ricardo Alves', 'Restaurante Sabor da Terra', 'Restaurante', 'Pouso Alegre', -22.2351, -45.9302, { cep: '37550-000' }],
  ['central@mercadinhocentral.com.br', 'Luís Prado', 'Mercadinho Central', 'Mercado', 'Santa Rita do Sapucaí', -22.2478, -45.7101, { cep: '37540-000' }],
  ['compras@hortifrutibompreco.com.br', 'Beatriz Nunes', 'Hortifruti Bom Preço', 'Hortifruti', 'Pouso Alegre', -22.2412, -45.9533, { cep: '37550-000' }],
  ['merenda@escolaaurora.edu.br', 'Cláudia Ramos', 'Escola Municipal Aurora', 'Compra institucional', 'Pouso Alegre', -22.2189, -45.9211, { cep: '37550-000' }],
  ['logistica@valeverde.com.br', 'Fábio Teixeira', 'Distribuidora Vale Verde', 'Distribuidor', 'Itajubá', -22.4256, -45.4528, { cep: '37500-000', raioKm: 60 }],
]

async function main() {
  console.log('Limpando o banco…')
  // apaga os dados de demonstração e reinicia os IDs (os pedidos voltam a começar em #KT-1001)
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Notificacao", "Favorito", "ItemPedido", "Pedido", "Demanda", "Oferta", "Propriedade", "Produto", "Usuario" RESTART IDENTITY CASCADE',
  )

  const senhaHash = await bcrypt.hash(SENHA, 10)
  const produto = {}
  for (const [nome, foto, categoria, unidadePadrao] of PRODUTOS) {
    produto[nome] = await prisma.produto.create({ data: { nome, foto, categoria, unidadePadrao } })
  }

  await prisma.usuario.create({
    data: { nome: 'Equipe Kultiva', email: 'admin@kultiva.com.br', senhaHash, perfil: 'ADMIN', organizacao: 'Kultiva', cidade: 'Pouso Alegre', uf: 'MG' },
  })

  const prod = {}
  const prop = {}
  for (const [email, nome, organizacao, cidade, latitude, longitude, extras] of PRODUTORES) {
    const { endereco, cep, ...resto } = extras
    prod[organizacao] = await prisma.usuario.create({
      data: { email, nome, organizacao, cidade, uf: 'MG', latitude, longitude, senhaHash, perfil: 'PRODUTOR', cep, endereco, ...resto },
    })
    prop[organizacao] = await prisma.propriedade.create({
      data: { nome: organizacao, cidade, uf: 'MG', cep, endereco, latitude, longitude, areaHa: 12, produtorId: prod[organizacao].id },
    })
  }
  // segunda propriedade do João (1 produtor : N propriedades)
  prop['Chácara do Cervo'] = await prisma.propriedade.create({
    data: { nome: 'Chácara do Cervo', cidade: 'Congonhal', uf: 'MG', cep: '37575-000', latitude: -22.1486, longitude: -46.0428, areaHa: 4.5, raioEntregaKm: 20, produtorId: prod['Sítio Boa Vista'].id },
  })

  const vare = {}
  for (const [email, nome, organizacao, tipoEstabelecimento, cidade, latitude, longitude, extras] of VAREJISTAS) {
    vare[organizacao] = await prisma.usuario.create({
      data: { email, nome, organizacao, tipoEstabelecimento, cidade, uf: 'MG', latitude, longitude, senhaHash, perfil: 'VAREJISTA', ...extras },
    })
  }
  // conta bloqueada, para demonstrar a moderação do admin
  await prisma.usuario.create({
    data: { email: 'spam@exemplo.com', nome: 'Conta Suspeita', organizacao: 'Atacadão Fantasma', tipoEstabelecimento: 'Distribuidor', perfil: 'VAREJISTA', senhaHash, bloqueado: true, cidade: 'Pouso Alegre', uf: 'MG', latitude: -22.23, longitude: -45.94 },
  })

  // [propriedade, produto, variedade, preço, unidade, disponível, total, colheita(dias), extras]
  const OFERTAS = [
    ['Sítio Boa Vista', 'Alface crespa', 'Crespa verde', 3.2, 'maço', 240, 300, 0, { organico: true, entregaInclusa: true, pedidoMinimo: 20, disponivelAte: dia(4) }],
    ['Sítio Boa Vista', 'Tomate italiano', 'Santa Cruz', 5.4, 'kg', 820, 1000, -2, { pedidoMinimo: 10 }],
    ['Sítio Boa Vista', 'Couve manteiga', 'Manteiga', 2.5, 'maço', 18, 180, -1, {}],
    ['Sítio Boa Vista', 'Morango', 'San Andreas', 12, 'caixa', 6, 65, 0, {}],
    ['Chácara do Cervo', 'Cenoura', 'Brasília', 3.8, 'kg', 0, 400, -6, { status: 'ESGOTADA' }],
    ['Chácara do Cervo', 'Banana prata', 'Prata-anã', 4.2, 'kg', 300, 300, 5, { status: 'RASCUNHO' }],
    ['Chácara do Cervo', 'Alface americana', null, 3.4, 'maço', 120, 150, 2, { status: 'PAUSADA' }],
    ['Fazenda Santa Luzia', 'Tomate italiano', 'Débora', 5.2, 'kg', 900, 1200, -1, { pedidoMinimo: 50 }],
    ['Fazenda Santa Luzia', 'Tomate cereja', 'Sweet Grape', 9.5, 'caixa', 80, 100, 0, { organico: true }],
    ['Fazenda Santa Luzia', 'Alface americana', null, 3.3, 'maço', 200, 220, 1, {}],
    ['Chácara Recanto', 'Morango', 'Albion', 12, 'caixa', 65, 80, 0, { entregaInclusa: true }],
    ['Chácara Recanto', 'Banana prata', null, 4.0, 'kg', 400, 500, -3, {}],
    ['Horta da Serra', 'Couve manteiga', 'Manteiga da Geórgia', 2.4, 'maço', 180, 200, 0, { organico: true }],
    ['Horta da Serra', 'Alface crespa', 'Vanda', 3.0, 'maço', 150, 200, 0, {}],
    ['Horta da Serra', 'Cenoura', null, 3.6, 'kg', 300, 300, 3, {}],
    ['Sítio Dois Irmãos', 'Cenoura', 'Brasília', 3.8, 'kg', 920, 1000, -2, { pedidoMinimo: 100 }],
    ['Sítio Dois Irmãos', 'Tomate italiano', null, 5.6, 'kg', 300, 300, 6, {}],
    ['Fazenda Água Limpa', 'Banana prata', 'Prata-anã', 4.2, 'kg', 1200, 1500, -1, { entregaInclusa: true }],
    ['Fazenda Água Limpa', 'Morango', null, 13, 'caixa', 40, 40, 2, { organico: true }],
  ]
  const ofertas = []
  for (const [p, nome, variedade, preco, unidade, disp, total, colheita, extras] of OFERTAS) {
    ofertas.push(
      await prisma.oferta.create({
        data: {
          propriedadeId: prop[p].id,
          produtoId: produto[nome].id,
          variedade,
          preco,
          unidade,
          quantidadeDisponivel: disp,
          quantidadeTotal: total,
          dataColheita: dia(colheita, 6),
          visualizacoes: Math.round(total / 4) + 20,
          ...extras,
        },
      }),
    )
  }
  const oferta = (p, nome) => ofertas.find((o) => o.propriedadeId === prop[p].id && o.produtoId === produto[nome].id)

  // Histórico de pedidos (o estoque acima já considera os aceitos)
  // [varejista, propriedade, produto, quantidade, preço, status, criado(dias)]
  const PEDIDOS = [
    ['Hortifruti Bom Preço', 'Sítio Boa Vista', 'Couve manteiga', 80, 2.5, 'ENTREGUE', -52],
    ['Mercado Mais', 'Sítio Boa Vista', 'Alface crespa', 100, 3.1, 'ENTREGUE', -45],
    ['Restaurante Sabor da Terra', 'Sítio Boa Vista', 'Tomate italiano', 120, 5.0, 'ENTREGUE', -38],
    ['Mercado Mais', 'Sítio Boa Vista', 'Tomate italiano', 200, 5.1, 'ENTREGUE', -31],
    ['Mercadinho Central', 'Sítio Boa Vista', 'Morango', 30, 11.5, 'ENTREGUE', -26],
    ['Escola Municipal Aurora', 'Sítio Boa Vista', 'Alface crespa', 150, 3.0, 'CANCELADO', -22],
    ['Hortifruti Bom Preço', 'Sítio Boa Vista', 'Couve manteiga', 80, 2.5, 'ENTREGUE', -19],
    ['Restaurante Sabor da Terra', 'Sítio Boa Vista', 'Alface crespa', 60, 3.2, 'ENTREGUE', -12],
    ['Mercado Mais', 'Sítio Boa Vista', 'Tomate italiano', 180, 5.3, 'ENTREGUE', -8],
    ['Mercadinho Central', 'Sítio Boa Vista', 'Morango', 25, 12, 'ACEITO', -3],
    ['Hortifruti Bom Preço', 'Sítio Boa Vista', 'Couve manteiga', 82, 2.5, 'ACEITO', -2],
    ['Escola Municipal Aurora', 'Sítio Boa Vista', 'Tomate italiano', 400, 5.0, 'RECUSADO', -2],
    ['Mercado Mais', 'Sítio Boa Vista', 'Alface crespa', 120, 3.2, 'PENDENTE', 0],
    ['Restaurante Sabor da Terra', 'Sítio Boa Vista', 'Tomate italiano', 80, 5.4, 'PENDENTE', 0],
    ['Mercado Mais', 'Fazenda Santa Luzia', 'Tomate italiano', 500, 5.2, 'ENTREGUE', -9],
    ['Mercado Mais', 'Chácara Recanto', 'Morango', 40, 12, 'ENTREGUE', -11],
    ['Mercado Mais', 'Horta da Serra', 'Couve manteiga', 80, 2.5, 'ENTREGUE', -14],
    ['Mercado Mais', 'Sítio Dois Irmãos', 'Cenoura', 300, 3.8, 'CANCELADO', -18],
    ['Mercado Mais', 'Fazenda Água Limpa', 'Banana prata', 250, 4.2, 'ACEITO', -1],
  ]
  for (const [v, p, nome, quantidade, preco, status, criado] of PEDIDOS) {
    const o = oferta(p, nome)
    const criadoEm = dia(criado, 8)
    const aceito = ['ACEITO', 'ENTREGUE'].includes(status) ? dia(criado, 11) : null
    await prisma.pedido.create({
      data: {
        varejistaId: vare[v].id,
        produtorId: prod[p === 'Chácara do Cervo' ? 'Sítio Boa Vista' : p].id,
        status,
        total: Math.round(quantidade * preco * 100) / 100,
        criadoEm,
        aceitoEm: aceito,
        entregueEm: status === 'ENTREGUE' ? dia(criado + 2, 8) : null,
        dataEntrega: dia(criado + 2, 8),
        motivo: status === 'RECUSADO' ? 'Não consigo colher 400 kg até a data pedida.' : status === 'CANCELADO' ? 'Mudança no cardápio da semana.' : null,
        itens: { create: { ofertaId: o.id, quantidade, precoUnitario: preco } },
      },
    })
  }

  // Procura-se
  // [varejista, produto, quantidade, unidade, preço máx., prazo(dias), frequência, raio]
  const DEMANDAS = [
    ['Mercado Mais', 'Tomate italiano', 300, 'kg', 5.8, 4, 'Compra única', 30],
    ['Restaurante Sabor da Terra', 'Alface americana', 150, 'maço', 3.5, 2, 'Compra única', 30],
    ['Mercadinho Central', 'Morango', 30, 'caixa', 13, 6, 'Compra única', 50],
    ['Hortifruti Bom Preço', 'Couve manteiga', 80, 'maço', 2.8, 10, 'Semanal', 30],
    ['Escola Municipal Aurora', 'Banana prata', 200, 'kg', 4.0, 8, 'Quinzenal', 50],
    ['Distribuidora Vale Verde', 'Cenoura', 1000, 'kg', 3.4, 3, 'Compra única', 80],
    ['Mercado Mais', 'Alface crespa', 200, 'maço', 3.3, 12, 'Semanal', 30],
    ['Mercado Mais', 'Banana prata', 150, 'kg', 4.5, -5, 'Compra única', 30],
  ]
  for (const [v, nome, quantidade, unidade, precoMaximo, prazo, frequencia, raioKm] of DEMANDAS) {
    await prisma.demanda.create({
      data: {
        varejistaId: vare[v].id,
        produtoId: produto[nome].id,
        quantidade,
        unidade,
        precoMaximo,
        prazo: dia(prazo, 12),
        frequencia,
        raioKm,
        status: prazo < 0 ? 'ENCERRADA' : 'ABERTA',
      },
    })
  }

  // Favoritos do Mercado Mais
  for (const [p, nome] of [['Sítio Boa Vista', 'Alface crespa'], ['Fazenda Santa Luzia', 'Tomate italiano'], ['Chácara Recanto', 'Morango']]) {
    await prisma.favorito.create({ data: { varejistaId: vare['Mercado Mais'].id, ofertaId: oferta(p, nome).id } })
  }

  // Notificações iniciais
  const joao = prod['Sítio Boa Vista'].id
  const mm = vare['Mercado Mais'].id
  await prisma.notificacao.createMany({
    data: [
      { usuarioId: joao, tipo: 'DEMANDA', titulo: 'Mercado Mais procura 300 kg de Tomate italiano', texto: 'Você tem 820 kg em Sítio Boa Vista · paga até R$ 5,80/kg', link: '/produtor/procura-se', criadoEm: dia(0, 7) },
      { usuarioId: joao, tipo: 'PEDIDO', titulo: `Novo pedido de Mercado Mais`, texto: '120 maço de alface crespa · R$ 384,00', link: '/produtor/pedidos', criadoEm: dia(0, 8) },
      { usuarioId: joao, tipo: 'PRECO', titulo: 'Preço do tomate subiu 8% na sua região', texto: 'Média de R$ 5,60/kg nos últimos 7 dias.', link: '/produtor/previsao', criadoEm: dia(-1, 10) },
      { usuarioId: joao, tipo: 'SISTEMA', titulo: 'Couve e morango estão acabando', texto: 'Atualize o estoque ou pause as ofertas para não receber pedidos que não pode atender.', link: '/produtor/produtos', lida: true, criadoEm: dia(-1, 7) },
      { usuarioId: mm, tipo: 'PEDIDO', titulo: 'Pedido aceito por Fazenda Água Limpa', texto: '250 kg de banana prata · R$ 1.050,00', link: '/varejista/pedidos', criadoEm: dia(-1, 11) },
      { usuarioId: mm, tipo: 'DEMANDA', titulo: 'Nova oferta para sua demanda de Tomate italiano', texto: 'Fazenda Santa Luzia publicou 900 kg a R$ 5,20/kg', link: `/varejista/produto/${oferta('Fazenda Santa Luzia', 'Tomate italiano').id}`, criadoEm: dia(-1, 9) },
    ],
  })

  console.log(`Pronto! ${ofertas.length} ofertas, ${PEDIDOS.length} pedidos, ${DEMANDAS.length} demandas. Senha de todas as contas: ${SENHA}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
