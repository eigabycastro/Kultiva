import { Router } from 'express'
import { z } from 'zod'
import { notFound } from '../lib/errors.js'
import { paginacao, paginado } from '../lib/pagination.js'
import { prisma } from '../lib/prisma.js'
import { booleano, idParam } from '../lib/schemas.js'
import { validar } from '../middleware/validate.js'

const r = Router()
const TIPOS = ['DEMANDA', 'PEDIDO', 'MENSAGEM', 'PRECO', 'SISTEMA']

const listaSchema = z.object({
  tipo: z.enum(TIPOS).optional(),
  naoLidas: booleano,
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
})

r.get('/', validar(listaSchema, 'query'), async (req, res) => {
  const base = { usuarioId: req.usuario.id }
  const where = { ...base, ...(req.filtros.tipo && { tipo: req.filtros.tipo }), ...(req.filtros.naoLidas && { lida: false }) }
  const pag = paginacao(req.query, { padrao: 20 })
  const [total, lista, porTipo, naoLidas] = await Promise.all([
    prisma.notificacao.count({ where }),
    prisma.notificacao.findMany({ where, orderBy: { criadoEm: 'desc' }, skip: pag.skip, take: pag.take }),
    prisma.notificacao.groupBy({ by: ['tipo'], where: base, _count: true }),
    prisma.notificacao.count({ where: { ...base, lida: false } }),
  ])
  const contagem = Object.fromEntries(TIPOS.map((t) => [t, porTipo.find((x) => x.tipo === t)?._count ?? 0]))
  res.json({ ...paginado(lista, total, pag), contagem: { ...contagem, TODAS: porTipo.reduce((s, x) => s + x._count, 0) }, naoLidas })
})

r.get('/nao-lidas', async (req, res) => {
  res.json({ total: await prisma.notificacao.count({ where: { usuarioId: req.usuario.id, lida: false } }) })
})

r.patch('/lidas', async (req, res) => {
  const { count } = await prisma.notificacao.updateMany({ where: { usuarioId: req.usuario.id, lida: false }, data: { lida: true } })
  res.json({ atualizadas: count })
})

r.patch('/:id/lida', validar(idParam, 'params'), async (req, res) => {
  const { count } = await prisma.notificacao.updateMany({ where: { id: req.params.id, usuarioId: req.usuario.id }, data: { lida: true } })
  if (!count) throw notFound('Notificação não encontrada.')
  res.status(204).end()
})

r.delete('/:id', validar(idParam, 'params'), async (req, res) => {
  const { count } = await prisma.notificacao.deleteMany({ where: { id: req.params.id, usuarioId: req.usuario.id } })
  if (!count) throw notFound('Notificação não encontrada.')
  res.status(204).end()
})

export default r
