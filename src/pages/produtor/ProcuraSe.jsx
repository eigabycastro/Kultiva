import { ArrowRight, MessageCircle, Plus, Search, Sparkles } from 'lucide-react'
import { Button, ChipGroup, IconTile, SearchInput, Tabs } from '../../components/ui'
import { DemandCard } from '../../components/cards'
import { LoadState, Pagination } from '../../components/Feedback'
import { MobileBell } from '../../components/layout/AppLayout'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import '../pages.css'
import './procura.css'
import Title from '../../components/Title'

const FILTERS = { todas: 'Todas', compativeis: 'Compatíveis', urgentes: 'Urgentes' }

export default function ProcuraSe() {
  const [filter, setFilter] = useQueryState('filtro', 'todas')
  const [q, setQ] = useQueryState('q', '')
  const [pageRaw, setPage] = useQueryState('pagina', '1')
  const page = Number(pageRaw) || 1
  const { data, error, loading, reload } = useApi('/demandas', {
    q: q || undefined,
    compativeis: filter === 'compativeis' || undefined,
    urgentes: filter === 'urgentes' || undefined,
    page,
    pageSize: 9,
  })
  const list = data?.data ?? []
  const counts = { todas: data?.totalRegiao, compativeis: data?.totalCompativeis }
  const labelOf = (k) => (counts[k] != null ? `${FILTERS[k]} (${counts[k]})` : FILTERS[k])
  const tabs = Object.keys(FILTERS).map(labelOf)
  const change = (k) => {
    setFilter(k)
    setPage('1')
  }

  return (
    <div className="page">
      <div className="m-header only-mobile">
        <Title mobile className="h2">Procura-se</Title>
        <MobileBell />
      </div>
      <ChipGroup
        className="only-mobile m-chips"
        label="Filtrar demandas"
        options={tabs}
        value={labelOf(filter)}
        onChange={(l) => change(Object.keys(FILTERS)[tabs.indexOf(l)])}
      />

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Procura-se</Title>
          <p className="body-m t-secondary">
            Demandas abertas de varejistas cujo raio alcança suas propriedades. Responda antes que a demanda feche.
          </p>
        </div>
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
      </header>

      {data?.totalCompativeis > 0 && filter !== 'compativeis' && (
        <div className="match-banner">
          <IconTile icon={Sparkles} tone="solid" size={40} iconSize={20} />
          <div className="list__text">
            <span className="label-m">
              {data.totalCompativeis} {data.totalCompativeis === 1 ? 'demanda combina' : 'demandas combinam'} com o seu estoque atual
            </span>
            <span className="body-s t-secondary">Você tem o produto disponível e o preço cabe no máximo que o comprador paga.</span>
          </div>
          <Button iconRight={ArrowRight} className="only-desktop" onClick={() => change('compativeis')}>
            Ver compatíveis
          </Button>
        </div>
      )}

      <Tabs label="Demandas" tabs={tabs} value={labelOf(filter)} onChange={(l) => change(Object.keys(FILTERS)[tabs.indexOf(l)])} className="only-desktop" />

      <LoadState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={list.length === 0}
        emptyText={filter === 'compativeis' ? 'Nenhuma demanda combina com suas ofertas ativas agora.' : 'Nenhuma demanda aberta na sua região.'}
      >
        <div className="demand-grid">
          {list.map((d) => (
            <DemandCard
              key={d.id}
              demand={d}
              actions={
                <div className="demand-card__actions">
                  {d.compativel ? (
                    <Button size="s" icon={MessageCircle} to={`/produtor/negociacoes?com=${d.varejista.id}`} className="demand-card__offer">
                      Negociar
                    </Button>
                  ) : (
                    <Button size="s" icon={Plus} to={`/produtor/produtos/nova?produto=${d.produtoId}`} className="demand-card__offer">
                      Cadastrar oferta
                    </Button>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </LoadState>
      <Pagination page={page} totalPages={data?.totalPages} total={data?.total} onChange={(p) => setPage(String(p))} label="demandas" />
    </div>
  )
}
