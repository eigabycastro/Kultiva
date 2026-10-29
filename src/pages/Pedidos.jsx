import { ArrowRight, Calendar } from 'lucide-react'
import { useRole } from '../components/layout/AppLayout'
import { Avatar, Badge, Button, Card, ChipGroup, SearchInput } from '../components/ui'
import { StatCard } from '../components/cards'
import { ProduceThumb } from '../components/ProduceArt'
import { orderHistory, orderStatus, producerKpis, retailerKpis } from '../data/mock'
import { useQueryState } from '../hooks/useQueryState'
import './pages.css'
import './pedidos.css'
import Title from '../components/Title'

const FILTERS = ['Todos', 'Em andamento', 'Concluídos', 'Cancelados']
const MATCH = {
  'Em andamento': ['agendada', 'negociacao', 'confirmado', 'aguardando'],
  Concluídos: ['concluido'],
  Cancelados: ['cancelado'],
}

export default function Pedidos() {
  const role = useRole()
  const [filter, setFilter] = useQueryState('status', 'Todos')
  const rows = filter === 'Todos' ? orderHistory : orderHistory.filter((o) => MATCH[filter]?.includes(o.status))
  const kpis = role === 'varejista' ? retailerKpis : producerKpis
  const buyer = role === 'produtor'
  const who = buyer ? 'Comprador' : 'Produtor'
  const party = (o) => (buyer ? { name: o.buyer, initials: o.buyerInitials } : { name: o.seller, initials: o.initials })

  return (
    <div className="page">
      <div className="m-header only-mobile">
        <Title mobile className="h2">Meus pedidos</Title>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Histórico de pedidos</Title>
          <p className="body-m t-secondary">
            {buyer
              ? 'Todas as vendas ficam registradas, com preço praticado e comprador.'
              : 'Todas as compras ficam registradas, com preço pago e economia vs. atravessador.'}
          </p>
        </div>
        <Button variant="secondary" icon={ArrowRight}>
          Exportar CSV
        </Button>
      </header>

      <div className="kpi-grid only-desktop">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Mobile: 2 indicadores */}
      <div className="kpi-grid only-mobile">
        <StatCard icon="cart" label="Comprado em out." value="R$ 12,9 mil" delta="+18%" />
        <StatCard icon="trending" label="Economia estimada" value="R$ 2.140" delta="-14%" />
      </div>

      <div className="row-between orders-toolbar">
        <ChipGroup label="Status do pedido" options={FILTERS} value={filter} onChange={setFilter} className="orders-filters" />
        <SearchInput
          icon={Calendar}
          name="periodo"
          placeholder="01/10 – 31/10/2026"
          aria-label="Período dos pedidos"
          className="orders-date only-desktop"
        />
      </div>

      <Card className="panel panel--flush only-desktop">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>{who}</th>
                <th>Produto</th>
                <th className="num">Qtd.</th>
                <th className="num col-sec">Preço unit.</th>
                <th className="num">Total</th>
                <th className="num col-sec">Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="order-id">
                    {o.id}
                    <span className="cell-sub">{o.date}</span>
                  </td>
                  <td>
                    <span className="with-avatar">
                      <Avatar initials={party(o).initials} size={32} />
                      {party(o).name}
                    </span>
                  </td>
                  <td>
                    <span className="with-avatar">
                      <ProduceThumb kind={o.kind} size={24} radius={6} />
                      {o.product}
                    </span>
                  </td>
                  <td className="num">
                    {o.qty}
                    <span className="cell-sub">× {o.unitPrice}</span>
                  </td>
                  <td className="num col-sec">{o.unitPrice}</td>
                  <td className="strong num">{o.total}</td>
                  <td className="num col-sec">{o.date}</td>
                  <td>
                    <Badge tone={orderStatus[o.status].tone}>{orderStatus[o.status].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="empty body-m t-secondary">Nenhum pedido com este status no período.</p>}
      </Card>

      <div className="stack-8 only-mobile">
        {rows.length === 0 && <p className="empty body-m t-secondary">Nenhum pedido com este status no período.</p>}
        {rows.slice(0, 4).map((o) => (
          <Card key={o.id} className="order-card">
            <div className="order-card__head">
              <Avatar initials={party(o).initials} />
              <div className="list__text">
                <span className="label-m">{party(o).name}</span>
                <span className="body-s t-tertiary">
                  {o.id} · {o.date}
                </span>
              </div>
              <Badge tone={orderStatus[o.status].tone}>{orderStatus[o.status].label}</Badge>
            </div>
            <div className="order-card__foot">
              <ProduceThumb kind={o.kind} size={32} />
              <div className="list__text">
                <span className="label-s">{o.product}</span>
                <span className="body-s t-tertiary">
                  {o.qtyShort} × {o.unitPrice}
                </span>
              </div>
              <span className="label-m">{o.total}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
