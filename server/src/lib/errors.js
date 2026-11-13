// Erro com status HTTP: lançado em qualquer rota/serviço e tratado pelo middleware de erros
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const badRequest = (msg, details) => new HttpError(400, msg, details)
export const unauthorized = (msg = 'Faça login para continuar.') => new HttpError(401, msg)
export const forbidden = (msg = 'Seu perfil não tem permissão para esta ação.') => new HttpError(403, msg)
export const notFound = (msg = 'Registro não encontrado.') => new HttpError(404, msg)
export const conflict = (msg) => new HttpError(409, msg)
