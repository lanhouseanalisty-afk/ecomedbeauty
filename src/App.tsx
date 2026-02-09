import { Suspense, lazy } from "react";
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
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
import NotFound from "./pages/NotFound";

// Lazy Loaded CRM Pages
const CRMDashboard = lazy(() => import("./pages/crm/CRMDashboard"));
const AdminCRMDashboard = lazy(() => import("./pages/crm/admin/AdminCRMDashboard"));
const CientificaDashboard = lazy(() => import("./pages/crm/admin/CientificaDashboard"));
const RHDashboard = lazy(() => import("./pages/crm/rh/RHDashboard"));
const RHAdmissaoPage = lazy(() => import("./pages/crm/rh/AdmissaoPage"));
const DemissaoPage = lazy(() => import("./pages/crm/rh/DemissaoPage"));
const HROperationsPage = lazy(() => import("./pages/crm/rh/HROperationsPage"));
const EmployeeProfilePage = lazy(() => import("./pages/crm/rh/EmployeeProfilePage"));

const FinanceiroDashboard = lazy(() => import("./pages/crm/financeiro/FinanceiroDashboard"));
const FinanceiroAdmissaoPage = lazy(() => import("./pages/crm/financeiro/FinanceiroAdmissaoPage"));
const MarketingDashboard = lazy(() => import("./pages/crm/marketing/MarketingDashboard"));
const MarketingAdmissaoPage = lazy(() => import("./pages/crm/marketing/MarketingAdmissaoPage"));
const MarketingCampaignsPage = lazy(() => import("./pages/crm/marketing/MarketingCampaignsPage"));
const MarketingSolicitacaoPage = lazy(() => import("./pages/crm/marketing/MarketingSolicitacaoPage"));
const MarketingRequestsListPage = lazy(() => import("./pages/crm/marketing/MarketingRequestsListPage"));
const MarketingRequestsManagementPage = lazy(() => import("./pages/crm/marketing/MarketingRequestsManagementPage"));
const ComercialDashboard = lazy(() => import("./pages/crm/comercial/ComercialDashboard"));
const ComercialAdmissaoPage = lazy(() => import("./pages/crm/comercial/ComercialAdmissaoPage"));
const ComercialSubDepartmentPage = lazy(() => import("./pages/crm/comercial/ComercialSubDepartmentPage"));
const FranquiasPage = lazy(() => import("./pages/crm/comercial/FranquiasPage"));
const LogisticaDashboard = lazy(() => import("./pages/crm/logistica/LogisticaDashboard"));
const LogisticaAdmissaoPage = lazy(() => import("./pages/crm/logistica/LogisticaAdmissaoPage"));
const LogisticaPedidosPage = lazy(() => import("./pages/crm/logistica/LogisticaPedidosPage"));
const LogisticaEstoquePage = lazy(() => import("./pages/crm/logistica/LogisticaEstoquePage"));
const JuridicoDashboard = lazy(() => import("./pages/crm/juridico/JuridicoDashboard"));
const JuridicoAdmissaoPage = lazy(() => import("./pages/crm/juridico/JuridicoAdmissaoPage"));
const TechDashboard = lazy(() => import("./pages/crm/tech/TechDashboard"));
const TechAdmissaoPage = lazy(() => import("./pages/crm/tech/TechAdmissaoPage"));
const TechTicketsPage = lazy(() => import("./pages/crm/tech/TechTicketsPage"));
const TechKBPage = lazy(() => import("./pages/crm/tech/TechKBPage"));
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

const SectorRequestsPage = lazy(() => import("./pages/crm/components/SectorRequestsPage").then(module => ({ default: module.SectorRequestsPage })));
const EmployeeDirectoryPage = lazy(() => import("./pages/crm/EmployeeDirectoryPage"));
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

const SystemSettingsPage = lazy(() => import("./pages/admin/SystemSettingsPage"));
const AdminUsersPage = lazy(() => import("./pages/crm/admin/AdminUsersPage"));
const AdminPermissionsPage = lazy(() => import("./pages/crm/admin/AdminPermissionsPage"));
const ScientificPresentationsPage = lazy(() => import("./pages/crm/scientific/ScientificPresentationsPage"));
const SectorRequestsWrapper = lazy(() => import("./pages/crm/SectorRequestsWrapper"));

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
                            <Route path="/admin" element={<Admin />} />
                          </Route>

                          {/* CRM Routes - RESTORING ... */}
                          <Route path="/crm" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'editor', 'rh', 'financeiro', 'marketing', 'comercial', 'logistica', 'juridico', 'tech', 'ecommerce', 'compras', 'manutencao', 'tecnico']}><CRMLayout /></ProtectedRoute>}>
                            <Route index element={<CRMDashboard />} />

                            {/* Principal */}
                            <Route path="intranet" element={<IntranetPage />} />
                            <Route path="rh/meu-perfil" element={<EmployeeProfilePage />} />
                            <Route path="colaboradores" element={<EmployeeDirectoryPage />} />
                            <Route path="biblioteca" element={<KnowledgeBasePage />} />
                            <Route path="checklist/planilha-jean" element={<PlanilhaJeanPage />} />
                            <Route path="controle-processos" element={<ProcessControlPage />} />

                            {/* Admin */}
                            <Route path="admin" element={<AdminCRMDashboard />} />
                            <Route path="admin/usuarios" element={<AdminUsersPage />} />
                            <Route path="admin/permissoes" element={<AdminPermissionsPage />} />
                            <Route path="admin/admissao" element={<DepartmentAdmissaoPage department="admin" />} />
                            <Route path="admin/solicitacoes-setores" element={<SectorRequestsWrapper department="admin" />} />
                            <Route path="integracoes/sap" element={<SapIntegrationPage />} />

                            {/* Científica */}
                            <Route path="cientifica" element={<CientificaDashboard />} />
                            <Route path="cientifica/apresentacoes" element={<ScientificPresentationsPage />} />
                            <Route path="cientifica/admissao" element={<DepartmentAdmissaoPage department="cientifica" />} />
                            <Route path="cientifica/solicitacoes-setores" element={<SectorRequestsWrapper department="cientifica" />} />

                            {/* Comercial */}
                            <Route path="comercial" element={<ComercialDashboard />} />
                            <Route path="comercial/franquias" element={<FranquiasPage />} />
                            <Route path="comercial/admissao" element={<ComercialAdmissaoPage />} />
                            <Route path="comercial/:subdepartment" element={<ComercialSubDepartmentPage />} />

                            {/* Compras */}
                            <Route path="compras" element={<ComprasDashboard />} />
                            <Route path="compras/admissao" element={<DepartmentAdmissaoPage department="compras" />} />
                            <Route path="compras/veiculos" element={<ComprasVeiculosPage />} />
                            <Route path="compras/solicitacoes-setores" element={<SectorRequestsWrapper department="compras" />} />

                            {/* E-commerce */}
                            <Route path="ecommerce" element={<EcommerceDashboard />} />
                            <Route path="ecommerce/pedidos" element={<EcommercePedidosPage />} />
                            <Route path="ecommerce/produtos" element={<EcommerceProdutosPage />} />
                            <Route path="ecommerce/categorias" element={<EcommerceCategoriasPage />} />
                            <Route path="ecommerce/clientes" element={<EcommerceCustomersPage />} />
                            <Route path="ecommerce/cms" element={<EcommerceCMSPage />} />
                            <Route path="ecommerce/cupons" element={<EcommerceCuponsPage />} />
                            <Route path="ecommerce/admissao" element={<EcommerceAdmissaoPage />} />
                            <Route path="ecommerce/solicitacoes-setores" element={<SectorRequestsWrapper department="ecommerce" />} />

                            {/* Financeiro */}
                            <Route path="financeiro" element={<FinanceiroDashboard />} />
                            <Route path="financeiro/admissao" element={<FinanceiroAdmissaoPage />} />
                            <Route path="financeiro/solicitacoes-setores" element={<SectorRequestsWrapper department="financeiro" />} />

                            {/* Jurídico */}
                            <Route path="juridico" element={<JuridicoDashboard />} />
                            <Route path="juridico/admissao" element={<JuridicoAdmissaoPage />} />
                            <Route path="juridico/solicitacoes-setores" element={<SectorRequestsWrapper department="juridico" />} />

                            {/* Logística */}
                            <Route path="logistica" element={<LogisticaDashboard />} />
                            <Route path="logistica/admissao" element={<LogisticaAdmissaoPage />} />
                            <Route path="logistica/pedidos" element={<LogisticaPedidosPage />} />
                            <Route path="logistica/solicitacoes-setores" element={<SectorRequestsWrapper department="logistica" />} />

                            {/* Manutenção */}
                            <Route path="manutencao" element={<ManutencaoDashboard />} />
                            <Route path="manutencao/admissao" element={<DepartmentAdmissaoPage department="manutencao" />} />
                            <Route path="manutencao/solicitacoes-setores" element={<SectorRequestsWrapper department="manutencao" />} />

                            {/* Marketing */}
                            <Route path="marketing" element={<MarketingDashboard />} />
                            <Route path="marketing/admissao" element={<MarketingAdmissaoPage />} />
                            <Route path="marketing/campanhas" element={<MarketingCampaignsPage />} />
                            <Route path="marketing/solicitacoes" element={<MarketingSolicitacaoPage />} />
                            <Route path="marketing/solicitacoes-setores" element={<SectorRequestsWrapper department="marketing" />} />

                            {/* RH */}
                            <Route path="rh" element={<RHDashboard />} />
                            <Route path="rh/operacoes" element={<HROperationsPage />} />
                            <Route path="rh/solicitacoes-setores" element={<SectorRequestsWrapper department="rh" />} />

                            {/* Tech/TI */}
                            <Route path="tech" element={<TechDashboard />} />
                            <Route path="tech/admissao" element={<TechAdmissaoPage />} />
                            <Route path="tech/tickets" element={<TechTicketsPage />} />
                            <Route path="tech/inventario" element={<InventoryPage />} />
                            <Route path="tech/kb" element={<TechKBPage />} />
                            <Route path="tech/solicitacoes-setores" element={<SectorRequestsWrapper department="tech" />} />
                            <Route path="ecommerce/categorias" element={<EcommerceCategoriasPage />} />
                            <Route path="ecommerce/clientes" element={<EcommerceCustomersPage />} />
                            <Route path="ecommerce/cms" element={<EcommerceCMSPage />} />
                            <Route path="ecommerce/cupons" element={<EcommerceCuponsPage />} />
                            <Route path="ecommerce/admissao" element={<EcommerceAdmissaoPage />} />
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
