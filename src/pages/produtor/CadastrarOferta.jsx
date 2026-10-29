import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Check, ChevronDown, ChevronLeft, Package, Plus, Sparkles, Sprout, TrendingUp } from 'lucide-react'
import { Button, Card, ChipGroup, Field, IconTile, Toggle } from '../../components/ui'
import { ProductCard } from '../../components/cards'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import '../pages.css'
import './oferta.css'
import Title from '../../components/Title'

const EMPTY = { produto: '', variedade: '', quantidade: '', unidade: 'maço', preco: '', colheita: '', ate: '' }

const REQUIRED = {
  produto: 'Informe o produto, ex.: Alface crespa orgânica.',
  quantidade: 'Informe a quantidade disponível, ex.: 300.',
  preco: 'Informe o preço por unidade, ex.: R$ 3,20.',
  colheita: 'Informe a data da colheita, ex.: 09/10/2026.',
}
const validate = (form) =>
  Object.fromEntries(Object.entries(REQUIRED).filter(([k]) => !form[k].trim()))

const QUALITY = [
  { label: 'Foto do produto', done: true },
  { label: 'Preço dentro da faixa da região', done: true },
  { label: 'Data de colheita', done: true },
  { label: 'Selo de qualidade', done: false },
]

export default function CadastrarOferta() {
  const navigate = useNavigate()
  const [cats, setCats] = useState(['Hortaliças', 'Orgânico certificado'])
  const [delivery, setDelivery] = useState(['Entrega até 15 km', 'Retira no local'])
  const [notify, setNotify] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const dirty = Object.entries(form).some(([k, v]) => v !== EMPTY[k])
  const confirmLeave = useUnsavedChanges(dirty)

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const publish = (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      e.currentTarget.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    // TODO(back-end): POST /ofertas
    navigate('/produtor')
  }
  const leave = () => confirmLeave() && navigate(-1)

  const preview = {
    name: form.produto || 'Alface crespa orgânica',
    farm: 'Sítio Boa Vista',
    km: 12,
    rating: '4,8',
    price: form.preco || 'R$ 3,20',
    unit: 'maço',
    stock: '300 disponíveis',
    tag: 'Colhido hoje',
    tagTone: 'brand',
  }

  return (
    <form className="page" onSubmit={publish} noValidate>
      <div className="m-topbar only-mobile">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={leave}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <Title mobile as="span" className="m-topbar__title">Nova oferta</Title>
        {/* TODO(back-end): salvar rascunho */}
        <button type="button" className="btn btn--ghost btn--s">
          Salvar rascunho
        </button>
      </div>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Cadastrar oferta</Title>
          <p className="body-m t-secondary">Publique o que está pronto para colheita. O estoque atualiza sozinho a cada venda.</p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary">Salvar rascunho</Button>
          <Button type="submit" icon={Check}>
            Publicar oferta
          </Button>
        </div>
      </header>

      <div className="offer-layout">
        <Card className="panel offer-form">
          <div className="only-desktop">
            <h2 className="h3">Informações do produto</h2>
            <p className="body-s t-tertiary">Campos com * são obrigatórios</p>
          </div>

          <PhotoPicker className="only-mobile" />

          <div className="grid-2">
            <Field
              label="Produto *"
              icon={Package}
              name="produto"
              placeholder="Alface crespa orgânica"
              value={form.produto}
              onChange={set('produto')}
              error={errors.produto}
              required
            />
            <Field
              label="Variedade"
              icon={Sprout}
              name="variedade"
              placeholder="Crespa verde"
              className="only-desktop"
              value={form.variedade}
              onChange={set('variedade')}
            />
          </div>

          <div className="field-block only-desktop">
            <span className="field__label">Categoria</span>
            <ChipGroup
              label="Categoria"
              multiple
              options={['Hortaliças', 'Frutas', 'Legumes', 'Orgânico certificado']}
              value={cats}
              onChange={setCats}
            />
          </div>

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
              required
            />
            <Field label="Unidade" icon={ChevronDown} className="only-desktop">
              <select className="field__input" name="unidade" value={form.unidade} onChange={set('unidade')}>
                <option>maço</option>
                <option>kg</option>
                <option>caixa</option>
                <option>unidade</option>
              </select>
            </Field>
            <Field
              label={
                <>
                  <span className="only-desktop">Preço por unidade *</span>
                  <span className="only-mobile">Preço por maço *</span>
                </>
              }
              icon={TrendingUp}
              name="preco"
              placeholder="R$ 3,20"
              inputMode="decimal"
              value={form.preco}
              onChange={set('preco')}
              error={errors.preco}
              required
            />
          </div>

          <div className="ai-tip">
            <IconTile icon={Sparkles} tone="accent" className="only-desktop" />
            <Sparkles size={16} className="only-mobile" aria-hidden />
            <div>
              <p className="label-m only-desktop">Sugestão da IA: R$ 3,10 – R$ 3,40 por maço</p>
              <p className="body-s only-desktop">Baseado em 42 vendas de alface num raio de 30 km nos últimos 30 dias.</p>
              <p className="label-s only-mobile">IA sugere R$ 3,10 – R$ 3,40 (42 vendas na região)</p>
            </div>
          </div>

          <div className="grid-2 grid-2--keep">
            <Field
              label={
                <>
                  <span className="only-desktop">Data da colheita *</span>
                  <span className="only-mobile">Colheita *</span>
                </>
              }
              icon={Calendar}
              name="colheita"
              placeholder="09/10/2026"
              value={form.colheita}
              onChange={set('colheita')}
              error={errors.colheita}
              required
            />
            <Field
              label="Disponível até"
              icon={Calendar}
              name="ate"
              placeholder="12/10/2026"
              value={form.ate}
              onChange={set('ate')}
            />
          </div>

          <div className="field-block">
            <span className="field__label">Entrega</span>
            <ChipGroup
              label="Entrega"
              multiple
              options={['Entrega até 15 km', 'Retira no local', 'Frete a combinar']}
              value={delivery}
              onChange={setDelivery}
            />
          </div>

          <div className="field-block only-desktop">
            <span className="field__label">Fotos</span>
            <span className="body-s t-tertiary">Ofertas com foto recebem 3× mais contatos</span>
            <PhotoPicker />
          </div>

          <div className="toggle-row">
            <div className="list__text">
              <span className="label-m">
                <span className="only-desktop">Avisar varejistas que procuram este produto</span>
                <span className="only-mobile">Avisar quem procura alface</span>
              </span>
              <span className="body-s t-tertiary">3 demandas “Procura-se” compatíveis no seu raio</span>
            </div>
            <Toggle checked={notify} onChange={setNotify} label="Avisar varejistas" />
          </div>
        </Card>

        <aside className="offer-side only-desktop">
          <span className="label-m t-secondary">Como o varejista vai ver</span>
          <ProductCard product={preview} preview />
          <Card className="panel">
            <h2 className="h4">Qualidade do anúncio</h2>
            <ul className="quality">
              {QUALITY.map((q) => (
                <li key={q.label} className={q.done ? 'is-done' : undefined}>
                  <span className="quality__icon">{q.done && <Check size={12} strokeWidth={3} aria-hidden />}</span>
                  {q.label}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <div className="m-footer only-mobile">
        <Button type="submit" block>
          Publicar oferta
        </Button>
      </div>
    </form>
  )
}

function PhotoPicker({ className }) {
  return (
    <div className={['photos', className].filter(Boolean).join(' ')}>
      <label className="photos__add">
        <input type="file" accept="image/png,image/jpeg" multiple className="sr-only" />
        <Plus size={22} aria-hidden />
        <span className="label-m">Adicionar fotos</span>
        <span className="body-s t-tertiary">Até 5 fotos · JPG ou PNG</span>
      </label>
      <span className="photos__ph photos__ph--green">
        <Sprout size={28} strokeWidth={1.5} aria-hidden />
      </span>
      <span className="photos__ph photos__ph--yellow">
        <Sprout size={28} strokeWidth={1.5} aria-hidden />
      </span>
    </div>
  )
}
