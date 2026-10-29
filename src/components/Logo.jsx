import logoMark from '../assets/logo-kultiva.png'

/* Logo Kultiva — o símbolo oficial (trator, celeiro, sol e campos) + logotipo digitado.
   theme="light": sobre fundo claro · theme="dark": sobre o verde da marca, com o símbolo num selo claro. */

const RATIO = 696 / 580 // largura / altura do símbolo original

export function LogoMark({ size = 56, framed = false }) {
  const h = Math.round(framed ? size * 0.86 : size)
  const img = (
    <img
      src={logoMark}
      alt=""
      width={Math.round(h * RATIO)}
      height={h}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
  if (!framed) return img
  return (
    <span
      style={{
        display: 'grid',
        placeItems: 'center',
        width: Math.round(size * 1.12),
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: '#f6fbe9',
      }}
    >
      {img}
    </span>
  )
}

export default function Logo({ theme = 'light', size = 'm' }) {
  const mark = size === 's' ? 42 : 60
  const font = size === 's' ? 26 : 36
  return (
    <span className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: size === 's' ? 8 : 14 }}>
      <LogoMark size={mark} framed={theme === 'dark'} />
      <span
        translate="no"
        style={{
          fontSize: font,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: '-0.6px',
          color: theme === 'dark' ? '#fff' : 'var(--text-brand)',
        }}
      >
        kultiva
      </span>
    </span>
  )
}
