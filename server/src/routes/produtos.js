import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { texto } from '../lib/schemas.js'
import { validar } from '../middleware/validate.js'

// Catálogo de produtos (alface, tomate...) usado nos formulários de oferta e de Procura-se.
// Produtor e varejista podem cadastrar um produto que ainda não existe (ex.: pimentão).
const r = Router()

const CATEGORIAS = ['Hortaliças', 'Legumes', 'Frutas', 'Grãos', 'Ovos e laticínios', 'Outros']
const UNIDADES = ['kg', 'maço', 'caixa', 'unidade', 'dúzia']
// fotos que o front tem; produto sem foto aparece com ilustração genérica
const FOTOS = ['alface', 'tomate', 'morango', 'couve', 'cenoura', 'banana']
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

r.get('/', async (_req, res) => {
  res.json(await prisma.produto.findMany({ orderBy: [{ categoria: 'asc' }, { nome: 'asc' }] }))
})

const produtoSchema = z.object({
  nome: texto('o nome do produto', { min: 2, max: 60 }),
  categoria: z.enum(CATEGORIAS, { errorMap: () => ({ message: `Categoria deve ser: ${CATEGORIAS.join(', ')}.` }) }),
  unidadePadrao: z.enum(UNIDADES, { errorMap: () => ({ message: `Unidade deve ser: ${UNIDADES.join(', ')}.` }) }),
})

r.post('/', validar(produtoSchema), async (req, res) => {
  // nome padronizado: "pimentão vermelho" → "Pimentão vermelho"
  const nome = req.body.nome.replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase())
  const existente = await prisma.produto.findFirst({ where: { nome: { equals: nome, mode: 'insensitive' } } })
  if (existente) return res.json(existente) // já existe: reaproveita em vez de duplicar

  const foto = FOTOS.find((f) => semAcento(nome).includes(f)) ?? 'outro'
  const produto = await prisma.produto.create({
    data: { nome, categoria: req.body.categoria, unidadePadrao: req.body.unidadePadrao, foto, criadoPorId: req.usuario.id },
  })
  res.status(201).json(produto)
})

export default r
