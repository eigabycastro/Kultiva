import jwt from 'jsonwebtoken'
import { config } from '../lib/config.js'
import { forbidden, unauthorized } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'

export const gerarToken = (usuario) =>
  jwt.sign({ sub: usuario.id, perfil: usuario.perfil }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

// Exige "Authorization: Bearer <token>" válido e usuário ativo (não bloqueado)
export async function autenticar(req, _res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')
  if (tipo !== 'Bearer' || !token) throw unauthorized()

  let payload
  try {
    payload = jwt.verify(token, config.jwtSecret)
  } catch {
    throw unauthorized('Sessão expirada ou inválida. Entre novamente.')
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(payload.sub) } })
  if (!usuario) throw unauthorized('Conta não encontrada.')
  if (usuario.bloqueado) throw forbidden('Sua conta está bloqueada. Fale com o suporte da Kultiva.')

  req.usuario = usuario
  next()
}

// Libera a rota só para os perfis informados: permitir('PRODUTOR'), permitir('VAREJISTA', 'ADMIN')
export const permitir =
  (...perfis) =>
  (req, _res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) throw forbidden()
    next()
  }
