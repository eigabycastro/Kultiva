import { Router } from 'express'
import { z } from 'zod'
import { badRequest, forbidden, notFound } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { resumoUsuario, serializarOferta } from '../lib/serializers.js'
import { permitir } from '../middleware/auth.js'
import { validar } from '../middleware/validate.js'
import { notificar } from '../services/notificacoes.js'

/* Chat de negociação: a conversa é o par (produtor, varejista).
   Nesta versão o front atualiza a conversa a cada poucos segundos; na Release 4 entra o Socket.IO. */
const r = Router()
r.use(permitir('PRODUTOR', 'VAREJISTA'))

const incluirOferta = { produto: true, propriedade: { include: { produtor: true } } }
const contatoParam = z.object({ usuarioId: z.coerce.number().int().positive('Contato inválido.') })
const entre = (a, b) => ({
  OR: [
    { remetenteId: a, destinatarioId: b },
    { remetenteId: b, destinatarioId: a },
  ],
})

// Só produtor ↔ varejista conversam, e nenhum dos dois pode estar bloqueado
async function contatoValido(eu, id) {
  if (id === eu.id) throw badRequest('Você não pode conversar com você mesmo.')
  const contato = await prisma.usuario.findUnique({ where: { id } })
  if (!contato || contato.perfil === 'ADMIN') throw notFound('Contato não encontrado.')
  if (contato.perfil === eu.perfil) throw forbidden('As negociações são entre produtores e varejistas.')
  if (contato.bloqueado) throw forbidden('Este usuário não está disponível no momento.')
  return contato
}

const serializarMensagem = (m, eu) => ({
  id: m.id,
  texto: m.texto,
  minha: m.remetenteId === eu,
  lida: m.lida,
  ofertaId: m.ofertaId,
  criadoEm: m.criadoEm,
})

/* ---------- Lista de conversas (última mensagem + não lidas) ---------- */
r.get('/conversas', async (req, res) => {
  const eu = req.usuario.id
  const q = String(req.query.q ?? '').trim().toLowerCase()
  const mensagens = await prisma.mensagem.findMany({
    where: { OR: [{ remetenteId: eu }, { destinatarioId: eu }] },
    include: { remetente: true, destinatario: true },
    orderBy: { criadoEm: 'desc' },
    take: 1000,
  })
  const conversas = new Map()
  for (const m of mensagens) {
    const outro = m.remetenteId === eu ? m.destinatario : m.remetente
    const c = conversas.get(outro.id) ?? { contato: { ...resumoUsuario(outro), perfil: outro.perfil }, ultima: serializarMensagem(m, eu), naoLidas: 0 }
    if (m.destinatarioId === eu && !m.lida) c.naoLidas += 1
    conversas.set(outro.id, c)
  }
  let lista = [...conversas.values()]
  if (q) lista = lista.filter((c) => `${c.contato.organizacao} ${c.contato.nome}`.toLowerCase().includes(q))
  res.json({ data: lista, naoLidas: lista.reduce((s, c) => s + c.naoLidas, 0) })
})

/* ---------- Mensagens de uma conversa (marca como lidas as recebidas) ---------- */
r.get('/:usuarioId', validar(contatoParam, 'params'), async (req, res) => {
  const eu = req.usuario
  const contato = await contatoValido(eu, req.params.usuarioId)
  const [mensagens] = await Promise.all([
    prisma.mensagem.findMany({ where: entre(eu.id, contato.id), orderBy: { criadoEm: 'asc' }, take: 200 }),
    prisma.mensagem.updateMany({ where: { remetenteId: contato.id, destinatarioId: eu.id, lida: false }, data: { lida: true } }),
  ])

  // oferta em negociação: a pedida na URL (?oferta=) ou a última citada na conversa
  const ofertaId = Number(req.query.oferta) || [...mensagens].reverse().find((m) => m.ofertaId)?.ofertaId
  const produtorId = eu.perfil === 'PRODUTOR' ? eu.id : contato.id
  const oferta = ofertaId
    ? await prisma.oferta.findFirst({ where: { id: ofertaId, propriedade: { produtorId } }, include: incluirOferta })
    : null
  const origem = eu.perfil === 'VAREJISTA' ? eu : contato

  res.json({
    contato: { ...resumoUsuario(contato), perfil: contato.perfil, telefone: contato.telefone },
    oferta: oferta && serializarOferta(oferta, { origem }),
    mensagens: mensagens.map((m) => serializarMensagem(m, eu.id)),
  })
})

/* ---------- Enviar mensagem ---------- */
const envioSchema = z.object({
  texto: z.string({ required_error: 'Escreva a mensagem.' }).trim().min(1, 'Escreva a mensagem.').max(1000, 'A mensagem pode ter no máximo 1000 caracteres.'),
  ofertaId: z.coerce.number().int().positive().optional().nullable(),
})

r.post('/:usuarioId', validar(contatoParam, 'params'), validar(envioSchema), async (req, res) => {
  const eu = req.usuario
  const contato = await contatoValido(eu, req.params.usuarioId)
  const { texto, ofertaId } = req.body

  if (ofertaId) {
    const produtorId = eu.perfil === 'PRODUTOR' ? eu.id : contato.id
    const ok = await prisma.oferta.count({ where: { id: ofertaId, propriedade: { produtorId } } })
    if (!ok) throw badRequest('Essa oferta não é do produtor desta conversa.')
  }

  const m = await prisma.mensagem.create({ data: { remetenteId: eu.id, destinatarioId: contato.id, texto, ofertaId } })

  // uma notificação por conversa enquanto ela não for lida (evita uma notificação por mensagem)
  const area = contato.perfil === 'PRODUTOR' ? 'produtor' : 'varejista'
  const link = `/${area}/negociacoes?com=${eu.id}`
  const pendente = await prisma.notificacao.count({ where: { usuarioId: contato.id, tipo: 'MENSAGEM', link, lida: false } })
  if (!pendente) {
    await notificar(contato.id, {
      tipo: 'MENSAGEM',
      titulo: `Nova mensagem de ${eu.organizacao || eu.nome}`,
      texto: texto.length > 120 ? `${texto.slice(0, 117)}…` : texto,
      link,
    })
  }
  res.status(201).json(serializarMensagem(m, eu.id))
})

export default r
