import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Lock, Mail, Sprout, Store } from 'lucide-react'
import Logo from '../components/Logo'
import { Button, Checkbox, Field, Segmented } from '../components/ui'
import Title from '../components/Title'
import './auth.css'

const BENEFITS = [
  'Estoque em tempo real, direto da colheita',
  'Negociação direta via chat, com histórico',
  'IA que estima preço e lucro da próxima safra',
]

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('produtor')
  const [remember, setRemember] = useState(true)

  const submit = (e) => {
    e.preventDefault()
    // TODO(back-end): autenticar via API antes de redirecionar
    navigate(role === 'produtor' ? '/produtor' : '/varejista')
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

          <Segmented
            label="Perfil"
            value={role}
            onChange={setRole}
            options={[
              { value: 'produtor', label: <><span className="only-desktop">Sou produtor</span><span className="only-mobile">Produtor</span></>, icon: Sprout },
              { value: 'varejista', label: <><span className="only-desktop">Sou varejista</span><span className="only-mobile">Varejista</span></>, icon: Store },
            ]}
          />

          <Field
            label="E-mail"
            icon={Mail}
            type="email"
            name="email"
            placeholder="voce@seusitio.com.br"
            autoComplete="email"
            spellCheck={false}
            autoCapitalize="none"
          />
          <Field
            label="Senha"
            icon={Lock}
            type="password"
            name="password"
            placeholder="••••••••••"
            autoComplete="current-password"
          />

          <div className="auth__options">
            <span className="only-desktop">
              <Checkbox checked={remember} onChange={setRemember}>
                Lembrar de mim
              </Checkbox>
            </span>
            {/* TODO(back-end): enviar e-mail de recuperação de senha */}
            <button type="button" className="link-btn label-m auth__forgot">
              Esqueci minha senha
            </button>
          </div>

          <div className="auth__actions">
            <Button type="submit" block>
              Entrar
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

          <p className="body-s t-tertiary auth__terms only-desktop">
            Ao continuar, você concorda com os <Link to="/termos">Termos de Uso</Link> e a{' '}
            <Link to="/privacidade">Política de Privacidade</Link>. <Link to="/creditos">Créditos das fotos</Link>.
          </p>
        </form>
      </section>
    </div>
  )
}
