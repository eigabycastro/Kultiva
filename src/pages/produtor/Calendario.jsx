import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, ChevronLeft, ChevronRight, Plus, Sprout, Truck } from 'lucide-react'
import { Button, Card, IconTile, cx } from '../../components/ui'
import { LoadState } from '../../components/Feedback'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import { formatDay, formatWeekday } from '../../utils/format'
import '../pages.css'
import './calendario.css'
import Title from '../../components/Title'

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const LEGEND = [
  ['colheita', 'Colheita'],
  ['janela', 'Fim da oferta'],
  ['entrega', 'Entrega de pedido'],
]
const LOOK = {
  colheita: { icon: Sprout, tone: 'solid' },
  janela: { icon: CalendarClock, tone: 'accent' },
  entrega: { icon: Truck, tone: 'info' },
}
const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const pad = (n) => String(n).padStart(2, '0')
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export default function Calendario() {
  const navigate = useNavigate()
  const [month, setMonth] = useQueryState('mes', keyOf(new Date()))
  const { data, error, loading, reload } = useApi('/calendario', { mes: month })
  const [y, m] = month.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()
  const todayKey = dayKey(new Date())
  const shift = (n) => setMonth(keyOf(new Date(y, m - 1 + n, 1)))

  // eventos agrupados por dia (yyyy-mm-dd no fuso local)
  const byDay = {}
  for (const e of data?.eventos ?? []) (byDay[dayKey(new Date(e.data))] ??= []).push(e)

  const cells = [
    ...Array.from({ length: first.getDay() }, (_, i) => ({ day: new Date(y, m - 1, i - first.getDay() + 1).getDate(), muted: true })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, key: dayKey(new Date(y, m - 1, i + 1)) })),
  ]
  const weeks = data?.pedidosPorSemana ?? []
  const maxWeek = Math.max(1, ...weeks.map((w) => w.pedidos))
  const title = monthName.format(first).replace(/^./, (c) => c.toUpperCase())

  return (
    <div className="page">
      <div className="m-topbar only-mobile">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <Title mobile as="span" className="m-topbar__title">Calendário de safra</Title>
        <Link to="/produtor/produtos/nova" className="m-add" aria-label="Cadastrar oferta com data de colheita">
          <Plus size={20} aria-hidden />
        </Link>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Calendário de safra</Title>
          <p className="body-m t-secondary">Colheitas e prazos das suas ofertas e as entregas dos pedidos aceitos.</p>
        </div>
        <div className="page-header__actions">
          <Button icon={Plus} to="/produtor/produtos/nova">
            Cadastrar colheita
          </Button>
        </div>
      </header>

      <div className="cal-layout">
        <Card className="panel cal">
          <div className="cal__head">
            <div className="cal__month">
              <button type="button" className="cal__nav" aria-label="Mês anterior" onClick={() => shift(-1)}>
                <ChevronLeft size={18} aria-hidden />
              </button>
              <h2 className="h3" aria-live="polite">
                {title}
              </h2>
              <button type="button" className="cal__nav" aria-label="Próximo mês" onClick={() => shift(1)}>
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
            {month !== keyOf(new Date()) && (
              <Button size="s" variant="ghost" onClick={() => setMonth(keyOf(new Date()))}>
                Hoje
              </Button>
            )}
          </div>

          <LoadState loading={loading && !data} error={error} onRetry={reload} empty={!data} skeleton={5}>
            <div className="cal__grid" role="grid">
              {WEEK.map((w) => (
                <div key={w} className="cal__weekday" role="columnheader">
                  <span className="only-desktop">{w}</span>
                  <span className="only-mobile">{w[0]}</span>
                </div>
              ))}
              {cells.map((c, i) => {
                const events = c.muted ? [] : (byDay[c.key] ?? [])
                return (
                  <div key={i} role="gridcell" className={cx('cal__cell', c.muted && 'is-muted', c.key === todayKey && 'is-today')}>
                    <span className="cal__day">{c.day}</span>
                    <div className="cal__events only-desktop">
                      {events.map((e, j) => (
                        <Link key={j} to={e.link} className={`cal-ev cal-ev--${e.tipo}`} title={`${e.titulo} — ${e.texto}`}>
                          {e.titulo}
                        </Link>
                      ))}
                    </div>
                    {events.length > 0 && (
                      <span className="cal__dots only-mobile">
                        {events.map((e, j) => (
                          <i key={j} className={`cal-dot cal-dot--${e.tipo}`} />
                        ))}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </LoadState>

          <div className="legend body-s t-secondary">
            {LEGEND.map(([t, l]) => (
              <span key={t}>
                <i className={`legend__dot cal-dot--${t}`} />
                {l}
              </span>
            ))}
          </div>
        </Card>

        <div className="cal-side">
          <Card className="panel">
            <h2 className="h4">Próximos eventos</h2>
            <LoadState loading={loading && !data} empty={!data?.proximos.length} emptyText="Nada agendado para os próximos 45 dias.">
              <ul className="events">
                {data?.proximos.map((e, i) => (
                  <li key={i}>
                    <IconTile icon={LOOK[e.tipo].icon} tone={LOOK[e.tipo].tone} size={36} iconSize={18} />
                    <div className="list__text">
                      <span className="body-s t-tertiary">{formatWeekday(e.data)}</span>
                      <Link to={e.link} className="label-m">
                        {e.titulo}
                      </Link>
                      <span className="body-s t-secondary">{e.texto}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </LoadState>
          </Card>

          <Card className="panel only-desktop">
            <div>
              <h2 className="h4">Pedidos recebidos por semana</h2>
              <p className="body-s t-tertiary">Últimas 6 semanas</p>
            </div>
            <div className="mini-bars cal-demand">
              {weeks.map((w, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.max(4, (w.pedidos / maxWeek) * 100)}%` }}
                  className={i === weeks.length - 1 ? 'is-last' : undefined}
                  title={`Semana de ${formatDay(w.semana)}: ${w.pedidos} ${w.pedidos === 1 ? 'pedido' : 'pedidos'}`}
                />
              ))}
            </div>
            <p className="body-s t-secondary">
              {weeks.reduce((s, w) => s + w.pedidos, 0)} pedidos no período · {weeks.at(-1)?.pedidos ?? 0} nesta semana
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
