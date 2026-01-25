import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketingRequest {
    id?: string;
    request_id: string;
    event_name: string;
    consultant_name: string;
    regional_manager: string;
    event_date: string;
    kit_type: string;
    has_thread_order: boolean;
    bonus_order_number?: string;
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    extra_materials?: string;
    status?: string;
    approver_id?: string;
    approver_name?: string;
    notes?: string;
    created_at?: string;
}

export function useMarketingRequest() {
    const [loading, setLoading] = useState(false);

    const generateRequestId = (): string => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        return `MKT-${year}${month}${day}-${random}`;
    };

    const createRequest = async (data: Omit<MarketingRequest, 'request_id' | 'id' | 'created_at' | 'status'>) => {
        setLoading(true);
        try {
            const requestId = generateRequestId();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const requestData = {
                request_id: requestId,
                event_name: data.event_name,
                consultant_name: data.consultant_name,
                regional_manager: data.regional_manager,
                event_date: data.event_date,
                kit_type: data.kit_type,
                has_thread_order: data.has_thread_order,
                bonus_order_number: data.bonus_order_number || null,
                cep: data.cep,
                street: data.street,
                number: data.number,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                extra_materials: data.extra_materials || null,
                approver_id: data.approver_id || null,
                approver_name: data.approver_name || null,
                status: 'approved',
                created_by: user.id,
            };

            const { data: result, error } = await supabase
                .from('marketing_requests')
                .insert(requestData)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            toast.success(`Solicitação criada com sucesso! ID: ${requestId}`);
            return { success: true, data: result, requestId };
        } catch (error) {
            console.error('Error creating request:', error);
            toast.error('Erro ao criar solicitação');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const getRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('marketing_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Erro ao buscar solicitações');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const getRequestById = async (requestId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('marketing_requests')
                .select('*')
                .eq('request_id', requestId)
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching request:', error);
            toast.error('Erro ao buscar solicitação');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const getMyRequests = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await supabase
                .from('marketing_requests')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching my requests:', error);
            toast.error('Erro ao buscar suas solicitações');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const getAllRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('marketing_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching all requests:', error);
            toast.error('Erro ao buscar solicitações');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const getMyApprovalsRequests = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await supabase
                .from('marketing_requests')
                .select('*')
                .eq('approver_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching approval requests:', error);
            toast.error('Erro ao buscar solicitações para aprovação');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id: string, status: string, notes?: string) => {
        setLoading(true);
        try {
            const updateData: any = { status };

            if (notes) {
                updateData.notes = notes;
            }

            const { data, error } = await supabase
                .from('marketing_requests')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const statusMessages: Record<string, string> = {
                approved: 'Solicitação aprovada com sucesso!',
                rejected: 'Solicitação rejeitada',
                in_progress: 'Solicitação marcada como em andamento',
                completed: 'Solicitação concluída',
            };

            toast.success(statusMessages[status] || 'Status atualizado com sucesso!');
            return { success: true, data };
        } catch (error) {
            console.error('Error updating request status:', error);
            toast.error('Erro ao atualizar status');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const deleteRequest = async (id: string) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('marketing_requests')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Solicitação excluída com sucesso!');
            return { success: true };
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('Erro ao excluir solicitação');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createRequest,
        getRequests,
        getRequestById,
        getMyRequests,
        getAllRequests,
        getMyApprovalsRequests,
        updateRequestStatus,
        deleteRequest,
        generateRequestId
    };
}
