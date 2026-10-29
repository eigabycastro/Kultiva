import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryState } from '../../hooks/useQueryState'
import { Check, ChevronLeft } from 'lucide-react'
import { Button, Card, ChipGroup, IconTile, Tabs, Toggle, cx } from '../../components/ui'
import { icon } from '../../components/icons'
import { notifications } from '../../data/mock'
import '../pages.css'
import './notificacoes.css'
import Title from '../../components/Title'

const TYPES = { Todas: 8, Demandas: 3, Pedidos: 2, Preços: 1, Mensagens: 2 }
const TABS = Object.entries(TYPES).map(([t, n]) => `${t} (${n})`)
const typeOf = (tabLabel) => tabLabel.split(' ')[0]
const PREFS = [
  { key: 'demandas', title: 'Demandas compatíveis', text: 'Quando um mercado precisa do que você cultiva', on: true },
  { key: 'preco', title: 'Variação de preço', text: 'Altas ou quedas acima de 5%', on: true },
  { key: 'pedidos', title: 'Pedidos e entregas', text: 'Confirmações e lembretes', on: true },
  { key: 'mensagens', title: 'Mensagens', text: 'Novas conversas de negociação', on: true },
  { key: 'safra', title: 'Lembretes de safra', text: 'Um dia antes da colheita', on: false },
]

export default function Notificacoes() {
  const navigate = useNavigate()
  // um único filtro na URL, usado pelas abas (desktop) e pelos chips (mobile)
  const [type, setType] = useQueryState('tipo', 'Todas')
  const [items, setItems] = useState(notifications)
  const [prefs, setPrefs] = useState(Object.fromEntries(PREFS.map((p) => [p.key, p.on])))
  const [channels, setChannels] = useState(['Push no app', 'WhatsApp'])

  const readAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })))
  const visible = type === 'Todas' ? items : items.filter((n) => n.type === type)

  return (
    <div className="page">
      <div className="m-topbar only-mobile">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <Title mobile as="span" className="m-topbar__title">Notificações</Title>
        <button type="button" className="btn btn--ghost btn--s" onClick={readAll}>
          Ler todas
        </button>
      </div>
      <ChipGroup
        className="only-mobile m-chips"
        label="Filtrar notificações"
        options={['Todas', 'Demandas', 'Pedidos', 'Preços']}
        value={type}
        onChange={setType}
      />

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Notificações</Title>
          <p className="body-m t-secondary">Demandas compatíveis, pedidos, mensagens e variações de preço.</p>
        </div>
        <Button variant="ghost" icon={Check} onClick={readAll}>
          Marcar todas como lidas
        </Button>
      </header>

      <div className="notif-layout">
        <Card className="panel panel--flush">
          <Tabs label="Tipos de notificação" tabs={TABS} value={`${type} (${TYPES[type]})`} onChange={(t) => setType(typeOf(t))} className="notif-tabs only-desktop" />
          <ul className="notif-list" aria-live="polite">
            {visible.map((n) => {
              const action = n.action
              return (
                <li key={n.id} className={cx('notif', n.unread && 'notif--unread')}>
                  {n.tone === 'none' ? (
                    <span className="notif__icon-plain">
                      {(() => {
                        const I = icon(n.icon)
                        return <I size={20} aria-hidden />
                      })()}
                    </span>
                  ) : (
                    <IconTile icon={icon(n.icon)} tone={n.tone} size={36} iconSize={18} />
                  )}
                  <div className="notif__body">
                    <p className="label-m">
                      <span className={n.mobileTitle ? 'only-desktop' : undefined}>{n.title}</span>
                      {n.mobileTitle && <span className="only-mobile">{n.mobileTitle}</span>}
                    </p>
                    <p className="body-s t-secondary">
                      <span className={n.mobileText ? 'only-desktop' : undefined}>{n.text}</span>
                      {n.mobileText && <span className="only-mobile">{n.mobileText}</span>}
                    </p>
                    <p className="body-s t-tertiary">{n.time}</p>
                    {action && (
                      <Button
                        size="s"
                        variant={action.variant}
                        icon={action.icon ? icon(action.icon) : undefined}
                        className={cx('notif__action', n.id !== 1 && 'only-desktop')}
                        to={action.label === 'Ver previsão' ? '/produtor/previsao' : n.type === 'Demandas' ? '/produtor/procura-se' : '/produtor/negociacoes'}
                      >
                        {action.label}
                      </Button>
                    )}
                  </div>
                  {n.unread && <span className="notif__dot" aria-label="Não lida" />}
                </li>
              )
            })}
          </ul>
          {visible.length === 0 && <p className="empty body-m t-secondary">Nenhuma notificação deste tipo por enquanto.</p>}
        </Card>

        <Card className="panel prefs only-desktop">
          <div>
            <h2 className="h4">Preferências de alerta</h2>
            <p className="body-s t-tertiary">Escolha o que chega no seu celular</p>
          </div>
          <ul className="prefs__list">
            {PREFS.map((p) => (
              <li key={p.key}>
                <div className="list__text">
                  <span className="label-m">{p.title}</span>
                  <span className="body-s t-tertiary">{p.text}</span>
                </div>
                <Toggle checked={prefs[p.key]} onChange={(v) => setPrefs({ ...prefs, [p.key]: v })} label={p.title} />
              </li>
            ))}
          </ul>
          <div className="field-block">
            <span className="label-m">Receber por</span>
            <ChipGroup label="Receber por" multiple options={['Push no app', 'WhatsApp', 'E-mail']} value={channels} onChange={setChannels} />
          </div>
        </Card>
      </div>
    </div>
  )
}
