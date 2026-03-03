import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Consultor, LancamentoDiario, MesConfig, ForecastDailyNote } from "@/types/crm/forecast";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useForecast = (ano: number, mes: number) => {
    const queryClient = useQueryClient();
    const { user, roles } = useAuth();

    const canViewAll = roles.some(role =>
        ['admin', 'sales_manager', 'finance_manager'].includes(role)
    );

    // 1. Fetch Config do Mês
    const { data: employeeData } = useQuery({
        queryKey: ["employee_profile", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await supabase
                .from("employees")
                .select("nome")
                .eq("user_id", user.id)
                .maybeSingle();
            if (error) return null;
            return data;
        },
        enabled: !!user?.id
    });

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
        },
        select: (data) => {
            if (canViewAll) return data;
            const allowedConsultorIds = consultores.map(c => String(c.id));
            return data.filter(l => allowedConsultorIds.includes(String(l.consultor_id)));
        }
    });

    // 4. Fetch Notas Diárias
    const { data: dailyNotes = [] } = useQuery({
        queryKey: ["daily_notes", ano, mes],
        queryFn: async () => {
            const startDate = format(startOfMonth(new Date(ano, mes - 1)), "yyyy-MM-dd");
            const endDate = format(endOfMonth(new Date(ano, mes - 1)), "yyyy-MM-dd");

            const { data, error } = await supabase
                .from("forecast_daily_notes")
                .select("*")
                .gte("data", startDate)
                .lte("data", endDate);

            if (error) {
                console.warn("Erro daily_notes", error);
                return [] as ForecastDailyNote[];
            }
            return data as ForecastDailyNote[];
        },
        select: (data) => {
            if (canViewAll) return data;
            // Notes are generally global for the day in this context (ForecastDailyNote), 
            // but if there's any user association, it would go here.
            // For now, if we want to isolate notes too, we'd need a way to link notes to consultants.
            // If notes are meant to be shared between the manager and the consultant:
            return data;
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

    const updateLancamento = useMutation({
        mutationFn: async (payload: { consultor_id: string, data: string, valor?: number, valor_meta?: number, etiqueta?: string }) => {
            // Find existing entry in cache to avoid nulling out fields during upsert
            const currentData = queryClient.getQueryData<LancamentoDiario[]>(["lancamentos", ano, mes]) || [];
            const existing = currentData.find(l =>
                String(l.consultor_id) === String(payload.consultor_id) &&
                String(l.data).startsWith(payload.data)
            );

            const { data, error } = await supabase
                .from("lancamentos_diarios")
                .upsert({
                    consultor_id: payload.consultor_id,
                    data: payload.data,
                    valor: payload.valor !== undefined ? payload.valor : existing?.valor,
                    valor_meta: payload.valor_meta !== undefined ? payload.valor_meta : existing?.valor_meta,
                    etiqueta: payload.etiqueta !== undefined ? payload.etiqueta : existing?.etiqueta,
                }, { onConflict: 'consultor_id,data' })
                .select();

            if (error) {
                console.error("Mutation Error:", error);
                throw error;
            }
            return data;
        },
        onMutate: async (newEntry) => {
            await queryClient.cancelQueries({ queryKey: ["lancamentos", ano, mes] });
            const previousLancamentos = queryClient.getQueryData(["lancamentos", ano, mes]);

            queryClient.setQueryData(["lancamentos", ano, mes], (old: any[] = []) => {
                const existingIndex = old.findIndex(l =>
                    String(l.consultor_id) === String(newEntry.consultor_id) &&
                    String(l.data).startsWith(newEntry.data)
                );

                if (existingIndex > -1) {
                    const updated = [...old];
                    updated[existingIndex] = { ...updated[existingIndex], ...newEntry };
                    return updated;
                }
                return [...old, { ...newEntry, id: Math.random().toString() }];
            });

            return { previousLancamentos };
        },
        onError: (err: any, newEntry, context: any) => {
            if (context?.previousLancamentos) {
                queryClient.setQueryData(["lancamentos", ano, mes], context.previousLancamentos);
            }
            toast.error("Erro ao salvar: " + (err.message || "Verifique sua conexão"));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["lancamentos", ano, mes] });
        }
    });

    // Mutation: Upsert Nota Diária
    const updateDateNote = useMutation({
        mutationFn: async (payload: { data: string, nota: string }) => {
            const { data, error } = await supabase
                .from("forecast_daily_notes")
                .upsert({
                    data: payload.data,
                    nota: payload.nota,
                }, { onConflict: 'data' })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["daily_notes", ano, mes] });
        },
        onError: (err: any) => {
            toast.error("Erro ao salvar nota: " + (err.message || "Verifique sua conexão"));
        }
    });

    const identifiedConsultorName = useMemo(() => {
        // Preferred order: Employee Profile > Metadata > Email Fallback > Consultant Table
        if (employeeData?.nome) return employeeData.nome;

        const metadata = user?.user_metadata || {};
        const metadataName = metadata.full_name || metadata.name || metadata.display_name || metadata.preferred_username;
        if (metadataName) return metadataName;

        // Fallback: Extrair nome do e-mail (ex: joao.silva@... -> JOAO)
        if (user?.email) {
            const emailPart = user.email.split('@')[0];
            const namePart = emailPart.split('.')[0];
            const candidate = namePart.toUpperCase();
            if (candidate && candidate !== 'ADMIN' && candidate !== 'USER') {
                return candidate;
            }
        }

        const loggedInConsultor = consultores.find(c => c.email?.toLowerCase() === user?.email?.toLowerCase());
        if (loggedInConsultor) return loggedInConsultor.nome;

        if (canViewAll) return "ADMINISTRAÇÃO";
        return "VISITANTE";
    }, [canViewAll, consultores, user, employeeData]);

    return {
        mesConfig,
        consultores,
        lancamentos,
        dailyNotes,
        identifiedConsultorName,
        updateConfig,
        updateLancamento,
        updateDateNote,
        isLoading: isLoadingConfig,
        canViewAll
    };
};
