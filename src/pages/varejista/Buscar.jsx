import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MapPin, Megaphone, Search, SlidersHorizontal } from 'lucide-react'
import { Badge, Button, Card, ChipGroup, SearchInput, Toggle, cx } from '../../components/ui'
import { ProductCard } from '../../components/cards'
import { LoadState, Notice, Pagination } from '../../components/Feedback'
import ProduceArt from '../../components/ProduceArt'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import { formatBRL, formatQty, parseMoney } from '../../utils/format'
import '../pages.css'
import './buscar.css'
import Title from '../../components/Title'

const CATEGORIES = ['Todos', 'Hortaliças', 'Frutas', 'Legumes', 'Grãos', 'Orgânicos', 'Colhido hoje']
const HARVEST = { qualquer: 'Qualquer data', hoje: 'Colhido hoje', semana: 'Até 7 dias' }
const SORT = { distancia: 'Mais próximos', menor_preco: 'Menor preço', maior_preco: 'Maior preço', recentes: 'Mais recentes' }

// adia a atualização enquanto a pessoa digita
function useDebounced(value, ms = 400) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function useFavoriteToggle(setData, onError) {
  return async (o) => {
    const next = !o.favorito
    const flip = (list) => list.map((x) => (x.id === o.id ? { ...x, favorito: next } : x))
    setData((d) => (Array.isArray(d) ? flip(d) : { ...d, data: flip(d.data) }))
    try {
      await api(`/favoritos/${o.id}`, { method: next ? 'POST' : 'DELETE' })
    } catch (err) {
      setData((d) => (Array.isArray(d) ? d.map((x) => (x.id === o.id ? { ...x, favorito: !next } : x)) : { ...d, data: d.data.map((x) => (x.id === o.id ? { ...x, favorito: !next } : x)) }))
      onError?.(err.message)
    }
  }
}

export default function Buscar({ title = 'Buscar produtos' }) {
  const { usuario } = useAuth()
  // filtros ficam na URL: recarregar ou compartilhar o link mantém a busca
  const [q, setQ] = useQueryState('q', '')
  const [cat, setCat] = useQueryState('cat', 'Todos')
  const [radiusRaw, setRadius] = useQueryState('raio', String(usuario.raioKm ?? 30))
  const [harvest, setHarvest] = useQueryState('colheita', 'qualquer')
  const [organicRaw, setOrganic] = useQueryState('organico', 'false')
  const [min, setMin] = useQueryState('min', '')
  const [max, setMax] = useQueryState('max', '')
  const [sort, setSort] = useQueryState('ordem', 'distancia')
  const [pageRaw, setPage] = useQueryState('pagina', '1')
  const [error, setError] = useState('')
  const radius = Number(radiusRaw)
  const organic = organicRaw === 'true' || cat === 'Orgânicos'
  const page = Number(pageRaw) || 1

  const [text, setText] = useState(q)
  const debouncedText = useDebounced(text)
  const debouncedRadius = useDebounced(radius, 250)
  useEffect(() => {
    if (debouncedText !== q) {
      setQ(debouncedText)
      setPage('1')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText])

  const query = {
    q: q || undefined,
    categoria: ['Hortaliças', 'Frutas', 'Legumes', 'Grãos'].includes(cat) ? cat : undefined,
    organico: organic || undefined,
    colheita: cat === 'Colhido hoje' ? 'hoje' : harvest === 'qualquer' ? undefined : harvest,
    raioKm: debouncedRadius,
    precoMin: parseMoney(min) ?? undefined,
    precoMax: parseMoney(max) ?? undefined,
    ordenar: sort,
    page,
    pageSize: 9,
  }
  const { data, error: loadError, loading, reload, setData } = useApi('/ofertas', query)
  const list = data?.data ?? []
  const toggleFav = useFavoriteToggle(setData, setError)

  const update = (setter) => (v) => {
    setter(v)
    setPage('1')
  }
  const clear = () => {
    setCat('Todos')
    setRadius(String(usuario.raioKm ?? 30))
    setHarvest('qualquer')
    setOrganic('false')
    setMin('')
    setMax('')
    setText('')
    setPage('1')
  }
  const nextSort = () => {
    const keys = Object.keys(SORT)
    update(setSort)(keys[(keys.indexOf(sort) + 1) % keys.length])
  }

  const where = usuario.cidade ? `${usuario.cidade}, ${usuario.uf}` : 'você'

  return (
    <div className="page">
      {/* Mobile */}
      <div className="m-header only-mobile" style={{ paddingBottom: 4 }}>
        <Title mobile className="h2">{title}</Title>
        <span className="location-pill">
          <MapPin size={16} aria-hidden />
          {radius} km
        </span>
      </div>
      <div className="only-mobile">
        <div className="m-search">
          <SearchInput icon={Search} type="search" name="q" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tomate, alface, morango…" aria-label="Buscar produtos" />
        </div>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">{title}</Title>
          <p className="body-m t-secondary">
            Ofertas com estoque disponível num raio de {radius} km de {where}.
          </p>
        </div>
        <Button variant="secondary" icon={Megaphone} to="/varejista/procura-se/nova">
          Publicar Procura-se
        </Button>
      </header>

      <form
        className="search-bar only-desktop"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(text)
          setPage('1')
        }}
      >
        <SearchInput icon={Search} type="search" name="q" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: tomate italiano, alface, nome do sítio…" aria-label="Buscar produtos" className="search-bar__input" />
        <Button type="submit" icon={Search}>
          Buscar
        </Button>
      </form>

      <ChipGroup label="Categoria" options={CATEGORIES} value={cat} onChange={update(setCat)} className="search-chips" />

      <Notice tone="danger" onClose={() => setError('')}>
        {error}
      </Notice>

      <div className="search-layout">
        <Card as="aside" className="filters only-desktop">
          <div className="filters__title">
            <SlidersHorizontal size={18} color="var(--icon-brand)" aria-hidden />
            <span className="h4">Filtros</span>
          </div>

          <div className="filters__group">
            <div className="row-between">
              <span className="label-m">Raio de distância</span>
              <span className="label-m t-brand">{radius} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={radius}
              onChange={(e) => update(setRadius)(e.target.value)}
              className="range"
              style={{ '--p': `${((radius - 5) / 95) * 100}%` }}
              aria-label="Raio de distância"
            />
            <div className="row-between body-s t-tertiary">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          <div className="filters__group">
            <span className="label-m">Colheita</span>
            <ChipGroup label="Colheita" options={Object.values(HARVEST)} value={HARVEST[harvest]} onChange={(l) => update(setHarvest)(Object.keys(HARVEST).find((k) => HARVEST[k] === l))} />
          </div>

          <div className="filters__group">
            <span className="label-m">Faixa de preço (R$ por unidade)</span>
            <div className="filters__prices">
              <SearchInput placeholder="Mín. 2,00" inputMode="decimal" name="min" value={min} onChange={(e) => update(setMin)(e.target.value)} aria-label="Preço mínimo" />
              <SearchInput placeholder="Máx. 8,00" inputMode="decimal" name="max" value={max} onChange={(e) => update(setMax)(e.target.value)} aria-label="Preço máximo" />
            </div>
          </div>

          <div className="filters__group filters__group--row">
            <div className="list__text">
              <span className="label-m">Só orgânicos</span>
              <span className="body-s t-tertiary">Ofertas marcadas como orgânicas</span>
            </div>
            <Toggle checked={organic} onChange={(v) => update(setOrganic)(String(v))} label="Só orgânicos" />
          </div>

          <Button variant="secondary" block onClick={clear}>
            Limpar filtros
          </Button>
        </Card>

        <div className="results">
          <div className="row-between results__head">
            <p className="body-m" aria-live="polite">
              <strong>{data ? `${data.total} ${data.total === 1 ? 'oferta' : 'ofertas'}` : 'Buscando…'}</strong>
              <span className="t-secondary"> perto de você</span>
            </p>
            <label className="sort-btn">
              <span className="t-tertiary">Ordenar:</span>
              <select value={sort} onChange={(e) => update(setSort)(e.target.value)} aria-label="Ordenar por" className="sort-select">
                {Object.entries(SORT).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden />
            </label>
            <button type="button" className="label-s t-brand only-mobile sort-link" onClick={nextSort}>
              {SORT[sort]}
            </button>
          </div>

          <LoadState
            loading={loading}
            error={loadError}
            onRetry={reload}
            empty={list.length === 0}
            emptyText="Nenhuma oferta com esses filtros. Aumente o raio ou publique um Procura-se para os produtores te encontrarem."
          >
            <div className="product-grid only-desktop">
              {list.map((o) => (
                <ProductCard key={o.id} product={o} to={`/varejista/produto/${o.id}`} onToggleFav={toggleFav} />
              ))}
            </div>

            <div className="stack-8 only-mobile">
              {list.map((o) => (
                <Card key={o.id} className="product-row">
                  <Link to={`/varejista/produto/${o.id}`} className="product-row__img">
                    <ProduceArt kind={o.kind} label={o.produto} style={{ width: '100%', height: '100%' }} />
                  </Link>
                  <div className="product-row__body">
                    <Link to={`/varejista/produto/${o.id}`} className="label-m">
                      {o.produto}
                    </Link>
                    <span className="body-s t-tertiary">
                      {o.propriedade.nome} · {Math.round(o.distanciaKm ?? 0)} km
                    </span>
                    <Badge tone={o.tagTone}>
                      {o.tag} · {formatQty(o.quantidadeDisponivel, o.unidade)}
                    </Badge>
                    <span>
                      <strong className="price">{formatBRL(o.preco)}</strong>
                      <span className="body-s t-tertiary">/{o.unidade}</span>
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </LoadState>
          <div className={cx(loading && 'is-refreshing')}>
            <Pagination page={page} totalPages={data?.totalPages} total={data?.total} onChange={(p) => setPage(String(p))} label="ofertas" />
          </div>
        </div>
      </div>
    </div>
  )
}
