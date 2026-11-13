import { Router } from 'express'
import { z } from 'zod'
import { notFound } from '../lib/errors.js'
import { formatBRL, formatDia, qtd } from '../lib/format.js'
import { distanciaKm } from '../lib/geo.js'
import { prisma } from '../lib/prisma.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'

/* Previsão de preço a partir dos dados reais da plataforma.
   Método desta versão: média semanal dos preços praticados em pedidos aceitos (6 semanas)
   + tendência linear (mínimos quadrados) projetada para as próximas 3 semanas.
   O modelo de IA entra na Release 4 usando esta mesma série. */
const r = Router()
r.use(permitir('PRODUTOR'))

const SEMANAS = 6
const PROJECAO = 3
const DIA = 864e5
const arred = (n) => Math.round(n * 100) / 100

function inicioDaSemana(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

// y = a + b·x pelos mínimos quadrados
function tendencia(pontos) {
  const n = pontos.length
  if (n < 2) return { a: pontos[0]?.y ?? 0, b: 0 }
  const mx = pontos.reduce((s, p) => s + p.x, 0) / n
  const my = pontos.reduce((s, p) => s + p.y, 0) / n
  const num = pontos.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const den = pontos.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  const b = den ? num / den : 0
  return { a: my - b * mx, b }
}

const querySchema = z.object({ produtoId: z.coerce.number().int().positive().optional() })

r.get('/', validar(querySchema, 'query'), async (req, res) => {
  const eu = req.usuario
  const minhas = await prisma.oferta.findMany({
    where: { propriedade: { produtorId: eu.id } },
    include: { produto: true, propriedade: true },
    orderBy: { atualizadoEm: 'desc' },
  })
  const unicos = [...new Map(minhas.map((o) => [o.produtoId, { id: o.produto.id, nome: o.produto.nome, kind: o.produto.foto }])).values()]
  if (!unicos.length) return res.json({ produtos: unicos, previsao: null })
  // produtos com mais vendas recentes na plataforma primeiro (são os que têm série para prever)
  const vendas = await prisma.itemPedido.groupBy({
    by: ['ofertaId'],
    where: { oferta: { produtoId: { in: unicos.map((p) => p.id) } }, pedido: { status: { in: ['ACEITO', 'ENTREGUE'] }, aceitoEm: { gte: new Date(Date.now() - 42 * DIA) } } },
    _count: true,
  })
  const ofertasVendidas = await prisma.oferta.findMany({ where: { id: { in: vendas.map((v) => v.ofertaId) } }, select: { id: true, produtoId: true } })
  const porProduto = (id) => vendas.filter((v) => ofertasVendidas.find((o) => o.id === v.ofertaId)?.produtoId === id).reduce((n, v) => n + v._count, 0)
  const produtos = unicos.map((p) => ({ ...p, vendas: porProduto(p.id) })).sort((x, y) => y.vendas - x.vendas || x.nome.localeCompare(y.nome))

  const produtoId = req.filtros.produtoId ?? produtos[0].id
  const produto = await prisma.produto.findUnique({ where: { id: produtoId } })
  if (!produto) throw notFound('Produto não encontrado.')
  const minhasDoProduto = minhas.filter((o) => o.produtoId === produtoId)
  const unidade = minhasDoProduto[0]?.unidade ?? produto.unidadePadrao

  const hoje = new Date()
  const semanaAtual = inicioDaSemana(hoje)
  const desde = new Date(semanaAtual.getTime() - (SEMANAS - 1) * 7 * DIA)

  const [itens, ativas, demandas] = await Promise.all([
    prisma.itemPedido.findMany({
      where: { oferta: { produtoId, unidade }, pedido: { status: { in: ['ACEITO', 'ENTREGUE'] }, aceitoEm: { gte: desde } } },
      select: { quantidade: true, precoUnitario: true, pedido: { select: { aceitoEm: true } } },
    }),
    prisma.oferta.findMany({ where: { produtoId, unidade, status: 'ATIVA' }, select: { preco: true, propriedade: { select: { produtorId: true } } } }),
    prisma.demanda.findMany({
      where: { produtoId, status: 'ABERTA', prazo: { gte: new Date(hoje.toDateString()) } },
      include: { varejista: true },
      orderBy: { prazo: 'asc' },
    }),
  ])

  // média semanal ponderada pela quantidade vendida
  const semanas = Array.from({ length: SEMANAS }, (_, i) => ({ inicio: new Date(desde.getTime() + i * 7 * DIA), soma: 0, qtd: 0 }))
  for (const it of itens) {
    const s = [...semanas].reverse().find((x) => it.pedido.aceitoEm >= x.inicio)
    if (s) {
      s.soma += Number(it.precoUnitario) * it.quantidade
      s.qtd += it.quantidade
    }
  }
  const mediaAtivas = ativas.length ? ativas.reduce((s, o) => s + Number(o.preco), 0) / ativas.length : null
  const pontos = semanas.map((s, x) => (s.qtd ? { x, y: s.soma / s.qtd } : null)).filter(Boolean)
  // sem venda na semana atual, as ofertas ativas indicam o preço de hoje
  if (!semanas[SEMANAS - 1].qtd && mediaAtivas != null) pontos.push({ x: SEMANAS - 1, y: mediaAtivas })
  if (!pontos.length) return res.json({ produtos, previsao: { produto: produto.nome, unidade, semDados: true } })

  // semanas sem venda repetem o último preço conhecido, para o gráfico não ficar com buracos
  let ultimo = pontos[0].y
  const historico = semanas.map((s, x) => {
    const p = pontos.find((pt) => pt.x === x)
    if (p) ultimo = p.y
    return { semana: s.inicio, preco: arred(ultimo), estimado: !p }
  })

  const { a, b } = tendencia(pontos)
  const precoHoje = arred(mediaAtivas ?? historico[SEMANAS - 1].preco)
  const limite = (v) => Math.min(precoHoje * 1.25, Math.max(precoHoje * 0.75, v)) // evita projeções absurdas com poucos dados
  const projecao = Array.from({ length: PROJECAO }, (_, i) => ({
    semana: new Date(semanaAtual.getTime() + (i + 1) * 7 * DIA),
    preco: arred(limite(a + b * (SEMANAS + i))),
    previsto: true,
  }))
  const melhor = projecao.reduce((m, p) => (p.preco > m.preco ? p : m), projecao[0])
  const variacao = Math.round(((melhor.preco - precoHoje) / precoHoje) * 100)
  const janela = `${formatDia(melhor.semana)} a ${formatDia(new Date(melhor.semana.getTime() + 6 * DIA))}`
  const estoque = minhasDoProduto.filter((o) => o.status !== 'ESGOTADA').reduce((s, o) => s + o.quantidadeDisponivel, 0)

  // dicas a partir dos dados
  const dicas = []
  if (variacao >= 3) dicas.push(`Os preços estão subindo: segure parte do estoque para a semana de ${janela}, com projeção de ${formatBRL(melhor.preco)}/${unidade} (+${variacao}%).`)
  else if (b < -precoHoje * 0.01) dicas.push(`Tendência de queda de ${formatBRL(Math.abs(b))}/${unidade} por semana: venda o estoque atual antes de ${formatDia(projecao[0].semana)}.`)
  else dicas.push(`Preço estável perto de ${formatBRL(precoHoje)}/${unidade}: mantenha o ritmo de vendas.`)

  const meuPreco = minhasDoProduto.find((o) => o.status === 'ATIVA')?.preco
  if (meuPreco && mediaAtivas) {
    const dif = Math.round(((Number(meuPreco) - mediaAtivas) / mediaAtivas) * 100)
    if (Math.abs(dif) >= 3) dicas.push(`Seu preço (${formatBRL(meuPreco)}) está ${Math.abs(dif)}% ${dif > 0 ? 'acima' : 'abaixo'} da média das ofertas ativas (${formatBRL(mediaAtivas)}).`)
  }
  const props = minhas.map((o) => o.propriedade)
  for (const d of demandas) {
    const km = Math.min(...props.map((p) => distanciaKm(p, d.varejista) ?? Infinity))
    if (km > d.raioKm) continue
    dicas.push(`${d.varejista.organizacao} procura ${qtd(d.quantidade, d.unidade)} até ${formatDia(d.prazo)}${d.precoMaximo ? ` e paga até ${formatBRL(d.precoMaximo)}/${d.unidade}` : ''} (${Math.round(km)} km).`)
    if (dicas.length >= 4) break
  }

  res.json({
    produtos,
    previsao: {
      produtoId,
      produto: produto.nome,
      kind: produto.foto,
      unidade,
      precoHoje,
      melhorPreco: melhor.preco,
      variacao,
      janela,
      estoque,
      vendasNoPeriodo: itens.length,
      historico,
      projecao,
      dicas,
      metodo: `Tendência linear sobre ${itens.length} ${itens.length === 1 ? 'venda' : 'vendas'} de ${produto.nome.toLowerCase()} nas últimas ${SEMANAS} semanas`,
    },
  })
})

export default r
