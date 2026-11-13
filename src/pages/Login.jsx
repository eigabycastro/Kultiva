import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, Lock, Mail, ShieldCheck, Sprout, Store } from 'lucide-react'
import Logo from '../components/Logo'
import { Button, Checkbox, Field } from '../components/ui'
import { Notice } from '../components/Feedback'
import Title from '../components/Title'
import { homeDe, useAuth } from '../auth/AuthContext'
import './auth.css'

// Contas criadas pelo seed (server/prisma/seed.js) para a demonstração
const DEMO = [
  { label: 'Produtor', icon: Sprout, email: 'joao@sitioboavista.com.br' },
  { label: 'Varejista', icon: Store, email: 'compras@mercadomais.com.br' },
  { label: 'Admin', icon: ShieldCheck, email: 'admin@kultiva.com.br' },
]
const DEMO_PASSWORD = 'kultiva123'

const BENEFITS = [
  'Estoque em tempo real, direto da colheita',
  'Negociação direta via chat, com histórico',
  'IA que estima preço e lucro da próxima safra',
]

export default function Login() {
  const navigate = useNavigate()
  const from = useLocation().state?.de
  const { entrar } = useAuth()
  const [remember, setRemember] = useState(true)
  const [form, setForm] = useState({ email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setErrors({ ...errors, [k]: undefined })
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.email.trim()) found.email = 'Informe o e-mail.'
    if (!form.senha) found.senha = 'Informe a senha.'
    setErrors(found)
    if (Object.keys(found).length) return
    setSending(true)
    setError('')
    try {
      const usuario = await entrar(form.email, form.senha, remember)
      navigate(from && from.startsWith(homeDe(usuario)) ? from : homeDe(usuario), { replace: true })
    } catch (err) {
      setError(err.message)
      setSending(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth__brand">
        <Logo theme="dark" />
        <div className="auth__hero">
          <h2 className="auth__title">Do campo direto pra quem vende.</h2>
          <p className="auth__lead">
            <span className="only-desktop">
              Conecte sua produção a supermercados, mercadinhos e restaurantes da sua região — com preço justo e sem
              atravessadores.
            </span>
            <span className="only-mobile">Venda e compre hortifruti da sua região, com preço justo e sem atravessadores.</span>
          </p>
          <ul className="auth__benefits only-desktop">
            {BENEFITS.map((b) => (
              <li key={b}>
                <span className="auth__check">
                  <Check size={18} strokeWidth={2.5} aria-hidden />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <figure className="auth__testimonial only-desktop">
          <blockquote>
            “Se eu pudesse cadastrar minha produção e ter compradores acessando em tempo real, facilitaria muito. Evitaria
            desperdício.”
          </blockquote>
          <figcaption className="body-s">Produtor de alface e tomate — entrevista de validação</figcaption>
        </figure>
      </aside>

      <section className="auth__panel">
        <form className="auth__form" onSubmit={submit}>
          <header className="auth__form-head">
            <Title className="h1 only-desktop">Bem-vindo de volta</Title>
            <Title mobile className="h2 only-mobile">Entrar na Kultiva</Title>
            <p className="body-m t-secondary only-desktop">Entre para negociar direto com quem produz e quem compra.</p>
          </header>

          <Notice tone="danger">{error}</Notice>

          <Field
            label="E-mail"
            icon={Mail}
            type="email"
            name="email"
            placeholder="voce@seusitio.com.br"
            autoComplete="email"
            spellCheck={false}
            autoCapitalize="none"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />
          <Field
            label="Senha"
            icon={Lock}
            type="password"
            name="password"
            placeholder="••••••••••"
            autoComplete="current-password"
            value={form.senha}
            onChange={set('senha')}
            error={errors.senha}
          />

          <div className="auth__options">
            <span className="only-desktop">
              <Checkbox checked={remember} onChange={setRemember}>
                Lembrar de mim
              </Checkbox>
            </span>
            <button
              type="button"
              className="link-btn label-m auth__forgot"
              onClick={() => setError('A recuperação de senha por e-mail chega na próxima versão. Fale com a equipe Kultiva.')}
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="auth__actions">
            <Button type="submit" block disabled={sending}>
              {sending ? 'Entrando…' : 'Entrar'}
            </Button>
            <div className="auth__divider only-desktop">
              <span />
              <span className="body-s t-tertiary">ou</span>
              <span />
            </div>
            <Button as={Link} to="/cadastro" variant="secondary" block>
              Criar conta grátis
            </Button>
          </div>

          <div className="auth__demo">
            <span className="body-s t-tertiary">Contas de demonstração (senha {DEMO_PASSWORD}):</span>
            <div className="auth__demo-list">
              {DEMO.map(({ label, icon: Icon, email }) => (
                <button
                  key={email}
                  type="button"
                  className="chip"
                  onClick={() => {
                    setForm({ email, senha: DEMO_PASSWORD })
                    setErrors({})
                  }}
                >
                  <Icon size={14} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="body-s t-tertiary auth__terms only-desktop">
            Ao continuar, você concorda com os <Link to="/termos">Termos de Uso</Link> e a{' '}
            <Link to="/privacidade">Política de Privacidade</Link>. <Link to="/creditos">Créditos das fotos</Link>.
          </p>
        </form>
      </section>
    </div>
  )
}
