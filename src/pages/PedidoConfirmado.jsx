import { useLocation } from 'react-router-dom'
import { Check, TrendingUp, Truck } from 'lucide-react'
import { Button } from '../components/ui'
import './pedido-confirmado.css'

const ROWS = [
  ['Pedido', '#KT-1042'],
  ['Quantidade', '120 maços'],
  ['Entrega', 'Qui, 09/10 · 7h–10h'],
  ['Frete', 'Incluso'],
]

export default function PedidoConfirmado() {
  const role = useLocation().state?.role ?? 'varejista'

  return (
    <div className="confirm">
      <div className="confirm__card">
        <span className="confirm__icon">
          <span>
            <Check size={32} strokeWidth={3} aria-hidden />
          </span>
        </span>
        <h1 className="h1">Pedido fechado!</h1>
        <p className="body-m t-secondary confirm__lead">
          {role === 'varejista'
            ? 'João Silva vai separar 120 maços de alface crespa para quinta-feira, 09/10.'
            : 'Supermercado Mais confirmou 120 maços de alface crespa para quinta-feira, 09/10.'}
        </p>

        <dl className="confirm__summary">
          {ROWS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="confirm__total">
            <dt>Total</dt>
            <dd>R$ 384,00</dd>
          </div>
        </dl>

        <div className="confirm__savings body-s">
          <TrendingUp size={16} aria-hidden />
          Você economizou ~R$ 96 vs. preço médio de atravessador.
        </div>

        <div className="confirm__actions">
          <Button block icon={Truck} to={`/${role}/pedidos`}>
            Ver meus pedidos
          </Button>
          <Button block variant="ghost" to={`/${role}/negociacoes`}>
            Voltar ao chat
          </Button>
        </div>
      </div>
    </div>
  )
}
