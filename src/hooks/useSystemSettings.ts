import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SystemSetting } from "@/types/systemSettings";

export function useSystemSettings() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("system_settings")
                .select("*")
                .order("category", { ascending: true })
                .order("key", { ascending: true });

            if (error) throw error;
            setSettings(data || []);
        } catch (error: any) {
            console.error("Error fetching settings:", error);
            toast.error("Erro ao carregar configurações");
        } finally {
            setIsLoading(false);
        }
    };

    const getSetting = (key: string): string | null => {
        const setting = settings.find((s) => s.key === key);
        return setting?.value || null;
    };

    const updateSetting = async (key: string, value: string) => {
        try {
            const { error } = await supabase
                .from("system_settings")
                .update({ value, updated_at: new Date().toISOString() })
                .eq("key", key);

            if (error) throw error;

            // Atualizar estado local
            setSettings((prev) =>
                prev.map((s) => (s.key === key ? { ...s, value } : s))
            );

            toast.success("Configuração atualizada com sucesso");
            return true;
        } catch (error: any) {
            console.error("Error updating setting:", error);
            toast.error("Erro ao atualizar configuração");
            return false;
        }
    };

    const createSetting = async (
        key: string,
        value: string,
        description: string,
        category: string = "general"
    ) => {
        try {
            const { data, error } = await supabase
                .from("system_settings")
                .insert([{ key, value, description, category }])
                .select()
                .single();

            if (error) throw error;

            setSettings((prev) => [...prev, data]);
            toast.success("Configuração criada com sucesso");
            return true;
        } catch (error: any) {
            console.error("Error creating setting:", error);
            toast.error("Erro ao criar configuração");
            return false;
        }
    };

    const deleteSetting = async (key: string) => {
        try {
            const { error } = await supabase
                .from("system_settings")
                .delete()
                .eq("key", key);

            if (error) throw error;

            setSettings((prev) => prev.filter((s) => s.key !== key));
            toast.success("Configuração removida com sucesso");
            return true;
        } catch (error: any) {
            console.error("Error deleting setting:", error);
            toast.error("Erro ao remover configuração");
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        settings,
        isLoading,
        getSetting,
        updateSetting,
        createSetting,
        deleteSetting,
        refetch: fetchSettings,
    };
}
