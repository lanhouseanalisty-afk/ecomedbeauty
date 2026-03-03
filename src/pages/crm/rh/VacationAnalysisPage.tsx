import { useState, useCallback, useMemo } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Calculator,
    User,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Info,
    ChevronRight,
    Loader2,
    CalendarCheck,
    Briefcase,
    Settings2,
    Bell,
    X,
    Plus,
    Wand2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/hooks/useRH";
import {
    format,
    addMonths,
    addYears,
    differenceInDays,
    isAfter,
    isBefore,
    startOfMonth,
    endOfMonth,
    addDays,
    isWithinInterval
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

interface BlockedPeriod {
    id: string;
    label: string;
    start: Date;
    end: Date;
}

interface Employee {
    id: string;
    full_name: string;
    cpf?: string;
    employee_code?: string;
    hire_date: string;
    department_id?: string;
    department?: { name: string; };
    position_id?: string;
    position?: { title: string; };
    analysis?: any;
    [key: string]: any;
}

export default function VacationAnalysisPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([
        { id: '1', label: 'Final de Ano / Inventário', start: new Date(2025, 11, 15), end: new Date(2026, 0, 10) },
        { id: '2', label: 'Convenção Comercial', start: new Date(2026, 2, 10), end: new Date(2026, 2, 20) }
    ]);

    // Novas datas para o form de bloqueio
    const [newBlockedLabel, setNewBlockedLabel] = useState("");
    const [newBlockedStart, setNewBlockedStart] = useState("");
    const [newBlockedEnd, setNewBlockedEnd] = useState("");

    const { employees, isLoading } = useEmployees();

    // Planejamento Global State
    const [plannedVacations, setPlannedVacations] = useState<Record<string, { startDate: string, duration: number }>>({});
    const [deptFilter, setDeptFilter] = useState<string>("ALL");

    const departments = useMemo(() => {
        if (!employees) return [];
        const depts = new Set(employees.map(e => e.department?.name).filter(Boolean));
        return Array.from(depts).sort() as string[];
    }, [employees]);

    const handlePlanChange = (empId: string, field: 'startDate' | 'duration', value: string | number) => {
        setPlannedVacations(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                [field]: value
            }
        }));
    };

    const getConflictStatus = useCallback((emp: Employee) => {
        const plan = plannedVacations[emp.id];
        if (!plan || !plan.startDate || !plan.duration) return null;

        const start = new Date(plan.startDate + 'T00:00:00');
        const duration = parseInt(String(plan.duration)) || 0;
        if (duration <= 0) return null;

        const end = addDays(start, duration - 1);

        // 1. Checar bloqueio da empresa
        const hasCompanyBlock = blockedPeriods.some(p =>
            isWithinInterval(start, { start: p.start, end: p.end }) ||
            isWithinInterval(end, { start: p.start, end: p.end }) ||
            (isBefore(start, p.start) && isAfter(end, p.end))
        );

        if (hasCompanyBlock) {
            return { type: 'error', message: 'Conflito: Bloqueio Ativo' };
        }

        // 2. Checar limite de 20% do departamento
        if (emp.department_id && employees) {
            const deptId = emp.department_id;
            const deptEmps = employees.filter(e => e.department_id === deptId);
            const limit = Math.max(1, Math.ceil(deptEmps.length * 0.2));

            let maxSimultaneous = 0;
            const checkDays = duration;

            for (let i = 0; i < checkDays; i++) {
                const currentDate = addDays(start, i);
                let countToday = 1; // 1 = O próprio colaborador que estamos testando

                deptEmps.forEach(e => {
                    if (e.id !== emp.id) {
                        const otherPlan = plannedVacations[e.id];
                        if (otherPlan && otherPlan.startDate && otherPlan.duration) {
                            const oStart = new Date(otherPlan.startDate + 'T00:00:00');
                            const oDur = parseInt(String(otherPlan.duration));
                            if (oDur > 0) {
                                const oEnd = addDays(oStart, oDur - 1);
                                if (isWithinInterval(currentDate, { start: oStart, end: oEnd })) {
                                    countToday++;
                                }
                            }
                        }
                    }
                });
                if (countToday > maxSimultaneous) maxSimultaneous = countToday;
            }

            const percent = Math.round((maxSimultaneous / deptEmps.length) * 100);
            if (maxSimultaneous > limit) {
                return {
                    type: 'error',
                    message: `Excede 20% do Setor (${maxSimultaneous}/${deptEmps.length})`
                };
            } else if (maxSimultaneous > 1 && maxSimultaneous === limit) {
                return {
                    type: 'warning',
                    message: `Limite Atingido (${percent}%)`
                };
            }
        }

        return { type: 'success', message: 'Livre de Conflitos' };
    }, [plannedVacations, employees, blockedPeriods]);

    const handleSearch = () => {
        if (!searchTerm.trim()) return;

        const found = employees?.find(emp =>
            emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.cpf?.includes(searchTerm) ||
            emp.employee_code?.includes(searchTerm)
        );

        if (found) {
            setSelectedEmployee(found);
            toast.success(`Colaborador ${found.full_name} localizado.`);
        } else {
            toast.error("Colaborador não encontrado.");
        }
    };

    const calculateVacationAnalysis = useCallback((hireDateStr: string) => {
        const hireDate = new Date(hireDateStr);
        const today = new Date();

        // Período Aquisitivo Atual
        const yearsWorked = Math.floor(differenceInDays(today, hireDate) / 365);
        const startAquisitivo = addYears(hireDate, yearsWorked);
        const endAquisitivo = addYears(startAquisitivo, 1);

        // Período Concessivo (referente ao ano anterior preenchido)
        const startConcessivo = endAquisitivo;
        const endConcessivo = addYears(startConcessivo, 1);

        // Lógica de recomendação
        const daysToLimit = differenceInDays(endConcessivo, today);
        let status: "success" | "warning" | "destructive" = "success";
        let recommendation = "O colaborador está em dia com seus períodos. Pode-se planejar as férias livremente dentro do período concessivo.";

        if (daysToLimit < 60) {
            status = "destructive";
            recommendation = "CRÍTICO: Férias precisam ser gozadas IMEDIATAMENTE para evitar multa de férias em dobro.";
        } else if (daysToLimit < 120) {
            status = "warning";
            recommendation = "ATENÇÃO: Recomenda-se agendar as férias para os próximos 3 meses para garantir a conformidade.";
        }

        // --- Lógica de Sugestão de Data Específica ---
        // Idealmente começa em uma Segunda ou Terça para maximizar descanso CLT (não pode começar 2 dias antes de DSR/Feriado)
        let suggestedDate = addMonths(today, status === "success" ? 2 : 0);

        // Se estiver longe do limite, tenta sugerir o início de um mês com clima bom ou após 6 meses do último período
        // Para este MVP, vamos buscar a próxima segunda-feira válida
        let iterations = 0;
        while (iterations < 365) {
            const dayOfWeek = suggestedDate.getDay(); // 0 = Dom, 1 = Seg...
            const isBlocked = blockedPeriods.some(p => isWithinInterval(suggestedDate, { start: p.start, end: p.end }));

            // CLT: Não pode começar nos dois dias que antecedem feriado ou DSR (geralmente não começa qui/sex)
            const isBadStartDay = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

            if (!isBlocked && !isBadStartDay && isAfter(suggestedDate, today)) {
                break;
            }
            suggestedDate = addDays(suggestedDate, 1);
            iterations++;
        }

        const nextMonthBlocked = blockedPeriods.some(p =>
            isWithinInterval(addDays(today, 15), { start: p.start, end: p.end })
        );

        if (nextMonthBlocked && status !== "destructive") {
            recommendation += " OBS: Note que existem períodos de bloqueio da empresa ativos para os próximos meses.";
        }

        return {
            startAquisitivo,
            endAquisitivo,
            startConcessivo,
            endConcessivo,
            daysToLimit,
            status,
            recommendation,
            suggestedDate: iterations < 365 ? suggestedDate : null
        };
    }, [blockedPeriods]);

    const criticalEmployees = useMemo(() => {
        if (!employees) return [];
        return employees
            .map(emp => ({
                ...emp,
                analysis: calculateVacationAnalysis(emp.hire_date)
            }))
            .filter(emp => emp.analysis.daysToLimit < 120)
            .sort((a, b) => a.analysis.daysToLimit - b.analysis.daysToLimit);
    }, [employees, calculateVacationAnalysis]);

    const addBlockedPeriod = () => {
        if (!newBlockedLabel || !newBlockedStart || !newBlockedEnd) {
            toast.error("Preencha todos os campos do bloqueio.");
            return;
        }
        const newPeriod: BlockedPeriod = {
            id: Math.random().toString(),
            label: newBlockedLabel,
            start: new Date(newBlockedStart),
            end: new Date(newBlockedEnd)
        };
        setBlockedPeriods([...blockedPeriods, newPeriod]);
        setNewBlockedLabel("");
        setNewBlockedStart("");
        setNewBlockedEnd("");
        toast.success("Período bloqueado adicionado.");
    };

    const removeBlockedPeriod = (id: string) => {
        setBlockedPeriods(blockedPeriods.filter(p => p.id !== id));
        toast.info("Bloqueio removido.");
    };

    const checkBlockedOverlap = (date: Date) => {
        return blockedPeriods.some(p => isWithinInterval(date, { start: p.start, end: p.end }));
    };

    const handleAutoPlan = (durationDays: 15 | 30) => {
        if (!employees) return;

        // 1. Filtrar quem AINDA NÃO TEM planejamento (Regra 3)
        const unplannedEmployees = employees.filter(emp => !plannedVacations[emp.id]?.startDate);

        if (unplannedEmployees.length === 0) {
            toast.info("Todos os colaboradores já possuem planejamento.");
            return;
        }

        // 2. Ordenar pelo maior risco de multa (menor daysToLimit) (Regra 2)
        const sortedEmployees = unplannedEmployees.map(emp => {
            const analysis = calculateVacationAnalysis(emp.hire_date);
            return {
                ...emp,
                analysis
            };
        }).sort((a, b) => a.analysis.daysToLimit - b.analysis.daysToLimit);

        let successCount = 0;
        let failCount = 0;
        const newPlans = { ...plannedVacations };

        // Helper local para checar conflitos no novo state
        const checkConflictVirtual = (emp: Employee, startData: Date, currentPlans: Record<string, { startDate: string, duration: number }>) => {
            // Guarantee pure local date by stripping out accidental time data
            const cleanStart = new Date(startData.getFullYear(), startData.getMonth(), startData.getDate());
            const duration = durationDays;
            const end = addDays(cleanStart, duration - 1);

            // 1. Checar bloqueio de empresa
            const hasCompanyBlock = blockedPeriods.some(p =>
                isWithinInterval(startData, { start: p.start, end: p.end }) ||
                isWithinInterval(end, { start: p.start, end: p.end }) ||
                (isBefore(startData, p.start) && isAfter(end, p.end))
            );
            if (hasCompanyBlock) return true;

            // 2. Checar limite percentual
            if (emp.department_id) {
                const deptId = emp.department_id;
                const deptEmps = employees.filter(e => e.department_id === deptId);
                const limit = Math.max(1, Math.ceil(deptEmps.length * 0.2));

                let maxSimultaneous = 0;
                for (let i = 0; i < duration; i++) {
                    const currentDate = addDays(cleanStart, i);
                    let countToday = 1; // Contando eu mesmo (a tentativa atual)

                    deptEmps.forEach(e => {
                        if (e.id !== emp.id) {
                            const otherPlan = currentPlans[e.id];
                            if (otherPlan && otherPlan.startDate && otherPlan.duration) {
                                const oStart = new Date(otherPlan.startDate + 'T00:00:00');
                                const oDur = parseInt(String(otherPlan.duration));
                                if (oDur > 0) {
                                    const oEnd = addDays(oStart, oDur - 1);
                                    if (isWithinInterval(currentDate, { start: oStart, end: oEnd })) {
                                        countToday++;
                                    }
                                }
                            }
                        }
                    });
                    if (countToday > maxSimultaneous) maxSimultaneous = countToday;
                }

                if (maxSimultaneous > limit) {
                    return true; // Falha na regra dos 20%
                }
            }
            return false;
        };

        // 3. Tentar agendar cada um
        for (const emp of sortedEmployees) {
            let suggestedDate = emp.analysis.suggestedDate || addMonths(new Date(), 2);
            let foundSlot = false;
            let iterations = 0;

            // Loop de busca por até 1 ano à frente
            while (iterations < 365) {
                const dayOfWeek = suggestedDate.getDay();
                const isBadStartDay = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

                if (!isBadStartDay && isAfter(suggestedDate, new Date())) {
                    // Tenta ver se essa data dá conflito com os planos já consolidados + os que acabamos de setar no loop
                    const hasConflict = checkConflictVirtual(emp, suggestedDate, newPlans);

                    if (!hasConflict) {
                        newPlans[emp.id] = {
                            startDate: format(suggestedDate, "yyyy-MM-dd"),
                            duration: durationDays
                        };
                        successCount++;
                        foundSlot = true;
                        break;
                    }
                }
                suggestedDate = addDays(suggestedDate, 1);
                iterations++;
            }

            if (!foundSlot) {
                failCount++;
            }
        }

        setPlannedVacations(newPlans);

        if (failCount > 0) {
            toast.warning(`Auto-Plan: ${successCount} agendados. ${failCount} não alocados (falta de espaço no setor).`);
        } else {
            toast.success(`Auto-Plan Finalizado! ${successCount} colaboradores agendados com sucesso.`);
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-serif font-bold text-slate-900">Análise Inteligente de Férias</h1>
                    <p className="text-muted-foreground">Gestão de períodos aquisitivos, restrições e alertas de conformidade.</p>
                </div>

                <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2 border-slate-200 shadow-sm rounded-xl">
                            <Settings2 className="h-4 w-4" />
                            Configurar Restrições
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl">
                        <DialogHeader>
                            <DialogTitle>Épocas Restritivas da Empresa</DialogTitle>
                            <DialogDescription>
                                Defina períodos em que a empresa **não poderá liberar férias** por motivos operacionais.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Motivo/Etiqueta</Label>
                                <Input placeholder="Ex: Inventário Anual" value={newBlockedLabel} onChange={e => setNewBlockedLabel(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Início</Label>
                                    <Input type="date" value={newBlockedStart} onChange={e => setNewBlockedStart(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fim</Label>
                                    <Input type="date" value={newBlockedEnd} onChange={e => setNewBlockedEnd(e.target.value)} />
                                </div>
                            </div>
                            <Button className="w-full bg-blue-600 rounded-xl" onClick={addBlockedPeriod}>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Bloqueio
                            </Button>

                            <Separator />

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                <p className="text-xs font-bold text-slate-400 uppercase">Bloqueios Ativos</p>
                                {blockedPeriods.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs">
                                            <p className="font-bold text-slate-700">{p.label}</p>
                                            <p className="text-slate-500">{format(p.start, "dd/MM/yy")} - {format(p.end, "dd/MM/yy")}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => removeBlockedPeriod(p.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Critical Alerts Dashboard */}
            {criticalEmployees.length > 0 && (
                <Card className="border-none shadow-xl bg-amber-50/50 border border-amber-100 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-amber-100/50 flex flex-row items-center gap-3 px-6 py-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <Bell className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base text-amber-900">Atenção RH: Férias Estourando ({criticalEmployees.length})</CardTitle>
                            <CardDescription className="text-xs text-amber-700">Colaboradores próximos à data limite para gozo de férias.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {criticalEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    className={`min-w-[280px] p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${emp.analysis.status === 'destructive' ? 'bg-white border-red-200' : 'bg-white border-amber-200'
                                        }`}
                                    onClick={() => setSelectedEmployee(emp)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm line-clamp-1">{emp.full_name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{emp.positions?.title}</p>
                                        </div>
                                        <Badge variant={emp.analysis.status === 'destructive' ? 'destructive' : 'secondary'} className="text-[10px]">
                                            {emp.analysis.daysToLimit} dias
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>Limite: {format(emp.analysis.endConcessivo, "dd/MM/yyyy")}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Nome, CPF ou Matrícula do colaborador..."
                                className="pl-10 h-12 text-lg border-slate-200 focus:ring-blue-500 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button
                            size="lg"
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200"
                            onClick={handleSearch}
                        >
                            <User className="mr-2 h-5 w-5" />
                            Analisar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence mode="wait">
                {selectedEmployee ? (
                    <motion.div
                        key={selectedEmployee.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Info Card */}
                        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
                            <CardContent className="relative pt-0 px-6 pb-8">
                                <div className="absolute -top-12 left-6">
                                    <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl">
                                        <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                                            {selectedEmployee.full_name.charAt(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-20 space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 line-clamp-1">{selectedEmployee.full_name}</h2>
                                        <p className="text-blue-600 font-medium">{selectedEmployee.position?.title || "Colaborador"}</p>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Briefcase className="h-4 w-4" />
                                            <span>{selectedEmployee.department?.name || "Geral"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>Admissão: {format(new Date(selectedEmployee.hire_date), "dd/MM/yyyy")}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="bg-slate-50 rounded-2xl p-4">
                                        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Status CLT</p>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">
                                            Ativo
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Analysis Card */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-2xl bg-white rounded-3xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Calculator className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <CardTitle>Análise do Período</CardTitle>
                                </div>

                                {(() => {
                                    const analysis = calculateVacationAnalysis(selectedEmployee.hire_date);
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="relative pl-6 border-l-2 border-blue-100">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white" />
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Período Aquisitivo</p>
                                                    <p className="text-lg font-bold text-slate-800">
                                                        {format(analysis.startAquisitivo, "dd/MM/yy")} → {format(analysis.endAquisitivo, "dd/MM/yy")}
                                                    </p>
                                                </div>
                                                <div className="relative pl-6 border-l-2 border-indigo-200">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Período Concessivo</p>
                                                        {analysis.daysToLimit < 120 && (
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-amber-50 text-amber-600 border-amber-200 animate-pulse">
                                                                Prazo em Atenção
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-lg font-bold text-slate-800">
                                                        {format(analysis.startConcessivo, "dd/MM/yy")} → {format(analysis.endConcessivo, "dd/MM/yy")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`p-6 rounded-3xl border-2 transition-colors relative overflow-hidden ${analysis.status === 'destructive' ? 'bg-red-50 border-red-100' :
                                                analysis.status === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'
                                                }`}>
                                                {analysis.daysToLimit < 180 && (
                                                    <div className="absolute top-0 right-0 p-2">
                                                        <div className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-xl uppercase tracking-tighter">
                                                            Risco de Multa
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mb-3">
                                                    <AlertCircle className={`h-5 w-5 ${analysis.status === 'destructive' ? 'text-red-600' :
                                                        analysis.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                                                        }`} />
                                                    <span className="font-bold text-slate-900">Recomendação IA</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-slate-700 mb-4">
                                                    {analysis.recommendation}
                                                </p>

                                                {analysis.suggestedDate && (
                                                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-black/5 shadow-sm mb-4">
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Melhor Dia Sugerido</p>
                                                        <div className="flex items-center gap-2">
                                                            <CalendarCheck className="h-5 w-5 text-blue-600" />
                                                            <p className="font-bold text-slate-900 text-sm">
                                                                {format(analysis.suggestedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                                <span className="text-slate-500 font-medium ml-2 text-xs">
                                                                    ({format(analysis.suggestedDate, "EEEE", { locale: ptBR })})
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {analysis.daysToLimit > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-black/10">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[10px] uppercase font-bold text-red-500 mb-1 flex items-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    Prazo Limite Legal (726 dias)
                                                                </p>
                                                                <p className={`text-3xl font-black ${analysis.daysToLimit < 60 ? 'text-red-600 animate-bounce' : 'text-slate-800'}`}>
                                                                    {analysis.daysToLimit} dias
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Data Finita</p>
                                                                <p className="font-bold text-slate-700">{format(analysis.endConcessivo, "dd/MM/yy")}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </Card>

                            <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-3xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                                        <CalendarCheck className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Sugestões Inteligentes de Divisão</CardTitle>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { title: "Tradicional", days: "30", desc: "Período integral" },
                                        { title: "Flexível", days: "15 + 15", desc: "Dois períodos iguais" },
                                        { title: "Estratégico", days: "14 + 10 + 6", desc: "Divisão em 3 vezes" }
                                    ].map((opt, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                            <p className="text-blue-400 font-bold mb-1">{opt.title}</p>
                                            <p className="text-xl font-bold mb-2 group-hover:scale-110 transition-transform origin-left">{opt.days} dias</p>
                                            <p className="text-xs text-slate-400">{opt.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Restrictive Check Badge */}
                                <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <Info className="h-4 w-4 text-blue-400" />
                                    <span>O sistema verificará automaticamente os **períodos bloqueados pela empresa** ao agendar.</span>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
                        <User className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Aguardando busca de colaborador...</p>
                    </div>
                )}
            </AnimatePresence>

            {/* DASHBOARD GLOBAL DE FÉRIAS */}
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden mt-8">
                <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle>Planejamento Interativo Global</CardTitle>
                            <CardDescription>Evite que mais de 20% do departamento acesse férias simultaneamente</CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl">
                                    <Wand2 className="h-4 w-4 mr-2" />
                                    Auto-Planejar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <DropdownMenuItem onClick={() => handleAutoPlan(30)} className="cursor-pointer font-medium p-3">
                                    <div className="flex flex-col">
                                        <span>30 dias contínuos</span>
                                        <span className="text-[10px] text-slate-400">Padrão integral</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAutoPlan(15)} className="cursor-pointer font-medium p-3">
                                    <div className="flex flex-col">
                                        <span>15 dias</span>
                                        <span className="text-[10px] text-slate-400">1º Período dividido</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="w-[250px] bg-white rounded-xl shadow-sm border-slate-200">
                                <SelectValue placeholder="Filtrar por Departamento" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="ALL">Todos os Departamentos</SelectItem>
                                {departments.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[300px]">Colaborador</TableHead>
                                <TableHead>Departamento</TableHead>
                                <TableHead>Início Planejado</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead className="text-right">Status do Período</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Carregando colaboradores...
                                    </TableCell>
                                </TableRow>
                            ) : employees?.filter(emp => deptFilter === "ALL" ? true : emp.department?.name === deptFilter).map(emp => {
                                const status = getConflictStatus(emp);
                                return (
                                    <TableRow key={emp.id} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="font-medium text-slate-900 line-clamp-1">{emp.full_name}</div>
                                            <div className="text-xs text-slate-500">{emp.position?.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-100 font-normal">
                                                {emp.department?.name || "N/A"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="date"
                                                className="w-40 rounded-lg border-slate-200 bg-white"
                                                value={plannedVacations[emp.id]?.startDate || ""}
                                                onChange={(e) => handlePlanChange(emp.id, 'startDate', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={String(plannedVacations[emp.id]?.duration || "")}
                                                onValueChange={(val) => handlePlanChange(emp.id, 'duration', val)}
                                            >
                                                <SelectTrigger className="w-[120px] rounded-lg bg-white">
                                                    <SelectValue placeholder="Dias" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">Nenhum</SelectItem>
                                                    <SelectItem value="10">10 dias</SelectItem>
                                                    <SelectItem value="14">14 dias</SelectItem>
                                                    <SelectItem value="15">15 dias</SelectItem>
                                                    <SelectItem value="20">20 dias</SelectItem>
                                                    <SelectItem value="30">30 dias</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!status ? (
                                                <span className="text-xs text-slate-400">Não planejado</span>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className={`
                                                        ${status.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                        ${status.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                        ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        {status.type === 'error' && <AlertCircle className="h-3 w-3" />}
                                                        {status.type === 'warning' && <AlertCircle className="h-3 w-3" />}
                                                        {status.type === 'success' && <CheckCircle2 className="h-3 w-3" />}
                                                        {status.message}
                                                    </div>
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

const Label = ({ children }: { children: React.ReactNode }) => <label className="text-sm font-bold text-slate-700">{children}</label>;
