import { useState } from 'react'
import { Info, Plus, Sparkles } from 'lucide-react'
import { Badge, Button, Card, ChipGroup, Field } from '../../components/ui'
import { LoadState } from '../../components/Feedback'
import { ForecastChart } from './Dashboard'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import { formatBRL, formatDay, formatQty, parseMoney } from '../../utils/format'
import '../pages.css'
import './oferta.css'
import './previsao.css'

/* Previsão de preço com os dados da plataforma (pedidos aceitos + ofertas ativas).
   O cálculo está em server/src/routes/previsao.js; o modelo de IA entra na Release 4. */
export default function PrevisaoIA() {
  const [productId, setProductId] = useQueryState('produto', '')
  const [costRaw, setCost] = useState('')
  const { data, error, loading, reload } = useApi('/previsao', { produtoId: productId || undefined })
  const produtos = data?.produtos ?? []
  const f = data?.previsao
  const current = produtos.find((p) => p.id === f?.produtoId)

  const bars = f?.historico
    ? [
        ...f.historico.map((h) => ({ date: formatDay(h.semana), price: h.preco })),
        ...f.projecao.map((h) => ({ date: formatDay(h.semana), price: h.preco, forecast: true })),
      ]
    : []
  const avg = f?.projecao ? f.projecao.reduce((s, p) => s + p.preco, 0) / f.projecao.length : 0
  const revenue = Math.round(avg * (f?.estoque ?? 0) * 100) / 100
  const cost = parseMoney(costRaw) ?? 0
  const subindo = f?.variacao > 0

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Previsão de preço</h1>
          <p className="body-m t-secondary">Preço praticado nas últimas 6 semanas e projeção para as próximas 3, com base nas vendas da região.</p>
        </div>
        <Button icon={Plus} to="/produtor/produtos/nova">
          Cadastrar oferta
        </Button>
      </header>

      {produtos.length > 0 && (
        <ChipGroup label="Produto" options={produtos.map((p) => p.nome)} value={current?.nome} onChange={(nome) => setProductId(String(produtos.find((p) => p.nome === nome).id))} />
      )}

      <LoadState
        loading={loading && !data}
        error={error}
        onRetry={reload}
        empty={!f || f.semDados}
        emptyText={!produtos.length ? 'Cadastre uma oferta para ver a previsão de preço do produto.' : `Ainda não há vendas nem ofertas ativas de ${f?.produto?.toLowerCase() ?? 'este produto'} para calcular a previsão.`}
      >
        {f?.historico && (
          <>
            <div className="forecast-hero">
              <div className="forecast-hero__main">
                <span className="forecast-hero__label">{subindo ? 'Melhor janela de venda' : 'Projeção para as próximas semanas'}</span>
                <span className="forecast-hero__value">{subindo ? f.janela : f.variacao < 0 ? 'Preço em queda' : 'Preço estável'}</span>
                <span className="forecast-hero__sub">
                  {formatBRL(f.melhorPreco)}/{f.unidade} estimado · <strong>{f.variacao > 0 ? '+' : ''}{f.variacao}%</strong> sobre hoje ({formatBRL(f.precoHoje)})
                </span>
              </div>
              <Sparkles size={56} strokeWidth={1.25} className="forecast-hero__icon" aria-hidden />
            </div>

            <div className="forecast-layout">
              <Card className="panel">
                <div className="panel__head">
                  <div>
                    <h2 className="h3">{f.produto}</h2>
                    <p className="body-s t-tertiary">R$/{f.unidade} por semana · verde = preço praticado, amarelo = projeção</p>
                  </div>
                  <Badge tone="info" icon={Info}>
                    {f.vendasNoPeriodo} {f.vendasNoPeriodo === 1 ? 'venda' : 'vendas'}
                  </Badge>
                </div>
                <ForecastChart bars={bars} />
                <p className="body-s t-tertiary">
                  {f.metodo}. Semanas sem venda repetem o último preço conhecido. O modelo com IA chega na Release 4.
                </p>
              </Card>

              <Card className="panel">
                <h2 className="h3">Estimativa do seu estoque</h2>
                <dl className="estimate">
                  <div>
                    <dt>Estoque em oferta</dt>
                    <dd>{formatQty(f.estoque, f.unidade)}</dd>
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
                    <dt>Custo de produção</dt>
                    <dd>{cost ? `− ${formatBRL(cost)}` : '—'}</dd>
                  </div>
                  <div className="estimate__total">
                    <dt>{cost ? 'Lucro estimado' : 'Receita (sem custo)'}</dt>
                    <dd>{formatBRL(revenue - cost)}</dd>
                  </div>
                </dl>
                <Field label="Seu custo total (R$)" inputMode="decimal" placeholder="Ex.: 780,00" value={costRaw} onChange={(e) => setCost(e.target.value)} hint="Só para esta conta, não é salvo" />
              </Card>
            </div>

            <Card className="panel">
              <h2 className="h3">O que fazer agora</h2>
              <ul className="tips">
                {f.dicas.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </LoadState>
    </div>
  )
}
