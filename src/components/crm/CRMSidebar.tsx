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
  Beaker
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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

interface SubItem {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  subitems?: SubItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Principal",
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
      {
        title: "Colaboradores",
        icon: Users,
        url: "/crm/colaboradores",
      },
    ],
  },
  {
    title: "Setores",
    items: [
      {
        title: "Administração",
        icon: Building2,
        url: "/crm/admin",
        subitems: [
          { title: "Visão Geral", url: "/crm/admin" },
          { title: "Usuários", url: "/crm/admin/usuarios" },
          { title: "Permissões", url: "/crm/admin/permissoes" },
          { title: "Auditoria", url: "/crm/admin/auditoria" },
          { title: "Solicitações entre Setores", url: "/crm/admin/solicitacoes-setores" },
        ],
      },
      {
        title: "Científica",
        icon: Beaker,
        url: "/crm/cientifica",
        subitems: [
          { title: "Dashboard", url: "/crm/cientifica" },
          { title: "Solicitações entre Setores", url: "/crm/cientifica/solicitacoes-setores" },
        ],
      },
      {
        title: "Comercial",
        icon: Handshake,
        url: "/crm/comercial",
        subitems: [
          { title: "Leads", url: "/crm/comercial" },
          { title: "Admissão", url: "/crm/comercial/admissao" },
          { title: "Inside Sales", url: "/crm/comercial/inside-sales" },
          { title: "Sudeste", url: "/crm/comercial/sudeste" },
          { title: "Sul", url: "/crm/comercial/sul" },
          { title: "Centro", url: "/crm/comercial/centro" },
          { title: "Norte", url: "/crm/comercial/norte" },
        ],
      },
      {
        title: "Compras",
        icon: Package, // Usando Package, pois ShoppingCart já é usado no E-commerce? O user pediu ShoppingCart ou Package. ShoppingCart está em E-commerce. Vou ver se ShoppingCart está importado. Sim. Vou usar Package para Compras corporativas para distinguir do carrinho de compras do e-commerce? O user disse "Compras (Gilcimar Gil)". No passo anterior user aceitou ShoppingCart. Mas E-commerce usa ShoppingCart. Vou usar Package para diferenciar visualmente se possível, ou ShoppingCart se não importar.
        // O user disse: "Atualizar o ícone para ShoppingCart ou Package (vou usar ShoppingCart ...)".
        // Vou usar Package para evitar confusão com E-commerce.
        url: "/crm/compras",
        subitems: [
          { title: "Dashboard", url: "/crm/compras" },
          { title: "Solicitações entre Setores", url: "/crm/compras/solicitacoes-setores" },
        ],
      },

      {
        title: "Diretoria",
        icon: Shield,
        url: "/crm/diretoria",
        subitems: [
          { title: "Dashboard", url: "/crm/diretoria" },
          { title: "Indicadores (KPIs)", url: "/crm/diretoria/kpis" },
        ],
      },
      {
        title: "E-commerce",
        icon: ShoppingCart,
        url: "/crm/ecommerce",
        subitems: [
          { title: "Dashboard", url: "/crm/ecommerce" },
          { title: "Produtos", url: "/crm/ecommerce/produtos" },
          { title: "Categorias", url: "/crm/ecommerce/categorias" },
          { title: "Pedidos", url: "/crm/ecommerce/pedidos" },
          { title: "Clientes", url: "/crm/ecommerce/clientes" },
          { title: "Cupons", url: "/crm/ecommerce/cupons" },
          { title: "Solicitações entre Setores", url: "/crm/ecommerce/solicitacoes-setores" },
        ],
      },
      {
        title: "Financeiro",
        icon: DollarSign,
        url: "/crm/financeiro",
        subitems: [
          { title: "Dashboard", url: "/crm/financeiro" },
          { title: "Admissão", url: "/crm/financeiro/admissao" },
          { title: "Faturas", url: "/crm/financeiro/faturas" },
          { title: "Pagamentos", url: "/crm/financeiro/pagamentos" },
          { title: "Contas", url: "/crm/financeiro/contas" },
          { title: "Centros de Custo", url: "/crm/financeiro/centros-custo" },
          { title: "Relatórios", url: "/crm/financeiro/relatorios" },
          { title: "Solicitações entre Setores", url: "/crm/financeiro/solicitacoes-setores" },
        ],
      },
      {
        title: "Jurídico",
        icon: Scale,
        url: "/crm/juridico",
        subitems: [
          { title: "Dashboard", url: "/crm/juridico" },
          { title: "Admissão", url: "/crm/juridico/admissao" },
          { title: "Contratos", url: "/crm/juridico/contratos" },
          { title: "Casos", url: "/crm/juridico/casos" },
          { title: "Compliance", url: "/crm/juridico/compliance" },
          { title: "Solicitações entre Setores", url: "/crm/juridico/solicitacoes-setores" },
        ],
      },
      {
        title: "Logística",
        icon: Truck,
        url: "/crm/logistica",
        subitems: [
          { title: "Dashboard", url: "/crm/logistica" },
          { title: "Admissão", url: "/crm/logistica/admissao" },
          { title: "Pedidos", url: "/crm/logistica/pedidos" },
          { title: "Envios", url: "/crm/logistica/envios" },
          { title: "Estoque", url: "/crm/logistica/estoque" },
          { title: "Transportadoras", url: "/crm/logistica/transportadoras" },
          { title: "Depósitos", url: "/crm/logistica/depositos" },
          { title: "Solicitações entre Setores", url: "/crm/logistica/solicitacoes-setores" },
        ],
      },
      {
        title: "Manutenção",
        icon: Wrench,
        url: "/crm/manutencao",
        subitems: [
          { title: "Dashboard", url: "/crm/manutencao" },
          { title: "Solicitações entre Setores", url: "/crm/manutencao/solicitacoes-setores" },
        ],
      },
      {
        title: "Marketing",
        icon: Megaphone,
        url: "/crm/marketing",
        subitems: [
          { title: "Dashboard", url: "/crm/marketing" },
          { title: "Admissão", url: "/crm/marketing/admissao" },
          { title: "Campanhas", url: "/crm/marketing/campanhas" },
          { title: "Insumos", url: "/crm/marketing/solicitacoes" },
          { title: "Solicitações entre Setores", url: "/crm/marketing/solicitacoes-setores" },
        ],
      },
      {
        title: "Recursos Humanos",
        icon: Users,
        url: "/crm/rh",
        subitems: [
          { title: "Dashboard", url: "/crm/rh" },
          { title: "Admissão", url: "/crm/rh/admissao" },
          { title: "Demissão", url: "/crm/rh/demissao" },
          { title: "Férias", url: "/crm/rh/ferias" },
          { title: "Treinamentos", url: "/crm/rh/treinamentos" },
          { title: "Solicitações entre Setores", url: "/crm/rh/solicitacoes-setores" },
        ],
      },
      {
        title: "Tech TI",
        icon: Headphones,
        url: "/crm/tech",
        subitems: [
          { title: "Admissão", url: "/crm/tech/admissao" },
          { title: "Demissão / Offboarding", url: "/crm/tech/demissao" },
          { title: "Tickets", url: "/crm/tech/tickets" },
          { title: "Ativos / Inventário", url: "/crm/tech/ativos" },
          { title: "Base de Conhecimento", url: "/crm/tech/kb" },
          { title: "Solicitações entre Setores", url: "/crm/tech/solicitacoes-setores" },
        ],
      },
    ],
  },
];

export function CRMSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => location.pathname === url;
  const isParentActive = (item: typeof menuSections[0]["items"][0]) => {
    if (isActive(item.url)) return true;
    if (item.subitems) {
      return item.subitems.some(sub => isActive(sub.url));
    }
    return false;
  };

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
              <span className="text-xs text-muted-foreground">CRM Corporativo</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.title}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.subitems ? (
                      <Collapsible defaultOpen={isParentActive(item)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "w-full justify-between group",
                              isParentActive(item) && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5" />
                              {!collapsed && <span>{item.title}</span>}
                            </div>
                            {!collapsed && (
                              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subitems.map((subitem) => (
                                <SidebarMenuSubItem key={subitem.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(subitem.url)}
                                    className="h-auto whitespace-normal py-1.5"
                                  >
                                    <NavLink to={subitem.url}>
                                      {subitem.title}
                                    </NavLink>
                                  </SidebarMenuSubButton>
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
                          {!collapsed && <span>{item.title}</span>}
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
              Ir para Loja
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
