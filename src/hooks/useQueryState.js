import { useSearchParams } from 'react-router-dom'

/* Estado guardado na URL (?chave=valor), para filtros e abas sobreviverem a recarregar/compartilhar.
   - string: useQueryState('aba', 'Todas')
   - lista:  useQueryState('cat', ['a', 'b'], { list: true })
   O valor padrão não aparece na URL. */
export function useQueryState(key, fallback, { list = false } = {}) {
  const [params, setParams] = useSearchParams()
  const raw = params.get(key)
  const value = raw == null ? fallback : list ? (raw ? raw.split(',') : []) : raw

  const setValue = (next) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        const str = list ? next.join(',') : String(next)
        const def = list ? fallback.join(',') : String(fallback)
        if (str === def) p.delete(key)
        else p.set(key, str)
        return p
      },
      { replace: true },
    )
  }
  return [value, setValue]
}
