import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

// Catálogo de produtos (alface, tomate...) usado nos formulários de oferta e de Procura-se
const r = Router()
r.get('/', async (_req, res) => {
  res.json(await prisma.produto.findMany({ orderBy: [{ categoria: 'asc' }, { nome: 'asc' }] }))
})
export default r
