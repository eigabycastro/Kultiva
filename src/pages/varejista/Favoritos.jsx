import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { Avatar, Button, Card, Tabs } from '../../components/ui'
import { ProductCard } from '../../components/cards'
import { favoriteProducers, favoriteProductIds, products } from '../../data/mock'
import { useQueryState } from '../../hooks/useQueryState'
import '../pages.css'
import './buscar.css'
import './favoritos.css'

const TABS = ['Produtos', 'Produtores']

export default function Favoritos() {
  const [tab, setTab] = useQueryState('aba', TABS[0])
  const favs = products.filter((p) => favoriteProductIds.includes(p.id))

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Favoritos</h1>
          <p className="body-m t-secondary">
            {favs.length} produtos e {favoriteProducers.length} produtores salvos. Você é avisado quando eles publicam
            uma colheita nova.
          </p>
        </div>
      </header>

      <Tabs label="Tipo de favorito" tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'Produtos' ? (
        <div className="product-grid fav-grid">
          {favs.map((p) => (
            <ProductCard key={p.id} product={p} to={`/varejista/produto/${p.id}`} negotiateTo="/varejista/negociacoes" />
          ))}
        </div>
      ) : (
        <div className="producers">
          {favoriteProducers.map((f) => (
            <Card key={f.id} className="producer">
              <Avatar initials={f.initials} size={52} />
              <div className="list__text">
                <span className="h3">{f.name}</span>
                <span className="body-s t-tertiary producer__meta">
                  <Star size={13} fill="#8d5b00" color="#8d5b00" aria-hidden /> {f.rating} ·
                  <MapPin size={13} aria-hidden /> {f.km} km · {f.owner}
                </span>
                <span className="body-s t-secondary">{f.products}</span>
              </div>
              <div className="producer__actions">
                <span className="body-s t-tertiary">{f.offers} ofertas ativas</span>
                <Button size="s" variant="secondary" to={`/varejista/buscar?q=${encodeURIComponent(f.name)}`}>
                  Ver ofertas
                </Button>
              </div>
            </Card>
          ))}
          <p className="body-s t-tertiary">
            Para salvar um produtor, toque no coração ao lado do nome dele em qualquer produto.{' '}
            <Link to="/varejista/buscar" className="t-brand">
              Buscar produtos
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
