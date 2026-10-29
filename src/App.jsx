import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Creditos from './pages/Creditos'
import Legal from './pages/Legal'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Negociacoes from './pages/Negociacoes'
import Pedidos from './pages/Pedidos'
import PedidoConfirmado from './pages/PedidoConfirmado'
import Perfil from './pages/Perfil'
import Planos from './pages/Planos'
import Dashboard from './pages/produtor/Dashboard'
import CadastrarOferta from './pages/produtor/CadastrarOferta'
import MeusProdutos from './pages/produtor/MeusProdutos'
import PrevisaoIA from './pages/produtor/PrevisaoIA'
import ProcuraSe from './pages/produtor/ProcuraSe'
import Calendario from './pages/produtor/Calendario'
import Notificacoes from './pages/produtor/Notificacoes'
import Buscar from './pages/varejista/Buscar'
import Favoritos from './pages/varejista/Favoritos'
import Inicio from './pages/varejista/Inicio'
import ProdutoDetalhe from './pages/varejista/ProdutoDetalhe'
import PublicarProcura from './pages/varejista/PublicarProcura'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Onboarding />} />
      <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
      <Route path="/termos" element={<Legal title="Termos de Uso" />} />
      <Route path="/privacidade" element={<Legal title="Política de Privacidade" />} />
      <Route path="/creditos" element={<Creditos />} />

      <Route element={<AppLayout />}>
        {/* Produtor */}
        <Route path="/produtor" element={<Dashboard />} />
        <Route path="/produtor/previsao" element={<PrevisaoIA />} />
        <Route path="/produtor/produtos" element={<MeusProdutos />} />
        <Route path="/produtor/produtos/nova" element={<CadastrarOferta />} />
        <Route path="/produtor/perfil" element={<Perfil />} />
        <Route path="/produtor/pedidos" element={<Pedidos />} />
        <Route path="/produtor/negociacoes" element={<Negociacoes />} />
        <Route path="/produtor/procura-se" element={<ProcuraSe />} />
        <Route path="/produtor/calendario" element={<Calendario />} />
        <Route path="/produtor/notificacoes" element={<Notificacoes />} />
        <Route path="/produtor/planos" element={<Planos />} />

        {/* Varejista */}
        <Route path="/varejista" element={<Inicio />} />
        <Route path="/varejista/buscar" element={<Buscar />} />
        <Route path="/varejista/favoritos" element={<Favoritos />} />
        <Route path="/varejista/perfil" element={<Perfil />} />
        <Route path="/varejista/produto/:id" element={<ProdutoDetalhe />} />
        <Route path="/varejista/negociacoes" element={<Negociacoes />} />
        <Route path="/varejista/pedidos" element={<Pedidos />} />
        <Route path="/varejista/procura-se" element={<PublicarProcura />} />
        <Route path="/varejista/planos" element={<Planos />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
