import { useState } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSectorRequests } from "@/hooks/useSectorRequests";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserMinus,
  ClipboardCheck,
  Settings,
  Plus,
  GripVertical,
  Trash2,
  Edit,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Monitor
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  responsible_role: string | null;
  order_index: number;
  is_required: boolean;
}

interface Checklist {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
}

interface EmployeeChecklist {
  id: string;
  employee_id: string;
  checklist_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  employees: {
    full_name: string;
    employee_code: string;
  };
}

export default function DemissaoPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const isTechView = location.pathname.includes("/tech");

  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [newItem, setNewItem] = useState({ title: "", description: "", responsible_role: "", is_required: true });
  const [isStartingProcess, setIsStartingProcess] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // New state for details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProcessDetails, setSelectedProcessDetails] = useState<EmployeeChecklist | null>(null);

  const { createRequest } = useSectorRequests(isTechView ? "tech" : "rh");

  // Fetch termination checklists
  const { data: checklists, isLoading: loadingChecklists } = useQuery({
    queryKey: ["hr-checklists", "demissao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_checklists")
        .select("*")
        .eq("type", "demissao")
        .eq("is_active", true);
      if (error) throw error;
      return data as Checklist[];
    },
  });

  // Fetch checklist items
  const { data: checklistItems } = useQuery({
    queryKey: ["hr-checklist-items", selectedChecklist],
    queryFn: async () => {
      if (!selectedChecklist) return [];
      const { data, error } = await supabase
        .from("hr_checklist_items")
        .select("*")
        .eq("checklist_id", selectedChecklist)
        .order("order_index");
      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!selectedChecklist,
  });

  // Fetch employees for termination process
  const { data: employees } = useQuery({
    queryKey: ["employees-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, employee_code")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch ongoing termination processes
  const { data: ongoingProcesses } = useQuery({
    queryKey: ["hr-employee-checklists", "demissao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_employee_checklists")
        .select(`
          *,
          *,
          employees (*),
          hr_checklists!inner (type)
        `)
        .eq("hr_checklists.type", "demissao")
        .neq("status", "completed")
        .neq("status", "cancelled");
      if (error) throw error;
      return data as EmployeeChecklist[];
    },
  });

  // Add new checklist item
  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const maxOrder = checklistItems?.length ? Math.max(...checklistItems.map(i => i.order_index)) : 0;
      const { error } = await supabase
        .from("hr_checklist_items")
        .insert({
          checklist_id: selectedChecklist,
          title: item.title,
          description: item.description || null,
          responsible_role: item.responsible_role || null,
          is_required: item.is_required,
          order_index: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-checklist-items"] });
      setIsAddingItem(false);
      setNewItem({ title: "", description: "", responsible_role: "", is_required: true });
      toast.success("Item adicionado ao checklist");
    },
    onError: () => toast.error("Erro ao adicionar item"),
  });

  // Delete checklist item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("hr_checklist_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-checklist-items"] });
      toast.success("Item removido");
    },
    onError: () => toast.error("Erro ao remover item"),
  });

  // Start termination process for employee
  const startProcessMutation = useMutation({
    mutationFn: async ({ employeeId, checklistId }: { employeeId: string; checklistId: string }) => {
      // Create employee checklist
      const { data: empChecklist, error: checklistError } = await supabase
        .from("hr_employee_checklists")
        .insert({
          employee_id: employeeId,
          checklist_id: checklistId,
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (checklistError) throw checklistError;

      // Get checklist items
      const { data: items, error: itemsError } = await supabase
        .from("hr_checklist_items")
        .select("id")
        .eq("checklist_id", checklistId);
      if (itemsError) throw itemsError;

      // Create employee checklist items
      if (items && items.length > 0) {
        const employeeItems = items.map(item => ({
          employee_checklist_id: empChecklist.id,
          checklist_item_id: item.id,
          is_completed: false,
        }));
        const { error: insertError } = await supabase
          .from("hr_employee_checklist_items")
          .insert(employeeItems);
        if (insertError) throw insertError;
      }

      // Update employee status to "demitido"
      const { error: updateError } = await supabase
        .from("employees")
        .update({ status: "terminated" })
        .eq("id", employeeId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-employee-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsStartingProcess(false);
      setSelectedEmployee("");
      toast.success("Processo de demissão iniciado");
    },
    onError: () => toast.error("Erro ao iniciar processo"),
  });

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "rh": return "bg-blue-100 text-blue-800";
      case "tech": return "bg-purple-100 text-purple-800";
      case "juridico": return "bg-amber-100 text-amber-800";
      case "financeiro": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 notranslate" translate="no">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserMinus className="h-7 w-7 text-destructive" />
            Demissão
          </h1>
          <p className="text-muted-foreground">
            Gerencie checklists e processos de desligamento
          </p>
        </div>
      </div>
      {!isTechView && (
        <Dialog open={isStartingProcess} onOpenChange={setIsStartingProcess}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Plus className="h-4 w-4 mr-2" />
              Iniciar Demissão
            </Button>
          </DialogTrigger>
          <DialogContent className="notranslate" translate="no">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Iniciar Processo de Demissão
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive">
                  Atenção: Ao iniciar este processo, o funcionário será marcado como desligado no sistema.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Funcionário</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent className="notranslate" translate="no">
                    {employees?.length ? (
                      employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_code})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Nenhum funcionário encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Checklist</Label>
                <Select
                  value={selectedChecklist || ""}
                  onValueChange={setSelectedChecklist}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o checklist" />
                  </SelectTrigger>
                  <SelectContent>
                    {checklists?.map(cl => (
                      <SelectItem key={cl.id} value={cl.id}>
                        {cl.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => {
                  if (selectedEmployee && selectedChecklist) {
                    startProcessMutation.mutate({
                      employeeId: selectedEmployee,
                      checklistId: selectedChecklist
                    });
                  }
                }}
                disabled={!selectedEmployee || !selectedChecklist}
              >
                Confirmar Demissão
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* Stats */}
      < div className="grid grid-cols-1 md:grid-cols-4 gap-4" >
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <Users className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{ongoingProcesses?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídos (mês)</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
              <p className="text-2xl font-bold">7 dias</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Checklists</p>
              <p className="text-2xl font-bold">{checklists?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div >

      {/* Main Content */}
      < Tabs defaultValue="processos" className="space-y-4" >
        <TabsList>
          <TabsTrigger value="processos">
            <Users className="h-4 w-4 mr-2" />
            Processos em Andamento
          </TabsTrigger>
          {!isTechView && (
            <TabsTrigger value="checklists">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Gerenciar Checklists
            </TabsTrigger>
          )}
        </TabsList>

        {/* Ongoing Processes */}
        <TabsContent value="processos" className="space-y-4">
          {ongoingProcesses && ongoingProcesses.length > 0 ? (
            <div className="grid gap-4">
              {ongoingProcesses.map(process => (
                <Card key={process.id} className="border-destructive/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-destructive/10">
                          <UserMinus className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{process.employees?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {process.employees?.employee_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Progresso</p>
                          <Progress value={30} className="w-32 h-2" />
                        </div>
                        <Badge variant="destructive">
                          Em Andamento
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (isTechView) {
                                const confirm = window.confirm(`Confirmar conclusão do processo de TI para ${process.employees?.full_name}? O RH será notificado.`);
                                if (confirm) {
                                  await createRequest({
                                    fromSector: 'tech',
                                    toSector: 'rh',
                                    title: `TI Concluído: ${process.employees?.full_name}`,
                                    description: `Procedimentos de TI e recolhimento de equipamentos finalizados para ${process.employees?.full_name}.`,
                                    priority: 'high',
                                    requesterName: 'Tech'
                                  });
                                }
                              } else {
                                const confirm = window.confirm(`Deseja solicitar o desligamento de ${process.employees?.full_name} para o TI (Tech)?`);
                                if (confirm) {
                                  await createRequest({
                                    fromSector: 'rh',
                                    toSector: 'tech',
                                    title: `Desligamento: ${process.employees?.full_name}`,
                                    description: `Solicitação de desligamento para o funcionário ${process.employees?.full_name} (Código: ${process.employees?.employee_code}). Por favor, providenciar recuo de equipamentos e bloqueio de contas.`,
                                    priority: 'urgent',
                                    requesterName: 'RH'
                                  });
                                }
                              }
                            }}
                          >
                            <Monitor className="h-4 w-4 mr-2" />
                            {isTechView ? "Concluir TI / Notificar RH" : "Notificar TI"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProcessDetails(process);
                              setDetailsOpen(true);
                            }}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Employee Details Dialog */}
              <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Detalhes do Funcionário</DialogTitle>
                  </DialogHeader>
                  {selectedProcessDetails?.employees && (
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Nome Completo</Label>
                        <p className="font-medium">{selectedProcessDetails.employees.full_name}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Código</Label>
                        <p className="font-medium">{selectedProcessDetails.employees.employee_code}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">CPF</Label>
                        <p className="font-medium">{selectedProcessDetails.employees.cpf || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedProcessDetails.employees.email || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Telefone</Label>
                        <p className="font-medium">{selectedProcessDetails.employees.phone || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Data de Admissão</Label>
                        <p className="font-medium">
                          {selectedProcessDetails.employees.hire_date
                            ? format(new Date(selectedProcessDetails.employees.hire_date), 'dd/MM/yyyy')
                            : '-'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge>{selectedProcessDetails.employees.status}</Badge>
                      </div>
                      <div className="col-span-2 space-y-1 pt-4 border-t">
                        <Label className="text-muted-foreground">Checklist Atual</Label>
                        <p className="font-medium">
                          {(checklists?.find(c => c.id === selectedProcessDetails.checklist_id)?.title)}
                        </p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum processo de demissão em andamento
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Checklist Management */}
        <TabsContent value="checklists" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checklist List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Checklists</CardTitle>
                <CardDescription>Selecione para editar os itens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingChecklists ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : (
                  checklists?.map(checklist => (
                    <div
                      key={checklist.id}
                      onClick={() => setSelectedChecklist(checklist.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedChecklist === checklist.id
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      <p className="font-medium">{checklist.title}</p>
                      {checklist.description && (
                        <p className={`text-sm ${selectedChecklist === checklist.id
                          ? "text-destructive-foreground/80"
                          : "text-muted-foreground"
                          }`}>
                          {checklist.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Checklist Items */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Itens do Checklist</CardTitle>
                  <CardDescription>
                    {selectedChecklist
                      ? `${checklistItems?.length || 0} itens`
                      : "Selecione um checklist"
                    }
                  </CardDescription>
                </div>
                {selectedChecklist && (
                  <Button size="sm" onClick={() => setIsAddingItem(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedChecklist ? (
                  <div className="space-y-2">
                    {checklistItems?.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg group"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.title}</p>
                            {item.is_required && (
                              <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        {item.responsible_role && (
                          <Badge className={getRoleBadgeColor(item.responsible_role)}>
                            {item.responsible_role.toUpperCase()}
                          </Badge>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Add Item Form */}
                    {isAddingItem && (
                      <div className="p-4 border rounded-lg space-y-4 bg-background">
                        <div className="space-y-2">
                          <Label>Título *</Label>
                          <Input
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            placeholder="Ex: Recolher equipamentos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Detalhes do item..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Responsável</Label>
                            <Select
                              value={newItem.responsible_role}
                              onValueChange={(v) => setNewItem({ ...newItem, responsible_role: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rh">RH</SelectItem>
                                <SelectItem value="tech">Tech</SelectItem>
                                <SelectItem value="juridico">Jurídico</SelectItem>
                                <SelectItem value="financeiro">Financeiro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Checkbox
                              id="required"
                              checked={newItem.is_required}
                              onCheckedChange={(c) => setNewItem({ ...newItem, is_required: !!c })}
                            />
                            <Label htmlFor="required">Item obrigatório</Label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => addItemMutation.mutate(newItem)}
                            disabled={!newItem.title}
                          >
                            Salvar
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione um checklist para ver os itens</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs >
    </div >
  );
}