import 'dotenv/config'

const segredo = process.env.JWT_SECRET
if (!segredo && process.env.NODE_ENV === 'production') {
  throw new Error('Defina JWT_SECRET no ambiente de produção.')
}

export const config = {
  port: Number(process.env.PORT) || 3333,
  jwtSecret: segredo || 'dev-secret-troque-no-env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? true,
}
