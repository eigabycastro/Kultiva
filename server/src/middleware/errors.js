import { Prisma } from '@prisma/client'
import { HttpError } from '../lib/errors.js'

export function naoEncontrado(req, res) {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} não existe.` })
}

// eslint-disable-next-line no-unused-vars
export function tratarErros(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) })
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Já existe um registro com esses dados.' })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Registro não encontrado.' })
    if (err.code === 'P2003') return res.status(409).json({ error: 'Registro em uso por outros dados.' })
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' })

  console.error(err)
  res.status(500).json({ error: 'Erro interno. Tente novamente em instantes.' })
}
