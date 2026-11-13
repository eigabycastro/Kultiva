/* Formatação pt-BR com Intl (evita formatos montados à mão) */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const fullDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
const int = new Intl.NumberFormat('pt-BR')
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })

export const formatBRL = (value) => brl.format(value ?? 0)
export const formatBRLCompact = (value) => `R$ ${compact.format(value ?? 0)}`
export const formatTime = (date = new Date()) => time.format(new Date(date))
export const formatDay = (date) => (date ? dayMonth.format(new Date(date)) : '—')
export const formatDate = (date) => (date ? fullDate.format(new Date(date)) : '—')
export const formatWeekday = (date) => (date ? weekday.format(new Date(date)).replace('.', '') : '—')
export const formatInt = (n) => int.format(n ?? 0)

// "120 maços", "1 caixa", "300 kg"
const PLURAL = { maço: 'maços', caixa: 'caixas', unidade: 'unidades', dúzia: 'dúzias' }
export const formatQty = (n, unit) => `${formatInt(n)} ${n === 1 ? unit : (PLURAL[unit] ?? unit)}`

// Data para <input type="date"> (yyyy-mm-dd, no fuso local)
export const toInputDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}
export const todayInput = () => toInputDate(new Date())

// "há 5 min", "há 2 h", "ontem", "12/10"
export function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  if (diff < 172800) return 'ontem'
  return formatDay(date)
}

// Aceita "3,20", "R$ 3,20" ou "3.2"
export const parseMoney = (v) => {
  if (v === '' || v == null) return null
  const n = Number(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
export const moneyInput = (n) => (n == null ? '' : String(n.toFixed(2)).replace('.', ','))
