import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row'];
type Promotion = Database['public']['Tables']['marketing_promotions']['Row'];

export function useCampaigns() {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['marketing_campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: Database['public']['Tables']['marketing_campaigns']['Insert']) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert(campaign)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_campaigns'] });
      toast.success('Campanha criada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar campanha: ' + error.message);
    },
  });

  return { campaigns, isLoading, error, createCampaign };
}

export function usePromotions() {
  const { data: promotions, isLoading, error } = useQuery({
    queryKey: ['marketing_promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_promotions')
        .select(`
          *,
          campaign:marketing_campaigns(name)
        `)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return { promotions, isLoading, error };
}

export function useMarketingAssets() {
  const { data: assets, isLoading, error } = useQuery({
    queryKey: ['marketing_assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_assets')
        .select(`
          *,
          campaign:marketing_campaigns(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return { assets, isLoading, error };
}

export function useMarketingStats() {
  return useQuery({
    queryKey: ['marketing_stats'],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from('marketing_campaigns')
        .select('status, budget, spent');

      if (error) throw error;

      const active = campaigns?.filter(c => c.status === 'active').length || 0;
      const totalBudget = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
      const totalSpent = campaigns?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0;

      return { active, totalBudget, totalSpent, total: campaigns?.length || 0 };
    },
  });
}
