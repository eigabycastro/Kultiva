import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronDown, ChevronLeft, Megaphone, Package, Search, Sparkles, TrendingUp } from 'lucide-react'
import { Avatar, Button, Card, ChipGroup, Field, IconTile } from '../../components/ui'
import { DemandCard } from '../../components/cards'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import '../pages.css'
import '../produtor/oferta.css'
import './publicar.css'
import Title from '../../components/Title'

const MATCHES = ['JS', 'FS', 'CR', 'HS', 'DI']
const REQUIRED = {
  what: 'Informe o produto, ex.: Tomate italiano.',
  qty: 'Informe a quantidade, ex.: 300.',
  deadline: 'Informe até quando precisa, ex.: 12/10/2026.',
}

export default function PublicarProcura() {
  const navigate = useNavigate()
  const [freq, setFreq] = useState('Compra única')
  const [radius, setRadius] = useState('30 km')
  const [reqs, setReqs] = useState(['Selo de qualidade', 'Com nota fiscal', 'Entrega inclusa'])
  const [what, setWhat] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('kg')
  const [price, setPrice] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const confirmLeave = useUnsavedChanges(Boolean(what || qty || price || deadline || notes))
  const values = { what, qty, deadline }
  const change = (setter, key) => (e) => {
    setter(e.target.value)
    if (key && errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const publish = (e) => {
    e.preventDefault()
    const found = Object.fromEntries(Object.entries(REQUIRED).filter(([k]) => !values[k].trim()))
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      // foca o primeiro campo com erro que está visível neste tamanho de tela
      const el = [...e.currentTarget.querySelectorAll(`[name="${first}"]`)].find((x) => x.offsetParent)
      el?.focus()
      return
    }
    // TODO(back-end): POST /procura-se
    navigate('/varejista/buscar')
  }
  const leave = () => confirmLeave() && navigate(-1)

  const preview = {
    buyer: 'Mercado Mais',
    initials: 'SM',
    type: 'Varejista',
    km: 0,
    status: 'Urgente',
    tone: 'warning',
    kind: 'tomate',
    title: `${qty || '300'} ${unit} de ${what || 'Tomate italiano'}`,
    deadline: 'Entrega até 12/10',
    maxPrice: `Até ${price || 'R$ 5,80'}/${unit}`,
  }

  return (
    <form className="page" onSubmit={publish} noValidate>
      <div className="m-topbar only-mobile">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={leave}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <Title mobile as="span" className="m-topbar__title">Publicar Procura-se</Title>
      </div>
      <p className="body-s t-secondary only-mobile">
        Os produtores do seu raio são avisados na hora e podem enviar ofertas pelo chat.
      </p>

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Publicar Procura-se</Title>
          <p className="body-m t-secondary">Diga o que você precisa e deixe os produtores da região virem até você.</p>
        </div>
        <div className="page-header__actions">
          <Button variant="ghost" onClick={leave}>
            Descartar demanda
          </Button>
          <Button type="submit" icon={Megaphone}>
            Publicar demanda
          </Button>
        </div>
      </header>

      <div className="offer-layout publish-layout">
        <Card className="panel offer-form">
          <div className="grid-3 grid-3--m">
            <Field
              label="O que você procura? *"
              icon={Search}
              name="what"
              placeholder="Tomate italiano"
              value={what}
              onChange={change(setWhat, 'what')}
              error={errors.what}
              required
              className="span-m"
            />
            <Field
              label="Quantidade *"
              icon={Package}
              name="qty"
              placeholder="300"
              inputMode="numeric"
              value={qty}
              onChange={change(setQty, 'qty')}
              error={errors.qty}
              required
            />
            <Field label="Unidade" icon={ChevronDown} className="only-desktop">
              <select className="field__input" name="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option>kg</option>
                <option>maço</option>
                <option>caixa</option>
                <option>unidade</option>
              </select>
            </Field>
            <Field
              label={<span className="only-mobile">Preço máx.</span>}
              icon={TrendingUp}
              name="price"
              placeholder="R$ 5,80"
              inputMode="decimal"
              className="only-mobile"
              value={price}
              onChange={change(setPrice)}
            />
          </div>

          <div className="grid-2">
            <Field
              label="Preço máximo por unidade"
              icon={TrendingUp}
              name="price"
              placeholder="R$ 5,80"
              inputMode="decimal"
              className="only-desktop"
              value={price}
              onChange={change(setPrice)}
            />
            <Field
              label="Entregar até *"
              icon={Calendar}
              name="deadline"
              placeholder="12/10/2026"
              value={deadline}
              onChange={change(setDeadline, 'deadline')}
              error={errors.deadline}
              required
            />
          </div>

          <div className="field-block">
            <span className="field__label">Frequência</span>
            <span className="body-s t-tertiary only-desktop">Demandas recorrentes atraem produtores para contratos fixos</span>
            <ChipGroup label="Frequência" options={['Compra única', 'Semanal', 'Quinzenal', 'Mensal']} value={freq} onChange={setFreq} />
          </div>

          <div className="field-block">
            <span className="field__label">
              <span className="only-desktop">Buscar produtores em até</span>
              <span className="only-mobile">Raio</span>
            </span>
            <ChipGroup label="Raio de busca" options={['10 km', '30 km', '50 km']} value={radius} onChange={setRadius} />
          </div>

          <div className="field-block only-desktop">
            <span className="field__label">Requisitos</span>
            <ChipGroup
              label="Requisitos"
              multiple
              options={['Orgânico', 'Selo de qualidade', 'Com nota fiscal', 'Entrega inclusa']}
              value={reqs}
              onChange={setReqs}
            />
          </div>

          <Field
            label={
              <>
                <span className="only-desktop">Observações para o produtor</span>
                <span className="only-mobile">Observações</span>
              </>
            }
            as="textarea"
            name="notes"
            value={notes}
            onChange={change(setNotes)}
            placeholder="Ex.: tomates firmes, calibre médio, entrega na doca 2 entre 6h e 9h…"
          />

          <div className="match-hint only-mobile">
            <Sparkles size={16} aria-hidden />
            <span className="body-s">7 produtores compatíveis no seu raio já têm tomate disponível.</span>
          </div>
        </Card>

        <aside className="offer-side only-desktop">
          <span className="label-m t-secondary">Prévia da sua demanda</span>
          <DemandCard demand={{ ...preview, type: 'Varejista · Pouso Alegre', km: undefined }} />
          <Card className="panel">
            <div className="matches__head">
              <IconTile icon={Sparkles} tone="solid" size={36} iconSize={18} />
              <span className="h4">7 produtores compatíveis</span>
            </div>
            <div className="matches__avatars">
              {MATCHES.map((m) => (
                <Avatar key={m} initials={m} size={36} />
              ))}
            </div>
            <p className="body-s t-secondary">
              Eles têm tomate disponível no seu raio e serão avisados assim que você publicar. Tempo médio até a 1ª
              oferta: 40 min.
            </p>
          </Card>
        </aside>
      </div>

      <div className="m-footer only-mobile">
        <Button type="submit" block>
          Publicar demanda
        </Button>
      </div>
    </form>
  )
}
