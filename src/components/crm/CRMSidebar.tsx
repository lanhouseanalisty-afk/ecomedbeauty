import { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Megaphone,
  Handshake,
  Truck,
  Scale,
  Headphones,
  ShoppingCart,
  ChevronDown,
  Building2,
  UserCircle,
  Receipt,
  Target,
  Package,
  FileText,
  TicketCheck,
  Store,
  Wrench,
  Shield,
  Beaker,
  Database,
  ListTodo,
  Calculator,
  Lightbulb,
  BarChart3,
  Trophy,
  Coffee,
  CalendarDays
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  roles?: string[];
  module?: string;
  permission?: string;
  subitems?: SubItem[];
}

interface SubItem {
  title: string;
  url?: string;
  roles?: string[];
  module?: string;
  permission?: string;
  subitems?: SubItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}



const menuSections: MenuSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      {
        title: "Visão Geral",
        icon: LayoutDashboard,
        url: "/crm/visao-geral",
        roles: ["admin", "manager"],
      },
      {
        title: "Meu Perfil",
        icon: UserCircle,
        url: "/crm/rh/meu-perfil",
      },
      {
        title: "Power BI",
        icon: BarChart3,
        url: "/crm/power-bi",
      },
    ],
  },
  {
    title: "INTRANET",
    items: [
      {
        title: "Mural de Avisos",
        icon: Megaphone,
        url: "/crm/intranet",
      },
      {
        title: "Banco de Ideias",
        icon: Lightbulb,
        url: "/crm/intranet/ideias",
      },
      {
        title: "Biblioteca Interna",
        icon: FileText,
        url: "/crm/biblioteca",
      },
      {
        title: "Comunicar TI",
        icon: Headphones,
        url: "/crm/intranet/chamados",
      },
      {
        title: "Compliance & IA",
        icon: Shield,
        url: "/crm/intranet/compliance",
      },
      {
        title: "Diretório de Colaboradores",
        icon: Users,
        url: "/crm/colaboradores",
      },
      {
        title: "Gamificação",
        icon: Trophy,
        url: "/crm/intranet/gamificacao",
        permission: "comercial_gamification",
      },
      {
        title: "Loja Corporativa",
        icon: Store,
        url: "/crm/intranet/loja",
      },
      {
        title: "Precificação",
        icon: DollarSign,
        url: "/crm/intranet/precificacao",
        permission: "comercial_pricing",
      },
      {
        title: "sidebar.menu.forecastSpreadsheet",
        icon: TicketCheck,
        url: "/crm/checklist/planilha-jean",
        permission: "intranet_forecast",
      },
    ],
  },
  {
    title: "SETORES & DEPARTAMENTOS",
    items: [
      {
        title: "Administração",
        icon: Building2,
        url: "/crm/admin",
        module: "admin",
        subitems: [
          { title: "Analytics", url: "/crm/admin/analytics", permission: "admin_analytics" },
          { title: "Bonificações", url: "/crm/admin/bonificacoes", permission: "admin_bonuses" },
          { title: "Contratos", url: "/crm/admin/contratos", permission: "admin_contracts" },
          { title: "Controle de NFE", url: "/crm/admin/nfe", permission: "admin_nfe" },
          { title: "Controle de Processos", url: "/crm/admin/processos", permission: "admin_processes" },
          { title: "Gamificação", url: "/crm/admin/gamificacao", permission: "admin_gamification" },
          { title: "Integração SAP", url: "/crm/integracoes/sap", permission: "sap_monitor" },
          { title: "Permissões", url: "/crm/admin/permissoes", permission: "admin_permissions" },
          { title: "Solicitação de Insumos", url: "/crm/admin/insumos", permission: "admin_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/admin/solicitacoes-setores", permission: "admin_intersector" },
          { title: "Usuários", url: "/crm/admin/usuarios", permission: "admin_users" },
        ],
      },
      {
        title: "Científica", // NEW SECTOR
        icon: Beaker,
        url: "/crm/cientifica",
        module: "cientifica", // Assumed module name
        subitems: [
          { title: "Dashboard", url: "/crm/cientifica" },
          { title: "Apresentações", url: "/crm/cientifica/apresentacoes", permission: "cientifica_presentations" },
          { title: "Bonificações", url: "/crm/cientifica/bonificacoes", permission: "cientifica_bonuses" },
          { title: "Contratos", url: "/crm/cientifica/contratos", permission: "cientifica_contracts" },
          { title: "Controle de NFE", url: "/crm/cientifica/nfe", permission: "cientifica_nfe" },
          { title: "Controle de Processos", url: "/crm/cientifica/processos", permission: "cientifica_processes" },
          { title: "Solicitação de Insumos", url: "/crm/cientifica/insumos", permission: "cientifica_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/cientifica/solicitacoes-setores", permission: "cientifica_intersector" },
        ],
      },
      {
        title: "Comercial",
        icon: Handshake,
        url: "/crm/comercial",
        module: "comercial",
        subitems: [
          { title: "Leads", url: "/crm/comercial" },
          {
            title: "Centro-Oeste",
            url: "/crm/comercial/centro",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/centro" },
              { title: "Bonificações", url: "/crm/comercial/centro/bonificacoes", permission: "comercial_bonuses" },
              { title: "Contratos", url: "/crm/comercial/centro/contratos" },
              { title: "Controle de Processos", url: "/crm/comercial/centro/processos", permission: "comercial_processes" },
              { title: "Controle de NFE", url: "/crm/comercial/centro/nfe", permission: "comercial_nfe" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/centro/insumos" },
              { title: "Solicitações entre Setores", url: "/crm/comercial/centro/solicitacoes-setores", permission: "comercial_intersector" },
            ]
          },
          {
            title: "Franquias",
            url: "/crm/comercial/franquias",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/franquias" },
              { title: "Bonificações", url: "/crm/comercial/franquias/bonificacoes", permission: "comercial_bonuses" },
              { title: "Contratos", url: "/crm/comercial/franquias/contratos" },
              { title: "Controle de Processos", url: "/crm/comercial/franquias/processos", permission: "comercial_processes" },
              { title: "Controle de NFE", url: "/crm/comercial/franquias/nfe", permission: "comercial_nfe" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/franquias/insumos" },
              { title: "Solicitações entre Setores", url: "/crm/comercial/franquias/solicitacoes-setores", permission: "comercial_intersector" },
            ]
          },
          {
            title: "Inside Sales",
            url: "/crm/comercial/inside-sales",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/inside-sales" },
              { title: "Bonificações", url: "/crm/comercial/inside-sales/bonificacoes", permission: "comercial_bonuses" },
              { title: "Contratos", url: "/crm/comercial/inside-sales/contratos" },
              { title: "Controle de Processos", url: "/crm/comercial/inside-sales/processos", permission: "comercial_processes" },
              { title: "Controle de NFE", url: "/crm/comercial/inside-sales/nfe", permission: "comercial_nfe" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/inside-sales/insumos" },
              { title: "Solicitações entre Setores", url: "/crm/comercial/inside-sales/solicitacoes-setores", permission: "comercial_intersector" },
            ]
          },
          {
            title: "Norte/Nordeste",
            url: "/crm/comercial/norte",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/norte" },
              { title: "Bonificações", url: "/crm/comercial/norte/bonificacoes", permission: "comercial_bonuses" },
              { title: "Contratos", url: "/crm/comercial/norte/contratos" },
              { title: "Controle de Processos", url: "/crm/comercial/norte/processos", permission: "comercial_processes" },
              { title: "Controle de NFE", url: "/crm/comercial/norte/nfe", permission: "comercial_nfe" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/norte/insumos" },
              { title: "Solicitações entre Setores", url: "/crm/comercial/norte/solicitacoes-setores", permission: "comercial_intersector" },
            ]
          },
          {
            title: "Sudeste",
            url: "/crm/comercial/sudeste",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/sudeste" },
              { title: "Bonificações", url: "/crm/comercial/sudeste/bonificacoes", permission: "comercial_bonuses" },
              { title: "Contratos", url: "/crm/comercial/sudeste/contratos" },
              { title: "Controle de Processos", url: "/crm/comercial/sudeste/processos", permission: "comercial_processes" },
              { title: "Controle de NFE", url: "/crm/comercial/sudeste/nfe", permission: "comercial_nfe" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/sudeste/insumos" },
              { title: "Solicitações entre Setores", url: "/crm/comercial/sudeste/solicitacoes-setores", permission: "comercial_intersector" },
            ]
          },
          {
            title: "Sul",
            url: "/crm/comercial/sul",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/sul" },
              { title: "Bonificações", url: "/crm/comercial/sul/bonificacoes", permission: "comercial_bonuses" },
              { title: "Contratos", url: "/crm/comercial/sul/contratos" },
              { title: "Controle de Processos", url: "/crm/comercial/sul/processos", permission: "comercial_processes" },
              { title: "Controle de NFE", url: "/crm/comercial/sul/nfe", permission: "comercial_nfe" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/sul/insumos" },
              { title: "Solicitações entre Setores", url: "/crm/comercial/sul/solicitacoes-setores", permission: "comercial_intersector" },
            ]
          },
        ],
      },
      {
        title: "Compras", // Compras
        icon: ShoppingCart, // Reusing ShoppingCart or finding better? Maybe target?
        url: "/crm/compras",
        module: "compras",
        subitems: [
          { title: "Dashboard", url: "/crm/compras" },
          { title: "Bonificações", url: "/crm/compras/bonificacoes", permission: "compras_bonuses" },
          { title: "Contratos", url: "/crm/compras/contratos", permission: "compras_contracts" },
          { title: "Controle de NFE", url: "/crm/compras/nfe", permission: "compras_nfe" },
          { title: "Controle de Processos", url: "/crm/compras/processos", permission: "compras_processes" },
          { title: "Solicitação de Insumos", url: "/crm/compras/insumos", permission: "compras_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/compras/solicitacoes-setores", permission: "compras_intersector" },
          { title: "Veículos", url: "/crm/compras/veiculos", permission: "purchasing_vehicles" },
        ]
      },
      {
        title: "E-Commerce",
        icon: ShoppingCart,
        url: "/crm/ecommerce",
        module: "ecommerce",
        subitems: [
          { title: "Dashboard", url: "/crm/ecommerce" },
          { title: "Bonificações", url: "/crm/ecommerce/bonificacoes", permission: "ecommerce_bonuses" },
          { title: "Categorias", url: "/crm/ecommerce/categorias", permission: "ecommerce_products" },
          { title: "Clientes", url: "/crm/ecommerce/clientes", permission: "ecommerce_customers" },
          { title: "Contratos", url: "/crm/ecommerce/contratos", permission: "ecommerce_contracts" },
          { title: "Controle de NFE", url: "/crm/ecommerce/nfe", permission: "ecommerce_nfe" },
          { title: "Controle de Processos", url: "/crm/ecommerce/processos", permission: "ecommerce_processes" },
          { title: "Cupons", url: "/crm/ecommerce/cupons", permission: "ecommerce_coupons" },
          { title: "Pedidos", url: "/crm/ecommerce/pedidos", permission: "ecommerce_orders" },
          { title: "Produtos", url: "/crm/ecommerce/produtos", permission: "ecommerce_products" },
          { title: "Solicitação de Insumos", url: "/crm/ecommerce/insumos", permission: "ecommerce_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/ecommerce/solicitacoes-setores", permission: "ecommerce_intersector" },
        ],
      },
      {
        title: "Financeiro",
        icon: DollarSign,
        url: "/crm/financeiro",
        module: "financeiro",
        subitems: [
          { title: "Dashboard", url: "/crm/financeiro" },
          { title: "Bonificações", url: "/crm/financeiro/bonificacoes", permission: "finance_bonuses" },
          { title: "Contratos", url: "/crm/financeiro/contratos", permission: "finance_contracts" },
          { title: "Controle de NFE", url: "/crm/financeiro/nfe", permission: "finance_nfe" },
          { title: "Controle de Processos", url: "/crm/financeiro/processos", permission: "finance_processes" },
          { title: "Solicitação de Insumos", url: "/crm/financeiro/insumos", permission: "finance_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/financeiro/solicitacoes-setores", permission: "finance_intersector" },
        ],
      },
      {
        title: "Jurídico",
        icon: Scale,
        url: "/crm/juridico",
        module: "juridico",
        subitems: [
          { title: "Dashboard", url: "/crm/juridico" },
          { title: "Bonificações", url: "/crm/juridico/bonificacoes", permission: "juridico_bonuses" },
          { title: "Contratos", url: "/crm/juridico/contratos", permission: "legal_contracts" },
          { title: "Controle de NFE", url: "/crm/juridico/nfe", permission: "juridico_nfe" },
          { title: "Controle de Processos", url: "/crm/juridico/processos", permission: "juridico_processes" },
          { title: "Modelos de Contrato", url: "/crm/juridico/modelos", permission: "legal_compliance" },
          { title: "Solicitação de Insumos", url: "/crm/juridico/insumos", permission: "juridico_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/juridico/solicitacoes-setores", permission: "juridico_intersector" },
        ]
      },
      {
        title: "Logística",
        icon: Truck,
        url: "/crm/logistica",
        module: "logistica",
        subitems: [
          { title: "Dashboard", url: "/crm/logistica" },
          { title: "Bonificações", url: "/crm/logistica/bonificacoes", permission: "logistics_bonuses" },
          { title: "Contratos", url: "/crm/logistica/contratos", permission: "logistics_contracts" },
          { title: "Controle de NFE", url: "/crm/logistica/nfe", permission: "logistics_nfe" },
          { title: "Controle de Processos", url: "/crm/logistica/processos", permission: "logistics_processes" },
          { title: "Estoque", url: "/crm/logistica/estoque", permission: "logistics_inventory" },
          { title: "Pedidos de Insumos", url: "/crm/logistica/pedidos", permission: "logistics_orders" },
          { title: "Solicitação de Insumos", url: "/crm/logistica/insumos", permission: "logistics_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/logistica/solicitacoes-setores", permission: "logistics_intersector" },
        ],
      },
      {
        title: "Manutenção",
        icon: Wrench,
        url: "/crm/manutencao",
        module: "manutencao",
        subitems: [
          { title: "Dashboard", url: "/crm/manutencao" },
          { title: "Controle de Processos", url: "/crm/manutencao/processos", permission: "manutencao_processes" },
          { title: "Solicitação de Insumos", url: "/crm/manutencao/insumos", permission: "manutencao_supplies" },
          { title: "Controle de NFE", url: "/crm/manutencao/nfe", permission: "manutencao_nfe" },
          { title: "Contratos", url: "/crm/manutencao/contratos", permission: "manutencao_contracts" },
          { title: "Bonificações", url: "/crm/manutencao/bonificacoes", permission: "manutencao_bonuses" },
          { title: "Solicitações entre Setores", url: "/crm/manutencao/solicitacoes-setores", permission: "manutencao_intersector" },
        ]
      },
      {
        title: "Marketing",
        icon: Megaphone,
        url: "/crm/marketing",
        module: "marketing",
        subitems: [
          { title: "Dashboard", url: "/crm/marketing" },
          { title: "Bonificações", url: "/crm/marketing/bonificacoes", permission: "marketing_bonuses" },
          { title: "Campanhas", url: "/crm/marketing/campanhas", permission: "marketing_campaigns" },
          { title: "Contratos", url: "/crm/marketing/contratos", permission: "marketing_contracts" },
          { title: "Controle de NFE", url: "/crm/marketing/nfe", permission: "marketing_nfe" },
          { title: "Controle de Processos", url: "/crm/marketing/processos", permission: "marketing_processes" },
          { title: "Gerador de Mídia", url: "/crm/marketing/gerador-midia" },
          { title: "Solicitação de Insumos", url: "/crm/marketing/insumos", permission: "marketing_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/marketing/solicitacoes-setores", permission: "marketing_intersector" },
        ],
      },
      {
        title: "Recursos Humanos",
        icon: Users,
        url: "/crm/rh",
        module: "rh",
        subitems: [
          { title: "Dashboard", url: "/crm/rh" },
          { title: "Agenda (Limpeza)", url: "/crm/rh/agenda-limpeza", permission: "hr_employees" },
          { title: "Bonificações", url: "/crm/rh/bonificacoes", permission: "rh_bonuses" },
          { title: "Contratos", url: "/crm/rh/contratos", permission: "hr_contracts" },
          { title: "Controle de NFE", url: "/crm/rh/nfe", permission: "hr_nfe" },
          { title: "Controle de Processos", url: "/crm/rh/processos", permission: "hr_processes" },
          { title: "Solicitação de Insumos", url: "/crm/rh/insumos", permission: "hr_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/rh/solicitacoes-setores", permission: "hr_intersector" },
          { title: "Usuários", url: "/crm/rh/usuarios", permission: "admin_users" },
        ],
      },
      {
        title: "Tecnologia & TI",
        icon: Headphones,
        url: "/crm/tech",
        module: "tech",
        subitems: [
          { title: "Dashboard", url: "/crm/tech" },
          { title: "Base de Conhecimento", url: "/crm/tech/kb", permission: "tech_kb" },
          { title: "Bonificações", url: "/crm/tech/bonificacoes", permission: "tech_bonuses" },
          { title: "Chamados", url: "/crm/tech/tickets", permission: "tech_tickets" },
          { title: "Contratos", url: "/crm/tech/contratos", permission: "tech_contracts" },
          { title: "Controle de NFE", url: "/crm/tech/nfe", permission: "tech_nfe" },
          { title: "Controle de Processos", url: "/crm/tech/processos", permission: "tech_processes" },
          { title: "Inventário de Ativos", url: "/crm/tech/inventario", permission: "tech_assets" },
          { title: "Solicitação de Insumos", url: "/crm/tech/insumos", permission: "tech_supplies" },
          { title: "Solicitações entre Setores", url: "/crm/tech/solicitacoes-setores", permission: "tech_intersector" },
        ],
      },
      {
        title: "Departamento de Limpeza & Copa",
        icon: Coffee,
        url: "/crm/limpeza",
        module: "limpeza",
        subitems: [
          { title: "Agenda de Reuniões", url: "/crm/limpeza/agenda", permission: "manage_limpeza" },
          { title: "Solicitações entre Setores", url: "/crm/limpeza/solicitacoes-setores", permission: "limpeza_intersector" },
        ],
      },
    ],
  },
];

export function CRMSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const location = useLocation();
  const { roles } = useAuth();
  const { canAccessModule, hasPermission } = useUserRole();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => location.pathname === url;

  const canViewItem = (item: { title: string; roles?: string[]; module?: string; permission?: string }) => {
    // Show all sector modules to everyone as per the new requirement: "ver os setores, mas não poder abrir nenhuma pagina"
    if (item.module) return true;

    // 1. Role filter (Legacy/Explicit)
    if (item.roles && item.roles.length > 0) {
      if (!roles.some(role => item.roles?.includes(role))) {
        return false;
      }
    }

    // 3. Permission filter (Nested logic)
    if (item.permission) {
      if (!hasPermission(item.permission)) {
        return false;
      }
    }

    return true;
  };

  const isParentActive = (item: MenuItem | SubItem): boolean => {
    if (isActive(item.url)) return true;
    if (item.subitems) {
      return item.subitems.some(sub => isParentActive(sub));
    }
    return false;
  };

  const filteredSections = useMemo(() => {
    const filterItems = (items: any[]): any[] => {
      return items
        .filter(item => canViewItem(item))
        .map(item => ({
          ...item,
          subitems: item.subitems ? filterItems(item.subitems) : undefined
        }))
        .filter(item => {
          // If it has subitems but they were all filtered out, and it's a parent menu, we might want to hide it
          // EXCEPT if it has its own URL that is valid
          if (item.subitems && item.subitems.length === 0 && item.url === "#") return false;
          return true;
        });
    };

    return menuSections.map(section => ({
      ...section,
      items: filterItems(section.items)
    })).filter(section => section.items.length > 0);
  }, [roles, canAccessModule, hasPermission]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <NavLink to="/crm" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-serif text-lg font-semibold text-sidebar-foreground">
                MedBeauty
              </span>
              <span className="text-xs text-muted-foreground">MedBeauty CRM Corporativo</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {filteredSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {!collapsed && t(section.title)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.subitems && item.subitems.length > 0 ? (
                      <Collapsible
                        defaultOpen={location.pathname.startsWith(item.url)}
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "w-full justify-between group",
                              isParentActive(item) && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                              <item.icon className="h-5 w-5" />
                              {!collapsed && <span className="font-bold text-[14px]">{t(item.title)}</span>}
                            </div>
                            {!collapsed && (
                              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subitems?.map((subitem) => (
                                <SidebarMenuSubItem key={subitem.title}>
                                  {subitem.subitems && subitem.subitems.length > 0 ? (
                                    <Collapsible className="group/sub-collapsible">
                                      <CollapsibleTrigger asChild>
                                        <SidebarMenuSubButton className="justify-between cursor-pointer">
                                          <span>{t(subitem.title)}</span>
                                          <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-180" />
                                        </SidebarMenuSubButton>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <SidebarMenuSub className="border-l-0 pl-2"> {/* Nested sub-menu with slight indent correction if needed */}
                                          {subitem.subitems.map((subSubItem) => (
                                            <SidebarMenuSubItem key={subSubItem.title}>
                                              <SidebarMenuSubButton
                                                asChild
                                                isActive={isActive(subSubItem.url || "")}
                                                className="h-auto whitespace-normal py-1.5"
                                              >
                                                <NavLink to={subSubItem.url || "#"} className="font-normal text-[13px] text-muted-foreground hover:text-foreground w-full">
                                                  {t(subSubItem.title)}
                                                </NavLink>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          ))}
                                        </SidebarMenuSub>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ) : (
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isActive(subitem.url || "")}
                                      className="h-auto whitespace-normal py-1.5"
                                    >
                                      <NavLink to={subitem.url || "#"} className="font-normal text-[13px] text-muted-foreground hover:text-foreground w-full">
                                        {t(subitem.title)}
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  )}
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                      >
                        <NavLink to={item.url} className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span className="font-bold text-[14px]">{t(item.title)}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Ir para a Loja
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar >
  );
}
