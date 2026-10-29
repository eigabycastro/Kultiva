import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { Badge, Button, IconTile, Segmented, cx } from '../components/ui'
import { icon } from '../components/icons'
import { plans } from '../data/mock'
import './pages.css'
import './planos.css'

export default function Planos() {
  const [period, setPeriod] = useState('mensal')

  return (
    <div className="plans">
      <header className="plans__head">
        <h1 className="plans__title">Comece grátis. Cresça com o Premium.</h1>
        <p className="body-m t-secondary">
          A versão gratuita cobre o essencial da negociação. A assinatura entrega mais alcance, dados e destaque.
        </p>
        <Segmented
          label="Período de cobrança"
          className="period"
          itemClassName="period__item"
          activeClassName="is-active"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'mensal', label: 'Mensal' },
            { value: 'anual', label: 'Anual · economize 20%' },
          ]}
        />
      </header>

      <div className="plans__grid">
        {plans.map((p) => (
          <article key={p.id} className={cx('plan', p.featured && 'plan--featured')}>
            <div className="plan__top">
              <IconTile icon={icon(p.icon)} tone={p.featured ? 'accent' : 'brand'} size={40} iconSize={20} />
              {p.featured && <Badge tone="warning">Mais escolhido</Badge>}
            </div>
            <div>
              <h2 className="h3">{p.name}</h2>
              <p className="body-s plan__desc">{p.description}</p>
            </div>
            <div className="plan__price">
              <span className="plan__amount" aria-live="polite">{period === 'anual' && p.yearlyPrice ? p.yearlyPrice : p.price}</span>
              <span className="body-s plan__desc">{p.period}</span>
            </div>
            <Button variant={p.ctaVariant} block disabled={p.id === 'free'}>
              {p.cta}
            </Button>
            <ul className="plan__features">
              {p.features.map((f) => (
                <li key={f}>
                  <span className="plan__check">
                    <Check size={12} strokeWidth={3} aria-hidden />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="plans__note body-s">
        <ShieldCheck size={16} color="var(--icon-brand)" aria-hidden />
        Em todos os planos: taxa reduzida apenas sobre transações concluídas pela plataforma. Sem fidelidade — cancele
        quando quiser.
      </p>
    </div>
  )
}
