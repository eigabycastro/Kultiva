import { Link } from 'react-router-dom'
import { ChevronDown, MapPin, Megaphone, MessageCircle, Search, SlidersHorizontal } from 'lucide-react'
import { Badge, Button, Card, Checkbox, ChipGroup, SearchInput, Toggle } from '../../components/ui'
import { ProductCard, Rating } from '../../components/cards'
import ProduceArt from '../../components/ProduceArt'
import { products } from '../../data/mock'
import { useQueryState } from '../../hooks/useQueryState'
import '../pages.css'
import './buscar.css'
import Title from '../../components/Title'

const CATEGORIES = ['Todos', 'Hortaliças', 'Frutas', 'Legumes', 'Grãos', 'Orgânicos', 'Colhido hoje']

export default function Buscar({ title = 'Buscar produtos' }) {
  // filtros ficam na URL: recarregar ou compartilhar o link mantém a busca
  const [q, setQ] = useQueryState('q', '')
  const [cat, setCat] = useQueryState('cat', 'Todos')
  const [radiusRaw, setRadius] = useQueryState('raio', '30')
  const radius = Number(radiusRaw)
  const [availList, setAvailList] = useQueryState('disp', ['pronto', 'hoje'], { list: true })
  const avail = { pronto: availList.includes('pronto'), hoje: availList.includes('hoje'), semana: availList.includes('semana') }
  const setAvail = (next) => setAvailList(Object.keys(next).filter((k) => next[k]))
  const [seloRaw, setSelo] = useQueryState('selo', 'true')
  const selo = seloRaw === 'true'
  const [min, setMin] = useQueryState('min', '')
  const [max, setMax] = useQueryState('max', '')
  const clear = () => {
    setCat('Todos')
    setRadius('30')
    setAvailList(['pronto', 'hoje'])
    setSelo('true')
    setMin('')
    setMax('')
  }
  const negotiateTo = '/varejista/negociacoes'

  return (
    <div className="page">
      {/* Mobile */}
      <div className="m-header only-mobile" style={{ paddingBottom: 4 }}>
        <Title mobile className="h2">{title}</Title>
        <button type="button" className="location-pill">
          <MapPin size={16} aria-hidden />
          {radius} km
          <ChevronDown size={16} aria-hidden />
        </button>
      </div>
      <div className="only-mobile">
        <div className="m-search">
          <SearchInput
            icon={Search}
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tomate, alface, morango…"
            aria-label="Buscar produtos"
          />
          <button type="button" className="m-search__filter" aria-label="Filtros">
            <SlidersHorizontal size={20} aria-hidden />
          </button>
        </div>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">{title}</Title>
          <p className="body-m t-secondary">Produtores com estoque disponível num raio de 30 km de Pouso Alegre, MG.</p>
        </div>
        <Button variant="secondary" icon={Megaphone} to="/varejista/procura-se">
          Publicar Procura-se
        </Button>
      </header>

      <form className="search-bar only-desktop" role="search" onSubmit={(e) => e.preventDefault()}>
        <SearchInput
          icon={Search}
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex.: tomate italiano, alface, morango…"
          aria-label="Buscar produtos"
          className="search-bar__input"
        />
        <Button type="submit" icon={Search}>
          Buscar
        </Button>
      </form>

      <ChipGroup label="Categoria" options={CATEGORIES} value={cat} onChange={setCat} className="search-chips" />

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
              max={50}
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="range"
              style={{ '--p': `${((radius - 5) / 45) * 100}%` }}
              aria-label="Raio de distância"
            />
            <div className="row-between body-s t-tertiary">
              <span>5 km</span>
              <span>50 km</span>
            </div>
          </div>

          <div className="filters__group">
            <span className="label-m">Disponibilidade</span>
            <Checkbox checked={avail.pronto} onChange={(v) => setAvail({ ...avail, pronto: v })}>
              Pronto para colheita
            </Checkbox>
            <Checkbox checked={avail.hoje} onChange={(v) => setAvail({ ...avail, hoje: v })}>
              Colhido hoje
            </Checkbox>
            <Checkbox checked={avail.semana} onChange={(v) => setAvail({ ...avail, semana: v })}>
              Próximos 7 dias
            </Checkbox>
          </div>

          <div className="filters__group">
            <span className="label-m">Faixa de preço (R$/kg)</span>
            <div className="filters__prices">
              <SearchInput
                placeholder="Mín. 2,00"
                inputMode="decimal"
                name="min"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                aria-label="Preço mínimo por kg"
              />
              <SearchInput
                placeholder="Máx. 8,00"
                inputMode="decimal"
                name="max"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                aria-label="Preço máximo por kg"
              />
            </div>
          </div>

          <div className="filters__group filters__group--row">
            <div className="list__text">
              <span className="label-m">Selo de qualidade</span>
              <span className="body-s t-tertiary">Produtores certificados</span>
            </div>
            <Toggle checked={selo} onChange={(v) => setSelo(String(v))} label="Selo de qualidade" />
          </div>

          <Button variant="secondary" block onClick={clear}>
            Limpar filtros
          </Button>
        </Card>

        <div className="results">
          <div className="row-between results__head">
            <p className="body-m">
              <strong className="only-desktop">48 produtos</strong>
              <span className="t-secondary only-desktop"> encontrados perto de você</span>
              <span className="t-secondary only-mobile body-s">48 produtos perto de você</span>
            </p>
            <button type="button" className="sort-btn only-desktop">
              <span className="t-tertiary">Ordenar:</span> Mais próximos
              <ChevronDown size={16} aria-hidden />
            </button>
            <button type="button" className="label-s t-brand only-mobile sort-link">
              Mais próximos
            </button>
          </div>

          <div className="product-grid only-desktop">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} to={`/varejista/produto/${p.id}`} negotiateTo={negotiateTo} />
            ))}
          </div>

          <div className="stack-8 only-mobile">
            {products
              .filter((p) => p.kind !== 'couve' && p.kind !== 'cenoura')
              .map((p) => (
                <Card key={p.id} className="product-row">
                  <Link to={`/varejista/produto/${p.id}`} className="product-row__img">
                    <ProduceArt kind={p.kind} label={p.name} style={{ width: '100%', height: '100%' }} />
                  </Link>
                  <div className="product-row__body">
                    <div className="row-between">
                      <Link to={`/varejista/produto/${p.id}`} className="label-m">
                        {p.name}
                      </Link>
                      <Rating value={p.rating} />
                    </div>
                    <span className="body-s t-tertiary">
                      {p.farmShort} · {p.km} km
                    </span>
                    <Badge tone={p.tag === 'Colhido hoje' ? 'brand' : 'success'}>
                      {p.tag === 'Colhido hoje' ? `Colhido hoje · ${p.stockShort}` : `Selo · ${p.stockShort}`}
                    </Badge>
                    <div className="row-between">
                      <span>
                        <strong className="price">{p.price}</strong>
                        <span className="body-s t-tertiary">/{p.unitShort}</span>
                      </span>
                      <Link to={negotiateTo} className="product-row__chat" aria-label={`Negociar ${p.name}`}>
                        <MessageCircle size={18} aria-hidden />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
