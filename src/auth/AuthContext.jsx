import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, setUnauthorizedHandler, tokenStore } from '../api/client'

const AuthContext = createContext(null)

// Área de cada perfil no front
export const AREA = { PRODUTOR: 'produtor', VAREJISTA: 'varejista', ADMIN: 'admin' }
export const homeDe = (usuario) => (usuario?.perfil === 'ADMIN' ? '/admin/usuarios' : `/${AREA[usuario?.perfil] ?? ''}`)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(() => Boolean(tokenStore.get()))

  const sair = useCallback(async () => {
    try {
      if (tokenStore.get()) await api('/auth/logout', { method: 'POST' })
    } catch {
      /* o token já pode estar inválido: segue o logout local */
    }
    tokenStore.clear()
    setUsuario(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear()
      setUsuario(null)
    })
    if (!tokenStore.get()) return
    api('/auth/me')
      .then(setUsuario)
      .catch(() => tokenStore.clear())
      .finally(() => setCarregando(false))
  }, [])

  const entrar = useCallback(async (email, senha, lembrar = true) => {
    const { token, usuario: u } = await api('/auth/login', { method: 'POST', body: { email, senha } })
    tokenStore.set(token, lembrar)
    setUsuario(u)
    return u
  }, [])

  const cadastrar = useCallback(async (dados) => {
    const { token, usuario: u } = await api('/auth/cadastro', { method: 'POST', body: dados })
    tokenStore.set(token)
    setUsuario(u)
    return u
  }, [])

  const valor = useMemo(
    () => ({ usuario, setUsuario, carregando, entrar, cadastrar, sair, area: AREA[usuario?.perfil] }),
    [usuario, carregando, entrar, cadastrar, sair],
  )
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

/* Rota protegida: sem login vai para /login; com perfil errado vai para a área do próprio perfil */
export function RequireAuth({ perfis, children }) {
  const { usuario, carregando } = useAuth()
  const location = useLocation()
  if (carregando) {
    return (
      <div className="boot" role="status">
        Carregando…
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname + location.search }} />
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to={homeDe(usuario)} replace />
  return children
}
