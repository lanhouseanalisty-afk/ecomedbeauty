import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  RotateCcw
} from "lucide-react";
import AdmissaoForm from "@/components/crm/rh/AdmissaoForm";
import { useAdmissionProcesses, getDepartmentSlug } from "@/hooks/useAdmission";

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

export default function AdmissaoPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingProcess, setViewingProcess] = useState<string | null>(null);
  const [returnDialog, setReturnDialog] = useState<{ open: boolean; processId: string | null; targetStep: 'gestor' | 'ti' | null }>({
    open: false,
    processId: null,
    targetStep: null,
  });
  const [returnReason, setReturnReason] = useState("");

  const { processes, isLoading, createAdmission, sendToColaborador, returnToStep } = useAdmissionProcesses();

  // Filtrar processos
  const pendingProcesses = processes?.filter(p => p.status !== 'completed' && p.status !== 'cancelled') || [];
  const awaitingReview = pendingProcesses.filter(p => p.current_step === 'rh_review');
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

  const openReturnDialog = (processId: string, targetStep: 'gestor' | 'ti') => {
    setReturnDialog({ open: true, processId, targetStep });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await createAdmission.mutateAsync({
        employee_name: data.nome_completo,
        display_name: data.nome_exibicao || null,
        cpf: data.cpf,
        admission_date: data.data_admissao,
        start_date: data.data_inicio,
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


  const getProgressValue = (step: string) => {
    const steps = ['rh', 'gestor', 'ti', 'rh_review', 'colaborador', 'concluido'];
    const index = steps.indexOf(step);
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
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Admissão
        </Button>
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
                {pendingProcesses.filter(p => p.current_step === 'gestor').length}
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
                                TI: {formatDateSafe(process.ti_completed_at, "dd/MM HH:mm")}
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
                      <div className="flex items-center gap-3">
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
                            <Badge className={`${stepColors[process.current_step] || 'bg-muted'} text-white`}>
                              {stepLabels[process.current_step] || process.current_step}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Setor: {process.target_department?.toUpperCase() || "N/A"}
                            </span>
                          </div>
                          <Progress value={getProgressValue(process.current_step)} className="w-32 h-2" />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setViewingProcess(process.id)}>
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
            <DialogTitle>Detalhes do Processo</DialogTitle>
          </DialogHeader>
          {viewingProcess && processes && (
            <div className="space-y-4">
              {(() => {
                const process = processes.find(p => p.id === viewingProcess);
                if (!process) return null;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        <Badge className={`${stepColors[process.current_step] || 'bg-muted'} text-white`}>
                          {stepLabels[process.current_step] || process.current_step}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Início</p>
                        <p className="font-medium">
                          {formatDateSafe(process.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Contrato</p>
                        <p className="font-medium">{process.contract_type}</p>
                      </div>
                    </div>

                    {/* Se está em revisão, mostrar o que a TI preencheu */}
                    {process.current_step === 'rh_review' && (
                      <div className="pt-4 border-t space-y-4">
                        <h4 className="font-medium text-cyan-600 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Checklist da TI
                        </h4>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
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

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                              {process.user_ad_created ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Conta AD</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {process.vpn_configured ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">VPN</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {process.sap_user_created ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">SAP B1</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {process.salesforce_profile_created ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Salesforce</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {process.network_folders_released ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Pastas de Rede</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {process.printers_configured ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Impressoras</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {process.general_tests_done ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Testes Gerais</span>
                            </div>
                          </div>

                          {process.microsoft_licenses && process.microsoft_licenses.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Licenças Microsoft 365</p>
                              <div className="flex flex-wrap gap-1">
                                {process.microsoft_licenses.map((lic, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{lic}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {process.it_observations && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Observações da TI</p>
                              <p className="text-sm bg-background p-2 rounded">{process.it_observations}</p>
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
                    )}

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Progresso do Fluxo</h4>
                      <div className="flex items-center gap-2">
                        {['rh', 'gestor', 'ti', 'rh_review', 'colaborador', 'concluido'].map((step, index) => {
                          const currentStepIndex = ['rh', 'gestor', 'ti', 'rh_review', 'colaborador', 'concluido'].indexOf(process.current_step || 'rh');
                          return (
                            <div key={step} className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step === process.current_step
                                ? 'bg-primary text-primary-foreground'
                                : index < currentStepIndex
                                  ? 'bg-green-500 text-white'
                                  : 'bg-muted text-muted-foreground'
                                }`}>
                                {index + 1}
                              </div>
                              {index < 5 && (
                                <div className={`w-6 h-0.5 ${index < currentStepIndex
                                  ? 'bg-green-500'
                                  : 'bg-muted'
                                  }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                        <span>RH</span>
                        <span>Gestor</span>
                        <span>TI</span>
                        <span>Revisão</span>
                        <span>Docs</span>
                        <span>Fim</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
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
              O processo será retornado para <strong>{returnDialog.targetStep === 'gestor' ? 'o Gestor' : 'a TI'}</strong> para ajustes.
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
              className={returnDialog.targetStep === 'gestor' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'}
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
