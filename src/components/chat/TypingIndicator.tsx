import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3 animate-fade-in-up">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-gold to-rose-gold-dark shadow-soft">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-card px-4 py-3 shadow-card">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
