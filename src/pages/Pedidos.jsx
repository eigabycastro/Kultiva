import { useState } from 'react'
import { Download, Search } from 'lucide-react'
import { useRole } from '../components/layout/AppLayout'
import { Avatar, Badge, Button, Card, ChipGroup, SearchInput } from '../components/ui'
import { StatCard } from '../components/cards'
import { LoadState, Notice, Pagination } from '../components/Feedback'
import { ProduceThumb } from '../components/ProduceArt'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { useQueryState } from '../hooks/useQueryState'
import { formatBRL, formatBRLCompact, formatDay, formatQty } from '../utils/format'
import { ORDER_ACTIONS, ORDER_STATUS } from '../utils/status'
import './pages.css'
import './pedidos.css'
import Title from '../components/Title'

const GROUPS = [
  { key: 'todos', label: 'Todos' },
  { key: 'andamento', label: 'Em andamento' },
  { key: 'concluidos', label: 'Concluídos' },
  { key: 'cancelados', label: 'Cancelados' },
]

const itemsText = (p) => p.itens.map((i) => i.produto).join(', ')
const qtyText = (p) => p.itens.map((i) => formatQty(i.quantidade, i.unidade)).join(' + ')

function exportCsv(rows, role) {
  const head = ['Pedido', 'Data', role === 'produtor' ? 'Comprador' : 'Produtor', 'Itens', 'Total', 'Status']
  const lines = rows.map((p) => [
    p.codigo,
    formatDay(p.criadoEm),
    (role === 'produtor' ? p.varejista : p.produtor).organizacao,
    p.itens.map((i) => `${i.quantidade} ${i.unidade} ${i.produto} a ${i.precoUnitario}`).join(' | '),
    p.total.toFixed(2).replace('.', ','),
    ORDER_STATUS[p.status].short,
  ])
  const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(';')).join('\n')
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'pedidos-kultiva.csv' })
  a.click()
  URL.revokeObjectURL(url)
}

function OrderActions({ order, onAction, busy }) {
  if (!order.acoes.length) return null
  return (
    <span className="row-actions">
      {order.acoes.map((a) => (
        <Button key={a} size="s" variant={ORDER_ACTIONS[a].variant} disabled={busy} onClick={() => onAction(order, a)}>
          {ORDER_ACTIONS[a].label}
        </Button>
      ))}
    </span>
  )
}

export default function Pedidos() {
  const role = useRole()
  const seller = role === 'produtor'
  const [group, setGroup] = useQueryState('grupo', 'todos')
  const [q, setQ] = useQueryState('q', '')
  const [from, setFrom] = useQueryState('de', '')
  const [to, setTo] = useQueryState('ate', '')
  const [pageRaw, setPage] = useQueryState('pagina', '1')
  const page = Number(pageRaw) || 1
  const [search, setSearch] = useState(q)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(null)

  const { data, error, loading, reload, setData } = useApi('/pedidos', {
    grupo: group === 'todos' ? undefined : group,
    q: q || undefined,
    de: from || undefined,
    ate: to || undefined,
    page,
  })
  const dash = useApi('/dashboard')
  const rows = data?.data ?? []
  const counts = data?.contagem
  const groupLabel = (g) => (counts ? `${g.label} (${counts[g.key]})` : g.label)
  const labels = GROUPS.map(groupLabel)
  const party = (p) => (seller ? p.varejista : p.produtor)

  const resetPage = () => setPage('1')

  const act = async (order, action) => {
    const cfg = ORDER_ACTIONS[action]
    let motivo
    if (cfg.ask) {
      motivo = window.prompt(`${order.codigo} · ${cfg.ask}`)
      if (motivo === null) return
    } else if (action === 'aceitar' && !window.confirm(`Aceitar ${order.codigo}? ${qtyText(order)} sairão do seu estoque agora.`)) {
      return
    }
    setBusy(order.id)
    setNotice(null)
    try {
      const updated = await api(`/pedidos/${order.id}/status`, { method: 'PATCH', body: { acao: action, motivo: motivo || undefined } })
      setData((d) => ({ ...d, data: d.data.map((p) => (p.id === updated.id ? updated : p)) }))
      setNotice({ tone: 'success', text: `${order.codigo}: ${cfg.done}` })
      dash.reload()
    } catch (err) {
      setNotice({ tone: 'danger', text: `${order.codigo}: ${err.message}` })
    } finally {
      setBusy(null)
    }
  }

  const d = dash.data
  const kpis = d && [
    { icon: 'chart', label: seller ? 'Vendido no mês' : 'Comprado no mês', value: formatBRL(d.totalMes), mobileValue: formatBRLCompact(d.totalMes), delta: d.variacaoMes == null ? '—' : `${d.variacaoMes > 0 ? '+' : ''}${d.variacaoMes}%`, tone: d.variacaoMes < 0 ? 'warning' : 'success', note: 'vs. mês anterior' },
    { icon: 'truck', label: 'Em andamento', value: String(d.pedidosAtivos), delta: `${d.pedidosPendentes} pendentes`, tone: d.pedidosPendentes ? 'warning' : 'success', note: seller ? 'esperando você' : 'esperando o produtor' },
    { icon: 'package', label: 'Entregues', value: String(d.pedidosEntregues), delta: 'no total', tone: 'success' },
    { icon: 'user', label: seller ? 'Clientes' : 'Produtores parceiros', value: String(d.parceiros), delta: 'com pedido aceito', tone: 'success' },
  ]

  return (
    <div className="page">
      <div className="m-header only-mobile">
        <Title mobile className="h2">Meus pedidos</Title>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Histórico de pedidos</Title>
          <p className="body-m t-secondary">
            {seller
              ? 'Aceite ou recuse os pedidos recebidos. Ao aceitar, o estoque da oferta baixa na hora.'
              : 'Acompanhe suas compras. Pedidos pendentes ainda podem ser cancelados.'}
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={() => exportCsv(rows, role)} disabled={!rows.length}>
          Exportar CSV
        </Button>
      </header>

      {kpis && (
        <div className="kpi-grid">
          {kpis.map((k, i) => (
            <StatCard key={k.label} {...k} className={i > 1 ? 'only-desktop' : undefined} />
          ))}
        </div>
      )}

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      <div className="row-between orders-toolbar">
        <ChipGroup
          label="Status do pedido"
          options={labels}
          value={groupLabel(GROUPS.find((g) => g.key === group) ?? GROUPS[0])}
          onChange={(l) => {
            setGroup(GROUPS[labels.indexOf(l)].key)
            resetPage()
          }}
          className="orders-filters"
        />
        <form
          className="orders-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            setQ(search.trim())
            resetPage()
          }}
        >
          <SearchInput
            icon={Search}
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (!e.target.value) {
                setQ('')
                resetPage()
              }
            }}
            placeholder={seller ? 'Código, produto ou comprador' : 'Código, produto ou produtor'}
            aria-label="Buscar pedidos"
          />
          <input type="date" className="date-input" aria-label="De" value={from} max={to || undefined} onChange={(e) => (setFrom(e.target.value), resetPage())} />
          <input type="date" className="date-input" aria-label="Até" value={to} min={from || undefined} onChange={(e) => (setTo(e.target.value), resetPage())} />
        </form>
      </div>

      <Card className="panel panel--flush only-desktop">
        <LoadState loading={loading} error={error} onRetry={reload} empty={rows.length === 0} emptyText="Nenhum pedido com esses filtros.">
          <div className="table-wrap">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>{seller ? 'Comprador' : 'Produtor'}</th>
                  <th>Produto</th>
                  <th className="num">Qtd.</th>
                  <th className="num">Total</th>
                  <th className="num col-sec">Entrega</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="order-id">
                      {p.codigo}
                      <span className="cell-sub">{formatDay(p.criadoEm)}</span>
                    </td>
                    <td className="wrap">
                      <span className="with-avatar">
                        <Avatar initials={party(p).iniciais} size={32} />
                        {party(p).organizacao}
                      </span>
                    </td>
                    <td className="wrap">
                      <span className="with-avatar">
                        <ProduceThumb kind={p.itens[0]?.kind} size={24} radius={6} />
                        {itemsText(p)}
                      </span>
                    </td>
                    <td className="num">
                      {qtyText(p)}
                      <span className="cell-sub">× {p.itens.map((i) => formatBRL(i.precoUnitario)).join(' / ')}</span>
                    </td>
                    <td className="strong num">{formatBRL(p.total)}</td>
                    <td className="num col-sec">{formatDay(p.dataEntrega)}</td>
                    <td>
                      <Badge tone={ORDER_STATUS[p.status].tone}>{ORDER_STATUS[p.status].short}</Badge>
                      {p.motivo && <span className="cell-sub" title={p.motivo}>{p.motivo}</span>}
                    </td>
                    <td>
                      <OrderActions order={p} onAction={act} busy={busy === p.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LoadState>
        <Pagination page={page} totalPages={data?.totalPages} total={data?.total} onChange={(n) => setPage(String(n))} label="pedidos" />
      </Card>

      <div className="stack-8 only-mobile">
        <LoadState loading={loading} error={error} empty={rows.length === 0} emptyText="Nenhum pedido com esses filtros.">
          <div className="stack-8">
            {rows.map((p) => (
              <Card key={p.id} className="order-card">
                <div className="order-card__head">
                  <Avatar initials={party(p).iniciais} />
                  <div className="list__text">
                    <span className="label-m">{party(p).organizacao}</span>
                    <span className="body-s t-tertiary">
                      {p.codigo} · {formatDay(p.criadoEm)}
                    </span>
                  </div>
                  <Badge tone={ORDER_STATUS[p.status].tone}>{ORDER_STATUS[p.status].short}</Badge>
                </div>
                <div className="order-card__foot">
                  <ProduceThumb kind={p.itens[0]?.kind} size={32} />
                  <div className="list__text">
                    <span className="label-s">{itemsText(p)}</span>
                    <span className="body-s t-tertiary">{qtyText(p)}</span>
                  </div>
                  <span className="label-m">{formatBRL(p.total)}</span>
                </div>
                <OrderActions order={p} onAction={act} busy={busy === p.id} />
              </Card>
            ))}
          </div>
        </LoadState>
        <Pagination page={page} totalPages={data?.totalPages} total={data?.total} onChange={(n) => setPage(String(n))} label="pedidos" />
      </div>
    </div>
  )
}
