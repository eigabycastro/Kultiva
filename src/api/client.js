/* Cliente HTTP da API Kultiva: injeta o token JWT, converte JSON e padroniza erros. */
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const TOKEN_KEY = 'kultiva.token'

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token, lembrar = true) => {
    try {
      tokenStore.clear()
      ;(lembrar ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
    } catch {
      /* navegação privada: o token fica só em memória nesta aba */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignora */
    }
  },
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? 'Não foi possível falar com o servidor.')
    this.status = status
    this.details = body?.details ?? []
  }
  // { campo: mensagem } para mostrar embaixo de cada input
  get porCampo() {
    return Object.fromEntries(this.details.map((d) => [d.campo, d.mensagem]))
  }
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

export async function api(path, { method = 'GET', body, query, signal } = {}) {
  const qs = query
    ? '?' +
      new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    : ''
  const token = tokenStore.get()
  let res
  try {
    res = await fetch(`${BASE}/api${path}${qs === '?' ? '' : qs}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError(0, { error: 'Sem conexão com a API. Confira se o servidor está rodando.' })
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized()
    throw new ApiError(res.status, data)
  }
  return data
}
