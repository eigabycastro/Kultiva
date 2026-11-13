const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })

export const num = (d) => (d == null ? null : Number(d))
export const formatBRL = (v) => brl.format(Number(v))
export const formatDia = (d) => dia.format(new Date(d))
export const codigoPedido = (id) => `#KT-${1000 + id}`
export const iniciais = (nome = '') =>
  nome
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-ZÀ-Ú]/.test(p))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'

// "1 caixa", "220 maços", "300 kg"
const PLURAL = { maço: 'maços', caixa: 'caixas', unidade: 'unidades', dúzia: 'dúzias' }
export const qtd = (n, unidade) => `${new Intl.NumberFormat('pt-BR').format(n)} ${n === 1 ? unidade : (PLURAL[unidade] ?? unidade)}`
