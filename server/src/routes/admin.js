import { Router } from 'express'
import { z } from 'zod'
import { badRequest, notFound } from '../lib/errors.js'
import { paginacao, paginado } from '../lib/pagination.js'
import { prisma } from '../lib/prisma.js'
import { serializarUsuario } from '../lib/serializers.js'
import { booleano, idParam } from '../lib/schemas.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'
import { notificar } from '../services/notificacoes.js'

// Área do administrador: moderação de usuários (US15)
const r = Router()
r.use(permitir('ADMIN'))

const listaSchema = z.object({
  q: z.string().trim().max(80).optional(),
  perfil: z.enum(['PRODUTOR', 'VAREJISTA', 'ADMIN']).optional(),
  bloqueado: booleano,
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
})

r.get('/usuarios', validar(listaSchema, 'query'), async (req, res) => {
  const f = req.filtros
  const where = {
    ...(f.perfil && { perfil: f.perfil }),
    ...(f.bloqueado != null && { bloqueado: f.bloqueado }),
    ...(f.q && {
      OR: [
        { nome: { contains: f.q, mode: 'insensitive' } },
        { email: { contains: f.q, mode: 'insensitive' } },
        { organizacao: { contains: f.q, mode: 'insensitive' } },
        { cidade: { contains: f.q, mode: 'insensitive' } },
      ],
    }),
  }
  const pag = paginacao(req.query, { padrao: 10 })
  const [total, usuarios] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      skip: pag.skip,
      take: pag.take,
      include: { _count: { select: { propriedades: true, pedidosFeitos: true, pedidosRecebidos: true, demandas: true } } },
    }),
  ])
  res.json(
    paginado(
      usuarios.map((u) => ({
        ...serializarUsuario(u),
        propriedades: u._count.propriedades,
        pedidos: u._count.pedidosFeitos + u._count.pedidosRecebidos,
        demandas: u._count.demandas,
      })),
      total,
      pag,
    ),
  )
})

r.get('/resumo', async (_req, res) => {
  const [porPerfil, bloqueados, ofertasAtivas, pedidos, demandasAbertas] = await Promise.all([
    prisma.usuario.groupBy({ by: ['perfil'], _count: true }),
    prisma.usuario.count({ where: { bloqueado: true } }),
    prisma.oferta.count({ where: { status: 'ATIVA' } }),
    prisma.pedido.count(),
    prisma.demanda.count({ where: { status: 'ABERTA' } }),
  ])
  const n = (p) => porPerfil.find((x) => x.perfil === p)?._count ?? 0
  res.json({ produtores: n('PRODUTOR'), varejistas: n('VAREJISTA'), admins: n('ADMIN'), bloqueados, ofertasAtivas, pedidos, demandasAbertas })
})

const bloqueioSchema = z.object({ bloqueado: z.boolean({ required_error: 'Informe bloqueado: true ou false.' }) })

r.patch('/usuarios/:id/bloqueio', validar(idParam, 'params'), validar(bloqueioSchema), async (req, res) => {
  if (req.params.id === req.usuario.id) throw badRequest('Você não pode bloquear a própria conta.')
  const alvo = await prisma.usuario.findUnique({ where: { id: req.params.id } })
  if (!alvo) throw notFound('Usuário não encontrado.')
  const u = await prisma.usuario.update({ where: { id: alvo.id }, data: { bloqueado: req.body.bloqueado } })
  if (!req.body.bloqueado && alvo.bloqueado) {
    await notificar(u.id, { tipo: 'SISTEMA', titulo: 'Sua conta foi reativada', texto: 'Você já pode voltar a negociar na Kultiva.' })
  }
  res.json(serializarUsuario(u))
})

export default r
