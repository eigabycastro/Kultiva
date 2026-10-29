import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, Search } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '../../components/ui'
import { ProductCard, StatCard } from '../../components/cards'
import { ProduceThumb } from '../../components/ProduceArt'
import { myDemands, orderHistory, orderStatus, products, retailerKpis } from '../../data/mock'
import '../pages.css'
import './buscar.css'
import './inicio.css'

export default function Inicio() {
  const recent = orderHistory.slice(0, 3)
  const fresh = products.filter((p) => p.tag === 'Colhido hoje')

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Início</h1>
          <p className="body-m t-secondary">
            Mercado Mais · {fresh.length} produtores com produtos colhidos hoje a até 30 km. Sua demanda de tomate já
            recebeu {myDemands[0].offers} ofertas.
          </p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" icon={Megaphone} to="/varejista/procura-se">
            Publicar Procura-se
          </Button>
          <Button icon={Search} to="/varejista/buscar">
            Buscar produtos
          </Button>
        </div>
      </header>

      <div className="kpi-grid">
        {retailerKpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="home-row">
        <Card className="panel">
          <div className="panel__head">
            <h2 className="h3">Pedidos recentes</h2>
            <Link to="/varejista/pedidos" className="label-s t-brand">
              Ver todos
            </Link>
          </div>
          <ul className="list">
            {recent.map((o) => (
              <li key={o.id} className="list__row">
                <ProduceThumb kind={o.kind} size={40} />
                <div className="list__text">
                  <span className="label-m">
                    {o.product} · {o.qty}
                  </span>
                  <span className="body-s t-tertiary">
                    {o.seller} · {o.id} · {o.date}
                  </span>
                </div>
                <span className="label-m num">{o.total}</span>
                <Badge tone={orderStatus[o.status].tone}>{orderStatus[o.status].label}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="panel">
          <div className="panel__head">
            <h2 className="h3">Suas demandas Procura-se</h2>
            <Link to="/varejista/procura-se" className="label-s t-brand">
              Nova demanda
            </Link>
          </div>
          <ul className="list">
            {myDemands.map((d) => (
              <li key={d.id} className="list__row">
                <ProduceThumb kind={d.kind} size={40} />
                <div className="list__text">
                  <span className="label-m">{d.title}</span>
                  <span className="body-s t-tertiary">
                    {d.deadline} · melhor oferta {d.best}
                  </span>
                </div>
                <span className="offers-count">
                  <strong>{d.offers}</strong> ofertas
                </span>
              </li>
            ))}
          </ul>
          <Button variant="secondary" block iconRight={ArrowRight} to="/varejista/negociacoes">
            Ver ofertas recebidas
          </Button>
        </Card>
      </div>

      <section className="stack-16">
        <div className="panel__head">
          <h2 className="h3">Colhido hoje perto de você</h2>
          <Link to="/varejista/buscar?cat=Colhido+hoje" className="label-s t-brand">
            Ver todos
          </Link>
        </div>
        <div className="product-grid home-products">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} to={`/varejista/produto/${p.id}`} negotiateTo="/varejista/negociacoes" />
          ))}
        </div>
      </section>

      <Card className="panel">
        <h2 className="h3">Produtores parceiros</h2>
        <div className="partners">
          {['Sítio Boa Vista', 'Fazenda Santa Luzia', 'Chácara Recanto', 'Horta da Serra', 'Sítio Dois Irmãos'].map((n) => (
            <Link key={n} to="/varejista/favoritos?aba=Produtores" className="partner">
              <Avatar initials={n.split(' ').map((w) => w[0]).slice(0, 2).join('')} />
              <span className="body-s">{n}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
