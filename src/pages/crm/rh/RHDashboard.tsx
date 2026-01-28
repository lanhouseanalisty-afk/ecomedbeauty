import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Loader2,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmployees, useDepartments, usePositions } from "@/hooks/useRH";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { SearchFilter } from "@/components/crm/shared/SearchFilter";
import { DataExport } from "@/components/crm/shared/DataExport";
import { BulkActions } from "@/components/crm/shared/BulkActions";
import { DetailDrawer } from "@/components/crm/shared/DetailDrawer";
import { EmptyState } from "@/components/crm/shared/EmptyState";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

export default function RHDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { employees, isLoading, createEmployee, updateEmployee } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);


  const [newEmployee, setNewEmployee] = useState({
    full_name: "",
    email: "",
    cpf: "",
    employee_code: "",
    hire_date: new Date().toISOString().split('T')[0],
    department_id: "",
    position_id: "",
    phone: "",
  });

  const handleSubmit = () => {
    const formattedData = {
      ...newEmployee,
      department_id: newEmployee.department_id || null,
      position_id: newEmployee.position_id || null,
    };

    if (editingEmployee) {
      updateEmployee.mutate({ id: editingEmployee, ...formattedData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingEmployee(null);
          resetForm();
        }
      });
    } else {
      createEmployee.mutate(formattedData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const resetForm = () => {
    setNewEmployee({
      full_name: "",
      email: "",
      cpf: "",
      employee_code: "",
      hire_date: new Date().toISOString().split('T')[0],
      department_id: "",
      position_id: "",
      phone: "",
    });
    setEditingEmployee(null);
  };

  const handleOpenEdit = (employee: any) => {
    setEditingEmployee(employee.id);
    setNewEmployee({
      full_name: employee.full_name,
      email: employee.email,
      cpf: employee.cpf || "",
      employee_code: employee.employee_code || "",
      hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
      department_id: employee.department_id || "",
      position_id: employee.position_id || "",
      phone: employee.phone || "",
    });
    setIsDialogOpen(true);
  };



  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Ativo</Badge>;
      case "vacation":
        return <Badge className="bg-info/10 text-info hover:bg-info/20">Férias</Badge>;
      case "on_leave":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Licença</Badge>;
      case "inactive":
      case "terminated":
        return <Badge className="bg-muted text-muted-foreground">Inativo</Badge>;
      default:
        return <Badge className="bg-success/10 text-success">{status || 'Ativo'}</Badge>;
    }
  };

  const filteredEmployees = employees?.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !activeFilters.status || emp.status === activeFilters.status;
    const matchesDepartment = !activeFilters.department || (emp as any).department?.id === activeFilters.department;

    return matchesSearch && matchesStatus && matchesDepartment;
  }) || [];

  const handleSelectAll = () => {
    setSelectedIds(filteredEmployees.map(e => e.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectionState = selectedIds.length === 0
    ? 'none'
    : selectedIds.length === filteredEmployees.length
      ? 'all'
      : 'some';

  const handleBulkAction = async (actionId: string) => {
    if (actionId === 'delete') {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .in('id', selectedIds);

        if (error) throw error;

        toast.success(`${selectedIds.length} funcionários removidos com sucesso.`);
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      } catch (error: any) {
        toast.error(`Erro ao excluir: ${error.message}`);
      }
    } else {
      // Outras ações (Email/Export) ainda podem ser simuladas ou implementadas conforme necessário
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Ação "${actionId}" concluída para ${selectedIds.length} funcionários.`);
    }
    setSelectedIds([]);
  };

  const stats = [
    { title: "Total Funcionários", value: employees?.length || 0, icon: Users, color: "text-primary" },
    { title: "Ativos", value: employees?.filter(e => e.status === 'active').length || 0, icon: Users, color: "text-success" },
    { title: "Em Licença", value: employees?.filter(e => e.status === 'on_leave').length || 0, icon: Calendar, color: "text-warning" },
    {
      title: "Novos (30d)", value: employees?.filter(e => {
        const hireDate = new Date(e.hire_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return hireDate >= thirtyDaysAgo;
      }).length || 0, icon: Plus, trend: { value: 5 }, color: "text-info"
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'vacation', label: 'Férias' },
        { value: 'on_leave', label: 'Licença' },
        { value: 'inactive', label: 'Inativo' },
      ],
    },
    {
      key: 'department',
      label: 'Departamento',
      type: 'select' as const,
      options: departments?.map(d => ({ value: d.id, label: d.name })) || [],
    },
  ];

  const bulkActions = [
    { id: 'email', label: 'Enviar Email', icon: Mail },
    { id: 'export', label: 'Exportar', icon: Download },
    { id: 'delete', label: 'Excluir', icon: Users, variant: 'destructive' as const, requireConfirmation: true },
  ];

  const exportColumns = [
    { key: 'full_name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'cpf', label: 'CPF' },
    { key: 'employee_code', label: 'Matrícula' },
    { key: 'status', label: 'Status' },
    { key: 'hire_date', label: 'Data Admissão' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Recursos Humanos</h1>
          <p className="text-muted-foreground">Gestão de pessoas e talentos</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestora: Gleice Silva</Badge>

          <DataExport data={filteredEmployees} filename="funcionarios" columns={exportColumns} />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
                <DialogDescription>
                  {editingEmployee
                    ? 'Atualize as informações do colaborador abaixo.'
                    : 'Preencha os dados do novo funcionário.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={newEmployee.full_name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={newEmployee.cpf}
                      onChange={(e) => setNewEmployee({ ...newEmployee, cpf: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="employee_code">Matrícula</Label>
                    <Input
                      id="employee_code"
                      value={newEmployee.employee_code}
                      onChange={(e) => setNewEmployee({ ...newEmployee, employee_code: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="hire_date">Data Admissão</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={newEmployee.hire_date}
                      onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Select
                      value={newEmployee.department_id}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Select
                    value={newEmployee.position_id}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, position_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions?.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={createEmployee.isPending || updateEmployee.isPending}>
                  {(createEmployee.isPending || updateEmployee.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEmployee ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <QuickStats stats={stats} />

      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          totalCount={filteredEmployees.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          selectionState={selectionState}
          actions={bulkActions}
          onAction={handleBulkAction}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Funcionários</CardTitle>
              <CardDescription>Lista completa de colaboradores</CardDescription>
            </div>
            <SearchFilter
              searchPlaceholder="Buscar funcionário..."
              onSearchChange={setSearchTerm}
              filters={filters}
              activeFilters={activeFilters}
              onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value || '' }))}
              onClearFilters={() => setActiveFilters({})}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <EmptyState
              variant={searchTerm || Object.keys(activeFilters).length > 0 ? 'search' : 'empty'}
              title={searchTerm || Object.keys(activeFilters).length > 0 ? 'Nenhum resultado' : 'Nenhum funcionário'}
              description={searchTerm || Object.keys(activeFilters).length > 0
                ? 'Tente ajustar os filtros ou termo de busca'
                : 'Comece cadastrando seu primeiro funcionário'
              }
              actionLabel={!searchTerm && Object.keys(activeFilters).length === 0 ? 'Novo Funcionário' : undefined}
              onAction={() => setIsDialogOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectionState === 'all'}
                      onCheckedChange={(checked) => checked ? handleSelectAll() : handleDeselectAll()}
                    />
                  </TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className={selectedIds.includes(employee.id) ? 'bg-primary/5' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(employee.id)}
                        onCheckedChange={() => handleToggleSelect(employee.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate(`/crm/rh/funcionario/${employee.id}`)}
                      >
                        <Avatar className="h-9 w-9 transition-transform group-hover:scale-105">
                          <AvatarFallback className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {getInitials(employee.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2 group-hover:text-primary transition-colors">
                            {employee.full_name}
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                              ID: {employee.cpf.replace(/\D/g, '').slice(0, 3)}...
                            </Badge>
                          </p>
                          <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">{employee.employee_code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        {(employee as any).position?.title || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{(employee as any).department?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/crm/rh/funcionario/${employee.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(employee)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>Solicitar Férias</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => navigate("/crm/rh/demissao")}
                          >
                            Desligar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DetailDrawer
        open={!!selectedEmployee}
        onOpenChange={() => setSelectedEmployee(null)}
        title={selectedEmployee?.full_name || ''}
        subtitle={selectedEmployee?.email}
        badge={selectedEmployee && {
          label: selectedEmployee.status === 'active' ? 'Ativo' : 'Inativo',
          className: selectedEmployee.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        }}
        fields={[
          { label: 'Matrícula', value: selectedEmployee?.employee_code },
          { label: 'CPF', value: selectedEmployee?.cpf },
          { label: 'Email', value: selectedEmployee?.email },
          { label: 'Telefone', value: selectedEmployee?.phone },
          { label: 'Departamento', value: (selectedEmployee as any)?.department?.name },
          { label: 'Cargo', value: (selectedEmployee as any)?.position?.title },
          { label: 'Data Admissão', value: selectedEmployee?.hire_date, type: 'date' },
        ]}
        createdAt={selectedEmployee?.created_at}
        updatedAt={selectedEmployee?.updated_at}
        onEdit={() => toast.info('Edição em desenvolvimento')}
        onDelete={() => toast.info('Exclusão em desenvolvimento')}
      />
    </div>
  );
}
