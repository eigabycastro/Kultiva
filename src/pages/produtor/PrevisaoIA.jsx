import { Plus, Sparkles } from 'lucide-react'
import { Badge, Button, Card, ChipGroup } from '../../components/ui'
import { ForecastChart } from './Dashboard'
import { forecasts } from '../../data/mock'
import { useQueryState } from '../../hooks/useQueryState'
import { formatBRL } from '../../utils/format'
import '../pages.css'
import './previsao.css'

const PRODUCTS = Object.keys(forecasts)

export default function PrevisaoIA() {
  const [product, setProduct] = useQueryState('produto', PRODUCTS[0])
  const f = forecasts[product] ?? forecasts[PRODUCTS[0]]
  const avg = f.bars.filter((b) => b.forecast).reduce((s, b) => s + b.price, 0) / f.bars.filter((b) => b.forecast).length
  // receita e lucro saem dos valores mostrados, para a conta fechar na tela
  const revenue = Math.round(avg * 100) / 100 * f.harvest
  const profit = revenue - f.cost

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Previsão IA</h1>
          <p className="body-m t-secondary">
            Preço por {f.unit} na região de Pouso Alegre: histórico de 6 semanas e projeção para as próximas 3.
          </p>
        </div>
        <Button icon={Plus} to="/produtor/produtos/nova">
          Cadastrar oferta
        </Button>
      </header>

      <ChipGroup label="Produto" options={PRODUCTS} value={product} onChange={setProduct} />

      <div className="forecast-hero">
        <div className="forecast-hero__main">
          <span className="forecast-hero__label">Melhor janela de venda</span>
          <span className="forecast-hero__value">{f.window}</span>
          <span className="forecast-hero__sub">
            {formatBRL(f.best)}/{f.unit} estimado · <strong>{f.change}</strong> sobre hoje ({formatBRL(f.today)})
          </span>
        </div>
        <Sparkles size={56} strokeWidth={1.25} className="forecast-hero__icon" aria-hidden />
      </div>

      <div className="forecast-layout">
        <Card className="panel">
          <div className="panel__head">
            <div>
              <h2 className="h3">{product}</h2>
              <p className="body-s t-tertiary">R$/{f.unit} · verde = preço praticado, amarelo = projeção da IA</p>
            </div>
            <Badge tone="warning" icon={Sparkles}>
              Previsão IA
            </Badge>
          </div>
          <ForecastChart bars={f.bars} />
        </Card>

        <Card className="panel">
          <h2 className="h3">Estimativa da safra</h2>
          <dl className="estimate">
            <div>
              <dt>Produção prevista</dt>
              <dd>
                {f.harvest} {f.unit === 'kg' ? 'kg' : f.unit === 'caixa' ? 'caixas' : 'maços'}
              </dd>
            </div>
            <div>
              <dt>Preço médio projetado</dt>
              <dd>{formatBRL(Math.round(avg * 100) / 100)}</dd>
            </div>
            <div>
              <dt>Receita estimada</dt>
              <dd>{formatBRL(revenue)}</dd>
            </div>
            <div>
              <dt>Custo estimado</dt>
              <dd>− {formatBRL(f.cost)}</dd>
            </div>
            <div className="estimate__total">
              <dt>Lucro estimado</dt>
              <dd>{formatBRL(profit)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="panel">
        <h2 className="h3">O que fazer agora</h2>
        <ul className="tips">
          {f.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
