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
    title: "PRINCIPAL",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/crm",
      },
      {
        title: "Meu Perfil",
        icon: UserCircle,
        url: "/crm/rh/meu-perfil",
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
        title: "Biblioteca Interna",
        icon: FileText,
        url: "/crm/biblioteca",
      },
      {
        title: "Diretório de Colaboradores",
        icon: Users,
        url: "/crm/colaboradores",
      },
      {
        title: "Planilha do Jean",
        icon: TicketCheck,
        url: "/crm/checklist/planilha-jean",
      },
      {
        title: "Loja Corporativa",
        icon: Store,
        url: "/crm/intranet/loja",
      },
      {
        title: "Banco de Ideias",
        icon: Lightbulb,
        url: "/crm/intranet/ideias",
      },
      //   title: "Solicitação de Insumos",
      //   icon: Package,
      //   url: "/crm/marketing/solicitacoes",
      //   permission: "marketing_requests"
      // },
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
          { title: "Usuários", url: "/crm/admin/usuarios", roles: ["admin"] },
          { title: "Integração SAP", url: "/crm/integracoes/sap", permission: "manage_sap" },
          { title: "Precificação", url: "/crm/admin/precificacao" }, // NEW
          { title: "Controle de Processos", url: "/crm/admin/processos", roles: ["admin"] }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/admin/insumos", roles: ["admin"] }, // NEW
          { title: "Controle de NFE", url: "/crm/admin/nfe", roles: ["admin"] },
          { title: "Bonificações", url: "/crm/admin/bonificacoes", roles: ["admin"] },
          { title: "Contratos", url: "/crm/admin/contratos", roles: ["admin"] },
          { title: "Solicitações entre Setores", url: "/crm/admin/solicitacoes-setores", roles: ["admin"] },
          { title: "Analytics", url: "/crm/admin/analytics", roles: ["admin"] },
          { title: "Permissões", url: "/crm/admin/permissoes", roles: ["admin"] },
        ],
      },
      {
        title: "Científica", // NEW SECTOR
        icon: Beaker,
        url: "/crm/cientifica",
        module: "cientifica", // Assumed module name
        subitems: [
          { title: "Dashboard", url: "/crm/cientifica" },
          { title: "Apresentações", url: "/crm/cientifica/apresentacoes" },
          { title: "Controle de Processos", url: "/crm/cientifica/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/cientifica/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/cientifica/nfe" }, // NEW
          { title: "Contratos", url: "/crm/cientifica/contratos" },
          { title: "Bonificações", url: "/crm/cientifica/bonificacoes" }, // NEW
          { title: "Solicitações entre Setores", url: "/crm/cientifica/solicitacoes-setores" },
        ],
      },
      {
        title: "Comercial",
        icon: Handshake,
        url: "/crm/comercial",
        module: "comercial",
        subitems: [
          { title: "Leads", url: "/crm/comercial" },
          // Inside Sales Group
          {
            title: "Inside Sales",
            url: "/crm/comercial/inside-sales",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/inside-sales" },
              { title: "Bonificações", url: "/crm/comercial/inside-sales/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/inside-sales/contratos" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/inside-sales/insumos" }
            ]
          },
          // Franchises Group
          {
            title: "Franquias",
            url: "/crm/comercial/franquias",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/franquias" },
              { title: "Bonificações", url: "/crm/comercial/franquias/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/franquias/contratos" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/franquias/insumos" }
            ]
          },
          // Regions Group (Simplified for now or nested?)
          // Let's nest them to be consistent
          {
            title: "Sudeste",
            url: "/crm/comercial/sudeste",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/sudeste" },
              { title: "Bonificações", url: "/crm/comercial/sudeste/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/sudeste/contratos" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/sudeste/insumos" }
            ]
          },
          {
            title: "Sul",
            url: "/crm/comercial/sul",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/sul" },
              { title: "Bonificações", url: "/crm/comercial/sul/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/sul/contratos" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/sul/insumos" }
            ]
          },
          {
            title: "Centro-Oeste",
            url: "/crm/comercial/centro",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/centro" },
              { title: "Bonificações", url: "/crm/comercial/centro/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/centro/contratos" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/centro/insumos" }
            ]
          },
          {
            title: "Norte/Nordeste",
            url: "/crm/comercial/norte",
            subitems: [
              { title: "Dashboard", url: "/crm/comercial/norte" },
              { title: "Bonificações", url: "/crm/comercial/norte/bonificacoes" },
              { title: "Contratos", url: "/crm/comercial/norte/contratos" },
              { title: "Solicitação de Insumos", url: "/crm/comercial/norte/insumos" }
            ]
          },
          { title: "Solicitações entre Setores", url: "/crm/comercial/solicitacoes-setores" }, // NEW
        ],
      },
      {
        title: "Compras", // Compras
        icon: ShoppingCart, // Reusing ShoppingCart or finding better? Maybe target?
        url: "/crm/compras",
        module: "compras",
        subitems: [
          { title: "Dashboard", url: "/crm/compras" },
          { title: "Veículos", url: "/crm/compras/veiculos" },
          { title: "Controle de Processos", url: "/crm/compras/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/compras/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/compras/nfe" },
          { title: "Contratos", url: "/crm/compras/contratos" },
          { title: "Bonificações", url: "/crm/compras/bonificacoes" }, // NEW
          { title: "Solicitações entre Setores", url: "/crm/compras/solicitacoes-setores" },
        ]
      },
      {
        title: "E-Commerce",
        icon: ShoppingCart,
        url: "/crm/ecommerce",
        module: "ecommerce",
        subitems: [
          { title: "Dashboard", url: "/crm/ecommerce" },
          { title: "Produtos", url: "/crm/ecommerce/produtos", permission: "ecommerce_products" },
          { title: "Pedidos", url: "/crm/ecommerce/pedidos", permission: "ecommerce_orders" },
          { title: "Categorias", url: "/crm/ecommerce/categorias", permission: "ecommerce_products" },
          { title: "Cupons", url: "/crm/ecommerce/cupons" },
          { title: "CMS", url: "/crm/ecommerce/cms" },
          { title: "Precificação", url: "/crm/ecommerce/precificacao" },
          { title: "Clientes", url: "/crm/ecommerce/clientes", permission: "ecommerce_orders" },
          { title: "Controle de Processos", url: "/crm/ecommerce/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/ecommerce/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/ecommerce/nfe", permission: "finance_nfe" },
          { title: "Contratos", url: "/crm/ecommerce/contratos" },
          { title: "Bonificações", url: "/crm/ecommerce/bonificacoes" }, // NEW
          { title: "Solicitações entre Setores", url: "/crm/ecommerce/solicitacoes-setores" },
        ],
      },
      {
        title: "Financeiro",
        icon: DollarSign,
        url: "/crm/financeiro",
        module: "financeiro",
        subitems: [
          { title: "Dashboard", url: "/crm/financeiro" },
          { title: "Precificação", url: "/crm/financeiro/precificacao" }, // NEW
          { title: "Controle de Processos", url: "/crm/financeiro/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/financeiro/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/financeiro/nfe", permission: "finance_nfe" },
          { title: "Contratos", url: "/crm/financeiro/contratos" },
          { title: "Bonificações", url: "/crm/financeiro/bonificacoes", permission: "finance_nfe" }, // NEW (Assuming perm)
          { title: "Solicitações entre Setores", url: "/crm/financeiro/solicitacoes-setores" },
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
          { title: "Controle de Processos", url: "/crm/juridico/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/juridico/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/juridico/nfe" }, // NEW
          { title: "Contratos", url: "/crm/juridico/contratos", permission: "legal_contracts" },
          { title: "Bonificações", url: "/crm/juridico/bonificacoes" }, // NEW
          { title: "Solicitações entre Setores", url: "/crm/juridico/solicitacoes-setores" },
        ]
      },
      {
        title: "Logística",
        icon: Truck,
        url: "/crm/logistica",
        module: "logistica",
        subitems: [
          { title: "Dashboard", url: "/crm/logistica" },
          { title: "Pedidos de Insumos", url: "/crm/logistica/pedidos", permission: "logistics_inventory" },
          { title: "Estoque", url: "/crm/logistica/estoque", permission: "logistics_inventory" },
          { title: "Controle de Processos", url: "/crm/logistica/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/logistica/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/logistica/nfe" }, // NEW
          { title: "Contratos", url: "/crm/logistica/contratos" },
          { title: "Bonificações", url: "/crm/logistica/bonificacoes" }, // NEW
          { title: "Solicitações entre Setores", url: "/crm/logistica/solicitacoes-setores" },
        ],
      },
      {
        title: "Manutenção",
        icon: Wrench,
        url: "/crm/manutencao",
        module: "manutencao",
        subitems: [
          { title: "Dashboard", url: "/crm/manutencao" },
          { title: "Controle de Processos", url: "/crm/manutencao/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/manutencao/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/manutencao/nfe" },
          { title: "Contratos", url: "/crm/manutencao/contratos" },
          { title: "Bonificações", url: "/crm/manutencao/bonificacoes" }, // NEW
          { title: "Solicitações entre Setores", url: "/crm/manutencao/solicitacoes-setores" },
        ]
      },
      {
        title: "Marketing",
        icon: Megaphone,
        url: "/crm/marketing",
        module: "marketing",
        subitems: [
          { title: "Dashboard", url: "/crm/marketing" },
          { title: "Campanhas", url: "/crm/marketing/campanhas", permission: "marketing_campaigns" },
          { title: "Gerenciar Solicitações", url: "/crm/marketing/gerenciar", permission: "marketing_requests" },
          { title: "Controle de Processos", url: "/crm/marketing/processos" }, // NEW
          { title: "Controle de NFE", url: "/crm/marketing/nfe" },
          { title: "Bonificações", url: "/crm/marketing/bonificacoes" }, // Moved
          { title: "Contratos", url: "/crm/marketing/contratos" },
          { title: "Solicitações entre Setores", url: "/crm/marketing/solicitacoes-setores" },
        ],
      },
      {
        title: "Recursos Humanos",
        icon: Users,
        url: "/crm/rh",
        module: "rh",
        subitems: [
          { title: "Dashboard", url: "/crm/rh" },
          { title: "Controle de Processos", url: "/crm/rh/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/rh/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/rh/nfe" },
          { title: "Bonificações", url: "/crm/rh/bonificacoes" },
          { title: "Contratos", url: "/crm/rh/contratos" },
          { title: "Solicitações entre Setores", url: "/crm/rh/solicitacoes-setores" },
        ],
      },
      {
        title: "Tecnologia & TI",
        icon: Headphones,
        url: "/crm/tech",
        module: "tech",
        subitems: [
          { title: "Dashboard", url: "/crm/tech" },
          { title: "Chamados", url: "/crm/tech/tickets", permission: "tech_tickets" },
          { title: "Base de Conhecimento", url: "/crm/tech/kb", permission: "tech_kb" },
          { title: "Controle de Processos", url: "/crm/tech/processos" }, // NEW
          { title: "Solicitação de Insumos", url: "/crm/tech/insumos" }, // NEW
          { title: "Controle de NFE", url: "/crm/tech/nfe" },
          { title: "Inventário de Ativos", url: "/crm/tech/inventario", permission: "tech_assets" },
          { title: "Contratos", url: "/crm/tech/contratos" },
          { title: "Bonificações", url: "/crm/tech/bonificacoes" }, // NEW
          { title: "Solicitações entre Setores", url: "/crm/tech/solicitacoes-setores" },
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
              Ir para a Loja
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
