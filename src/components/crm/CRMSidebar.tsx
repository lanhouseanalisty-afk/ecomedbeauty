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
  Lightbulb
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

// ... (imports remain the same)

// ... (MenuSection interface remains the same)

const menuSections: MenuSection[] = [
  {
    title: "sidebar.sections.main",
    items: [
      {
        title: "sidebar.menu.dashboard",
        icon: LayoutDashboard,
        url: "/crm",
      },
      {
        title: "sidebar.menu.myProfile",
        icon: UserCircle,
        url: "/crm/rh/meu-perfil",
      },
      {
        title: "sidebar.menu.processControl", // NEW
        icon: ListTodo, // Icon for Process Control
        url: "/crm/controle-processos",
      },
      {
        title: "Checklist", // NEW
        icon: TicketCheck,
        url: "/crm/checklist/planilha-jean",
      },
    ],
  },
  {
    title: "sidebar.sections.intranet",
    items: [
      {
        title: "sidebar.menu.noticeBoard",
        icon: Megaphone,
        url: "/crm/intranet",
        permission: "access_intranet"
      },
      {
        title: "sidebar.menu.internalLibrary",
        icon: FileText,
        url: "/crm/biblioteca",
        permission: "access_intranet"
      },
      {
        title: "sidebar.menu.employeeDirectory",
        icon: Users,
        url: "/crm/colaboradores", // FIXED URL (was /crm/intranet/diretorio)
        permission: "intranet_directory"
      },
      // { // REMOVED - Not in Routes
      //   title: "sidebar.menu.corporateStore",
      //   icon: Store,
      //   url: "/crm/intranet/loja",
      //   permission: "intranet_store"
      // },
      // { // REMOVED - Not in Routes
      //   title: "sidebar.menu.ideaBank",
      //   icon: Lightbulb,
      //   url: "/crm/intranet/ideias",
      //   permission: "intranet_ideas"
      // },
      // { // REMOVED - Not in Routes (Request Center seems to be the one, but let's stick to what we see)
      //   title: "sidebar.menu.inputRequests",
      //   icon: Package,
      //   url: "/crm/marketing/solicitacoes",
      //   permission: "marketing_requests"
      // },
    ],
  },
  {
    title: "sidebar.sections.departments",
    items: [
      {
        title: "sidebar.menu.administration",
        icon: Building2,
        url: "/crm/admin",
        module: "admin",
        subitems: [
          { title: "sidebar.menu.users", url: "/crm/admin/usuarios", roles: ["admin"] },
          { title: "sidebar.menu.integrationSAP", url: "/crm/integracoes/sap", permission: "manage_sap" },
          { title: "common.nfeControl", url: "/crm/admin/nfe", roles: ["admin"] },
          { title: "Bonificações", url: "/crm/admin/bonificacoes", roles: ["admin"] },
          { title: "sidebar.menu.contracts", url: "/crm/admin/contratos", roles: ["admin"] },
          { title: "common.admissions", url: "/crm/admin/admissao", roles: ["admin"] }, // NEW
          { title: "common.sectorRequests", url: "/crm/admin/solicitacoes-setores", roles: ["admin"] }, // NEW
          { title: "Analytics", url: "/crm/admin/analytics", roles: ["admin"] }, // NEW
          { title: "Permissões", url: "/crm/admin/permissoes", roles: ["admin"] }, // NEW
        ],
      },
      {
        title: "Científica", // NEW SECTOR
        icon: Beaker,
        url: "/crm/cientifica",
        module: "cientifica", // Assumed module name
        subitems: [
          { title: "common.dashboard", url: "/crm/cientifica" },
          { title: "Apresentações", url: "/crm/cientifica/apresentacoes" },
          { title: "common.admissions", url: "/crm/cientifica/admissao" },
          { title: "sidebar.menu.contracts", url: "/crm/cientifica/contratos" },
          { title: "common.sectorRequests", url: "/crm/cientifica/solicitacoes-setores" },
        ],
      },
      {
        title: "sidebar.menu.commercial",
        icon: Handshake,
        url: "/crm/comercial",
        module: "comercial",
        subitems: [
          { title: "sidebar.menu.leads", url: "/crm/comercial" },
          // Inside Sales Group
          {
            title: "sidebar.menu.insideSales",
            url: "/crm/comercial/inside-sales",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/inside-sales" },
              { title: "Bonificações", url: "/crm/comercial/inside-sales/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/inside-sales/contratos" }
            ]
          },
          // Franchises Group
          {
            title: "sidebar.menu.franchises",
            url: "/crm/comercial/franquias",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/franquias" },
              { title: "Bonificações", url: "/crm/comercial/franquias/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/franquias/contratos" }
            ]
          },
          // Regions Group (Simplified for now or nested?)
          // Let's nest them to be consistent
          {
            title: "sidebar.menu.regions.southeast",
            url: "/crm/comercial/sudeste",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/sudeste" },
              { title: "Bonificações", url: "/crm/comercial/sudeste/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/sudeste/contratos" }
            ]
          },
          {
            title: "sidebar.menu.regions.south",
            url: "/crm/comercial/sul",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/sul" },
              { title: "Bonificações", url: "/crm/comercial/sul/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/sul/contratos" }
            ]
          },
          {
            title: "sidebar.menu.regions.center",
            url: "/crm/comercial/centro",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/centro" },
              { title: "Bonificações", url: "/crm/comercial/centro/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/centro/contratos" }
            ]
          },
          {
            title: "sidebar.menu.regions.north",
            url: "/crm/comercial/norte",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/norte" },
              { title: "Bonificações", url: "/crm/comercial/norte/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/norte/contratos" }
            ]
          },
          { title: "common.admissions", url: "/crm/comercial/admissao" },
          { title: "sidebar.menu.contracts", url: "/crm/comercial/contratos" }, // General Contracts
        ],
      },
      {
        title: "sidebar.menu.purchasing", // Compras
        icon: ShoppingCart, // Reusing ShoppingCart or finding better? Maybe target?
        url: "/crm/compras",
        module: "compras",
        subitems: [
          { title: "common.dashboard", url: "/crm/compras" },
          { title: "Veículos", url: "/crm/compras/veiculos" },
          { title: "common.admissions", url: "/crm/compras/admissao" },
          { title: "common.nfeControl", url: "/crm/compras/nfe" },
          { title: "sidebar.menu.contracts", url: "/crm/compras/contratos" },
          { title: "common.sectorRequests", url: "/crm/compras/solicitacoes-setores" },
        ]
      },
      {
        title: "sidebar.menu.ecommerce",
        icon: ShoppingCart,
        url: "/crm/ecommerce",
        module: "ecommerce",
        subitems: [
          { title: "common.dashboard", url: "/crm/ecommerce" },
          { title: "sidebar.menu.products", url: "/crm/ecommerce/produtos", permission: "ecommerce_products" },
          { title: "sidebar.menu.orders", url: "/crm/ecommerce/pedidos", permission: "ecommerce_orders" },
          { title: "Categorias", url: "/crm/ecommerce/categorias", permission: "ecommerce_products" },
          { title: "Cupons", url: "/crm/ecommerce/cupons" },
          { title: "CMS", url: "/crm/ecommerce/cms" },
          { title: "Precificação", url: "/crm/ecommerce/precificacao" },
          { title: "sidebar.menu.customers", url: "/crm/ecommerce/clientes", permission: "ecommerce_orders" },
          { title: "common.admissions", url: "/crm/ecommerce/admissao" },
          { title: "common.nfeControl", url: "/crm/ecommerce/nfe", permission: "finance_nfe" },
          { title: "sidebar.menu.contracts", url: "/crm/ecommerce/contratos" },
          { title: "common.sectorRequests", url: "/crm/ecommerce/solicitacoes-setores" },
        ],
      },
      {
        title: "sidebar.menu.finance",
        icon: DollarSign,
        url: "/crm/financeiro",
        module: "financeiro",
        subitems: [
          { title: "common.dashboard", url: "/crm/financeiro" },
          { title: "common.admissions", url: "/crm/financeiro/admissao" },
          { title: "common.nfeControl", url: "/crm/financeiro/nfe", permission: "finance_nfe" },
          { title: "sidebar.menu.contracts", url: "/crm/financeiro/contratos" },
          { title: "common.sectorRequests", url: "/crm/financeiro/solicitacoes-setores" },
        ],
      },
      {
        title: "Jurídico",
        icon: Scale,
        url: "/crm/juridico",
        module: "juridico",
        subitems: [
          { title: "Dashboard", url: "/crm/juridico" },
          { title: "Modelos de Contrato", url: "/crm/juridico/modelos", permission: "legal_compliance" },
          { title: "Contratos", url: "/crm/juridico/contratos", permission: "legal_contracts" },
          { title: "common.admissions", url: "/crm/juridico/admissao" },
          { title: "common.sectorRequests", url: "/crm/juridico/solicitacoes-setores" },
        ]
      },
      {
        title: "sidebar.menu.logistics",
        icon: Truck,
        url: "/crm/logistica",
        module: "logistica",
        subitems: [
          { title: "common.dashboard", url: "/crm/logistica" },
          { title: "sidebar.menu.inputsOrders", url: "/crm/logistica/pedidos", permission: "logistics_inventory" },
          { title: "sidebar.menu.stock", url: "/crm/logistica/estoque", permission: "logistics_inventory" }, // Added Stock/Inventory
          { title: "common.admissions", url: "/crm/logistica/admissao" },
          { title: "sidebar.menu.contracts", url: "/crm/logistica/contratos" },
          { title: "common.sectorRequests", url: "/crm/logistica/solicitacoes-setores" },
        ],
      },
      {
        title: "Manutenção",
        icon: Wrench,
        url: "/crm/manutencao",
        module: "manutencao",
        subitems: [
          { title: "common.dashboard", url: "/crm/manutencao" },
          { title: "common.admissions", url: "/crm/manutencao/admissao" },
          { title: "common.nfeControl", url: "/crm/manutencao/nfe" },
          { title: "sidebar.menu.contracts", url: "/crm/manutencao/contratos" },
          { title: "common.sectorRequests", url: "/crm/manutencao/solicitacoes-setores" },
        ]
      },
      {
        title: "sidebar.menu.marketing",
        icon: Megaphone,
        url: "/crm/marketing",
        module: "marketing",
        subitems: [
          { title: "common.dashboard", url: "/crm/marketing" },
          { title: "sidebar.menu.campaigns", url: "/crm/marketing/campanhas", permission: "marketing_campaigns" },
          { title: "Solicitações", url: "/crm/marketing/solicitacoes", permission: "marketing_requests" },
          { title: "Gerenciar Solicitações", url: "/crm/marketing/gerenciar", permission: "marketing_requests" },
          { title: "Bonificações", url: "/crm/marketing/bonificacoes" },
          { title: "common.admissions", url: "/crm/marketing/admissao" },
          { title: "common.nfeControl", url: "/crm/marketing/nfe" },
          { title: "sidebar.menu.contracts", url: "/crm/marketing/contratos" },
          { title: "common.sectorRequests", url: "/crm/marketing/solicitacoes-setores" },
        ],
      },
      {
        title: "sidebar.menu.humanResources",
        icon: Users,
        url: "/crm/rh",
        module: "rh",
        subitems: [
          { title: "common.dashboard", url: "/crm/rh" },
          { title: "common.admissions", url: "/crm/rh/operacoes", permission: "hr_employees" },
          { title: "Bonificações", url: "/crm/rh/bonificacoes" },
          { title: "common.nfeControl", url: "/crm/rh/nfe" },
          { title: "sidebar.menu.contracts", url: "/crm/rh/contratos" },
          { title: "common.sectorRequests", url: "/crm/rh/solicitacoes-setores" },
        ],
      },
      {
        title: "sidebar.menu.techTI",
        icon: Headphones,
        url: "/crm/tech",
        module: "tech",
        subitems: [
          { title: "common.dashboard", url: "/crm/tech" },
          { title: "sidebar.menu.tickets", url: "/crm/tech/tickets", permission: "tech_tickets" },
          { title: "Base de Conhecimento", url: "/crm/tech/kb", permission: "tech_kb" },
          { title: "common.admissions", url: "/crm/tech/admissao" },
          { title: "common.nfeControl", url: "/crm/tech/nfe" },
          { title: "sidebar.menu.inventory", url: "/crm/tech/inventario", permission: "tech_assets" },
          { title: "sidebar.menu.contracts", url: "/crm/tech/contratos" },
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
    // 1. Role filter (Legacy/Explicit)
    if (item.roles && item.roles.length > 0) {
      if (!roles.some(role => item.roles?.includes(role))) {
        console.log(`[CRMSidebar] Hidden by role: ${item.title}`);
        return false;
      }
    }

    // 2. Module filter (New Sector logic)
    if (item.module) {
      if (!canAccessModule(item.module)) {
        console.log(`[CRMSidebar] Hidden by module: ${item.title} (${item.module})`);
        return false;
      }
    }

    // 3. Permission filter (Nested logic)
    if (item.permission) {
      if (!hasPermission(item.permission)) {
        console.log(`[CRMSidebar] Hidden by permission: ${item.title} (${item.permission})`);
        return false;
      }
    }

    return true;
  };

  const isParentActive = (item: MenuItem): boolean => {
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
              <span className="text-xs text-muted-foreground">{t('sidebar.footer.corporateCRM')}</span>
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
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5" />
                              {!collapsed && <span className={cn(section.title === "sidebar.sections.departments" && "font-bold")}>{t(item.title)}</span>}
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
                                                <NavLink to={subSubItem.url || "#"}>
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
                                      <NavLink to={subitem.url || "#"}>
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
                        <NavLink to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span className={cn(section.title === "sidebar.sections.departments" && "font-bold")}>{t(item.title)}</span>}
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
              {t('sidebar.footer.goToStore')}
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
