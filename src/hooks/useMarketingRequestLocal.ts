import { useState } from 'react';

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
    created_at?: string;
    // Campos de aprovação
    approver_id?: string;
    approver_name?: string;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
}

const STORAGE_KEY = 'marketing_requests';

export function useMarketingRequestLocal() {
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
            const newRequest: MarketingRequest = {
                ...data,
                id: crypto.randomUUID(),
                request_id: requestId,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Buscar requests existentes
            const existing = localStorage.getItem(STORAGE_KEY);
            const requests = existing ? JSON.parse(existing) : [];

            // Adicionar novo
            requests.push(newRequest);

            // Salvar
            localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));

            return { success: true, data: newRequest, requestId };
        } catch (error) {
            console.error('Error creating request:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const getRequests = async () => {
        setLoading(true);
        try {
            const existing = localStorage.getItem(STORAGE_KEY);
            const requests = existing ? JSON.parse(existing) : [];

            // Ordenar por data (mais recente primeiro)
            requests.sort((a: MarketingRequest, b: MarketingRequest) => {
                return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
            });

            return { success: true, data: requests };
        } catch (error) {
            console.error('Error fetching requests:', error);
            return { success: false, error, data: [] };
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id: string, status: string) => {
        setLoading(true);
        try {
            const existing = localStorage.getItem(STORAGE_KEY);
            const requests = existing ? JSON.parse(existing) : [];

            const index = requests.findIndex((r: MarketingRequest) => r.id === id);
            if (index !== -1) {
                requests[index].status = status;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
                return { success: true, data: requests[index] };
            }

            return { success: false, error: 'Request not found' };
        } catch (error) {
            console.error('Error updating request:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const approveRequest = async (id: string, approverId: string, approverName: string) => {
        setLoading(true);
        try {
            const existing = localStorage.getItem(STORAGE_KEY);
            const requests = existing ? JSON.parse(existing) : [];

            const index = requests.findIndex((r: MarketingRequest) => r.id === id);
            if (index !== -1) {
                requests[index].status = 'approved';
                requests[index].approved_by = approverId;
                requests[index].approved_at = new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
                return { success: true, data: requests[index] };
            }

            return { success: false, error: 'Request not found' };
        } catch (error) {
            console.error('Error approving request:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const rejectRequest = async (id: string, approverId: string, reason: string) => {
        setLoading(true);
        try {
            const existing = localStorage.getItem(STORAGE_KEY);
            const requests = existing ? JSON.parse(existing) : [];

            const index = requests.findIndex((r: MarketingRequest) => r.id === id);
            if (index !== -1) {
                requests[index].status = 'rejected';
                requests[index].approved_by = approverId;
                requests[index].approved_at = new Date().toISOString();
                requests[index].rejection_reason = reason;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
                return { success: true, data: requests[index] };
            }

            return { success: false, error: 'Request not found' };
        } catch (error) {
            console.error('Error rejecting request:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createRequest,
        getRequests,
        updateRequestStatus,
        approveRequest,
        rejectRequest,
        generateRequestId
    };
}
