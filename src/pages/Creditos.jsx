import { ChevronLeft } from 'lucide-react'
import { Button } from '../components/ui'
import credits from '../assets/produce/credits.json'
import './pedido-confirmado.css'

const NAMES = { alface: 'Alface', tomate: 'Tomate', morango: 'Morango', couve: 'Couve', cenoura: 'Cenoura', banana: 'Banana' }

/* Créditos exigidos pelas licenças CC BY / CC BY-SA das fotos de exemplo */
export default function Creditos() {
  return (
    <div className="confirm">
      <div className="confirm__card" style={{ alignItems: 'flex-start', textAlign: 'left', maxWidth: 640 }}>
        <Button variant="ghost" size="s" icon={ChevronLeft} to="/login">
          Voltar
        </Button>
        <h1 className="h1">Créditos das fotos</h1>
        <p className="body-m t-secondary">
          As fotos de produtos são exemplos do Wikimedia Commons, usadas sob licenças livres. Elas mostram os alimentos,
          não as ofertas de um produtor específico.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {credits.map((c) => {
            const key = c.file.split('/').pop().replace('.jpg', '')
            return (
              <li key={c.ref} className="body-s">
                <strong>{NAMES[key] ?? key}</strong>: “{c.title}”, por {c.creator}, {c.license} via {c.via}.{' '}
                <a href={c.page} target="_blank" rel="noreferrer" className="t-brand">
                  Ver original
                </a>{' '}
                ·{' '}
                <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="t-brand">
                  Licença
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
