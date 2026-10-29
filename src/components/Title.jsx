import { useSyncExternalStore } from 'react'

const QUERY = '(max-width: 768px)'
const subscribe = (cb) => {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const isMobile = () => window.matchMedia(QUERY).matches

/* Cada tela tem um título no layout desktop e outro no mobile (um deles fica oculto).
   Só o que está visível vira <h1>; o outro é um parágrafo, para nunca haver dois h1. */
export default function Title({ mobile = false, as: Tag = 'p', className, children }) {
  const mobileNow = useSyncExternalStore(subscribe, isMobile, () => false)
  return mobile === mobileNow ? <h1 className={className}>{children}</h1> : <Tag className={className}>{children}</Tag>
}
