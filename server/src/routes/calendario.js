import { Router } from 'express'
import { z } from 'zod'
import { codigoPedido, qtd } from '../lib/format.js'
import { prisma } from '../lib/prisma.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'

// Calendário de safra do produtor, montado a partir das ofertas (colheita e fim da oferta) e dos pedidos (entregas)
const r = Router()
r.use(permitir('PRODUTOR'))

const mesSchema = z.object({
  mes: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Mês no formato aaaa-mm, ex.: 2026-11.')
    .optional(),
})

const fimDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)

async function eventos(produtorId, inicio, fim) {
  const [colheitas, fins, entregas] = await Promise.all([
    prisma.oferta.findMany({
      where: { propriedade: { produtorId }, dataColheita: { gte: inicio, lte: fim } },
      include: { produto: true, propriedade: true },
    }),
    prisma.oferta.findMany({
      where: { propriedade: { produtorId }, disponivelAte: { gte: inicio, lte: fim }, status: { in: ['ATIVA', 'PAUSADA'] } },
      include: { produto: true },
    }),
    prisma.pedido.findMany({
      where: { produtorId, status: { in: ['ACEITO', 'ENTREGUE'] }, dataEntrega: { gte: inicio, lte: fim } },
      include: { varejista: true, itens: { include: { oferta: { include: { produto: true } } } } },
    }),
  ])
  return [
    ...colheitas.map((o) => ({
      data: o.dataColheita,
      tipo: 'colheita',
      titulo: `Colheita · ${o.produto.nome}`,
      texto: `${qtd(o.quantidadeTotal, o.unidade)} · ${o.propriedade.nome}`,
      link: `/produtor/produtos/${o.id}`,
    })),
    ...fins.map((o) => ({
      data: o.disponivelAte,
      tipo: 'janela',
      titulo: `Fim da oferta · ${o.produto.nome}`,
      texto: `${qtd(o.quantidadeDisponivel, o.unidade)} ainda disponíveis`,
      link: `/produtor/produtos/${o.id}`,
    })),
    ...entregas.map((p) => ({
      data: p.dataEntrega,
      tipo: 'entrega',
      titulo: `Entrega ${codigoPedido(p.id)}`,
      texto: `${p.varejista.organizacao} · ${p.itens.map((i) => `${qtd(i.quantidade, i.oferta.unidade)} de ${i.oferta.produto.nome.toLowerCase()}`).join(', ')}`,
      link: `/produtor/pedidos?q=${encodeURIComponent(codigoPedido(p.id))}`,
      concluido: p.status === 'ENTREGUE',
    })),
  ].sort((a, b) => a.data - b.data)
}

r.get('/', validar(mesSchema, 'query'), async (req, res) => {
  const hoje = new Date()
  const [ano, mes] = req.filtros.mes ? req.filtros.mes.split('-').map(Number) : [hoje.getFullYear(), hoje.getMonth() + 1]
  const inicio = new Date(ano, mes - 1, 1)
  const fim = fimDoDia(new Date(ano, mes, 0))

  const doMes = await eventos(req.usuario.id, inicio, fim)
  const proximos = (await eventos(req.usuario.id, new Date(hoje.toDateString()), fimDoDia(new Date(hoje.getTime() + 45 * 864e5))))
    .filter((e) => !e.concluido)
    .slice(0, 6)

  // pedidos recebidos por semana nas últimas 6 semanas (painel "demanda")
  const desde = new Date(hoje.getTime() - 42 * 864e5)
  const pedidos = await prisma.pedido.findMany({ where: { produtorId: req.usuario.id, criadoEm: { gte: desde } }, select: { criadoEm: true } })
  const porSemana = Array.from({ length: 6 }, (_, i) => {
    const ini = new Date(desde.getTime() + i * 7 * 864e5)
    const fimSemana = new Date(ini.getTime() + 7 * 864e5)
    return { semana: ini, pedidos: pedidos.filter((p) => p.criadoEm >= ini && p.criadoEm < fimSemana).length }
  })

  res.json({ mes: `${ano}-${String(mes).padStart(2, '0')}`, eventos: doMes, proximos, pedidosPorSemana: porSemana })
})

export default r
