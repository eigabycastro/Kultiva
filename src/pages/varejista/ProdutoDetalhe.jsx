import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Calendar, Check, ChevronLeft, ChevronRight, Heart, MessageCircle, Minus, Plus, ShieldCheck, ShoppingCart } from 'lucide-react'
import { Avatar, Badge, Button, Card, Checkbox, Field } from '../../components/ui'
import { LoadState, Notice } from '../../components/Feedback'
import ProduceArt, { ProduceThumb } from '../../components/ProduceArt'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { formatBRL, formatDate, formatDay, formatQty, todayInput } from '../../utils/format'
import '../pages.css'
import '../produtor/oferta.css'
import './detalhe.css'

function Stepper({ value, min, max, unit, onChange, step = 1 }) {
  return (
    <div className="stepper">
      <button type="button" aria-label="Diminuir" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
        <Minus size={16} aria-hidden />
      </button>
      <input
        className="label-m stepper__value stepper__input"
        inputMode="numeric"
        value={value}
        aria-label={`Quantidade em ${unit}`}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ''))
          onChange(Number.isFinite(n) ? n : min)
        }}
        onBlur={() => onChange(Math.min(max, Math.max(min, value)))}
      />
      <button type="button" aria-label="Aumentar" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>
        <Plus size={16} aria-hidden />
      </button>
    </div>
  )
}

export default function ProdutoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: p, error, loading, reload, setData } = useApi(`/ofertas/${id}`)
  const [qty, setQty] = useState(0)
  const [extras, setExtras] = useState({}) // { ofertaId: quantidade }
  const [delivery, setDelivery] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (p) setQty((q) => q || Math.min(p.quantidadeDisponivel, Math.max(p.pedidoMinimo, 10)))
  }, [p])

  if (!p) {
    return (
      <div className="page">
        <LoadState loading={loading} error={error} onRetry={reload} empty skeleton={4} />
      </div>
    )
  }

  const step = p.quantidadeDisponivel >= 100 ? 10 : 1
  const available = p.status === 'ATIVA' && p.quantidadeDisponivel > 0
  const extraItems = p.outrasOfertas.filter((o) => extras[o.id])
  const total = qty * p.preco + extraItems.reduce((s, o) => s + extras[o.id] * o.preco, 0)
  const history = p.historicoPrecos.length ? p.historicoPrecos.map((h) => h.preco) : [p.preco]
  const maxHistory = Math.max(...history)
  const diff = p.precoMedioRegiao ? Math.round(((p.preco - p.precoMedioRegiao) / p.precoMedioRegiao) * 100) : null

  const toggleFav = async () => {
    const next = !p.favorito
    setData({ ...p, favorito: next })
    try {
      await api(`/favoritos/${p.id}`, { method: next ? 'POST' : 'DELETE' })
    } catch (err) {
      setData({ ...p, favorito: !next })
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  const order = async () => {
    setSending(true)
    setNotice(null)
    try {
      const pedido = await api('/pedidos', {
        method: 'POST',
        body: {
          itens: [{ ofertaId: p.id, quantidade: qty }, ...extraItems.map((o) => ({ ofertaId: o.id, quantidade: extras[o.id] }))],
          dataEntrega: delivery || null,
          observacao: note || null,
        },
      })
      navigate('/pedido-confirmado', { state: { pedido, role: 'varejista' } })
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
      setSending(false)
      reload()
    }
  }

  return (
    <div className="page detail">
      <nav className="breadcrumb body-s only-desktop" aria-label="Caminho">
        <Link to="/varejista/buscar">Buscar produtos</Link>
        <ChevronRight size={14} aria-hidden />
        <Link to={`/varejista/buscar?cat=${encodeURIComponent(p.categoria)}`}>{p.categoria}</Link>
        <ChevronRight size={14} aria-hidden />
        <span className="t-primary">{p.produto}</span>
      </nav>

      <div className="detail__top">
        <div className="detail__gallery">
          <div className="detail__hero">
            <ProduceArt kind={p.kind} label={`Foto ilustrativa de ${p.produto}`} style={{ width: '100%', height: '100%' }} />
            <button type="button" className="detail__back only-mobile" aria-label="Voltar" onClick={() => navigate(-1)}>
              <ChevronLeft size={22} aria-hidden />
            </button>
          </div>
        </div>

        <div className="detail__info">
          <div className="chip-group">
            <Badge tone={p.tagTone}>{p.tag}</Badge>
            {p.organico && <Badge tone="success">Orgânico</Badge>}
            {p.entregaInclusa && <Badge tone="info">Entrega inclusa até {p.propriedade.raioEntregaKm} km</Badge>}
            {!available && <Badge tone="danger">Indisponível</Badge>}
          </div>
          <h1 className="detail__title">
            {p.produto}
            {p.variedade && <span className="t-tertiary"> · {p.variedade}</span>}
          </h1>

          <div className="seller">
            <Avatar initials={p.produtor.iniciais} />
            <div className="list__text">
              <span className="label-m seller__name">
                {p.propriedade.nome} · {p.produtor.nome} <ShieldCheck size={16} color="var(--icon-brand)" aria-hidden />
              </span>
              <span className="body-s t-tertiary seller__meta">
                {p.propriedade.cidade}/{p.propriedade.uf}
                {p.distanciaKm != null && ` · ${Math.round(p.distanciaKm)} km de você`}
              </span>
            </div>
            <Button variant="ghost" size="s" to={`/varejista/buscar?q=${encodeURIComponent(p.propriedade.nome)}`} className="only-desktop">
              Ver ofertas
            </Button>
          </div>

          <div className="detail__price">
            <span className="detail__price-value">{formatBRL(p.preco)}</span>
            <span className="body-m t-tertiary">
              / {p.unidade} · mín. {formatQty(p.pedidoMinimo, p.unidade)}
            </span>
          </div>

          <div className="stock">
            <div className="row-between body-s">
              <span className="t-secondary">Estoque em tempo real</span>
              <span className="label-s t-brand">
                {p.quantidadeDisponivel} de {formatQty(p.quantidadeTotal, p.unidade)}
              </span>
            </div>
            <div className="stock__bar">
              <span style={{ width: `${Math.round((p.quantidadeDisponivel / Math.max(1, p.quantidadeTotal)) * 100)}%` }} />
            </div>
          </div>

          <dl className="facts">
            <div>
              <dt>Colheita</dt>
              <dd>{formatDate(p.dataColheita)}</dd>
            </div>
            <div>
              <dt>Disponível até</dt>
              <dd>{p.disponivelAte ? formatDay(p.disponivelAte) : 'Enquanto houver estoque'}</dd>
            </div>
            <div className="only-desktop">
              <dt>Pedido mínimo</dt>
              <dd>{formatQty(p.pedidoMinimo, p.unidade)}</dd>
            </div>
          </dl>

          <Notice tone={notice?.tone}>{notice?.text}</Notice>

          {available ? (
            <>
              <div className="detail__actions">
                <Stepper value={qty} min={p.pedidoMinimo} max={p.quantidadeDisponivel} unit={p.unidade} step={step} onChange={setQty} />
                <Button icon={ShoppingCart} className="detail__cta" onClick={order} disabled={sending || qty < p.pedidoMinimo || qty > p.quantidadeDisponivel}>
                  {sending ? 'Enviando…' : `Fazer pedido · ${formatBRL(total)}`}
                </Button>
                <button
                  type="button"
                  className={p.favorito ? 'fav-btn is-on' : 'fav-btn'}
                  aria-label={p.favorito ? 'Remover dos favoritos' : `Favoritar ${p.produto}`}
                  aria-pressed={p.favorito}
                  onClick={toggleFav}
                >
                  <Heart size={18} fill={p.favorito ? 'currentColor' : 'none'} aria-hidden />
                </button>
              </div>
              <div className="grid-2 detail__order-extra">
                <Field label="Entrega desejada" icon={Calendar} type="date" min={todayInput()} value={delivery} onChange={(e) => setDelivery(e.target.value)} />
                <Field label="Observação para o produtor" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: entregar na doca 2, das 6h às 9h" />
              </div>
              <p className="body-s t-tertiary">
                O pedido vai como <strong>pendente</strong>. O estoque só é reservado quando o produtor aceitar. Pagamento combinado direto com ele.
              </p>
            </>
          ) : (
            <Notice tone="warning">Esta oferta está sem estoque no momento. Favorite para acompanhar ou publique um Procura-se.</Notice>
          )}
          <Button variant="ghost" icon={MessageCircle} to="/varejista/negociacoes" className="only-desktop">
            Negociar preço pelo chat
          </Button>
        </div>
      </div>

      <div className="detail__bottom">
        <Card className="panel">
          <div>
            <h2 className="h3">Preços praticados</h2>
            <p className="body-s t-tertiary">Últimos pedidos aceitos de {p.produto.toLowerCase()} na Kultiva</p>
          </div>
          <div className="mini-bars">
            {history.map((v, i) => (
              <span key={i} style={{ height: `${(v / maxHistory) * 100}%` }} className={i === history.length - 1 ? 'is-last' : undefined} title={formatBRL(v)} />
            ))}
          </div>
          {diff != null && (
            <p className="body-s" style={{ color: diff <= 0 ? 'var(--text-success)' : 'var(--text-warning)' }}>
              {diff === 0 ? 'Preço igual' : `${Math.abs(diff)}% ${diff < 0 ? 'abaixo' : 'acima'}`} da média das ofertas ativas ({formatBRL(p.precoMedioRegiao)}/{p.unidade}).
            </p>
          )}
        </Card>

        <Card className="panel">
          <div>
            <h2 className="h3">Inclua outros produtos de {p.propriedade.nome}</h2>
            <p className="body-s t-tertiary">Tudo no mesmo pedido e na mesma entrega</p>
          </div>
          {p.outrasOfertas.length === 0 ? (
            <p className="body-s t-secondary">Este produtor não tem outras ofertas ativas agora.</p>
          ) : (
            <ul className="list">
              {p.outrasOfertas.map((o) => (
                <li key={o.id} className="list__row extra-item">
                  <Checkbox
                    checked={Boolean(extras[o.id])}
                    onChange={(v) => setExtras((x) => ({ ...x, [o.id]: v ? Math.min(o.quantidadeDisponivel, Math.max(o.pedidoMinimo, 10)) : 0 }))}
                  >
                    <span className="with-avatar">
                      <ProduceThumb kind={o.kind} size={32} />
                      <span className="list__text">
                        <span className="label-m">{o.produto}</span>
                        <span className="body-s t-tertiary">
                          {formatBRL(o.preco)}/{o.unidade} · {formatQty(o.quantidadeDisponivel, o.unidade)}
                        </span>
                      </span>
                    </span>
                  </Checkbox>
                  {extras[o.id] > 0 && (
                    <Stepper value={extras[o.id]} min={o.pedidoMinimo} max={o.quantidadeDisponivel} unit={o.unidade} onChange={(n) => setExtras((x) => ({ ...x, [o.id]: n }))} />
                  )}
                </li>
              ))}
            </ul>
          )}
          {extraItems.length > 0 && (
            <p className="label-m">
              <Check size={14} aria-hidden /> {extraItems.length + 1} itens no pedido · {formatBRL(total)}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
