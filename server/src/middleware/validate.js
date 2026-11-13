import { badRequest } from '../lib/errors.js'

// Valida req.body / req.query / req.params com um schema Zod e substitui pelos dados já convertidos
export const validar =
  (schema, origem = 'body') =>
  (req, _res, next) => {
    // na query string, parâmetro vazio (?raioKm=) conta como não informado
    const entrada =
      origem === 'query' ? Object.fromEntries(Object.entries(req.query ?? {}).filter(([, v]) => v !== '')) : (req[origem] ?? {})
    const r = schema.safeParse(entrada)
    if (!r.success) {
      const details = r.error.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message }))
      throw badRequest(details[0]?.mensagem ?? 'Dados inválidos.', details)
    }
    if (origem === 'query') req.filtros = r.data
    else req[origem] = r.data
    next()
  }
