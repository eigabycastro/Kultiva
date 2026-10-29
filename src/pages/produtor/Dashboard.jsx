import { Link } from 'react-router-dom'
import { ArrowRight, Bell, Calendar, History, Plus, Sparkle, Sparkles } from 'lucide-react'
import { Avatar, Badge, Button, Card, IconTile } from '../../components/ui'
import { StatCard } from '../../components/cards'
import { ProduceThumb } from '../../components/ProduceArt'
import { nearbyDemands, orderStatus, priceForecast, producerKpis, recentOrders, users } from '../../data/mock'
import { formatBRL } from '../../utils/format'
import '../pages.css'
import Title from '../../components/Title'

export function ForecastChart({ bars, compact }) {
  const max = Math.max(...bars.map((b) => b.price))
  return (
    <div className={compact ? 'chart chart--compact' : 'chart'}>
      {bars.map((b) => (
        <div key={b.date} className="chart__col">
          {!compact && <span className="chart__value">{formatBRL(b.price)}</span>}
          <span
            className={b.forecast ? 'chart__bar chart__bar--forecast' : 'chart__bar'}
            style={{ height: Math.round((b.price / max) * (compact ? 64 : 160)) }}
            title={`${b.date}: ${formatBRL(b.price)}${b.forecast ? ' (projeção)' : ''}`}
          />
          {!compact && <span className="chart__label">{b.date}</span>}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const user = users.produtor

  return (
    <div className="page">
      {/* Mobile: cabeçalho do app */}
      <div className="m-header only-mobile">
        <div>
          <Title mobile className="h2">Visão geral</Title>
          <p className="body-s t-tertiary">
            {user.farm} · {user.city}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/produtor/notificacoes" className="icon-btn topbar__bell" aria-label="Notificações (novas)">
            <Bell size={20} aria-hidden />
            <span className="topbar__dot" />
          </Link>
          <Avatar initials={user.initials} />
        </div>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Visão geral</Title>
          <p className="body-m t-secondary">
            {user.farm} · semana de 06 a 12/10. O tomate deve chegar a R$ 6,10/kg entre 13 e 20/10: vale programar a
            colheita de 300 kg para essa janela.
          </p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" icon={Calendar} to="/produtor/calendario">
            Calendário de safra
          </Button>
          <Button icon={Plus} to="/produtor/produtos/nova">
            Cadastrar oferta
          </Button>
        </div>
      </header>

      <div className="kpi-grid">
        {producerKpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="dash-row">
        <Card className="panel forecast" id="previsao">
          <div className="panel__head">
            <div>
              <h2 className="h3">
                <span className="only-desktop">Previsão de preço — {priceForecast.product}</span>
                <span className="only-mobile">Previsão — {priceForecast.product}</span>
              </h2>
              <p className="body-s t-tertiary">
                <span className="only-desktop">R$/kg · histórico das últimas 6 semanas + projeção de 3 semanas</span>
                <span className="only-mobile">R$/kg · 6 semanas + projeção</span>
              </p>
            </div>
            <Badge tone="warning" icon={Sparkle}>
              <span className="only-desktop">Previsão IA</span>
              <span className="only-mobile">IA</span>
            </Badge>
          </div>
          <div className="only-desktop">
            <ForecastChart bars={priceForecast.bars} />
          </div>
          <div className="only-mobile">
            <ForecastChart bars={priceForecast.bars} compact />
          </div>
          <div className="legend body-s t-secondary only-desktop">
            <span>
              <i className="legend__dot" style={{ background: 'var(--bg-brand-hover)' }} />
              Preço praticado
            </span>
            <span>
              <i className="legend__dot" style={{ background: 'var(--bg-accent)' }} />
              Projeção da IA
            </span>
          </div>
          <div className="ai-tip">
            <IconTile icon={Sparkles} tone="accent" className="only-desktop" />
            <Sparkles size={16} className="only-mobile" aria-hidden />
            <div>
              <p className="label-m only-desktop">Melhor janela de venda: 13 a 20/out</p>
              <p className="body-s only-desktop">
                Preço estimado de R$ 6,10/kg (+17%). Programe a colheita de 300 kg para essa semana.
              </p>
              <p className="label-s only-mobile">Melhor janela: 13–20/out · R$ 6,10/kg (+17%)</p>
            </div>
          </div>
        </Card>

        <Card className="panel nearby only-desktop">
          <div>
            <h2 className="h3">Procura-se perto de você</h2>
            <p className="body-s t-tertiary">Demandas abertas no seu raio de 30 km</p>
          </div>
          <ul className="list">
            {nearbyDemands.map((d) => (
              <li key={d.id} className="list__row">
                <ProduceThumb kind={d.kind} size={40} />
                <div className="list__text">
                  <span className="label-m">{d.short}</span>
                  <span className="body-s t-tertiary">{d.mobileSubtitle}</span>
                </div>
                <Badge tone={d.tone}>{d.status}</Badge>
              </li>
            ))}
          </ul>
          <Button variant="secondary" block icon={ArrowRight} to="/produtor/procura-se" className="nearby__cta">
            Ver todas as demandas
          </Button>
        </Card>
      </div>

      {/* Mobile: Procura-se */}
      <section className="only-mobile">
        <div className="m-section-head">
          <h2 className="h4">Procura-se perto de você</h2>
          <Link to="/produtor/procura-se" className="label-s t-brand">
            Ver todas
          </Link>
        </div>
        <div className="stack-8">
          {nearbyDemands.slice(0, 2).map((d) => (
            <Card key={d.id} className="m-row-card">
              <ProduceThumb kind={d.kind} size={36} />
              <div className="list__text">
                <span className="label-m">{d.short}</span>
                <span className="body-s t-tertiary">{d.mobileSubtitle}</span>
              </div>
              <Badge tone={d.tone}>{d.status}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <Card className="panel panel--flush only-desktop">
        <div className="panel__head panel__head--pad">
          <h2 className="h3">Pedidos recentes</h2>
          <Button variant="ghost" size="s" icon={History} to="/produtor/pedidos">
            Ver histórico
          </Button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Comprador</th>
                <th>Produto</th>
                <th className="num">Quantidade</th>
                <th className="num">Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="order-id">{o.id}</td>
                  <td>
                    <span className="with-avatar">
                      <Avatar initials={o.initials} size={32} />
                      {o.buyer}
                    </span>
                  </td>
                  <td>
                    <span className="with-avatar">
                      <ProduceThumb kind={o.kind} size={24} radius={6} />
                      {o.product}
                    </span>
                  </td>
                  <td className="num">{o.qty}</td>
                  <td className="strong num">{o.value}</td>
                  <td>
                    <Badge tone={orderStatus[o.status].tone}>{orderStatus[o.status].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
