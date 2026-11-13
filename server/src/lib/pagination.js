// Lê ?page e ?pageSize com limites seguros
export function paginacao(query, { padrao = 12, maximo = 50 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const pageSize = Math.min(maximo, Math.max(1, Number.parseInt(query.pageSize, 10) || padrao))
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

export function paginado(data, total, { page, pageSize }) {
  return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}
