import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Lock, Megaphone, Pencil, RotateCcw, Search, Sparkles, Trash2 } from 'lucide-react'
import { Button, Card, ChipGroup, SearchInput } from '../../components/ui'
import { DemandCard } from '../../components/cards'
import { LoadState, Notice, Pagination } from '../../components/Feedback'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import { formatBRL } from '../../utils/format'
import '../pages.css'
import '../pedidos.css'
import '../produtor/procura.css'
import './publicar.css'
import { useConfirm } from '../../components/Confirm'

const STATUS = { Abertas: 'ABERTA', Encerradas: 'ENCERRADA', Todas: undefined }

// Lista do CRUD de Procura-se do varejista: editar, encerrar/reabrir e excluir
export default function MinhasDemandas() {
  const confirmar = useConfirm()
  const flash = useLocation().state?.flash
  const [tab, setTab] = useQueryState('status', 'Abertas')
  const [q, setQ] = useQueryState('q', '')
  const [pageRaw, setPage] = useQueryState('pagina', '1')
  const page = Number(pageRaw) || 1
  const [notice, setNotice] = useState(flash ? { tone: 'success', text: flash } : null)
  const { data, error, loading, reload } = useApi('/demandas', { status: STATUS[tab], q: q || undefined, page, pageSize: 9 })
  const list = data?.data ?? []

  const setStatus = async (d, status) => {
    try {
      await api(`/demandas/${d.id}/status`, { method: 'PATCH', body: { status } })
      setNotice({ tone: 'success', text: status === 'ENCERRADA' ? `Demanda de ${d.produto} encerrada.` : `Demanda de ${d.produto} reaberta.` })
      reload()
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
    }
  }
  const remove = async (d) => {
    if (!(await confirmar({ titulo: `Excluir a demanda de ${d.produto}?`, mensagem: 'Os produtores deixam de vê-la no Procura-se. Não dá para desfazer.', confirmar: 'Excluir demanda', perigo: true }))) return
    try {
      await api(`/demandas/${d.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', text: `Demanda de ${d.produto} excluída.` })
      reload()
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Procura-se</h1>
          <p className="body-m t-secondary">Suas demandas publicadas. Produtores compatíveis no raio são avisados na hora.</p>
        </div>
        <Button icon={Megaphone} to="/varejista/procura-se/nova">
          Nova demanda
        </Button>
      </header>

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      <div className="row-between orders-toolbar">
        <ChipGroup
          label="Situação"
          options={Object.keys(STATUS)}
          value={tab}
          onChange={(t) => {
            setTab(t)
            setPage('1')
          }}
        />
        <SearchInput
          icon={Search}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage('1')
          }}
          placeholder="Filtrar por produto…"
          aria-label="Filtrar demandas por produto"
        />
      </div>

      <LoadState loading={loading} error={error} onRetry={reload} empty={list.length === 0} emptyText="Nenhuma demanda aqui. Publique o que você precisa e deixe os produtores virem até você.">
        <div className="demand-grid">
          {list.map((d) => (
            <DemandCard
              key={d.id}
              demand={d}
              actions={
                <>
                  {d.status === 'ABERTA' && (
                    <Card className="match-hint" as="div">
                      <Sparkles size={16} aria-hidden />
                      <span className="body-s">
                        {d.produtoresCompativeis
                          ? `${d.produtoresCompativeis} ${d.produtoresCompativeis === 1 ? 'produtor tem' : 'produtores têm'} estoque no raio · a partir de ${formatBRL(d.melhorPreco)}/${d.unidade}`
                          : 'Nenhum produtor com estoque no raio ainda. Avisaremos quando surgir oferta.'}
                      </span>
                    </Card>
                  )}
                  <div className="demand-card__actions">
                    {d.status === 'ABERTA' && d.produtoresCompativeis > 0 && (
                      <Button size="s" icon={Search} to={`/varejista/buscar?q=${encodeURIComponent(d.produto)}&raio=${d.raioKm}`}>
                        Ver ofertas
                      </Button>
                    )}
                    <Button size="s" variant="secondary" icon={Pencil} to={`/varejista/procura-se/${d.id}`}>
                      Editar
                    </Button>
                    {d.status === 'ABERTA' ? (
                      <Button size="s" variant="ghost" icon={Lock} onClick={() => setStatus(d, 'ENCERRADA')}>
                        Encerrar
                      </Button>
                    ) : (
                      <Button size="s" variant="ghost" icon={RotateCcw} onClick={() => setStatus(d, 'ABERTA')}>
                        Reabrir
                      </Button>
                    )}
                    <Button size="s" variant="danger-ghost" icon={Trash2} onClick={() => remove(d)} aria-label={`Excluir demanda de ${d.produto}`} />
                  </div>
                </>
              }
            />
          ))}
        </div>
      </LoadState>
      <Pagination page={page} totalPages={data?.totalPages} total={data?.total} onChange={(p) => setPage(String(p))} label="demandas" />
    </div>
  )
}
