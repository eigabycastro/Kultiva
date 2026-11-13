/* Match do "Procura-se": cruza demandas abertas com ofertas ativas do mesmo produto
   dentro do raio da demanda (distância entre o varejista e a propriedade). */
import { caixaDeBusca, distanciaKm } from '../lib/geo.js'
import { formatBRL, formatDia, qtd } from '../lib/format.js'
import { prisma } from '../lib/prisma.js'
import { notificar } from './notificacoes.js'

const atendePreco = (oferta, demanda) => demanda.precoMaximo == null || Number(oferta.preco) <= Number(demanda.precoMaximo)

// Ofertas que atendem a demanda, agrupadas por produtor
export async function ofertasCompativeis({ produtoId, raioKm, precoMaximo, origem, excluirProdutorId }) {
  if (origem?.latitude == null) return []
  const ofertas = await prisma.oferta.findMany({
    where: {
      produtoId,
      status: 'ATIVA',
      quantidadeDisponivel: { gt: 0 },
      propriedade: {
        ...caixaDeBusca(origem, raioKm),
        produtor: { bloqueado: false, ...(excluirProdutorId && { id: { not: excluirProdutorId } }) },
      },
    },
    include: { produto: true, propriedade: { include: { produtor: true } } },
  })
  return ofertas
    .map((o) => ({ ...o, distanciaKm: distanciaKm(origem, o.propriedade) }))
    .filter((o) => o.distanciaKm <= raioKm && atendePreco(o, { precoMaximo }))
}

// Ao publicar uma demanda: avisa cada produtor compatível (uma notificação por produtor)
export async function notificarProdutoresDaDemanda(demanda, varejista) {
  const ofertas = await ofertasCompativeis({
    produtoId: demanda.produtoId,
    raioKm: demanda.raioKm,
    precoMaximo: demanda.precoMaximo,
    origem: varejista,
  })
  const porProdutor = new Map()
  for (const o of ofertas) {
    const atual = porProdutor.get(o.propriedade.produtorId)
    if (!atual || o.quantidadeDisponivel > atual.quantidadeDisponivel) porProdutor.set(o.propriedade.produtorId, o)
  }
  const comprador = varejista.organizacao || varejista.nome
  const produto = demanda.produto?.nome ?? ofertas[0]?.produto.nome ?? 'produto'
  await Promise.all(
    [...porProdutor.entries()].map(([produtorId, o]) =>
      notificar(produtorId, {
        tipo: 'DEMANDA',
        titulo: `${comprador} procura ${qtd(demanda.quantidade, demanda.unidade)} de ${produto}`,
        texto: [
          `Você tem ${qtd(o.quantidadeDisponivel, o.unidade)} em ${o.propriedade.nome}`,
          demanda.precoMaximo != null && `paga até ${formatBRL(demanda.precoMaximo)}/${demanda.unidade}`,
          `entrega até ${formatDia(demanda.prazo)}`,
          `${o.distanciaKm} km`,
        ]
          .filter(Boolean)
          .join(' · '),
        link: '/produtor/procura-se',
      }),
    ),
  )
  return porProdutor.size
}

// Ao publicar/reativar uma oferta: avisa os varejistas com demanda aberta daquele produto no raio
export async function notificarDemandasDaOferta(oferta) {
  const prop = oferta.propriedade
  const demandas = await prisma.demanda.findMany({
    where: { produtoId: oferta.produtoId, status: 'ABERTA', prazo: { gte: new Date() }, varejista: { bloqueado: false } },
    include: { varejista: true, produto: true },
  })
  const compativeis = demandas.filter((d) => {
    const km = distanciaKm(d.varejista, prop)
    return km != null && km <= d.raioKm && atendePreco(oferta, d)
  })
  await Promise.all(
    compativeis.map((d) =>
      notificar(d.varejistaId, {
        tipo: 'DEMANDA',
        titulo: `Nova oferta para sua demanda de ${d.produto.nome}`,
        texto: `${prop.nome} publicou ${qtd(oferta.quantidadeDisponivel, oferta.unidade)} a ${formatBRL(oferta.preco)}/${oferta.unidade} · ${distanciaKm(d.varejista, prop)} km`,
        link: `/varejista/produto/${oferta.id}`,
      }),
    ),
  )
  return compativeis.length
}
