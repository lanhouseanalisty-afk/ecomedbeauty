import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['fin_invoices']['Row'];
type Payment = Database['public']['Tables']['fin_payments']['Row'];

export function useInvoices() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['fin_invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fin_invoices')
        .select('*')
        .order('due_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Database['public']['Tables']['fin_invoices']['Insert']) => {
      const { data, error } = await supabase
        .from('fin_invoices')
        .insert(invoice)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fin_invoices'] });
      toast.success('Fatura criada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar fatura: ' + error.message);
    },
  });

  return { invoices, isLoading, error, createInvoice };
}

export function usePayments() {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['fin_payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fin_payments')
        .select(`
          *,
          invoice:fin_invoices(invoice_number)
        `)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return { payments, isLoading, error };
}

export function useFinancialAccounts() {
  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['financial_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return { accounts, isLoading, error };
}

export function useCostCenters() {
  const { data: costCenters, isLoading, error } = useQuery({
    queryKey: ['cost_centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select(`
          *,
          department:departments(name)
        `)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return { costCenters, isLoading, error };
}

export function useFinancialStats() {
  return useQuery({
    queryKey: ['financial_stats'],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from('fin_invoices')
        .select('type, status, total');

      if (error) throw error;

      const receivable = invoices
        ?.filter(i => i.type === 'receivable' && i.status !== 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0) || 0;

      const payable = invoices
        ?.filter(i => i.type === 'payable' && i.status !== 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0) || 0;

      const overdue = invoices
        ?.filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + (i.total || 0), 0) || 0;

      return {
        receivable,
        payable,
        balance: receivable - payable,
        overdue,
      };
    },
  });
}
