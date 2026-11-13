import { useNavigate } from 'react-router-dom'
import { Bell, Check, ChevronLeft, Megaphone, MessageCircle, Truck, TrendingUp, Trash2 } from 'lucide-react'
import { Button, Card, ChipGroup, IconButton, IconTile, Tabs, cx } from '../../components/ui'
import { LoadState, Pagination } from '../../components/Feedback'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import { timeAgo } from '../../utils/format'
import '../pages.css'
import './notificacoes.css'
import Title from '../../components/Title'

const TYPES = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'DEMANDA', label: 'Demandas' },
  { key: 'PEDIDO', label: 'Pedidos' },
  { key: 'PRECO', label: 'Preços' },
  { key: 'SISTEMA', label: 'Avisos' },
]
const LOOK = {
  DEMANDA: { icon: Megaphone, tone: 'accent' },
  PEDIDO: { icon: Truck, tone: 'solid' },
  PRECO: { icon: TrendingUp, tone: 'info' },
  MENSAGEM: { icon: MessageCircle, tone: 'info' },
  SISTEMA: { icon: Bell, tone: 'neutral' },
}

export default function Notificacoes() {
  const navigate = useNavigate()
  const [type, setType] = useQueryState('tipo', 'TODAS')
  const [pageRaw, setPage] = useQueryState('pagina', '1')
  const page = Number(pageRaw) || 1
  const { data, error, loading, reload, setData } = useApi('/notificacoes', { tipo: type === 'TODAS' ? undefined : type, page, pageSize: 15 })
  const list = data?.data ?? []
  const count = (k) => data?.contagem?.[k] ?? 0
  const tabLabel = (t) => `${t.label} (${count(t.key)})`
  const tabs = TYPES.map(tabLabel)
  const pick = (label) => {
    setType(TYPES[tabs.indexOf(label)]?.key ?? 'TODAS')
    setPage('1')
  }

  const markRead = (id) => setData((d) => ({ ...d, naoLidas: Math.max(0, d.naoLidas - 1), data: d.data.map((n) => (n.id === id ? { ...n, lida: true } : n)) }))

  const readAll = async () => {
    await api('/notificacoes/lidas', { method: 'PATCH' })
    setData((d) => ({ ...d, naoLidas: 0, data: d.data.map((n) => ({ ...n, lida: true })) }))
  }
  const open = async (n) => {
    if (!n.lida) {
      markRead(n.id)
      api(`/notificacoes/${n.id}/lida`, { method: 'PATCH' }).catch(() => {})
    }
    if (n.link) navigate(n.link)
  }
  const remove = async (n) => {
    await api(`/notificacoes/${n.id}`, { method: 'DELETE' })
    reload()
  }

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
      <ChipGroup className="only-mobile m-chips" label="Filtrar notificações" options={tabs} value={tabLabel(TYPES.find((t) => t.key === type) ?? TYPES[0])} onChange={pick} />

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Notificações</Title>
          <p className="body-m t-secondary">
            {data?.naoLidas ? `${data.naoLidas} ${data.naoLidas === 1 ? 'não lida' : 'não lidas'}. ` : ''}Demandas compatíveis, pedidos e avisos da plataforma.
          </p>
        </div>
        <Button variant="ghost" icon={Check} onClick={readAll} disabled={!data?.naoLidas}>
          Marcar todas como lidas
        </Button>
      </header>

      <Card className="panel panel--flush">
        <Tabs label="Tipos de notificação" tabs={tabs} value={tabLabel(TYPES.find((t) => t.key === type) ?? TYPES[0])} onChange={pick} className="notif-tabs only-desktop" />
        <LoadState loading={loading} error={error} onRetry={reload} empty={list.length === 0} emptyText="Nenhuma notificação deste tipo por enquanto.">
          <ul className="notif-list" aria-live="polite">
            {list.map((n) => {
              const look = LOOK[n.tipo] ?? LOOK.SISTEMA
              return (
                <li key={n.id} className={cx('notif', !n.lida && 'notif--unread')}>
                  <IconTile icon={look.icon} tone={look.tone} size={36} iconSize={18} />
                  <div className="notif__body">
                    <p className="label-m">{n.titulo}</p>
                    <p className="body-s t-secondary">{n.texto}</p>
                    <p className="body-s t-tertiary">{timeAgo(n.criadoEm)}</p>
                    {n.link && (
                      <Button size="s" variant={n.lida ? 'secondary' : 'primary'} className="notif__action" onClick={() => open(n)}>
                        {n.tipo === 'DEMANDA' ? 'Ver demanda' : n.tipo === 'PEDIDO' ? 'Ver pedido' : 'Abrir'}
                      </Button>
                    )}
                  </div>
                  {!n.lida && <span className="notif__dot" aria-label="Não lida" />}
                  <IconButton icon={Trash2} size={16} label="Apagar notificação" onClick={() => remove(n)} />
                </li>
              )
            })}
          </ul>
        </LoadState>
        <Pagination page={page} totalPages={data?.totalPages} total={data?.total} onChange={(p) => setPage(String(p))} label="notificações" />
      </Card>
    </div>
  )
}
