import { Link } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import { Badge, Button, Card, cx } from '../../components/ui'
import { ProduceThumb } from '../../components/ProduceArt'
import { myOffers, offerStatus } from '../../data/mock'
import { useQueryState } from '../../hooks/useQueryState'
import '../pages.css'
import './meus-produtos.css'

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'ativa', label: 'Ativos' },
  { key: 'acabando', label: 'Acabando' },
  { key: 'pausada', label: 'Pausados' },
  { key: 'rascunho', label: 'Rascunhos' },
]

function StockBar({ stock, total, unit }) {
  if (!total) return <span className="t-tertiary">—</span>
  const pct = Math.round((stock / total) * 100)
  return (
    <div className="stock-cell">
      <span className="stock-cell__text">
        <strong>{stock}</strong> de {total} {unit}
      </span>
      <span className="stock-cell__bar" aria-hidden>
        <span className={cx(pct <= 15 && 'is-low')} style={{ width: `${pct}%` }} />
      </span>
    </div>
  )
}

export default function MeusProdutos() {
  const [filter, setFilter] = useQueryState('status', 'todos')
  const count = (k) => (k === 'todos' ? myOffers.length : myOffers.filter((o) => o.status === k).length)
  const rows = filter === 'todos' ? myOffers : myOffers.filter((o) => o.status === filter)
  const low = myOffers.filter((o) => o.status === 'acabando')

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Meus produtos</h1>
          <p className="body-m t-secondary">
            {low.length} ofertas estão acabando: {low.map((o) => o.name.toLowerCase()).join(' e ')}. Atualize o estoque
            ou pause para não receber pedidos que não pode atender.
          </p>
        </div>
        <Button icon={Plus} to="/produtor/produtos/nova">
          Cadastrar oferta
        </Button>
      </header>

      <div className="count-cards" role="group" aria-label="Filtrar por situação">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={cx('count-card', filter === f.key && 'is-active')}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            <span className="count-card__label">{f.label}</span>
            <span className="count-card__value">{count(f.key)}</span>
          </button>
        ))}
      </div>

      <Card className="panel panel--flush">
        <div className="table-wrap">
          <table className="table offers-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="num">Preço</th>
                <th className="col-m-hide">Estoque em tempo real</th>
                <th className="col-m-hide">Situação</th>
                <th className="num col-sec">Visualizações</th>
                <th className="num col-sec">Negociações</th>
                <th className="col-m-hide">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="with-avatar">
                      <ProduceThumb kind={o.kind} size={40} radius={8} />
                      <span className="list__text">
                        <span className="label-m">{o.name}</span>
                        <span className="body-s t-tertiary">
                          {o.variety} · {o.harvest}
                        </span>
                        <span className="body-s offer-m-line">
                          {o.total ? `${o.stock} de ${o.total} em estoque` : 'Sem estoque'} · {offerStatus[o.status].label}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="num strong">
                    {o.price}
                    <span className="t-tertiary"> /{o.unit}</span>
                  </td>
                  <td className="col-m-hide">
                    <StockBar stock={o.stock} total={o.total} unit={o.unit === 'caixa' ? 'cx' : o.unit === 'maço' ? 'maços' : o.unit} />
                  </td>
                  <td className="col-m-hide">
                    <Badge tone={offerStatus[o.status].tone}>{offerStatus[o.status].label}</Badge>
                  </td>
                  <td className="num col-sec">{o.views}</td>
                  <td className="num col-sec">{o.chats}</td>
                  <td className="actions-cell col-m-hide">
                    <Link to="/produtor/produtos/nova" className="icon-btn" aria-label={`Editar ${o.name}`} title="Editar">
                      <Pencil size={16} aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="empty body-m t-secondary">Nenhuma oferta nesta situação.</p>}
      </Card>
    </div>
  )
}
