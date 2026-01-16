import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Clock, User, ExternalLink } from "lucide-react";
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

interface AdmissionNotification {
  id: string;
  admission_process_id: string;
  target_step: string;
  target_email: string | null;
  target_department: string;
  notification_type: string;
  status: string;
  sent_at: string | null;
  read_at: string | null;
  link_token: string;
  metadata: Record<string, any> | null;
  created_at: string;
  admission_processes?: {
    employee_name: string;
    position: string;
    current_step: string;
  };
}

const stepLabels: Record<string, string> = {
  gestor: "Gestor",
  ti: "TI",
  colaborador: "Colaborador",
};

interface AdmissionNotificationsProps {
  departmentSlug?: string;
}

export default function AdmissionNotifications({ departmentSlug }: AdmissionNotificationsProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["admission-notifications", departmentSlug],
    queryFn: async () => {
      let query = supabase
        .from("admission_notifications")
        .select(`
          *,
          admission_processes (
            employee_name,
            position,
            current_step
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (departmentSlug) {
        query = query.eq("target_department", departmentSlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdmissionNotification[];
    },
  });

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read_at).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Subscribe to realtime notifications
  useEffect(() => {
    const channel = supabase
      .channel("admission-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admission_notifications",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["admission-notifications"] });
          
          const newNotification = payload.new as AdmissionNotification;
          if (!departmentSlug || newNotification.target_department === departmentSlug) {
            toast.info("Nova notificação de admissão", {
              description: `Etapa ${stepLabels[newNotification.target_step] || newNotification.target_step} pendente`,
              action: {
                label: "Ver",
                onClick: () => handleNotificationClick(newNotification),
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [departmentSlug, queryClient]);

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("admission_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission-notifications"] });
    },
  });

  const handleNotificationClick = (notification: AdmissionNotification) => {
    // Mark as read
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to the appropriate page
    const step = notification.target_step;
    const dept = notification.target_department;
    
    if (step === "gestor") {
      navigate(`/crm/${dept}/admissao?process=${notification.admission_process_id}`);
    } else if (step === "ti") {
      navigate(`/crm/tech/admissao?process=${notification.admission_process_id}`);
    } else if (step === "colaborador") {
      navigate(`/crm/admissao/colaborador?process=${notification.admission_process_id}`);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    
    for (const id of unreadIds) {
      await markAsRead.mutateAsync(id);
    }
    
    toast.success("Todas notificações marcadas como lidas");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações de Admissão</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhuma notificação
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                !notification.read_at ? "bg-primary/5" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center gap-2 w-full">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium flex-1 truncate">
                  {notification.admission_processes?.employee_name || "Novo colaborador"}
                </span>
                {!notification.read_at && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                <Clock className="h-3 w-3" />
                <span>
                  Etapa: {stepLabels[notification.target_step] || notification.target_step}
                </span>
                <span className="ml-auto">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver todas notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
