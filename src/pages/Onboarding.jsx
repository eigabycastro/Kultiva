import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronLeft, House, MapPin } from 'lucide-react'
import Logo from '../components/Logo'
import { Button, ChipGroup, Field, cx } from '../components/ui'
import './auth.css'
import './onboarding.css'
import Title from '../components/Title'

const STEPS = [
  { title: 'Perfil', text: 'Produtor rural' },
  { title: 'Sua propriedade', text: 'Localização e raio de venda' },
  { title: 'O que você produz', text: 'Culturas e safra' },
  { title: 'Pronto!', text: 'Comece a vender' },
]
const CURRENT = 1

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
  const [radius, setRadius] = useState('30 km')
  const [cats, setCats] = useState(['Hortaliças', 'Frutas', 'Orgânicos'])

  return (
    <div className="auth onboarding">
      <aside className="auth__brand onboarding__brand only-desktop">
        <Logo theme="dark" />
        <div className="onboarding__intro">
          <p className="h2">Vamos configurar sua conta em 4 passos</p>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className={cx('steps__item', i < CURRENT && 'is-done', i === CURRENT && 'is-current')}>
                <span className="steps__dot">{i < CURRENT ? <Check size={14} strokeWidth={3} aria-hidden /> : i + 1}</span>
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
          Usamos sua localização para mostrar sua produção primeiro para compradores próximos — menos frete, mais
          frescor.
        </div>
      </aside>

      <section className="auth__panel onboarding__panel">
        <div className="m-topbar only-mobile">
          <Link to="/login" className="icon-btn" aria-label="Voltar para o login">
            <ChevronLeft size={22} aria-hidden />
          </Link>
          <Title mobile as="span" className="m-topbar__title">Criar conta</Title>
        </div>

        <form
          className="onboarding__form"
          onSubmit={(e) => {
            e.preventDefault()
            navigate('/produtor')
          }}
        >
          <div className="progress">
            <div className="progress__labels body-s">
              <span className="t-tertiary">Passo 2 de 4</span>
              <span className="t-tertiary">Propriedade</span>
            </div>
            <div className="progress__bars">
              {STEPS.map((s, i) => (
                <span key={s.title} className={cx(i <= CURRENT && 'is-on')} />
              ))}
            </div>
          </div>

          <header className="onboarding__head">
            <Title as="h2" className="onboarding__title">Onde fica sua produção?</Title>
            <p className="body-m t-secondary">Compradores no seu raio vão ver suas ofertas primeiro.</p>
          </header>

          <div className="onboarding__grid2">
            <Field label="Nome da propriedade" icon={House} name="propriedade" placeholder="Sítio Boa Vista" />
            <Field
              label="CEP"
              icon={MapPin}
              name="cep"
              placeholder="37550-000"
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </div>

          <div className="onboarding__row">
            <div className="onboarding__fields">
              <div className="onboarding__map only-mobile">
                <RadiusMap radius={radius} />
              </div>
              <div className="field-block">
                <span className="field__label">Raio de venda</span>
                <span className="body-s t-tertiary only-desktop">Até onde você consegue entregar?</span>
                <ChipGroup label="Raio de venda" options={['10 km', '30 km', '50 km', 'Retira no local']} value={radius} onChange={setRadius} />
              </div>
              <div className="field-block">
                <span className="field__label">O que você produz?</span>
                <span className="body-s t-tertiary only-desktop">Escolha uma ou mais categorias</span>
                <ChipGroup
                  multiple
                  options={['Hortaliças', 'Frutas', 'Legumes', 'Grãos', 'Orgânicos', 'Ovos e laticínios']}
                  value={cats}
                  onChange={setCats}
                />
              </div>
            </div>
            <div className="onboarding__map only-desktop">
              <RadiusMap radius={radius} />
            </div>
          </div>

          <div className="onboarding__actions">
            <Button variant="ghost" icon={ChevronLeft} to="/login" className="only-desktop">
              Voltar
            </Button>
            <Button type="submit" iconRight={ArrowRight} className="onboarding__continue">
              Salvar propriedade
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
