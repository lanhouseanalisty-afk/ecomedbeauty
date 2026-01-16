import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import { TypingIndicator } from "./TypingIndicator";
import { ProductGrid, Product } from "./ProductCard";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { useChatSession } from "@/hooks/useChatSession";
import { toast } from "sonner";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  content: `Olá! 👋 Bem-vindo(a) à MedBeauty!

Sou sua assistente virtual com inteligência artificial e estou aqui para ajudá-lo(a) a descobrir nossos produtos de beleza e bem-estar, acompanhar seus pedidos ou esclarecer qualquer dúvida.

Como posso ajudar você hoje?`,
  role: "assistant",
  timestamp: new Date(),
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "i-THREAD",
    description: "Fios de PDO para bioestimulação de colágeno e reposicionamento tecidual. Pioneiro no Brasil.",
    href: "/produto/1",
  },
  {
    id: "2",
    name: "e.p.t.q",
    description: "Preenchedor de ácido hialurônico com conforto e equilíbrio entre firmeza e fluidez.",
    href: "/produto/2",
  },
  {
    id: "3",
    name: "Idebenone Ampoule",
    description: "Tratamento antioxidante premium em ampolas com tecnologia de duas soluções.",
    href: "/produto/3",
  },
  {
    id: "4",
    name: "Nano Cânula",
    description: "Cânulas de alta precisão para procedimentos estéticos minimamente invasivos.",
    href: "/produto/4",
  },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;

interface ChatContainerProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export function ChatContainer({ isFloating = false, onClose }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { saveMessage, loadMessages, isLoading: sessionLoading } = useChatSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showLeadForm]);

  // Load previous messages on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (sessionLoading || hasLoadedHistory) return;
      
      const history = await loadMessages();
      if (history.length > 0) {
        setMessages([WELCOME_MESSAGE, ...history]);
      }
      setHasLoadedHistory(true);
    };

    loadHistory();
  }, [sessionLoading, loadMessages, hasLoadedHistory]);

  const streamAIResponse = async (userContent: string): Promise<string> => {
    const chatMessages = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    chatMessages.push({ role: "user", content: userContent });

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: chatMessages }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Muitas requisições. Aguarde um momento.");
      }
      if (response.status === 402) {
        throw new Error("Limite de uso atingido.");
      }
      throw new Error("Erro ao processar sua mensagem.");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullResponse = "";
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            // Update assistant message in real-time
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last.id === "streaming") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: fullResponse } : m
                );
              }
              return prev;
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return fullResponse;
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setShowLeadForm(false);
    setShowProducts(false);

    // Save user message
    await saveMessage(userMessage);

    // Add placeholder for streaming response
    const streamingMessage: Message = {
      id: "streaming",
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, streamingMessage]);
    setIsTyping(false);

    try {
      const response = await streamAIResponse(content);

      // Replace streaming message with final message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) =>
        prev.map((m) => (m.id === "streaming" ? assistantMessage : m))
      );

      // Save assistant message
      await saveMessage(assistantMessage);

      // Check for product mentions
      const lowerContent = content.toLowerCase();
      const lowerResponse = response.toLowerCase();
      if (
        lowerContent.includes("produto") ||
        lowerContent.includes("conhecer") ||
        lowerResponse.includes("i-thread") ||
        lowerResponse.includes("e.p.t.q")
      ) {
        setShowProducts(true);
      }

      // Check for newsletter intent
      if (
        lowerContent.includes("novidades") ||
        lowerContent.includes("ofertas") ||
        lowerContent.includes("newsletter")
      ) {
        setShowLeadForm(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar mensagem");

      // Remove streaming message on error
      setMessages((prev) => prev.filter((m) => m.id !== "streaming"));
    }
  };

  const handleLeadSuccess = async (name: string) => {
    setShowLeadForm(false);
    
    const thankYouMessage: Message = {
      id: Date.now().toString(),
      content: `Obrigada, ${name}! 🎉

Seu cadastro foi realizado com sucesso. Você receberá nossas novidades e ofertas exclusivas por e-mail.

Posso ajudar com mais alguma coisa?`,
      role: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, thankYouMessage]);
    await saveMessage(thankYouMessage);
  };

  return (
    <div className={`flex flex-col bg-background ${isFloating ? "h-full" : "h-screen"}`}>
      <ChatHeader onClose={onClose} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl py-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}

          {isTyping && <TypingIndicator />}

          {/* Lead capture form */}
          {showLeadForm && !isTyping && (
            <div className="px-4 py-3">
              <LeadCaptureForm
                onClose={() => setShowLeadForm(false)}
                onSuccess={handleLeadSuccess}
                topic="newsletter"
              />
            </div>
          )}

          {/* Show products after relevant message */}
          {showProducts && !isTyping && !showLeadForm && (
            <div className="mt-4">
              <ProductGrid products={SAMPLE_PRODUCTS} />
            </div>
          )}

          {/* Quick actions after welcome */}
          {messages.length === 1 && !isTyping && (
            <QuickActions onActionClick={handleSendMessage} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
      </div>
    </div>
  );
}
