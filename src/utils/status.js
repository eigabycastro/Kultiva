// Rótulos e cores dos status vindos da API
export const ORDER_STATUS = {
  PENDENTE: { label: 'Aguardando produtor', short: 'Pendente', tone: 'warning' },
  ACEITO: { label: 'Aceito · entrega agendada', short: 'Aceito', tone: 'info' },
  ENTREGUE: { label: 'Entregue', short: 'Entregue', tone: 'success' },
  RECUSADO: { label: 'Recusado', short: 'Recusado', tone: 'danger' },
  CANCELADO: { label: 'Cancelado', short: 'Cancelado', tone: 'danger' },
}

export const OFFER_STATUS = {
  ATIVA: { label: 'Ativa', tone: 'success' },
  ACABANDO: { label: 'Acabando', tone: 'warning' },
  PAUSADA: { label: 'Pausada', tone: 'neutral' },
  RASCUNHO: { label: 'Rascunho', tone: 'info' },
  ESGOTADA: { label: 'Esgotada', tone: 'danger' },
}
export const offerStatusOf = (o) => OFFER_STATUS[o.acabando ? 'ACABANDO' : o.status]

export const ORDER_ACTIONS = {
  aceitar: { label: 'Aceitar', variant: 'primary', done: 'Pedido aceito. O estoque foi atualizado.' },
  recusar: { label: 'Recusar', variant: 'secondary', done: 'Pedido recusado.', ask: 'Motivo da recusa (opcional):' },
  entregar: { label: 'Marcar entregue', variant: 'primary', done: 'Pedido marcado como entregue.' },
  cancelar: { label: 'Cancelar', variant: 'ghost', done: 'Pedido cancelado.', ask: 'Motivo do cancelamento (opcional):' },
}

export const PERFIL_LABEL = { PRODUTOR: 'Produtor rural', VAREJISTA: 'Varejista', ADMIN: 'Administrador' }

export const UNITS = ['kg', 'maço', 'caixa', 'unidade', 'dúzia']
