/* Fotos dos produtos (Wikimedia Commons, licenças livres — créditos em /creditos).
   São exemplos: quando o back-end existir, use a foto que o produtor enviou na oferta.
   kind: alface | tomate | morango | couve | cenoura | banana */
import alface from '../assets/produce/alface.jpg'
import tomate from '../assets/produce/tomate.jpg'
import morango from '../assets/produce/morango.jpg'
import couve from '../assets/produce/couve.jpg'
import cenoura from '../assets/produce/cenoura.jpg'
import banana from '../assets/produce/banana.jpg'

export const PHOTOS = { alface, tomate, morango, couve, cenoura, banana }

/* `label` descreve a foto para leitores de tela; sem ele, a imagem é decorativa */
export default function ProduceArt({ kind = 'alface', className, style, label, position = 'center' }) {
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
