import { useState } from "react";
import {
    UserMinus,
    RotateCcw,
    CheckCircle2,
    Clock,
    AlertCircle,
    Briefcase,
    Monitor,
    User,
    ArrowRight,
    Plus,
    Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DemissaoForm from "@/components/crm/rh/DemissaoForm";
import { useEmployees } from "@/hooks/useRH";
import { useTerminationProcesses, TerminationProcess } from "@/hooks/useTermination";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUserRole } from "@/hooks/useUserRole";

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

interface DepartmentDemissaoPageProps {
    departmentSlug: string;
    departmentName: string;
}

export default function DepartmentDemissaoPage({ departmentSlug, departmentName }: DepartmentDemissaoPageProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingProcess, setViewingProcess] = useState<string | null>(null);
    const { employees } = useEmployees();
    const { isAdmin } = useUserRole();
    const {
        processes,
        isLoading,
        createTermination,
        updateManagerStep,
        updateTIStep,
        completeTermination
    } = useTerminationProcesses();

    // Filter processes for this department (unless Admin or TI/DP who see all)
    const isTech = departmentSlug === 'tech';
    const isDP = departmentSlug === 'financeiro'; // DP logic often tied to financeiro in this app

    const activeProcesses = processes?.filter(p =>
        p.status !== 'completed' &&
        p.status !== 'cancelled' &&
        (isAdmin || isTech || isDP ? true : p.department === departmentName || p.department === departmentSlug)
    ) || [];

    const completedProcesses = processes?.filter(p =>
        p.status === 'completed' &&
        (isAdmin || isTech || isDP ? true : p.department === departmentName || p.department === departmentSlug)
    ) || [];

    // Determine user's operative role for this page
    // A manager in 'comercial' sees themselves as 'gestor'
    const userRole = isTech ? 'ti' : isDP ? 'dp' : 'gestor';

    // Filter processes pending for the current user's role/dept context
    const myPendingTasks = activeProcesses.filter(p => p.current_step === userRole);

    const handleFormSubmit = async (data: any) => {
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
            // New termination (usually RH only, but we keep it for flexibility)
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

    const getSectionForProcess = (process?: TerminationProcess) => {
        if (!process) return 1;
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
                        Desligamentos - {departmentName}
                    </h1>
                    <p className="text-muted-foreground">
                        Gestão do processo de desligamento e checklist de saída
                    </p>
                </div>
            </div>

            {/* Cards de Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <Card className={myPendingTasks.length > 0 ? "border-amber-500 border-2" : ""}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Aguardando Você</p>
                            <p className="text-2xl font-bold">{myPendingTasks.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Concluídos</p>
                            <p className="text-2xl font-bold">{completedProcesses.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="minhas-tarefas" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="minhas-tarefas" className="relative">
                        <Clock className="h-4 w-4 mr-2" />
                        Minhas Tarefas
                        {myPendingTasks.length > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 text-[10px] px-1.5">
                                {myPendingTasks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="todos">
                        <UserMinus className="h-4 w-4 mr-2" />
                        Todos do Setor
                    </TabsTrigger>
                    <TabsTrigger value="concluidos">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluídos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="minhas-tarefas">
                    {isLoading ? (
                        <p>Carregando...</p>
                    ) : myPendingTasks.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                Você não tem tarefas pendentes de desligamento para este setor.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {myPendingTasks.map(process => (
                                <Card key={process.id} className="border-red-200 bg-red-50/20 dark:border-red-900/50">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-red-100">
                                                <User className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{process.employee_name}</p>
                                                <p className="text-sm text-muted-foreground">{process.position} • Saída: {formatDateSafe(process.last_day)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => setViewingProcess(process.id)}>
                                            Completar Checklist
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="todos" className="space-y-4">
                    {activeProcesses.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Nenhum processo em andamento.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {activeProcesses.map(process => (
                                <Card key={process.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingProcess(process.id)}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-red-100/50">
                                                <User className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{process.employee_name}</p>
                                                <p className="text-sm text-muted-foreground">{process.position} • {process.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={`${stepColors[process.current_step] || 'bg-muted'} text-white`}>
                                                {stepLabels[process.current_step]}
                                            </Badge>
                                            <Progress value={getProgressValue(process.current_step)} className="h-1.5 w-32" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
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
                            {completedProcesses.map(p => (
                                <Card key={p.id}>
                                    <CardContent className="p-4 flex justify-between">
                                        <span className="font-medium">{p.employee_name} ({p.position})</span>
                                        <Badge variant="outline" className="text-green-600 border-green-600">Finalizado</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={!!viewingProcess} onOpenChange={() => setViewingProcess(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {viewingProcess && processes?.find(p => p.id === viewingProcess)?.employee_name} - Detalhes do Desligamento
                        </DialogTitle>
                    </DialogHeader>
                    {viewingProcess && processes?.find(p => p.id === viewingProcess) && (
                        <DemissaoForm
                            initialData={processes.find(p => p.id === viewingProcess) as any}
                            employees={employees || []}
                            onSubmit={handleFormSubmit}
                            userRole={userRole as any}
                            currentSection={getSectionForProcess(processes.find(p => p.id === viewingProcess))}
                            isReadOnly={processes.find(p => p.id === viewingProcess)?.current_step !== userRole && !isAdmin}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
