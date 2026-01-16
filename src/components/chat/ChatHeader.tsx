import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose?: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-border bg-card px-4 py-4">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-rose-gold-light/10 via-transparent to-sage/10" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo/Avatar */}
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-gold to-rose-gold-dark shadow-soft">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
          </div>
          
          {/* Brand info */}
          <div className="flex flex-col">
            <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground">
              MedBeauty
            </h1>
            <p className="text-xs text-muted-foreground">
              Assistente com IA
            </p>
          </div>
        </div>

        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
