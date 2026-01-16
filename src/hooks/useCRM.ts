import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['crm_leads']['Row'];
type LeadInsert = Database['public']['Tables']['crm_leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['crm_leads']['Update'];

type Contact = Database['public']['Tables']['crm_contacts']['Row'];
type Account = Database['public']['Tables']['crm_accounts']['Row'];
type Opportunity = Database['public']['Tables']['crm_opportunities']['Row'];

export function useLeads() {
  const queryClient = useQueryClient();

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['crm_leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createLead = useMutation({
    mutationFn: async (lead: LeadInsert) => {
      const { data, error } = await supabase
        .from('crm_leads')
        .insert(lead)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_leads'] });
      toast.success('Lead cadastrado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar lead: ' + error.message);
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...data }: LeadUpdate & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('crm_leads')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_leads'] });
      toast.success('Lead atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar lead: ' + error.message);
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_leads'] });
      toast.success('Lead removido com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao remover lead: ' + error.message);
    },
  });

  return {
    leads,
    isLoading,
    error,
    createLead,
    updateLead,
    deleteLead,
  };
}

export function useContacts() {
  const queryClient = useQueryClient();

  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['crm_contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select(`
          *,
          account:crm_accounts(name)
        `)
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
  });

  return { contacts, isLoading, error };
}

export function useAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['crm_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_accounts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return { accounts, isLoading, error };
}

export function useOpportunities() {
  const queryClient = useQueryClient();

  const { data: opportunities, isLoading, error } = useQuery({
    queryKey: ['crm_opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_opportunities')
        .select(`
          *,
          account:crm_accounts(name),
          contact:crm_contacts(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return { opportunities, isLoading, error };
}

export function usePipelines() {
  return useQuery({
    queryKey: ['crm_pipelines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_pipelines')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });
}
