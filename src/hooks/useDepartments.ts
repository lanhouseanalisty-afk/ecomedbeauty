import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
    parent_id?: string;
    manager_email?: string;
    manager_name?: string;
    level?: number;
    path?: string;
}

export interface Manager {
    manager_email: string;
    manager_name: string;
    department_id: string;
    department_name: string;
    department_code: string;
    parent_department_name?: string;
}

export function useDepartments() {
    return useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('name');

            if (error) throw error;
            return data as Department[];
        },
    });
}

export function useDepartmentHierarchy() {
    return useQuery({
        queryKey: ['department_hierarchy'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('department_hierarchy')
                .select('*')
                .order('path');

            if (error) throw error;
            return data as Department[];
        },
    });
}

export function useManagersDepartments() {
    return useQuery({
        queryKey: ['managers_departments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('managers_departments')
                .select('*')
                .order('department_name');

            if (error) throw error;
            return data as Manager[];
        },
    });
}

export function useDepartmentsByParent(parentCode?: string) {
    return useQuery({
        queryKey: ['departments_by_parent', parentCode],
        queryFn: async () => {
            let query = supabase
                .from('departments')
                .select('*');

            if (parentCode) {
                // Buscar o ID do departamento pai
                const { data: parentDept } = await supabase
                    .from('departments')
                    .select('id')
                    .eq('code', parentCode)
                    .single();

                if (parentDept) {
                    query = query.eq('parent_id', parentDept.id);
                }
            } else {
                query = query.is('parent_id', null);
            }

            const { data, error } = await query.order('name');

            if (error) throw error;
            return data as Department[];
        },
    });
}

export function useComercialSubDepartments() {
    return useDepartmentsByParent('comercial');
}

export function useDepartmentManagers(departmentCode: string) {
    return useQuery({
        queryKey: ['department_managers', departmentCode],
        queryFn: async () => {
            // Buscar o departamento
            const { data: dept, error: deptError } = await supabase
                .from('departments')
                .select('id')
                .eq('code', departmentCode)
                .single();

            if (deptError) throw deptError;

            // Buscar membros do departamento que são managers
            const { data, error } = await supabase
                .from('department_members')
                .select(`
          *,
          user:profiles!user_id(id, full_name, email, phone)
        `)
                .eq('department_id', dept.id)
                .eq('role', 'manager');

            if (error) throw error;
            return data;
        },
    });
}

// Hook para buscar todos os gestores (para usar em selects)
export function useAllManagers() {
    return useQuery({
        queryKey: ['all_managers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('managers_departments')
                .select('*')
                .order('manager_name');

            if (error) throw error;

            // Transformar para formato compatível com selects
            const managers = data?.map(m => ({
                id: m.manager_email, // Usar email como ID temporário
                full_name: m.manager_name,
                email: m.manager_email,
                department: m.department_name,
                department_code: m.department_code
            }));

            return managers || [];
        },
    });
}
