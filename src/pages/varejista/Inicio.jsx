import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, Search } from 'lucide-react'
import { Badge, Button, Card } from '../../components/ui'
import { ProductCard, StatCard } from '../../components/cards'
import { LoadState } from '../../components/Feedback'
import { ProduceThumb } from '../../components/ProduceArt'
import { useAuth } from '../../auth/AuthContext'
import { useApi } from '../../hooks/useApi'
import { formatBRL, formatBRLCompact, formatDay, formatQty } from '../../utils/format'
import { ORDER_STATUS } from '../../utils/status'
import { useFavoriteToggle } from './Buscar'
import '../pages.css'
import './buscar.css'
import './inicio.css'

export default function Inicio() {
  const { usuario } = useAuth()
  const dash = useApi('/dashboard')
  const demands = useApi('/demandas', { status: 'ABERTA', pageSize: 3 })
  const fresh = useApi('/ofertas', { raioKm: usuario.raioKm, ordenar: 'distancia', pageSize: 4, colheita: 'semana' })
  const toggleFav = useFavoriteToggle(fresh.setData)
  const d = dash.data
  const myDemands = demands.data?.data ?? []
  const products = fresh.data?.data ?? []

  const kpis = d && [
    { icon: 'cart', label: 'Comprado no mês', value: formatBRL(d.totalMes), mobileValue: formatBRLCompact(d.totalMes), delta: d.variacaoMes == null ? '—' : `${d.variacaoMes > 0 ? '+' : ''}${d.variacaoMes}%`, tone: d.variacaoMes > 0 ? 'warning' : 'success', note: 'vs. mês anterior' },
    { icon: 'truck', label: 'Pedidos em andamento', value: String(d.pedidosAtivos), delta: `${d.pedidosPendentes} aguardando`, tone: 'success', note: 'o produtor' },
    { icon: 'trending', label: 'Procura-se abertos', value: String(d.demandasAbertas), delta: 'demandas', tone: 'success', note: 'publicadas' },
    { icon: 'user', label: 'Produtores parceiros', value: String(d.parceiros), delta: `${d.pedidosEntregues} entregas`, tone: 'success', note: 'recebidas' },
  ]

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Início</h1>
          <p className="body-m t-secondary">
            {usuario.organizacao} · {fresh.data ? `${fresh.data.total} ofertas colhidas nesta semana a até ${usuario.raioKm} km.` : 'Buscando ofertas perto de você…'}
          </p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" icon={Megaphone} to="/varejista/procura-se/nova">
            Publicar Procura-se
          </Button>
          <Button icon={Search} to="/varejista/buscar">
            Buscar produtos
          </Button>
        </div>
      </header>

      <LoadState loading={dash.loading} error={dash.error} onRetry={dash.reload} empty={!d} skeleton={2}>
        <div className="kpi-grid">{kpis?.map((k) => <StatCard key={k.label} {...k} />)}</div>
      </LoadState>

      <div className="home-row">
        <Card className="panel">
          <div className="panel__head">
            <h2 className="h3">Pedidos recentes</h2>
            <Link to="/varejista/pedidos" className="label-s t-brand">
              Ver todos
            </Link>
          </div>
          <LoadState loading={dash.loading} empty={!d?.pedidosRecentes.length} emptyText="Você ainda não fez pedidos. Que tal buscar produtos da região?">
            <ul className="list">
              {d?.pedidosRecentes.slice(0, 4).map((p) => (
                <li key={p.id} className="list__row">
                  <ProduceThumb kind={p.itens[0]?.kind} size={40} />
                  <div className="list__text">
                    <span className="label-m">
                      {p.itens.map((i) => i.produto).join(', ')} · {p.itens.map((i) => formatQty(i.quantidade, i.unidade)).join(' + ')}
                    </span>
                    <span className="body-s t-tertiary">
                      {p.produtor.organizacao} · {p.codigo} · {formatDay(p.criadoEm)}
                    </span>
                  </div>
                  <span className="label-m num">{formatBRL(p.total)}</span>
                  <Badge tone={ORDER_STATUS[p.status].tone}>{ORDER_STATUS[p.status].short}</Badge>
                </li>
              ))}
            </ul>
          </LoadState>
        </Card>

        <Card className="panel">
          <div className="panel__head">
            <h2 className="h3">Suas demandas Procura-se</h2>
            <Link to="/varejista/procura-se/nova" className="label-s t-brand">
              Nova demanda
            </Link>
          </div>
          <LoadState loading={demands.loading} empty={myDemands.length === 0} emptyText="Nenhuma demanda aberta.">
            <ul className="list">
              {myDemands.map((x) => (
                <li key={x.id} className="list__row">
                  <ProduceThumb kind={x.kind} size={40} />
                  <div className="list__text">
                    <span className="label-m">
                      {formatQty(x.quantidade, x.unidade)} de {x.produto}
                    </span>
                    <span className="body-s t-tertiary">
                      até {formatDay(x.prazo)}
                      {x.melhorPreco != null && ` · a partir de ${formatBRL(x.melhorPreco)}/${x.unidade}`}
                    </span>
                  </div>
                  <span className="offers-count">
                    <strong>{x.produtoresCompativeis}</strong> {x.produtoresCompativeis === 1 ? 'produtor' : 'produtores'}
                  </span>
                </li>
              ))}
            </ul>
          </LoadState>
          <Button variant="secondary" block iconRight={ArrowRight} to="/varejista/procura-se">
            Gerenciar demandas
          </Button>
        </Card>
      </div>

      <section className="stack-16">
        <div className="panel__head">
          <h2 className="h3">Colhido nesta semana perto de você</h2>
          <Link to="/varejista/buscar?colheita=semana" className="label-s t-brand">
            Ver todos
          </Link>
        </div>
        <LoadState loading={fresh.loading} error={fresh.error} empty={products.length === 0} emptyText="Nenhuma colheita recente no seu raio.">
          <div className="product-grid home-products">
            {products.map((o) => (
              <ProductCard key={o.id} product={o} to={`/varejista/produto/${o.id}`} onToggleFav={toggleFav} />
            ))}
          </div>
        </LoadState>
      </section>
    </div>
  )
}
