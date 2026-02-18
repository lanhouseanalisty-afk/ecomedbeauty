import { useState } from 'react';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';

export interface SectorRequest {
    id: string;
    request_id: string;
    fromSector: string;
    toSector: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    created_at: string;
    updated_at?: string;
    requesterName?: string;
    notes?: string;
    messages?: RequestMessage[];
}

export interface RequestMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isSystemMessage?: boolean;
}

export function useSectorRequests(currentSector: string) {
    const [loading, setLoading] = useState(false);

    const generateRequestId = (from: string, to: string): string => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${from.toUpperCase().substring(0, 3)}-${to.toUpperCase().substring(0, 3)}-${year}${month}${day}-${random}`;
    };

    const getAllLocalRequests = (): SectorRequest[] => {
        return JSON.parse(localStorage.getItem('sector_requests') || '[]');
    };

    const saveAllLocalRequests = (requests: SectorRequest[]) => {
        localStorage.setItem('sector_requests', JSON.stringify(requests));
    };

    const createRequest = async (data: Omit<SectorRequest, 'request_id' | 'id' | 'created_at' | 'status'>) => {
        setLoading(true);
        try {
            const requestId = generateRequestId(data.fromSector, data.toSector);
            const requestData: SectorRequest = {
                ...data,
                id: generateUUID(),
                request_id: requestId,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            const localRequests = getAllLocalRequests();
            localRequests.push(requestData);
            saveAllLocalRequests(localRequests);

            toast.success(`Solicitação enviada para ${data.toSector.toUpperCase()}! ID: ${requestId}`);
            return { success: true, data: requestData };
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
            const allRequests = getAllLocalRequests();
            // Filter requests relevant to the current sector
            const relevantRequests = allRequests.filter(req =>
                req.fromSector === currentSector || req.toSector === currentSector
            ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return { success: true, data: relevantRequests };
        } catch (error) {
            console.error('Error fetching requests:', error);
            return { success: false, data: [] };
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id: string, status: SectorRequest['status'], notes?: string) => {
        setLoading(true);
        try {
            const allRequests = getAllLocalRequests();
            const index = allRequests.findIndex(req => req.id === id);

            if (index === -1) {
                throw new Error('Request not found');
            }

            allRequests[index] = {
                ...allRequests[index],
                status,
                notes: notes || allRequests[index].notes,
                updated_at: new Date().toISOString()
            };

            saveAllLocalRequests(allRequests);
            toast.success(`Status atualizado para ${status}`);
            return { success: true, data: allRequests[index] };
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erro ao atualizar status');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const addMessage = async (requestId: string, content: string, sender: string) => {
        setLoading(true);
        try {
            const allRequests = getAllLocalRequests();
            const index = allRequests.findIndex(req => req.id === requestId);

            if (index === -1) {
                throw new Error('Request not found');
            }

            const newMessage: RequestMessage = {
                id: generateUUID(),
                sender,
                content,
                timestamp: new Date().toISOString()
            };

            const currentMessages = allRequests[index].messages || [];
            allRequests[index] = {
                ...allRequests[index],
                messages: [...currentMessages, newMessage],
                updated_at: new Date().toISOString()
            };

            saveAllLocalRequests(allRequests);
            return { success: true, data: newMessage };
        } catch (error) {
            console.error('Error adding message:', error);
            toast.error('Erro ao enviar mensagem');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const deleteRequest = async (id: string) => {
        setLoading(true);
        try {
            const allRequests = getAllLocalRequests();
            const filteredRequests = allRequests.filter(req => req.id !== id);

            saveAllLocalRequests(filteredRequests);
            toast.success('Solicitação removida com sucesso');
            return { success: true };
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('Erro ao remover solicitação');
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
        addMessage,
        deleteRequest
    };
}
