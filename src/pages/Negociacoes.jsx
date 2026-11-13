import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, MessageCircle, Package, Phone, Search, Send, ShoppingCart, Truck } from 'lucide-react'
import { useRole } from '../components/layout/AppLayout'
import { Avatar, Badge, Button, SearchInput, cx } from '../components/ui'
import { ChatBubble } from '../components/cards'
import { LoadState, Notice } from '../components/Feedback'
import { ProduceThumb } from '../components/ProduceArt'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { useQueryState } from '../hooks/useQueryState'
import { formatBRL, formatDate, formatQty, formatTime, timeAgo } from '../utils/format'
import Title from '../components/Title'
import './negociacoes.css'

// Sem WebSocket nesta versão: a conversa aberta é atualizada a cada 5 s (Socket.IO na Release 4)
const POLL_MS = 5000

const dayLabel = (d) => {
  const date = new Date(d)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 864e5)
  if (date.toDateString() === today.toDateString()) return 'Hoje'
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem'
  return formatDate(date)
}

function usePolling(fn, ms, deps) {
  const saved = useRef(fn)
  saved.current = fn
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && saved.current(), ms)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export default function Negociacoes() {
  const role = useRole()
  const navigate = useNavigate()
  const seller = role === 'produtor'
  const [com, setCom] = useQueryState('com', '')
  const [ofertaParam] = useQueryState('oferta', '')
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottom = useRef(null)

  const list = useApi('/mensagens/conversas')
  const chat = useApi(com ? `/mensagens/${com}` : null, ofertaParam ? { oferta: ofertaParam } : undefined, { enabled: Boolean(com) })
  usePolling(() => (com ? chat.reload() : null), POLL_MS, [com, ofertaParam])
  usePolling(() => list.reload(), POLL_MS * 2, [])

  // abrir a conversa marca as mensagens como lidas: atualiza a contagem da lista
  useEffect(() => {
    if (chat.data) list.reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.data?.mensagens.length, com])
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [chat.data?.mensagens.length, com])

  const conversas = (list.data?.data ?? []).filter((c) => `${c.contato.organizacao} ${c.contato.nome}`.toLowerCase().includes(q.toLowerCase()))
  const contato = chat.data?.contato
  const oferta = chat.data?.oferta
  const mensagens = chat.data?.mensagens ?? []

  const send = async (e) => {
    e.preventDefault()
    const texto = draft.trim()
    if (!texto || !com) return
    setSending(true)
    setError('')
    try {
      const m = await api(`/mensagens/${com}`, { method: 'POST', body: { texto, ofertaId: oferta?.id } })
      chat.setData((d) => ({ ...d, mensagens: [...d.mensagens, m] }))
      setDraft('')
      list.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  let lastDay = ''

  return (
    <div className="chat">
      <aside className={cx('chat__list', com && 'only-desktop')}>
        <div className="row-between">
          <button type="button" className="icon-btn only-mobile" aria-label="Voltar" onClick={() => navigate(-1)}>
            <ChevronLeft size={22} aria-hidden />
          </button>
          <Title className="h3">Negociações</Title>
          {list.data?.naoLidas > 0 && <Badge tone="warning">{list.data.naoLidas} não lidas</Badge>}
        </div>
        <SearchInput icon={Search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conversa…" aria-label="Buscar conversa" />
        <LoadState
          loading={list.loading}
          error={list.error}
          empty={conversas.length === 0}
          emptyText={seller ? 'Nenhuma conversa ainda. Os varejistas falam com você a partir das suas ofertas.' : 'Nenhuma conversa ainda. Abra uma oferta e toque em “Negociar com o produtor”.'}
        >
          <ul className="conv-list">
            {conversas.map((c) => (
              <li key={c.contato.id}>
                <button
                  type="button"
                  className={cx('conv', String(c.contato.id) === com && 'conv--active')}
                  aria-current={String(c.contato.id) === com ? 'true' : undefined}
                  onClick={() => setCom(String(c.contato.id))}
                >
                  <Avatar initials={c.contato.iniciais} />
                  <span className="conv__text">
                    <span className="row-between">
                      <span className="label-m">{c.contato.organizacao}</span>
                      <span className="body-s t-tertiary">{timeAgo(c.ultima.criadoEm)}</span>
                    </span>
                    <span className="row-between">
                      <span className="body-s t-secondary conv__last">
                        {c.ultima.minha && 'Você: '}
                        {c.ultima.texto}
                      </span>
                      {c.naoLidas > 0 && <span className="conv__unread">{c.naoLidas}</span>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </LoadState>
      </aside>

      <section className={cx('chat__main', !com && 'only-desktop')}>
        {!com ? (
          <div className="chat__empty">
            <MessageCircle size={40} strokeWidth={1.5} aria-hidden />
            <p className="label-m">Escolha uma conversa</p>
            <p className="body-s t-tertiary">
              {seller ? 'As mensagens dos varejistas aparecem na lista ao lado.' : 'Para começar, abra uma oferta e toque em “Negociar com o produtor”.'}
            </p>
            {!seller && (
              <Button variant="secondary" icon={Search} to="/varejista/buscar">
                Buscar produtos
              </Button>
            )}
          </div>
        ) : (
          <>
            <header className="chat__head">
              <button type="button" className="icon-btn only-mobile" aria-label="Voltar para as conversas" onClick={() => setCom('')}>
                <ChevronLeft size={22} aria-hidden />
              </button>
              <Avatar initials={contato?.iniciais ?? '…'} />
              <div className="list__text">
                <span className="chat__name">
                  <Title mobile as="span" className="label-m">
                    {contato?.organizacao ?? 'Carregando…'}
                  </Title>
                </span>
                <span className="body-s t-tertiary chat__status">
                  {contato && `${contato.perfil === 'PRODUTOR' ? 'Produtor' : contato.tipoEstabelecimento ?? 'Varejista'} · ${contato.cidade}/${contato.uf}`}
                </span>
              </div>
              {contato?.telefone && (
                <a className="btn btn--ghost btn--s only-desktop" href={`tel:${contato.telefone.replace(/\D/g, '')}`}>
                  <Phone size={16} aria-hidden />
                  {contato.telefone}
                </a>
              )}
            </header>

            {oferta && (
              <div className="chat__context body-s">
                <Package size={16} aria-hidden />
                <span>
                  Negociando: {oferta.produto} · {formatBRL(oferta.preco)}/{oferta.unidade} · {formatQty(oferta.quantidadeDisponivel, oferta.unidade)} disponíveis
                </span>
              </div>
            )}

            <div className="chat__messages" role="log" aria-live="polite" aria-label={`Conversa com ${contato?.organizacao ?? ''}`}>
              <LoadState loading={chat.loading} error={chat.error} empty={!chat.data && chat.loading}>
                {mensagens.length === 0 && (
                  <p className="body-s t-tertiary chat__hint">
                    Comece a conversa: pergunte sobre quantidade, preço ou data de entrega.
                  </p>
                )}
                {mensagens.map((m) => {
                  const day = dayLabel(m.criadoEm)
                  const sep = day !== lastDay
                  lastDay = day
                  return (
                    <div key={m.id}>
                      {sep && <span className="chat__day body-s">{day}</span>}
                      <ChatBubble side={m.minha ? 'out' : 'in'} text={m.texto} time={formatTime(m.criadoEm)} />
                    </div>
                  )
                })}
              </LoadState>
              <span ref={bottom} />
            </div>

            <Notice tone="danger" onClose={() => setError('')}>
              {error}
            </Notice>
            <form className="chat__composer" onSubmit={send}>
              <SearchInput
                name="mensagem"
                placeholder="Escreva uma mensagem…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="chat__input"
                aria-label="Mensagem"
                maxLength={1000}
              />
              <Button type="submit" icon={Send} className="only-desktop" disabled={sending || !draft.trim()}>
                Enviar
              </Button>
              <button type="submit" className="chat__send only-mobile" aria-label="Enviar" disabled={sending || !draft.trim()}>
                <Send size={20} aria-hidden />
              </button>
            </form>
          </>
        )}
      </section>

      <aside className="chat__summary only-desktop">
        <h2 className="h3">{oferta ? 'Oferta em negociação' : 'Resumo'}</h2>
        {oferta ? (
          <>
            <div className="summary__product">
              <ProduceThumb kind={oferta.kind} size={48} radius={8} />
              <div className="list__text">
                <span className="label-m">
                  {oferta.produto}
                  {oferta.variedade && ` · ${oferta.variedade}`}
                </span>
                <span className="body-s t-tertiary">
                  {oferta.propriedade.nome}
                  {oferta.distanciaKm != null && ` · ${Math.round(oferta.distanciaKm)} km`}
                </span>
              </div>
            </div>
            <dl className="summary__rows">
              <div>
                <dt>Preço</dt>
                <dd>
                  {formatBRL(oferta.preco)}/{oferta.unidade}
                </dd>
              </div>
              <div>
                <dt>Disponível</dt>
                <dd>{formatQty(oferta.quantidadeDisponivel, oferta.unidade)}</dd>
              </div>
              <div>
                <dt>Pedido mínimo</dt>
                <dd>{formatQty(oferta.pedidoMinimo, oferta.unidade)}</dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>{oferta.entregaInclusa ? `Inclusa até ${oferta.propriedade.raioEntregaKm} km` : 'A combinar'}</dd>
              </div>
            </dl>
            <div className="summary__actions">
              {seller ? (
                <Button block variant="secondary" icon={Package} to={`/produtor/produtos/${oferta.id}`}>
                  Editar preço ou estoque
                </Button>
              ) : (
                <Button block icon={ShoppingCart} to={`/varejista/produto/${oferta.id}`}>
                  Fazer pedido desta oferta
                </Button>
              )}
              <Button block variant="ghost" icon={Truck} to={`/${role}/pedidos?q=${encodeURIComponent(contato?.organizacao ?? '')}`}>
                Pedidos com {contato?.organizacao ?? 'este contato'}
              </Button>
              <p className="body-s t-tertiary" style={{ textAlign: 'center' }}>
                Combinou o preço? {seller ? 'Ajuste a oferta para o varejista fazer o pedido.' : 'Faça o pedido pela plataforma para baixar o estoque.'}
              </p>
            </div>
          </>
        ) : (
          <div className="stack-16">
            <p className="body-s t-secondary">
              {com
                ? 'Esta conversa ainda não está ligada a uma oferta. Ela aparece aqui quando a negociação começa pela página de um produto.'
                : 'Escolha uma conversa para ver a oferta negociada.'}
            </p>
            {com && (
              <Button block variant="ghost" icon={Truck} to={`/${role}/pedidos?q=${encodeURIComponent(contato?.organizacao ?? '')}`}>
                Ver pedidos com este contato
              </Button>
            )}
            <Link to={`/${role}/notificacoes`} className="body-s t-brand">
              Ver notificações
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
