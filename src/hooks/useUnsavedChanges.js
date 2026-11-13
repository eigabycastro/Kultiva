import { useEffect } from 'react'
import { useConfirm } from '../components/Confirm'

/* Avisa antes de fechar/recarregar a aba com alterações pendentes (esse aviso é do navegador e não
   pode ser personalizado). `confirmLeave()` serve para as saídas dentro do app (Voltar, Cancelar)
   e usa a janela de confirmação da Kultiva: devolve uma Promise<boolean>. */
export function useUnsavedChanges(dirty) {
  const confirmar = useConfirm()
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  return async () =>
    !dirty ||
    confirmar({
      titulo: 'Sair sem salvar?',
      mensagem: 'O que você preencheu neste formulário vai se perder.',
      confirmar: 'Sair sem salvar',
      cancelar: 'Continuar editando',
      perigo: true,
    })
}
