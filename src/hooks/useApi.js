import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'

/* Busca dados da API e refaz quando `path` ou `query` mudam.
   const { data, error, loading, reload, setData } = useApi('/ofertas', { q: 'tomate' }) */
export function useApi(path, query, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled })
  const key = JSON.stringify([path, query])
  const ctrl = useRef(null)

  const load = useCallback(() => {
    if (!enabled || !path) return
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setState((s) => ({ ...s, loading: true, error: null }))
    api(path, { query, signal: c.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, error, loading: false }))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  useEffect(() => {
    load()
    return () => ctrl.current?.abort()
  }, [load])

  const setData = (fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn }))
  return { ...state, reload: load, setData }
}
