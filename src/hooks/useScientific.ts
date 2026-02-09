
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScientificPresentation {
    id: string;
    created_at: string;
    title: string;
    description?: string;
    file_url: string;
    category: string;
    speaker?: string;
    presentation_date: string;
    created_by?: string;
    active: boolean;
}

export function useScientific() {
    const queryClient = useQueryClient();

    const { data: presentations, isLoading, error } = useQuery({
        queryKey: ['scientific_presentations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('scientific_presentations')
                .select('*')
                .eq('active', true)
                .order('presentation_date', { ascending: false });

            if (error) throw error;
            return data as ScientificPresentation[];
        },
    });

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `presentations/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('scientific-files')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('scientific-files')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const createPresentation = useMutation({
        mutationFn: async (presentation: Omit<ScientificPresentation, 'id' | 'created_at' | 'active'>) => {
            const { data, error } = await supabase
                .from('scientific_presentations')
                .insert(presentation)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scientific_presentations'] });
            toast.success('Apresentação enviada com sucesso');
        },
        onError: (error: any) => {
            toast.error('Erro ao enviar apresentação: ' + error.message);
        },
    });

    const deletePresentation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('scientific_presentations')
                .update({ active: false })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scientific_presentations'] });
            toast.success('Apresentação removida');
        },
    });

    return { presentations, isLoading, error, createPresentation, deletePresentation, uploadFile };
}
