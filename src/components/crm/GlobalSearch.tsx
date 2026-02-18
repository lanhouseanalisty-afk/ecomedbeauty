
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    FileText,
    User,
    FlaskConical,
    Ticket,
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    Package,
    Megaphone,
} from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const pages = [
    { title: "Dashboard Principal", url: "/crm", icon: LayoutDashboard },

    { title: "Mural de Avisos", url: "/crm/intranet", icon: Megaphone },
    { title: "Biblioteca Interna", url: "/crm/biblioteca", icon: FileText },
    { title: "Administração", url: "/crm/admin", icon: Building2 },
    { title: "Científica", url: "/crm/cientifica", icon: FlaskConical },
    { title: "E-commerce", url: "/crm/ecommerce", icon: Package },
    { title: "TI Support / Chamados", url: "/crm/tech/tickets", icon: Ticket },
    { title: "Configurações", url: "/crm/admin/configuracoes", icon: Settings },
];

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const { data: collaborators } = useQuery({
        queryKey: ["global-search-collaborators"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, email, avatar_url")
                .limit(10);
            if (error) throw error;
            return data;
        },
        enabled: open,
    });

    const { data: presentations } = useQuery({
        queryKey: ["global-search-presentations"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("scientific_presentations")
                .select("id, title, category, speaker")
                .eq("active", true)
                .limit(5);
            if (error) throw error;
            return data;
        },
        enabled: open,
    });

    const { data: tickets } = useQuery({
        queryKey: ["global-search-tickets"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tickets")
                .select("id, title, ticket_number, status")
                .order("created_at", { ascending: false })
                .limit(5);
            if (error) throw error;
            return data;
        },
        enabled: open,
    });

    const onSelect = (url: string) => {
        setOpen(false);
        navigate(url);
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="O que você está procurando? (Páginas, Pessoas, Tickets...)" />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                <CommandGroup heading="Ações / Páginas">
                    {pages.map((page) => (
                        <CommandItem key={page.url} onSelect={() => onSelect(page.url)}>
                            <page.icon className="mr-2 h-4 w-4" />
                            <span>{page.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                {collaborators && collaborators.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Colaboradores">
                            {collaborators.map((person) => (
                                <CommandItem key={person.id} onSelect={() => onSelect(`/crm/rh/perfil/${person.id}`)}>
                                    <User className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{person.full_name || "Sem Nome"}</span>
                                        <span className="text-[10px] text-muted-foreground">{person.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {presentations && presentations.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Apresentações Científicas">
                            {presentations.map((pres) => (
                                <CommandItem key={pres.id} onSelect={() => onSelect(`/crm/cientifica/apresentacoes`)}>
                                    <FlaskConical className="mr-2 h-4 w-4 text-primary" />
                                    <div className="flex items-center gap-2">
                                        <span>{pres.title}</span>
                                        <Badge variant="outline" className="text-[9px] h-4 py-0">{pres.category}</Badge>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {tickets && tickets.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Chamados / Suporte">
                            {tickets.map((ticket) => (
                                <CommandItem key={ticket.id} onSelect={() => onSelect(`/crm/tech/tickets`)}>
                                    <Ticket className="mr-2 h-4 w-4 text-orange-500" />
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs">{ticket.ticket_number || ticket.id.slice(0, 8)}</span>
                                        <span className="flex-1 truncate">{ticket.title}</span>
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] h-4 py-0 ${ticket.status === 'open' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50'
                                                }`}
                                        >
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

            </CommandList>
        </CommandDialog>
    );
}
