import { useState } from 'react';
import { toast } from 'sonner';
import type { MarketingRequest } from './useMarketingRequest';

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
            const requestData = {
                ...data,
                id: crypto.randomUUID(),
                request_id: requestId,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Salvar no localStorage
            const localRequests = JSON.parse(localStorage.getItem('marketing_requests') || '[]');
            localRequests.push(requestData);
            localStorage.setItem('marketing_requests', JSON.stringify(localRequests));

            console.log(`✅ Solicitação salva localmente! ID: ${requestId}`);
            toast.success(`Solicitação criada localmente! ID: ${requestId}`);

            return { success: true, data: requestData, requestId, savedLocally: true };
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
            const localRequests = JSON.parse(localStorage.getItem('marketing_requests') || '[]');
            console.log('📦 Carregando solicitações do localStorage:', localRequests.length);
            return { success: true, data: localRequests };
        } catch (error) {
            console.error('Error fetching requests:', error);
            return { success: true, data: [] };
        } finally {
            setLoading(false);
        }
    };

    const deleteRequest = async (id: string) => {
        setLoading(true);
        try {
            const localRequests = JSON.parse(localStorage.getItem('marketing_requests') || '[]');
            const filteredRequests = localRequests.filter((req: any) => req.id !== id);
            localStorage.setItem('marketing_requests', JSON.stringify(filteredRequests));

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
        deleteRequest,
        generateRequestId
    };
}
