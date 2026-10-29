/* Dados de exemplo usados pelas telas.
   Back-end: substituir estes objetos pelas respostas da API mantendo os mesmos campos. */

export const users = {
  produtor: { name: 'João Silva', firstName: 'João', initials: 'JS', role: 'Produtor rural', farm: 'Sítio Boa Vista', city: 'Pouso Alegre' },
  varejista: { name: 'Mercado Mais', firstName: 'Mercado Mais', initials: 'SM', role: 'Varejista', city: 'Pouso Alegre' },
}

export const location = { label: 'Pouso Alegre, MG', radiusKm: 30 }

export const producerKpis = [
  { icon: 'chart', label: 'Vendas do mês', value: 'R$ 18.420', mobileValue: 'R$ 18,4 mil', delta: '+12%', tone: 'success', note: 'vs. setembro' },
  { icon: 'truck', label: 'Pedidos ativos', value: '14', delta: '+3', tone: 'success', note: 'nesta semana' },
  { icon: 'package', label: 'Produtos ofertados', value: '8', delta: '2 acabando', tone: 'warning', note: 'reabasteça o estoque' },
  { icon: 'star', label: 'Avaliação média', mobileLabel: 'Avaliação', value: '4,8', delta: '+0,2', tone: 'success', note: '32 avaliações' },
]

export const retailerKpis = [
  { icon: 'cart', label: 'Comprado em outubro', value: 'R$ 12.860', delta: '+18%', tone: 'success', note: 'vs. setembro' },
  { icon: 'truck', label: 'Pedidos concluídos', value: '23', delta: '+5', tone: 'success', note: 'este mês' },
  { icon: 'trending', label: 'Economia estimada', value: 'R$ 2.140', delta: '-14%', tone: 'success', note: 'vs. atravessador' },
  { icon: 'user', label: 'Produtores parceiros', value: '9', delta: '+2', tone: 'success', note: 'num raio de 30 km' },
]

export const priceForecast = {
  product: 'Tomate italiano',
  bars: [
    { date: '01/09', price: 4.2 },
    { date: '08/09', price: 4.6 },
    { date: '15/09', price: 4.4 },
    { date: '22/09', price: 5.1 },
    { date: '29/09', price: 5.3 },
    { date: '06/10', price: 5.2 },
    { date: '13/10', price: 5.8, forecast: true },
    { date: '20/10', price: 6.1, forecast: true },
    { date: '27/10', price: 5.6, forecast: true },
  ],
}

export const products = [
  { id: 'alface-crespa', kind: 'alface', name: 'Alface crespa orgânica', farm: 'Sítio Boa Vista', farmShort: 'Sítio Boa Vista', km: 12, rating: '4,8', price: 'R$ 3,20', unit: 'maço', unitShort: 'maço', stock: '240 disponíveis', stockShort: '240 disp.', tag: 'Colhido hoje', tagTone: 'brand' },
  { id: 'tomate-italiano', kind: 'tomate', name: 'Tomate italiano', farm: 'Fazenda Santa Luzia', farmShort: 'Faz. Santa Luzia', km: 18, rating: '4,9', price: 'R$ 5,40', unit: 'kg', unitShort: 'kg', stock: '820 kg disponíveis', stockShort: '820 kg', tag: 'Selo de qualidade', tagTone: 'success' },
  { id: 'morango', kind: 'morango', name: 'Morango', farm: 'Chácara Recanto', farmShort: 'Chácara Recanto', km: 22, rating: '4,7', price: 'R$ 12,00', unit: 'caixa', unitShort: 'cx', stock: '65 caixas', stockShort: '65 cx', tag: 'Colhido hoje', tagTone: 'brand' },
  { id: 'couve-manteiga', kind: 'couve', name: 'Couve manteiga', farm: 'Horta da Serra', farmShort: 'Horta da Serra', km: 9, rating: '4,6', price: 'R$ 2,50', unit: 'maço', unitShort: 'maço', stock: '180 disponíveis', stockShort: '180 disp.', tag: 'Pronto p/ colheita', tagTone: 'warning' },
  { id: 'cenoura', kind: 'cenoura', name: 'Cenoura', farm: 'Sítio Dois Irmãos', farmShort: 'Sítio Dois Irmãos', km: 26, rating: '4,5', price: 'R$ 3,80', unit: 'kg', unitShort: 'kg', stock: '920 kg disponíveis', stockShort: '920 kg', tag: 'Pronto p/ colheita', tagTone: 'warning' },
  { id: 'banana-prata', kind: 'banana', name: 'Banana prata', farm: 'Fazenda Água Limpa', farmShort: 'Faz. Água Limpa', km: 28, rating: '4,8', price: 'R$ 4,20', unit: 'kg', unitShort: 'kg', stock: '1.200 kg disponíveis', stockShort: '1.200 kg', tag: 'Selo de qualidade', tagTone: 'success' },
]

export const demands = [
  { id: 1, buyer: 'Supermercado Mais', initials: 'SM', type: 'Supermercado', km: 8, status: 'Urgente', tone: 'warning', kind: 'tomate', title: '300 kg de Tomate italiano', short: 'Tomate italiano · 300 kg', deadline: 'Entrega até 12/10', maxPrice: 'Até R$ 5,80/kg' },
  { id: 2, buyer: 'Restaurante Sabor da Terra', shortBuyer: 'Sabor da Terra', initials: 'ST', type: 'Restaurante', km: 5, status: 'Novo', tone: 'info', kind: 'alface', title: '150 maços de Alface americana', mobileTitle: '150 maços de Alface', short: 'Alface americana · 150 maços', deadline: 'Entrega até 10/10', maxPrice: 'Até R$ 3,50/maço' },
  { id: 3, buyer: 'Mercadinho Central', initials: 'MC', type: 'Mercado', km: 14, status: 'Novo', tone: 'info', kind: 'morango', title: '30 caixas de Morango', short: 'Morango · 30 caixas', deadline: 'Entrega até 15/10', maxPrice: 'Até R$ 13,00/cx' },
  { id: 4, buyer: 'Hortifruti Bom Preço', initials: 'HB', type: 'Hortifruti', km: 11, status: 'Recorrente', tone: 'success', kind: 'couve', title: '80 maços de Couve por semana', short: 'Couve manteiga · 80 maços', deadline: 'Toda segunda-feira', maxPrice: 'Até R$ 2,80/maço' },
  { id: 5, buyer: 'Escola Municipal Aurora', initials: 'EA', type: 'Compra institucional', km: 6, status: 'Novo', tone: 'info', kind: 'banana', title: '200 kg de Banana prata', short: 'Banana prata · 200 kg', deadline: 'Entrega até 18/10', maxPrice: 'Até R$ 4,00/kg' },
  { id: 6, buyer: 'Distribuidora Vale Verde', initials: 'VV', type: 'Distribuidor', km: 21, status: 'Urgente', tone: 'warning', kind: 'cenoura', title: '1 tonelada de Cenoura', short: 'Cenoura · 1 t', deadline: 'Entrega até 11/10', maxPrice: 'Até R$ 3,40/kg' },
]

export const nearbyDemands = [
  { ...demands[0], subtitle: 'Supermercado Mais · 8 km · até 12/10', mobileSubtitle: 'Supermercado Mais · 8 km' },
  { ...demands[1], subtitle: 'Sabor da Terra · 5 km · até 10/10', mobileSubtitle: 'Sabor da Terra · 5 km' },
  { ...demands[2], subtitle: 'Mercadinho Central · 14 km · até 15/10', mobileSubtitle: 'Mercadinho Central · 14 km' },
  { ...demands[3], subtitle: 'Hortifruti Bom Preço · 11 km · toda segunda', mobileSubtitle: 'Hortifruti Bom Preço · 11 km' },
  { ...demands[4], subtitle: 'Escola Municipal Aurora · 6 km · até 18/10', mobileSubtitle: 'Escola Municipal Aurora · 6 km' },
]

const STATUS = {
  negociacao: { label: 'Em negociação', tone: 'info' },
  confirmado: { label: 'Confirmado', tone: 'success' },
  aguardando: { label: 'Aguardando entrega', tone: 'warning' },
  agendada: { label: 'Entrega agendada', tone: 'warning' },
  concluido: { label: 'Concluído', tone: 'success' },
  cancelado: { label: 'Cancelado', tone: 'danger' },
}
export const orderStatus = STATUS

export const recentOrders = [
  { id: '#KT-1042', buyer: 'Supermercado Mais', initials: 'SM', product: 'Alface crespa', kind: 'alface', qty: '120 maços', value: 'R$ 384,00', status: 'negociacao' },
  { id: '#KT-1041', buyer: 'Restaurante Sabor da Terra', initials: 'ST', product: 'Tomate italiano', kind: 'tomate', qty: '80 kg', value: 'R$ 432,00', status: 'confirmado' },
  { id: '#KT-1039', buyer: 'Mercadinho Central', initials: 'MC', product: 'Morango', kind: 'morango', qty: '40 caixas', value: 'R$ 760,00', status: 'aguardando' },
  { id: '#KT-1036', buyer: 'Hortifruti Bom Preço', initials: 'HB', product: 'Couve manteiga', kind: 'couve', qty: '60 maços', value: 'R$ 150,00', status: 'concluido' },
]

export const orderHistory = [
  { id: '#KT-1042', seller: 'Sítio Boa Vista', initials: 'SB', buyer: 'Supermercado Mais', buyerInitials: 'SM', product: 'Alface crespa', kind: 'alface', qty: '120 maços', qtyShort: '120 maços', unitPrice: 'R$ 3,20', total: 'R$ 384,00', date: '09/10', status: 'agendada' },
  { id: '#KT-1038', seller: 'Fazenda Santa Luzia', initials: 'FS', buyer: 'Restaurante Sabor da Terra', buyerInitials: 'ST', product: 'Tomate italiano', kind: 'tomate', qty: '500 kg', qtyShort: '500 kg', unitPrice: 'R$ 5,20', total: 'R$ 2.600,00', date: '06/10', status: 'concluido' },
  { id: '#KT-1033', seller: 'Chácara Recanto', initials: 'CR', buyer: 'Mercadinho Central', buyerInitials: 'MC', product: 'Morango', kind: 'morango', qty: '40 caixas', qtyShort: '40 cx', unitPrice: 'R$ 12,00', total: 'R$ 480,00', date: '03/10', status: 'concluido' },
  { id: '#KT-1029', seller: 'Horta da Serra', initials: 'HS', buyer: 'Hortifruti Bom Preço', buyerInitials: 'HB', product: 'Couve manteiga', kind: 'couve', qty: '80 maços', qtyShort: '80 maços', unitPrice: 'R$ 2,50', total: 'R$ 200,00', date: '30/09', status: 'concluido' },
  { id: '#KT-1024', seller: 'Sítio Dois Irmãos', initials: 'DI', buyer: 'Escola Municipal Aurora', buyerInitials: 'EA', product: 'Cenoura', kind: 'cenoura', qty: '300 kg', qtyShort: '300 kg', unitPrice: 'R$ 3,80', total: 'R$ 1.140,00', date: '26/09', status: 'cancelado' },
]

export const conversations = [
  { id: 1, name: 'Sítio Boa Vista', initials: 'JS', time: '09:48', last: 'Fechado! Separo 120 maços.' },
  { id: 2, name: 'Fazenda Santa Luzia', initials: 'FS', time: '08:15', last: 'Consigo R$ 5,20 acima de 500 kg', unread: 2 },
  { id: 3, name: 'Chácara Recanto', initials: 'CR', time: 'Ontem', last: 'Morangos colhidos amanhã cedo' },
  { id: 4, name: 'Horta da Serra', initials: 'HS', time: 'Seg', last: 'Enviei a nota fiscal do pedido' },
  { id: 5, name: 'Sítio Dois Irmãos', initials: 'DI', time: '02/10', last: 'Obrigado pela parceria!' },
]

export const chatMessages = [
  { id: 1, side: 'out', text: 'Olá, João! Vocês têm alface crespa para entrega na quinta?', time: '09:32' },
  { id: 2, side: 'in', text: 'Bom dia! Tenho sim, 240 maços colhidos hoje cedo.', time: '09:35' },
  { id: 3, side: 'out', text: 'Ótimo. Preciso de 120 maços. Fecha por R$ 3,00 o maço?', time: '09:38' },
  { id: 4, side: 'in', text: 'Para 120 consigo R$ 3,20 com entrega inclusa até 12 km.', mobileText: 'Para 120 consigo R$ 3,20 com entrega inclusa.', time: '09:41' },
  { id: 5, side: 'proposal', time: '09:42' },
  { id: 6, side: 'out', text: 'Perfeito, pode separar!', time: '09:46' },
  { id: 7, side: 'in', text: 'Fechado! Separo 120 maços.', time: '09:48' },
]

export const notifications = [
  { id: 1, type: 'Demandas', icon: 'megaphone', tone: 'accent', unread: true, title: 'Supermercado Mais procura 300 kg de Tomate italiano', mobileTitle: 'Supermercado Mais procura 300 kg de tomate', text: 'Você tem 820 kg disponíveis · paga até R$ 5,80/kg · entrega até 12/10', mobileText: 'Você tem 820 kg · paga até R$ 5,80/kg', time: 'há 5 min', action: { label: 'Oferecer produto', variant: 'primary', icon: 'send' } },
  { id: 2, type: 'Preços', icon: 'trending', tone: 'none', unread: true, title: 'Preço do tomate subiu 8% na sua região', mobileTitle: 'Tomate subiu 8% na região', text: 'Média de R$ 5,60/kg nos últimos 7 dias. A IA recomenda vender entre 13 e 20/10.', mobileText: 'IA recomenda vender entre 13 e 20/10', time: 'há 1 h', action: { label: 'Ver previsão', variant: 'secondary' } },
  { id: 3, type: 'Pedidos', icon: 'check', tone: 'solid', unread: true, title: 'Pedido #KT-1042 confirmado', text: 'Supermercado Mais · 120 maços de alface crespa · R$ 384,00 · entrega qui, 09/10', mobileText: '120 maços de alface · R$ 384,00', time: 'há 2 h' },
  { id: 4, type: 'Mensagens', icon: 'message', tone: 'info', title: 'Nova mensagem de Restaurante Sabor da Terra', mobileTitle: 'Nova mensagem — Sabor da Terra', text: '“Consegue 150 maços de alface americana até sexta?”', time: 'há 3 h', action: { label: 'Responder', variant: 'secondary', icon: 'message' } },
  { id: 5, type: 'Pedidos', icon: 'calendar', tone: 'neutral', title: 'Lembrete: colheita de alface amanhã', mobileTitle: 'Colheita de alface amanhã', text: '240 maços previstos · 120 já reservados', time: 'ontem' },
  { id: 6, type: 'Mensagens', icon: 'star', tone: 'accent-subtle', title: 'Você recebeu uma nova avaliação: 5,0', mobileTitle: 'Nova avaliação: 5,0', text: 'Mercadinho Central avaliou o pedido #KT-1031', mobileText: 'Mercadinho Central · pedido #KT-1031', time: 'seg' },
]

export const plans = [
  {
    id: 'free',
    icon: 'sprout',
    name: 'Gratuito',
    description: 'Para começar a vender e comprar',
    price: 'R$ 0',
    period: '/ sempre',
    cta: 'Plano atual',
    ctaVariant: 'secondary',
    features: ['Cadastro de produtos e estoque', 'Busca de produtores por região', 'Chat de negociação direta', 'Histórico de transações', 'Módulo Procura-se'],
  },
  {
    id: 'fornecedor',
    icon: 'crown',
    name: 'Premium Fornecedor',
    description: 'Para produtores que querem vender mais',
    price: 'R$ 49',
    yearlyPrice: 'R$ 39',
    period: '/ mês',
    cta: 'Assinar Premium',
    ctaVariant: 'accent',
    featured: true,
    features: [
      'Tudo do plano Gratuito',
      'Demonstrativos de clientes: médias de compra e consumo',
      'Raio de alcance ampliado para novos clientes',
      'Destaque no topo dos resultados de busca',
      'Previsão de preço e lucro da safra com IA',
      'Selo de qualidade Kultiva',
    ],
  },
  {
    id: 'cliente',
    icon: 'store',
    name: 'Premium Cliente',
    description: 'Para varejistas que compram com frequência',
    price: 'R$ 39',
    yearlyPrice: 'R$ 31',
    period: '/ mês',
    cta: 'Assinar Premium',
    ctaVariant: 'secondary',
    features: [
      'Tudo do plano Gratuito',
      'Ranking dos melhores produtores por raio',
      'Promoções exclusivas dos fornecedores',
      'Alertas de safra e variação de preço',
      'Relatórios de compras por categoria',
    ],
  },
]

export const calendarEvents = {
  9: [
    { label: 'Colheita · Alface', type: 'colheita' },
    { label: 'Entrega #KT-1042', type: 'entrega' },
  ],
  13: [{ label: 'Janela de venda · Tomate', type: 'janela' }],
  14: [{ label: 'Tomate', type: 'janela' }],
  15: [
    { label: 'Colheita · Morango', type: 'colheita' },
    { label: 'Tomate', type: 'janela' },
  ],
  16: [{ label: 'Tomate', type: 'janela' }],
  17: [{ label: 'Tomate', type: 'janela' }],
  18: [{ label: 'Tomate', type: 'janela' }],
  19: [{ label: 'Tomate', type: 'janela' }],
  20: [{ label: 'Fim da janela · Tomate', type: 'janela' }],
  22: [{ label: 'Plantio · Couve', type: 'plantio' }],
  27: [{ label: 'Colheita · Cenoura', type: 'colheita' }],
  30: [{ label: 'Feira regional', type: 'entrega' }],
}

export const upcomingEvents = [
  { date: '09/10 · qui', title: 'Colheita de alface crespa', text: '240 maços · 120 já vendidos', icon: 'sprout', tone: 'solid' },
  { date: '13–20/10', title: 'Janela de venda do tomate', text: 'IA estima R$ 6,10/kg (+17%)', icon: 'sparkles', tone: 'accent' },
  { date: '15/10 · qui', title: 'Colheita de morango', text: '65 caixas previstas', icon: 'sprout', tone: 'solid' },
  { date: '22/10 · qui', title: 'Plantio de couve', text: 'Colheita prevista em 60 dias', icon: 'calendar', tone: 'info' },
]

/* ---------- Meus produtos (ofertas do produtor) ---------- */
export const myOffers = [
  { id: 'alface-crespa', kind: 'alface', name: 'Alface crespa orgânica', variety: 'Crespa verde', price: 'R$ 3,20', unit: 'maço', stock: 240, total: 300, status: 'ativa', views: 186, chats: 7, harvest: 'Colhida hoje' },
  { id: 'tomate-italiano', kind: 'tomate', name: 'Tomate italiano', variety: 'Santa Cruz', price: 'R$ 5,40', unit: 'kg', stock: 820, total: 1000, status: 'ativa', views: 241, chats: 11, harvest: 'Colhido em 06/10' },
  { id: 'couve-manteiga', kind: 'couve', name: 'Couve manteiga', variety: 'Manteiga', price: 'R$ 2,50', unit: 'maço', stock: 18, total: 180, status: 'acabando', views: 94, chats: 3, harvest: 'Colhida em 07/10' },
  { id: 'morango', kind: 'morango', name: 'Morango', variety: 'San Andreas', price: 'R$ 12,00', unit: 'caixa', stock: 6, total: 65, status: 'acabando', views: 132, chats: 5, harvest: 'Colhido em 08/10' },
  { id: 'cenoura', kind: 'cenoura', name: 'Cenoura', variety: 'Brasília', price: 'R$ 3,80', unit: 'kg', stock: 0, total: 400, status: 'pausada', views: 40, chats: 0, harvest: 'Próxima colheita 27/10' },
  { id: 'banana-prata', kind: 'banana', name: 'Banana prata', variety: 'Prata-anã', price: 'R$ 4,20', unit: 'kg', stock: 0, total: 0, status: 'rascunho', views: 0, chats: 0, harvest: 'Sem data' },
]
export const offerStatus = {
  ativa: { label: 'Ativa', tone: 'success' },
  acabando: { label: 'Acabando', tone: 'warning' },
  pausada: { label: 'Pausada', tone: 'neutral' },
  rascunho: { label: 'Rascunho', tone: 'info' },
}

/* ---------- Previsão IA ---------- */
export const forecasts = {
  'Tomate italiano': {
    unit: 'kg',
    today: 5.2,
    best: 6.1,
    window: '13 a 20/10',
    change: '+17%',
    bars: priceForecast.bars,
    harvest: 300,
    cost: 780,
    tips: [
      'Programe a colheita de 300 kg para a semana de 13/10.',
      'Supermercado Mais procura 300 kg até 12/10 e paga até R$ 5,80/kg.',
      'Depois de 27/10 a IA prevê queda de 8% com a entrada da safra de Minas.',
    ],
  },
  'Alface crespa': {
    unit: 'maço',
    today: 3.2,
    best: 3.4,
    window: '09 a 12/10',
    change: '+6%',
    bars: [
      { date: '01/09', price: 2.9 }, { date: '08/09', price: 3.0 }, { date: '15/09', price: 3.1 },
      { date: '22/09', price: 3.0 }, { date: '29/09', price: 3.2 }, { date: '06/10', price: 3.2 },
      { date: '13/10', price: 3.4, forecast: true }, { date: '20/10', price: 3.3, forecast: true }, { date: '27/10', price: 3.1, forecast: true },
    ],
    harvest: 240,
    cost: 290,
    tips: [
      'A demanda de restaurantes sobe nas quintas: ofereça 150 maços ao Sabor da Terra.',
      'Mantenha o preço em R$ 3,20: está 4% abaixo da média dos atravessadores.',
    ],
  },
  Morango: {
    unit: 'caixa',
    today: 12,
    best: 13.5,
    window: '15 a 22/10',
    change: '+13%',
    bars: [
      { date: '01/09', price: 10.5 }, { date: '08/09', price: 11 }, { date: '15/09', price: 11.2 },
      { date: '22/09', price: 11.8 }, { date: '29/09', price: 12 }, { date: '06/10', price: 12 },
      { date: '13/10', price: 13.2, forecast: true }, { date: '20/10', price: 13.5, forecast: true }, { date: '27/10', price: 12.6, forecast: true },
    ],
    harvest: 65,
    cost: 410,
    tips: ['Colha as 65 caixas previstas em 15/10 e ofereça ao Mercadinho Central (30 caixas).'],
  },
}

/* ---------- Varejista ---------- */
export const favoriteProducers = [
  { id: 1, name: 'Sítio Boa Vista', initials: 'SB', owner: 'João Silva', km: 12, rating: '4,8', offers: 4, products: 'Alface, tomate, couve' },
  { id: 2, name: 'Fazenda Santa Luzia', initials: 'FS', owner: 'Marta Reis', km: 18, rating: '4,9', offers: 3, products: 'Tomate, pimentão' },
  { id: 3, name: 'Chácara Recanto', initials: 'CR', owner: 'Paulo Lima', km: 22, rating: '4,7', offers: 2, products: 'Morango, amora' },
]
export const favoriteProductIds = ['alface-crespa', 'tomate-italiano', 'morango']

export const myDemands = [
  { id: 1, title: '300 kg de Tomate italiano', kind: 'tomate', deadline: 'até 12/10', offers: 4, best: 'R$ 5,20/kg', status: 'Recebendo ofertas' },
  { id: 2, title: '150 maços de Alface americana', kind: 'alface', deadline: 'até 10/10', offers: 2, best: 'R$ 3,30/maço', status: 'Recebendo ofertas' },
]

/* ---------- Perfil ---------- */
export const profiles = {
  produtor: { name: 'João Silva', email: 'joao@sitioboavista.com.br', phone: '(35) 99812-4410', doc: 'CPF 123.456.789-00', org: 'Sítio Boa Vista', address: 'Estrada do Cervo, km 4 · Pouso Alegre, MG', plan: 'Gratuito' },
  varejista: { name: 'Mercado Mais', email: 'compras@mercadomais.com.br', phone: '(35) 3421-8890', doc: 'CNPJ 12.345.678/0001-90', org: 'Mercado Mais Ltda.', address: 'Av. Dr. Lisboa, 1200 · Pouso Alegre, MG', plan: 'Gratuito' },
}
