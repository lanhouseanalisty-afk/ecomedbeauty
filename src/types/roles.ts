export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    GERENTE = 'gerente',
    SUPERVISOR = 'supervisor',
    COLABORADOR = 'colaborador'
}

export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.GERENTE]: 'Gerente',
    [UserRole.SUPERVISOR]: 'Supervisor',
    [UserRole.COLABORADOR]: 'Colaborador'
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Acesso total ao sistema',
    [UserRole.GERENTE]: 'Gerencia equipe e aprova solicitações',
    [UserRole.SUPERVISOR]: 'Supervisiona operações e visualiza relatórios',
    [UserRole.COLABORADOR]: 'Acesso básico às funcionalidades'
};

export const ROLE_COLORS: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'bg-purple-500/10 text-purple-600 border-purple-600',
    [UserRole.GERENTE]: 'bg-blue-500/10 text-blue-600 border-blue-600',
    [UserRole.SUPERVISOR]: 'bg-green-500/10 text-green-600 border-green-600',
    [UserRole.COLABORADOR]: 'bg-gray-500/10 text-gray-600 border-gray-600'
};

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    role?: UserRole;
    avatar_url?: string;
    created_at?: string;
}
