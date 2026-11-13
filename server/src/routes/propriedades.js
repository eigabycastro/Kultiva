import { Router } from 'express'
import { z } from 'zod'
import { buscarCep } from '../lib/cep.js'
import { badRequest, conflict, notFound } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { serializarPropriedade } from '../lib/serializers.js'
import { cep, idParam, texto, textoOpcional } from '../lib/schemas.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'

// CRUD de propriedades do produtor (1 produtor : N propriedades)
const r = Router()
r.use(permitir('PRODUTOR'))

const schema = z.object({
  nome: texto('o nome da propriedade', { min: 2, max: 80 }),
  cep,
  endereco: textoOpcional('O endereço', 200),
  areaHa: z.coerce.number().positive('A área deve ser maior que zero.').max(100000).optional().nullable(),
  raioEntregaKm: z.coerce.number().int().min(1, 'Raio mínimo de 1 km.').max(200, 'Raio máximo de 200 km.').default(30),
})

async function daMinhaConta(req) {
  const p = await prisma.propriedade.findFirst({ where: { id: req.params.id, produtorId: req.usuario.id } })
  if (!p) throw notFound('Propriedade não encontrada.')
  return p
}

async function comLocalizacao(body, atual) {
  if (atual && body.cep === atual.cep.replace(/\D/g, '')) return { ...body, cep: atual.cep }
  const local = await buscarCep(body.cep)
  if (local.latitude == null) throw badRequest('Não conseguimos localizar este CEP no mapa. Confira os números.')
  return { ...body, cep: local.cep, cidade: local.cidade, uf: local.uf, latitude: local.latitude, longitude: local.longitude, endereco: body.endereco ?? local.endereco }
}

r.get('/', async (req, res) => {
  const lista = await prisma.propriedade.findMany({
    where: { produtorId: req.usuario.id },
    include: { _count: { select: { ofertas: true } } },
    orderBy: { criadoEm: 'asc' },
  })
  res.json(lista.map(serializarPropriedade))
})

r.get('/:id', validar(idParam, 'params'), async (req, res) => res.json(serializarPropriedade(await daMinhaConta(req))))

r.post('/', validar(schema), async (req, res) => {
  const dados = await comLocalizacao(req.body)
  const p = await prisma.propriedade.create({ data: { ...dados, produtorId: req.usuario.id } })
  res.status(201).json(serializarPropriedade(p))
})

r.put('/:id', validar(idParam, 'params'), validar(schema), async (req, res) => {
  const atual = await daMinhaConta(req)
  const dados = await comLocalizacao(req.body, atual)
  const p = await prisma.propriedade.update({ where: { id: atual.id }, data: dados })
  res.json(serializarPropriedade(p))
})

r.delete('/:id', validar(idParam, 'params'), async (req, res) => {
  const atual = await daMinhaConta(req)
  const comPedido = await prisma.itemPedido.count({ where: { oferta: { propriedadeId: atual.id } } })
  if (comPedido > 0) throw conflict('Esta propriedade tem ofertas com pedidos no histórico e não pode ser excluída.')
  await prisma.propriedade.delete({ where: { id: atual.id } }) // as ofertas sem pedido vão junto (cascade)
  res.status(204).end()
})

export default r
