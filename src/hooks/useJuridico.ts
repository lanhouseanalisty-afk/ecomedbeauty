import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LegalContract = Database['public']['Tables']['legal_contracts']['Row'];
type LegalCase = Database['public']['Tables']['legal_cases']['Row'];

export function useContracts() {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['legal_contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createContract = useMutation({
    mutationFn: async (contract: Database['public']['Tables']['legal_contracts']['Insert']) => {
      const { data, error } = await supabase
        .from('legal_contracts')
        .insert(contract)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal_contracts'] });
      toast.success('Contrato criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar contrato: ' + error.message);
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Database['public']['Tables']['legal_contracts']['Update']> }) => {
      const { data, error } = await supabase
        .from('legal_contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal_contracts'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar contrato: ' + error.message);
    },
  });

  return { contracts, isLoading, error, createContract, updateContract };
}

export function useLegalCases() {
  const { data: cases, isLoading, error } = useQuery({
    queryKey: ['legal_cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { cases, isLoading, error };
}

export function useComplianceItems() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['compliance_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_items')
        .select('*')
        .order('due_date');

      if (error) throw error;
      return data;
    },
  });

  return { items, isLoading, error };
}

export function useLegalStats() {
  return useQuery({
    queryKey: ['legal_stats'],
    queryFn: async () => {
      const { data: contracts } = await supabase
        .from('legal_contracts')
        .select('status');

      const { data: cases } = await supabase
        .from('legal_cases')
        .select('status');

      const { data: compliance } = await supabase
        .from('compliance_items')
        .select('status');

      const activeContracts = contracts?.filter(c => c.status === 'active').length || 0;
      const expiringContracts = contracts?.filter(c => c.status === 'expired').length || 0;
      const openCases = cases?.filter(c => c.status === 'open' || c.status === 'in_progress').length || 0;
      const compliantItems = compliance?.filter(c => c.status === 'compliant').length || 0;
      const totalCompliance = compliance?.length || 1;

      return {
        activeContracts,
        expiringContracts,
        openCases,
        complianceRate: Math.round((compliantItems / totalCompliance) * 100),
      };
    },
  });
}
