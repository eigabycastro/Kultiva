import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, House, Mail, MapPin, Phone, User } from 'lucide-react'
import { useRole } from '../components/layout/AppLayout'
import { Avatar, Badge, Button, Card, ChipGroup, Field, Toggle } from '../components/ui'
import { profiles, users } from '../data/mock'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import './pages.css'
import './produtor/oferta.css'
import './perfil.css'

const ALERTS = [
  { key: 'demandas', label: 'Demandas e ofertas novas', on: true },
  { key: 'pedidos', label: 'Pedidos e entregas', on: true },
  { key: 'mensagens', label: 'Mensagens de negociação', on: true },
  { key: 'precos', label: 'Variação de preço acima de 5%', on: false },
]

function Section({ title, text, children }) {
  return (
    <section className="settings-row">
      <div className="settings-row__label">
        <h2 className="h3">{title}</h2>
        <p className="body-s t-secondary">{text}</p>
      </div>
      <Card className="panel settings-row__panel">{children}</Card>
    </section>
  )
}

export default function Perfil() {
  const role = useRole()
  const navigate = useNavigate()
  const base = profiles[role]
  const [form, setForm] = useState(base)
  const [radius, setRadius] = useState('30 km')
  const [alerts, setAlerts] = useState(Object.fromEntries(ALERTS.map((a) => [a.key, a.on])))
  const [saved, setSaved] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(base)
  useUnsavedChanges(dirty && !saved)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setSaved(false)
  }
  const save = (e) => {
    e.preventDefault()
    // TODO(back-end): PUT /perfil
    setSaved(true)
  }
  const removeAccount = () => {
    // TODO(back-end): DELETE /conta
    if (window.confirm(`Excluir a conta de ${base.org}? Suas ofertas, pedidos e conversas serão apagados e não dá para desfazer.`)) {
      navigate('/login')
    }
  }

  return (
    <form className="page" onSubmit={save} noValidate>
      <header className="page-header">
        <div className="profile-head">
          <Avatar initials={users[role].initials} size={56} />
          <div>
            <h1 className="h1">Perfil e configurações</h1>
            <p className="body-m t-secondary">
              {base.org} · {role === 'produtor' ? 'Produtor rural' : 'Varejista'} · plano {base.plan}
            </p>
          </div>
        </div>
        <div className="page-header__actions">
          <span className="body-s t-success" aria-live="polite">
            {saved ? 'Alterações salvas' : ''}
          </span>
          <Button type="submit" disabled={!dirty || saved}>
            Salvar alterações
          </Button>
        </div>
      </header>

      <Section title="Dados da conta" text="Quem responde pela conta e como os compradores falam com você.">
        <div className="grid-2">
          <Field label="Nome" icon={User} name="name" value={form.name} onChange={set('name')} autoComplete="name" />
          <Field
            label="E-mail"
            icon={Mail}
            name="email"
            type="email"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            spellCheck={false}
          />
          <Field label="Telefone / WhatsApp" icon={Phone} name="phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
          <Field label="Documento" icon={Building2} name="doc" value={form.doc} readOnly hint="Para alterar o documento, fale com o suporte." />
        </div>
      </Section>

      <Section
        title={role === 'produtor' ? 'Propriedade' : 'Empresa'}
        text={role === 'produtor' ? 'Onde você produz e até onde entrega.' : 'Onde você recebe as entregas.'}
      >
        <div className="grid-2">
          <Field label={role === 'produtor' ? 'Nome da propriedade' : 'Razão social'} icon={House} name="org" value={form.org} onChange={set('org')} />
          <Field label="Endereço" icon={MapPin} name="address" value={form.address} onChange={set('address')} autoComplete="street-address" />
        </div>
        <div className="field-block">
          <span className="field__label">{role === 'produtor' ? 'Raio de entrega' : 'Buscar produtores em até'}</span>
          <ChipGroup label="Raio" options={['10 km', '30 km', '50 km', '100 km']} value={radius} onChange={setRadius} />
        </div>
      </Section>

      <Section title="Notificações" text="O que chega no seu celular. Cada opção salva sozinha.">
        <ul className="switch-list">
          {ALERTS.map((a) => (
            <li key={a.key}>
              <span className="body-m">{a.label}</span>
              <Toggle checked={alerts[a.key]} onChange={(v) => setAlerts({ ...alerts, [a.key]: v })} label={a.label} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Plano" text="O que está incluído hoje e o que o Premium acrescenta.">
        <div className="plan-line">
          <div>
            <span className="label-m">Plano {base.plan}</span> <Badge tone="success">Atual</Badge>
            <p className="body-s t-secondary">Cadastro de produtos, busca por região, chat e Procura-se.</p>
          </div>
          <Button variant="accent" to={`/${role}/planos`}>
            Conhecer o Premium
          </Button>
        </div>
      </Section>

      <Section title="Excluir conta" text="Apaga ofertas, pedidos e conversas. Não dá para desfazer.">
        <div className="plan-line">
          <p className="body-s t-secondary">Pedidos em andamento precisam ser concluídos ou cancelados antes.</p>
          <button type="button" className="btn btn--m btn--danger" onClick={removeAccount}>
            Excluir conta de {base.org}
          </button>
        </div>
      </Section>
    </form>
  )
}
