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

const FinanceiroDashboard = lazy(() => import("./pages/crm/financeiro/FinanceiroDashboard"));
const FinanceiroAdmissaoPage = lazy(() => import("./pages/crm/financeiro/FinanceiroAdmissaoPage"));
const MarketingDashboard = lazy(() => import("./pages/crm/marketing/MarketingDashboard"));
const MarketingAdmissaoPage = lazy(() => import("./pages/crm/marketing/MarketingAdmissaoPage"));
const MarketingCampaignsPage = lazy(() => import("./pages/crm/marketing/MarketingCampaignsPage"));
const MarketingSolicitacaoPage = lazy(() => import("@/pages/crm/marketing/MarketingSolicitacaoPage"));
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
const SectorSupplyRequestPage = lazy(() => import("./pages/crm/components/SectorSupplyRequestPage").then(module => ({ default: module.SectorSupplyRequestPage })));

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
                            <Route path="/pedido/:orderId" element={<OrderTracking />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/update-password" element={<UpdatePassword />} />
                            <Route path="/admin" element={<Admin />} />
                          </Route>

                          {/* CRM Routes - RESTORING ... */}
                          <Route path="/crm" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'editor', 'rh', 'financeiro', 'marketing', 'comercial', 'logistica', 'juridico', 'tech', 'ecommerce', 'compras', 'manutencao', 'tecnico']}><CRMLayout /></ProtectedRoute>}>
                            <Route index element={<CRMDashboard />} />

                            {/* Principal */}
                            <Route path="intranet" element={<ProtectedRoute requireEmployee><IntranetPage /></ProtectedRoute>} />
                            <Route path="intranet/loja" element={<ProtectedRoute requireEmployee><CorporateStorePage /></ProtectedRoute>} />
                            <Route path="intranet/ideias" element={<ProtectedRoute requireEmployee><IdeaBankPage /></ProtectedRoute>} />
                            <Route path="rh/meu-perfil" element={<EmployeeProfilePage />} />
                            <Route path="rh/perfil/:id" element={<EmployeeProfilePage />} />
                            <Route path="rh/contratos" element={<SectorContractDashboard sector="rh" />} />
                            <Route path="rh/contrato/:id" element={<ContractViewer />} />
                            <Route path="colaboradores" element={<ProtectedRoute requireEmployee><EmployeeDirectoryPage /></ProtectedRoute>} />

                            {/* Bonificações */}
                            <Route path="admin/bonificacoes" element={<AdminBonusPage />} />
                            <Route path="rh/bonificacoes" element={<BonusManagementPage sectorId="rh" sectorName="Recursos Humanos" />} />
                            <Route path="comercial/inside-sales/bonificacoes" element={<BonusManagementPage sectorId="com_inside" sectorName="Inside Sales" />} />
                            <Route path="comercial/franquias/bonificacoes" element={<BonusManagementPage sectorId="com_franchises" sectorName="Franquias" />} />
                            <Route path="comercial/sudeste/bonificacoes" element={<BonusManagementPage sectorId="com_sudeste" sectorName="Sudeste" />} />
                            <Route path="comercial/sul/bonificacoes" element={<BonusManagementPage sectorId="com_sul" sectorName="Sul" />} />
                            <Route path="comercial/centro/bonificacoes" element={<BonusManagementPage sectorId="com_centro" sectorName="Centro" />} />
                            <Route path="comercial/norte/bonificacoes" element={<BonusManagementPage sectorId="com_norte" sectorName="Norte" />} />

                            <Route path="biblioteca" element={<KnowledgeBasePage />} />
                            <Route path="checklist/planilha-jean" element={<PlanilhaJeanPage />} />
                            <Route path="controle-processos" element={<ProcessControlPage />} />

                            {/* Admin - Restricted to Admin role */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} requireEmployee />}>
                              <Route path="admin" element={<AdminCRMDashboard />} />
                              <Route path="admin/usuarios" element={<UsersAdminPage />} />
                              <Route path="admin/permissoes" element={<AdminPermissionsPage />} />
                              <Route path="admin/analytics" element={<AnalyticsDashboard />} />
                              <Route path="admin/bonificacoes" element={<AdminBonusPage />} />
                              <Route path="admin/nfe" element={<NFEPage sector="admin" sectorLabel="Administração" />} />
                              <Route path="integracoes/sap" element={<SapIntegrationPage />} />
                              <Route path="admin/contratos" element={<SectorContractDashboard sector="admin" />} />
                              <Route path="admin/admissao" element={<DepartmentAdmissaoPage department="admin" />} />
                              <Route path="admin/solicitacoes-setores" element={<SectorRequestsWrapper department="admin" />} />
                              <Route path="admin/processos" element={<ProcessControlPage />} />
                              <Route path="admin/precificacao" element={<PricingPage />} />
                              <Route path="admin/insumos" element={<SectorSupplyRequestPage currentSector="admin" sectorName="Administração" />} />
                            </Route>

                            {/* Científica */}
                            <Route path="cientifica" element={<CientificaDashboard />} />
                            <Route path="cientifica/apresentacoes" element={<ScientificPresentationsPage />} />
                            <Route path="cientifica/admissao" element={<DepartmentAdmissaoPage department="cientifica" />} />
                            <Route path="cientifica/contratos" element={<SectorContractDashboard sector="cientifica" />} />
                            <Route path="cientifica/contrato/:id" element={<ContractViewer />} />

                            <Route path="cientifica/solicitacoes-setores" element={<SectorRequestsWrapper department="cientifica" />} />
                            <Route path="cientifica/processos" element={<ProcessControlPage />} />
                            <Route path="cientifica/insumos" element={<SectorSupplyRequestPage currentSector="cientifica" sectorName="Científica" />} />
                            <Route path="cientifica/nfe" element={<NFEPage sector="cientifica" sectorLabel="Científica" />} />
                            <Route path="cientifica/bonificacoes" element={<BonusManagementPage sectorId="cientifica" sectorName="Científica" />} />

                            {/* Comercial */}
                            <Route element={<ProtectedRoute requiredModule="comercial" requireEmployee />}>
                              <Route path="comercial" element={<ComercialDashboard />} />
                              <Route path="comercial/franquias" element={<FranquiasPage />} />
                              <Route path="comercial/admissao" element={<ComercialAdmissaoPage />} />
                              <Route path="comercial/contratos" element={<SectorContractDashboard sector="comercial" />} />
                              <Route path="comercial/contrato/:id" element={<ContractViewer />} />
                              <Route path="comercial/inside-sales/contratos" element={<SectorContractDashboard sector="com_inside_sales" />} />
                              <Route path="comercial/inside-sales/contrato/:id" element={<ContractViewer />} />
                              <Route path="comercial/franquias/contratos" element={<SectorContractDashboard sector="com_franchises" />} />
                              <Route path="comercial/franquias/contrato/:id" element={<ContractViewer />} />
                              <Route path="comercial/sudeste/contratos" element={<SectorContractDashboard sector="com_sudeste" />} />
                              <Route path="comercial/sudeste/contrato/:id" element={<ContractViewer />} />
                              <Route path="comercial/sul/contratos" element={<SectorContractDashboard sector="com_sul" />} />
                              <Route path="comercial/sul/contrato/:id" element={<ContractViewer />} />
                              <Route path="comercial/centro/contratos" element={<SectorContractDashboard sector="com_centro" />} />
                              <Route path="comercial/centro/contrato/:id" element={<ContractViewer />} />
                              <Route path="comercial/norte/contratos" element={<SectorContractDashboard sector="com_norte" />} />
                              <Route path="comercial/norte/contrato/:id" element={<ContractViewer />} />

                              <Route path="comercial/processos" element={<ProcessControlPage />} />
                              <Route path="comercial/precificacao" element={<PricingPage />} />
                              <Route path="comercial/insumos" element={<SectorSupplyRequestPage currentSector="comercial" sectorName="Comercial" />} />
                              <Route path="comercial/nfe" element={<NFEPage sector="comercial" sectorLabel="Comercial" />} />
                              <Route path="comercial/solicitacoes-setores" element={<SectorRequestsWrapper department="comercial" />} />

                              <Route path="comercial/:subdepartment" element={<ComercialSubDepartmentPage />} />
                            </Route>

                            {/* Compras */}
                            <Route path="compras" element={<ComprasDashboard />} />
                            <Route path="compras/admissao" element={<DepartmentAdmissaoPage department="compras" />} />
                            <Route path="compras/veiculos" element={<ComprasVeiculosPage />} />
                            <Route path="compras/contratos" element={<SectorContractDashboard sector="compras" />} />
                            <Route path="compras/contrato/:id" element={<ContractViewer />} />
                            <Route path="compras/solicitacoes-setores" element={<SectorRequestsWrapper department="compras" />} />
                            <Route path="compras/processos" element={<ProcessControlPage />} />
                            <Route path="compras/insumos" element={<SectorSupplyRequestPage currentSector="compras" sectorName="Compras" />} />
                            <Route path="compras/bonificacoes" element={<BonusManagementPage sectorId="compras" sectorName="Compras" />} />

                            {/* E-commerce */}
                            <Route path="ecommerce" element={<ProtectedRoute requiredModule="ecommerce" requireEmployee><EcommerceDashboard /></ProtectedRoute>} />
                            <Route path="ecommerce/pedidos" element={<ProtectedRoute requiredPermission="ecommerce_orders" requireEmployee><EcommercePedidosPage /></ProtectedRoute>} />
                            <Route path="ecommerce/produtos" element={<ProtectedRoute requiredPermission="ecommerce_products" requireEmployee><EcommerceProdutosPage /></ProtectedRoute>} />
                            <Route path="ecommerce/categorias" element={<ProtectedRoute requiredPermission="ecommerce_products" requireEmployee><EcommerceCategoriasPage /></ProtectedRoute>} />
                            <Route path="ecommerce/clientes" element={<EcommerceCustomersPage />} />
                            <Route path="ecommerce/cms" element={<EcommerceCMSPage />} />
                            <Route path="ecommerce/cupons" element={<EcommerceCuponsPage />} />
                            <Route path="ecommerce/admissao" element={<EcommerceAdmissaoPage />} />
                            <Route path="ecommerce/precificacao" element={<PricingPage />} />
                            <Route path="ecommerce/contratos" element={<SectorContractDashboard sector="ecommerce" />} />
                            <Route path="ecommerce/contrato/:id" element={<ContractViewer />} />
                            <Route path="ecommerce/solicitacoes-setores" element={<SectorRequestsWrapper department="ecommerce" />} />
                            <Route path="ecommerce/processos" element={<ProcessControlPage />} />
                            <Route path="ecommerce/insumos" element={<SectorSupplyRequestPage currentSector="ecommerce" sectorName="E-commerce" />} />
                            <Route path="ecommerce/bonificacoes" element={<BonusManagementPage sectorId="ecommerce" sectorName="E-commerce" />} />

                            {/* Financeiro */}
                            <Route element={<ProtectedRoute requiredModule="financeiro" requireEmployee />}>
                              <Route path="financeiro" element={<FinanceiroDashboard />} />
                              <Route path="financeiro/admissao" element={<FinanceiroAdmissaoPage />} />
                              <Route path="financeiro/contratos" element={<SectorContractDashboard sector="financeiro" />} />
                              <Route path="financeiro/contrato/:id" element={<ContractViewer />} />
                              <Route path="financeiro/solicitacoes-setores" element={<SectorRequestsWrapper department="financeiro" />} />
                              <Route path="financeiro/processos" element={<ProcessControlPage />} />
                              <Route path="financeiro/insumos" element={<SectorSupplyRequestPage currentSector="financeiro" sectorName="Financeiro" />} />
                              <Route path="financeiro/bonificacoes" element={<BonusManagementPage sectorId="financeiro" sectorName="Financeiro" />} />
                              <Route path="financeiro/precificacao" element={<PricingPage />} />
                            </Route>



                            <Route path="intranet/contratos/novo" element={<ContractRequestForm />} />
                            <Route path="intranet/contratos/:id/editar" element={<ContractRequestForm />} />
                            <Route path="intranet/contratos/:id/revisao" element={<ContractViewer />} />
                            <Route path="intranet/contratos" element={<SectorContractDashboard />} />

                            {/* Unificados / Inteligentes */}
                            <Route path="contrato/:id" element={<ContractViewer />} />
                            <Route path="contratos" element={<Navigate to="/crm/intranet/contratos" replace />} />

                            {/* Jurídico */}
                            <Route element={<ProtectedRoute requiredModule="juridico" requireEmployee />}>
                              <Route path="juridico" element={<ProtectedRoute requiredPermission="legal_contracts" requireEmployee><LegalDashboard /></ProtectedRoute>} />
                              <Route path="juridico/contratos" element={<ProtectedRoute requiredPermission="legal_contracts" requireEmployee><LegalContractsDashboard /></ProtectedRoute>} />
                              <Route path="juridico/contratos/novo" element={<ProtectedRoute requiredPermission="legal_contracts" requireEmployee><LegalContractCreatePage /></ProtectedRoute>} />
                              <Route path="juridico/modelos" element={<ProtectedRoute requiredPermission="legal_compliance" requireEmployee><ContractTemplatesSettings /></ProtectedRoute>} />
                              <Route path="juridico/compliance" element={<ProtectedRoute requiredPermission="legal_compliance" requireEmployee><CompliancePage /></ProtectedRoute>} />
                              <Route path="legal" element={<LegalDashboard />} />
                              <Route path="legal/novo" element={<Navigate to="/crm/intranet/contratos/novo" replace />} />
                              <Route path="legal/contrato/:id" element={<ContractViewer />} />
                              <Route path="juridico/admissao" element={<JuridicoAdmissaoPage />} />
                              <Route path="juridico/solicitacoes-setores" element={<SectorRequestsWrapper department="juridico" />} />
                              <Route path="juridico/processos" element={<ProcessControlPage />} />
                              <Route path="juridico/insumos" element={<SectorSupplyRequestPage currentSector="juridico" sectorName="Jurídico" />} />
                              <Route path="juridico/nfe" element={<NFEPage sector="juridico" sectorLabel="Jurídico" />} />
                              <Route path="juridico/bonificacoes" element={<BonusManagementPage sectorId="juridico" sectorName="Jurídico" />} />
                            </Route>

                            {/* Logistics */}
                            <Route element={<ProtectedRoute requiredModule="logistica" requireEmployee />}>
                              <Route path="logistica" element={<LogisticaDashboard />} />
                              <Route path="logistica/admissao" element={<LogisticaAdmissaoPage />} />
                              <Route path="logistica/pedidos" element={<ProtectedRoute requiredPermission="logistics_inventory" requireEmployee><LogisticaPedidosPage /></ProtectedRoute>} />
                              <Route path="logistica/estoque" element={<ProtectedRoute requiredPermission="logistics_inventory" requireEmployee><LogisticaEstoquePage /></ProtectedRoute>} />
                              <Route path="logistica/contratos" element={<SectorContractDashboard sector="logistica" />} />
                              <Route path="logistica/contrato/:id" element={<ContractViewer />} />
                              <Route path="logistica/solicitacoes-setores" element={<SectorRequestsWrapper department="logistica" />} />
                              <Route path="logistica/processos" element={<ProcessControlPage />} />
                              <Route path="logistica/insumos" element={<SectorSupplyRequestPage currentSector="logistica" sectorName="Logística" />} />
                              <Route path="logistica/nfe" element={<NFEPage sector="logistica" sectorLabel="Logística" />} />
                              <Route path="logistica/bonificacoes" element={<BonusManagementPage sectorId="logistica" sectorName="Logística" />} />
                            </Route>

                            {/* Manutenção */}
                            <Route element={<ProtectedRoute requiredModule="manutencao" requireEmployee />}>
                              <Route path="manutencao" element={<ManutencaoDashboard />} />
                              <Route path="manutencao/admissao" element={<DepartmentAdmissaoPage department="manutencao" />} />
                              <Route path="manutencao/contratos" element={<SectorContractDashboard sector="manutencao" />} />
                              <Route path="manutencao/contrato/:id" element={<ContractViewer />} />
                              <Route path="manutencao/solicitacoes-setores" element={<SectorRequestsWrapper department="manutencao" />} />
                              <Route path="manutencao/nfe" element={<NFEPage sector="manutencao" sectorLabel="Manutenção" />} />
                              <Route path="manutencao/processos" element={<ProcessControlPage />} />
                              <Route path="manutencao/insumos" element={<SectorSupplyRequestPage currentSector="manutencao" sectorName="Manutenção" />} />
                              <Route path="manutencao/bonificacoes" element={<BonusManagementPage sectorId="manutencao" sectorName="Manutenção" />} />
                            </Route>

                            {/* Marketing */}
                            <Route element={<ProtectedRoute requiredModule="marketing" requireEmployee />}>
                              <Route path="marketing" element={<MarketingDashboard />} />
                              <Route path="marketing/admissao" element={<MarketingAdmissaoPage />} />
                              <Route path="marketing/campanhas" element={<ProtectedRoute requiredPermission="marketing_campaigns" requireEmployee><MarketingCampaignsPage /></ProtectedRoute>} />
                              <Route path="marketing/solicitacoes" element={<ProtectedRoute requiredPermission="marketing_requests" requireEmployee><MarketingSolicitacaoPage /></ProtectedRoute>} />
                              <Route path="marketing/gerenciar" element={<ProtectedRoute requiredPermission="marketing_requests" requireEmployee><MarketingRequestsManagementPage /></ProtectedRoute>} />
                              <Route path="marketing/bonificacoes" element={<BonusManagementPage sectorId="marketing" sectorName="Marketing" />} />
                              <Route path="marketing/contratos" element={<SectorContractDashboard sector="marketing" />} />
                              <Route path="marketing/contrato/:id" element={<ContractViewer />} />
                              <Route path="marketing/solicitacoes-setores" element={<SectorRequestsWrapper department="marketing" />} />
                              <Route path="marketing/nfe" element={<NFEPage sector="marketing" sectorLabel="Marketing" />} />
                              <Route path="marketing/processos" element={<ProcessControlPage />} />
                              <Route path="marketing/insumos" element={<SectorSupplyRequestPage currentSector="marketing" sectorName="Marketing" />} />
                            </Route>

                            {/* RH */}
                            <Route element={<ProtectedRoute requiredModule="rh" requireEmployee />}>
                              <Route path="rh" element={<RHDashboard />} />
                              <Route path="rh/operacoes" element={<ProtectedRoute requiredPermission="hr_employees" requireEmployee><HROperationsPage /></ProtectedRoute>} />
                              <Route path="rh/solicitacoes-setores" element={<SectorRequestsWrapper department="rh" />} />
                              <Route path="rh/nfe" element={<NFEPage sector="rh" sectorLabel="RH" />} />
                              <Route path="rh/processos" element={<ProcessControlPage />} />
                              <Route path="rh/insumos" element={<SectorSupplyRequestPage currentSector="rh" sectorName="Recursos Humanos" />} />
                            </Route>

                            {/* E-commerce */}
                            <Route element={<ProtectedRoute requiredModule="ecommerce" requireEmployee />}>
                              <Route path="ecommerce/nfe" element={<NFEPage sector="ecommerce" sectorLabel="E-commerce" />} />
                            </Route>

                            {/* Tech / TI */}
                            <Route element={<ProtectedRoute requiredModule="tech" requireEmployee />}>
                              <Route path="tech" element={<TechDashboard />} />
                              <Route path="tech/tickets" element={<ProtectedRoute requiredPermission="tech_tickets" requireEmployee><TechTicketsPage /></ProtectedRoute>} />
                              <Route path="tech/kb" element={<TechKBPage />} />
                              <Route path="tech/admissao" element={<TechAdmissaoPage />} />
                              <Route path="tech/nfe" element={<NFEPage sector="tech" sectorLabel="Tecnologia da Informação" />} />
                              <Route path="tech/inventario" element={<InventoryPage />} />
                              <Route path="tech/contratos" element={<SectorContractDashboard sector="tech" />} />
                              <Route path="tech/contrato/:id" element={<ContractViewer />} />
                              <Route path="tech/processos" element={<ProcessControlPage />} />
                              <Route path="tech/insumos" element={<SectorSupplyRequestPage currentSector="tech" sectorName="Tecnologia da Informação" />} />
                              <Route path="tech/bonificacoes" element={<BonusManagementPage sectorId="tech" sectorName="Tech" />} />
                              <Route path="tech/solicitacoes-setores" element={<SectorRequestsWrapper department="tech" />} />
                            </Route>

                            {/* Compras */}
                            <Route element={<ProtectedRoute requiredModule="compras" requireEmployee />}>
                              <Route path="compras/nfe" element={<NFEPage sector="compras" sectorLabel="Compras" />} />
                            </Route>

                            {/* Final CRM Layout cleanup */}
                          </Route>
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
