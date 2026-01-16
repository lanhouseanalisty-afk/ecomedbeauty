import { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-card px-4 py-4"
    >
      <div className="flex items-end gap-3 rounded-2xl border border-border bg-background p-2 shadow-card transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-soft">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Anexar arquivo"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          rows={1}
          className={cn(
            "max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          )}
        />

        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
            message.trim() && !isLoading
              ? "bg-primary text-primary-foreground shadow-soft hover:bg-rose-gold-dark"
              : "bg-muted text-muted-foreground"
          )}
          aria-label="Enviar mensagem"
        >
          <Send className={cn("h-5 w-5", isLoading && "animate-pulse")} />
        </button>
      </div>
      
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Assistente MedBeauty • Atendimento 24h
      </p>
    </form>
  );
}
