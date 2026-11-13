import { Router } from 'express'
import { z } from 'zod'
import { conflict, forbidden, notFound } from '../lib/errors.js'
import { caixaDeBusca, distanciaKm } from '../lib/geo.js'
import { paginacao, paginado } from '../lib/pagination.js'
import { prisma } from '../lib/prisma.js'
import { serializarOferta } from '../lib/serializers.js'
import { booleano, data, dinheiro, idParam, inteiroPositivo, textoOpcional } from '../lib/schemas.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'
import { notificarDemandasDaOferta } from '../services/match.js'

const r = Router()
const incluir = { produto: true, propriedade: { include: { produtor: true } } }
const UNIDADES = ['kg', 'maço', 'caixa', 'unidade', 'dúzia']

const inicioDoDia = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const somarDias = (d, n) => new Date(d.getTime() + n * 864e5)

/* ---------- Busca do varejista: filtro por produto, preço e distância + paginação ---------- */
const buscaSchema = z.object({
  q: z.string().trim().max(80).optional(),
  categoria: z.string().trim().max(40).optional(),
  produtoId: z.coerce.number().int().positive().optional(),
  produtorId: z.coerce.number().int().positive().optional(),
  precoMin: z.coerce.number().nonnegative('Preço mínimo inválido.').optional(),
  precoMax: z.coerce.number().positive('Preço máximo inválido.').optional(),
  raioKm: z.coerce.number().int().min(1).max(1000).optional(),
  colheita: z.enum(['hoje', 'semana']).optional(),
  organico: booleano,
  ordenar: z.enum(['distancia', 'menor_preco', 'maior_preco', 'recentes']).default('distancia'),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
})

r.get('/', validar(buscaSchema, 'query'), async (req, res) => {
  const f = req.filtros
  const origem = req.usuario.latitude != null ? req.usuario : null
  const hoje = inicioDoDia()

  const where = {
    status: 'ATIVA',
    quantidadeDisponivel: { gt: 0 },
    ...(f.produtoId && { produtoId: f.produtoId }),
    ...(f.organico && { organico: true }),
    ...((f.precoMin != null || f.precoMax != null) && { preco: { gte: f.precoMin, lte: f.precoMax } }),
    ...(f.colheita === 'hoje' && { dataColheita: { gte: hoje, lt: somarDias(hoje, 1) } }),
    ...(f.colheita === 'semana' && { dataColheita: { lt: somarDias(hoje, 8) } }),
    ...(f.categoria && { produto: { categoria: f.categoria } }),
    propriedade: {
      produtor: { bloqueado: false, ...(f.produtorId && { id: f.produtorId }) },
      ...(origem && f.raioKm && caixaDeBusca(origem, f.raioKm)),
    },
    ...(f.q && {
      OR: [
        { produto: { nome: { contains: f.q, mode: 'insensitive' } } },
        { variedade: { contains: f.q, mode: 'insensitive' } },
        { propriedade: { nome: { contains: f.q, mode: 'insensitive' } } },
      ],
    }),
  }

  // o filtro fino de distância é feito com Haversine sobre o resultado pré-filtrado pela caixa
  let lista = (await prisma.oferta.findMany({ where, include: incluir })).map((o) => ({
    o,
    km: origem ? distanciaKm(origem, o.propriedade) : null,
  }))
  if (origem && f.raioKm) lista = lista.filter((x) => x.km <= f.raioKm)

  const ordem = {
    distancia: (a, b) => (a.km ?? 0) - (b.km ?? 0) || Number(a.o.preco) - Number(b.o.preco),
    menor_preco: (a, b) => Number(a.o.preco) - Number(b.o.preco),
    maior_preco: (a, b) => Number(b.o.preco) - Number(a.o.preco),
    recentes: (a, b) => b.o.criadoEm - a.o.criadoEm,
  }
  lista.sort(ordem[f.ordenar])

  const pag = paginacao(req.query)
  const pagina = lista.slice(pag.skip, pag.skip + pag.take)
  const favoritos =
    req.usuario.perfil === 'VAREJISTA'
      ? new Set(
          (
            await prisma.favorito.findMany({
              where: { varejistaId: req.usuario.id, ofertaId: { in: pagina.map((x) => x.o.id) } },
            })
          ).map((x) => x.ofertaId),
        )
      : undefined

  res.json(paginado(pagina.map((x) => serializarOferta(x.o, { origem, favoritos })), lista.length, pag))
})

/* ---------- Ofertas do produtor logado ---------- */
r.get('/minhas', permitir('PRODUTOR'), async (req, res) => {
  const ofertas = await prisma.oferta.findMany({
    where: { propriedade: { produtorId: req.usuario.id } },
    include: { ...incluir, _count: { select: { itens: true } } },
    orderBy: [{ status: 'asc' }, { atualizadoEm: 'desc' }],
  })
  res.json(ofertas.map((o) => serializarOferta(o)))
})

/* ---------- Detalhe ---------- */
r.get('/:id', validar(idParam, 'params'), async (req, res) => {
  const o = await prisma.oferta.findUnique({ where: { id: req.params.id }, include: incluir })
  const dono = o?.propriedade.produtorId === req.usuario.id
  if (!o || (!dono && req.usuario.perfil !== 'ADMIN' && !['ATIVA', 'ESGOTADA'].includes(o.status))) {
    throw notFound('Oferta não encontrada.')
  }
  if (req.usuario.perfil === 'VAREJISTA') {
    await prisma.oferta.update({ where: { id: o.id }, data: { visualizacoes: { increment: 1 } } })
  }

  const origem = req.usuario.latitude != null ? req.usuario : null
  const [outras, historico, media, favorito] = await Promise.all([
    prisma.oferta.findMany({
      where: { id: { not: o.id }, status: 'ATIVA', quantidadeDisponivel: { gt: 0 }, propriedade: { produtorId: o.propriedade.produtorId } },
      include: incluir,
      take: 6,
    }),
    // preços praticados em pedidos aceitos deste produto (todas as propriedades)
    prisma.itemPedido.findMany({
      where: { oferta: { produtoId: o.produtoId }, pedido: { status: { in: ['ACEITO', 'ENTREGUE'] } } },
      select: { precoUnitario: true, pedido: { select: { criadoEm: true } } },
      orderBy: { pedido: { criadoEm: 'desc' } },
      take: 8,
    }),
    prisma.oferta.aggregate({ where: { produtoId: o.produtoId, status: 'ATIVA' }, _avg: { preco: true } }),
    req.usuario.perfil === 'VAREJISTA'
      ? prisma.favorito.findUnique({ where: { varejistaId_ofertaId: { varejistaId: req.usuario.id, ofertaId: o.id } } })
      : null,
  ])

  res.json({
    ...serializarOferta(o, { origem }),
    favorito: Boolean(favorito),
    outrasOfertas: outras.map((x) => serializarOferta(x, { origem })),
    historicoPrecos: historico.reverse().map((h) => ({ data: h.pedido.criadoEm, preco: Number(h.precoUnitario) })),
    precoMedioRegiao: media._avg.preco == null ? null : Math.round(Number(media._avg.preco) * 100) / 100,
  })
})

/* ---------- CRUD do produtor ---------- */
const ofertaSchema = z
  .object({
    propriedadeId: inteiroPositivo('A propriedade'),
    produtoId: inteiroPositivo('O produto'),
    variedade: textoOpcional('A variedade', 60),
    descricao: textoOpcional('A descrição', 500),
    preco: dinheiro('o preço'),
    unidade: z.enum(UNIDADES, { errorMap: () => ({ message: `Unidade deve ser: ${UNIDADES.join(', ')}.` }) }),
    quantidade: inteiroPositivo('A quantidade disponível'),
    pedidoMinimo: z.coerce.number().int().min(1, 'O pedido mínimo deve ser ao menos 1.').default(1),
    dataColheita: data('A data da colheita'),
    disponivelAte: data('Disponível até').optional().nullable(),
    organico: z.boolean().default(false),
    entregaInclusa: z.boolean().default(false),
    rascunho: z.boolean().default(false),
  })
  .refine((d) => !d.disponivelAte || d.disponivelAte >= d.dataColheita, {
    message: '"Disponível até" deve ser igual ou depois da colheita.',
    path: ['disponivelAte'],
  })
  .refine((d) => d.pedidoMinimo <= d.quantidade, { message: 'O pedido mínimo não pode ser maior que o estoque.', path: ['pedidoMinimo'] })

async function minhaOferta(req) {
  const o = await prisma.oferta.findUnique({ where: { id: req.params.id }, include: incluir })
  if (!o) throw notFound('Oferta não encontrada.')
  if (o.propriedade.produtorId !== req.usuario.id) throw forbidden('Esta oferta não é sua.')
  return o
}

async function conferirPropriedade(req) {
  const p = await prisma.propriedade.findFirst({ where: { id: req.body.propriedadeId, produtorId: req.usuario.id } })
  if (!p) throw forbidden('Escolha uma das suas propriedades.')
}

r.post('/', permitir('PRODUTOR'), validar(ofertaSchema), async (req, res) => {
  await conferirPropriedade(req)
  const { quantidade, rascunho, ...dados } = req.body
  const o = await prisma.oferta.create({
    data: { ...dados, quantidadeTotal: quantidade, quantidadeDisponivel: quantidade, status: rascunho ? 'RASCUNHO' : 'ATIVA' },
    include: incluir,
  })
  const demandasAvisadas = o.status === 'ATIVA' ? await notificarDemandasDaOferta(o) : 0
  res.status(201).json({ ...serializarOferta(o), demandasAvisadas })
})

r.put('/:id', permitir('PRODUTOR'), validar(idParam, 'params'), validar(ofertaSchema), async (req, res) => {
  const atual = await minhaOferta(req)
  await conferirPropriedade(req)
  const { quantidade, rascunho, ...dados } = req.body

  let status = atual.status
  if (status === 'RASCUNHO' && !rascunho) status = 'ATIVA'
  if (status === 'ESGOTADA' && quantidade > 0) status = 'ATIVA'

  const o = await prisma.oferta.update({
    where: { id: atual.id },
    data: { ...dados, quantidadeDisponivel: quantidade, quantidadeTotal: Math.max(quantidade, atual.quantidadeTotal), status },
    include: incluir,
  })
  const publicou = o.status === 'ATIVA' && atual.status !== 'ATIVA'
  const demandasAvisadas = publicou ? await notificarDemandasDaOferta(o) : 0
  res.json({ ...serializarOferta(o), demandasAvisadas })
})

const statusSchema = z.object({ status: z.enum(['ATIVA', 'PAUSADA'], { errorMap: () => ({ message: 'Status deve ser ATIVA ou PAUSADA.' }) }) })

r.patch('/:id/status', permitir('PRODUTOR'), validar(idParam, 'params'), validar(statusSchema), async (req, res) => {
  const atual = await minhaOferta(req)
  if (req.body.status === 'ATIVA' && atual.quantidadeDisponivel === 0) {
    throw conflict('Sem estoque: atualize a quantidade disponível antes de reativar a oferta.')
  }
  const o = await prisma.oferta.update({ where: { id: atual.id }, data: { status: req.body.status }, include: incluir })
  const demandasAvisadas = o.status === 'ATIVA' && atual.status !== 'ATIVA' ? await notificarDemandasDaOferta(o) : 0
  res.json({ ...serializarOferta(o), demandasAvisadas })
})

r.delete('/:id', permitir('PRODUTOR'), validar(idParam, 'params'), async (req, res) => {
  const atual = await minhaOferta(req)
  const pedidos = await prisma.itemPedido.count({ where: { ofertaId: atual.id } })
  if (pedidos > 0) throw conflict('Esta oferta tem pedidos no histórico. Pause a oferta em vez de excluir.')
  await prisma.oferta.delete({ where: { id: atual.id } })
  res.status(204).end()
})

export default r
