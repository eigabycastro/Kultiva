import { distanciaKm } from './geo.js'
import { codigoPedido, iniciais, num } from './format.js'

const hoje = () => new Date().toISOString().slice(0, 10)

// Selo exibido no card do produto
function selo(o) {
  const colheita = new Date(o.dataColheita).toISOString().slice(0, 10)
  if (colheita === hoje()) return { tag: 'Colhido hoje', tagTone: 'brand' }
  if (colheita > hoje()) return { tag: 'Pronto p/ colheita', tagTone: 'warning' }
  if (o.organico) return { tag: 'Orgânico', tagTone: 'success' }
  return { tag: 'Disponível', tagTone: 'neutral' }
}

export const resumoUsuario = (u) =>
  u && {
    id: u.id,
    nome: u.nome,
    organizacao: u.organizacao,
    iniciais: iniciais(u.organizacao || u.nome),
    cidade: u.cidade,
    uf: u.uf,
    tipoEstabelecimento: u.tipoEstabelecimento,
  }

export const serializarUsuario = (u) => ({
  id: u.id,
  nome: u.nome,
  email: u.email,
  perfil: u.perfil,
  telefone: u.telefone,
  documento: u.documento,
  organizacao: u.organizacao,
  tipoEstabelecimento: u.tipoEstabelecimento,
  cep: u.cep,
  endereco: u.endereco,
  cidade: u.cidade,
  uf: u.uf,
  latitude: u.latitude,
  longitude: u.longitude,
  raioKm: u.raioKm,
  plano: u.plano,
  bloqueado: u.bloqueado,
  iniciais: iniciais(u.organizacao || u.nome),
  criadoEm: u.criadoEm,
})

export const serializarPropriedade = (p) => ({
  id: p.id,
  nome: p.nome,
  cep: p.cep,
  endereco: p.endereco,
  cidade: p.cidade,
  uf: p.uf,
  latitude: p.latitude,
  longitude: p.longitude,
  areaHa: p.areaHa,
  raioEntregaKm: p.raioEntregaKm,
  totalOfertas: p._count?.ofertas,
  criadoEm: p.criadoEm,
})

// `origem` = ponto de quem está buscando, para calcular a distância
export function serializarOferta(o, { origem, favoritos } = {}) {
  const prop = o.propriedade
  return {
    id: o.id,
    produtoId: o.produtoId,
    produto: o.produto?.nome,
    kind: o.produto?.foto,
    categoria: o.produto?.categoria,
    variedade: o.variedade,
    descricao: o.descricao,
    preco: num(o.preco),
    unidade: o.unidade,
    quantidadeTotal: o.quantidadeTotal,
    quantidadeDisponivel: o.quantidadeDisponivel,
    pedidoMinimo: o.pedidoMinimo,
    dataColheita: o.dataColheita,
    disponivelAte: o.disponivelAte,
    organico: o.organico,
    entregaInclusa: o.entregaInclusa,
    status: o.status,
    acabando: o.status === 'ATIVA' && o.quantidadeTotal > 0 && o.quantidadeDisponivel / o.quantidadeTotal <= 0.15,
    visualizacoes: o.visualizacoes,
    totalPedidos: o._count?.itens,
    ...selo(o),
    propriedade: prop && {
      id: prop.id,
      nome: prop.nome,
      cidade: prop.cidade,
      uf: prop.uf,
      raioEntregaKm: prop.raioEntregaKm,
    },
    produtor: resumoUsuario(prop?.produtor),
    distanciaKm: origem ? distanciaKm(origem, prop) : null,
    favorito: favoritos ? favoritos.has(o.id) : undefined,
    criadoEm: o.criadoEm,
  }
}

export function serializarPedido(p, acoes = []) {
  return {
    id: p.id,
    codigo: codigoPedido(p.id),
    status: p.status,
    total: num(p.total),
    dataEntrega: p.dataEntrega,
    observacao: p.observacao,
    motivo: p.motivo,
    criadoEm: p.criadoEm,
    aceitoEm: p.aceitoEm,
    entregueEm: p.entregueEm,
    varejista: resumoUsuario(p.varejista),
    produtor: resumoUsuario(p.produtor),
    itens: (p.itens ?? []).map((i) => ({
      id: i.id,
      ofertaId: i.ofertaId,
      produto: i.oferta?.produto?.nome,
      kind: i.oferta?.produto?.foto,
      unidade: i.oferta?.unidade,
      quantidade: i.quantidade,
      precoUnitario: num(i.precoUnitario),
      subtotal: Math.round(i.quantidade * num(i.precoUnitario) * 100) / 100,
    })),
    acoes,
  }
}

export function serializarDemanda(d, extras = {}) {
  return {
    id: d.id,
    produtoId: d.produtoId,
    produto: d.produto?.nome,
    kind: d.produto?.foto,
    quantidade: d.quantidade,
    unidade: d.unidade,
    precoMaximo: num(d.precoMaximo),
    prazo: d.prazo,
    frequencia: d.frequencia,
    raioKm: d.raioKm,
    observacoes: d.observacoes,
    status: d.status,
    urgente: d.status === 'ABERTA' && new Date(d.prazo) - Date.now() < 3 * 864e5,
    varejista: resumoUsuario(d.varejista),
    criadoEm: d.criadoEm,
    ...extras,
  }
}
