import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Heart, MapPin, MessageCircle, Send, Sprout, Star, TrendingUp } from 'lucide-react'
import { Avatar, Badge, Button, Card, cx } from './ui'
import ProduceArt, { ProduceThumb } from './ProduceArt'
import './cards.css'

/* Card de indicador (KPI) — número em destaque + variação */
// eslint-disable-next-line no-unused-vars
export function StatCard({ icon: iconName, label, mobileLabel, value, mobileValue, delta, tone = 'success', note, className }) {
  const both = (a, b) =>
    b ? (
      <>
        <span className="only-desktop">{a}</span>
        <span className="only-mobile">{b}</span>
      </>
    ) : (
      a
    )
  return (
    <div className={cx('stat-card', className)}>
      <span className="stat-card__label">{both(label, mobileLabel)}</span>
      <span className="stat-card__value">{both(value, mobileValue)}</span>
      <span className="stat-card__foot">
        <span className={cx('stat-card__delta', `stat-card__delta--${tone}`)}>{delta}</span>
        {note && <span className="stat-card__note"> {note}</span>}
      </span>
    </div>
  )
}

export function Rating({ value }) {
  return (
    <span className="rating">
      <Star size={14} fill="#8d5b00" color="#8d5b00" aria-hidden />
      {value}
    </span>
  )
}

/* Card de produto — marketplace do varejista */
export function ProductCard({ product, to, onNegotiate, negotiateTo, preview }) {
  const p = product
  const [fav, setFav] = useState(false)
  return (
    <Card as="article" className="product-card">
      <div className="product-card__media">
        {preview ? (
          <div className="product-card__placeholder">
            <Sprout strokeWidth={1.5} aria-hidden />
          </div>
        ) : (
          <ProduceArt kind={p.kind} className="product-card__art" />
        )}
        <Badge tone={p.tagTone} className="product-card__tag">
          {p.tag}
        </Badge>
        <button
          type="button"
          className={cx('product-card__fav', fav && 'is-on')}
          aria-label={`Favoritar ${p.name}`}
          aria-pressed={fav}
          onClick={() => setFav((v) => !v)}
        >
          <Heart size={16} strokeWidth={2} fill={fav ? 'currentColor' : 'none'} aria-hidden />
        </button>
      </div>
      <div className="product-card__body">
        <div className="product-card__title">
          {to ? (
            <Link to={to} className="label-m product-card__name">
              {p.name}
            </Link>
          ) : (
            <span className="label-m product-card__name">{p.name}</span>
          )}
          <Rating value={p.rating} />
        </div>
        <div className="product-card__farm body-s t-tertiary">
          <MapPin size={14} strokeWidth={2} aria-hidden />
          {p.farm} · {p.km} km
        </div>
        <div className="product-card__price">
          <span>
            <strong className="price">{p.price}</strong>
            <span className="body-s t-tertiary"> / {p.unit}</span>
          </span>
          <span className="body-s t-tertiary">{p.stock}</span>
        </div>
        <Button size="s" variant="secondary" block icon={MessageCircle} onClick={onNegotiate} to={negotiateTo}>
          Negociar
        </Button>
      </div>
    </Card>
  )
}

/* Card "Procura-se" — varejista publica o que precisa, produtor oferece */
export function DemandCard({ demand, onOffer, offerTo }) {
  const d = demand
  const both = (a, b) =>
    b ? (
      <>
        <span className="only-desktop">{a}</span>
        <span className="only-mobile">{b}</span>
      </>
    ) : (
      a
    )
  return (
    <Card as="article" className="demand-card">
      <div className="demand-card__head">
        <Avatar initials={d.initials} />
        <div className="demand-card__buyer">
          <span className="label-m">{both(d.buyer, d.shortBuyer)}</span>
          <span className="body-s t-tertiary">
            {d.type}
            {d.km != null && ` · ${d.km} km`}
          </span>
        </div>
        <Badge tone={d.tone}>{d.status}</Badge>
      </div>
      <div className="demand-card__title">
        <ProduceThumb kind={d.kind} size={32} />
        <span>{both(d.title, d.mobileTitle)}</span>
      </div>
      <div className="demand-card__meta body-s t-secondary">
        <span>
          <Calendar size={14} strokeWidth={2} aria-hidden />
          {d.deadline}
        </span>
        <span>
          <TrendingUp size={14} strokeWidth={2} aria-hidden />
          {d.maxPrice}
        </span>
      </div>
      <div className="demand-card__actions">
        <Button size="s" icon={Send} onClick={onOffer} to={offerTo} className="demand-card__offer">
          Oferecer produto
        </Button>
        <Button size="s" variant="secondary">
          Detalhes
        </Button>
      </div>
    </Card>
  )
}

/* Balão de chat — recebido = areia; enviado = verde da marca */
export function ChatBubble({ side = 'in', text, time }) {
  return (
    <div className={cx('bubble-row', `bubble-row--${side}`)}>
      <div className={cx('bubble', `bubble--${side}`)}>
        <p>{text}</p>
        <span className="bubble__time">{time}</span>
      </div>
    </div>
  )
}
