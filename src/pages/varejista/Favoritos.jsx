import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Avatar, Button, Card, Tabs } from '../../components/ui'
import { ProductCard } from '../../components/cards'
import { LoadState } from '../../components/Feedback'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import '../pages.css'
import './buscar.css'
import './favoritos.css'

const TABS = ['Produtos', 'Produtores']

export default function Favoritos() {
  const [tab, setTab] = useQueryState('aba', TABS[0])
  const { data, error, loading, reload, setData } = useApi('/favoritos')
  const offers = data?.ofertas ?? []
  const producers = data?.produtores ?? []

  // na tela de favoritos, desfavoritar tira o card da lista
  const unfav = async (o) => {
    setData((d) => ({ ...d, ofertas: d.ofertas.filter((x) => x.id !== o.id) }))
    try {
      await api(`/favoritos/${o.id}`, { method: 'DELETE' })
    } finally {
      reload()
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Favoritos</h1>
          <p className="body-m t-secondary">
            {offers.length} {offers.length === 1 ? 'oferta salva' : 'ofertas salvas'} de {producers.length} {producers.length === 1 ? 'produtor' : 'produtores'}.
          </p>
        </div>
      </header>

      <Tabs label="Tipo de favorito" tabs={TABS} value={tab} onChange={setTab} />

      <LoadState
        loading={loading}
        error={error}
        onRetry={reload}
        empty={offers.length === 0}
        emptyText="Nenhum favorito ainda. Toque no coração de uma oferta para salvar aqui."
      >
        {tab === 'Produtos' ? (
          <div className="product-grid fav-grid">
            {offers.map((o) => (
              <ProductCard key={o.id} product={o} to={`/varejista/produto/${o.id}`} onToggleFav={unfav} />
            ))}
          </div>
        ) : (
          <div className="producers">
            {producers.map((f) => (
              <Card key={f.id} className="producer">
                <Avatar initials={f.iniciais} size={52} />
                <div className="list__text">
                  <span className="h3">{f.organizacao}</span>
                  <span className="body-s t-tertiary producer__meta">
                    <MapPin size={13} aria-hidden /> {f.cidade}/{f.uf}
                    {f.distanciaKm != null && ` · ${Math.round(f.distanciaKm)} km`} · {f.nome}
                  </span>
                  <span className="body-s t-secondary">{f.produtos}</span>
                </div>
                <div className="producer__actions">
                  <span className="body-s t-tertiary">
                    {f.ofertasAtivas} {f.ofertasAtivas === 1 ? 'oferta ativa' : 'ofertas ativas'}
                  </span>
                  <Button size="s" variant="secondary" to={`/varejista/buscar?q=${encodeURIComponent(f.organizacao)}&raio=100`}>
                    Ver ofertas
                  </Button>
                </div>
              </Card>
            ))}
            <p className="body-s t-tertiary">
              Os produtores aparecem aqui quando você favorita uma oferta deles.{' '}
              <Link to="/varejista/buscar" className="t-brand">
                Buscar produtos
              </Link>
            </p>
          </div>
        )}
      </LoadState>
    </div>
  )
}
