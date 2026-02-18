import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export function useUserRole() {
  const { roles, permissions, departmentId, departmentModule, loading: authLoading } = useAuth();
  const isAdmin = roles.includes('admin');

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
    if (permissions && permissions.includes('*')) return true;

    const permissionMap: Record<string, string> = {
      'admin': 'manage_employees',
      'rh': 'manage_hr',
      'financeiro': 'manage_finance',
      'marketing': 'manage_marketing',
      'comercial': 'manage_commercial',
      'logistica': 'manage_logistics',
      'juridico': 'manage_legal',
      'tech': 'manage_tickets',
      'ecommerce': 'manage_ecommerce',
      'cientifica': 'manage_scientific',
      'compras': 'manage_purchasing',
      'manutencao': 'manage_maintenance',
      'intranet': 'access_intranet',
    };

    const mainPermission = permissionMap[module];

    // User has access if they have the main permission OR any sub-permission starting with the module name
    const hasMainAccess = mainPermission && permissions ? permissions.includes(mainPermission) : false;
    const hasSubAccess = permissions ? permissions.some(p => p.startsWith(`${module}_`)) : false;

    return hasMainAccess || hasSubAccess;
  };

  /**
   * Specific check for granular sub-permissions
   * @param permission The specific permission string (e.g., 'marketing_campaigns')
   */
  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true;
    if (permissions && permissions.includes('*')) return true;

    // If user has the parent sector manager permission, they have all sub-permissions
    const parentMap: Record<string, string> = {
      'marketing_': 'manage_marketing',
      'finance_': 'manage_finance',
      'hr_': 'manage_hr',
      'intranet_': 'access_intranet',
      'legal_': 'manage_legal',
      'logistics_': 'manage_logistics',
      'purchasing_': 'manage_purchasing',
      'tech_': 'manage_tickets',
      'ecommerce_': 'manage_ecommerce',
      'maintenance_': 'manage_maintenance',
      'sap_': 'manage_sap',
      'analytics_': 'view_analytics',
    };

    const parentKey = Object.keys(parentMap).find(key => permission.startsWith(key));
    if (parentKey && permissions && permissions.includes(parentMap[parentKey])) {
      return true;
    }

    return permissions ? permissions.includes(permission) : false;
  };

  const canEditModule = (module: string): boolean => {
    if (isAdmin) return true;
    if (permissions.includes('*')) return true;

    if (!canAccessModule(module)) return false;

    const elevatedRoles: AppRole[] = [
      'manager', 'tech_digital', 'marketing_manager', 'rh_manager',
      'finance_manager', 'sales_manager', 'logistics_manager',
      'legal_manager', 'ecommerce_manager', 'editor'
    ];

    return roles.some(role => elevatedRoles.includes(role));
  };

  return {
    roles,
    permissions,
    loading: authLoading,
    isAdmin,
    departmentId,
    departmentModule,
    hasRole,
    hasAnyRole,
    hasPermission,
    canAccessModule,
    canEditModule,
  };
}
