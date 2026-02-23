import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { useDepartments as useGlobalDepartments } from './useDepartments';

type Employee = Database['public']['Tables']['employees']['Row'];
type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          department:departments(name),
          position:positions(title)
        `)
        .neq('status', 'terminated')
        .order('full_name');

      if (error) throw error;
      return data;
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário cadastrado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar funcionário: ' + error.message);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...data }: EmployeeUpdate & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar funcionário: ' + error.message);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário removido com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao remover funcionário: ' + error.message);
    },
  });

  return {
    employees,
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

// Re-exporting from global hook to maintain backward compatibility but use consolidated logic
export const useDepartments = useGlobalDepartments;

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (error) throw error;
      return data;
    },
  });
}
