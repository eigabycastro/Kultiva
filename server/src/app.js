import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { config } from './lib/config.js'
import { openapi } from './docs/openapi.js'
import { autenticar } from './middleware/auth.js'
import { naoEncontrado, tratarErros } from './middleware/errors.js'
import admin from './routes/admin.js'
import auth, { cepRouter } from './routes/auth.js'
import calendario from './routes/calendario.js'
import dashboard from './routes/dashboard.js'
import demandas from './routes/demandas.js'
import favoritos from './routes/favoritos.js'
import mensagens from './routes/mensagens.js'
import notificacoes from './routes/notificacoes.js'
import ofertas from './routes/ofertas.js'
import pedidos from './routes/pedidos.js'
import previsao from './routes/previsao.js'
import produtos from './routes/produtos.js'
import propriedades from './routes/propriedades.js'

export function criarApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1) // na Vercel o IP real vem no X-Forwarded-For (usado pelo limite de tentativas de login)
  app.use(helmet({ contentSecurityPolicy: false })) // CSP desligado só para o Swagger UI carregar
  app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'apikey',
      'x-client-info'
    ],
    optionsSuccessStatus: 204
  }))  
  app.use(express.json({ limit: '100kb' }))

  app.get('/', (_req, res) => res.redirect('/docs'))
  app.get('/api/health', (_req, res) => res.json({ ok: true, versao: '0.3.0' }))
  app.get('/docs.json', (_req, res) => res.json(openapi))
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Kultiva API' }))

  // Rotas públicas
  app.use('/api/auth', auth) // /me e /logout validam o token dentro do próprio router
  app.use('/api/cep', cepRouter)

  // Daqui para baixo, tudo exige login (JWT); o perfil é conferido em cada router com permitir(...)
  const privado = express.Router()
  privado.use(autenticar)
  privado.use('/produtos', produtos)
  privado.use('/propriedades', propriedades)
  privado.use('/ofertas', ofertas)
  privado.use('/pedidos', pedidos)
  privado.use('/demandas', demandas)
  privado.use('/notificacoes', notificacoes)
  privado.use('/favoritos', favoritos)
  privado.use('/mensagens', mensagens)
  privado.use('/calendario', calendario)
  privado.use('/previsao', previsao)
  privado.use('/dashboard', dashboard)
  privado.use('/admin', admin)
  app.use('/api', privado)

  app.use(naoEncontrado)
  app.use(tratarErros)
  return app
}
