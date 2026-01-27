import { useState } from "react";
import {
  UserMinus,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Eye,
  Briefcase,
  Monitor,
  User,
  ArrowRight,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DemissaoForm from "@/components/crm/rh/DemissaoForm";
import { useEmployees } from "@/hooks/useRH";
import { useTerminationProcesses, TerminationProcess } from "@/hooks/useTermination";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const stepLabels: Record<string, string> = {
  rh: "RH (Início)",
  gestor: "Gestor",
  ti: "TI",
  dp: "DP / Financeiro",
  concluido: "Concluído",
};

const stepColors: Record<string, string> = {
  rh: "bg-red-500",
  gestor: "bg-amber-500",
  ti: "bg-blue-500",
  dp: "bg-green-600",
  concluido: "bg-emerald-600",
};

const formatDateSafe = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    return "—";
  }
};

export default function DemissaoPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingProcess, setViewingProcess] = useState<string | null>(null);
  const { employees } = useEmployees();
  const {
    processes,
    isLoading,
    createTermination,
    updateManagerStep,
    updateTIStep,
    completeTermination
  } = useTerminationProcesses();

  // Mocking current user role - IN REAL APP THIS COMES FROM AUTH CONTEXT
  // change this to test different views: 'rh', 'gestor', 'ti', 'dp'
  const [userRole, setUserRole] = useState<'rh' | 'gestor' | 'ti' | 'dp'>('rh');

  const activeProcesses = processes?.filter(p => p.status !== 'completed' && p.status !== 'cancelled') || [];
  const completedProcesses = processes?.filter(p => p.status === 'completed') || [];

  // Filter processes pending for the current user's role
  const myPendingTasks = activeProcesses.filter(p => p.current_step === userRole);

  const handleFormSubmit = async (data: any) => {
    // If we are editing an existing process
    if (viewingProcess) {
      const process = processes?.find(p => p.id === viewingProcess);
      if (!process) return;

      if (process.current_step === 'gestor') {
        await updateManagerStep.mutateAsync({ id: process.id, data });
      } else if (process.current_step === 'ti') {
        await updateTIStep.mutateAsync({ id: process.id, data });
      } else if (process.current_step === 'dp') {
        await completeTermination.mutateAsync({ id: process.id, data });
      }
      setViewingProcess(null);
    } else {
      // New termination (RH)
      await createTermination.mutateAsync(data);
      setIsFormOpen(false);
    }
  };

  const getProgressValue = (step: string) => {
    const steps = ['rh', 'gestor', 'ti', 'dp', 'concluido'];
    const index = steps.indexOf(step);
    if (index === -1) return 0;
    return ((index + 1) / steps.length) * 100;
  };

  // Determine section to show based on process step or creator role
  const getSectionForProcess = (process?: TerminationProcess) => {
    if (!process) return 1; // Default to RH
    if (process.current_step === 'rh') return 1;
    if (process.current_step === 'gestor') return 2;
    if (process.current_step === 'ti') return 3;
    if (process.current_step === 'dp') return 4;
    return 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-red-700 dark:text-red-500">
            <UserMinus className="h-7 w-7" />
            Desligamentos
          </h1>
          <p className="text-muted-foreground">
            Gestão do processo de desligamento e checklist de saída
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* DEV ONLY ROLE SWITCHER */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-md text-xs">
            <span className="px-2">Simular:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-transparent border-none focus:ring-0 cursor-pointer font-bold"
            >
              <option value="rh">RH</option>
              <option value="gestor">Gestor</option>
              <option value="ti">TI</option>
              <option value="dp">DP</option>
            </select>
          </div>

          {userRole === 'rh' && (
            <Button onClick={() => setIsFormOpen(true)} variant="destructive">
              <Plus className="h-4 w-4 mr-2" />
              Novo Desligamento
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <UserMinus className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{activeProcesses.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Briefcase className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Com Gestor</p>
              <p className="text-2xl font-bold">
                {activeProcesses.filter(p => p.current_step === 'gestor').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Com TI</p>
              <p className="text-2xl font-bold">
                {activeProcesses.filter(p => p.current_step === 'ti').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Com DP</p>
              <p className="text-2xl font-bold">
                {activeProcesses.filter(p => p.current_step === 'dp').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">
            <UserMinus className="h-4 w-4 mr-2" />
            Todos os Processos
          </TabsTrigger>
          <TabsTrigger value="minhas-tarefas" className="relative">
            <Clock className="h-4 w-4 mr-2" />
            Minhas Tarefas
            {myPendingTasks.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 text-[10px] px-1.5">
                {myPendingTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Concluídos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {activeProcesses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhum processo de desligamento em andamento.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeProcesses.map(process => {
                const emp = employees?.find(e => e.id === process.employee_id);
                const cpfDisplay = emp?.cpf ? `ID: ${emp.cpf.replace(/\D/g, '').slice(0, 3)}...` : '';

                return (
                  <Card key={process.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingProcess(process.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                            <User className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-lg flex items-center gap-2">
                              {process.employee_name}
                              {cpfDisplay && (
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                  {cpfDisplay}
                                </Badge>
                              )}
                            </p>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                              <span>{process.position}</span>
                              <span>•</span>
                              <span>{process.department}</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              Saída: {formatDateSafe(process.last_day)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${stepColors[process.current_step] || 'bg-muted'} text-white`}>
                            {stepLabels[process.current_step]}
                          </Badge>
                          <div className="flex items-center gap-2 w-48">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Progresso</span>
                            <Progress value={getProgressValue(process.current_step)} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="minhas-tarefas">
          {myPendingTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Você não tem tarefas pendentes de desligamento.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myPendingTasks.map(process => {
                const emp = employees?.find(e => e.id === process.employee_id);
                const cpfDisplay = emp?.cpf ? `ID: ${emp.cpf.replace(/\D/g, '').slice(0, 3)}...` : '';

                return (
                  <Card key={process.id} className="border-red-200 bg-red-50/20 dark:border-red-900/50">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold flex items-center gap-2">
                          {process.employee_name}
                          {cpfDisplay && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                              {cpfDisplay}
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Aguardando sua validação</p>
                      </div>
                      <Button onClick={() => setViewingProcess(process.id)}>
                        Resolver Agora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="concluidos">
          {completedProcesses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhum histórico encontrado.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedProcesses.map(p => {
                const emp = employees?.find(e => e.id === p.employee_id);
                const cpfDisplay = emp?.cpf ? `ID: ${emp.cpf.replace(/\D/g, '').slice(0, 3)}...` : '';

                return (
                  <Card key={p.id}>
                    <CardContent className="p-4 flex justify-between">
                      <span className="font-medium flex items-center gap-2">
                        {p.employee_name}
                        {cpfDisplay && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                            {cpfDisplay}
                          </Badge>
                        )}
                      </span>
                      <Badge variant="outline" className="text-green-600 border-green-600">Finalizado</Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* Dialog para INICIAR PROCESSO (RH) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Iniciar Desligamento</DialogTitle>
          </DialogHeader>
          <DemissaoForm
            employees={employees || []}
            onSubmit={handleFormSubmit}
            currentSection={1}
            isReadOnly={false}
            userRole="rh"
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para ACOMPANHAR/EDITAR PROCESSO */}
      <Dialog open={!!viewingProcess} onOpenChange={() => setViewingProcess(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {(() => {
              const process = processes?.find(p => p.id === viewingProcess);
              return (
                <DialogTitle>
                  {process ? `Desligamento: ${process.employee_name}` : 'Detalhes do Processo'}
                </DialogTitle>
              );
            })()}
          </DialogHeader>

          {viewingProcess && processes?.find(p => p.id === viewingProcess) && (
            <DemissaoForm
              initialData={processes.find(p => p.id === viewingProcess) as any}
              employees={employees || []}
              onSubmit={handleFormSubmit}
              // Determine logic: if I am the owner of the current step, allow edit. Else read-only.
              userRole={userRole as any} // In real app, this is dynamic
              currentSection={getSectionForProcess(processes.find(p => p.id === viewingProcess))}
              isReadOnly={processes.find(p => p.id === viewingProcess)?.current_step !== userRole}
            />
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}