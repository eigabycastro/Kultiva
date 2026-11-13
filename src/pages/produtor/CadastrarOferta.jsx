import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Calendar, Check, ChevronDown, ChevronLeft, House, Package, Sparkles, Sprout, TrendingUp } from 'lucide-react'
import { Button, Card, Field, IconTile, Toggle } from '../../components/ui'
import { ProductCard } from '../../components/cards'
import { LoadState, Notice } from '../../components/Feedback'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { formatBRL, moneyInput, parseMoney, toInputDate, todayInput } from '../../utils/format'
import { UNITS } from '../../utils/status'
import '../pages.css'
import './oferta.css'
import Title from '../../components/Title'

const EMPTY = {
  produtoId: '',
  propriedadeId: '',
  variedade: '',
  quantidade: '',
  unidade: 'maço',
  preco: '',
  pedidoMinimo: '1',
  dataColheita: todayInput(),
  disponivelAte: '',
  organico: false,
  entregaInclusa: false,
}

const REQUIRED = {
  produtoId: 'Escolha o produto.',
  propriedadeId: 'Escolha a propriedade.',
  quantidade: 'Informe a quantidade disponível, ex.: 300.',
  preco: 'Informe o preço por unidade, ex.: 3,20.',
  dataColheita: 'Informe a data da colheita.',
}
const validate = (form) => {
  const found = Object.fromEntries(Object.entries(REQUIRED).filter(([k]) => !String(form[k]).trim()))
  if (form.preco && !(parseMoney(form.preco) > 0)) found.preco = 'Preço inválido, ex.: 3,20.'
  if (form.quantidade && !(Number(form.quantidade) > 0)) found.quantidade = 'A quantidade deve ser maior que zero.'
  if (form.disponivelAte && form.disponivelAte < form.dataColheita) found.disponivelAte = 'Deve ser igual ou depois da colheita.'
  return found
}

const fromOffer = (o) => ({
  produtoId: String(o.produtoId),
  propriedadeId: String(o.propriedade.id),
  variedade: o.variedade ?? '',
  quantidade: String(o.quantidadeDisponivel),
  unidade: o.unidade,
  preco: moneyInput(o.preco),
  pedidoMinimo: String(o.pedidoMinimo),
  dataColheita: toInputDate(o.dataColheita),
  disponivelAte: toInputDate(o.disponivelAte),
  organico: o.organico,
  entregaInclusa: o.entregaInclusa,
})

export default function CadastrarOferta() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const produtos = useApi('/produtos')
  const propriedades = useApi('/propriedades')
  const existing = useApi(editing ? `/ofertas/${id}` : null, undefined, { enabled: editing })
  const [initial, setInitial] = useState(EMPTY)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const confirmLeave = useUnsavedChanges(dirty && !sending)

  // preenche o formulário ao editar, ou escolhe a 1ª propriedade numa oferta nova
  useEffect(() => {
    if (existing.data) {
      const f = fromOffer(existing.data)
      setInitial(f)
      setForm(f)
    }
  }, [existing.data])
  useEffect(() => {
    const first = propriedades.data?.[0]
    if (!editing && first) setForm((f) => (f.propriedadeId ? f : { ...f, propriedadeId: String(first.id) }))
  }, [editing, propriedades.data])
  // vindo do Procura-se (?produto=ID): já deixa o produto escolhido
  const presetProduct = searchParams.get('produto')
  useEffect(() => {
    const p = produtos.data?.find((x) => String(x.id) === presetProduct)
    if (!editing && p) setForm((f) => (f.produtoId ? f : { ...f, produtoId: String(p.id), unidade: p.unidadePadrao }))
  }, [editing, presetProduct, produtos.data])

  const produto = produtos.data?.find((p) => String(p.id) === form.produtoId)
  const propriedade = propriedades.data?.find((p) => String(p.id) === form.propriedadeId)

  // preço médio das ofertas ativas do mesmo produto na região (apoio para precificar)
  const region = useApi(produto ? '/ofertas' : null, produto ? { produtoId: produto.id, pageSize: 50 } : undefined, { enabled: Boolean(produto) })
  const regionStats = useMemo(() => {
    const list = (region.data?.data ?? []).filter((o) => o.id !== Number(id))
    if (!list.length) return null
    const prices = list.map((o) => o.preco)
    return { n: list.length, avg: prices.reduce((a, b) => a + b, 0) / list.length, min: Math.min(...prices), max: Math.max(...prices), unit: list[0].unidade }
  }, [region.data, id])

  const set = (key) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
    const next = { ...form, [key]: value }
    if (key === 'produtoId') {
      const p = produtos.data?.find((x) => String(x.id) === value)
      if (p && !editing) next.unidade = p.unidadePadrao
    }
    setForm(next)
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const save = async (e, rascunho = false) => {
    e?.preventDefault()
    const found = validate(form)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    setSending(true)
    setError('')
    const body = {
      produtoId: Number(form.produtoId),
      propriedadeId: Number(form.propriedadeId),
      variedade: form.variedade || null,
      quantidade: Number(form.quantidade),
      unidade: form.unidade,
      preco: parseMoney(form.preco),
      pedidoMinimo: Number(form.pedidoMinimo) || 1,
      dataColheita: form.dataColheita,
      disponivelAte: form.disponivelAte || null,
      organico: form.organico,
      entregaInclusa: form.entregaInclusa,
      rascunho,
    }
    try {
      const saved = await api(editing ? `/ofertas/${id}` : '/ofertas', { method: editing ? 'PUT' : 'POST', body })
      const notified = saved.demandasAvisadas ? ` ${saved.demandasAvisadas} ${saved.demandasAvisadas === 1 ? 'varejista com Procura-se compatível foi avisado' : 'varejistas com Procura-se compatível foram avisados'}.` : ''
      const verb = rascunho ? 'salva como rascunho' : editing ? 'atualizada' : 'publicada'
      setInitial(form)
      navigate('/produtor/produtos', { state: { flash: `Oferta de ${saved.produto} ${verb}.${notified}` } })
    } catch (err) {
      setErrors(err.porCampo ?? {})
      setError(err.message)
      setSending(false)
    }
  }
  const leave = () => confirmLeave() && navigate('/produtor/produtos')

  const preview = {
    produto: produto?.nome ?? 'Seu produto',
    variedade: form.variedade,
    kind: produto?.foto,
    propriedade: { nome: propriedade?.nome ?? 'Sua propriedade' },
    preco: parseMoney(form.preco) ?? 0,
    unidade: form.unidade,
    quantidadeDisponivel: Number(form.quantidade) || 0,
    organico: form.organico,
    tag: form.dataColheita === todayInput() ? 'Colhido hoje' : form.dataColheita > todayInput() ? 'Pronto p/ colheita' : 'Disponível',
    tagTone: form.dataColheita === todayInput() ? 'brand' : form.dataColheita > todayInput() ? 'warning' : 'neutral',
  }
  const quality = [
    { label: 'Produto e variedade', done: Boolean(form.produtoId && form.variedade) },
    { label: 'Preço dentro da faixa da região', done: Boolean(regionStats && parseMoney(form.preco) <= regionStats.max * 1.1) },
    { label: 'Data de colheita', done: Boolean(form.dataColheita) },
    { label: 'Pedido mínimo definido', done: Number(form.pedidoMinimo) > 1 },
  ]

  const loadingBase = produtos.loading || propriedades.loading || (editing && existing.loading)
  const loadError = produtos.error || propriedades.error || existing.error
  const noProperty = propriedades.data && propriedades.data.length === 0

  const title = editing ? 'Editar oferta' : 'Cadastrar oferta'
  const submitLabel = editing ? (existing.data?.status === 'RASCUNHO' ? 'Publicar oferta' : 'Salvar alterações') : 'Publicar oferta'

  return (
    <form className="page" onSubmit={save} noValidate>
      <div className="m-topbar only-mobile">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={leave}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <Title mobile as="span" className="m-topbar__title">
          {editing ? 'Editar oferta' : 'Nova oferta'}
        </Title>
        {!editing && (
          <button type="button" className="btn btn--ghost btn--s" onClick={(e) => save(e, true)} disabled={sending}>
            Salvar rascunho
          </button>
        )}
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">{title}</Title>
          <p className="body-m t-secondary">Publique o que está pronto para colheita. O estoque atualiza sozinho a cada pedido aceito.</p>
        </div>
        <div className="page-header__actions">
          <Button variant="ghost" onClick={leave}>
            Cancelar
          </Button>
          {(!editing || existing.data?.status === 'RASCUNHO') && (
            <Button variant="secondary" onClick={(e) => save(e, true)} disabled={sending}>
              Salvar rascunho
            </Button>
          )}
          <Button type="submit" icon={Check} disabled={sending || noProperty}>
            {sending ? 'Salvando…' : submitLabel}
          </Button>
        </div>
      </header>

      <Notice tone="danger">{error}</Notice>
      {noProperty && (
        <Notice tone="warning">
          Cadastre uma propriedade antes de publicar ofertas.{' '}
          <Button size="s" variant="secondary" to="/produtor/propriedades">
            Cadastrar propriedade
          </Button>
        </Notice>
      )}

      <LoadState loading={loadingBase} error={loadError} empty={loadingBase} skeleton={4}>
        <div className="offer-layout">
          <Card className="panel offer-form">
            <div className="only-desktop">
              <h2 className="h3">Informações do produto</h2>
              <p className="body-s t-tertiary">Campos com * são obrigatórios</p>
            </div>

            <div className="grid-2">
              <Field label="Produto *" icon={Package} error={errors.produtoId}>
                <select className="field__input" name="produtoId" value={form.produtoId} onChange={set('produtoId')} aria-invalid={errors.produtoId ? true : undefined}>
                  <option value="">Escolha…</option>
                  {['Hortaliças', 'Legumes', 'Frutas', 'Grãos'].map((cat) => {
                    const items = produtos.data?.filter((p) => p.categoria === cat) ?? []
                    return (
                      items.length > 0 && (
                        <optgroup key={cat} label={cat}>
                          {items.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )
                  })}
                </select>
              </Field>
              <Field label="Variedade" icon={Sprout} name="variedade" placeholder="Crespa verde" value={form.variedade} onChange={set('variedade')} error={errors.variedade} />
            </div>

            <Field label="Propriedade *" icon={House} error={errors.propriedadeId} hint={propriedade ? `${propriedade.cidade}/${propriedade.uf} · entrega até ${propriedade.raioEntregaKm} km` : undefined}>
              <select className="field__input" name="propriedadeId" value={form.propriedadeId} onChange={set('propriedadeId')}>
                <option value="">Escolha…</option>
                {propriedades.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {p.cidade}/{p.uf}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid-3">
              <Field
                label="Quantidade disponível *"
                icon={Package}
                name="quantidade"
                placeholder="300"
                inputMode="numeric"
                value={form.quantidade}
                onChange={set('quantidade')}
                error={errors.quantidade}
                hint={editing ? `Total anunciado: ${existing.data?.quantidadeTotal ?? '—'}` : undefined}
              />
              <Field label="Unidade" icon={ChevronDown}>
                <select className="field__input" name="unidade" value={form.unidade} onChange={set('unidade')}>
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </Field>
              <Field label={`Preço por ${form.unidade} *`} icon={TrendingUp} name="preco" placeholder="3,20" inputMode="decimal" value={form.preco} onChange={set('preco')} error={errors.preco} />
            </div>

            {regionStats && (
              <div className="ai-tip">
                <IconTile icon={Sparkles} tone="accent" className="only-desktop" />
                <Sparkles size={16} className="only-mobile" aria-hidden />
                <div>
                  <p className="label-m">
                    Na região: {formatBRL(regionStats.min)} – {formatBRL(regionStats.max)} por {regionStats.unit}
                  </p>
                  <p className="body-s">
                    Média de {formatBRL(regionStats.avg)} em {regionStats.n} {regionStats.n === 1 ? 'oferta ativa' : 'ofertas ativas'} de {produto.nome.toLowerCase()}.
                  </p>
                </div>
              </div>
            )}

            <div className="grid-3">
              <Field label="Data da colheita *" icon={Calendar} type="date" name="dataColheita" value={form.dataColheita} onChange={set('dataColheita')} error={errors.dataColheita} />
              <Field label="Disponível até" icon={Calendar} type="date" name="disponivelAte" min={form.dataColheita} value={form.disponivelAte} onChange={set('disponivelAte')} error={errors.disponivelAte} />
              <Field label="Pedido mínimo" icon={Package} name="pedidoMinimo" inputMode="numeric" value={form.pedidoMinimo} onChange={set('pedidoMinimo')} error={errors.pedidoMinimo} hint={`Em ${form.unidade}`} />
            </div>

            <div className="toggle-row">
              <div className="list__text">
                <span className="label-m">Orgânico</span>
                <span className="body-s t-tertiary">Aparece com selo e no filtro de orgânicos</span>
              </div>
              <Toggle checked={form.organico} onChange={set('organico')} label="Orgânico" />
            </div>
            <div className="toggle-row">
              <div className="list__text">
                <span className="label-m">Entrega inclusa no preço</span>
                <span className="body-s t-tertiary">Dentro do raio de entrega da propriedade</span>
              </div>
              <Toggle checked={form.entregaInclusa} onChange={set('entregaInclusa')} label="Entrega inclusa" />
            </div>

            <Notice tone="info">
              Ao publicar, os varejistas com Procura-se compatível no raio são avisados automaticamente.
            </Notice>
          </Card>

          <aside className="offer-side only-desktop">
            <span className="label-m t-secondary">Como o varejista vai ver</span>
            <ProductCard product={preview} preview />
            <Card className="panel">
              <h2 className="h4">Qualidade do anúncio</h2>
              <ul className="quality">
                {quality.map((q) => (
                  <li key={q.label} className={q.done ? 'is-done' : undefined}>
                    <span className="quality__icon">{q.done && <Check size={12} strokeWidth={3} aria-hidden />}</span>
                    {q.label}
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </LoadState>

      <div className="m-footer only-mobile">
        <Button type="submit" block disabled={sending || noProperty}>
          {sending ? 'Salvando…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
