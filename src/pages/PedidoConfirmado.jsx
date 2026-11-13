import { Navigate, useLocation } from 'react-router-dom'
import { Clock, Search, Truck } from 'lucide-react'
import { Button } from '../components/ui'
import { formatBRL, formatQty, formatWeekday } from '../utils/format'
import './pedido-confirmado.css'

// Tela exibida logo depois que o varejista envia um pedido (recebe o pedido criado via navigation state)
export default function PedidoConfirmado() {
  const { state } = useLocation()
  const pedido = state?.pedido
  if (!pedido) return <Navigate to="/varejista/pedidos" replace />

  const rows = [
    ['Pedido', pedido.codigo],
    ...pedido.itens.map((i) => [i.produto, `${formatQty(i.quantidade, i.unidade)} × ${formatBRL(i.precoUnitario)}`]),
    ['Entrega', pedido.dataEntrega ? formatWeekday(pedido.dataEntrega) : 'A combinar'],
    ['Status', 'Aguardando o produtor'],
  ]

  return (
    <div className="confirm">
      <div className="confirm__card">
        <span className="confirm__icon">
          <span>
            <Clock size={32} strokeWidth={2.5} aria-hidden />
          </span>
        </span>
        <h1 className="h1">Pedido enviado!</h1>
        <p className="body-m t-secondary confirm__lead">
          {pedido.produtor.organizacao} foi avisado e vai aceitar ou recusar. Quando aceitar, o estoque é reservado para você.
        </p>

        <dl className="confirm__summary">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="confirm__total">
            <dt>Total</dt>
            <dd>{formatBRL(pedido.total)}</dd>
          </div>
        </dl>

        <div className="confirm__actions">
          <Button block icon={Truck} to="/varejista/pedidos">
            Ver meus pedidos
          </Button>
          <Button block variant="ghost" icon={Search} to="/varejista/buscar">
            Continuar comprando
          </Button>
        </div>
      </div>
    </div>
  )
}
