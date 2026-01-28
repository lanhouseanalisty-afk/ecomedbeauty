import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CMSProvider } from "@/contexts/CMSContext";
import { Layout } from "@/components/layout/Layout";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { ProtectedRoute } from "@/components/crm/ProtectedRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";

// CRM Pages
import CRMDashboard from "./pages/crm/CRMDashboard";
import AdminCRMDashboard from "./pages/crm/admin/AdminCRMDashboard";
import DiretoriaDashboard from "./pages/crm/admin/DiretoriaDashboard";
import CientificaDashboard from "./pages/crm/admin/DiretoriaDashboard"; // Placeholder usando Diretoria por enquanto ou criar um arquivo novo? Vou criar um arquivo novo para Cientifica.
import RHDashboard from "./pages/crm/rh/RHDashboard";
import RHAdmissaoPage from "./pages/crm/rh/AdmissaoPage";
import DemissaoPage from "./pages/crm/rh/DemissaoPage";
import EmployeeProfilePage from "./pages/crm/rh/EmployeeProfilePage";

import FinanceiroDashboard from "./pages/crm/financeiro/FinanceiroDashboard";
import FinanceiroAdmissaoPage from "./pages/crm/financeiro/FinanceiroAdmissaoPage";
import MarketingDashboard from "./pages/crm/marketing/MarketingDashboard";
import MarketingAdmissaoPage from "./pages/crm/marketing/MarketingAdmissaoPage";
import MarketingCampaignsPage from "./pages/crm/marketing/MarketingCampaignsPage";
import MarketingSolicitacaoPage from "./pages/crm/marketing/MarketingSolicitacaoPage";
import MarketingRequestsListPage from "./pages/crm/marketing/MarketingRequestsListPage";
import MarketingRequestsManagementPage from "./pages/crm/marketing/MarketingRequestsManagementPage";
import ComercialDashboard from "./pages/crm/comercial/ComercialDashboard";
import ComercialAdmissaoPage from "./pages/crm/comercial/ComercialAdmissaoPage";
import ComercialSubDepartmentPage from "./pages/crm/comercial/ComercialSubDepartmentPage";
import LogisticaDashboard from "./pages/crm/logistica/LogisticaDashboard";
import LogisticaAdmissaoPage from "./pages/crm/logistica/LogisticaAdmissaoPage";
import LogisticaPedidosPage from "./pages/crm/logistica/LogisticaPedidosPage";
import LogisticaEstoquePage from "./pages/crm/logistica/LogisticaEstoquePage";
import JuridicoDashboard from "./pages/crm/juridico/JuridicoDashboard";
import JuridicoAdmissaoPage from "./pages/crm/juridico/JuridicoAdmissaoPage";
import TechDashboard from "./pages/crm/tech/TechDashboard";
import TechAdmissaoPage from "./pages/crm/tech/TechAdmissaoPage";
import TechTicketsPage from "./pages/crm/tech/TechTicketsPage";
import TechAssetsPage from "./pages/crm/tech/TechAssetsPage";
import TechKBPage from "./pages/crm/tech/TechKBPage";
import EcommerceDashboard from "./pages/crm/ecommerce/EcommerceDashboard";
import ComprasDashboard from "./pages/crm/compras/ComprasDashboard";
import ManutencaoDashboard from "./pages/crm/manutencao/ManutencaoDashboard";
import EcommerceAdmissaoPage from "./pages/crm/ecommerce/EcommerceAdmissaoPage";
import EcommerceProdutosPage from "./pages/crm/ecommerce/EcommerceProdutosPage";
import EcommerceCategoriasPage from "./pages/crm/ecommerce/EcommerceCategoriasPage";
import EcommercePedidosPage from "./pages/crm/ecommerce/EcommercePedidosPage";
import EcommerceCuponsPage from "./pages/crm/ecommerce/EcommerceCuponsPage";
import EcommerceCMSPage from "./pages/crm/ecommerce/EcommerceCMSPage";
import EcommerceCustomersPage from "./pages/crm/ecommerce/EcommerceCustomersPage";

import { SectorRequestsPage } from "./pages/crm/components/SectorRequestsPage";
import EmployeeDirectoryPage from "./pages/crm/EmployeeDirectoryPage";

import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import AdminUsersPage from "./pages/crm/admin/AdminUsersPage";
import AdminPermissionsPage from "./pages/crm/admin/AdminPermissionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <CMSProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* E-commerce Routes */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/produtos" element={<Products />} />
                      <Route path="/produto/:id" element={<ProductDetail />} />
                      <Route path="/carrinho" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/checkout/sucesso" element={<CheckoutSuccess />} />
                      <Route path="/sobre" element={<About />} />
                      <Route path="/contato" element={<Contact />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/conta" element={<Auth />} />
                      <Route path="/perfil" element={<Profile />} />
                      <Route path="/pedido/:orderId" element={<OrderTracking />} />
                      <Route path="/admin" element={<Admin />} />
                    </Route>

                    {/* CRM Routes - Protected for employees only */}
                    <Route path="/crm" element={
                      <ProtectedRoute requireEmployee={true}>
                        <CRMLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<CRMDashboard />} />
                      <Route path="colaboradores" element={
                        <ProtectedRoute requireEmployee={true}>
                          <EmployeeDirectoryPage />
                        </ProtectedRoute>
                      } />
                      <Route path="admin" element={
                        <ProtectedRoute requiredModule="admin">
                          <AdminCRMDashboard />
                        </ProtectedRoute>
                      } />

                      <Route path="admin/configuracoes" element={
                        <ProtectedRoute requiredModule="admin">
                          <SystemSettingsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="configuracoes" element={
                        <ProtectedRoute requiredModule="admin">
                          <SystemSettingsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="admin/usuarios" element={
                        <ProtectedRoute requiredModule="admin">
                          <AdminUsersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="admin/permissoes" element={
                        <ProtectedRoute requiredModule="admin">
                          <AdminPermissionsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="admin/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="admin">
                          <SectorRequestsPage currentSector="admin" sectorName="Administração" />
                        </ProtectedRoute>
                      } />
                      <Route path="diretoria" element={
                        <ProtectedRoute requiredModule="admin">
                          <DiretoriaDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="diretoria/*" element={
                        <ProtectedRoute requiredModule="admin">
                          <DiretoriaDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="cientifica" element={
                        <ProtectedRoute requiredModule="admin">
                          <CientificaDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="cientifica/*" element={
                        <ProtectedRoute requiredModule="admin">
                          <CientificaDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="admin/*" element={
                        <ProtectedRoute requiredModule="admin">
                          <AdminCRMDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="rh" element={
                        <ProtectedRoute requiredModule="rh">
                          <RHDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="rh/meu-perfil" element={
                        <ProtectedRoute requireEmployee={true}>
                          <EmployeeProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="rh/admissao" element={
                        <ProtectedRoute requiredModule="rh">
                          <RHAdmissaoPage />
                        </ProtectedRoute>
                      } />

                      <Route path="rh/demissao" element={
                        <ProtectedRoute requiredModule="rh">
                          <DemissaoPage />
                        </ProtectedRoute>
                      } />

                      <Route path="rh/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="rh">
                          <SectorRequestsPage currentSector="rh" sectorName="Compras" />
                        </ProtectedRoute>
                      } />

                      <Route path="rh/*" element={
                        <ProtectedRoute requiredModule="rh">
                          <RHDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="rh/funcionario/:id" element={
                        <ProtectedRoute requiredModule="rh">
                          <EmployeeProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="financeiro" element={
                        <ProtectedRoute requiredModule="financeiro">
                          <FinanceiroDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="financeiro/admissao" element={
                        <ProtectedRoute requiredModule="financeiro">
                          <FinanceiroAdmissaoPage />
                        </ProtectedRoute>
                      } />

                      <Route path="financeiro/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="financeiro">
                          <SectorRequestsPage currentSector="financeiro" sectorName="Financeiro" />
                        </ProtectedRoute>
                      } />

                      <Route path="financeiro/*" element={
                        <ProtectedRoute requiredModule="financeiro">
                          <FinanceiroDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="marketing" element={
                        <ProtectedRoute requiredModule="marketing">
                          <MarketingDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="marketing/campanhas" element={
                        <ProtectedRoute requiredModule="marketing">
                          <MarketingCampaignsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="marketing/admissao" element={
                        <ProtectedRoute requiredModule="marketing">
                          <MarketingAdmissaoPage />
                        </ProtectedRoute>
                      } />
                      <Route path="marketing/solicitacao-insumos" element={
                        <ProtectedRoute requiredModule="marketing">
                          <MarketingSolicitacaoPage />
                        </ProtectedRoute>
                      } />
                      <Route path="marketing/solicitacoes" element={
                        <ProtectedRoute requiredModule="marketing">
                          <MarketingRequestsListPage />
                        </ProtectedRoute>
                      } />
                      <Route path="marketing/gerenciar-solicitacoes" element={
                        <ProtectedRoute requiredModule="marketing">
                          <MarketingRequestsManagementPage />
                        </ProtectedRoute>
                      } />

                      <Route path="marketing/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="marketing">
                          <SectorRequestsPage currentSector="marketing" sectorName="Marketing" />
                        </ProtectedRoute>
                      } />

                      <Route path="marketing/*" element={
                        <ProtectedRoute requiredModule="marketing">
                          <MarketingDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="comercial" element={
                        <ProtectedRoute requiredModule="comercial">
                          <ComercialDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="comercial/admissao" element={
                        <ProtectedRoute requiredModule="comercial">
                          <ComercialAdmissaoPage />
                        </ProtectedRoute>
                      } />
                      <Route path="comercial/:subdepartment" element={
                        <ProtectedRoute requiredModule="comercial">
                          <ComercialSubDepartmentPage />
                        </ProtectedRoute>
                      } />

                      <Route path="comercial/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="comercial">
                          <SectorRequestsPage currentSector="comercial" sectorName="Comercial" />
                        </ProtectedRoute>
                      } />

                      <Route path="comercial/*" element={
                        <ProtectedRoute requiredModule="comercial">
                          <ComercialDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="logistica" element={
                        <ProtectedRoute requiredModule="logistica">
                          <LogisticaDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="logistica/admissao" element={
                        <ProtectedRoute requiredModule="logistica">
                          <LogisticaAdmissaoPage />
                        </ProtectedRoute>
                      } />
                      <Route path="logistica/pedidos" element={
                        <ProtectedRoute requiredModule="logistica">
                          <LogisticaPedidosPage />
                        </ProtectedRoute>
                      } />
                      <Route path="logistica/estoque" element={
                        <ProtectedRoute requiredModule="logistica">
                          <LogisticaEstoquePage />
                        </ProtectedRoute>
                      } />

                      <Route path="logistica/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="logistica">
                          <SectorRequestsPage currentSector="logistica" sectorName="Logística" />
                        </ProtectedRoute>
                      } />

                      <Route path="logistica/*" element={
                        <ProtectedRoute requiredModule="logistica">
                          <LogisticaDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="juridico" element={
                        <ProtectedRoute requiredModule="juridico">
                          <JuridicoDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="juridico/admissao" element={
                        <ProtectedRoute requiredModule="juridico">
                          <JuridicoAdmissaoPage />
                        </ProtectedRoute>
                      } />

                      <Route path="juridico/contratos" element={
                        <ProtectedRoute requiredModule="juridico">
                          <JuridicoDashboard />
                        </ProtectedRoute>
                      } />

                      <Route path="juridico/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="juridico">
                          <SectorRequestsPage currentSector="juridico" sectorName="Jurídico" />
                        </ProtectedRoute>
                      } />

                      <Route path="juridico/*" element={
                        <ProtectedRoute requiredModule="juridico">
                          <JuridicoDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="tech/admissao" element={
                        <ProtectedRoute requiredModule="tech">
                          <TechAdmissaoPage />
                        </ProtectedRoute>
                      } />
                      <Route path="tech/demissao" element={
                        <ProtectedRoute requiredModule="tech">
                          <DemissaoPage />
                        </ProtectedRoute>
                      } />
                      <Route path="tech/tickets" element={
                        <ProtectedRoute requiredModule="tech">
                          <TechTicketsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="tech/kb" element={
                        <ProtectedRoute requiredModule="tech">
                          <TechKBPage />
                        </ProtectedRoute>
                      } />
                      <Route path="tech/ativos" element={
                        <ProtectedRoute requiredModule="tech">
                          <TechAssetsPage />
                        </ProtectedRoute>
                      } />

                      <Route path="tech/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="tech">
                          <SectorRequestsPage currentSector="tech" sectorName="Tech Digital" />
                        </ProtectedRoute>
                      } />

                      <Route path="tech/*" element={
                        <ProtectedRoute requiredModule="tech">
                          <TechDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce/admissao" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceAdmissaoPage />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce/produtos" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceProdutosPage />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce/categorias" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceCategoriasPage />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce/pedidos" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommercePedidosPage />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce/clientes" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceCustomersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce/cupons" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceCuponsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="ecommerce/cms" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceCMSPage />
                        </ProtectedRoute>
                      } />

                      <Route path="ecommerce/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <SectorRequestsPage currentSector="ecommerce" sectorName="E-commerce" />
                        </ProtectedRoute>
                      } />

                      <Route path="ecommerce/*" element={
                        <ProtectedRoute requiredModule="ecommerce">
                          <EcommerceDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="compras" element={
                        <ProtectedRoute requiredModule="admin">
                          <ComprasDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="compras/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="admin">
                          <SectorRequestsPage currentSector="compras" sectorName="Compras" />
                        </ProtectedRoute>
                      } />
                      <Route path="manutencao" element={
                        <ProtectedRoute requiredModule="admin">
                          <ManutencaoDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="manutencao/solicitacoes-setores" element={
                        <ProtectedRoute requiredModule="admin">
                          <SectorRequestsPage currentSector="manutencao" sectorName="Manutenção" />
                        </ProtectedRoute>
                      } />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CMSProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider >
);

export default App;
