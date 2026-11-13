import { Router } from 'express'
import { z } from 'zod'
import { forbidden, notFound } from '../lib/errors.js'
import { paginacao, paginado } from '../lib/pagination.js'
import { prisma } from '../lib/prisma.js'
import { serializarPedido } from '../lib/serializers.js'
import { data, idParam, inteiroPositivo, textoOpcional } from '../lib/schemas.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'
import { acoesPermitidas, criarPedido, incluirPedido, mudarStatus } from '../services/pedidos.js'

const r = Router()
const GRUPOS = {
  andamento: ['PENDENTE', 'ACEITO'],
  concluidos: ['ENTREGUE'],
  cancelados: ['RECUSADO', 'CANCELADO'],
}
const STATUS = ['PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO', 'ENTREGUE']

const doUsuario = (u) =>
  u.perfil === 'PRODUTOR' ? { produtorId: u.id } : u.perfil === 'VAREJISTA' ? { varejistaId: u.id } : {}

const serializar = (p, u) => serializarPedido(p, acoesPermitidas(p.status, u.perfil))

/* ---------- Histórico com filtro, busca e paginação ---------- */
const listaSchema = z.object({
  grupo: z.enum(['andamento', 'concluidos', 'cancelados']).optional(),
  status: z.enum(STATUS).optional(),
  q: z.string().trim().max(80).optional(),
  de: data('Data inicial').optional(),
  ate: data('Data final').optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
})

r.get('/', validar(listaSchema, 'query'), async (req, res) => {
  const f = req.filtros
  const codigo = f.q?.match(/^#?\s*KT-?(\d+)$/i)
  const where = {
    ...doUsuario(req.usuario),
    ...(f.status ? { status: f.status } : f.grupo && { status: { in: GRUPOS[f.grupo] } }),
    ...((f.de || f.ate) && { criadoEm: { gte: f.de, lte: f.ate && new Date(f.ate.getTime() + 864e5) } }),
    ...(f.q &&
      (codigo
        ? { id: Number(codigo[1]) - 1000 }
        : {
            OR: [
              { itens: { some: { oferta: { produto: { nome: { contains: f.q, mode: 'insensitive' } } } } } },
              { varejista: { organizacao: { contains: f.q, mode: 'insensitive' } } },
              { produtor: { organizacao: { contains: f.q, mode: 'insensitive' } } },
            ],
          })),
  }
  const pag = paginacao(req.query, { padrao: 10 })
  const [total, pedidos, contagem] = await Promise.all([
    prisma.pedido.count({ where }),
    prisma.pedido.findMany({ where, include: incluirPedido, orderBy: { criadoEm: 'desc' }, skip: pag.skip, take: pag.take }),
    prisma.pedido.groupBy({ by: ['status'], where: doUsuario(req.usuario), _count: true }),
  ])
  const porStatus = Object.fromEntries(contagem.map((c) => [c.status, c._count]))
  const soma = (lista) => lista.reduce((s, st) => s + (porStatus[st] ?? 0), 0)
  res.json({
    ...paginado(
      pedidos.map((p) => serializar(p, req.usuario)),
      total,
      pag,
    ),
    contagem: {
      todos: soma(STATUS),
      andamento: soma(GRUPOS.andamento),
      concluidos: soma(GRUPOS.concluidos),
      cancelados: soma(GRUPOS.cancelados),
      pendentes: porStatus.PENDENTE ?? 0,
    },
  })
})

r.get('/:id', validar(idParam, 'params'), async (req, res) => {
  const p = await prisma.pedido.findUnique({ where: { id: req.params.id }, include: incluirPedido })
  if (!p) throw notFound('Pedido não encontrado.')
  const u = req.usuario
  if (u.perfil !== 'ADMIN' && p.produtorId !== u.id && p.varejistaId !== u.id) throw forbidden('Este pedido não é seu.')
  res.json(serializar(p, u))
})

/* ---------- Varejista faz um pedido com um ou mais itens ---------- */
const pedidoSchema = z.object({
  itens: z
    .array(z.object({ ofertaId: inteiroPositivo('A oferta'), quantidade: inteiroPositivo('A quantidade') }), {
      required_error: 'Inclua ao menos um item no pedido.',
    })
    .min(1, 'Inclua ao menos um item no pedido.')
    .max(20, 'No máximo 20 itens por pedido.'),
  dataEntrega: data('A data de entrega')
    .optional()
    .nullable()
    .refine((d) => !d || d >= new Date(new Date().toDateString()), 'A data de entrega não pode estar no passado.'),
  observacao: textoOpcional('A observação', 500),
})

r.post('/', permitir('VAREJISTA'), validar(pedidoSchema), async (req, res) => {
  const p = await criarPedido(req.usuario, req.body)
  res.status(201).json(serializar(p, req.usuario))
})

/* ---------- Mudança de status (regra de negócio em services/pedidos.js) ---------- */
const acaoSchema = z.object({
  acao: z.enum(['aceitar', 'recusar', 'entregar', 'cancelar'], {
    errorMap: () => ({ message: 'Ação deve ser aceitar, recusar, entregar ou cancelar.' }),
  }),
  motivo: textoOpcional('O motivo', 300),
})

r.patch('/:id/status', permitir('PRODUTOR', 'VAREJISTA'), validar(idParam, 'params'), validar(acaoSchema), async (req, res) => {
  const p = await mudarStatus(req.usuario, req.params.id, req.body.acao, req.body.motivo)
  res.json(serializar(p, req.usuario))
})

export default r
