import { Link } from 'react-router-dom'
import { ArrowRight, Bell, ChevronRight, Sparkles } from 'lucide-react'
import { Button, ChipGroup, IconTile, Tabs } from '../../components/ui'
import { DemandCard } from '../../components/cards'
import { demands } from '../../data/mock'
import { useQueryState } from '../../hooks/useQueryState'
import '../pages.css'
import './procura.css'
import Title from '../../components/Title'

const TABS = ['Todas (12)', 'Compatíveis (3)', 'Minhas ofertas (4)', 'Encerradas']

export default function ProcuraSe() {
  const [tab, setTab] = useQueryState('aba', TABS[0])
  const [mTab, setMTab] = useQueryState('filtro', 'Todas (12)')

  return (
    <div className="page">
      <div className="m-header only-mobile">
        <Title mobile className="h2">Procura-se</Title>
        <Link to="/produtor/notificacoes" className="icon-btn topbar__bell" aria-label="Notificações (novas)">
          <Bell size={20} aria-hidden />
          <span className="topbar__dot" />
        </Link>
      </div>
      <ChipGroup
        className="only-mobile m-chips"
        label="Filtrar demandas"
        options={['Todas (12)', 'Compatíveis (3)', 'Urgentes']}
        value={mTab}
        onChange={setMTab}
      />

      <header className="page-header only-desktop">
        <div>
          <Title className="h1">Procura-se</Title>
          <p className="body-m t-secondary">
            Demandas publicadas por varejistas da sua região. Ofereça seu produto antes que a demanda feche.
          </p>
        </div>
        <Button variant="secondary" icon={Bell}>
          Alertas de demanda
        </Button>
      </header>

      <div className="match-banner">
        <IconTile icon={Sparkles} tone="solid" size={40} iconSize={20} />
        <div className="list__text">
          <span className="label-m">
            <span className="only-desktop">3 demandas combinam com o seu estoque atual</span>
            <span className="only-mobile">3 demandas combinam com seu estoque</span>
          </span>
          <span className="body-s t-secondary">
            <span className="only-desktop">
              Tomate italiano, Alface americana e Couve manteiga — você tem quantidade disponível para atender.
            </span>
            <span className="only-mobile">Tomate, alface americana e couve</span>
          </span>
        </div>
        <Button iconRight={ArrowRight} className="only-desktop" onClick={() => setTab(TABS[1])}>
          Ver compatíveis
        </Button>
        <ChevronRight size={20} className="only-mobile t-brand" aria-hidden />
      </div>

      <Tabs label="Demandas" tabs={TABS} value={tab} onChange={setTab} className="only-desktop" />

      <div className="demand-grid">
        {demands.map((d) => (
          <DemandCard key={d.id} demand={d} offerTo="/produtor/negociacoes" />
        ))}
      </div>
    </div>
  )
}
