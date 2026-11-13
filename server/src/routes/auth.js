import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { buscarCep } from '../lib/cep.js'
import { conflict, forbidden, unauthorized } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { serializarUsuario } from '../lib/serializers.js'
import { cep, textoOpcional, texto } from '../lib/schemas.js'
import { autenticar, gerarToken } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'

const r = Router()

// Limita tentativas de login/cadastro por IP (força bruta)
const limite = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' },
})

const email = z.string({ required_error: 'Informe o e-mail.' }).trim().toLowerCase().email('E-mail inválido, ex.: voce@seusitio.com.br.')
const senha = z
  .string({ required_error: 'Informe a senha.' })
  .min(8, 'A senha precisa de pelo menos 8 caracteres.')
  .max(72, 'A senha pode ter no máximo 72 caracteres.')

const cadastroSchema = z.object({
  perfil: z.enum(['PRODUTOR', 'VAREJISTA'], { errorMap: () => ({ message: 'Escolha o perfil: produtor ou varejista.' }) }),
  nome: texto('o nome', { min: 3 }),
  email,
  senha,
  telefone: textoOpcional('O telefone', 20),
  documento: textoOpcional('O documento', 20),
  organizacao: texto('o nome da propriedade ou do estabelecimento', { min: 2 }),
  tipoEstabelecimento: textoOpcional('O tipo de estabelecimento', 40),
  cep,
  numero: textoOpcional('O número', 20),
  raioKm: z.coerce.number().int().min(1).max(200).default(30),
})

r.post('/cadastro', limite, validar(cadastroSchema), async (req, res) => {
  const { senha: senhaPura, numero, ...dados } = req.body
  if (await prisma.usuario.findUnique({ where: { email: dados.email } })) {
    throw conflict('Já existe uma conta com este e-mail. Entre ou use outro e-mail.')
  }
  const local = await buscarCep(dados.cep)
  const endereco = [local.endereco, numero].filter(Boolean).join(', ')

  const usuario = await prisma.usuario.create({
    data: {
      ...dados,
      senhaHash: await bcrypt.hash(senhaPura, 10),
      cep: local.cep,
      endereco,
      cidade: local.cidade,
      uf: local.uf,
      latitude: local.latitude,
      longitude: local.longitude,
      // o produtor já começa com a primeira propriedade cadastrada (onboarding)
      ...(dados.perfil === 'PRODUTOR' &&
        local.latitude != null && {
          propriedades: {
            create: {
              nome: dados.organizacao,
              cep: local.cep,
              endereco,
              cidade: local.cidade,
              uf: local.uf,
              latitude: local.latitude,
              longitude: local.longitude,
              raioEntregaKm: dados.raioKm,
            },
          },
        }),
      notificacoes: {
        create: {
          tipo: 'SISTEMA',
          titulo: 'Boas-vindas à Kultiva!',
          texto:
            dados.perfil === 'PRODUTOR'
              ? 'Cadastre sua primeira oferta para aparecer para os compradores da região.'
              : 'Busque produtores da região ou publique um Procura-se com o que você precisa.',
          link: dados.perfil === 'PRODUTOR' ? '/produtor/produtos/nova' : '/varejista/buscar',
        },
      },
    },
  })
  res.status(201).json({ token: gerarToken(usuario), usuario: serializarUsuario(usuario) })
})

const loginSchema = z.object({ email, senha: z.string({ required_error: 'Informe a senha.' }).min(1, 'Informe a senha.') })

r.post('/login', limite, validar(loginSchema), async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { email: req.body.email } })
  // mesma mensagem para e-mail inexistente ou senha errada (não revela quais e-mails existem)
  if (!usuario || !(await bcrypt.compare(req.body.senha, usuario.senhaHash))) {
    throw unauthorized('E-mail ou senha incorretos.')
  }
  if (usuario.bloqueado) throw forbidden('Sua conta está bloqueada. Fale com o suporte da Kultiva.')
  res.json({ token: gerarToken(usuario), usuario: serializarUsuario(usuario) })
})

// JWT é sem estado: o logout é feito no cliente descartando o token. A rota existe para o fluxo ficar explícito.
r.post('/logout', autenticar, (_req, res) => res.status(204).end())

r.get('/me', autenticar, (req, res) => res.json(serializarUsuario(req.usuario)))

const perfilSchema = z
  .object({
    nome: texto('o nome', { min: 3 }),
    email,
    telefone: textoOpcional('O telefone', 20),
    organizacao: texto('o nome da propriedade ou do estabelecimento', { min: 2 }),
    tipoEstabelecimento: textoOpcional('O tipo de estabelecimento', 40),
    endereco: textoOpcional('O endereço', 200),
    cep: cep.optional(),
    raioKm: z.coerce.number().int().min(1, 'Raio mínimo de 1 km.').max(200, 'Raio máximo de 200 km.'),
    senhaAtual: z.string().optional(),
    novaSenha: senha.optional(),
  })
  .partial()

r.put('/me', autenticar, validar(perfilSchema), async (req, res) => {
  const { senhaAtual, novaSenha, cep: novoCep, ...dados } = req.body
  const u = req.usuario

  if (dados.email && dados.email !== u.email && (await prisma.usuario.findUnique({ where: { email: dados.email } }))) {
    throw conflict('Este e-mail já está em uso por outra conta.')
  }
  if (novaSenha) {
    if (!senhaAtual || !(await bcrypt.compare(senhaAtual, u.senhaHash))) throw unauthorized('Senha atual incorreta.')
    dados.senhaHash = await bcrypt.hash(novaSenha, 10)
  }
  if (novoCep && novoCep !== u.cep?.replace(/\D/g, '')) {
    const local = await buscarCep(novoCep)
    Object.assign(dados, {
      cep: local.cep,
      cidade: local.cidade,
      uf: local.uf,
      latitude: local.latitude,
      longitude: local.longitude,
      endereco: dados.endereco ?? local.endereco,
    })
  }
  const usuario = await prisma.usuario.update({ where: { id: u.id }, data: dados })
  res.json(serializarUsuario(usuario))
})

r.delete('/me', autenticar, async (req, res) => {
  const id = req.usuario.id
  const pedidos = await prisma.pedido.count({ where: { OR: [{ varejistaId: id }, { produtorId: id }] } })
  if (pedidos > 0) {
    throw conflict('Sua conta tem pedidos no histórico e não pode ser excluída. Fale com o suporte para encerrá-la.')
  }
  await prisma.usuario.delete({ where: { id } })
  res.status(204).end()
})

export default r

// Rota pública para o cadastro preencher o endereço a partir do CEP (ViaCEP)
export const cepRouter = Router().get('/:cep', async (req, res) => res.json(await buscarCep(req.params.cep)))
