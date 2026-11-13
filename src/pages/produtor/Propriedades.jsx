import { useState } from 'react'
import { House, MapPin, Pencil, Plus, Ruler, Trash2, X } from 'lucide-react'
import { Badge, Button, Card, ChipGroup, Field, IconButton, IconTile } from '../../components/ui'
import { LoadState, Notice } from '../../components/Feedback'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { RadiusMap } from '../Onboarding'
import '../pages.css'
import './oferta.css'
import './propriedades.css'

const EMPTY = { nome: '', cep: '', endereco: '', areaHa: '', raioEntregaKm: '30 km' }
const RADIUS = ['10 km', '20 km', '30 km', '50 km', '100 km']

const toForm = (p) => ({
  nome: p.nome,
  cep: p.cep,
  endereco: p.endereco ?? '',
  areaHa: p.areaHa == null ? '' : String(p.areaHa).replace('.', ','),
  raioEntregaKm: `${p.raioEntregaKm} km`,
})

export default function Propriedades() {
  const { data, error, loading, reload, setData } = useApi('/propriedades')
  const [editing, setEditing] = useState(null) // null = fechado · 'nova' · id
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [address, setAddress] = useState(null)
  const [notice, setNotice] = useState(null)
  const [sending, setSending] = useState(false)
  const list = data ?? []

  const open = (p) => {
    setEditing(p ? p.id : 'nova')
    setForm(p ? toForm(p) : EMPTY)
    setAddress(p ? { cidade: p.cidade, uf: p.uf, endereco: p.endereco } : null)
    setErrors({})
    setNotice(null)
  }
  const close = () => setEditing(null)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e?.target ? e.target.value : e })
    setErrors({ ...errors, [k]: undefined })
  }

  const onCep = async (e) => {
    set('cep')(e)
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length !== 8) return setAddress(null)
    try {
      const r = await api(`/cep/${digits}`)
      setAddress(r)
      setForm((f) => ({ ...f, cep: r.cep, endereco: f.endereco || r.endereco }))
    } catch (err) {
      setErrors((x) => ({ ...x, cep: err.message }))
    }
  }

  const save = async (e) => {
    e.preventDefault()
    const found = {}
    if (form.nome.trim().length < 2) found.nome = 'Informe o nome da propriedade.'
    if (form.cep.replace(/\D/g, '').length !== 8) found.cep = 'CEP inválido: informe 8 números.'
    setErrors(found)
    if (Object.keys(found).length) return
    setSending(true)
    const body = {
      nome: form.nome,
      cep: form.cep,
      endereco: form.endereco || null,
      areaHa: form.areaHa ? Number(form.areaHa.replace(',', '.')) : null,
      raioEntregaKm: Number.parseInt(form.raioEntregaKm, 10),
    }
    try {
      const saved = await api(editing === 'nova' ? '/propriedades' : `/propriedades/${editing}`, {
        method: editing === 'nova' ? 'POST' : 'PUT',
        body,
      })
      setData((l) => (editing === 'nova' ? [...l, saved] : l.map((p) => (p.id === saved.id ? { ...p, ...saved } : p))))
      setNotice({ tone: 'success', text: `${saved.nome} ${editing === 'nova' ? 'cadastrada' : 'atualizada'}.` })
      close()
    } catch (err) {
      setErrors(err.porCampo)
      setNotice({ tone: 'danger', text: err.message })
    } finally {
      setSending(false)
    }
  }

  const remove = async (p) => {
    const extra = p.totalOfertas ? ` As ${p.totalOfertas} ofertas dela também serão excluídas.` : ''
    if (!window.confirm(`Excluir ${p.nome}?${extra}`)) return
    try {
      await api(`/propriedades/${p.id}`, { method: 'DELETE' })
      setData((l) => l.filter((x) => x.id !== p.id))
      setNotice({ tone: 'success', text: `${p.nome} excluída.` })
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Propriedades</h1>
          <p className="body-m t-secondary">Onde você produz. A distância até os compradores é calculada a partir daqui.</p>
        </div>
        {editing == null && (
          <Button icon={Plus} onClick={() => open(null)}>
            Nova propriedade
          </Button>
        )}
      </header>

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      {editing != null && (
        <Card as="form" className="panel property-form" onSubmit={save} noValidate>
          <div className="panel__head">
            <h2 className="h3">{editing === 'nova' ? 'Nova propriedade' : 'Editar propriedade'}</h2>
            <IconButton icon={X} label="Fechar formulário" onClick={close} />
          </div>
          <div className="property-form__grid">
            <div className="stack-16">
              <div className="grid-2">
                <Field label="Nome *" icon={House} name="nome" value={form.nome} onChange={set('nome')} error={errors.nome} placeholder="Sítio Boa Vista" />
                <Field
                  label="CEP *"
                  icon={MapPin}
                  name="cep"
                  inputMode="numeric"
                  value={form.cep}
                  onChange={onCep}
                  error={errors.cep}
                  placeholder="37550-000"
                  hint={address ? `${address.cidade}/${address.uf}` : 'Cidade preenchida pelo CEP (ViaCEP)'}
                />
              </div>
              <div className="grid-2">
                <Field label="Endereço" icon={MapPin} name="endereco" value={form.endereco} onChange={set('endereco')} placeholder="Estrada do Cervo, km 4" />
                <Field label="Área (hectares)" icon={Ruler} name="areaHa" inputMode="decimal" value={form.areaHa} onChange={set('areaHa')} error={errors.areaHa} placeholder="12" />
              </div>
              <div className="field-block">
                <span className="field__label">Raio de entrega</span>
                <ChipGroup label="Raio de entrega" options={RADIUS} value={form.raioEntregaKm} onChange={set('raioEntregaKm')} />
              </div>
              <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
                <Button type="submit" disabled={sending}>
                  {sending ? 'Salvando…' : 'Salvar propriedade'}
                </Button>
                <Button variant="ghost" onClick={close}>
                  Cancelar
                </Button>
              </div>
            </div>
            <div className="only-desktop">
              <RadiusMap radius={form.raioEntregaKm} />
            </div>
          </div>
        </Card>
      )}

      <LoadState loading={loading} error={error} onRetry={reload} empty={list.length === 0} emptyText="Nenhuma propriedade cadastrada.">
        <div className="property-grid">
          {list.map((p) => (
            <Card key={p.id} className="panel property">
              <div className="property__head">
                <IconTile icon={House} tone="brand" size={40} iconSize={20} />
                <div className="list__text">
                  <span className="h4">{p.nome}</span>
                  <span className="body-s t-tertiary">
                    {p.cidade}/{p.uf} · CEP {p.cep}
                  </span>
                </div>
              </div>
              {p.endereco && <p className="body-s t-secondary">{p.endereco}</p>}
              <div className="chip-group">
                <Badge tone="info">Entrega até {p.raioEntregaKm} km</Badge>
                {p.areaHa != null && <Badge tone="neutral">{String(p.areaHa).replace('.', ',')} ha</Badge>}
                <Badge tone="success">
                  {p.totalOfertas ?? 0} {p.totalOfertas === 1 ? 'oferta' : 'ofertas'}
                </Badge>
              </div>
              <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
                <Button size="s" variant="secondary" icon={Pencil} onClick={() => open(p)}>
                  Editar
                </Button>
                <Button size="s" variant="danger-ghost" icon={Trash2} onClick={() => remove(p)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </LoadState>
    </div>
  )
}
