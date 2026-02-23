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
import { Search, Users, Shield, Edit, Loader2, UserCog, ChevronRight } from 'lucide-react';
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
    { value: 'admin', label: 'admin.users.roles.admin', description: 'admin.users.roleDescriptions.admin' },
    { value: 'manager', label: 'admin.users.roles.manager', description: 'admin.users.roleDescriptions.manager' },
    { value: 'tech_digital', label: 'admin.users.roles.tech_digital', description: 'admin.users.roleDescriptions.tech_digital' },
    { value: 'analyst', label: 'admin.users.roles.analyst', description: 'admin.users.roleDescriptions.analyst' },
    { value: 'user', label: 'admin.users.roles.user', description: 'admin.users.roleDescriptions.user' }
];

interface PermissionGroup {
    id: string;
    label: string;
    mainPermission: string;
    subPermissions: { value: string; label: string }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        id: 'marketing',
        label: 'Gerenciar Marketing',
        mainPermission: 'manage_marketing',
        subPermissions: [
            { value: 'marketing_campaigns', label: 'Campanhas' },
            { value: 'marketing_requests', label: 'Solicitações de Materiais' }
        ]
    },
    {
        id: 'financeiro',
        label: 'Gerenciar Financeiro',
        mainPermission: 'manage_finance',
        subPermissions: [
            { value: 'finance_nfe', label: 'Gerenciar NFE' },
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
            { value: 'hr_demission', label: 'Processo de Demissão' }
        ]
    },
    {
        id: 'intranet',
        label: 'Acessar Intranet',
        mainPermission: 'access_intranet',
        subPermissions: [
            { value: 'intranet_ideas', label: 'Banco de Ideias' },
            { value: 'intranet_directory', label: 'Diretório de Funcionários' },
            { value: 'intranet_store', label: 'Loja Corporativa' }
        ]
    },
    {
        id: 'juridico',
        label: 'Gerenciar Jurídico',
        mainPermission: 'manage_legal',
        subPermissions: [
            { value: 'legal_contracts', label: 'Gerenciar Contratos' },
            { value: 'legal_compliance', label: 'Acessar Compliance' }
        ]
    },
    {
        id: 'logistica',
        label: 'Gerenciar Logística',
        mainPermission: 'manage_logistics',
        subPermissions: [
            { value: 'logistics_inventory', label: 'Gerenciar Inventário' }
        ]
    },
    {
        id: 'compras',
        label: 'Gerenciar Compras',
        mainPermission: 'manage_purchasing',
        subPermissions: [
            { value: 'purchasing_requests', label: 'Solicitações de Compras' }
        ]
    },
    {
        id: 'tech',
        label: 'Gerenciar Tech/TI',
        mainPermission: 'manage_tickets',
        subPermissions: [
            { value: 'tech_tickets', label: 'Gerenciar Tickets' },
            { value: 'tech_assets', label: 'Gerenciar Ativos de TI' }
        ]
    },
    {
        id: 'ecommerce',
        label: 'Gerenciar E-commerce',
        mainPermission: 'manage_ecommerce',
        subPermissions: [
            { value: 'ecommerce_orders', label: 'Gerenciar Pedidos' },
            { value: 'ecommerce_products', label: 'Gerenciar Produtos' }
        ]
    },
    {
        id: 'manutencao',
        label: 'Gerenciar Manutenção',
        mainPermission: 'manage_maintenance',
        subPermissions: [
            { value: 'maintenance_requests', label: 'Solicitações de Manutenção' }
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

    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
    const [positions, setPositions] = useState<{ id: string, title: string, department_id: string }[]>([]);
    const [editingPassword, setEditingPassword] = useState('');
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
        setEditingPosition(employee.position_id || '');
        setEditingPassword('');
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
                    position_id: editingPosition || null,
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

                const matchingRole = currentRoles?.find(r => r.role === editingRole);

                if (matchingRole) {
                    // Update the matching role row
                    const { error: updateError } = await supabase
                        .from('user_roles')
                        .update({
                            permissions: editingPermissions,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', matchingRole.id);
                    if (updateError) throw updateError;

                    // Delete any OTHER roles for this user (clean up duplicates/old roles)
                    const { error: cleanupError } = await supabase
                        .from('user_roles')
                        .delete()
                        .eq('user_id', selectedEmployee.user_id)
                        .neq('id', matchingRole.id);
                    if (cleanupError) console.warn('[UsersAdminPage] Cleanup warning:', cleanupError);
                } else {
                    // No matching role exists, insert new one FIRST
                    const { error: insertError } = await supabase
                        .from('user_roles')
                        .insert({
                            user_id: selectedEmployee.user_id,
                            role: editingRole,
                            permissions: editingPermissions
                        });
                    if (insertError) throw insertError;

                    // THEN delete any old roles (so there's always at least one role during the process)
                    const { error: cleanupError } = await supabase
                        .from('user_roles')
                        .delete()
                        .eq('user_id', selectedEmployee.user_id)
                        .filter('role', 'neq', editingRole);
                    if (cleanupError) console.warn('[UsersAdminPage] Cleanup warning (new role):', cleanupError);
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
                    await supabase.functions.invoke('update-user-password', {
                        body: { userId: selectedEmployee.user_id, newPassword: editingPassword }
                    });
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
                    newPassword: tempPassword
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
                                            <Button variant="outline" size="sm" onClick={() => handleEditUser(emp)}>
                                                <Edit className="w-4 h-4 mr-1" />
                                                Editar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                                <Select value={editingPosition} onValueChange={setEditingPosition}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {positions.filter(p => !editingDepartment || p.department_id === editingDepartment).map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Função do Sistema (Nível de Acesso)</Label>
                            <Select value={editingRole} onValueChange={setEditingRole}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{t(r.label)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
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
                                                <AccordionTrigger className="hover:no-underline py-2 flex-1">
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

                        {!selectedEmployee?.user_id && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-800 font-bold mb-2">Usuário sem conta</p>
                                <Button className="w-full" variant="secondary" onClick={handleEnableAccess} disabled={saving}>
                                    Ativar Acesso Agora
                                </Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveRoles} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
