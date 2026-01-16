import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/ChatMessage";

const getSessionId = (): string => {
  let sessionId = localStorage.getItem("medbeauty_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("medbeauty_session_id", sessionId);
  }
  return sessionId;
};

export function useChatSession() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(getSessionId);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or retrieve conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        // Check for existing conversation
        const { data: existing, error: fetchError } = await supabase
          .from("chat_conversations")
          .select("id")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
          setConversationId(existing.id);
        } else {
          // Create new conversation
          const { data: newConvo, error: createError } = await supabase
            .from("chat_conversations")
            .insert({ session_id: sessionId })
            .select("id")
            .single();

          if (createError) throw createError;
          setConversationId(newConvo.id);
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [sessionId]);

  // Save message to database
  const saveMessage = useCallback(
    async (message: Message) => {
      if (!conversationId) return;

      try {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    },
    [conversationId]
  );

  // Load previous messages
  const loadMessages = useCallback(async (): Promise<Message[]> => {
    if (!conversationId) return [];

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as "user" | "assistant",
        timestamp: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }, [conversationId]);

  // Link lead to conversation
  const linkLead = useCallback(
    async (leadId: string) => {
      if (!conversationId) return;

      try {
        await supabase
          .from("chat_conversations")
          .update({ lead_id: leadId })
          .eq("id", conversationId);
      } catch (error) {
        console.error("Error linking lead:", error);
      }
    },
    [conversationId]
  );

  return {
    conversationId,
    sessionId,
    isLoading,
    saveMessage,
    loadMessages,
    linkLead,
  };
}
