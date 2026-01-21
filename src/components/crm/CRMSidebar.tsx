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
  Store
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
          { title: "Configurações", url: "/crm/admin/configuracoes" },
          { title: "DocuSign", url: "/crm/admin/docusign" },
        ],
      },
      {
        title: "RH",
        icon: Users,
        url: "/crm/rh",
        subitems: [
          { title: "Dashboard", url: "/crm/rh" },
          { title: "Funcionários", url: "/crm/rh/funcionarios" },
          { title: "Admissão", url: "/crm/rh/admissao" },
          { title: "Demissão", url: "/crm/rh/demissao" },
          { title: "Cargos", url: "/crm/rh/cargos" },
          { title: "Ponto", url: "/crm/rh/ponto" },
          { title: "Férias", url: "/crm/rh/ferias" },
          { title: "Treinamentos", url: "/crm/rh/treinamentos" },
          { title: "DocuSign", url: "/crm/rh/docusign" },
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
          { title: "DocuSign", url: "/crm/financeiro/docusign" },
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
          { title: "Promoções", url: "/crm/marketing/promocoes" },
          { title: "Assets", url: "/crm/marketing/assets" },
          { title: "Performance", url: "/crm/marketing/performance" },
          { title: "DocuSign", url: "/crm/marketing/docusign" },
        ],
      },
      {
        title: "Comercial",
        icon: Handshake,
        url: "/crm/comercial",
        subitems: [
          { title: "Dashboard", url: "/crm/comercial" },
          { title: "Admissão", url: "/crm/comercial/admissao" },
          { title: "Leads", url: "/crm/comercial/leads" },
          { title: "Contatos", url: "/crm/comercial/contatos" },
          { title: "Contas", url: "/crm/comercial/contas" },
          { title: "Oportunidades", url: "/crm/comercial/oportunidades" },
          { title: "Pipeline", url: "/crm/comercial/pipeline" },
          { title: "DocuSign", url: "/crm/comercial/docusign" },
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
          { title: "DocuSign", url: "/crm/logistica/docusign" },
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
          { title: "DocuSign", url: "/crm/juridico/docusign" },
        ],
      },
      {
        title: "Tech / Suporte",
        icon: Headphones,
        url: "/crm/tech",
        subitems: [
          { title: "Dashboard", url: "/crm/tech" },
          { title: "Admissão", url: "/crm/tech/admissao" },
          { title: "Tickets", url: "/crm/tech/tickets" },
          { title: "Base de Conhecimento", url: "/crm/tech/kb" },
          { title: "SLAs", url: "/crm/tech/slas" },
          { title: "DocuSign", url: "/crm/tech/docusign" },
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
          { title: "Cupons", url: "/crm/ecommerce/cupons" },
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
                              "w-full justify-between",
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
