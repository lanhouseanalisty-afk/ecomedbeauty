import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  category?: { name: string };
  requester?: { full_name: string; email: string; avatar_url: string | null };
};
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];

export function useTickets() {
  const queryClient = useQueryClient();

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          category:ticket_categories(name),
          requester:profiles(full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createTicket = useMutation({
    mutationFn: async (ticket: TicketInsert) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar ticket: ' + error.message);
    },
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, status, ...data }: Partial<Ticket> & { id: string }) => {
      // 1. Update the ticket
      const { data: updated, error } = await supabase
        .from('tickets')
        .update({ ...data, ...(status ? { status } : {}) })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar ticket: ' + error.message);
    },
  });

  return { tickets, isLoading, error, createTicket, updateTicket };
}

export function useTicketCategories() {
  return useQuery({
    queryKey: ['ticket_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}

export function useKBArticles() {
  return useQuery({
    queryKey: ['kb_articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['ticket_stats'],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('status, priority');

      if (error) throw error;

      const open = tickets?.filter(t => t.status === 'open').length || 0;
      const inProgress = tickets?.filter(t => t.status === 'in_progress').length || 0;
      const resolved = tickets?.filter(t => t.status === 'resolved').length || 0;
      const critical = tickets?.filter(t => t.priority === 'critical').length || 0;

      return { open, inProgress, resolved, critical, total: tickets?.length || 0 };
    },
  });
}

export function useTicketMessages(ticketId: string | null) {
  return useQuery({
    queryKey: ['ticket_messages', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
    refetchInterval: 5000, // Polling for real-time for now
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticket_id, content, user_id }: { ticket_id: string, content: string, user_id: string }) => {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id,
          content,
          user_id
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket_messages', variables.ticket_id] });
      toast.success('Mensagem enviada');
    },
    onError: (error) => {
      toast.error('Erro ao enviar mensagem: ' + error.message);
    }
  });
}

export function useTechTeam() {
  return useQuery({
    queryKey: ['tech_team'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['tech_support', 'admin', 'tech']);

      if (rolesError) throw rolesError;

      const userIds = [...new Set(roles.map(r => r.user_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      return profiles;
    },
  });
}

export function useTicketHistory(ticketId: string | null) {
  return useQuery({
    queryKey: ['ticket_history', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      const { data, error } = await supabase
        .from('ticket_history')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });
}

// --- TECH ASSETS (Controle de Ativos) ---

export interface TechAsset {
  id: string;
  asset_tag: string;
  serial_number?: string;
  model: string;
  brand: string;
  device_type: 'notebook' | 'tablet' | 'smartphone' | 'monitor' | 'peripherals' | 'other';
  status: 'available' | 'in_use' | 'maintenance' | 'broken' | 'retired' | 'lost';
  assigned_to?: string;
  assigned_to_name?: string;
  location?: string;
  purchase_date?: string;
  warranty_expiration?: string;
  specifications?: Record<string, any>;
  notes?: string;
  modified_after_admission?: boolean;
  created_at?: string;
}

export function useTechAssets() {
  const queryClient = useQueryClient();

  const { data: assets, isLoading } = useQuery({
    queryKey: ['tech_assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tech_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as TechAsset[];
    },
  });

  const createAsset = useMutation({
    mutationFn: async (asset: Omit<TechAsset, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tech_assets')
        .upsert(asset as any, { onConflict: 'asset_tag' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech_assets'] });
      toast.success('Ativo salvo com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao salvar ativo: ' + error.message);
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TechAsset> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('tech_assets')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech_assets'] });
      toast.success('Ativo atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar ativo: ' + error.message);
    },
  });

  return { assets, isLoading, createAsset, updateAsset };
}
