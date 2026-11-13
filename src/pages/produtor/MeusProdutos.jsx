import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react'
import { Badge, Button, Card, IconButton, cx } from '../../components/ui'
import { LoadState, Notice } from '../../components/Feedback'
import { ProduceThumb } from '../../components/ProduceArt'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import { formatBRL, formatDay, formatQty } from '../../utils/format'
import { offerStatusOf } from '../../utils/status'
import '../pages.css'
import './meus-produtos.css'
import { useConfirm } from '../../components/Confirm'

const FILTERS = [
  { key: 'todos', label: 'Todos', test: () => true },
  { key: 'ativa', label: 'Ativos', test: (o) => o.status === 'ATIVA' && !o.acabando },
  { key: 'acabando', label: 'Acabando', test: (o) => o.acabando || o.status === 'ESGOTADA' },
  { key: 'pausada', label: 'Pausados', test: (o) => o.status === 'PAUSADA' },
  { key: 'rascunho', label: 'Rascunhos', test: (o) => o.status === 'RASCUNHO' },
]

function StockBar({ stock, total, unit }) {
  if (!total) return <span className="t-tertiary">—</span>
  const pct = Math.round((stock / total) * 100)
  return (
    <div className="stock-cell">
      <span className="stock-cell__text">
        <strong>{stock}</strong> de {formatQty(total, unit)}
      </span>
      <span className="stock-cell__bar" aria-hidden>
        <span className={cx(pct <= 15 && 'is-low')} style={{ width: `${pct}%` }} />
      </span>
    </div>
  )
}

export default function MeusProdutos() {
  const confirmar = useConfirm()
  const flash = useLocation().state?.flash
  const [filter, setFilter] = useQueryState('status', 'todos')
  const { data, error, loading, reload, setData } = useApi('/ofertas/minhas')
  const [notice, setNotice] = useState(flash ? { tone: 'success', text: flash } : null)
  const offers = data ?? []
  const current = FILTERS.find((f) => f.key === filter) ?? FILTERS[0]
  const rows = offers.filter(current.test)
  const low = offers.filter((o) => o.acabando)

  const replace = (o) => setData((list) => list.map((x) => (x.id === o.id ? { ...x, ...o } : x)))

  const toggle = async (o) => {
    const status = o.status === 'ATIVA' ? 'PAUSADA' : 'ATIVA'
    try {
      replace(await api(`/ofertas/${o.id}/status`, { method: 'PATCH', body: { status } }))
      setNotice({ tone: 'success', text: status === 'ATIVA' ? `${o.produto} voltou a aparecer nas buscas.` : `${o.produto} foi pausada e não recebe novos pedidos.` })
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  const remove = async (o) => {
    if (!(await confirmar({ titulo: `Excluir a oferta de ${o.produto}?`, mensagem: 'Ela some das buscas e não dá para desfazer. Se quiser só parar de vender por um tempo, use Pausar.', confirmar: 'Excluir oferta', perigo: true }))) return
    try {
      await api(`/ofertas/${o.id}`, { method: 'DELETE' })
      setData((list) => list.filter((x) => x.id !== o.id))
      setNotice({ tone: 'success', text: `Oferta de ${o.produto} excluída.` })
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Meus produtos</h1>
          <p className="body-m t-secondary">
            {low.length
              ? `${low.length} ${low.length === 1 ? 'oferta está acabando' : 'ofertas estão acabando'}: ${low.map((o) => o.produto.toLowerCase()).join(' e ')}. Atualize o estoque ou pause para não receber pedidos que não pode atender.`
              : 'O estoque baixa sozinho quando você aceita um pedido.'}
          </p>
        </div>
        <Button icon={Plus} to="/produtor/produtos/nova">
          Cadastrar oferta
        </Button>
      </header>

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

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
            <span className="count-card__value">{offers.filter(f.test).length}</span>
          </button>
        ))}
      </div>

      <Card className="panel panel--flush">
        <LoadState loading={loading} error={error} onRetry={reload} empty={rows.length === 0} emptyText={offers.length ? 'Nenhuma oferta nesta situação.' : 'Você ainda não cadastrou ofertas.'}>
          <div className="table-wrap">
            <table className="table offers-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className="num">Preço</th>
                  <th className="col-m-hide">Estoque em tempo real</th>
                  <th className="col-m-hide">Situação</th>
                  <th className="num col-sec">Visualizações</th>
                  <th className="num col-sec">Pedidos</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const st = offerStatusOf(o)
                  return (
                    <tr key={o.id}>
                      <td>
                        <span className="with-avatar">
                          <ProduceThumb kind={o.kind} size={40} radius={8} />
                          <span className="list__text">
                            <Link to={`/produtor/produtos/${o.id}`} className="label-m">
                              {o.produto}
                            </Link>
                            <span className="body-s t-tertiary">
                              {[o.variedade, o.propriedade?.nome, `colheita ${formatDay(o.dataColheita)}`].filter(Boolean).join(' · ')}
                            </span>
                            <span className="body-s offer-m-line">
                              {o.quantidadeDisponivel} de {formatQty(o.quantidadeTotal, o.unidade)} · {st.label}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="num strong">
                        {formatBRL(o.preco)}
                        <span className="t-tertiary"> /{o.unidade}</span>
                      </td>
                      <td className="col-m-hide">
                        <StockBar stock={o.quantidadeDisponivel} total={o.quantidadeTotal} unit={o.unidade} />
                      </td>
                      <td className="col-m-hide">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="num col-sec">{o.visualizacoes}</td>
                      <td className="num col-sec">{o.totalPedidos ?? 0}</td>
                      <td className="actions-cell">
                        <span className="row-actions">
                          {['ATIVA', 'PAUSADA'].includes(o.status) && (
                            <IconButton
                              icon={o.status === 'ATIVA' ? Pause : Play}
                              size={16}
                              label={o.status === 'ATIVA' ? `Pausar ${o.produto}` : `Reativar ${o.produto}`}
                              title={o.status === 'ATIVA' ? 'Pausar' : 'Reativar'}
                              onClick={() => toggle(o)}
                            />
                          )}
                          <Link to={`/produtor/produtos/${o.id}`} className="icon-btn" aria-label={`Editar ${o.produto}`} title="Editar">
                            <Pencil size={16} aria-hidden />
                          </Link>
                          <IconButton icon={Trash2} size={16} label={`Excluir ${o.produto}`} title="Excluir" onClick={() => remove(o)} />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </LoadState>
      </Card>
    </div>
  )
}
