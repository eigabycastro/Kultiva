import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, ChevronDown, ChevronLeft, Megaphone, Package, Sparkles, TrendingUp } from 'lucide-react'
import { Avatar, Button, Card, ChipGroup, Field, IconTile } from '../../components/ui'
import { DemandCard } from '../../components/cards'
import { LoadState, Notice } from '../../components/Feedback'
import ProdutoSelect, { NOVO, garantirProduto } from '../../components/ProdutoSelect'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { useApi } from '../../hooks/useApi'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { moneyInput, parseMoney, toInputDate, todayInput } from '../../utils/format'
import { UNITS } from '../../utils/status'
import '../pages.css'
import '../produtor/oferta.css'
import './publicar.css'
import Title from '../../components/Title'

const FREQ = ['Compra única', 'Semanal', 'Quinzenal', 'Mensal']
const RADIUS = ['10 km', '30 km', '50 km', '100 km']
const EMPTY = { produtoId: '', quantidade: '', unidade: 'kg', precoMaximo: '', prazo: '', frequencia: 'Compra única', raio: '30 km', observacoes: '' }

const fromDemand = (d) => ({
  produtoId: String(d.produtoId),
  quantidade: String(d.quantidade),
  unidade: d.unidade,
  precoMaximo: moneyInput(d.precoMaximo),
  prazo: toInputDate(d.prazo),
  frequencia: d.frequencia,
  raio: `${d.raioKm} km`,
  observacoes: d.observacoes ?? '',
})

export default function PublicarProcura() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const produtos = useApi('/produtos')
  const existing = useApi(editing ? `/demandas/${id}` : null, undefined, { enabled: editing })
  const [initial, setInitial] = useState(EMPTY)
  const [form, setForm] = useState(EMPTY)
  const [novo, setNovo] = useState({ nome: '', categoria: 'Legumes' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const confirmLeave = useUnsavedChanges(JSON.stringify(form) !== JSON.stringify(initial) && !sending)

  useEffect(() => {
    if (existing.data) {
      const f = fromDemand(existing.data)
      setInitial(f)
      setForm(f)
    }
  }, [existing.data])

  const produto = produtos.data?.find((p) => String(p.id) === form.produtoId)
  const radiusKm = Number.parseInt(form.raio, 10)
  const preview = useApi(
    produto ? '/demandas/previa' : null,
    produto ? { produtoId: produto.id, raioKm: radiusKm, precoMaximo: parseMoney(form.precoMaximo) ?? undefined } : undefined,
    { enabled: Boolean(produto) },
  )

  const set = (k) => (e) => {
    const value = e?.target ? e.target.value : e
    const next = { ...form, [k]: value }
    if (k === 'produtoId') {
      const p = produtos.data?.find((x) => String(x.id) === value)
      if (p) next.unidade = p.unidadePadrao
    }
    setForm(next)
    if (errors[k]) setErrors({ ...errors, [k]: undefined })
  }

  const publish = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.produtoId) found.produtoId = 'Escolha o produto, ex.: Tomate italiano.'
    if (form.produtoId === NOVO && novo.nome.trim().length < 2) found.novoNome = 'Informe o nome do produto, ex.: Pimentão vermelho.'
    if (!(Number(form.quantidade) > 0)) found.quantidade = 'Informe a quantidade, ex.: 300.'
    if (!form.prazo) found.prazo = 'Informe até quando precisa.'
    else if (form.prazo < todayInput()) found.prazo = 'O prazo não pode estar no passado.'
    if (form.precoMaximo && !(parseMoney(form.precoMaximo) > 0)) found.precoMaximo = 'Preço inválido, ex.: 5,80.'
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    setSending(true)
    setError('')
    const body = {
      quantidade: Number(form.quantidade),
      unidade: form.unidade,
      precoMaximo: parseMoney(form.precoMaximo),
      prazo: form.prazo,
      frequencia: form.frequencia,
      raioKm: radiusKm,
      observacoes: form.observacoes || null,
    }
    try {
      body.produtoId = await garantirProduto(form.produtoId, novo, form.unidade)
      const saved = await api(editing ? `/demandas/${id}` : '/demandas', { method: editing ? 'PUT' : 'POST', body })
      setInitial(form)
      const n = saved.produtoresAvisados
      const flash = editing
        ? `Demanda de ${saved.produto} atualizada.`
        : `Demanda de ${saved.produto} publicada. ${n ? `${n} ${n === 1 ? 'produtor compatível foi avisado' : 'produtores compatíveis foram avisados'}.` : 'Avisaremos os produtores assim que surgir oferta compatível.'}`
      navigate('/varejista/procura-se', { state: { flash } })
    } catch (err) {
      setErrors(err.porCampo)
      setError(err.message)
      setSending(false)
    }
  }
  const leave = () => confirmLeave() && navigate('/varejista/procura-se')

  const card = {
    varejista: { organizacao: usuario.organizacao, iniciais: usuario.iniciais, tipoEstabelecimento: `${usuario.tipoEstabelecimento ?? 'Varejista'} · ${usuario.cidade ?? ''}` },
    status: 'ABERTA',
    urgente: form.prazo && new Date(form.prazo) - Date.now() < 3 * 864e5,
    kind: form.produtoId === NOVO ? 'outro' : (produto?.foto ?? 'tomate'),
    produto: form.produtoId === NOVO ? novo.nome || 'novo produto' : (produto?.nome ?? 'seu produto'),
    quantidade: Number(form.quantidade) || 0,
    unidade: form.unidade,
    prazo: form.prazo || null,
    frequencia: form.frequencia,
    precoMaximo: parseMoney(form.precoMaximo),
    observacoes: form.observacoes,
  }

  return (
    <form className="page" onSubmit={publish} noValidate>
      <div className="m-topbar only-mobile">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={leave}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <Title mobile as="span" className="m-topbar__title">
          {editing ? 'Editar demanda' : 'Publicar Procura-se'}
        </Title>
      </div>
      <p className="body-s t-secondary only-mobile">Os produtores do seu raio são avisados na hora.</p>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">{editing ? 'Editar demanda' : 'Publicar Procura-se'}</Title>
          <p className="body-m t-secondary">Diga o que você precisa e deixe os produtores da região virem até você.</p>
        </div>
        <div className="page-header__actions">
          <Button variant="ghost" onClick={leave}>
            {editing ? 'Cancelar' : 'Descartar demanda'}
          </Button>
          <Button type="submit" icon={Megaphone} disabled={sending}>
            {sending ? 'Salvando…' : editing ? 'Salvar alterações' : 'Publicar demanda'}
          </Button>
        </div>
      </header>

      <Notice tone="danger">{error}</Notice>

      <LoadState loading={produtos.loading || (editing && existing.loading)} error={produtos.error || existing.error} empty={produtos.loading || (editing && existing.loading)} skeleton={4}>
        <div className="offer-layout publish-layout">
          <Card className="panel offer-form">
            <div className="grid-3 grid-3--m">
              <ProdutoSelect
                label="O que você procura? *"
                className="span-m"
                produtos={produtos.data ?? []}
                value={form.produtoId}
                onChange={set('produtoId')}
                novo={novo}
                onNovoChange={setNovo}
                errors={errors}
              />
              <Field label="Quantidade *" icon={Package} name="quantidade" placeholder="300" inputMode="numeric" value={form.quantidade} onChange={set('quantidade')} error={errors.quantidade} />
              <Field label="Unidade" icon={ChevronDown}>
                <select className="field__input" name="unidade" value={form.unidade} onChange={set('unidade')}>
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid-2">
              <Field label={`Preço máximo por ${form.unidade}`} icon={TrendingUp} name="precoMaximo" placeholder="5,80" inputMode="decimal" value={form.precoMaximo} onChange={set('precoMaximo')} error={errors.precoMaximo} hint="Opcional: só avisamos quem cobra até esse valor" />
              <Field label="Entregar até *" icon={Calendar} type="date" min={todayInput()} name="prazo" value={form.prazo} onChange={set('prazo')} error={errors.prazo} />
            </div>

            <div className="field-block">
              <span className="field__label">Frequência</span>
              <span className="body-s t-tertiary only-desktop">Demandas recorrentes atraem produtores para contratos fixos</span>
              <ChipGroup label="Frequência" options={FREQ} value={form.frequencia} onChange={set('frequencia')} />
            </div>

            <div className="field-block">
              <span className="field__label">Buscar produtores em até</span>
              <ChipGroup label="Raio de busca" options={RADIUS} value={form.raio} onChange={set('raio')} />
            </div>

            <Field
              label="Observações para o produtor"
              as="textarea"
              name="observacoes"
              value={form.observacoes}
              onChange={set('observacoes')}
              placeholder="Ex.: tomates firmes, calibre médio, entrega na doca 2 entre 6h e 9h…"
            />

            {preview.data && (
              <div className="match-hint only-mobile">
                <Sparkles size={16} aria-hidden />
                <span className="body-s">
                  {preview.data.produtores} {preview.data.produtores === 1 ? 'produtor compatível' : 'produtores compatíveis'} no seu raio.
                </span>
              </div>
            )}
          </Card>

          <aside className="offer-side only-desktop">
            <span className="label-m t-secondary">Prévia da sua demanda</span>
            <DemandCard demand={card} actions={<span />} />
            <Card className="panel">
              <div className="matches__head">
                <IconTile icon={Sparkles} tone="solid" size={36} iconSize={18} />
                <span className="h4">
                  {produto
                    ? preview.data
                      ? `${preview.data.produtores} ${preview.data.produtores === 1 ? 'produtor compatível' : 'produtores compatíveis'}`
                      : 'Calculando…'
                    : 'Escolha um produto'}
                </span>
              </div>
              {preview.data?.iniciais.length > 0 && (
                <div className="matches__avatars">
                  {preview.data.iniciais.map((m, i) => (
                    <Avatar key={i} initials={m} size={36} />
                  ))}
                </div>
              )}
              <p className="body-s t-secondary">
                {produto
                  ? `Produtores com ${produto.nome.toLowerCase()} disponível em até ${radiusKm} km${form.precoMaximo ? ' e dentro do seu preço' : ''}. ${editing ? '' : 'Eles serão avisados assim que você publicar.'}`
                  : 'Mostramos aqui quantos produtores da região podem atender.'}
              </p>
            </Card>
          </aside>
        </div>
      </LoadState>

      <div className="m-footer only-mobile">
        <Button type="submit" block disabled={sending}>
          {editing ? 'Salvar alterações' : 'Publicar demanda'}
        </Button>
      </div>
    </form>
  )
}
