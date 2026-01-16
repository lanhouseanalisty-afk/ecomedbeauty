import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Ticket = Database['public']['Tables']['tickets']['Row'];
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
          category:ticket_categories(name)
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
    mutationFn: async ({ id, ...data }: Partial<Ticket> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('tickets')
        .update(data)
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
