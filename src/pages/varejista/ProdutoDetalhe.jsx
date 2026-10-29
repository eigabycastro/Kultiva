import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Minus, Plus, ShieldCheck, Star, User } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '../../components/ui'
import ProduceArt from '../../components/ProduceArt'
import { products } from '../../data/mock'
import { formatBRL } from '../../utils/format'
import '../pages.css'
import './detalhe.css'

const HISTORY = [3.4, 3.35, 3.3, 3.3, 3.25, 3.35, 3.3, 3.2]
const REVIEWS = [
  { name: 'Mercadinho Central', rating: '5,0', text: 'Entrega no horário e folhas bem frescas.' },
  { name: 'Hortifruti Bom Preço', rating: '5,0', text: 'Bom preço para pedido semanal. Recomendo.' },
]

export default function ProdutoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = products.find((x) => x.id === id) ?? products[0]
  const [qty, setQty] = useState(120)
  const [thumb, setThumb] = useState(0)
  const [fav, setFav] = useState(false)
  const max = Math.max(...HISTORY)

  return (
    <div className="page detail">
      <nav className="breadcrumb body-s only-desktop" aria-label="Caminho">
        <Link to="/varejista/buscar">Buscar produtos</Link>
        <ChevronRight size={14} aria-hidden />
        <span>Hortaliças</span>
        <ChevronRight size={14} aria-hidden />
        <span className="t-primary">{p.name}</span>
      </nav>

      <div className="detail__top">
        <div className="detail__gallery">
          <div className="detail__hero">
            <ProduceArt kind={p.kind} label={`Foto de ${p.name}`} style={{ width: '100%', height: '100%' }} />
            <button type="button" className="detail__back only-mobile" aria-label="Voltar" onClick={() => navigate(-1)}>
              <ChevronLeft size={22} aria-hidden />
            </button>
          </div>
          <div className="detail__thumbs only-desktop">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                className={thumb === i ? 'detail__thumb is-active' : 'detail__thumb'}
                onClick={() => setThumb(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={thumb === i}
              >
                <ProduceArt kind={p.kind} position={['center', 'left', 'right', 'top'][i]} style={{ transform: `scale(${1 + i * 0.2})` }} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail__info">
          <div className="chip-group">
            <Badge tone="brand">Colhido hoje</Badge>
            <Badge tone="success">
              <span className="only-desktop">Orgânico certificado</span>
              <span className="only-mobile">Orgânico</span>
            </Badge>
            <Badge tone="info">
              <span className="only-desktop">Entrega inclusa até 15 km</span>
              <span className="only-mobile">Entrega inclusa</span>
            </Badge>
          </div>
          <h1 className="detail__title">{p.name}</h1>

          <div className="seller only-desktop">
            <Avatar initials="JS" />
            <div className="list__text">
              <span className="label-m seller__name">
                {p.farm} · João Silva <ShieldCheck size={16} color="var(--icon-brand)" aria-hidden />
              </span>
              <span className="body-s t-tertiary seller__meta">
                <Star size={12} fill="#8d5b00" color="#8d5b00" aria-hidden /> {p.rating} · 32 avaliações · {p.km} km de
                você · responde em 5 min
              </span>
            </div>
            <Button variant="ghost" size="s" icon={User}>
              Ver perfil
            </Button>
          </div>

          <div className="detail__price">
            <span className="detail__price-value">{p.price}</span>
            <span className="body-m t-tertiary">
              / {p.unit}
              <span className="only-mobile"> · mín. 20</span>
            </span>
          </div>

          <div className="stock">
            <div className="row-between body-s">
              <span className="t-secondary">Estoque em tempo real</span>
              <span className="label-s t-brand">240 de 300 maços</span>
            </div>
            <div className="stock__bar">
              <span style={{ width: '80%' }} />
            </div>
          </div>

          <div className="seller only-mobile">
            <Avatar initials="JS" />
            <div className="list__text">
              <span className="label-m">{p.farm}</span>
              <span className="body-s t-tertiary">
                {p.rating} · {p.km} km · responde em 5 min
              </span>
            </div>
          </div>

          <dl className="facts">
            <div>
              <dt>Colheita</dt>
              <dd>Hoje, 08/10 · 6h</dd>
            </div>
            <div className="only-desktop">
              <dt>Pedido mínimo</dt>
              <dd>20 maços</dd>
            </div>
            <div>
              <dt>Disponível até</dt>
              <dd>12/10</dd>
            </div>
            <div className="only-mobile">
              <dt>Entrega</dt>
              <dd>Inclusa até 15 km</dd>
            </div>
          </dl>

          <div className="detail__actions">
            <div className="stepper">
              <button type="button" aria-label="Diminuir" onClick={() => setQty((q) => Math.max(20, q - 10))}>
                <Minus size={16} aria-hidden />
              </button>
              <span className="label-m stepper__value" aria-live="polite" aria-atomic="true">
                {qty}
                <span className="only-desktop"> maços</span>
                <span className="only-mobile sr-only"> maços</span>
              </span>
              <button type="button" aria-label="Aumentar" onClick={() => setQty((q) => Math.min(240, q + 10))}>
                <Plus size={16} aria-hidden />
              </button>
            </div>
            <Button icon={MessageCircle} className="detail__cta" to="/varejista/negociacoes">
              <span className="only-desktop">Negociar com o produtor</span>
              <span className="only-mobile">Negociar</span>
            </Button>
            <button
              type="button"
              className={fav ? 'fav-btn is-on only-desktop' : 'fav-btn only-desktop'}
              aria-label={`Favoritar ${p.name}`}
              aria-pressed={fav}
              onClick={() => setFav((v) => !v)}
            >
              <Heart size={18} fill={fav ? 'currentColor' : 'none'} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="detail__bottom">
        <Card className="panel">
          <div>
            <h2 className="h3">
              <span className="only-desktop">Histórico de preço — 30 dias</span>
              <span className="only-mobile">Preço nos últimos 30 dias</span>
            </h2>
            <p className="body-s t-tertiary only-desktop">R$/maço nesta região</p>
          </div>
          <div className="mini-bars">
            {HISTORY.map((v, i) => (
              <span
                key={i}
                style={{ height: `${(v / max) * 100}%` }}
                className={i === HISTORY.length - 1 ? 'is-last' : undefined}
                title={formatBRL(v)}
              />
            ))}
          </div>
          <p className="body-s" style={{ color: 'var(--text-success)' }}>
            <span className="only-desktop">Preço atual está 4% abaixo da média dos atravessadores (R$ 3,33).</span>
            <span className="only-mobile">4% abaixo da média dos atravessadores</span>
          </p>
        </Card>

        <Card className="panel only-desktop">
          <div>
            <h2 className="h3">Avaliações de compradores</h2>
            <p className="body-s t-tertiary">Pedidos entregues nos últimos 30 dias</p>
          </div>
          <div className="stack-16">
            {REVIEWS.map((r) => (
              <div key={r.name} className="review">
                <span className="label-m">
                  {r.name}
                  <Star size={14} fill="#8d5b00" color="#8d5b00" aria-hidden />
                  <span className="label-s">{r.rating}</span>
                </span>
                <p className="body-s t-secondary">{r.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
