import { Router } from 'express'
import { z } from 'zod'
import { notFound } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { serializarOferta } from '../lib/serializers.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'

// Ofertas favoritas do varejista (N:N Usuario <-> Oferta)
const r = Router()
r.use(permitir('VAREJISTA'))
const param = z.object({ ofertaId: z.coerce.number().int().positive('Oferta inválida.') })

r.get('/', async (req, res) => {
  const favs = await prisma.favorito.findMany({
    where: { varejistaId: req.usuario.id },
    include: { oferta: { include: { produto: true, propriedade: { include: { produtor: true } } } } },
    orderBy: { criadoEm: 'desc' },
  })
  const origem = req.usuario.latitude != null ? req.usuario : null
  const ofertas = favs.map((f) => serializarOferta(f.oferta, { origem, favoritos: new Set([f.ofertaId]) }))

  // produtores das ofertas salvas, com quantas ofertas ativas cada um tem
  const porProdutor = new Map()
  for (const o of ofertas) {
    const p = porProdutor.get(o.produtor.id) ?? { ...o.produtor, distanciaKm: o.distanciaKm, produtos: new Set() }
    p.produtos.add(o.produto)
    porProdutor.set(o.produtor.id, p)
  }
  const ativas = await prisma.oferta.groupBy({
    by: ['propriedadeId'],
    where: { status: 'ATIVA', propriedade: { produtorId: { in: [...porProdutor.keys()] } } },
    _count: true,
  })
  const props = await prisma.propriedade.findMany({ where: { id: { in: ativas.map((a) => a.propriedadeId) } } })
  const produtores = [...porProdutor.values()].map((p) => ({
    ...p,
    produtos: [...p.produtos].join(', '),
    ofertasAtivas: ativas
      .filter((a) => props.find((x) => x.id === a.propriedadeId)?.produtorId === p.id)
      .reduce((s, a) => s + a._count, 0),
  }))
  res.json({ ofertas, produtores })
})

r.post('/:ofertaId', validar(param, 'params'), async (req, res) => {
  const oferta = await prisma.oferta.findUnique({ where: { id: req.params.ofertaId } })
  if (!oferta) throw notFound('Oferta não encontrada.')
  await prisma.favorito.upsert({
    where: { varejistaId_ofertaId: { varejistaId: req.usuario.id, ofertaId: oferta.id } },
    create: { varejistaId: req.usuario.id, ofertaId: oferta.id },
    update: {},
  })
  res.status(201).json({ favorito: true })
})

r.delete('/:ofertaId', validar(param, 'params'), async (req, res) => {
  await prisma.favorito.deleteMany({ where: { varejistaId: req.usuario.id, ofertaId: req.params.ofertaId } })
  res.status(204).end()
})

export default r
