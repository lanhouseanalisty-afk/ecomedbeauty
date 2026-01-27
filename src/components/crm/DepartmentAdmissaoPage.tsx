import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Monitor,
  Send,
  X,
  PlusCircle,
  Loader2,
  RefreshCw,
  Eye
} from "lucide-react";
import { useDepartmentAdmissions } from "@/hooks/useAdmission";
import { useTechAssets } from "@/hooks/useTech";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const stepLabels: Record<string, string> = {
  rh: "RH",
  gestor: "Gestor",
  ti: "TI",
  rh_review: "Revisão RH",
  colaborador: "Colaborador",
  concluido: "Concluído",
};

const stepColors: Record<string, string> = {
  rh: "bg-blue-500",
  gestor: "bg-purple-500",
  ti: "bg-orange-500",
  rh_review: "bg-cyan-500",
  colaborador: "bg-green-500",
  concluido: "bg-emerald-500",
};

const formatDateSafe = (dateString: string | null | undefined, formatStr: string = "dd/MM/yyyy") => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return format(date, formatStr, { locale: ptBR });
  } catch (e) {
    return "—";
  }
};

interface DepartmentAdmissaoPageProps {
  departmentSlug: string;
  departmentName: string;
}

export default function DepartmentAdmissaoPage({ departmentSlug, departmentName }: DepartmentAdmissaoPageProps) {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  const {
    processes,
    isLoading,
    updateManagerStep,
    updateITStep,
    completeAdmission
  } = useDepartmentAdmissions(departmentSlug);

  const { isAdmin } = useUserRole();

  // Para TI: mostrar todos os processos que estão no step 'ti', independente do departamento
  // Para outros departamentos: mostrar processos do próprio departamento
  // Admin vê todos os processos
  const isTech = departmentSlug === 'tech';

  const pendingProcesses = processes?.filter(p =>
    p.status !== 'completed' &&
    p.status !== 'cancelled' &&
    (isAdmin || isTech ? true : p.target_department === departmentSlug)
  ) || [];

  // Para TI: aguardando ação são os processos no step 'ti'
  // Para outros (gestores): aguardando ação são os processos no step 'gestor' do seu departamento
  // Admin vê todos os processos pendentes de ação
  const awaitingMyAction = isAdmin
    ? pendingProcesses.filter(p => p.current_step === 'gestor' || p.current_step === 'ti')
    : isTech
      ? pendingProcesses.filter(p => p.current_step === 'ti')
      : pendingProcesses.filter(p => p.current_step === 'gestor');
  const awaitingIT = pendingProcesses.filter(p => p.current_step === 'ti');
  const completedProcesses = processes?.filter(p => p.status === 'completed' && (isAdmin || isTech ? true : p.target_department === departmentSlug)) || [];

  const getProgressValue = (step: string) => {
    const steps = ['rh', 'gestor', 'ti', 'rh_review', 'colaborador', 'concluido'];
    const index = steps.indexOf(step);
    if (index === -1) return 0;
    return ((index + 1) / steps.length) * 100;
  };

  // Opções de equipamentos (igual ao AdmissaoForm)
  const EQUIPAMENTOS_OPTIONS = [
    { value: "Notebook", label: "Notebook" },
    { value: "Desktop", label: "Desktop" },
    { value: "Celular", label: "Celular" },
    { value: "Monitor", label: "Monitor" },
    { value: "HeadSet", label: "HeadSet" },
    { value: "Mouse", label: "Mouse" },
  ];

  // Opções de softwares (igual ao AdmissaoForm)
  const SOFTWARES_OPTIONS = [
    { value: "Microsoft 365", label: "Microsoft 365" },
    { value: "SAP B1", label: "SAP B1" },
    { value: "Salesforce", label: "Salesforce" },
  ];

  // Opções de acessos (igual ao AdmissaoForm)
  const ACESSOS_OPTIONS = [
    { value: "AD", label: "AD" },
    { value: "Teams", label: "Teams" },
    { value: "Pastas de Rede / Sharepoint", label: "Pastas de Rede / Sharepoint" },
    { value: "VPN", label: "VPN" },
    { value: "Outros", label: "Outros" },
  ];

  // Estado do formulário do gestor (alinhado com AdmissaoForm)
  const [managerForm, setManagerForm] = useState({
    buddy_mentor: "",
    equipamentos_necessarios: [] as string[], // Lista de equipamentos selecionados
    softwares_necessarios: [] as string[],
    acessos_necessarios: [] as string[], // Mapeado para systems_list no banco
    sharepoint_pasta: "",
    outros_acessos: "",
    necessita_impressora: false,
    manager_observations: "",
  });

  // Estado do formulário de TI - 12 itens do checklist
  const [itForm, setItForm] = useState({
    it_responsible: "",           // 1. Responsável TI
    user_ad_created: false,       // 2. Conta AD criada?
    email_created: "",            // 3. E-mail corporativo criado?
    microsoft_licenses: [] as string[], // 4. Licenças Microsoft 365 aplicadas
    vpn_configured: false,        // 5. VPN configurada?
    software_list_installed: [] as string[], // 6. Softwares instalados
    sap_user_created: false,      // 7. Usuário SAP B1 criado?
    salesforce_profile_created: false, // 8. Perfil Salesforce criado?
    network_folders_released: false, // 9. Pastas de rede liberadas?
    printers_configured: false,   // 10. Impressoras configuradas?
    general_tests_done: false,    // 11. Testes gerais realizados?
    it_observations: "",          // 12. Observações da TI
  });

  const { assets, updateAsset, createAsset } = useTechAssets();
  const [assignedAssetIds, setAssignedAssetIds] = useState<string[]>([]);
  const [isTransfer, setIsTransfer] = useState(false);
  const [isNewAssetOpen, setIsNewAssetOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    device_type: 'notebook',
    status: 'available',
    brand: '',
    model: '',
    asset_tag: '',
    serial_number: '',
    location: 'TI - Estoque Central',
    assigned_to_name: ''
  });

  // Filter available assets based on transfer mode
  const filteredAssets = assets?.filter(a => {
    if (isTransfer) {
      // If transfer, show assets currently in use
      return a.status === 'in_use';
    }
    // Otherwise show available stock
    return a.status === 'available';
  });

  const handleCreateAsset = () => {
    if (!newAsset.asset_tag || !newAsset.model || !newAsset.brand || !newAsset.device_type) {
      toast.error("Preencha os campos obrigatórios (*)");
      return;
    }

    createAsset.mutate(newAsset as any, {
      onSuccess: (data) => {
        setIsNewAssetOpen(false);
        // reset form
        setNewAsset({
          device_type: 'notebook',
          status: 'available',
          brand: '',
          model: '',
          asset_tag: '',
          serial_number: '',
          location: 'TI - Estoque Central',
          assigned_to_name: ''
        });
        // Auto-select the newly created asset
        if (data && data.id) {
          setAssignedAssetIds(prev => [...prev, data.id]);
          toast.success("Ativo criado e selecionado!");
        }
      }
    });
  };

  // Opções de licenças Microsoft 365
  const MICROSOFT_LICENSES_OPTIONS = [
    { value: "Microsoft 365 Business Basic", label: "Business Basic" },
    { value: "Microsoft 365 Business Standard", label: "Business Standard" },
    { value: "Microsoft 365 Business Premium", label: "Business Premium" },
    { value: "Microsoft 365 E3", label: "E3" },
    { value: "Microsoft 365 E5", label: "E5" },
  ];

  const handleManagerSubmit = async (processId: string) => {
    try {
      await updateManagerStep.mutateAsync({
        id: processId,
        data: managerForm,
      });
      setSelectedProcess(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleITSubmit = async (processId: string) => {
    try {
      await updateITStep.mutateAsync({
        id: processId,
        data: itForm,
      });

      // AUTOMATION: Assign selected assets
      if (assignedAssetIds.length > 0) {
        const process = processes?.find(p => p.id === processId);
        if (process && assets) {
          const employeeName = process.employee_name;
          const targetDept = process.target_department || departmentSlug;

          toast.loading("Vinculando ativos ao colaborador...");
          await Promise.all(assignedAssetIds.map(async (assetId) => {
            return updateAsset.mutateAsync({
              id: assetId,
              status: 'in_use',
              assigned_to_name: employeeName,
              location: targetDept.toUpperCase(), // Best guess for location
              // assigned_to: process.employee_id // We don't have employee_id yet usually in admission flow until created? 
              // actually admission creates employee record? The admission "concluido" step usually creates the Employee record.
              // At 'TI' step, the employee might not exist in 'employees' table yet, just in 'admission_processes'.
              // So we just update the text fields 'assigned_to_name'.
            } as any);
          }));
          toast.dismiss();
          toast.success("Ativos vinculados com sucesso!");
        }
      }

      setAssignedAssetIds([]); // Reset
      setSelectedProcess(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-primary" />
            Admissão - {departmentName}
          </h1>
          <p className="text-muted-foreground">
            Processos de admissão destinados ao seu departamento
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Sua Ação</p>
              <p className="text-2xl font-bold">{awaitingMyAction.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Monitor className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando TI</p>
              <p className="text-2xl font-bold">{awaitingIT.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total em Andamento</p>
              <p className="text-2xl font-bold">{pendingProcesses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold">{completedProcesses.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes" className="relative">
            <Clock className="h-4 w-4 mr-2" />
            Aguardando Sua Ação
            {awaitingMyAction.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {awaitingMyAction.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="todos">
            <Users className="h-4 w-4 mr-2" />
            Todos do Setor
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Concluídos
          </TabsTrigger>
        </TabsList>

        {/* Aguardando ação */}
        <TabsContent value="pendentes" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : awaitingMyAction.length > 0 ? (
            <div className="grid gap-4">
              {awaitingMyAction.map(process => (
                <Card key={process.id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <UserPlus className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {process.employee_name}
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                              ID: {process.cpf.replace(/\D/g, '').slice(0, 3)}...
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {process.position}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Início previsto: {formatDateSafe(process.start_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Aguardando suas definições
                        </Badge>
                        <Button onClick={() => setSelectedProcess(process.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Preencher
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum processo aguardando sua ação
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Todos os processos do setor */}
        <TabsContent value="todos" className="space-y-4">
          {pendingProcesses.length > 0 ? (
            <div className="grid gap-4">
              {pendingProcesses.map(process => (
                <Card key={process.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {process.employee_name}
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                              ID: {process.cpf.replace(/\D/g, '').slice(0, 3)}...
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {process.position}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={`${stepColors[process.current_step] || 'bg-muted'} text-white`}>
                            {stepLabels[process.current_step] || process.current_step}
                          </Badge>
                          <Progress value={getProgressValue(process.current_step)} className="w-32 h-2 mt-2" />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedProcess(process.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum processo de admissão para este departamento
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Concluídos */}
        <TabsContent value="concluidos" className="space-y-4">
          {completedProcesses.length > 0 ? (
            <div className="grid gap-4">
              {completedProcesses.map(process => (
                <Card key={process.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {process.employee_name}
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                              ID: {process.cpf.replace(/\D/g, '').slice(0, 3)}...
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {process.position}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Concluído
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum processo concluído</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para preencher formulário */}
      <Dialog open={!!selectedProcess} onOpenChange={() => setSelectedProcess(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {(() => {
                if (!selectedProcess || !processes) return 'Detalhes';
                const process = processes.find(p => p.id === selectedProcess);
                if (!process) return 'Detalhes';
                // Admin vê baseado no step atual do processo
                if (isAdmin) {
                  if (process.current_step === 'ti') return 'Configuração TI';
                  if (process.current_step === 'gestor') return 'Definições do Gestor';
                  return 'Detalhes do Processo';
                }
                return isTech ? 'Configuração TI' : 'Definições do Gestor';
              })()}
            </DialogTitle>
          </DialogHeader>

          {selectedProcess && processes && (
            <div className="space-y-6">
              {(() => {
                const process = processes.find(p => p.id === selectedProcess);
                if (!process) return null;

                // Para admin, determinar qual formulário mostrar baseado no step atual
                const showITForm = isAdmin ? process.current_step === 'ti' : isTech;
                const showManagerForm = isAdmin ? process.current_step === 'gestor' : !isTech;

                return (
                  <>
                    {/* Info do colaborador */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Colaborador:</span>
                          <p className="font-medium flex items-center gap-2">
                            {process.employee_name}
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                              ID: {process.cpf.replace(/\D/g, '').slice(0, 3)}...
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cargo:</span>
                          <p className="font-medium">{process.position}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data de Início:</span>
                          <p className="font-medium">
                            {formatDateSafe(process.start_date)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Regime:</span>
                          <p className="font-medium">{process.work_regime}</p>
                        </div>
                        {showITForm && process.manager_observations && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Observações do Gestor:</span>
                            <p className="font-medium">{process.manager_observations}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formulário baseado no step do processo (para admin) ou tipo de departamento */}
                    {showITForm ? (
                      /* Formulário da TI - 12 itens do checklist */
                      <div className="space-y-6">
                        {/* Equipamentos e Softwares Solicitados pelo Gestor (informativo) */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                          <Label className="text-base font-medium">Solicitações do Gestor</Label>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Equipamentos:</span>
                              <div className="mt-1 space-y-1">
                                {process.needs_laptop && <span className="block">• Notebook/Desktop</span>}
                                {process.needs_monitor && <span className="block">• Monitor</span>}
                                {process.needs_headset && <span className="block">• Headset</span>}
                                {process.needs_keyboard && <span className="block">• Teclado</span>}
                                {process.needs_mouse && <span className="block">• Mouse</span>}
                                {process.needs_printer && <span className="block">• Impressora</span>}
                                {!process.needs_laptop && !process.needs_monitor && !process.needs_headset &&
                                  !process.needs_keyboard && !process.needs_mouse && !process.needs_printer && (
                                    <span className="text-muted-foreground italic">Nenhum solicitado</span>
                                  )}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Softwares:</span>
                              <div className="mt-1 space-y-1">
                                {process.software_list && process.software_list.length > 0 ? (
                                  process.software_list.map((sw, i) => (
                                    <span key={i} className="block">• {sw}</span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground italic">Nenhum solicitado</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {process.systems_list && process.systems_list.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">Acessos:</span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {process.systems_list.map((sys, i) => (
                                  <Badge key={i} variant="outline">{sys}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SELEÇÃO DE ATIVOS DO ESTOQUE (AUTOMACAO) */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3 border border-blue-100 dark:border-blue-800">
                          <div className="flex flex-col gap-2">
                            <Label className="text-base font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              Vincular Ativos
                            </Label>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="transfer-mode"
                                  checked={isTransfer}
                                  onCheckedChange={setIsTransfer}
                                />
                                <Label htmlFor="transfer-mode" className="text-sm cursor-pointer">
                                  Repasse entre funcionários?
                                </Label>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => setIsNewAssetOpen(true)} className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-100">
                                <PlusCircle className="h-3 w-3" />
                                Novo Equipamento
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Select onValueChange={(val) => {
                              if (!assignedAssetIds.includes(val)) {
                                setAssignedAssetIds([...assignedAssetIds, val]);
                              }
                            }}>
                              <SelectTrigger className="bg-background notranslate">
                                <SelectValue placeholder={isTransfer ? "Selecione um ativo em uso..." : "Selecione um ativo do estoque..."} />
                              </SelectTrigger>
                              <SelectContent className="notranslate">
                                {filteredAssets?.map(asset => (
                                  <SelectItem key={asset.id} value={asset.id}>
                                    <span className="font-medium mr-2">[{asset.asset_tag}]</span>
                                    {asset.model}
                                    {isTransfer && asset.assigned_to_name && (
                                      <span className="text-muted-foreground ml-2 text-xs">
                                        (Ex: {asset.assigned_to_name})
                                      </span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {assignedAssetIds.length > 0 && (
                              <div className="space-y-2 mt-2">
                                <Label className="text-xs text-muted-foreground">Itens selecionados para vínculo:</Label>
                                {assignedAssetIds.map(id => {
                                  const asset = assets?.find(a => a.id === id);
                                  return (
                                    <div key={id} className="flex items-center justify-between bg-background p-2 rounded border text-sm">
                                      <span>
                                        {asset?.device_type === 'notebook' && <Monitor className="inline h-3 w-3 mr-1 text-blue-500" />}
                                        <strong>{asset?.asset_tag}</strong> - {asset?.model}
                                        {asset?.assigned_to_name && isTransfer && (
                                          <span className="text-xs text-amber-600 block">
                                            <RefreshCw className="inline h-3 w-3 mr-1" />
                                            Transferindo de: {asset.assigned_to_name}
                                          </span>
                                        )}
                                      </span>
                                      <Button
                                        variant="ghost" size="icon" className="h-6 w-6 text-red-500"
                                        onClick={() => setAssignedAssetIds(ids => ids.filter(i => i !== id))}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 1. Responsável TI */}
                        <div>
                          <Label htmlFor="it_responsible">1. Responsável TI</Label>
                          <Input
                            id="it_responsible"
                            placeholder="Nome do técnico responsável"
                            value={itForm.it_responsible}
                            onChange={(e) =>
                              setItForm(prev => ({ ...prev, it_responsible: e.target.value }))
                            }
                            className="mt-2"
                          />
                        </div>

                        {/* 2. Conta AD criada? */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="user_ad_created"
                            checked={itForm.user_ad_created}
                            onCheckedChange={(checked) =>
                              setItForm(prev => ({ ...prev, user_ad_created: !!checked }))
                            }
                          />
                          <Label htmlFor="user_ad_created">2. Conta AD criada?</Label>
                        </div>

                        {/* 3. E-mail corporativo criado? */}
                        <div>
                          <Label htmlFor="email_created">3. E-mail corporativo criado?</Label>
                          <Input
                            id="email_created"
                            placeholder="exemplo@medbeauty.com.br"
                            value={itForm.email_created}
                            onChange={(e) =>
                              setItForm(prev => ({ ...prev, email_created: e.target.value }))
                            }
                            className="mt-2"
                          />
                        </div>

                        {/* 4. Licença Microsoft 365 aplicada? */}
                        <div>
                          <Label className="text-base font-medium">4. Licenças Microsoft 365 aplicadas</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {MICROSOFT_LICENSES_OPTIONS.map(item => (
                              <div key={item.value} className="flex items-center space-x-2 rounded-md border p-3">
                                <Checkbox
                                  id={`lic-${item.value}`}
                                  checked={itForm.microsoft_licenses.includes(item.value)}
                                  onCheckedChange={(checked) =>
                                    setItForm(prev => ({
                                      ...prev,
                                      microsoft_licenses: checked
                                        ? [...prev.microsoft_licenses, item.value]
                                        : prev.microsoft_licenses.filter(v => v !== item.value)
                                    }))
                                  }
                                />
                                <Label htmlFor={`lic-${item.value}`}>{item.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 5. VPN configurada? */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vpn_configured"
                            checked={itForm.vpn_configured}
                            onCheckedChange={(checked) =>
                              setItForm(prev => ({ ...prev, vpn_configured: !!checked }))
                            }
                          />
                          <Label htmlFor="vpn_configured">5. VPN configurada?</Label>
                        </div>

                        {/* 6. Softwares instalados? */}
                        <div>
                          <Label className="text-base font-medium">6. Softwares instalados</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {SOFTWARES_OPTIONS.map(item => (
                              <div key={item.value} className="flex items-center space-x-2 rounded-md border p-3">
                                <Checkbox
                                  id={`soft-installed-${item.value}`}
                                  checked={itForm.software_list_installed.includes(item.value)}
                                  onCheckedChange={(checked) =>
                                    setItForm(prev => ({
                                      ...prev,
                                      software_list_installed: checked
                                        ? [...prev.software_list_installed, item.value]
                                        : prev.software_list_installed.filter(v => v !== item.value)
                                    }))
                                  }
                                />
                                <Label htmlFor={`soft-installed-${item.value}`}>{item.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 7. Usuário SAP B1 criado? */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sap_user_created"
                            checked={itForm.sap_user_created}
                            onCheckedChange={(checked) =>
                              setItForm(prev => ({ ...prev, sap_user_created: !!checked }))
                            }
                          />
                          <Label htmlFor="sap_user_created">7. Usuário SAP B1 criado?</Label>
                        </div>

                        {/* 8. Perfil Salesforce criado? */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="salesforce_profile_created"
                            checked={itForm.salesforce_profile_created}
                            onCheckedChange={(checked) =>
                              setItForm(prev => ({ ...prev, salesforce_profile_created: !!checked }))
                            }
                          />
                          <Label htmlFor="salesforce_profile_created">8. Perfil Salesforce criado?</Label>
                        </div>

                        {/* 9. Pastas de rede liberadas? */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="network_folders_released"
                            checked={itForm.network_folders_released}
                            onCheckedChange={(checked) =>
                              setItForm(prev => ({ ...prev, network_folders_released: !!checked }))
                            }
                          />
                          <Label htmlFor="network_folders_released">9. Pastas de rede liberadas?</Label>
                        </div>

                        {/* 10. Impressoras configuradas? */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="printers_configured"
                            checked={itForm.printers_configured}
                            onCheckedChange={(checked) =>
                              setItForm(prev => ({ ...prev, printers_configured: !!checked }))
                            }
                          />
                          <Label htmlFor="printers_configured">10. Impressoras configuradas?</Label>
                        </div>

                        {/* 11. Testes gerais realizados? */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="general_tests_done"
                            checked={itForm.general_tests_done}
                            onCheckedChange={(checked) =>
                              setItForm(prev => ({ ...prev, general_tests_done: !!checked }))
                            }
                          />
                          <Label htmlFor="general_tests_done">11. Testes gerais realizados?</Label>
                        </div>

                        {/* 12. Observações da TI */}
                        <div>
                          <Label htmlFor="it_observations">12. Observações da TI</Label>
                          <Textarea
                            id="it_observations"
                            placeholder="Informações adicionais sobre a configuração..."
                            value={itForm.it_observations}
                            onChange={(e) =>
                              setItForm(prev => ({ ...prev, it_observations: e.target.value }))
                            }
                            className="mt-2"
                          />
                        </div>
                      </div>
                    ) : showManagerForm ? (
                      /* Formulário do Gestor - Alinhado com AdmissaoForm */
                      <div className="space-y-6">
                        {/* 1. Buddy/Mentor */}
                        <div>
                          <Label htmlFor="buddy_mentor">1. Buddy/Mentor designado</Label>
                          <Input
                            id="buddy_mentor"
                            placeholder="Nome do buddy/mentor"
                            value={managerForm.buddy_mentor}
                            onChange={(e) =>
                              setManagerForm(prev => ({ ...prev, buddy_mentor: e.target.value }))
                            }
                            className="mt-2"
                          />
                        </div>

                        {/* 2. Equipamentos necessários */}
                        <div>
                          <Label className="text-base font-medium">2. Equipamentos necessários</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {EQUIPAMENTOS_OPTIONS.map(item => (
                              <div key={item.value} className="flex items-center space-x-2 rounded-md border p-3">
                                <Checkbox
                                  id={`equip-${item.value}`}
                                  checked={managerForm.equipamentos_necessarios.includes(item.value)}
                                  onCheckedChange={(checked) =>
                                    setManagerForm(prev => ({
                                      ...prev,
                                      equipamentos_necessarios: checked
                                        ? [...prev.equipamentos_necessarios, item.value]
                                        : prev.equipamentos_necessarios.filter(v => v !== item.value)
                                    }))
                                  }
                                />
                                <Label htmlFor={`equip-${item.value}`}>{item.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Softwares necessários */}
                        <div>
                          <Label className="text-base font-medium">3. Softwares necessários</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {SOFTWARES_OPTIONS.map(item => (
                              <div key={item.value} className="flex items-center space-x-2 rounded-md border p-3">
                                <Checkbox
                                  id={`soft-${item.value}`}
                                  checked={managerForm.softwares_necessarios.includes(item.value)}
                                  onCheckedChange={(checked) =>
                                    setManagerForm(prev => ({
                                      ...prev,
                                      softwares_necessarios: checked
                                        ? [...prev.softwares_necessarios, item.value]
                                        : prev.softwares_necessarios.filter(v => v !== item.value)
                                    }))
                                  }
                                />
                                <Label htmlFor={`soft-${item.value}`}>{item.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 4. Acessos necessários */}
                        <div>
                          <Label className="text-base font-medium">4. Acessos necessários</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {ACESSOS_OPTIONS.map(item => (
                              <div key={item.value} className="flex items-center space-x-2 rounded-md border p-3">
                                <Checkbox
                                  id={`acesso-${item.value}`}
                                  checked={managerForm.acessos_necessarios.includes(item.value)}
                                  onCheckedChange={(checked) =>
                                    setManagerForm(prev => ({
                                      ...prev,
                                      acessos_necessarios: checked
                                        ? [...prev.acessos_necessarios, item.value]
                                        : prev.acessos_necessarios.filter(v => v !== item.value)
                                    }))
                                  }
                                />
                                <Label htmlFor={`acesso-${item.value}`}>{item.label}</Label>
                              </div>
                            ))}
                          </div>

                          {/* Campo condicional para Sharepoint */}
                          {managerForm.acessos_necessarios.includes("Pastas de Rede / Sharepoint") && (
                            <div className="mt-3 pl-4 border-l-2 border-primary/30">
                              <Label htmlFor="sharepoint_pasta">
                                Pasta do Sharepoint <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="sharepoint_pasta"
                                placeholder="Ex: /Documentos/Projeto/Equipe"
                                value={managerForm.sharepoint_pasta}
                                onChange={(e) =>
                                  setManagerForm(prev => ({ ...prev, sharepoint_pasta: e.target.value }))
                                }
                                className="mt-2"
                              />
                            </div>
                          )}

                          {/* Campo condicional para Outros */}
                          {managerForm.acessos_necessarios.includes("Outros") && (
                            <div className="mt-3 pl-4 border-l-2 border-primary/30">
                              <Label htmlFor="outros_acessos">
                                Especifique outros acessos <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="outros_acessos"
                                placeholder="Descreva os outros acessos necessários..."
                                value={managerForm.outros_acessos}
                                onChange={(e) =>
                                  setManagerForm(prev => ({ ...prev, outros_acessos: e.target.value }))
                                }
                                className="mt-2"
                              />
                            </div>
                          )}
                        </div>

                        {/* 5. Necessita impressora */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="necessita_impressora"
                            checked={managerForm.necessita_impressora}
                            onCheckedChange={(checked) =>
                              setManagerForm(prev => ({ ...prev, necessita_impressora: !!checked }))
                            }
                          />
                          <Label htmlFor="necessita_impressora">5. Necessita impressora?</Label>
                        </div>

                        {/* 6. Observações */}
                        <div>
                          <Label htmlFor="observations">6. Observações do Gestor</Label>
                          <Textarea
                            id="observations"
                            placeholder="Informe sistemas, acessos ou requisitos específicos..."
                            value={managerForm.manager_observations}
                            onChange={(e) =>
                              setManagerForm(prev => ({ ...prev, manager_observations: e.target.value }))
                            }
                            className="mt-2"
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setSelectedProcess(null)}>
                        Cancelar
                      </Button>
                      {showITForm ? (
                        <Button onClick={() => handleITSubmit(process.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar para RH
                        </Button>
                      ) : showManagerForm ? (
                        <Button onClick={() => handleManagerSubmit(process.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar para TI
                        </Button>
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </div>
          )
          }
        </DialogContent >
      </Dialog >
      <Dialog open={isNewAssetOpen} onOpenChange={setIsNewAssetOpen}>
        <DialogContent className="sm:max-w-[600px] notranslate">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Equipamento</DialogTitle>
            <DialogDescription>
              Cadastre um novo ativo para vincular imediatamente a esta admissão.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo *</Label>
                <Select
                  value={newAsset.device_type}
                  onValueChange={(v: any) => setNewAsset({ ...newAsset, device_type: v })}
                >
                  <SelectTrigger className="notranslate"><SelectValue /></SelectTrigger>
                  <SelectContent className="notranslate">
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Marca *</Label>
                <Input
                  placeholder="Ex: Dell"
                  value={newAsset.brand}
                  onChange={e => setNewAsset({ ...newAsset, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Modelo *</Label>
                <Input
                  placeholder="Ex: Latitude 5420"
                  value={newAsset.model}
                  onChange={e => setNewAsset({ ...newAsset, model: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Patrimônio (Tag) *</Label>
                <Input
                  placeholder="Ex: 004592"
                  value={newAsset.asset_tag}
                  onChange={e => setNewAsset({ ...newAsset, asset_tag: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Número de Série</Label>
              <Input
                placeholder="Serial Number"
                value={newAsset.serial_number}
                onChange={e => setNewAsset({ ...newAsset, serial_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewAssetOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateAsset} disabled={createAsset.isPending}>
              {createAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar e Selecionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
