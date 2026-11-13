import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, History, Plus, Sparkle, Sparkles } from 'lucide-react'
import { Avatar, Badge, Button, Card, IconTile } from '../../components/ui'
import { StatCard } from '../../components/cards'
import { LoadState } from '../../components/Feedback'
import { ProduceThumb } from '../../components/ProduceArt'
import { MobileBell } from '../../components/layout/AppLayout'
import { useAuth } from '../../auth/AuthContext'
import { useApi } from '../../hooks/useApi'
import { formatBRL, formatBRLCompact, formatDay, formatQty } from '../../utils/format'
import { ORDER_STATUS } from '../../utils/status'
import '../pages.css'
import Title from '../../components/Title'

export function ForecastChart({ bars, compact, format = formatBRL }) {
  const max = Math.max(...bars.map((b) => b.price), 1)
  return (
    <div className={compact ? 'chart chart--compact' : 'chart'}>
      {bars.map((b) => (
        <div key={b.date} className="chart__col">
          {!compact && <span className="chart__value">{format(b.price)}</span>}
          <span
            className={b.forecast ? 'chart__bar chart__bar--forecast' : 'chart__bar'}
            style={{ height: Math.max(2, Math.round((b.price / max) * (compact ? 64 : 160))) }}
            title={`${b.date}: ${formatBRL(b.price)}${b.forecast ? ' (projeção)' : ''}`}
          />
          {!compact && <span className="chart__label">{b.date}</span>}
        </div>
      ))}
    </div>
  )
}

const delta = (v) => (v == null ? '—' : `${v > 0 ? '+' : ''}${v}%`)
const itemsLabel = (p) => p.itens.map((i) => i.produto).join(', ')
const qtyLabel = (p) => p.itens.map((i) => formatQty(i.quantidade, i.unidade)).join(' + ')

export default function Dashboard() {
  const { usuario } = useAuth()
  const { data: d, error, loading, reload } = useApi('/dashboard')
  const demands = useApi('/demandas', { pageSize: 5 })
  const forecast = useApi('/previsao').data?.previsao

  const kpis = d && [
    { icon: 'chart', label: 'Vendas do mês', value: formatBRL(d.totalMes), mobileValue: formatBRLCompact(d.totalMes), delta: delta(d.variacaoMes), tone: d.variacaoMes < 0 ? 'warning' : 'success', note: 'vs. mês anterior' },
    { icon: 'truck', label: 'Pedidos ativos', value: String(d.pedidosAtivos), delta: `${d.pedidosPendentes} pendentes`, tone: d.pedidosPendentes ? 'warning' : 'success', note: 'aguardando você' },
    { icon: 'package', label: 'Ofertas ativas', value: String(d.ofertasAtivas), delta: d.ofertasAcabando.length ? `${d.ofertasAcabando.length} acabando` : 'estoque ok', tone: d.ofertasAcabando.length ? 'warning' : 'success', note: d.ofertasAcabando.length ? 'reabasteça o estoque' : '' },
    { icon: 'user', label: 'Clientes', mobileLabel: 'Clientes', value: String(d.parceiros), delta: `${d.pedidosEntregues} entregas`, tone: 'success', note: 'no total' },
  ]
  const weekly = d?.porSemana.map((s) => ({ date: formatDay(s.semana), price: s.total })) ?? []
  const nearby = demands.data?.data ?? []

  return (
    <div className="page">
      {/* Mobile: cabeçalho do app */}
      <div className="m-header only-mobile">
        <div>
          <Title mobile className="h2">Visão geral</Title>
          <p className="body-s t-tertiary">
            {usuario.organizacao} · {usuario.cidade}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <MobileBell />
          <Avatar initials={usuario.iniciais} />
        </div>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Visão geral</Title>
          <p className="body-m t-secondary">
            {usuario.organizacao} · {usuario.cidade}/{usuario.uf}.{' '}
            {d?.pedidosPendentes
              ? `Você tem ${d.pedidosPendentes} ${d.pedidosPendentes === 1 ? 'pedido esperando' : 'pedidos esperando'} sua resposta.`
              : 'Nenhum pedido esperando resposta.'}
          </p>
        </div>
        <div className="page-header__actions">
          {d?.pedidosPendentes > 0 && (
            <Button variant="secondary" icon={History} to="/produtor/pedidos?grupo=andamento">
              Responder pedidos
            </Button>
          )}
          <Button variant="secondary" icon={Calendar} to="/produtor/calendario">
            Calendário de safra
          </Button>
          <Button icon={Plus} to="/produtor/produtos/nova">
            Cadastrar oferta
          </Button>
        </div>
      </header>

      <LoadState loading={loading} error={error} onRetry={reload} empty={!d} skeleton={2}>
        <div className="kpi-grid">{kpis?.map((k) => <StatCard key={k.label} {...k} />)}</div>
      </LoadState>

      <div className="dash-row">
        <Card className="panel forecast">
          <div className="panel__head">
            <div>
              <h2 className="h3">Vendas por semana</h2>
              <p className="body-s t-tertiary">Pedidos aceitos nas últimas 8 semanas (R$)</p>
            </div>
            <Badge tone="success">{d ? formatBRL(weekly.reduce((s, b) => s + b.price, 0)) : '—'}</Badge>
          </div>
          {d && (
            <>
              <div className="only-desktop">
                <ForecastChart bars={weekly} format={formatBRLCompact} />
              </div>
              <div className="only-mobile">
                <ForecastChart bars={weekly} compact />
              </div>
            </>
          )}
          {d?.porProduto.length > 0 && (
            <ul className="list">
              {d.porProduto.slice(0, 3).map((p) => (
                <li key={p.produto} className="list__row">
                  <ProduceThumb kind={p.kind} size={32} />
                  <div className="list__text">
                    <span className="label-m">{p.produto}</span>
                    <span className="body-s t-tertiary">
                      {formatQty(p.quantidade, p.unidade)} · preço médio {formatBRL(p.precoMedio)}
                    </span>
                  </div>
                  <span className="label-m num">{formatBRL(p.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="panel nearby only-desktop">
          <div>
            <h2 className="h3">Procura-se perto de você</h2>
            <p className="body-s t-tertiary">Demandas abertas que alcançam suas propriedades</p>
          </div>
          <LoadState loading={demands.loading} error={demands.error} empty={nearby.length === 0} emptyText="Nenhuma demanda aberta na sua região agora.">
            <ul className="list">
              {nearby.map((x) => (
                <li key={x.id} className="list__row">
                  <ProduceThumb kind={x.kind} size={40} />
                  <div className="list__text">
                    <span className="label-m">
                      {x.produto} · {formatQty(x.quantidade, x.unidade)}
                    </span>
                    <span className="body-s t-tertiary">
                      {x.varejista.organizacao} · {Math.round(x.distanciaKm)} km · até {formatDay(x.prazo)}
                    </span>
                  </div>
                  <Badge tone={x.compativel ? 'success' : x.urgente ? 'warning' : 'info'}>{x.compativel ? 'Compatível' : x.urgente ? 'Urgente' : 'Aberta'}</Badge>
                </li>
              ))}
            </ul>
          </LoadState>
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
          {nearby.slice(0, 2).map((x) => (
            <Card key={x.id} className="m-row-card">
              <ProduceThumb kind={x.kind} size={36} />
              <div className="list__text">
                <span className="label-m">
                  {x.produto} · {formatQty(x.quantidade, x.unidade)}
                </span>
                <span className="body-s t-tertiary">
                  {x.varejista.organizacao} · {Math.round(x.distanciaKm)} km
                </span>
              </div>
              <Badge tone={x.compativel ? 'success' : 'info'}>{x.compativel ? 'Compatível' : 'Aberta'}</Badge>
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
        <LoadState loading={loading} empty={!d?.pedidosRecentes.length} emptyText="Os pedidos que você receber aparecem aqui.">
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
                {d?.pedidosRecentes.map((p) => (
                  <tr key={p.id}>
                    <td className="order-id">
                      <Link to={`/produtor/pedidos?q=${encodeURIComponent(p.codigo)}`}>{p.codigo}</Link>
                    </td>
                    <td>
                      <span className="with-avatar">
                        <Avatar initials={p.varejista.iniciais} size={32} />
                        {p.varejista.organizacao}
                      </span>
                    </td>
                    <td>
                      <span className="with-avatar">
                        <ProduceThumb kind={p.itens[0]?.kind} size={24} radius={6} />
                        {itemsLabel(p)}
                      </span>
                    </td>
                    <td className="num">{qtyLabel(p)}</td>
                    <td className="strong num">{formatBRL(p.total)}</td>
                    <td>
                      <Badge tone={ORDER_STATUS[p.status].tone}>{ORDER_STATUS[p.status].short}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LoadState>
      </Card>

      {forecast?.historico && (
        <Card className="panel forecast" id="previsao">
          <div className="panel__head">
            <div>
              <h2 className="h3">Previsão de preço — {forecast.produto}</h2>
              <p className="body-s t-tertiary">R$/{forecast.unidade} · 6 semanas de vendas na região + projeção de 3 semanas</p>
            </div>
            <Badge tone="warning" icon={Sparkle}>
              Projeção
            </Badge>
          </div>
          <div className="only-desktop">
            <ForecastChart
              bars={[
                ...forecast.historico.map((h) => ({ date: formatDay(h.semana), price: h.preco })),
                ...forecast.projecao.map((h) => ({ date: formatDay(h.semana), price: h.preco, forecast: true })),
              ]}
            />
          </div>
          <div className="ai-tip">
            <IconTile icon={Sparkles} tone="accent" className="only-desktop" />
            <div>
              <p className="label-m">{forecast.dicas[0]}</p>
              <Link to={`/produtor/previsao?produto=${forecast.produtoId}`} className="body-s t-brand">
                Ver previsão completa
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
