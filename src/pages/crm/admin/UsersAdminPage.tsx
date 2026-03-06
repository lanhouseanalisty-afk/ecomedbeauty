import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Users, Shield, Edit, Loader2, UserCog, ChevronRight, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { UserCreationModal } from '@/components/admin/UserCreationModal';

interface Employee {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    function: string;
    department: string;
    status: string;
    department_id?: string;
    position_id?: string;
}

interface UserRole {
    user_id: string;
    role: string;
    permissions: string[];
}

const AVAILABLE_ROLES = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente Geral' },
    { value: 'user', label: 'Usuário Padrão' },
    { value: 'tech_digital', label: 'Tech & Digital' },
    { value: 'analyst', label: 'Analista' }
];

interface PermissionGroup {
    id: string;
    label: string;
    mainPermission: string;
    subPermissions: { value: string; label: string }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        id: 'admin',
        label: 'Gerenciar Administração',
        mainPermission: 'admin_dashboard',
        subPermissions: [
            { value: 'admin_users', label: 'Gestão de Usuários' },
            { value: 'admin_permissions', label: 'Gestão de Permissões' },
            { value: 'admin_analytics', label: 'Analytics' },
            { value: 'admin_bonuses', label: 'Bonificações' },
            { value: 'admin_nfe', label: 'Controle de NFE' },
            { value: 'admin_processes', label: 'Controle de Processos' },
            { value: 'admin_supplies', label: 'Solicitação de Insumos' },
            { value: 'admin_contracts', label: 'Contratos' },
            { value: 'admin_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'marketing',
        label: 'Gerenciar Marketing',
        mainPermission: 'manage_marketing',
        subPermissions: [
            { value: 'marketing_campaigns', label: 'Campanhas' },
            { value: 'marketing_requests', label: 'Gerenciar Solicitações' },
            { value: 'marketing_bonuses', label: 'Bonificações' },
            { value: 'marketing_nfe', label: 'Controle de NFE' },
            { value: 'marketing_processes', label: 'Controle de Processos' },
            { value: 'marketing_supplies', label: 'Solicitação de Insumos' },
            { value: 'marketing_contracts', label: 'Contratos' },
            { value: 'marketing_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'financeiro',
        label: 'Gerenciar Financeiro',
        mainPermission: 'manage_finance',
        subPermissions: [
            { value: 'finance_pricing', label: 'Precificação' },
            { value: 'finance_nfe', label: 'Controle de NFE' },
            { value: 'finance_bonuses', label: 'Bonificações' },
            { value: 'finance_processes', label: 'Controle de Processos' },
            { value: 'finance_supplies', label: 'Solicitação de Insumos' },
            { value: 'finance_contracts', label: 'Contratos' },
            { value: 'finance_intersector', label: 'Solicitações entre Setores' },
            { value: 'finance_reports', label: 'Visualizar Relatórios Financeiros' }
        ]
    },
    {
        id: 'rh',
        label: 'Gerenciar RH',
        mainPermission: 'manage_hr',
        subPermissions: [
            { value: 'hr_employees', label: 'Gerenciar Funcionários' },
            { value: 'hr_admission', label: 'Processo de Admissão' },
            { value: 'hr_demission', label: 'Processo de Demissão' },
            { value: 'hr_bonuses', label: 'Bonificações' },
            { value: 'hr_nfe', label: 'Controle de NFE' },
            { value: 'hr_processes', label: 'Controle de Processos' },
            { value: 'hr_supplies', label: 'Solicitação de Insumos' },
            { value: 'hr_contracts', label: 'Contratos' },
            { value: 'hr_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'cientifica',
        label: 'Gerenciar Científica',
        mainPermission: 'manage_scientific',
        subPermissions: [
            { value: 'cientifica_presentations', label: 'Apresentações' },
            { value: 'cientifica_bonuses', label: 'Bonificações' },
            { value: 'cientifica_nfe', label: 'Controle de NFE' },
            { value: 'cientifica_processes', label: 'Controle de Processos' },
            { value: 'cientifica_supplies', label: 'Solicitação de Insumos' },
            { value: 'cientifica_contracts', label: 'Contratos' },
            { value: 'cientifica_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'comercial',
        label: 'Gerenciar Comercial',
        mainPermission: 'manage_commercial',
        subPermissions: [
            { value: 'comercial_leads', label: 'Leads / Dashboard' },
            { value: 'comercial_franchises', label: 'Franquias' },
            { value: 'comercial_bonuses', label: 'Bonificações' },
            { value: 'comercial_nfe', label: 'Controle de NFE' },
            { value: 'comercial_processes', label: 'Controle de Processos' },
            { value: 'comercial_supplies', label: 'Solicitação de Insumos' },
            { value: 'comercial_contracts', label: 'Contratos' },
            { value: 'comercial_intersector', label: 'Solicitações entre Setores' },
            { value: 'comercial_pricing', label: 'Precificação' },
            { value: 'comercial_gamification', label: 'Gamificação' }
        ]
    },
    {
        id: 'logistica',
        label: 'Gerenciar Logística',
        mainPermission: 'manage_logistics',
        subPermissions: [
            { value: 'logistics_orders', label: 'Pedidos de Insumos' },
            { value: 'logistics_inventory', label: 'Gerenciar Estoque' },
            { value: 'logistics_bonuses', label: 'Bonificações' },
            { value: 'logistics_nfe', label: 'Controle de NFE' },
            { value: 'logistics_processes', label: 'Controle de Processos' },
            { value: 'logistics_supplies', label: 'Solicitação de Insumos' },
            { value: 'logistics_contracts', label: 'Contratos' },
            { value: 'logistics_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'compras',
        label: 'Gerenciar Compras',
        mainPermission: 'manage_purchasing',
        subPermissions: [
            { value: 'purchasing_vehicles', label: 'Veículos' },
            { value: 'purchasing_requests', label: 'Solicitações de Compras' },
            { value: 'compras_bonuses', label: 'Bonificações' },
            { value: 'compras_nfe', label: 'Controle de NFE' },
            { value: 'compras_processes', label: 'Controle de Processos' },
            { value: 'compras_supplies', label: 'Solicitação de Insumos' },
            { value: 'compras_contracts', label: 'Contratos' },
            { value: 'compras_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'tech',
        label: 'Gerenciar Tech/TI',
        mainPermission: 'manage_tickets',
        subPermissions: [
            { value: 'tech_tickets', label: 'Gerenciar Tickets' },
            { value: 'tech_kb', label: 'Base de Conhecimento' },
            { value: 'tech_assets', label: 'Inventário de Ativos' },
            { value: 'tech_bonuses', label: 'Bonificações' },
            { value: 'tech_nfe', label: 'Controle de NFE' },
            { value: 'tech_processes', label: 'Controle de Processos' },
            { value: 'tech_supplies', label: 'Solicitação de Insumos' },
            { value: 'tech_contracts', label: 'Contratos' },
            { value: 'tech_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'ecommerce',
        label: 'Gerenciar E-commerce',
        mainPermission: 'manage_ecommerce',
        subPermissions: [
            { value: 'ecommerce_orders', label: 'Gerenciar Pedidos' },
            { value: 'ecommerce_products', label: 'Gerenciar Produtos' },
            { value: 'ecommerce_customers', label: 'Gerenciar Clientes' },
            { value: 'ecommerce_cms', label: 'Gerenciar CMS' },
            { value: 'ecommerce_coupons', label: 'Cupons' },
            { value: 'ecommerce_pricing', label: 'Precificação' },
            { value: 'ecommerce_bonuses', label: 'Bonificações' },
            { value: 'ecommerce_nfe', label: 'Controle de NFE' },
            { value: 'ecommerce_processes', label: 'Controle de Processos' },
            { value: 'ecommerce_supplies', label: 'Solicitação de Insumos' },
            { value: 'ecommerce_contracts', label: 'Contratos' },
            { value: 'ecommerce_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'manutencao',
        label: 'Gerenciar Manutenção',
        mainPermission: 'manage_maintenance',
        subPermissions: [
            { value: 'maintenance_requests', label: 'Solicitações de Manutenção' },
            { value: 'manutencao_bonuses', label: 'Bonificações' },
            { value: 'manutencao_nfe', label: 'Controle de NFE' },
            { value: 'manutencao_processes', label: 'Controle de Processos' },
            { value: 'manutencao_supplies', label: 'Solicitação de Insumos' },
            { value: 'manutencao_contracts', label: 'Contratos' },
            { value: 'manutencao_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'juridico',
        label: 'Gerenciar Jurídico',
        mainPermission: 'manage_legal',
        subPermissions: [
            { value: 'legal_contracts', label: 'Gerenciar Contratos' },
            { value: 'legal_compliance', label: 'Acessar Compliance / Modelos' },
            { value: 'juridico_bonuses', label: 'Bonificações' },
            { value: 'juridico_nfe', label: 'Controle de NFE' },
            { value: 'juridico_processes', label: 'Controle de Processos' },
            { value: 'juridico_supplies', label: 'Solicitação de Insumos' },
            { value: 'juridico_intersector', label: 'Solicitações entre Setores' }
        ]
    },
    {
        id: 'intranet',
        label: 'Acessar Intranet',
        mainPermission: 'access_intranet',
        subPermissions: [
            { value: 'intranet_ideas', label: 'Banco de Ideias' },
            { value: 'intranet_directory', label: 'Diretório de Funcionários' },
            { value: 'intranet_store', label: 'Loja Corporativa' },
            { value: 'intranet_news', label: 'Mural de Avisos' },
            { value: 'intranet_library', label: 'Biblioteca Interna' },
            { value: 'intranet_forecast', label: 'Previsão & Faturamento' },
            { value: 'access_crm_ranking', label: 'Ranking CRM (Principal)' }
        ]
    },
    {
        id: 'sap',
        label: 'Integração SAP',
        mainPermission: 'manage_sap',
        subPermissions: [
            { value: 'sap_monitor', label: 'Monitor de Integração' }
        ]
    },
    {
        id: 'analytics',
        label: 'Analytics',
        mainPermission: 'view_analytics',
        subPermissions: [
            { value: 'analytics_powerbi', label: 'Power BI' },
            { value: 'analytics_dashboards', label: 'Dashboards Avançados' }
        ]
    }
];

const INDEPENDENT_PERMISSIONS = [
    { value: 'view_reports', label: 'Visualizar Relatórios Gerais' },
    { value: 'view_compliance', label: 'Acessar Compliance Geral' }
];

export default function UsersAdminPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const isAdminPath = location.pathname.startsWith('/crm/admin');
    const [userRoles, setUserRoles] = useState<Map<string, UserRole>>(new Map());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<string>('user');
    const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
    const [positions, setPositions] = useState<{ id: string, title: string, department_id: string }[]>([]);
    const [editingPassword, setEditingPassword] = useState('');
    const [forcePasswordChange, setForcePasswordChange] = useState(true);
    const [editingDepartment, setEditingDepartment] = useState('');
    const [editingPosition, setEditingPosition] = useState('');

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            await fetchMetadata();
            await fetchData();
            setLoading(false);
        };
        initialize();
    }, []);

    const fetchMetadata = async () => {
        try {
            const { data: depts } = await supabase.from('departments').select('id, name').eq('is_active', true);
            const { data: pos } = await supabase.from('positions').select('id, title, department_id').eq('is_active', true);
            if (depts) setDepartments(depts);
            if (pos) setPositions(pos);
        } catch (err) {
            console.error('fetchMetadata error:', err);
        }
    };

    const fetchData = async () => {
        try {
            const { data: employeesData, error: employeesError } = await supabase
                .from('employees')
                .select('id, user_id, full_name, email, position_id, department_id, status');

            if (employeesError) throw employeesError;

            // Wait for departments/positions to be ready if they aren't yet
            const currentDepts = departments.length > 0 ? departments : (await supabase.from('departments').select('id, name').eq('is_active', true)).data || [];
            const currentPos = positions.length > 0 ? positions : (await supabase.from('positions').select('id, title, department_id').eq('is_active', true)).data || [];

            const mappedEmployees = employeesData.map((emp: any) => {
                const dept = currentDepts.find(d => d.id === emp.department_id);
                const pos = currentPos.find(p => p.id === emp.position_id);

                return {
                    id: emp.id,
                    user_id: emp.user_id,
                    name: emp.full_name || 'Sem nome',
                    email: emp.email || '',
                    function: pos?.title || 'Não definido',
                    department: dept?.name || 'Não definido',
                    status: emp.status || 'active',
                    department_id: emp.department_id,
                    position_id: emp.position_id
                };
            });

            setEmployees(mappedEmployees);

            const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, role, permissions');

            if (rolesError) throw rolesError;

            const rolesMap = new Map<string, UserRole>();
            rolesData?.forEach(role => {
                if (role.user_id) {
                    rolesMap.set(role.user_id, {
                        user_id: role.user_id,
                        role: role.role || 'user',
                        permissions: role.permissions || []
                    });
                }
            });

            setUserRoles(rolesMap);
            console.log('[UsersAdminPage] Roles loaded:', rolesMap.size);
        } catch (error: any) {
            console.error('[UsersAdminPage] fetchData error:', error);
            toast.error('Erro ao carregar dados: ' + error.message);
        }
    };

    const handleEditUser = (employee: any) => {
        setSelectedEmployee(employee);
        const currentRole = employee.user_id ? userRoles.get(employee.user_id) : null;
        console.log(`[UsersAdminPage] Editing ${employee.name}, user_id: ${employee.user_id}, currentRole:`, currentRole);
        setEditingRole(currentRole?.role || 'user');
        setEditingPermissions(currentRole?.permissions || []);
        setEditingDepartment(employee.department_id || '');
        setEditingPosition(employee.position_id || 'none');
        setEditingPassword('');
        setForcePasswordChange(true);
        setIsEditDialogOpen(true);
    };

    const handleSaveRoles = async () => {
        if (!selectedEmployee) return;

        setSaving(true);
        console.log(`[UsersAdminPage] Saving ${selectedEmployee.name}, Role: ${editingRole}, Perms:`, editingPermissions);
        try {
            // 1. Update Employee metadata
            const { error: empError } = await supabase
                .from('employees')
                .update({
                    department_id: editingDepartment || null,
                    position_id: (!editingPosition || editingPosition === 'none') ? null : editingPosition,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedEmployee.id);

            if (empError) throw empError;

            // 2. Update User Roles
            if (selectedEmployee.user_id) {
                console.log(`[UsersAdminPage] Syncing roles for ${selectedEmployee.user_id}...`);

                // 1. Fetch current roles
                const { data: currentRoles, error: fetchError } = await supabase
                    .from('user_roles')
                    .select('id, role')
                    .eq('user_id', selectedEmployee.user_id);

                if (fetchError) throw fetchError;

                const existingRole = currentRoles && currentRoles.length > 0 ? currentRoles[0] : null;

                if (existingRole) {
                    // The user has a role record, update it to the new role selected in dropdown
                    const { error: updateError } = await supabase
                        .from('user_roles')
                        .update({
                            role: editingRole,
                            permissions: editingPermissions,
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', selectedEmployee.user_id);
                    if (updateError) throw updateError;

                    // Cleanup any stray duplicate roles just in case
                    if (currentRoles && currentRoles.length > 1) {
                        const idsToKeep = [existingRole.id];
                        await supabase.from('user_roles').delete().eq('user_id', selectedEmployee.user_id).not('id', 'in', `(${idsToKeep.join(',')})`);
                    }
                } else {
                    // No existing role found, insert new one
                    const { error: insertError } = await supabase
                        .from('user_roles')
                        .insert({
                            user_id: selectedEmployee.user_id,
                            role: editingRole,
                            permissions: editingPermissions
                        });
                    if (insertError) throw insertError;
                }
                console.log(`[UsersAdminPage] Role ${editingRole} synced successfully.`);
            } else {
                console.warn('[UsersAdminPage] Employee has no user_id, skipping user_roles update');
            }

            if (editingPassword && selectedEmployee.user_id) {
                if (editingPassword === 'REDEFINIR_VIA_EMAIL') {
                    await supabase.auth.resetPasswordForEmail(selectedEmployee.email);
                    toast.info("E-mail de redefinição enviado.");
                } else {
                    const { error } = await supabase.functions.invoke('update-user-password', {
                        body: { userId: selectedEmployee.user_id, newPassword: editingPassword, forcePasswordChange }
                    });

                    if (error) {
                        console.error("Edge Function Error:", error);
                        let errMsg = error.message;
                        try {
                            if (error.context) {
                                const js = await error.context.json();
                                if (js.error) errMsg = js.error;
                            }
                        } catch (e) { }
                        throw new Error("Falha ao atualizar a senha no servidor. Erro: " + errMsg);
                    }

                    toast.success("Senha atualizada diretamente!");
                }
            }

            toast.success(`Dados de ${selectedEmployee.name} atualizados!`);
            setIsEditDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEnableAccess = async () => {
        if (!selectedEmployee || selectedEmployee.user_id) return;
        setSaving(true);
        try {
            const tempPassword = "MedBeauty@123";
            const { data, error } = await supabase.functions.invoke('update-user-password', {
                body: {
                    email: selectedEmployee.email,
                    employeeName: selectedEmployee.name,
                    newPassword: tempPassword,
                    employeeId: selectedEmployee.id,
                    role: 'user',
                    forcePasswordChange: true
                }
            });

            if (error) throw error;

            if (data?.userId) {
                // Atualiza o employee com o novo user_id
                const { error: updateErr } = await supabase
                    .from('employees')
                    .update({ user_id: data.userId })
                    .eq('id', selectedEmployee.id);

                if (updateErr) throw updateErr;

                toast.success(`Acesso habilitado! Senha padrão: ${tempPassword}`);

                // Atualiza o estado local para permitir configurar permissões imediatamente
                const updatedEmployee = { ...selectedEmployee, user_id: data.userId };
                setSelectedEmployee(updatedEmployee);

                // Atualiza a lista de funcionários localmente
                setEmployees(prev => prev.map(emp =>
                    emp.id === selectedEmployee.id ? updatedEmployee : emp
                ));

                // Não fechamos o modal aqui para o usuário poder salvar as roles
            }
        } catch (error: any) {
            console.error('[UsersAdminPage] handleEnableAccess full error:', error);
            // Se o erro for um objeto com contexto, tenta extrair mais info
            const detail = error.context?.status ? ` (Status: ${error.context.status})` : '';
            toast.error(`Erro ao habilitar acesso: ${error.message}${detail}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!employeeToDelete) return;
        setDeleting(true);
        try {
            // 1. Remove user_roles if exists
            if (employeeToDelete.user_id) {
                await supabase.from('user_roles').delete().eq('user_id', employeeToDelete.user_id);
            }

            // 2. Remove employee record
            const { error: empDeleteError } = await supabase
                .from('employees')
                .delete()
                .eq('id', employeeToDelete.id);

            if (empDeleteError) throw empDeleteError;

            // 3. If has auth account, deactivate via edge function
            if (employeeToDelete.user_id) {
                await supabase.functions.invoke('admin-delete-user', {
                    body: { userId: employeeToDelete.user_id }
                });
            }

            toast.success(`Usuário ${employeeToDelete.name} removido com sucesso.`);
            setEmployeeToDelete(null);
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao remover usuário: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const togglePermission = (permission: string) => {
        setEditingPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const togglePermissionGroup = (group: PermissionGroup, checked: boolean) => {
        const subValues = group.subPermissions.map(p => p.value);
        if (checked) {
            // Add main + all subs
            setEditingPermissions(prev => Array.from(new Set([...prev, group.mainPermission, ...subValues])));
        } else {
            // Remove main + all subs
            setEditingPermissions(prev => prev.filter(p => p !== group.mainPermission && !subValues.includes(p)));
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (employee: Employee) => {
        if (!employee.user_id) return <Badge variant="outline" className="text-gray-400 italic">Sem acesso</Badge>;
        const userRole = userRoles.get(employee.user_id);
        console.log(`[UsersAdminPage] Badge for ${employee.name}:`, userRole?.role);
        const role = AVAILABLE_ROLES.find(r => r.value === userRole?.role);
        return <Badge variant="outline" className="bg-rose-gold/10 text-rose-gold-dark border-rose-gold/20">{role ? t(role.label) : 'Usuário'}</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-gold/10 rounded-lg">
                    <UserCog className="w-8 h-8 text-rose-gold" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-rose-gold-dark">Gestão de Usuários</h1>
                    <p className="text-muted-foreground">Administre contas, cargos e permissões detalhadas</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-rose-gold" />
                            Colaboradores
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-[300px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar colaborador..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {isAdminPath && <UserCreationModal onUserCreated={fetchData} />}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Setor</TableHead>
                                    <TableHead>Cargo Sistema</TableHead>
                                    <TableHead className="text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-medium">{emp.name}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>{emp.department}</TableCell>
                                        <TableCell>{getRoleBadge(emp)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEditUser(emp)}>
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Editar
                                                </Button>
                                                {isAdminPath && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setEmployeeToDelete(emp)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Remover
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto notranslate" translate="no">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-gold" />
                            Permissões de {selectedEmployee?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Setor</Label>
                                <Select value={editingDepartment} onValueChange={setEditingDepartment}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cargo</Label>
                                <Select value={editingPosition === 'none' ? '' : editingPosition} onValueChange={(val) => setEditingPosition(val || 'none')}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum (Remover Cargo)</SelectItem>
                                        {positions.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.title} {p.department_id ? `(${departments.find(d => d.id === p.department_id)?.name})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Função do Sistema (Nível de Acesso)</Label>
                            <Select value={editingRole} onValueChange={setEditingRole}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <Label className="text-lg font-bold text-rose-gold-dark">Acesso e Senha</Label>
                            <div className="space-y-2">
                                <Label>Definir Nova Senha</Label>
                                <Input
                                    type="text"
                                    placeholder="Digite para alterar a senha, ou deixe em branco"
                                    value={editingPassword}
                                    onChange={(e) => setEditingPassword(e.target.value)}
                                    autoComplete="new-password"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                />
                            </div>
                            {editingPassword && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="forceChange"
                                        checked={forcePasswordChange}
                                        onCheckedChange={(checked) => setForcePasswordChange(!!checked)}
                                    />
                                    <label htmlFor="forceChange" className="text-sm text-slate-600 font-medium leading-none cursor-pointer">
                                        Exigir troca de senha no primeiro acesso
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <Label className="text-lg font-bold">Permissões Específicas (Sub-acessos)</Label>

                            <Accordion type="multiple" className="w-full border rounded-lg overflow-hidden">
                                {PERMISSION_GROUPS.map((group) => {
                                    const isMainChecked = editingPermissions.includes(group.mainPermission);
                                    const subsCount = group.subPermissions.filter(p => editingPermissions.includes(p.value)).length;

                                    return (
                                        <AccordionItem key={group.id} value={group.id} className="border-b last:border-0 px-4">
                                            <div className="flex items-center gap-3 py-2">
                                                <Checkbox
                                                    id={`main-${group.id}`}
                                                    checked={isMainChecked}
                                                    onCheckedChange={(checked) => togglePermissionGroup(group, !!checked)}
                                                />
                                                <AccordionTrigger className="hover:no-underline py-2 flex-1 relative">
                                                    <div className="flex items-center justify-between w-full pr-4 text-left">
                                                        <Label htmlFor={`main-${group.id}`} className="font-bold cursor-pointer">{group.label}</Label>
                                                        {subsCount > 0 && (
                                                            <Badge variant="secondary" className="ml-2">
                                                                {subsCount} ativos
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </AccordionTrigger>
                                            </div>
                                            <AccordionContent className="pt-0 pb-4 pl-9">
                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    {group.subPermissions.map((sub) => (
                                                        <div key={sub.value} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={sub.value}
                                                                checked={editingPermissions.includes(sub.value)}
                                                                onCheckedChange={() => togglePermission(sub.value)}
                                                            />
                                                            <label htmlFor={sub.value} className="text-sm font-medium leading-none cursor-pointer">
                                                                {sub.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>

                            <div className="p-4 bg-slate-50 rounded-lg">
                                <Label className="mb-3 block font-bold">Outros Acessos</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {INDEPENDENT_PERMISSIONS.map(p => (
                                        <div key={p.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={p.value}
                                                checked={editingPermissions.includes(p.value)}
                                                onCheckedChange={() => togglePermission(p.value)}
                                            />
                                            <label htmlFor={p.value} className="text-sm font-medium cursor-pointer">{p.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg" style={{ display: !selectedEmployee?.user_id ? 'block' : 'none' }}>
                            <p className="text-sm text-amber-800 font-bold mb-2">Usuário sem conta</p>
                            <Button className="w-full relative flex items-center justify-center" variant="secondary" onClick={handleEnableAccess} disabled={saving}>
                                <div className={`absolute left-4 transition-opacity ${saving ? 'opacity-100' : 'opacity-0'}`}>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                                <span className={saving ? 'ml-6' : ''}>Ativar Acesso Agora</span>
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} type="button">
                            <span>Cancelar</span>
                        </Button>
                        <Button onClick={handleSaveRoles} disabled={saving} type="button" className="relative flex items-center justify-center min-w-[140px]">
                            <div className={`absolute left-4 transition-opacity ${saving ? 'opacity-100' : 'opacity-0'}`}>
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                            <span className={saving ? 'ml-6' : ''}>Salvar Alterações</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="w-5 h-5" />
                            Remover Usuário
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{employeeToDelete?.name}</strong>?<br />
                            Esta ação irá excluir o registro do colaborador e revogar o acesso ao sistema.
                            <span className="block mt-2 font-semibold text-destructive">Esta ação não pode ser desfeita.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            {deleting ? 'Removendo...' : 'Sim, Remover'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
