import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, House, Lock, Mail, MapPin, Phone, Store, User } from 'lucide-react'
import { Avatar, Badge, Button, Card, ChipGroup, Field } from '../components/ui'
import { Notice } from '../components/Feedback'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import { PERFIL_LABEL } from '../utils/status'
import './pages.css'
import './produtor/oferta.css'
import './perfil.css'

const RADIUS = ['10 km', '30 km', '50 km', '100 km']
const TYPES = ['Supermercado', 'Mercado', 'Restaurante', 'Hortifruti', 'Distribuidor', 'Compra institucional']

const toForm = (u) => ({
  nome: u.nome ?? '',
  email: u.email ?? '',
  telefone: u.telefone ?? '',
  organizacao: u.organizacao ?? '',
  tipoEstabelecimento: u.tipoEstabelecimento ?? '',
  cep: u.cep ?? '',
  endereco: u.endereco ?? '',
  raio: `${u.raioKm} km`,
})

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
  const { usuario, setUsuario, sair, area } = useAuth()
  const navigate = useNavigate()
  const [base, setBase] = useState(() => toForm(usuario))
  const [form, setForm] = useState(base)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [cepInfo, setCepInfo] = useState(usuario.cidade ? `${usuario.cidade}/${usuario.uf}` : '')
  const [pwd, setPwd] = useState({ senhaAtual: '', novaSenha: '' })
  const [sending, setSending] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(base)
  useUnsavedChanges(dirty)
  const produtor = usuario.perfil === 'PRODUTOR'
  const admin = usuario.perfil === 'ADMIN'

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e?.target ? e.target.value : e })
    setErrors({ ...errors, [k]: undefined })
  }
  const onCep = async (e) => {
    set('cep')(e)
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length !== 8) return
    try {
      const r = await api(`/cep/${digits}`)
      setCepInfo(`${r.cidade}/${r.uf}`)
      setForm((f) => ({ ...f, cep: r.cep, endereco: r.endereco || f.endereco }))
    } catch (err) {
      setErrors((x) => ({ ...x, cep: err.message }))
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSending(true)
    setNotice(null)
    try {
      const u = await api('/auth/me', {
        method: 'PUT',
        body: {
          nome: form.nome,
          email: form.email,
          telefone: form.telefone || null,
          organizacao: form.organizacao,
          tipoEstabelecimento: produtor ? undefined : form.tipoEstabelecimento || null,
          endereco: form.endereco || null,
          cep: form.cep || undefined,
          raioKm: Number.parseInt(form.raio, 10),
        },
      })
      setUsuario(u)
      const next = toForm(u)
      setBase(next)
      setForm(next)
      setNotice({ tone: 'success', text: 'Alterações salvas.' })
    } catch (err) {
      setErrors(err.porCampo)
      setNotice({ tone: 'danger', text: err.message })
    } finally {
      setSending(false)
    }
  }

  const changePassword = async () => {
    if (pwd.novaSenha.length < 8) return setErrors({ novaSenha: 'A nova senha precisa de pelo menos 8 caracteres.' })
    try {
      await api('/auth/me', { method: 'PUT', body: pwd })
      setPwd({ senhaAtual: '', novaSenha: '' })
      setNotice({ tone: 'success', text: 'Senha alterada.' })
    } catch (err) {
      setErrors(err.porCampo)
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  const removeAccount = async () => {
    if (!window.confirm(`Excluir a conta de ${usuario.organizacao || usuario.nome}? Ofertas, demandas e notificações serão apagadas e não dá para desfazer.`)) return
    try {
      await api('/auth/me', { method: 'DELETE' })
      await sair()
      navigate('/login', { replace: true })
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  return (
    <form className="page" onSubmit={save} noValidate>
      <header className="page-header">
        <div className="profile-head">
          <Avatar initials={usuario.iniciais} size={56} />
          <div>
            <h1 className="h1">Perfil e configurações</h1>
            <p className="body-m t-secondary">
              {usuario.organizacao} · {PERFIL_LABEL[usuario.perfil]} · plano {usuario.plano}
            </p>
          </div>
        </div>
        <div className="page-header__actions">
          <Button type="submit" disabled={!dirty || sending}>
            {sending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </header>

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      <Section title="Dados da conta" text="Quem responde pela conta e como os parceiros falam com você.">
        <div className="grid-2">
          <Field label="Nome" icon={User} name="nome" value={form.nome} onChange={set('nome')} error={errors.nome} autoComplete="name" />
          <Field label="E-mail" icon={Mail} name="email" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" spellCheck={false} />
          <Field label="Telefone / WhatsApp" icon={Phone} name="telefone" type="tel" value={form.telefone} onChange={set('telefone')} autoComplete="tel" />
          <Field label="Documento" icon={Building2} name="doc" value={usuario.documento ?? '—'} readOnly hint="Para alterar o documento, fale com o suporte." />
        </div>
      </Section>

      {!admin && (
        <Section
          title={produtor ? 'Endereço principal' : 'Empresa'}
          text={produtor ? 'Suas propriedades ficam na tela Propriedades.' : 'Onde você recebe as entregas. A distância até os produtores é calculada daqui.'}
        >
          <div className="grid-2">
            <Field label={produtor ? 'Nome do sítio / empresa' : 'Nome do estabelecimento'} icon={House} name="organizacao" value={form.organizacao} onChange={set('organizacao')} error={errors.organizacao} />
            {!produtor && (
              <Field label="Tipo de estabelecimento" icon={Store}>
                <select className="field__input" value={form.tipoEstabelecimento} onChange={set('tipoEstabelecimento')}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="CEP" icon={MapPin} name="cep" inputMode="numeric" value={form.cep} onChange={onCep} error={errors.cep} hint={cepInfo} />
            <Field label="Endereço" icon={MapPin} name="endereco" value={form.endereco} onChange={set('endereco')} autoComplete="street-address" />
          </div>
          <div className="field-block">
            <span className="field__label">{produtor ? 'Raio de entrega padrão' : 'Buscar produtores em até'}</span>
            <ChipGroup label="Raio" options={RADIUS} value={form.raio} onChange={set('raio')} />
          </div>
          {produtor && (
            <Button variant="secondary" to="/produtor/propriedades">
              Gerenciar propriedades
            </Button>
          )}
        </Section>
      )}

      <Section title="Senha" text="Use pelo menos 8 caracteres.">
        <div className="grid-2">
          <Field label="Senha atual" icon={Lock} type="password" autoComplete="current-password" value={pwd.senhaAtual} onChange={(e) => setPwd({ ...pwd, senhaAtual: e.target.value })} error={errors.senhaAtual} />
          <Field label="Nova senha" icon={Lock} type="password" autoComplete="new-password" value={pwd.novaSenha} onChange={(e) => setPwd({ ...pwd, novaSenha: e.target.value })} error={errors.novaSenha} />
        </div>
        <Button variant="secondary" onClick={changePassword} disabled={!pwd.senhaAtual || !pwd.novaSenha}>
          Alterar senha
        </Button>
      </Section>

      {!admin && (
        <Section title="Plano" text="O que está incluído hoje e o que o Premium acrescenta.">
          <div className="plan-line">
            <div>
              <span className="label-m">Plano {usuario.plano}</span> <Badge tone="success">Atual</Badge>
              <p className="body-s t-secondary">Cadastro de produtos, busca por região, pedidos e Procura-se.</p>
            </div>
            <Button variant="accent" to={`/${area}/planos`}>
              Conhecer o Premium
            </Button>
          </div>
        </Section>
      )}

      {!admin && (
        <Section title="Excluir conta" text="Apaga ofertas, demandas e notificações. Não dá para desfazer.">
          <div className="plan-line">
            <p className="body-s t-secondary">Contas com pedidos no histórico precisam falar com o suporte para encerrar.</p>
            <button type="button" className="btn btn--m btn--danger" onClick={removeAccount}>
              Excluir conta
            </button>
          </div>
        </Section>
      )}
    </form>
  )
}
