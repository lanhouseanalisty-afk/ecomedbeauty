import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Shipment = Database['public']['Tables']['shipments']['Row'];

export function useShipments() {
  const queryClient = useQueryClient();

  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          carrier:carriers(name, code),
          warehouse:warehouses(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateShipment = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Shipment> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('shipments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Envio atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar envio: ' + error.message);
    },
  });

  return { shipments, isLoading, error, updateShipment };
}

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCarriers() {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          warehouse:warehouses(name)
        `)
        .order('sku');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useLogisticsStats() {
  return useQuery({
    queryKey: ['logistics_stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('status, created_at');

      if (error) throw error;

      const todayShipments = shipments?.filter(s => 
        s.created_at?.startsWith(today)
      ).length || 0;

      const inTransit = shipments?.filter(s => s.status === 'in_transit').length || 0;
      const delivered = shipments?.filter(s => s.status === 'delivered').length || 0;
      const pending = shipments?.filter(s => s.status === 'pending').length || 0;

      return { todayShipments, inTransit, delivered, pending };
    },
  });
}
