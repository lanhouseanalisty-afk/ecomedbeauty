import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CMSProvider } from "@/contexts/CMSContext";
import { Layout } from "@/components/layout/Layout";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { ProtectedRoute } from "@/components/crm/ProtectedRoute";
import ComunicarTIPage from "./pages/crm/ComunicarTIPage";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

// Standard Pages
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
import AuthCallback from "./pages/AuthCallback";
import UpdatePassword from "./pages/UpdatePassword";
import CustomerRegister from "./pages/CustomerRegister";
import NotFound from "./pages/NotFound";

// Lazy Loaded CRM Pages
const CRMDashboard = lazy(() => import("./pages/crm/CRMDashboard"));
const AdminCRMDashboard = lazy(() => import("./pages/crm/admin/AdminCRMDashboard"));
const CientificaDashboard = lazy(() => import("./pages/crm/admin/CientificaDashboard"));
const RHDashboard = lazy(() => import("@/pages/crm/rh/RHDashboard"));
const RHAdmissaoPage = lazy(() => import("./pages/crm/rh/AdmissaoPage"));
const DemissaoPage = lazy(() => import("./pages/crm/rh/DemissaoPage"));
const HROperationsPage = lazy(() => import("./pages/crm/rh/HROperationsPage"));
const EmployeeProfilePage = lazy(() => import("./pages/crm/rh/EmployeeProfilePage"));
const VacationAnalysisPage = lazy(() => import("@/pages/crm/rh/VacationAnalysisPage"));

const FinanceiroDashboard = lazy(() => import("./pages/crm/financeiro/FinanceiroDashboard"));
const FinanceiroAdmissaoPage = lazy(() => import("./pages/crm/financeiro/FinanceiroAdmissaoPage"));
const MarketingDashboard = lazy(() => import("./pages/crm/marketing/MarketingDashboard"));
const MarketingAdmissaoPage = lazy(() => import("./pages/crm/marketing/MarketingAdmissaoPage"));
const MarketingCampaignsPage = lazy(() => import("./pages/crm/marketing/MarketingCampaignsPage"));
const MarketingRequestsListPage = lazy(() => import("./pages/crm/marketing/MarketingRequestsListPage"));
const MarketingRequestsManagementPage = lazy(() => import("@/pages/crm/marketing/MarketingRequestsManagementPage"));
const ComercialDashboard = lazy(() => import("./pages/crm/comercial/ComercialDashboard"));
const ComercialAdmissaoPage = lazy(() => import("./pages/crm/comercial/ComercialAdmissaoPage"));
const ComercialSubDepartmentPage = lazy(() => import("./pages/crm/comercial/ComercialSubDepartmentPage"));
const FranquiasPage = lazy(() => import("./pages/crm/comercial/FranquiasPage"));
const LogisticaDashboard = lazy(() => import("./pages/crm/logistica/LogisticaDashboard"));
const LogisticaAdmissaoPage = lazy(() => import("./pages/crm/logistica/LogisticaAdmissaoPage"));
const LogisticaPedidosPage = lazy(() => import("@/pages/crm/logistica/LogisticaPedidosPage"));
const LogisticaEstoquePage = lazy(() => import("./pages/crm/logistica/LogisticaEstoquePage"));
const JuridicoDashboard = lazy(() => import("./pages/crm/juridico/JuridicoDashboard"));
const JuridicoAdmissaoPage = lazy(() => import("./pages/crm/juridico/JuridicoAdmissaoPage"));
const CompliancePage = lazy(() => import("./pages/crm/juridico/CompliancePage"));
const UsersAdminPage = lazy(() => import("./pages/crm/admin/UsersAdminPage"));
const TechDashboard = lazy(() => import("./pages/crm/tech/TechDashboard"));
const TechAdmissaoPage = lazy(() => import("./pages/crm/tech/TechAdmissaoPage"));
const TechTicketsPage = lazy(() => import("./pages/crm/tech/TechTicketsPage"));
const TechKBPage = lazy(() => import("./pages/crm/tech/TechKBPage"));
const NFEPage = lazy(() => import("./pages/crm/shared/NFEPage"));
const EcommerceDashboard = lazy(() => import("./pages/crm/ecommerce/EcommerceDashboard"));
const ComprasDashboard = lazy(() => import("./pages/crm/compras/ComprasDashboard"));
const ComprasVeiculosPage = lazy(() => import("./pages/crm/compras/ComprasVeiculosPage"));
const ManutencaoDashboard = lazy(() => import("./pages/crm/manutencao/ManutencaoDashboard"));
const EcommerceAdmissaoPage = lazy(() => import("./pages/crm/ecommerce/EcommerceAdmissaoPage"));
const EcommerceProdutosPage = lazy(() => import("./pages/crm/ecommerce/EcommerceProdutosPage"));
const EcommerceCategoriasPage = lazy(() => import("./pages/crm/ecommerce/EcommerceCategoriasPage"));
const EcommercePedidosPage = lazy(() => import("./pages/crm/ecommerce/EcommercePedidosPage"));
const EcommerceCuponsPage = lazy(() => import("./pages/crm/ecommerce/EcommerceCuponsPage"));
const EcommerceCMSPage = lazy(() => import("./pages/crm/ecommerce/EcommerceCMSPage"));
const EcommerceCustomersPage = lazy(() => import("./pages/crm/ecommerce/EcommerceCustomersPage"));
const SectorHROperationsPage = lazy(() => import("./pages/crm/SectorHROperationsPage"));
const DepartmentAdmissaoPage = lazy(() => import("./components/crm/DepartmentAdmissaoPage"));
const PricingPage = lazy(() => import("./pages/crm/ecommerce/PricingPage"));
const EmployeeDirectoryPage = lazy(() => import("./pages/crm/EmployeeDirectoryPage"));
const IdeaBankPage = lazy(() => import("./pages/crm/IdeaBankPage"));
const CorporateStorePage = lazy(() => import("./pages/crm/ecommerce/CorporateStorePage"));

const SectorRequestsPage = lazy(() => import("./pages/crm/components/SectorRequestsPage").then(module => ({ default: module.SectorRequestsPage })));
const IntranetPage = lazy(() => import("./pages/crm/IntranetPage"));
const RequestCenterPage = lazy(() => import("./pages/crm/RequestCenterPage"));
const NewRequestPage = lazy(() => import("./pages/crm/NewRequestPage"));
const RequestDetailPage = lazy(() => import("./pages/crm/RequestDetailPage"));
const ProcessControlPage = lazy(() => import("./pages/crm/ProcessControlPage"));
const KnowledgeBasePage = lazy(() => import("./pages/crm/KnowledgeBasePage"));
const SapIntegrationPage = lazy(() => import("./pages/crm/SapIntegrationPage"));
const ChecklistDashboardPage = lazy(() => import("./pages/crm/checklist/ChecklistDashboardPage"));
const ChecklistDetailPage = lazy(() => import("./pages/crm/checklist/ChecklistDetailPage"));
const InventoryPage = lazy(() => import("./pages/crm/checklist/InventoryPage"));
const PlanilhaJeanPage = lazy(() => import("./pages/crm/checklist/PlanilhaJeanPage"));
const BonusManagementPage = lazy(() => import("./pages/crm/components/BonusManagementPage"));
const AdminBonusPage = lazy(() => import("./pages/crm/admin/AdminBonusPage"));
const InsumoSolicitationPage = lazy(() => import("./pages/crm/shared/InsumoSolicitationPage"));
const PowerBIPage = lazy(() => import("./pages/crm/PowerBIPage"));
const RankingDashboardPage = lazy(() => import("./pages/crm/RankingDashboardPage"));
const GamificationPage = lazy(() => import("./pages/crm/comercial/GamificationPage"));

const SystemSettingsPage = lazy(() => import("./pages/admin/SystemSettingsPage"));

const AnalyticsDashboard = lazy(() => import("./pages/admin/AnalyticsDashboard"));

const AdminPermissionsPage = lazy(() => import("./pages/crm/admin/AdminPermissionsPage"));
const ScientificPresentationsPage = lazy(() => import("./pages/crm/scientific/ScientificPresentationsPage"));
const SectorRequestsWrapper = lazy(() => import("./pages/crm/SectorRequestsWrapper"));

// Lazy load new Legal components
const LegalDashboard = lazy(() => import("./pages/legal/LegalDashboard"));
const ContractRequestForm = lazy(() => import("./pages/legal/components/ContractRequestForm"));
const LegalContractCreatePage = lazy(() => import("./pages/legal/LegalContractCreatePage"));
const ContractViewer = lazy(() => import("./pages/legal/components/ContractViewer"));
const SectorContractReview = lazy(() => import("./pages/legal/SectorContractReview"));

const LegalContractsDashboard = lazy(() => import("./pages/legal/LegalContractsDashboard"));
const SectorContractDashboard = lazy(() => import("./pages/legal/SectorContractDashboard"));
const ContractTemplatesSettings = lazy(() => import("./pages/legal/ContractTemplatesSettings"));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">Carregando módulo...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
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
                      <AnalyticsTracker />
                      <Suspense fallback={<LoadingFallback />}>
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
                            <Route path="/profile" element={<Navigate to="/perfil" replace />} />
                            <Route path="/pedido/:orderId" element={<OrderTracking />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/update-password" element={<UpdatePassword />} />
                            <Route path="/admin" element={<Admin />} />
                          </Route>

                          <Route path="/cadastro-profissional" element={<CustomerRegister />} />

                          {/* CRM Routes - RESTORING ... */}
                          <Route path="/crm" element={<ProtectedRoute requireEmployee><CRMLayout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="intranet" replace />} />
                            <Route path="visao-geral" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CRMDashboard /></ProtectedRoute>} />

                            {/* Principal */}
                            <Route path="intranet" element={<ProtectedRoute requireEmployee><IntranetPage /></ProtectedRoute>} />
                            <Route path="intranet/chamados" element={<ProtectedRoute requireEmployee><ComunicarTIPage /></ProtectedRoute>} />
                            <Route path="intranet/loja" element={<ProtectedRoute requireEmployee><CorporateStorePage /></ProtectedRoute>} />
                            <Route path="intranet/ideias" element={<ProtectedRoute requireEmployee><IdeaBankPage /></ProtectedRoute>} />
                            <Route path="power-bi" element={<PowerBIPage />} />
                            <Route path="ranking" element={<ProtectedRoute requiredPermission="access_crm_ranking"><RankingDashboardPage /></ProtectedRoute>} />
                            <Route path="rh/meu-perfil" element={<EmployeeProfilePage />} />
                            <Route path="rh/perfil/:id" element={<EmployeeProfilePage />} />
                            <Route path="rh/contratos" element={<SectorContractDashboard sector="rh" />} />
                            <Route path="rh/contrato/:id" element={<ContractViewer />} />
                            <Route path="colaboradores" element={<ProtectedRoute requireEmployee><EmployeeDirectoryPage /></ProtectedRoute>} />

                            {/* Bonificações */}
                            <Route path="rh/bonificacoes" element={<ProtectedRoute requiredPermission="rh_bonuses"><BonusManagementPage sectorId="rh" sectorName="Recursos Humanos" /></ProtectedRoute>} />
                            <Route path="comercial/inside-sales/bonificacoes" element={<ProtectedRoute requiredPermission="comercial_bonuses"><BonusManagementPage sectorId="com_inside" sectorName="Inside Sales" /></ProtectedRoute>} />
                            <Route path="comercial/franquias/bonificacoes" element={<ProtectedRoute requiredPermission="comercial_bonuses"><BonusManagementPage sectorId="com_franchises" sectorName="Franquias" /></ProtectedRoute>} />
                            <Route path="comercial/sudeste/bonificacoes" element={<ProtectedRoute requiredPermission="comercial_bonuses"><BonusManagementPage sectorId="com_sudeste" sectorName="Sudeste" /></ProtectedRoute>} />
                            <Route path="comercial/sul/bonificacoes" element={<ProtectedRoute requiredPermission="comercial_bonuses"><BonusManagementPage sectorId="com_sul" sectorName="Sul" /></ProtectedRoute>} />
                            <Route path="comercial/centro/bonificacoes" element={<ProtectedRoute requiredPermission="comercial_bonuses"><BonusManagementPage sectorId="com_centro" sectorName="Centro" /></ProtectedRoute>} />
                            <Route path="comercial/norte/bonificacoes" element={<ProtectedRoute requiredPermission="comercial_bonuses"><BonusManagementPage sectorId="com_norte" sectorName="Norte" /></ProtectedRoute>} />

                            <Route path="biblioteca" element={<KnowledgeBasePage />} />
                            <Route path="checklist/planilha-jean" element={<ProtectedRoute requiredPermission="intranet_forecast"><PlanilhaJeanPage /></ProtectedRoute>} />
                            <Route path="controle-processos" element={<ProcessControlPage />} />
                            <Route path="solicitacoes" element={<RequestCenterPage />} />
                            <Route path="solicitacoes/nova" element={<NewRequestPage />} />
                            <Route path="solicitacoes/:id" element={<RequestDetailPage />} />
                            <Route path="tarefas/nova" element={<NewRequestPage />} />

                            {/* Admin - Restricted to Admin role */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} requireEmployee />}>
                              <Route path="admin" element={<AdminCRMDashboard />} />
                              <Route path="admin/usuarios" element={<ProtectedRoute requiredPermission="admin_users"><UsersAdminPage /></ProtectedRoute>} />
                              <Route path="admin/permissoes" element={<ProtectedRoute requiredPermission="admin_permissions"><AdminPermissionsPage /></ProtectedRoute>} />
                              <Route path="admin/analytics" element={<ProtectedRoute requiredPermission="admin_analytics"><AnalyticsDashboard /></ProtectedRoute>} />
                              <Route path="admin/bonificacoes" element={<ProtectedRoute requiredPermission="admin_bonuses"><AdminBonusPage /></ProtectedRoute>} />
                              <Route path="admin/nfe" element={<ProtectedRoute requiredPermission="admin_nfe"><NFEPage sector="admin" sectorLabel="Administração" /></ProtectedRoute>} />
                              <Route path="integracoes/sap" element={<ProtectedRoute requiredPermission="sap_monitor"><SapIntegrationPage /></ProtectedRoute>} />
                              <Route path="admin/contratos" element={<ProtectedRoute requiredPermission="admin_contracts"><SectorContractDashboard sector="admin" /></ProtectedRoute>} />
                              <Route path="admin/operacoes" element={<SectorHROperationsPage departmentSlug="admin" departmentName="Administração" />} />
                              <Route path="admin/admissao" element={<Navigate to="/crm/admin/operacoes" replace />} />
                              <Route path="admin/solicitacoes-setores" element={<ProtectedRoute requiredPermission="admin_intersector"><SectorRequestsWrapper department="admin" /></ProtectedRoute>} />
                              <Route path="admin/processos" element={<ProtectedRoute requiredPermission="admin_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="admin/precificacao" element={<ProtectedRoute requiredPermission="admin_pricing"><PricingPage /></ProtectedRoute>} />
                              <Route path="admin/insumos" element={<ProtectedRoute requiredPermission="admin_supplies"><InsumoSolicitationPage sector="admin" sectorLabel="Administração" /></ProtectedRoute>} />
                            </Route>

                            {/* Científica */}
                            <Route element={<ProtectedRoute requiredModule="cientifica" requireEmployee />}>
                              <Route path="cientifica" element={<CientificaDashboard />} />
                              <Route path="cientifica/apresentacoes" element={<ProtectedRoute requiredPermission="cientifica_presentations"><ScientificPresentationsPage /></ProtectedRoute>} />
                              <Route path="cientifica/operacoes" element={<SectorHROperationsPage departmentSlug="cientifica" departmentName="Científica" />} />
                              <Route path="cientifica/admissao" element={<Navigate to="/crm/cientifica/operacoes" replace />} />
                              <Route path="cientifica/contratos" element={<ProtectedRoute requiredPermission="cientifica_contracts"><SectorContractDashboard sector="cientifica" /></ProtectedRoute>} />
                              <Route path="cientifica/contrato/:id" element={<ProtectedRoute requiredPermission="cientifica_contracts"><ContractViewer /></ProtectedRoute>} />

                              <Route path="cientifica/solicitacoes-setores" element={<ProtectedRoute requiredPermission="cientifica_intersector"><SectorRequestsWrapper department="cientifica" /></ProtectedRoute>} />
                              <Route path="cientifica/processos" element={<ProtectedRoute requiredPermission="cientifica_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="cientifica/insumos" element={<ProtectedRoute requiredPermission="cientifica_supplies"><InsumoSolicitationPage sector="cientifica" sectorLabel="Científica" /></ProtectedRoute>} />
                              <Route path="cientifica/nfe" element={<ProtectedRoute requiredPermission="cientifica_nfe"><NFEPage sector="cientifica" sectorLabel="Científica" /></ProtectedRoute>} />
                              <Route path="cientifica/bonificacoes" element={<ProtectedRoute requiredPermission="cientifica_bonuses"><BonusManagementPage sectorId="cientifica" sectorName="Científica" /></ProtectedRoute>} />
                            </Route>

                            {/* Comercial */}
                            <Route element={<ProtectedRoute requiredModule="comercial" requireEmployee />}>
                              <Route path="comercial" element={<ComercialDashboard />} />
                              <Route path="comercial/gamificacao" element={<ProtectedRoute requiredPermission="comercial_gamification"><GamificationPage /></ProtectedRoute>} />
                              <Route path="comercial/franquias" element={<ProtectedRoute requiredPermission="comercial_franchises"><FranquiasPage /></ProtectedRoute>} />
                              <Route path="comercial/operacoes" element={<SectorHROperationsPage departmentSlug="comercial" departmentName="Comercial" />} /><Route path="comercial/admissao" element={<Navigate to="/crm/comercial/operacoes" replace />} />
                              <Route path="comercial/contratos" element={<ProtectedRoute requiredPermission="comercial_contracts"><SectorContractDashboard sector="comercial" /></ProtectedRoute>} />
                              <Route path="comercial/contrato/:id" element={<ProtectedRoute requiredPermission="comercial_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="comercial/inside-sales/contratos" element={<ProtectedRoute requiredPermission="comercial_contracts"><SectorContractDashboard sector="com_inside_sales" /></ProtectedRoute>} />
                              <Route path="comercial/inside-sales/contrato/:id" element={<ProtectedRoute requiredPermission="comercial_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="comercial/franquias/contratos" element={<ProtectedRoute requiredPermission="comercial_contracts"><SectorContractDashboard sector="com_franchises" /></ProtectedRoute>} />
                              <Route path="comercial/franquias/contrato/:id" element={<ProtectedRoute requiredPermission="comercial_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="comercial/sudeste/contratos" element={<ProtectedRoute requiredPermission="comercial_contracts"><SectorContractDashboard sector="com_sudeste" /></ProtectedRoute>} />
                              <Route path="comercial/sudeste/contrato/:id" element={<ProtectedRoute requiredPermission="comercial_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="comercial/sul/contratos" element={<ProtectedRoute requiredPermission="comercial_contracts"><SectorContractDashboard sector="com_sul" /></ProtectedRoute>} />
                              <Route path="comercial/sul/contrato/:id" element={<ProtectedRoute requiredPermission="comercial_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="comercial/centro/contratos" element={<ProtectedRoute requiredPermission="comercial_contracts"><SectorContractDashboard sector="com_centro" /></ProtectedRoute>} />
                              <Route path="comercial/centro/contrato/:id" element={<ProtectedRoute requiredPermission="comercial_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="comercial/norte/contratos" element={<ProtectedRoute requiredPermission="comercial_contracts"><SectorContractDashboard sector="com_norte" /></ProtectedRoute>} />
                              <Route path="comercial/norte/contrato/:id" element={<ProtectedRoute requiredPermission="comercial_contracts"><ContractViewer /></ProtectedRoute>} />

                              <Route path="comercial/processos" element={<ProtectedRoute requiredPermission="comercial_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="comercial/precificacao" element={<ProtectedRoute requiredPermission="comercial_pricing"><PricingPage /></ProtectedRoute>} />
                              <Route path="comercial/insumos" element={<ProtectedRoute requiredPermission="comercial_supplies"><InsumoSolicitationPage sector="comercial" sectorLabel="Comercial" /></ProtectedRoute>} />

                              {/* Subcomercial Insumos */}
                              <Route path="comercial/inside-sales/insumos" element={<ProtectedRoute requiredPermission="comercial_supplies"><InsumoSolicitationPage sector="com_inside" sectorLabel="Inside Sales" /></ProtectedRoute>} />
                              <Route path="comercial/franquias/insumos" element={<ProtectedRoute requiredPermission="comercial_supplies"><InsumoSolicitationPage sector="com_franchises" sectorLabel="Franquias" /></ProtectedRoute>} />
                              <Route path="comercial/sudeste/insumos" element={<ProtectedRoute requiredPermission="comercial_supplies"><InsumoSolicitationPage sector="com_sudeste" sectorLabel="Sudeste" /></ProtectedRoute>} />
                              <Route path="comercial/sul/insumos" element={<ProtectedRoute requiredPermission="comercial_supplies"><InsumoSolicitationPage sector="com_sul" sectorLabel="Sul" /></ProtectedRoute>} />
                              <Route path="comercial/centro/insumos" element={<ProtectedRoute requiredPermission="comercial_supplies"><InsumoSolicitationPage sector="com_centro" sectorLabel="Centro-Oeste" /></ProtectedRoute>} />
                              <Route path="comercial/norte/insumos" element={<ProtectedRoute requiredPermission="comercial_supplies"><InsumoSolicitationPage sector="com_norte" sectorLabel="Norte/Nordeste" /></ProtectedRoute>} />

                              <Route path="comercial/nfe" element={<ProtectedRoute requiredPermission="comercial_nfe"><NFEPage sector="comercial" sectorLabel="Comercial" /></ProtectedRoute>} />
                              <Route path="comercial/solicitacoes-setores" element={<ProtectedRoute requiredPermission="comercial_intersector"><SectorRequestsWrapper department="comercial" /></ProtectedRoute>} />

                              <Route path="comercial/:subdepartment" element={<ComercialSubDepartmentPage />} />
                            </Route>

                            {/* Compras */}
                            <Route element={<ProtectedRoute requiredModule="compras" requireEmployee />}>
                              <Route path="compras" element={<ComprasDashboard />} />
                              <Route path="compras/operacoes" element={<SectorHROperationsPage departmentSlug="compras" departmentName="Compras" />} /><Route path="compras/admissao" element={<Navigate to="/crm/compras/operacoes" replace />} />
                              <Route path="compras/veiculos" element={<ProtectedRoute requiredPermission="purchasing_vehicles"><ComprasVeiculosPage /></ProtectedRoute>} />
                              <Route path="compras/contratos" element={<ProtectedRoute requiredPermission="compras_contracts"><SectorContractDashboard sector="compras" /></ProtectedRoute>} />
                              <Route path="compras/contrato/:id" element={<ProtectedRoute requiredPermission="compras_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="compras/solicitacoes-setores" element={<ProtectedRoute requiredPermission="compras_intersector"><SectorRequestsWrapper department="compras" /></ProtectedRoute>} />
                              <Route path="compras/processos" element={<ProtectedRoute requiredPermission="compras_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="compras/insumos" element={<ProtectedRoute requiredPermission="compras_supplies"><InsumoSolicitationPage sector="compras" sectorLabel="Compras" /></ProtectedRoute>} />
                              <Route path="compras/bonificacoes" element={<ProtectedRoute requiredPermission="compras_bonuses"><BonusManagementPage sectorId="compras" sectorName="Compras" /></ProtectedRoute>} />
                            </Route>

                            {/* E-commerce */}
                            <Route path="ecommerce" element={<ProtectedRoute requiredModule="ecommerce" requireEmployee><EcommerceDashboard /></ProtectedRoute>} />
                            <Route path="ecommerce/pedidos" element={<ProtectedRoute requiredPermission="ecommerce_orders" requireEmployee><EcommercePedidosPage /></ProtectedRoute>} />
                            <Route path="ecommerce/produtos" element={<ProtectedRoute requiredPermission="ecommerce_products" requireEmployee><EcommerceProdutosPage /></ProtectedRoute>} />
                            <Route path="ecommerce/categorias" element={<ProtectedRoute requiredPermission="ecommerce_products" requireEmployee><EcommerceCategoriasPage /></ProtectedRoute>} />
                            <Route path="ecommerce/clientes" element={<ProtectedRoute requiredPermission="ecommerce_customers" requireEmployee><EcommerceCustomersPage /></ProtectedRoute>} />
                            <Route path="ecommerce/cms" element={<ProtectedRoute requiredPermission="ecommerce_cms" requireEmployee><EcommerceCMSPage /></ProtectedRoute>} />
                            <Route path="ecommerce/cupons" element={<ProtectedRoute requiredPermission="ecommerce_coupons" requireEmployee><EcommerceCuponsPage /></ProtectedRoute>} />
                            <Route path="ecommerce/operacoes" element={<SectorHROperationsPage departmentSlug="ecommerce" departmentName="E-commerce" />} /><Route path="ecommerce/admissao" element={<Navigate to="/crm/ecommerce/operacoes" replace />} />
                            <Route path="ecommerce/precificacao" element={<ProtectedRoute requiredPermission="ecommerce_pricing"><PricingPage /></ProtectedRoute>} />
                            <Route path="ecommerce/contratos" element={<ProtectedRoute requiredPermission="ecommerce_contracts"><SectorContractDashboard sector="ecommerce" /></ProtectedRoute>} />
                            <Route path="ecommerce/contrato/:id" element={<ProtectedRoute requiredPermission="ecommerce_contracts"><ContractViewer /></ProtectedRoute>} />
                            <Route path="ecommerce/solicitacoes-setores" element={<ProtectedRoute requiredPermission="ecommerce_intersector"><SectorRequestsWrapper department="ecommerce" /></ProtectedRoute>} />
                            <Route path="ecommerce/processos" element={<ProtectedRoute requiredPermission="ecommerce_processes"><ProcessControlPage /></ProtectedRoute>} />
                            <Route path="ecommerce/insumos" element={<ProtectedRoute requiredPermission="ecommerce_supplies"><InsumoSolicitationPage sector="ecommerce" sectorLabel="E-commerce" /></ProtectedRoute>} />
                            <Route path="ecommerce/bonificacoes" element={<ProtectedRoute requiredPermission="ecommerce_bonuses"><BonusManagementPage sectorId="ecommerce" sectorName="E-commerce" /></ProtectedRoute>} />

                            {/* Financeiro */}
                            <Route element={<ProtectedRoute requiredModule="financeiro" requireEmployee />}>
                              <Route path="financeiro" element={<FinanceiroDashboard />} />
                              <Route path="financeiro/operacoes" element={<SectorHROperationsPage departmentSlug="financeiro" departmentName="Financeiro" />} /><Route path="financeiro/admissao" element={<Navigate to="/crm/financeiro/operacoes" replace />} />
                              <Route path="financeiro/contratos" element={<ProtectedRoute requiredPermission="finance_contracts"><SectorContractDashboard sector="financeiro" /></ProtectedRoute>} />
                              <Route path="financeiro/contrato/:id" element={<ProtectedRoute requiredPermission="finance_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="financeiro/solicitacoes-setores" element={<ProtectedRoute requiredPermission="finance_intersector"><SectorRequestsWrapper department="financeiro" /></ProtectedRoute>} />
                              <Route path="financeiro/processos" element={<ProtectedRoute requiredPermission="finance_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="financeiro/insumos" element={<ProtectedRoute requiredPermission="finance_supplies"><InsumoSolicitationPage sector="financeiro" sectorLabel="Financeiro" /></ProtectedRoute>} />
                              <Route path="financeiro/bonificacoes" element={<ProtectedRoute requiredPermission="finance_bonuses"><BonusManagementPage sectorId="financeiro" sectorName="Financeiro" /></ProtectedRoute>} />
                              <Route path="financeiro/precificacao" element={<ProtectedRoute requiredPermission="finance_pricing"><PricingPage /></ProtectedRoute>} />
                              <Route path="financeiro/nfe" element={<ProtectedRoute requiredPermission="finance_nfe"><NFEPage sector="financeiro" sectorLabel="Financeiro" /></ProtectedRoute>} />
                            </Route>



                            <Route path="intranet/contratos/novo" element={<ContractRequestForm />} />
                            <Route path="intranet/contratos/:id/editar" element={<ContractRequestForm />} />
                            <Route path="intranet/contratos/:id/revisao" element={<ContractViewer />} />
                            <Route path="intranet/contratos" element={<Navigate to="/crm/juridico/contratos" replace />} />

                            {/* Unificados / Inteligentes */}
                            <Route path="contrato/:id" element={<ContractViewer />} />
                            <Route path="contratos" element={<Navigate to="/crm/juridico/contratos" replace />} />

                            {/* Jurídico */}
                            <Route element={<ProtectedRoute requiredModule="juridico" requireEmployee />}>
                              <Route path="juridico" element={<ProtectedRoute requiredPermission="legal_contracts" requireEmployee><LegalDashboard /></ProtectedRoute>} />
                              <Route path="juridico/contratos" element={<ProtectedRoute requiredPermission="legal_contracts" requireEmployee><LegalContractsDashboard /></ProtectedRoute>} />
                              <Route path="juridico/contratos/novo" element={<ProtectedRoute requiredPermission="legal_contracts" requireEmployee><LegalContractCreatePage /></ProtectedRoute>} />
                              <Route path="juridico/modelos" element={<ProtectedRoute requiredPermission="legal_compliance" requireEmployee><ContractTemplatesSettings /></ProtectedRoute>} />
                              <Route path="juridico/compliance" element={<ProtectedRoute requiredPermission="legal_compliance" requireEmployee><CompliancePage /></ProtectedRoute>} />
                              <Route path="legal" element={<LegalDashboard />} />
                              <Route path="legal/novo" element={<Navigate to="/crm/juridico/contratos/novo" replace />} />
                              <Route path="legal/contrato/:id" element={<ContractViewer />} />
                              <Route path="juridico/operacoes" element={<SectorHROperationsPage departmentSlug="juridico" departmentName="Jurídico" />} /><Route path="juridico/admissao" element={<Navigate to="/crm/juridico/operacoes" replace />} />
                              <Route path="juridico/solicitacoes-setores" element={<ProtectedRoute requiredPermission="juridico_intersector"><SectorRequestsWrapper department="juridico" /></ProtectedRoute>} />
                              <Route path="juridico/processos" element={<ProtectedRoute requiredPermission="juridico_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="juridico/insumos" element={<ProtectedRoute requiredPermission="juridico_supplies"><InsumoSolicitationPage sector="juridico" sectorLabel="Jurídico" /></ProtectedRoute>} />
                              <Route path="juridico/nfe" element={<ProtectedRoute requiredPermission="juridico_nfe"><NFEPage sector="juridico" sectorLabel="Jurídico" /></ProtectedRoute>} />
                              <Route path="juridico/bonificacoes" element={<ProtectedRoute requiredPermission="juridico_bonuses"><BonusManagementPage sectorId="juridico" sectorName="Jurídico" /></ProtectedRoute>} />
                            </Route>

                            {/* Logistics */}
                            <Route element={<ProtectedRoute requiredModule="logistica" requireEmployee />}>
                              <Route path="logistica" element={<LogisticaDashboard />} />
                              <Route path="logistica/operacoes" element={<SectorHROperationsPage departmentSlug="logistica" departmentName="Logística" />} /><Route path="logistica/admissao" element={<Navigate to="/crm/logistica/operacoes" replace />} />
                              <Route path="logistica/pedidos" element={<ProtectedRoute requiredPermission="logistics_orders" requireEmployee><LogisticaPedidosPage /></ProtectedRoute>} />
                              <Route path="logistica/estoque" element={<ProtectedRoute requiredPermission="logistics_inventory" requireEmployee><LogisticaEstoquePage /></ProtectedRoute>} />
                              <Route path="logistica/contratos" element={<ProtectedRoute requiredPermission="logistics_contracts"><SectorContractDashboard sector="logistica" /></ProtectedRoute>} />
                              <Route path="logistica/contrato/:id" element={<ProtectedRoute requiredPermission="logistics_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="logistica/solicitacoes-setores" element={<ProtectedRoute requiredPermission="logistics_intersector"><SectorRequestsWrapper department="logistica" /></ProtectedRoute>} />
                              <Route path="logistica/processos" element={<ProtectedRoute requiredPermission="logistics_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="logistica/insumos" element={<ProtectedRoute requiredPermission="logistics_supplies"><InsumoSolicitationPage sector="logistica" sectorLabel="Logística" /></ProtectedRoute>} />
                              <Route path="logistica/nfe" element={<ProtectedRoute requiredPermission="logistics_nfe"><NFEPage sector="logistica" sectorLabel="Logística" /></ProtectedRoute>} />
                              <Route path="logistica/bonificacoes" element={<ProtectedRoute requiredPermission="logistics_bonuses"><BonusManagementPage sectorId="logistica" sectorName="Logística" /></ProtectedRoute>} />
                            </Route>

                            {/* Manutenção */}
                            <Route element={<ProtectedRoute requiredModule="manutencao" requireEmployee />}>
                              <Route path="manutencao" element={<ManutencaoDashboard />} />
                              <Route path="manutencao/operacoes" element={<SectorHROperationsPage departmentSlug="manutencao" departmentName="Manutenção" />} /><Route path="manutencao/admissao" element={<Navigate to="/crm/manutencao/operacoes" replace />} />
                              <Route path="manutencao/contratos" element={<ProtectedRoute requiredPermission="manutencao_contracts"><SectorContractDashboard sector="manutencao" /></ProtectedRoute>} />
                              <Route path="manutencao/contrato/:id" element={<ProtectedRoute requiredPermission="manutencao_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="manutencao/solicitacoes-setores" element={<ProtectedRoute requiredPermission="manutencao_intersector"><SectorRequestsWrapper department="manutencao" /></ProtectedRoute>} />
                              <Route path="manutencao/nfe" element={<ProtectedRoute requiredPermission="manutencao_nfe"><NFEPage sector="manutencao" sectorLabel="Manutenção" /></ProtectedRoute>} />
                              <Route path="manutencao/processos" element={<ProtectedRoute requiredPermission="manutencao_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="manutencao/insumos" element={<ProtectedRoute requiredPermission="manutencao_supplies"><InsumoSolicitationPage sector="manutencao" sectorLabel="Manutenção" /></ProtectedRoute>} />
                              <Route path="manutencao/bonificacoes" element={<ProtectedRoute requiredPermission="manutencao_bonuses"><BonusManagementPage sectorId="manutencao" sectorName="Manutenção" /></ProtectedRoute>} />
                            </Route>

                            {/* Marketing */}
                            <Route element={<ProtectedRoute requiredModule="marketing" requireEmployee />}>
                              <Route path="marketing" element={<MarketingDashboard />} />
                              <Route path="marketing/operacoes" element={<SectorHROperationsPage departmentSlug="marketing" departmentName="Marketing" />} /><Route path="marketing/admissao" element={<Navigate to="/crm/marketing/operacoes" replace />} />
                              <Route path="marketing/campanhas" element={<ProtectedRoute requiredPermission="marketing_campaigns" requireEmployee><MarketingCampaignsPage /></ProtectedRoute>} />
                              <Route path="marketing/solicitacoes" element={<ProtectedRoute requiredPermission="marketing_requests" requireEmployee><InsumoSolicitationPage sector="marketing" sectorLabel="Marketing" /></ProtectedRoute>} />
                              <Route path="marketing/gerenciar" element={<ProtectedRoute requiredPermission="marketing_requests" requireEmployee><MarketingRequestsManagementPage /></ProtectedRoute>} />
                              <Route path="marketing/bonificacoes" element={<ProtectedRoute requiredPermission="marketing_bonuses"><BonusManagementPage sectorId="marketing" sectorName="Marketing" /></ProtectedRoute>} />
                              <Route path="marketing/contratos" element={<ProtectedRoute requiredPermission="marketing_contracts"><SectorContractDashboard sector="marketing" /></ProtectedRoute>} />
                              <Route path="marketing/contrato/:id" element={<ProtectedRoute requiredPermission="marketing_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="marketing/solicitacoes-setores" element={<ProtectedRoute requiredPermission="marketing_intersector"><SectorRequestsWrapper department="marketing" /></ProtectedRoute>} />
                              <Route path="marketing/nfe" element={<ProtectedRoute requiredPermission="marketing_nfe"><NFEPage sector="marketing" sectorLabel="Marketing" /></ProtectedRoute>} />
                              <Route path="marketing/processos" element={<ProtectedRoute requiredPermission="marketing_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="marketing/insumos" element={<ProtectedRoute requiredPermission="marketing_supplies"><InsumoSolicitationPage sector="marketing" sectorLabel="Marketing" /></ProtectedRoute>} />
                            </Route>

                            {/* RH */}
                            <Route element={<ProtectedRoute requiredModule="rh" requireEmployee />}>
                              <Route path="rh" element={<RHDashboard />} />
                              <Route path="rh/usuarios" element={<ProtectedRoute requiredPermission="admin_users" requireEmployee><UsersAdminPage /></ProtectedRoute>} />
                              <Route path="rh/operacoes" element={<ProtectedRoute requiredPermission="hr_employees" requireEmployee><HROperationsPage /></ProtectedRoute>} />
                              <Route path="rh/solicitacoes-setores" element={<ProtectedRoute requiredPermission="hr_intersector"><SectorRequestsWrapper department="rh" /></ProtectedRoute>} />
                              <Route path="rh/nfe" element={<ProtectedRoute requiredPermission="hr_nfe"><NFEPage sector="rh" sectorLabel="RH" /></ProtectedRoute>} />
                              <Route path="rh/processos" element={<ProtectedRoute requiredPermission="hr_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="rh/insumos" element={<ProtectedRoute requiredPermission="hr_supplies"><InsumoSolicitationPage sector="rh" sectorLabel="Recursos Humanos" /></ProtectedRoute>} />
                              <Route path="rh/contratos" element={<ProtectedRoute requiredPermission="hr_contracts"><SectorContractDashboard sector="rh" /></ProtectedRoute>} />
                              <Route path="rh/contrato/:id" element={<ProtectedRoute requiredPermission="hr_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="rh/ferias" element={<VacationAnalysisPage />} />
                            </Route>

                            {/* E-commerce */}
                            <Route element={<ProtectedRoute requiredModule="ecommerce" requireEmployee />}>
                              <Route path="ecommerce/nfe" element={<ProtectedRoute requiredPermission="ecommerce_nfe"><NFEPage sector="ecommerce" sectorLabel="E-commerce" /></ProtectedRoute>} />
                            </Route>

                            {/* Tech / TI */}
                            <Route element={<ProtectedRoute requiredModule="tech" requireEmployee />}>
                              <Route path="tech" element={<TechDashboard />} />
                              <Route path="tech/tickets" element={<ProtectedRoute requiredPermission="tech_tickets" requireEmployee><TechTicketsPage /></ProtectedRoute>} />
                              <Route path="tech/kb" element={<ProtectedRoute requiredPermission="tech_kb"><TechKBPage /></ProtectedRoute>} />
                              <Route path="tech/operacoes" element={<SectorHROperationsPage departmentSlug="tech" departmentName="Tecnologia da Informação" />} /><Route path="tech/admissao" element={<Navigate to="/crm/tech/operacoes" replace />} />
                              <Route path="tech/nfe" element={<ProtectedRoute requiredPermission="tech_nfe"><NFEPage sector="tech" sectorLabel="Tecnologia da Informação" /></ProtectedRoute>} />
                              <Route path="tech/inventario" element={<ProtectedRoute requiredPermission="tech_assets"><InventoryPage /></ProtectedRoute>} />
                              <Route path="tech/contratos" element={<ProtectedRoute requiredPermission="tech_contracts"><SectorContractDashboard sector="tech" /></ProtectedRoute>} />
                              <Route path="tech/contrato/:id" element={<ProtectedRoute requiredPermission="tech_contracts"><ContractViewer /></ProtectedRoute>} />
                              <Route path="tech/processos" element={<ProtectedRoute requiredPermission="tech_processes"><ProcessControlPage /></ProtectedRoute>} />
                              <Route path="tech/insumos" element={<ProtectedRoute requiredPermission="tech_supplies"><InsumoSolicitationPage sector="tech" sectorLabel="Tecnologia da Informação" /></ProtectedRoute>} />
                              <Route path="tech/bonificacoes" element={<ProtectedRoute requiredPermission="tech_bonuses"><BonusManagementPage sectorId="tech" sectorName="Tech" /></ProtectedRoute>} />
                              <Route path="tech/solicitacoes-setores" element={<ProtectedRoute requiredPermission="tech_intersector"><SectorRequestsWrapper department="tech" /></ProtectedRoute>} />
                            </Route>

                            {/* Compras */}
                            <Route element={<ProtectedRoute requiredModule="compras" requireEmployee />}>
                              <Route path="compras/nfe" element={<ProtectedRoute requiredPermission="compras_nfe"><NFEPage sector="compras" sectorLabel="Compras" /></ProtectedRoute>} />
                            </Route>

                            {/* Final CRM Layout cleanup */}
                          </Route>
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </CMSProvider>
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
