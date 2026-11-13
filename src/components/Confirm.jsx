import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import { Button, IconTile } from './ui'
import './dialog.css'

/* Janela de confirmação no lugar do window.confirm / window.prompt.
   const confirmar = useConfirm()
   if (!(await confirmar({ titulo, mensagem, confirmar: 'Excluir', perigo: true }))) return
   Com `campo: { label }` devolve o texto digitado (string, pode ser '') ou null se cancelar. */
const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [opts, setOpts] = useState(null)
  const [texto, setTexto] = useState('')
  const resolver = useRef(null)
  const dialog = useRef(null)

  const confirmar = useCallback(
    (o) =>
      new Promise((resolve) => {
        resolver.current?.(o.campo ? null : false)
        resolver.current = resolve
        setTexto('')
        setOpts(o)
      }),
    [],
  )

  const fechar = (resultado) => {
    resolver.current?.(resultado)
    resolver.current = null
    dialog.current?.close()
    setOpts(null)
  }
  const cancelar = () => fechar(opts?.campo ? null : false)
  const ok = () => fechar(opts?.campo ? texto.trim() : true)

  useEffect(() => {
    if (opts && !dialog.current?.open) dialog.current?.showModal()
  }, [opts])

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      <dialog
        ref={dialog}
        className="kt-dialog"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-texto"
        onCancel={(e) => {
          e.preventDefault()
          cancelar()
        }}
        onClick={(e) => e.target === dialog.current && cancelar()}
      >
        {opts && (
          <form
            method="dialog"
            className="kt-dialog__box"
            onSubmit={(e) => {
              e.preventDefault()
              ok()
            }}
          >
            <IconTile icon={opts.perigo ? AlertTriangle : HelpCircle} tone={opts.perigo ? 'danger' : 'brand'} size={44} iconSize={22} />
            <div className="kt-dialog__body">
              <h2 id="confirm-titulo" className="h3">
                {opts.titulo}
              </h2>
              {opts.mensagem && (
                <p id="confirm-texto" className="body-m t-secondary">
                  {opts.mensagem}
                </p>
              )}
              {opts.campo && (
                <label className="field">
                  <span className="field__label">{opts.campo.label}</span>
                  <span className="field__control field__control--area">
                    <textarea
                      className="field__input"
                      rows={3}
                      maxLength={300}
                      autoFocus
                      placeholder={opts.campo.placeholder}
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                    />
                  </span>
                </label>
              )}
            </div>
            <div className="kt-dialog__actions">
              <Button type="button" variant="secondary" onClick={cancelar} autoFocus={!opts.campo && opts.perigo}>
                {opts.cancelar ?? 'Voltar'}
              </Button>
              <Button type="submit" variant={opts.perigo ? 'destructive' : 'primary'} autoFocus={!opts.campo && !opts.perigo}>
                {opts.confirmar ?? 'Confirmar'}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}
