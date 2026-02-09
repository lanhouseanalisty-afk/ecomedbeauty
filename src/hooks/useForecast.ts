import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Consultor, MesConfig, LancamentoDiario } from "@/types/crm/forecast";
import { useAuth } from "@/contexts/AuthContext";
import { ptBR } from "date-fns/locale";
import { Consultor, LancamentoDiario, MesConfig, ConsultorMonthData } from "@/types/crm/forecast";

export const useForecast = (ano: number, mes: number) => {
    const queryClient = useQueryClient();
    const { user, roles } = useAuth();

    const canViewAll = roles.some(role =>
        ['admin', 'sales_manager', 'finance_manager'].includes(role)
    );

    // 1. Fetch Config do Mês
    const { data: mesConfig, isLoading: isLoadingConfig } = useQuery({
        queryKey: ["forecast_config", ano, mes],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("mes_configs")
                .select("*")
                .eq("ano", ano)
                .eq("mes", mes)
                .maybeSingle();

            if (error) throw error;
            return data as MesConfig | null;
        }
    });

    // Fetch Consultores
    const { data: consultores = [], isLoading: isLoadingConsultores } = useQuery({
        queryKey: ["consultores"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("consultores")
                .select("*")
                .eq("ativo", true)
                .order("nome");
            if (error) throw error;
            return data as Consultor[];
        },
        select: (data) => {
            if (canViewAll) return data;
            if (!user?.email) return [];
            return data.filter(c => c.email?.toLowerCase() === user.email?.toLowerCase());
        }
    });

    // 3. Fetch Lançamentos
    const { data: lancamentos = [] } = useQuery({
        queryKey: ["lancamentos", ano, mes],
        queryFn: async () => {
            const startDate = format(startOfMonth(new Date(ano, mes - 1)), "yyyy-MM-dd");
            const endDate = format(endOfMonth(new Date(ano, mes - 1)), "yyyy-MM-dd");

            const { data, error } = await supabase
                .from("lancamentos_diarios")
                .select("*")
                .gte("data", startDate)
                .lte("data", endDate);

            if (error) {
                console.warn("Erro lancamentos", error);
                return [] as LancamentoDiario[];
            }
            return data as LancamentoDiario[];
        }
    });

    // Mutation: Upsert Config
    const updateConfig = useMutation({
        mutationFn: async (newConfig: Partial<MesConfig>) => {
            const { data, error } = await supabase
                .from("mes_configs")
                .upsert({ ...newConfig, ano, mes })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forecast_config", ano, mes] });
        }
    });

    // Mutation: Upsert Lançamento
    const updateLancamento = useMutation({
        mutationFn: async (payload: { consultor_id: string, data: string, valor?: number, valor_meta?: number, etiqueta?: string }) => {
            // First try to select to get existing values if we are doing partial (optional safety, or just rely on UI sending both)
            // Actually, standard Pattern: UI sends merged state.

            const { data, error } = await supabase
                .from("lancamentos_diarios")
                .upsert({
                    consultor_id: payload.consultor_id,
                    data: payload.data,
                    valor: payload.valor,
                    valor_meta: payload.valor_meta,
                    etiqueta: payload.etiqueta,
                    ano: parseInt(payload.data.split('-')[0]),
                    mes: parseInt(payload.data.split('-')[1]),
                }, { onConflict: 'consultor_id,data' })
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lancamentos", ano, mes] });
        }
    });

    return {
        mesConfig,
        consultores,
        lancamentos,
        updateConfig,
        updateLancamento,
        isLoading: isLoadingConfig
    };
};
