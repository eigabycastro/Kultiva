/* Fotos dos produtos (Wikimedia Commons, licenças livres — créditos em /creditos).
   São exemplos: quando o back-end existir, use a foto que o produtor enviou na oferta.
   kind: alface | tomate | morango | couve | cenoura | banana */
import { Sprout } from 'lucide-react'
import alface from '../assets/produce/alface.jpg'
import tomate from '../assets/produce/tomate.jpg'
import morango from '../assets/produce/morango.jpg'
import couve from '../assets/produce/couve.jpg'
import cenoura from '../assets/produce/cenoura.jpg'
import banana from '../assets/produce/banana.jpg'

export const PHOTOS = { alface, tomate, morango, couve, cenoura, banana }

// Produto sem foto (ex.: cadastrado pelo produtor): ilustração genérica em vez de uma foto errada
function Placeholder({ className, style, label, size }) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', background: 'var(--bg-brand-subtle)', color: 'var(--icon-brand)', flexShrink: 0, ...style }}
    >
      <Sprout size={size ?? 40} strokeWidth={1.5} />
    </span>
  )
}

/* `label` descreve a foto para leitores de tela; sem ele, a imagem é decorativa */
export default function ProduceArt({ kind = 'alface', className, style, label, position = 'center' }) {
  if (!PHOTOS[kind]) return <Placeholder className={className} style={style} label={label} />
  return (
    <img
      src={PHOTOS[kind] ?? PHOTOS.alface}
      alt={label ?? ''}
      className={className}
      loading="lazy"
      decoding="async"
      width={900}
      height={600}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, ...style }}
    />
  )
}

/* Miniatura quadrada (listas, tabelas, cards Procura-se) */
export function ProduceThumb({ kind, size = 32, radius = 8 }) {
  if (!PHOTOS[kind]) return <Placeholder size={size * 0.5} style={{ width: size, height: size, borderRadius: radius }} />
  return (
    <img
      src={PHOTOS[kind] ?? PHOTOS.alface}
      alt=""
      loading="lazy"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0, display: 'block' }}
    />
  )
}
