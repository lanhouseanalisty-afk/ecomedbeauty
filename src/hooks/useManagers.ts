import { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/roles';

// Mock de gestores - em produção, viria do Supabase
const MOCK_MANAGERS: UserProfile[] = [
    {
        id: 'manager-1',
        email: 'gerente1@medbeauty.com',
        full_name: 'Ana Silva',
        role: UserRole.GERENTE,
    },
    {
        id: 'manager-2',
        email: 'gerente2@medbeauty.com',
        full_name: 'Carlos Santos',
        role: UserRole.GERENTE,
    },
    {
        id: 'admin-1',
        email: 'admin@medbeauty.com',
        full_name: 'Super Admin',
        role: UserRole.SUPER_ADMIN,
    },
];

export function useManagers() {
    const [managers, setManagers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);

    const getManagers = async () => {
        setLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 300));

            // Em produção, buscar do Supabase:
            // const { data } = await supabase
            //   .from('profiles')
            //   .select('*')
            //   .in('role', ['gerente', 'super_admin']);

            setManagers(MOCK_MANAGERS);
            return { success: true, data: MOCK_MANAGERS };
        } catch (error) {
            console.error('Error fetching managers:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getManagers();
    }, []);

    return {
        managers,
        loading,
        getManagers,
    };
}
