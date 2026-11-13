import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { RequireAuth, homeDe, useAuth } from './auth/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Creditos from './pages/Creditos'
import Legal from './pages/Legal'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Negociacoes from './pages/Negociacoes'
import Notificacoes from './pages/produtor/Notificacoes'
import Pedidos from './pages/Pedidos'
import PedidoConfirmado from './pages/PedidoConfirmado'
import Perfil from './pages/Perfil'
import Planos from './pages/Planos'
import AdminUsuarios from './pages/admin/Usuarios'
import Dashboard from './pages/produtor/Dashboard'
import CadastrarOferta from './pages/produtor/CadastrarOferta'
import MeusProdutos from './pages/produtor/MeusProdutos'
import Propriedades from './pages/produtor/Propriedades'
import PrevisaoIA from './pages/produtor/PrevisaoIA'
import ProcuraSe from './pages/produtor/ProcuraSe'
import Calendario from './pages/produtor/Calendario'
import Buscar from './pages/varejista/Buscar'
import Favoritos from './pages/varejista/Favoritos'
import Inicio from './pages/varejista/Inicio'
import MinhasDemandas from './pages/varejista/MinhasDemandas'
import ProdutoDetalhe from './pages/varejista/ProdutoDetalhe'
import PublicarProcura from './pages/varejista/PublicarProcura'

// Login e cadastro: quem já está logado vai direto para a própria área
function SoVisitante({ children }) {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  return usuario ? <Navigate to={homeDe(usuario)} replace /> : children
}

const area = (perfil) => (
  <RequireAuth perfis={[perfil]}>
    <Outlet />
  </RequireAuth>
)

function Inicial() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  return <Navigate to={usuario ? homeDe(usuario) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicial />} />
      <Route path="/login" element={<SoVisitante><Login /></SoVisitante>} />
      <Route path="/cadastro" element={<SoVisitante><Onboarding /></SoVisitante>} />
      <Route path="/termos" element={<Legal title="Termos de Uso" />} />
      <Route path="/privacidade" element={<Legal title="Política de Privacidade" />} />
      <Route path="/creditos" element={<Creditos />} />
      <Route path="/pedido-confirmado" element={<RequireAuth><PedidoConfirmado /></RequireAuth>} />

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        {/* Produtor */}
        <Route element={area('PRODUTOR')}>
          <Route path="/produtor" element={<Dashboard />} />
          <Route path="/produtor/previsao" element={<PrevisaoIA />} />
          <Route path="/produtor/produtos" element={<MeusProdutos />} />
          <Route path="/produtor/produtos/nova" element={<CadastrarOferta />} />
          <Route path="/produtor/produtos/:id" element={<CadastrarOferta />} />
          <Route path="/produtor/propriedades" element={<Propriedades />} />
          <Route path="/produtor/perfil" element={<Perfil />} />
          <Route path="/produtor/pedidos" element={<Pedidos />} />
          <Route path="/produtor/negociacoes" element={<Negociacoes />} />
          <Route path="/produtor/procura-se" element={<ProcuraSe />} />
          <Route path="/produtor/calendario" element={<Calendario />} />
          <Route path="/produtor/notificacoes" element={<Notificacoes />} />
          <Route path="/produtor/planos" element={<Planos />} />
        </Route>

        {/* Varejista */}
        <Route element={area('VAREJISTA')}>
          <Route path="/varejista" element={<Inicio />} />
          <Route path="/varejista/buscar" element={<Buscar />} />
          <Route path="/varejista/favoritos" element={<Favoritos />} />
          <Route path="/varejista/perfil" element={<Perfil />} />
          <Route path="/varejista/produto/:id" element={<ProdutoDetalhe />} />
          <Route path="/varejista/negociacoes" element={<Negociacoes />} />
          <Route path="/varejista/pedidos" element={<Pedidos />} />
          <Route path="/varejista/procura-se" element={<MinhasDemandas />} />
          <Route path="/varejista/procura-se/nova" element={<PublicarProcura />} />
          <Route path="/varejista/procura-se/:id" element={<PublicarProcura />} />
          <Route path="/varejista/notificacoes" element={<Notificacoes />} />
          <Route path="/varejista/planos" element={<Planos />} />
        </Route>

        {/* Administrador */}
        <Route element={area('ADMIN')}>
          <Route path="/admin" element={<Navigate to="/admin/usuarios" replace />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route path="*" element={<Inicial />} />
    </Routes>
  )
}
