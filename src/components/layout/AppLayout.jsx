import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Calendar,
  ChevronDown,
  Crown,
  Heart,
  House,
  LayoutGrid,
  LogOut,
  MapPin,
  Megaphone,
  MessageCircle,
  Package,
  Search,
  Sparkle,
  Truck,
  User,
} from 'lucide-react'
import Logo from '../Logo'
import { Avatar, Button, cx } from '../ui'
import { location, users } from '../../data/mock'
import './layout.css'

export const NAV = {
  produtor: [
    { to: '/produtor', label: 'Visão geral', icon: LayoutGrid, end: true },
    { to: '/produtor/produtos', label: 'Meus produtos', icon: Package },
    { to: '/produtor/pedidos', label: 'Pedidos', icon: Truck },
    { to: '/produtor/negociacoes', label: 'Negociações', icon: MessageCircle },
    { to: '/produtor/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/produtor/previsao', label: 'Previsão IA', icon: Sparkle },
    { to: '/produtor/calendario', label: 'Calendário de safra', icon: Calendar },
  ],
  varejista: [
    { to: '/varejista', label: 'Início', icon: House, end: true },
    { to: '/varejista/buscar', label: 'Buscar produtos', icon: Search },
    { to: '/varejista/negociacoes', label: 'Negociações', icon: MessageCircle },
    { to: '/varejista/pedidos', label: 'Pedidos', icon: Truck },
    { to: '/varejista/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/varejista/favoritos', label: 'Favoritos', icon: Heart },
  ],
}

const TABS = {
  produtor: [
    { to: '/produtor', label: 'Início', icon: House, end: true },
    { to: '/produtor/produtos', label: 'Produtos', icon: Package },
    { to: '/produtor/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/produtor/negociacoes', label: 'Chat', icon: MessageCircle },
    { to: '/produtor/perfil', label: 'Perfil', icon: User },
  ],
  varejista: [
    { to: '/varejista', label: 'Início', icon: House, end: true },
    { to: '/varejista/buscar', label: 'Buscar', icon: Search },
    { to: '/varejista/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/varejista/negociacoes', label: 'Chat', icon: MessageCircle },
    { to: '/varejista/pedidos', label: 'Pedidos', icon: Truck },
  ],
}

const FULLSCREEN = [/\/negociacoes/, /^\/produtor\/produtos\/nova/, /^\/varejista\/procura-se/, /\/notificacoes/, /^\/varejista\/produto\//]

const PREMIUM_COPY = {
  produtor: 'Mais alcance e destaque nas buscas.',
  varejista: 'Ranking dos melhores produtores da região.',
}

export function useRole() {
  const { pathname } = useLocation()
  return pathname.startsWith('/varejista') ? 'varejista' : 'produtor'
}

function Sidebar({ role }) {
  const user = users[role]
  const navigate = useNavigate()
  // TODO(back-end): encerrar a sessão na API antes de voltar ao login
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <Logo size="s" theme="dark" />
      </div>
      <nav className="sidebar__nav" aria-label="Menu principal">
        <span className="sidebar__menu-label">{role === 'produtor' ? 'Produção' : 'Compras'}</span>
        {NAV[role].map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) => cx('nav-item', isActive && 'nav-item--active')}
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden />
            <span className="nav-item__label">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__bottom">
        <div className="premium-card">
          <div className="premium-card__title">
            <Crown size={16} strokeWidth={2} aria-hidden />
            Kultiva Premium
          </div>
          <p className="body-s premium-card__text">{PREMIUM_COPY[role]}</p>
          <Button variant="accent" size="s" block to={`/${role}/planos`}>
            Conhecer planos
          </Button>
        </div>
        <div className="sidebar__user">
          <Link to={`/${role}/perfil`} className="sidebar__profile" title="Perfil e configurações">
            <Avatar initials={user.initials} />
            <span className="sidebar__user-info">
              <span className="label-m">{user.name}</span>
              <span className="body-s t-tertiary">{user.role}</span>
            </span>
          </Link>
          <button type="button" className="icon-btn" aria-label="Sair" onClick={() => navigate('/login')}>
            <LogOut size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  )
}

function Topbar({ role }) {
  const user = users[role]
  return (
    <header className="topbar">
      <label className="topbar__search">
        <Search size={18} strokeWidth={2} className="field__icon" aria-hidden />
        <input
          type="search"
          name="q"
          className="field__input"
          placeholder="Buscar produtos, produtores ou pedidos…"
          aria-label="Buscar produtos, produtores ou pedidos"
          autoComplete="off"
        />
      </label>
      <div className="topbar__right">
        <button type="button" className="location-pill">
          <MapPin size={16} strokeWidth={2} aria-hidden />
          {location.label} · {location.radiusKm} km
          <ChevronDown size={16} strokeWidth={2} aria-hidden />
        </button>
        <Link
          to={role === 'produtor' ? '/produtor/notificacoes' : '/varejista/pedidos'}
          className="icon-btn topbar__bell"
          aria-label="Notificações (novas)"
        >
          <Bell size={20} strokeWidth={2} aria-hidden />
          <span className="topbar__dot" />
        </Link>
        <Link to={`/${role}/perfil`} aria-label="Perfil e configurações" title="Perfil e configurações">
          <Avatar initials={user.initials} />
        </Link>
      </div>
    </header>
  )
}

export function BottomNav({ role }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação">
      {TABS[role].map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('tab-item', isActive && 'tab-item--active')}>
          <Icon size={24} strokeWidth={2} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

/* Layout autenticado: sidebar + topbar (desktop) · bottom nav (mobile) */
export default function AppLayout() {
  const role = useRole()
  const { pathname } = useLocation()
  // no mobile, telas de tarefa (chat, formulários, detalhe) escondem a barra inferior
  const fullScreen = FULLSCREEN.some((re) => re.test(pathname))
  return (
    <div className={cx('app', fullScreen && 'app--fullscreen')}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Sidebar role={role} />
      <div className="app__main">
        <Topbar role={role} />
        <main id="conteudo" className="app__content" tabIndex={-1}>
          <Outlet />
          <p className="app__credits body-s">
            Fotos de produtos: Wikimedia Commons, licenças livres. <Link to="/creditos">Ver créditos</Link>
          </p>
        </main>
      </div>
      <BottomNav role={role} />
    </div>
  )
}
