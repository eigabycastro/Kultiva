import { ChevronLeft } from 'lucide-react'
import { Button } from '../components/ui'
import './pedido-confirmado.css'

/* Termos de Uso / Política de Privacidade — o texto final vem do jurídico da equipe */
export default function Legal({ title }) {
  return (
    <div className="confirm">
      <div className="confirm__card" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
        <Button variant="ghost" size="s" icon={ChevronLeft} to="/login">
          Voltar ao login
        </Button>
        <h1 className="h1">{title}</h1>
        <p className="body-m t-secondary">O texto deste documento será publicado antes do lançamento da Kultiva.</p>
      </div>
    </div>
  )
}
