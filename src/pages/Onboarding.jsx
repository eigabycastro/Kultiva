import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Check, ChevronLeft, House, Lock, Mail, MapPin, Phone, Sprout, Store, User } from 'lucide-react'
import Logo from '../components/Logo'
import { Button, ChipGroup, Field, Segmented, cx } from '../components/ui'
import { Notice } from '../components/Feedback'
import { api } from '../api/client'
import { homeDe, useAuth } from '../auth/AuthContext'
import './auth.css'
import './onboarding.css'
import Title from '../components/Title'

const STEPS = [
  { title: 'Sua conta', text: 'Perfil e acesso' },
  { title: 'Localização', text: 'Endereço e raio' },
  { title: 'Pronto!', text: 'Comece a negociar' },
]
const RADIUS = ['10 km', '30 km', '50 km', '100 km']
const TYPES = ['Supermercado', 'Mercado', 'Restaurante', 'Hortifruti', 'Distribuidor', 'Compra institucional']

const STEP1 = ['perfil', 'nome', 'email', 'senha']

export function RadiusMap({ radius = '30 km' }) {
  return (
    <div className="radius-map">
      {/* ruas desenhadas (substituir por um mapa real quando houver API de mapas) */}
      <svg className="radius-map__roads" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden>
        <g fill="none" stroke="#c8e0ca" strokeWidth="3" strokeLinecap="round">
          <path d="M0 62 C 60 70, 120 40, 200 55" />
          <path d="M0 140 C 70 128, 130 150, 200 132" />
          <path d="M48 0 C 56 70, 40 130, 60 200" />
          <path d="M150 0 C 140 60, 160 140, 146 200" />
        </g>
        <path d="M0 100 C 70 92, 120 112, 200 98" fill="none" stroke="#b5d6b8" strokeWidth="5" />
      </svg>
      <span className="radius-map__label">
        <MapPin size={14} strokeWidth={2} aria-hidden />
        Raio de {radius}
      </span>
      <div className="radius-map__circle">
        <span className="radius-map__pin">
          <MapPin size={22} strokeWidth={2.25} aria-hidden />
        </span>
      </div>
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { cadastrar } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    perfil: 'PRODUTOR',
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    documento: '',
    organizacao: '',
    tipoEstabelecimento: 'Supermercado',
    cep: '',
    numero: '',
  })
  const [radius, setRadius] = useState('30 km')
  const [address, setAddress] = useState(null)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const produtor = form.perfil === 'PRODUTOR'

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e?.target ? e.target.value : e })
    setErrors({ ...errors, [k]: undefined })
  }

  // ViaCEP (via API): preenche cidade/endereço assim que o CEP tem 8 números
  const lookupCep = async (value) => {
    const digits = value.replace(/\D/g, '')
    setAddress(null)
    if (digits.length !== 8) return
    try {
      setAddress(await api(`/cep/${digits}`))
      setErrors((x) => ({ ...x, cep: undefined }))
    } catch (err) {
      setErrors((x) => ({ ...x, cep: err.message }))
    }
  }

  const validateStep1 = () => {
    const found = {}
    if (form.nome.trim().length < 3) found.nome = 'Informe seu nome completo.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'E-mail inválido, ex.: voce@seusitio.com.br.'
    if (form.senha.length < 8) found.senha = 'A senha precisa de pelo menos 8 caracteres.'
    setErrors(found)
    return Object.keys(found).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (step === 0) {
      if (validateStep1()) setStep(1)
      return
    }
    const found = {}
    if (form.organizacao.trim().length < 2) found.organizacao = produtor ? 'Informe o nome da propriedade.' : 'Informe o nome do estabelecimento.'
    if (form.cep.replace(/\D/g, '').length !== 8) found.cep = 'CEP inválido: informe 8 números, ex.: 37550-000.'
    setErrors(found)
    if (Object.keys(found).length) return

    setSending(true)
    try {
      const usuario = await cadastrar({
        ...form,
        tipoEstabelecimento: produtor ? null : form.tipoEstabelecimento,
        raioKm: Number.parseInt(radius, 10),
      })
      navigate(produtor ? '/produtor/produtos/nova' : homeDe(usuario), { replace: true, state: { welcome: true } })
    } catch (err) {
      const byField = err.porCampo ?? {}
      setErrors(byField)
      setError(err.message)
      if (Object.keys(byField).some((k) => STEP1.includes(k)) || err.status === 409) setStep(0)
      setSending(false)
    }
  }

  return (
    <div className="auth onboarding">
      <aside className="auth__brand onboarding__brand only-desktop">
        <Logo theme="dark" />
        <div className="onboarding__intro">
          <p className="h2">Crie sua conta em 2 passos</p>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className={cx('steps__item', i < step && 'is-done', i === step && 'is-current')}>
                <span className="steps__dot">{i < step ? <Check size={14} strokeWidth={3} aria-hidden /> : i + 1}</span>
                <span>
                  <span className="label-m">{s.title}</span>
                  <span className="body-s">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="onboarding__note body-s">
          <MapPin size={18} strokeWidth={2} color="var(--icon-accent)" aria-hidden />
          Usamos sua localização para aproximar produtores e compradores da mesma região — menos frete, mais frescor.
        </div>
      </aside>

      <section className="auth__panel onboarding__panel">
        <div className="m-topbar only-mobile">
          {step === 0 ? (
            <Link to="/login" className="icon-btn" aria-label="Voltar para o login">
              <ChevronLeft size={22} aria-hidden />
            </Link>
          ) : (
            <button type="button" className="icon-btn" aria-label="Voltar ao passo 1" onClick={() => setStep(0)}>
              <ChevronLeft size={22} aria-hidden />
            </button>
          )}
          <Title mobile as="span" className="m-topbar__title">Criar conta</Title>
        </div>

        <form className="onboarding__form" onSubmit={submit} noValidate>
          <div className="progress">
            <div className="progress__labels body-s">
              <span className="t-tertiary">Passo {step + 1} de 2</span>
              <span className="t-tertiary">{STEPS[step].title}</span>
            </div>
            <div className="progress__bars">
              {[0, 1].map((i) => (
                <span key={i} className={cx(i <= step && 'is-on')} />
              ))}
            </div>
          </div>

          <Notice tone="danger">{error}</Notice>

          {step === 0 ? (
            <>
              <header className="onboarding__head">
                <Title as="h2" className="onboarding__title">Como você vai usar a Kultiva?</Title>
                <p className="body-m t-secondary">Produtores publicam ofertas; varejistas buscam e fazem pedidos.</p>
              </header>
              <Segmented
                label="Perfil"
                value={form.perfil}
                onChange={set('perfil')}
                options={[
                  { value: 'PRODUTOR', label: 'Sou produtor', icon: Sprout },
                  { value: 'VAREJISTA', label: 'Sou varejista', icon: Store },
                ]}
              />
              <div className="onboarding__grid2">
                <Field label="Nome completo *" icon={User} name="nome" value={form.nome} onChange={set('nome')} error={errors.nome} autoComplete="name" placeholder="João Silva" />
                <Field label="E-mail *" icon={Mail} type="email" name="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" placeholder="voce@seusitio.com.br" spellCheck={false} autoCapitalize="none" />
                <Field label="Senha *" icon={Lock} type="password" name="senha" value={form.senha} onChange={set('senha')} error={errors.senha} autoComplete="new-password" hint="Mínimo de 8 caracteres" />
                <Field label="Telefone / WhatsApp" icon={Phone} type="tel" name="telefone" value={form.telefone} onChange={set('telefone')} autoComplete="tel" placeholder="(35) 99999-0000" />
                <Field
                  label={produtor ? 'CPF ou CNPJ' : 'CNPJ'}
                  icon={Building2}
                  name="documento"
                  value={form.documento}
                  onChange={set('documento')}
                  placeholder={produtor ? '123.456.789-00' : '12.345.678/0001-90'}
                />
              </div>
            </>
          ) : (
            <>
              <header className="onboarding__head">
                <Title as="h2" className="onboarding__title">{produtor ? 'Onde fica sua produção?' : 'Onde você recebe as entregas?'}</Title>
                <p className="body-m t-secondary">
                  {produtor ? 'Compradores no seu raio vão ver suas ofertas primeiro.' : 'Mostramos primeiro os produtores mais perto de você.'}
                </p>
              </header>

              <div className="onboarding__grid2">
                <Field
                  label={produtor ? 'Nome da propriedade *' : 'Nome do estabelecimento *'}
                  icon={produtor ? House : Store}
                  name="organizacao"
                  placeholder={produtor ? 'Sítio Boa Vista' : 'Mercado Mais'}
                  value={form.organizacao}
                  onChange={set('organizacao')}
                  error={errors.organizacao}
                />
                <Field
                  label="CEP *"
                  icon={MapPin}
                  name="cep"
                  placeholder="37550-000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={form.cep}
                  onChange={(e) => {
                    set('cep')(e)
                    lookupCep(e.target.value)
                  }}
                  error={errors.cep}
                  hint={address ? `${address.endereco ? `${address.endereco} · ` : ''}${address.cidade}/${address.uf}` : 'O endereço é preenchido pelo CEP'}
                />
                <Field label="Número / complemento" icon={House} name="numero" value={form.numero} onChange={set('numero')} placeholder="km 4, nº 120…" />
                {!produtor && (
                  <Field label="Tipo de estabelecimento" icon={Store}>
                    <select className="field__input" name="tipoEstabelecimento" value={form.tipoEstabelecimento} onChange={set('tipoEstabelecimento')}>
                      {TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>

              <div className="onboarding__row">
                <div className="onboarding__fields">
                  <div className="onboarding__map only-mobile">
                    <RadiusMap radius={radius} />
                  </div>
                  <div className="field-block">
                    <span className="field__label">{produtor ? 'Raio de entrega' : 'Buscar produtores em até'}</span>
                    <span className="body-s t-tertiary only-desktop">{produtor ? 'Até onde você consegue entregar?' : 'Você pode mudar depois no perfil.'}</span>
                    <ChipGroup label="Raio" options={RADIUS} value={radius} onChange={setRadius} />
                  </div>
                </div>
                <div className="onboarding__map only-desktop">
                  <RadiusMap radius={radius} />
                </div>
              </div>
            </>
          )}

          <div className="onboarding__actions">
            {step === 0 ? (
              <Button variant="ghost" icon={ChevronLeft} to="/login" className="only-desktop">
                Já tenho conta
              </Button>
            ) : (
              <Button variant="ghost" icon={ChevronLeft} onClick={() => setStep(0)} className="only-desktop">
                Voltar
              </Button>
            )}
            <Button type="submit" iconRight={ArrowRight} className="onboarding__continue" disabled={sending}>
              {step === 0 ? 'Continuar' : sending ? 'Criando conta…' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
