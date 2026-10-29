import { useEffect } from 'react'

const MESSAGE = 'Você tem alterações não salvas. Sair mesmo assim?'

/* Avisa antes de fechar/recarregar a aba com alterações pendentes.
   `confirmLeave()` serve para as saídas dentro do app (Voltar, Cancelar). */
export function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  return () => !dirty || window.confirm(MESSAGE)
}
