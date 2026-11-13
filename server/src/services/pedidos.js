/* Regra de negócio principal da Kultiva: ciclo de vida do pedido com controle de estoque.

   PENDENTE ──aceitar (produtor)──▶ ACEITO ──entregar (produtor)──▶ ENTREGUE
      │                               │
      ├─recusar (produtor)──▶ RECUSADO └─cancelar (ambos)──▶ CANCELADO (devolve o estoque)
      └─cancelar (varejista)─▶ CANCELADO

   - Ao criar: bloqueia pedido acima do disponível, abaixo do pedido mínimo, de oferta inativa
     ou com itens de produtores diferentes. O estoque ainda não é reservado.
   - Ao aceitar: baixa o estoque de cada item numa transação, com UPDATE condicional
     (quantidadeDisponivel >= quantidade). Se outro pedido levou o estoque antes, nada é baixado.
   - Oferta que chega a zero vira ESGOTADA; volta a ATIVA se um cancelamento devolver estoque. */
import { codigoPedido, formatBRL, formatDia, qtd } from '../lib/format.js'
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { notificar } from './notificacoes.js'

export const TRANSICOES = {
  aceitar: { de: ['PENDENTE'], para: 'ACEITO', quem: ['PRODUTOR'] },
  recusar: { de: ['PENDENTE'], para: 'RECUSADO', quem: ['PRODUTOR'] },
  entregar: { de: ['ACEITO'], para: 'ENTREGUE', quem: ['PRODUTOR'] },
  cancelar: { de: ['PENDENTE', 'ACEITO'], para: 'CANCELADO', quem: ['VAREJISTA', 'PRODUTOR'] },
}

// Ações que o perfil pode executar sobre um pedido no status atual
export function acoesPermitidas(status, perfil) {
  return Object.entries(TRANSICOES)
    .filter(([, t]) => t.de.includes(status) && t.quem.includes(perfil))
    // o produtor recusa (não cancela) um pedido que ainda está pendente
    .filter(([acao]) => !(acao === 'cancelar' && perfil === 'PRODUTOR' && status === 'PENDENTE'))
    .map(([acao]) => acao)
}

export const incluirPedido = {
  varejista: true,
  produtor: true,
  itens: { include: { oferta: { include: { produto: true } } } },
}

const descreverItens = (itens) =>
  itens.map((i) => `${qtd(i.quantidade, i.oferta.unidade)} de ${i.oferta.produto.nome.toLowerCase()}`).join(', ')

export async function criarPedido(varejista, { itens, dataEntrega, observacao }) {
  const ids = itens.map((i) => i.ofertaId)
  if (new Set(ids).size !== ids.length) throw badRequest('A mesma oferta aparece duas vezes no pedido.')

  const ofertas = await prisma.oferta.findMany({
    where: { id: { in: ids } },
    include: { produto: true, propriedade: { include: { produtor: true } } },
  })
  const porId = new Map(ofertas.map((o) => [o.id, o]))

  let produtorId
  let total = 0
  for (const item of itens) {
    const o = porId.get(item.ofertaId)
    if (!o) throw notFound(`Oferta ${item.ofertaId} não encontrada.`)
    const nome = o.produto.nome
    if (o.status !== 'ATIVA' || o.propriedade.produtor.bloqueado) throw conflict(`${nome} não está disponível para pedidos.`)
    if (item.quantidade > o.quantidadeDisponivel) {
      throw conflict(`Estoque insuficiente de ${nome}: há ${qtd(o.quantidadeDisponivel, o.unidade)} disponíveis.`)
    }
    if (item.quantidade < o.pedidoMinimo) throw badRequest(`O pedido mínimo de ${nome} é ${qtd(o.pedidoMinimo, o.unidade)}.`)
    produtorId ??= o.propriedade.produtorId
    if (produtorId !== o.propriedade.produtorId) {
      throw badRequest('Um pedido só pode ter itens de um mesmo produtor. Faça um pedido para cada produtor.')
    }
    total += item.quantidade * Number(o.preco)
  }

  const pedido = await prisma.$transaction(async (tx) => {
    const criado = await tx.pedido.create({
      data: {
        varejistaId: varejista.id,
        produtorId,
        total: Math.round(total * 100) / 100,
        dataEntrega,
        observacao,
        itens: {
          create: itens.map((i) => ({ ofertaId: i.ofertaId, quantidade: i.quantidade, precoUnitario: porId.get(i.ofertaId).preco })),
        },
      },
      include: incluirPedido,
    })
    await notificar(
      produtorId,
      {
        tipo: 'PEDIDO',
        titulo: `Novo pedido ${codigoPedido(criado.id)} de ${varejista.organizacao || varejista.nome}`,
        texto: `${descreverItens(criado.itens)} · ${formatBRL(criado.total)}${dataEntrega ? ` · entrega ${formatDia(dataEntrega)}` : ''}`,
        link: '/produtor/pedidos',
      },
      tx,
    )
    return criado
  })
  return pedido
}

export async function mudarStatus(usuario, pedidoId, acao, motivo) {
  const regra = TRANSICOES[acao]
  if (!regra) throw badRequest('Ação inválida.')

  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, include: incluirPedido })
    if (!pedido) throw notFound('Pedido não encontrado.')

    const envolvido =
      (usuario.perfil === 'PRODUTOR' && pedido.produtorId === usuario.id) ||
      (usuario.perfil === 'VAREJISTA' && pedido.varejistaId === usuario.id)
    if (!envolvido) throw forbidden('Este pedido não é seu.')
    if (!acoesPermitidas(pedido.status, usuario.perfil).includes(acao)) {
      throw conflict(`Não é possível ${acao} um pedido com status ${pedido.status.toLowerCase()}.`)
    }

    if (acao === 'aceitar') {
      for (const item of pedido.itens) {
        // UPDATE condicional: só baixa se ainda houver estoque suficiente (evita vender além do disponível)
        const r = await tx.oferta.updateMany({
          where: { id: item.ofertaId, status: 'ATIVA', quantidadeDisponivel: { gte: item.quantidade } },
          data: { quantidadeDisponivel: { decrement: item.quantidade } },
        })
        if (r.count === 0) {
          const atual = await tx.oferta.findUnique({ where: { id: item.ofertaId } })
          throw conflict(
            `Estoque insuficiente de ${item.oferta.produto.nome}: o pedido pede ${qtd(item.quantidade, item.oferta.unidade)} e há ${qtd(atual?.quantidadeDisponivel ?? 0, item.oferta.unidade)}. Atualize o estoque ou recuse o pedido.`,
          )
        }
      }
      await tx.oferta.updateMany({
        where: { id: { in: pedido.itens.map((i) => i.ofertaId) }, quantidadeDisponivel: 0 },
        data: { status: 'ESGOTADA' },
      })
    }

    if (acao === 'cancelar' && pedido.status === 'ACEITO') {
      // devolve ao estoque o que tinha sido baixado no aceite
      for (const item of pedido.itens) {
        await tx.oferta.update({ where: { id: item.ofertaId }, data: { quantidadeDisponivel: { increment: item.quantidade } } })
      }
      await tx.oferta.updateMany({
        where: { id: { in: pedido.itens.map((i) => i.ofertaId) }, status: 'ESGOTADA', quantidadeDisponivel: { gt: 0 } },
        data: { status: 'ATIVA' },
      })
    }

    const atualizado = await tx.pedido.update({
      where: { id: pedido.id },
      data: {
        status: regra.para,
        motivo: motivo ?? pedido.motivo,
        ...(acao === 'aceitar' && { aceitoEm: new Date() }),
        ...(acao === 'entregar' && { entregueEm: new Date() }),
      },
      include: incluirPedido,
    })

    const codigo = codigoPedido(pedido.id)
    const resumo = `${descreverItens(pedido.itens)} · ${formatBRL(pedido.total)}`
    const outro = usuario.perfil === 'PRODUTOR' ? pedido.varejistaId : pedido.produtorId
    const quem = usuario.organizacao || usuario.nome
    const textos = {
      aceitar: [`Pedido ${codigo} aceito por ${quem}`, resumo],
      recusar: [`Pedido ${codigo} recusado por ${quem}`, motivo ? `Motivo: ${motivo}` : resumo],
      entregar: [`Pedido ${codigo} entregue`, `${resumo}. Que tal avaliar o produtor?`],
      cancelar: [`Pedido ${codigo} cancelado por ${quem}`, motivo ? `Motivo: ${motivo}` : resumo],
    }
    const [titulo, texto] = textos[acao]
    const area = usuario.perfil === 'PRODUTOR' ? 'varejista' : 'produtor'
    await notificar(outro, { tipo: 'PEDIDO', titulo, texto, link: `/${area}/pedidos` }, tx)

    return atualizado
  })
}
