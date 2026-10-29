/* Formatação pt-BR com Intl (evita formatos montados à mão) */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const formatBRL = (value) => brl.format(value)
export const formatTime = (date = new Date()) => time.format(date)
