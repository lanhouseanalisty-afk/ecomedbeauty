import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DepartmentMember {
    id: string;
    user_id: string;
    department_id: string;
    role: string;
    user: {
        id: string;
        full_name: string;
        email: string;
        phone?: string;
    };
}

export function useDepartmentMembers(departmentCode: string) {
    return useQuery({
        queryKey: ['department_members', departmentCode],
        queryFn: async () => {
            // Buscar o departamento pelo código
            const { data: dept, error: deptError } = await supabase
                .from('departments')
                .select('id')
                .eq('code', departmentCode)
                .single();

            if (deptError) {
                console.error('Error fetching department:', deptError);
                return [];
            }

            if (!dept) {
                return [];
            }

            // Buscar membros do departamento
            const { data, error } = await supabase
                .from('department_members')
                .select(`
          id,
          user_id,
          department_id,
          role,
          profiles:user_id (
            id,
            full_name,
            email,
            phone
          )
        `)
                .eq('department_id', dept.id)
                .order('role', { ascending: false }); // Managers primeiro

            if (error) {
                console.error('Error fetching members:', error);
                return [];
            }

            // Transformar dados para o formato esperado
            return (data || []).map(item => ({
                id: item.id,
                user_id: item.user_id,
                department_id: item.department_id,
                role: item.role,
                user: {
                    id: (item.profiles as any)?.id || '',
                    full_name: (item.profiles as any)?.full_name || 'Sem nome',
                    email: (item.profiles as any)?.email || '',
                    phone: (item.profiles as any)?.phone
                }
            })) as DepartmentMember[];
        },
        enabled: !!departmentCode,
    });
}
