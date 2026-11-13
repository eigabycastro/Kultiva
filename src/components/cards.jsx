import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Heart, MapPin, MessageCircle, Send, ShoppingCart, Sprout, Star, TrendingUp } from 'lucide-react'
import { Avatar, Badge, Button, Card, cx } from './ui'
import ProduceArt, { ProduceThumb } from './ProduceArt'
import { formatBRL, formatDay, formatInt, formatQty } from '../utils/format'
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

/* Card de produto — marketplace do varejista (recebe uma oferta da API) */
export function ProductCard({ product: p, to, negotiateTo, onToggleFav, preview }) {
  const [localFav, setLocalFav] = useState(false)
  const fav = onToggleFav ? Boolean(p.favorito) : localFav
  const toggle = () => (onToggleFav ? onToggleFav(p) : setLocalFav((v) => !v))
  const title = [p.produto, p.variedade].filter(Boolean).join(' · ')
  return (
    <Card as="article" className="product-card">
      <div className="product-card__media">
        {preview && !p.kind ? (
          <div className="product-card__placeholder">
            <Sprout strokeWidth={1.5} aria-hidden />
          </div>
        ) : (
          <ProduceArt kind={p.kind} className="product-card__art" />
        )}
        {p.tag && (
          <Badge tone={p.tagTone} className="product-card__tag">
            {p.tag}
          </Badge>
        )}
        <button
          type="button"
          className={cx('product-card__fav', fav && 'is-on')}
          aria-label={fav ? `Remover ${p.produto} dos favoritos` : `Favoritar ${p.produto}`}
          aria-pressed={fav}
          onClick={toggle}
        >
          <Heart size={16} strokeWidth={2} fill={fav ? 'currentColor' : 'none'} aria-hidden />
        </button>
      </div>
      <div className="product-card__body">
        <div className="product-card__title">
          {to ? (
            <Link to={to} className="label-m product-card__name">
              {title}
            </Link>
          ) : (
            <span className="label-m product-card__name">{title}</span>
          )}
          {p.organico && <Badge tone="success">Orgânico</Badge>}
        </div>
        <div className="product-card__farm body-s t-tertiary">
          <MapPin size={14} strokeWidth={2} aria-hidden />
          {p.propriedade?.nome}
          {p.distanciaKm != null && ` · ${formatInt(Math.round(p.distanciaKm))} km`}
        </div>
        <div className="product-card__price">
          <span>
            <strong className="price">{formatBRL(p.preco)}</strong>
            <span className="body-s t-tertiary"> / {p.unidade}</span>
          </span>
          <span className="body-s t-tertiary">{formatQty(p.quantidadeDisponivel, p.unidade)}</span>
        </div>
        <Button size="s" variant="secondary" block icon={negotiateTo ? MessageCircle : ShoppingCart} to={negotiateTo ?? to}>
          {negotiateTo ? 'Negociar' : 'Ver e pedir'}
        </Button>
      </div>
    </Card>
  )
}

/* Card "Procura-se" — varejista publica o que precisa, produtor oferece (recebe uma demanda da API) */
export function DemandCard({ demand: d, onOffer, offerTo, actions }) {
  const status = d.status === 'ENCERRADA' ? ['Encerrada', 'neutral'] : d.urgente ? ['Urgente', 'warning'] : d.compativel ? ['Compatível', 'success'] : ['Aberta', 'info']
  return (
    <Card as="article" className="demand-card">
      <div className="demand-card__head">
        <Avatar initials={d.varejista?.iniciais ?? '?'} />
        <div className="demand-card__buyer">
          <span className="label-m">{d.varejista?.organizacao}</span>
          <span className="body-s t-tertiary">
            {d.varejista?.tipoEstabelecimento ?? 'Varejista'}
            {d.distanciaKm != null && ` · ${Math.round(d.distanciaKm)} km`}
          </span>
        </div>
        <Badge tone={status[1]}>{status[0]}</Badge>
      </div>
      <div className="demand-card__title">
        <ProduceThumb kind={d.kind} size={32} />
        <span>
          {formatQty(d.quantidade, d.unidade)} de {d.produto}
        </span>
      </div>
      <div className="demand-card__meta body-s t-secondary">
        <span>
          <Calendar size={14} strokeWidth={2} aria-hidden />
          {d.frequencia && d.frequencia !== 'Compra única' ? `${d.frequencia} · ` : ''}Entrega até {formatDay(d.prazo)}
        </span>
        <span>
          <TrendingUp size={14} strokeWidth={2} aria-hidden />
          {d.precoMaximo != null ? `Até ${formatBRL(d.precoMaximo)}/${d.unidade}` : 'Preço a combinar'}
        </span>
      </div>
      {d.minhaOferta && (
        <p className="body-s t-success">
          Você tem {formatQty(d.minhaOferta.quantidadeDisponivel, d.minhaOferta.unidade)} de {d.minhaOferta.produto.toLowerCase()} disponíveis.
        </p>
      )}
      {d.observacoes && <p className="body-s t-tertiary">“{d.observacoes}”</p>}
      {actions ?? (
        <div className="demand-card__actions">
          <Button size="s" icon={Send} onClick={onOffer} to={offerTo} className="demand-card__offer">
            Oferecer produto
          </Button>
        </div>
      )}
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
