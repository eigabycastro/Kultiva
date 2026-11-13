import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Calendar,
  Crown,
  Heart,
  House,
  LayoutGrid,
  LogOut,
  MapPin,
  MapPinned,
  Megaphone,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Sparkle,
  Truck,
  User,
  Users,
} from 'lucide-react'
import Logo from '../Logo'
import { Avatar, Button, cx } from '../ui'
import { useAuth } from '../../auth/AuthContext'
import { api } from '../../api/client'
import { PERFIL_LABEL } from '../../utils/status'
import './layout.css'

export const NAV = {
  produtor: [
    { to: '/produtor', label: 'Visão geral', icon: LayoutGrid, end: true },
    { to: '/produtor/produtos', label: 'Meus produtos', icon: Package },
    { to: '/produtor/pedidos', label: 'Pedidos', icon: Truck },
    { to: '/produtor/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/produtor/propriedades', label: 'Propriedades', icon: MapPinned },
    { to: '/produtor/negociacoes', label: 'Negociações', icon: MessageCircle },
    { to: '/produtor/previsao', label: 'Previsão de preço', icon: Sparkle },
    { to: '/produtor/calendario', label: 'Calendário de safra', icon: Calendar },
  ],
  varejista: [
    { to: '/varejista', label: 'Início', icon: House, end: true },
    { to: '/varejista/buscar', label: 'Buscar produtos', icon: Search },
    { to: '/varejista/pedidos', label: 'Pedidos', icon: Truck },
    { to: '/varejista/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/varejista/favoritos', label: 'Favoritos', icon: Heart },
    { to: '/varejista/negociacoes', label: 'Negociações', icon: MessageCircle },
  ],
  admin: [{ to: '/admin/usuarios', label: 'Usuários', icon: Users }],
}

const TABS = {
  produtor: [
    { to: '/produtor', label: 'Início', icon: House, end: true },
    { to: '/produtor/produtos', label: 'Produtos', icon: Package },
    { to: '/produtor/pedidos', label: 'Pedidos', icon: Truck },
    { to: '/produtor/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/produtor/perfil', label: 'Perfil', icon: User },
  ],
  varejista: [
    { to: '/varejista', label: 'Início', icon: House, end: true },
    { to: '/varejista/buscar', label: 'Buscar', icon: Search },
    { to: '/varejista/procura-se', label: 'Procura-se', icon: Megaphone },
    { to: '/varejista/pedidos', label: 'Pedidos', icon: Truck },
    { to: '/varejista/perfil', label: 'Perfil', icon: User },
  ],
  admin: [
    { to: '/admin/usuarios', label: 'Usuários', icon: Users },
    { to: '/admin/perfil', label: 'Perfil', icon: User },
  ],
}

const FULLSCREEN = [
  /\/negociacoes/,
  /^\/produtor\/produtos\/(nova|\d+)/,
  /^\/varejista\/procura-se\/(nova|\d+)/,
  /\/notificacoes/,
  /^\/varejista\/produto\//,
]

const PREMIUM_COPY = {
  produtor: 'Mais alcance e destaque nas buscas.',
  varejista: 'Ranking dos melhores produtores da região.',
}

const SEARCH = {
  produtor: { to: '/produtor/pedidos', placeholder: 'Buscar pedidos por produto, comprador ou código…' },
  varejista: { to: '/varejista/buscar', placeholder: 'Buscar produtos ou produtores…' },
  admin: { to: '/admin/usuarios', placeholder: 'Buscar usuários por nome, e-mail ou cidade…' },
}

// Área do usuário logado: 'produtor' | 'varejista' | 'admin'
export function useRole() {
  return useAuth().area ?? 'produtor'
}

function useUnread() {
  const { pathname } = useLocation()
  const [total, setTotal] = useState(0)
  useEffect(() => {
    api('/notificacoes/nao-lidas')
      .then((r) => setTotal(r.total))
      .catch(() => {})
  }, [pathname])
  return total
}

function Sidebar({ role }) {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const logout = async () => {
    await sair()
    navigate('/login', { replace: true })
  }
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <Logo size="s" theme="dark" />
      </div>
      <nav className="sidebar__nav" aria-label="Menu principal">
        <span className="sidebar__menu-label">{{ produtor: 'Produção', varejista: 'Compras', admin: 'Administração' }[role]}</span>
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
        {role !== 'admin' && (
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
        )}
        <div className="sidebar__user">
          <Link to={`/${role}/perfil`} className="sidebar__profile" title="Perfil e configurações">
            <Avatar initials={usuario.iniciais} />
            <span className="sidebar__user-info">
              <span className="label-m">{usuario.organizacao || usuario.nome}</span>
              <span className="body-s t-tertiary">{PERFIL_LABEL[usuario.perfil]}</span>
            </span>
          </Link>
          <button type="button" className="icon-btn" aria-label="Sair" title="Sair" onClick={logout}>
            <LogOut size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  )
}

function Topbar({ role, unread }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const search = SEARCH[role]
  const submit = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q').trim()
    navigate(`${search.to}${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }
  return (
    <header className="topbar">
      <form className="topbar__search" role="search" onSubmit={submit}>
        <Search size={18} strokeWidth={2} className="field__icon" aria-hidden />
        <input
          type="search"
          name="q"
          className="field__input"
          placeholder={search.placeholder}
          aria-label={search.placeholder}
          autoComplete="off"
        />
      </form>
      <div className="topbar__right">
        {role === 'admin' ? (
          <span className="location-pill">
            <ShieldCheck size={16} strokeWidth={2} aria-hidden />
            Administrador
          </span>
        ) : (
          <Link to={`/${role}/perfil`} className="location-pill" title="Alterar localização e raio no perfil">
            <MapPin size={16} strokeWidth={2} aria-hidden />
            {usuario.cidade ? `${usuario.cidade}, ${usuario.uf}` : 'Definir localização'} · {usuario.raioKm} km
          </Link>
        )}
        {role !== 'admin' && (
          <Link
            to={`/${role}/notificacoes`}
            className="icon-btn topbar__bell"
            aria-label={unread ? `Notificações (${unread} novas)` : 'Notificações'}
          >
            <Bell size={20} strokeWidth={2} aria-hidden />
            {unread > 0 && <span className="topbar__dot" />}
          </Link>
        )}
        <Link to={`/${role}/perfil`} aria-label="Perfil e configurações" title="Perfil e configurações">
          <Avatar initials={usuario.iniciais} />
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

/* Sino com indicador de não lidas para os cabeçalhos mobile */
export function MobileBell() {
  const role = useRole()
  const unread = useUnread()
  return (
    <Link to={`/${role}/notificacoes`} className="icon-btn topbar__bell" aria-label={unread ? `Notificações (${unread} novas)` : 'Notificações'}>
      <Bell size={20} aria-hidden />
      {unread > 0 && <span className="topbar__dot" />}
    </Link>
  )
}

/* Layout autenticado: sidebar + topbar (desktop) · bottom nav (mobile) */
export default function AppLayout() {
  const role = useRole()
  const unread = useUnread()
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
        <Topbar role={role} unread={unread} />
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
