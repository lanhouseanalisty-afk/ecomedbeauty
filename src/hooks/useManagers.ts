import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Manager {
    id: string;
    full_name: string;
    email: string;
    role: string;
    department?: string;
    department_code?: string;
}

export function useManagers() {
    const { data: managers = [], isLoading, error } = useQuery({
        queryKey: ['managers'],
        queryFn: async () => {
            // Buscar diretamente da tabela departments todos os gestores
            const { data: deptData, error: deptError } = await supabase
                .from('departments')
                .select('manager_name, manager_email, name, code')
                .not('manager_email', 'is', null)
                .order('manager_name');

            if (deptError) {
                console.error('Error fetching managers from departments:', deptError);
                return [];
            }

            // Transformar dados dos departamentos
            const managersFromDepts: Manager[] = (deptData || []).map(dept => ({
                id: dept.manager_email, // Usar email como ID
                full_name: dept.manager_name,
                email: dept.manager_email,
                role: 'Gestor',
                department: dept.name,
                department_code: dept.code
            }));

            // Remover duplicatas (um gestor pode gerenciar múltiplos departamentos)
            const uniqueManagers = managersFromDepts.reduce((acc: Manager[], curr) => {
                const existing = acc.find(m => m.email === curr.email);
                if (!existing) {
                    acc.push(curr);
                } else if (curr.department && !existing.department) {
                    // Atualizar com informação de departamento se não tiver
                    existing.department = curr.department;
                    existing.department_code = curr.department_code;
                }
                return acc;
            }, []);

            return uniqueManagers;
        },
    });

    return { managers, isLoading, error };
}
