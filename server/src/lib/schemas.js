import { z } from 'zod'

// Campos reaproveitados pelos schemas das rotas, com mensagens em português
export const texto = (campo, { min = 1, max = 120 } = {}) =>
  z
    .string({ required_error: `Informe ${campo}.`, invalid_type_error: `${campo} deve ser texto.` })
    .trim()
    .min(min, min <= 1 ? `Informe ${campo}.` : `${campo} precisa de pelo menos ${min} caracteres.`)
    .max(max, `${campo} pode ter no máximo ${max} caracteres.`)

export const textoOpcional = (campo, max = 500) =>
  z
    .string()
    .trim()
    .max(max, `${campo} pode ter no máximo ${max} caracteres.`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))

const vazio = (v) => v === '' || v == null
const minusculo = (campo) => campo.charAt(0).toLowerCase() + campo.slice(1)

export const inteiroPositivo = (campo, max = 1_000_000) =>
  z.preprocess(
    (v) => (vazio(v) ? undefined : Number(v)),
    z
      .number({ required_error: `Informe ${minusculo(campo)}.`, invalid_type_error: `${campo} deve ser um número.` })
      .int(`${campo} deve ser um número inteiro.`)
      .positive(`${campo} deve ser maior que zero.`)
      .max(max, `${campo} está alto demais.`),
  )

// Aceita 3.2, "3.2", "3,20" ou "R$ 3,20"
export const dinheiro = (campo) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? Number(v.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.')) : v),
    z
      .number({ required_error: `Informe ${campo}.`, invalid_type_error: `${campo} deve ser um valor, ex.: 3,20.` })
      .positive(`${campo} deve ser maior que zero.`)
      .max(100000, `${campo} parece alto demais.`),
  )

// Aceita "2026-10-09" ou "09/10/2026"
export const data = (campo) =>
  z.preprocess(
    (v) => {
      if (vazio(v)) return undefined
      if (typeof v !== 'string') return v
      const br = v.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      return new Date(br ? `${br[3]}-${br[2]}-${br[1]}T12:00:00` : v.length === 10 ? `${v}T12:00:00` : v)
    },
    z.date({
      errorMap: (_issue, ctx) => ({ message: ctx.data == null ? `Informe ${minusculo(campo)}.` : `${campo}: use o formato dd/mm/aaaa.` }),
    }),
  )

export const cep = z
  .string({ required_error: 'Informe o CEP.' })
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length === 8, 'CEP inválido: informe 8 números, ex.: 37550-000.')

export const idParam = z.object({ id: z.coerce.number().int().positive('ID inválido.') })

export const booleano = z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean().optional())
