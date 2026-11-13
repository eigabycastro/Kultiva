import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { serializarPedido } from '../lib/serializers.js'
import { acoesPermitidas, incluirPedido } from '../services/pedidos.js'

// Indicadores e séries para os gráficos do dashboard (produtor e varejista)
const r = Router()
const FECHADOS = ['ACEITO', 'ENTREGUE']

const inicioMes = (d, delta = 0) => new Date(d.getFullYear(), d.getMonth() + delta, 1)
const inicioSemana = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)) // segunda-feira
  return x
}
const variacao = (atual, anterior) => (anterior > 0 ? Math.round(((atual - anterior) / anterior) * 100) : null)
const soma = (lista) => Math.round(lista.reduce((s, p) => s + Number(p.total), 0) * 100) / 100

function porSemana(pedidos, semanas = 8) {
  const hoje = new Date()
  const base = inicioSemana(hoje)
  const series = Array.from({ length: semanas }, (_, i) => {
    const inicio = new Date(base)
    inicio.setDate(base.getDate() - (semanas - 1 - i) * 7)
    return { inicio, total: 0, pedidos: 0 }
  })
  for (const p of pedidos) {
    const d = p.aceitoEm ?? p.criadoEm
    const s = [...series].reverse().find((x) => d >= x.inicio)
    if (s) {
      s.total += Number(p.total)
      s.pedidos += 1
    }
  }
  return series.map((s) => ({ semana: s.inicio, total: Math.round(s.total * 100) / 100, pedidos: s.pedidos }))
}

function porProduto(pedidos) {
  const m = new Map()
  for (const p of pedidos) {
    for (const i of p.itens) {
      const nome = i.oferta.produto.nome
      const x = m.get(nome) ?? { produto: nome, kind: i.oferta.produto.foto, total: 0, quantidade: 0, unidade: i.oferta.unidade }
      x.total += i.quantidade * Number(i.precoUnitario)
      x.quantidade += i.quantidade
      m.set(nome, x)
    }
  }
  return [...m.values()]
    .map((x) => ({ ...x, total: Math.round(x.total * 100) / 100, precoMedio: Math.round((x.total / x.quantidade) * 100) / 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

r.get('/', async (req, res) => {
  const u = req.usuario
  const agora = new Date()
  const campo = u.perfil === 'PRODUTOR' ? 'produtorId' : 'varejistaId'
  const meu = { [campo]: u.id }
  const desde = new Date(inicioSemana(agora).getTime() - 7 * 7 * 864e5)

  const [fechados, recentes, contagem, parceiros] = await Promise.all([
    prisma.pedido.findMany({
      where: { ...meu, status: { in: FECHADOS }, OR: [{ aceitoEm: { gte: inicioMes(agora, -1) } }, { aceitoEm: { gte: desde } }] },
      include: incluirPedido,
    }),
    prisma.pedido.findMany({ where: meu, include: incluirPedido, orderBy: { criadoEm: 'desc' }, take: 5 }),
    prisma.pedido.groupBy({ by: ['status'], where: meu, _count: true }),
    prisma.pedido.findMany({
      where: { ...meu, status: { in: FECHADOS } },
      distinct: [u.perfil === 'PRODUTOR' ? 'varejistaId' : 'produtorId'],
      select: { id: true },
    }),
  ])
  const n = (s) => contagem.find((c) => c.status === s)?._count ?? 0
  const doMes = fechados.filter((p) => p.aceitoEm >= inicioMes(agora))
  const mesAnterior = fechados.filter((p) => p.aceitoEm >= inicioMes(agora, -1) && p.aceitoEm < inicioMes(agora))

  const base = {
    totalMes: soma(doMes),
    totalMesAnterior: soma(mesAnterior),
    variacaoMes: variacao(soma(doMes), soma(mesAnterior)),
    pedidosPendentes: n('PENDENTE'),
    pedidosAtivos: n('PENDENTE') + n('ACEITO'),
    pedidosEntregues: n('ENTREGUE'),
    parceiros: parceiros.length,
    porSemana: porSemana(fechados.filter((p) => p.aceitoEm >= desde)),
    porProduto: porProduto(fechados),
    pedidosRecentes: recentes.map((p) => serializarPedido(p, acoesPermitidas(p.status, u.perfil))),
  }

  if (u.perfil === 'PRODUTOR') {
    const ofertas = await prisma.oferta.findMany({
      where: { propriedade: { produtorId: u.id } },
      select: { status: true, quantidadeDisponivel: true, quantidadeTotal: true, produto: { select: { nome: true } } },
    })
    const ativas = ofertas.filter((o) => o.status === 'ATIVA')
    const acabando = ativas.filter((o) => o.quantidadeTotal > 0 && o.quantidadeDisponivel / o.quantidadeTotal <= 0.15)
    return res.json({ ...base, ofertasAtivas: ativas.length, ofertasAcabando: acabando.map((o) => o.produto.nome) })
  }

  const demandasAbertas = await prisma.demanda.count({ where: { varejistaId: u.id, status: 'ABERTA' } })
  res.json({ ...base, demandasAbertas })
})

export default r
