import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  User, 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Edit,
  Trash,
  Plus,
  LucideIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'email' | 'call' | 'meeting' | 'note' | 'task' | 'status';
  title: string;
  description?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxHeight?: string;
  showUser?: boolean;
}

const activityIcons: Record<Activity['type'], LucideIcon> = {
  create: Plus,
  update: Edit,
  delete: Trash,
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: MessageSquare,
  task: CheckCircle,
  status: AlertCircle,
};

const activityColors: Record<Activity['type'], string> = {
  create: "bg-success/10 text-success border-success/20",
  update: "bg-info/10 text-info border-info/20",
  delete: "bg-destructive/10 text-destructive border-destructive/20",
  email: "bg-primary/10 text-primary border-primary/20",
  call: "bg-warning/10 text-warning border-warning/20",
  meeting: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  note: "bg-muted text-muted-foreground border-muted-foreground/20",
  task: "bg-success/10 text-success border-success/20",
  status: "bg-info/10 text-info border-info/20",
};

export function ActivityTimeline({ 
  activities, 
  maxHeight = "400px",
  showUser = true 
}: ActivityTimelineProps) {
  if (!activities?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`pr-4`} style={{ maxHeight }}>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <div key={activity.id} className="relative pl-10">
                <div className={cn(
                  "absolute left-2 -translate-x-1/2 p-1.5 rounded-full border",
                  colorClass
                )}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{activity.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  {showUser && activity.user && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
