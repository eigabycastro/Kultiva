import { prisma } from '../lib/prisma.js'

// Cria uma notificação para o usuário (aceita o client de uma transação)
export const notificar = (usuarioId, { tipo, titulo, texto, link }, db = prisma) =>
  db.notificacao.create({ data: { usuarioId, tipo, titulo, texto, link } })
