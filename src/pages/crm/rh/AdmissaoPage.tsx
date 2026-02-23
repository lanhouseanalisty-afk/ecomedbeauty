import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  UserPlus,
  ClipboardCheck,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Send,
  ArrowRight,
  RotateCcw,
  Car,
  Trash2,
  FastForward
} from "lucide-react";
import AdmissaoForm from "@/components/crm/rh/AdmissaoForm";
import { useAdmissionProcesses, getDepartmentSlug } from "@/hooks/useAdmission";
import { supabase } from "@/integrations/supabase/client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const stepLabels: Record<string, string> = {
  rh: "RH",
  gestor: "Gestor",
  compras: "Compras",
  ti: "TI",
  rh_review: "Revisão RH",
  colaborador: "Colaborador",
  concluido: "Concluído",
};

const stepColors: Record<string, string> = {
  rh: "bg-blue-500",
  gestor: "bg-purple-500",
  compras: "bg-rose-500",
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

export default function AdmissaoPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingProcess, setViewingProcess] = useState<string | null>(null);
  const [returnDialog, setReturnDialog] = useState<{ open: boolean; processId: string | null; targetStep: 'gestor' | 'ti' | 'compras' | null }>({
    open: false,
    processId: null,
    targetStep: null,
  });
  const [returnReason, setReturnReason] = useState("");

  const {
    processes,
    isLoading,
    createAdmission,
    sendToColaborador,
    returnToStep,
    updateComprasStep,
    deleteAdmission,
    cancelAdmission,
    advanceStep
  } = useAdmissionProcesses();

  // ROLE SIMULATION
  const [userRole, setUserRole] = useState<'rh' | 'gestor' | 'ti' | 'admin' | 'compras'>('rh');

  // Estado do formulário de Compras
  const [comprasForm, setComprasForm] = useState({
    vehicle_id: "",
    pickup_address: "",
    pickup_date: "",
    pickup_time: "",
    compras_remarks: "",
  });

  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase.from('vehicles').select('*').eq('status', 'available');
      if (data) setVehicles(data);
    };
    fetchVehicles();
  }, [processes]);

  // Filtrar processos
  const pendingProcesses = processes?.filter(p => p.status !== 'completed' && p.status !== 'cancelled') || [];
  const awaitingReview = pendingProcesses.filter(p => String(p.current_step || '').toLowerCase().includes('rh_review'));
  const completedProcesses = processes?.filter(p => p.status === 'completed') || [];

  const handleSendToColaborador = async (processId: string) => {
    try {
      await sendToColaborador.mutateAsync(processId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleReturnToStep = async () => {
    if (!returnDialog.processId || !returnDialog.targetStep) return;

    try {
      await returnToStep.mutateAsync({
        id: returnDialog.processId,
        targetStep: returnDialog.targetStep,
        reason: returnReason || undefined,
      });
      setReturnDialog({ open: false, processId: null, targetStep: null });
      setReturnReason("");
      setViewingProcess(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const openReturnDialog = (processId: string, targetStep: 'gestor' | 'ti' | 'compras') => {
    setReturnDialog({ open: true, processId, targetStep });
  };

  const handleAdvanceProcess = (id: string, name: string) => {
    const reason = window.prompt(`Informe o motivo para pular a etapa atual de ${name}:`);
    if (reason !== null) {
      advanceStep.mutate({ id, reason });
    }
  };

  const handleDeleteProcess = (id: string, name: string) => {
    if (window.confirm(`ATENÇÃO: Deseja excluir PERMANENTEMENTE a admissão de ${name}? Esta ação não pode ser desfeita.`)) {
      deleteAdmission.mutate(id);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await createAdmission.mutateAsync({
        employee_name: data.nome_completo,
        display_name: data.nome_exibicao || null,
        cpf: data.cpf,
        admission_date: data.data_admissao,
        start_date: data.data_admissao,
        contract_type: data.tipo_contratacao === "Estagio" ? "Estágio" : data.tipo_contratacao === "Temporario" ? "Temporário" : data.tipo_contratacao,
        department: data.setor_departamento,
        branch: data.filial_unidade,
        manager_name: data.gestor_direto,
        manager_email: data.email_gestor || null,
        position: data.cargo_funcao,
        work_regime: data.regime_trabalho === "Hibrido" ? "Híbrido" : data.regime_trabalho,
        hr_observations: data.observacoes_rh || null,
      });

      setIsFormOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleComprasSubmit = async (processId: string) => {
    try {
      await updateComprasStep.mutateAsync({
        id: processId,
        data: {
          vehicle_id: comprasForm.vehicle_id,
          pickup_address: comprasForm.pickup_address,
          pickup_date: comprasForm.pickup_date,
          pickup_time: comprasForm.pickup_time,
          compras_remarks: comprasForm.compras_remarks,
        },
      });
      setViewingProcess(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getProgressValue = (stepStr: string) => {
    const step = String(stepStr || '').toLowerCase().trim();
    const steps = ['rh', 'gestor', 'compras', 'ti', 'rh_review', 'colaborador', 'concluido'];

    // Procura por match parcial se o match exato falhar
    let index = steps.indexOf(step);
    if (index === -1) {
      if (step.includes('compras')) index = 2;
      else if (step.includes('ti')) index = 3;
      else if (step.includes('gestor')) index = 1;
      else if (step.includes('rh')) index = 0;
    }

    if (index === -1) return 0;
    return ((index + 1) / steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-primary" />
            Admissão - RH
          </h1>
          <p className="text-muted-foreground">
            Inicie processos de admissão e acompanhe o fluxo por departamento
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* SIMULADOR DE PAPEL */}
          <div className="flex items-center gap-2 bg-muted p-1 px-3 rounded-full text-xs">
            <span className="text-muted-foreground">Simular:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-transparent border-none focus:ring-0 cursor-pointer font-bold text-primary"
            >
              <option value="rh">RH</option>
              <option value="gestor">Gestor</option>
              <option value="ti">TI</option>
              <option value="compras">Compras</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {(userRole === 'rh' || userRole === 'admin') && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Admissão
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
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
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Gestor</p>
              <p className="text-2xl font-bold">
                {pendingProcesses.filter(p => String(p.current_step || '').toLowerCase().includes('gestor')).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/30">
              <Car className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Compras</p>
              <p className="text-2xl font-bold">
                {pendingProcesses.filter(p => String(p.current_step || '').toLowerCase().includes('compras')).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando TI</p>
              <p className="text-2xl font-bold">
                {pendingProcesses.filter(p => p.current_step === 'ti').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={awaitingReview.length > 0 ? "border-cyan-500 border-2" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <FileText className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Para Revisão</p>
              <p className="text-2xl font-bold">{awaitingReview.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={awaitingReview.length > 0 ? "revisao" : "processos"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="revisao" className="relative">
            <FileText className="h-4 w-4 mr-2" />
            Para Revisão
            {awaitingReview.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1">
                {awaitingReview.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processos">
            <Users className="h-4 w-4 mr-2" />
            Em Andamento
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Concluídos
          </TabsTrigger>
        </TabsList>

        {/* Para Revisão - TI concluiu, RH decide enviar para colaborador */}
        <TabsContent value="revisao" className="space-y-4">
          {awaitingReview.length > 0 ? (
            <div className="grid gap-4">
              {awaitingReview.map(process => (
                <Card key={process.id} className="hover:shadow-md transition-shadow border-cyan-200 dark:border-cyan-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
                          <FileText className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {process.employee_name}
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                              ID: {process.cpf.replace(/\D/g, '').slice(0, 3)}...
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {process.position} • {process.department}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Início: {formatDateSafe(process.start_date)}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {process.ti_completed_at && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                TI: {format(new Date(process.ti_completed_at), "dd/MM HH:mm")}
                              </Badge>
                            )}
                            {process.email_created && (
                              <Badge variant="outline" className="text-xs">
                                Email: {process.email_created}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline" size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteProcess(process.id, process.employee_name)}
                          title="Excluir Permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline" size="icon"
                          className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                          onClick={() => handleAdvanceProcess(process.id, process.employee_name)}
                          title="Pular Etapa"
                        >
                          <FastForward className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setViewingProcess(process.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSendToColaborador(process.id)}
                          disabled={sendToColaborador.isPending}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar ao Colaborador
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
                  Nenhum processo aguardando revisão
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Processos em Andamento */}
        <TabsContent value="processos" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : pendingProcesses.length > 0 ? (
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
                            {process.position} • {process.department}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Início: {formatDateSafe(process.start_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${(process.current_step?.toLowerCase().includes('compras') ? stepColors['compras'] :
                              process.current_step?.toLowerCase().includes('ti') ? stepColors['ti'] :
                                stepColors[process.current_step?.toLowerCase().trim()]) || 'bg-muted'
                              } text-white`}>
                              {
                                (process.current_step?.toLowerCase().includes('compras') ? stepLabels['compras'] :
                                  process.current_step?.toLowerCase().includes('ti') ? stepLabels['ti'] :
                                    stepLabels[process.current_step?.toLowerCase().trim()]) || process.current_step
                              }
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Destino: {process.target_department?.toUpperCase() || "N/A"}
                            </span>
                          </div>
                          <Progress value={getProgressValue(process.current_step)} className="w-32 h-2" />
                        </div>
                        <div className="flex items-center gap-2">
                          {(userRole === 'rh' || userRole === 'admin') && (
                            <Button
                              variant="outline" size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                              onClick={() => handleDeleteProcess(process.id, process.employee_name)}
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="outline" size="icon"
                            className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 border-amber-100"
                            onClick={() => handleAdvanceProcess(process.id, process.employee_name)}
                            title="Pular Etapa"
                          >
                            <FastForward className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setViewingProcess(process.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </div>
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
                  Nenhum processo de admissão em andamento
                </p>
                <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Nova Admissão
                </Button>
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
                            {process.position} • {process.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline" size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                          onClick={() => handleDeleteProcess(process.id, process.employee_name)}
                          title="Excluir Permanentemente"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Concluído
                        </Badge>
                      </div>
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

      {/* Dialog para novo formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Nova Admissão - Dados Iniciais
            </DialogTitle>
          </DialogHeader>
          <AdmissaoForm
            key="new-admission-form"
            onSubmit={handleFormSubmit}
            showOnlySections={[1]} // RH só preenche seção 1 (dados iniciais)
            userRole="rh" // RH sempre envia, não navega
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para ver processo */}
      <Dialog open={!!viewingProcess} onOpenChange={() => setViewingProcess(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {(() => {
                if (!viewingProcess || !processes) return 'Detalhes do Processo';
                const process = processes.find(p => p.id === viewingProcess);
                if (!process) return 'Detalhes do Processo';
                const step = String(process.current_step || '').toLowerCase();
                if (step.includes('compras')) return 'Atribuição de Veículo';
                if (step.includes('rh_review')) return 'Revisão do Processo';
                return 'Detalhes do Processo';
              })()}
            </DialogTitle>
          </DialogHeader>
          {viewingProcess && (
            (() => {
              const process = processes?.find(p => p.id === viewingProcess);
              if (!process) return null;

              const currentStep = String(process.current_step || '').toLowerCase();
              const isPowerUser = userRole === 'admin' || userRole === 'rh' || userRole === 'compras';
              const showComprasForm = isPowerUser && currentStep.includes('compras');

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Colaborador</p>
                      <p className="font-medium">{process.employee_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Departamento Destino</p>
                      <Badge>{process.target_department?.toUpperCase() || "N/A"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cargo</p>
                      <p className="font-medium">{process.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Etapa Atual</p>
                      <Badge className={`${(currentStep.includes('compras') ? stepColors['compras'] :
                        currentStep.includes('ti') ? stepColors['ti'] :
                          stepColors[currentStep]) || 'bg-muted'
                        } text-white`}>
                        {
                          (currentStep.includes('compras') ? stepLabels['compras'] :
                            currentStep.includes('ti') ? stepLabels['ti'] :
                              stepLabels[currentStep]) || process.current_step
                        }
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Início</p>
                      <p className="font-medium">
                        {formatDateSafe(process.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gestor Direto</p>
                      <p className="font-medium">{process.manager_name}</p>
                    </div>
                  </div>

                  {/* FORMULÁRIO DE COMPRAS (DENTRO DO RH SE FOR POWER USER) */}
                  {showComprasForm && (
                    <div className="space-y-6 pt-4 border-t">
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
                        <Label className="text-base font-medium text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-4">
                          <Car className="h-4 w-4" />
                          Atribuir Veículo
                        </Label>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="vehicle_select">Veículo</Label>
                            <select
                              id="vehicle_select"
                              className="w-full mt-2 p-2 rounded-md border bg-background"
                              value={comprasForm.vehicle_id}
                              onChange={(e) => setComprasForm({ ...comprasForm, vehicle_id: e.target.value })}
                            >
                              <option value="">Selecione um veículo...</option>
                              {vehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.brand} {v.model} - {v.plate} ({v.color})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="pickup_date">Data de Retirada</Label>
                              <Input
                                id="pickup_date"
                                type="date"
                                className="mt-2"
                                value={comprasForm.pickup_date}
                                onChange={(e) => setComprasForm({ ...comprasForm, pickup_date: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="pickup_time">Horário</Label>
                              <Input
                                id="pickup_time"
                                type="time"
                                className="mt-2"
                                value={comprasForm.pickup_time}
                                onChange={(e) => setComprasForm({ ...comprasForm, pickup_time: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="pickup_address">Local de Retirada</Label>
                            <Input
                              id="pickup_address"
                              placeholder="Fábrica, Escritório Central, etc."
                              className="mt-2"
                              value={comprasForm.pickup_address}
                              onChange={(e) => setComprasForm({ ...comprasForm, pickup_address: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="remarks">Observações Adicionais</Label>
                            <Textarea
                              id="remarks"
                              placeholder="Informações relevantes para a retirada..."
                              className="mt-2"
                              value={comprasForm.compras_remarks}
                              onChange={(e) => setComprasForm({ ...comprasForm, compras_remarks: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={() => handleComprasSubmit(process.id)}
                            disabled={updateComprasStep.isPending}
                          >
                            Concluir Atribuição
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {process.current_step === 'rh_review' && (
                    <div className="pt-4 border-t space-y-4">
                      <h4 className="font-medium text-cyan-600 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Revisão Final
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          TI e Compras concluíram suas etapas. Revise os dados e envie ao colaborador.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {process.it_responsible && (
                            <div>
                              <p className="text-sm text-muted-foreground">Responsável TI</p>
                              <p className="font-medium">{process.it_responsible}</p>
                            </div>
                          )}
                          {process.email_created && (
                            <div>
                              <p className="text-sm text-muted-foreground">E-mail Corporativo</p>
                              <p className="font-medium">{process.email_created}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReturnDialog(process.id, 'gestor')}
                              className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retornar ao Gestor
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReturnDialog(process.id, 'ti')}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retornar à TI
                            </Button>
                          </div>
                          <Button
                            onClick={() => {
                              handleSendToColaborador(process.id);
                              setViewingProcess(null);
                            }}
                            disabled={sendToColaborador.isPending}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Enviar ao Colaborador
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de retorno */}
      <Dialog open={returnDialog.open} onOpenChange={(open) => {
        if (!open) {
          setReturnDialog({ open: false, processId: null, targetStep: null });
          setReturnReason("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Retornar Processo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              O processo será retornado para <strong>{
                returnDialog.targetStep === 'gestor' ? 'o Gestor' :
                  returnDialog.targetStep === 'compras' ? 'as Compras' : 'a TI'
              }</strong> para ajustes.
              Uma notificação será enviada automaticamente.
            </p>
            <div>
              <Label htmlFor="return-reason">Motivo do retorno (opcional)</Label>
              <Textarea
                id="return-reason"
                placeholder="Descreva o que precisa ser ajustado..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReturnDialog({ open: false, processId: null, targetStep: null });
                setReturnReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReturnToStep}
              disabled={returnToStep.isPending}
              className={
                returnDialog.targetStep === 'gestor' ? 'bg-purple-600 hover:bg-purple-700' :
                  returnDialog.targetStep === 'compras' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Confirmar Retorno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
