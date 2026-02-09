
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Check,
    Clock,
    Ticket,
    UserPlus,
    MessageSquare,
    AlertCircle,
    ExternalLink,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
    id: string;
    created_at: string;
    user_id: string;
    title: string;
    description: string | null;
    type: string;
    link: string | null;
    is_read: boolean;
    metadata: any;
}

export function NotificationCenter() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["system-notifications", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(30);

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!user,
    });

    useEffect(() => {
        const unread = notifications.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
    }, [notifications]);

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`user-notifications-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ["system-notifications", user.id] });
                    const newNotif = payload.new as Notification;

                    toast(newNotif.title, {
                        description: newNotif.description,
                        action: newNotif.link ? {
                            label: "Ver",
                            onClick: () => {
                                markAsRead.mutate(newNotif.id);
                                navigate(newNotif.link!);
                            }
                        } : undefined
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-notifications", user?.id] });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            if (!user) return;
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-notifications", user?.id] });
            toast.success("Todas as notificações foram lidas");
        },
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'ticket': return <Ticket className="h-4 w-4 text-orange-500" />;
            case 'admission': return <UserPlus className="h-4 w-4 text-blue-500" />;
            case 'request': return <MessageSquare className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default: return <Bell className="h-4 w-4 text-primary" />;
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.is_read) markAsRead.mutate(n.id);
        if (n.link) navigate(n.link);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] animate-pulse"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notificações</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] h-7 px-2"
                            onClick={() => markAllAsRead.mutate()}
                        >
                            Marcar lidas
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">Carregando...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                        <Bell className="h-8 w-8 text-muted/30" />
                        <span className="text-xs text-muted-foreground">Tudo limpo por aqui!</span>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer border-b last:border-0 ${!n.is_read ? "bg-primary/5" : "opacity-70"
                                    }`}
                                onClick={() => handleNotificationClick(n)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    {getIcon(n.type)}
                                    <span className={`flex-1 truncate text-sm ${!n.is_read ? "font-semibold" : ""}`}>
                                        {n.title}
                                    </span>
                                    {!n.is_read && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}
                                </div>
                                {n.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                                        {n.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between w-full mt-1 pl-6">
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                <DropdownMenuSeparator />
                <Button variant="ghost" className="w-full text-xs h-10 rounded-none text-muted-foreground">
                    Ver todas notificações
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
