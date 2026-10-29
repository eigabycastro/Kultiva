import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button, Card, IconTile, Segmented, cx } from '../../components/ui'
import { icon } from '../../components/icons'
import { calendarEvents, upcomingEvents } from '../../data/mock'
import '../pages.css'
import './calendario.css'
import Title from '../../components/Title'

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const TODAY = 8
// Outubro/2026 começa na quinta: 27–30/09 completam a primeira semana
const CELLS = [
  ...[27, 28, 29, 30].map((d) => ({ day: d, muted: true })),
  ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1 })),
]
const DEMAND = [38, 52, 46, 60, 72, 86]
const LEGEND = [
  ['colheita', 'Colheita'],
  ['janela', 'Janela de preço (IA)'],
  ['plantio', 'Plantio'],
  ['entrega', 'Entrega'],
]

export default function Calendario() {
  const navigate = useNavigate()
  const [view, setView] = useState('Mês')

  return (
    <div className="page">
      <div className="m-topbar only-mobile">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <Title mobile as="span" className="m-topbar__title">Calendário de safra</Title>
        <button type="button" className="m-add" aria-label="Adicionar colheita">
          <Plus size={20} aria-hidden />
        </button>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Calendário de safra</Title>
          <p className="body-m t-secondary">Planeje colheitas pela demanda da região e pelas janelas de preço da IA.</p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" icon={ArrowRight}>
            Exportar
          </Button>
          <Button icon={Plus}>Adicionar colheita</Button>
        </div>
      </header>

      <div className="cal-layout">
        <Card className="panel cal">
          <div className="cal__head">
            <div className="cal__month">
              <button type="button" className="cal__nav" aria-label="Mês anterior">
                <ChevronLeft size={18} aria-hidden />
              </button>
              <h2 className="h3">Outubro 2026</h2>
              <button type="button" className="cal__nav" aria-label="Próximo mês">
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
            <Segmented
              label="Visualização"
              className="period only-desktop"
              itemClassName="period__item"
              activeClassName="is-active"
              value={view}
              onChange={setView}
              options={['Mês', 'Semana', 'Lista'].map((v) => ({ value: v, label: v }))}
            />
          </div>

          <div className="cal__grid" role="grid">
            {WEEK.map((w) => (
              <div key={w} className="cal__weekday" role="columnheader">
                <span className="only-desktop">{w}</span>
                <span className="only-mobile">{w[0]}</span>
              </div>
            ))}
            {CELLS.map((c, i) => {
              const events = c.muted ? [] : calendarEvents[c.day] ?? []
              return (
                <div
                  key={i}
                  role="gridcell"
                  className={cx('cal__cell', c.muted && 'is-muted', !c.muted && c.day === TODAY && 'is-today')}
                >
                  <span className="cal__day">{c.day}</span>
                  <div className="cal__events only-desktop">
                    {events.map((e) => (
                      <span key={e.label} className={`cal-ev cal-ev--${e.type}`} title={e.label}>
                        {e.label}
                      </span>
                    ))}
                  </div>
                  {events.length > 0 && (
                    <span className="cal__dots only-mobile">
                      {events.map((e) => (
                        <i key={e.label} className={`cal-dot cal-dot--${e.type}`} />
                      ))}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="legend body-s t-secondary">
            {LEGEND.map(([t, l], i) => (
              <span key={t} className={i === 3 ? 'only-desktop' : undefined}>
                <i className={`legend__dot cal-dot--${t}`} />
                {l}
              </span>
            ))}
          </div>
        </Card>

        <div className="cal-side">
          <Card className="panel">
            <h2 className="h4">Próximos eventos</h2>
            <ul className="events">
              {upcomingEvents.map((e) => (
                <li key={e.title}>
                  <IconTile icon={icon(e.icon)} tone={e.tone} size={36} iconSize={18} />
                  <div className="list__text">
                    <span className="body-s t-tertiary">{e.date}</span>
                    <span className="label-m">{e.title}</span>
                    <span className="body-s t-secondary">{e.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="panel only-desktop">
            <div>
              <h2 className="h4">Demanda prevista na região</h2>
              <p className="body-s t-tertiary">Pedidos de tomate por semana (30 km)</p>
            </div>
            <div className="mini-bars cal-demand">
              {DEMAND.map((v, i) => (
                <span key={i} style={{ height: `${v}%` }} className={i === DEMAND.length - 1 ? 'is-last' : undefined} />
              ))}
            </div>
            <p className="body-s" style={{ color: 'var(--text-success)' }}>
              Procura por tomate deve subir 24% até o fim do mês.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
