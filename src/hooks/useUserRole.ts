import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = data?.map(r => r.role) || [];

        // Super Admin Override
        if (user.email === 'reginaldo.mazaro@ext.medbeauty.com.br' && !userRoles.includes('admin')) {
          userRoles.push('admin');
        }

        setRoles(userRoles);
        setIsAdmin(userRoles.includes('admin'));
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole | AppRole[]): boolean => {
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r));
    }
    return roles.includes(role);
  };

  const hasAnyRole = (...checkRoles: AppRole[]): boolean => {
    return checkRoles.some(r => roles.includes(r));
  };

  const canAccessModule = (module: string): boolean => {
    if (isAdmin) return true;

    const moduleRoleMap: Record<string, AppRole[]> = {
      'admin': ['admin'],
      'rh': ['admin', 'rh_manager'],
      'financeiro': ['admin', 'finance_manager'],
      'marketing': ['admin', 'marketing_manager'],
      'comercial': ['admin', 'sales_manager'],
      'logistica': ['admin', 'logistics_manager'],
      'juridico': ['admin', 'legal_manager'],
      'tech': ['admin', 'tech_support'],
      'ecommerce': ['admin', 'ecommerce_manager'],
    };

    const allowedRoles = moduleRoleMap[module] || [];
    return hasAnyRole(...allowedRoles);
  };

  return {
    roles,
    loading,
    isAdmin,
    hasRole,
    hasAnyRole,
    canAccessModule,
  };
}
