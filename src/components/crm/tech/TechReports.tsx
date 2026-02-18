import { useMemo, useState } from "react";
import { useTickets, useTechTeam } from "@/hooks/useTech";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEvent } from '@/lib/analytics';
import { generatePDF } from '@/lib/pdf-generator';
import { format as formatDate } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Ticket as TicketIcon, CheckCircle2, AlertTriangle, Clock, TrendingUp, Download, User, FileText } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { differenceInHours, format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "react-i18next";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS: Record<string, string> = {
    open: '#3b82f6', // blue
    in_progress: '#a855f7', // purple
    resolved: '#22c55e', // green
    closed: '#64748b', // gray
    pending: '#eab308' // yellow
};

export function TechReports() {
    const { t } = useTranslation();
    const { track } = useAnalytics();
    const { tickets, isLoading } = useTickets();
    const { data: techTeam } = useTechTeam();
    const [selectedOperator, setSelectedOperator] = useState<string>("all");

    const stats = useMemo(() => {
        if (!tickets) return null;

        const total = tickets.length;
        const byStatus = tickets.reduce((acc: any, t: any) => {
            const status = t.status || 'open';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const byPriority = tickets.reduce((acc: any, t: any) => {
            const priority = t.priority || 'medium';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});

        // SLA Calculations
        let slaBreached = 0;
        let slaMet = 0;
        let totalResolutionTime = 0;
        let resolvedCount = 0;

        tickets.forEach((t: any) => {
            // SLA breach check
            if (t.due_date) {
                const dueDate = new Date(t.due_date);
                const resolvedDate = t.resolved_at ? new Date(t.resolved_at) : null;

                if (resolvedDate) {
                    if (resolvedDate > dueDate) slaBreached++;
                    else slaMet++;

                    // Resolution time in hours
                    if (t.created_at) {
                        const created = new Date(t.created_at);
                        totalResolutionTime += differenceInHours(resolvedDate, created);
                        resolvedCount++;
                    }
                } else {
                    // Not resolved yet
                    if (new Date() > dueDate && t.status !== 'closed' && t.status !== 'resolved') {
                        slaBreached++;
                    }
                }
            }
        });

        const avgResolutionTime = resolvedCount > 0 ? (totalResolutionTime / resolvedCount).toFixed(1) : 0;

        return {
            total,
            byStatus,
            byPriority,
            slaBreached,
            slaMet,
            avgResolutionTime
        };
    }, [tickets]);

    // Operator-specific stats
    const operatorStats = useMemo(() => {
        if (!tickets || !techTeam) return [];

        const operatorMap = new Map();

        techTeam.forEach((member: any) => {
            operatorMap.set(member.id, {
                id: member.id,
                name: member.name,
                email: member.email,
                totalTickets: 0,
                resolved: 0,
                inProgress: 0,
                pending: 0,
                slaBreached: 0,
                slaMet: 0,
                totalResolutionTime: 0,
                resolvedCount: 0
            });
        });

        tickets.forEach((t: any) => {
            if (t.assigned_to && operatorMap.has(t.assigned_to)) {
                const operator = operatorMap.get(t.assigned_to);
                operator.totalTickets++;

                if (t.status === 'resolved' || t.status === 'closed') {
                    operator.resolved++;

                    // Calculate resolution time
                    if (t.created_at && t.resolved_at) {
                        const created = new Date(t.created_at);
                        const resolved = new Date(t.resolved_at);
                        operator.totalResolutionTime += differenceInHours(resolved, created);
                        operator.resolvedCount++;
                    }

                    // SLA check
                    if (t.due_date && t.resolved_at) {
                        const dueDate = new Date(t.due_date);
                        const resolvedDate = new Date(t.resolved_at);
                        if (resolvedDate > dueDate) {
                            operator.slaBreached++;
                        } else {
                            operator.slaMet++;
                        }
                    }
                } else if (t.status === 'in_progress') {
                    operator.inProgress++;
                } else if (t.status === 'pending' || t.status === 'pending_user' || t.status === 'pending_vendor') {
                    operator.pending++;
                }
            }
        });

        return Array.from(operatorMap.values()).map(op => ({
            ...op,
            avgResolutionTime: op.resolvedCount > 0 ? (op.totalResolutionTime / op.resolvedCount).toFixed(1) : '0',
            resolutionRate: op.totalTickets > 0 ? Math.round((op.resolved / op.totalTickets) * 100) : 0,
            slaCompliance: (op.slaMet + op.slaBreached) > 0 ? Math.round((op.slaMet / (op.slaMet + op.slaBreached)) * 100) : 0
        }));
    }, [tickets, techTeam]);

    const selectedOperatorData = useMemo(() => {
        if (selectedOperator === "all") return null;
        return operatorStats.find(op => op.id === selectedOperator);
    }, [selectedOperator, operatorStats]);

    const statusData = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.byStatus).map(([name, value]) => ({
            name: name.replace('_', ' ').toUpperCase(),
            value,
            fill: STATUS_COLORS[name] || '#ccc'
        }));
    }, [stats]);

    const priorityData = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.byPriority).map(([name, value]) => ({
            name: name.toUpperCase(),
            value
        }));
    }, [stats]);

    const handleExportOperatorReport = (fileFormat: 'pdf' | 'excel') => {
        if (!selectedOperatorData) {
            toast.error(t('reports.tech.operator.messages.selectFirst'));
            return;
        }

        // Track export event
        track(AnalyticsEvent.REPORT_EXPORTED, {
            format: fileFormat,
            operator_id: selectedOperatorData.id,
            operator_name: selectedOperatorData.name
        });

        if (fileFormat === 'pdf') {
            const operatorTickets = tickets.filter((t: any) => t.assigned_to === selectedOperatorData.id);

            const columns = [
                { header: 'ID', dataKey: 'id' },
                { header: 'Título', dataKey: 'title' },
                { header: 'Status', dataKey: 'status' },
                { header: 'Prioridade', dataKey: 'priority' },
                { header: 'Data', dataKey: 'created_at' }
            ];

            const data = operatorTickets.map((t: any) => ({
                id: t.id.substring(0, 8),
                title: t.title,
                status: t.status,
                priority: t.priority,
                created_at: t.created_at ? formatDate(new Date(t.created_at), 'dd/MM/yyyy HH:mm') : '-'
            }));

            generatePDF(data, columns, {
                title: `Relatório de Performance - ${selectedOperatorData.name}`,
                subtitle: `Tickets Resolvidos: ${selectedOperatorData.resolved} | Taxa de Resolução: ${selectedOperatorData.resolutionRate}%`,
                filename: `relatorio_${selectedOperatorData.name.replace(/\s+/g, '_').toLowerCase()}_${formatDate(new Date(), 'yyyyMMdd')}`
            });

            toast.success(t('reports.tech.operator.messages.exporting', { name: selectedOperatorData.name, format: 'PDF' }));
        } else {
            // Simulate Excel export for now
            toast.info(t('reports.tech.operator.messages.soon'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('reports.tech.kpi.totalTickets')}</CardTitle>
                        <TicketIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">{t('reports.tech.kpi.sub.vsLastMonth')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('reports.tech.kpi.slaBreached')}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.slaBreached || 0}</div>
                        <p className="text-xs text-muted-foreground">{t('reports.tech.kpi.sub.lateTickets')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('reports.tech.kpi.avgTime')}</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.avgResolutionTime}h</div>
                        <p className="text-xs text-muted-foreground">{t('reports.tech.kpi.sub.avgHours')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('reports.tech.kpi.resolutionRate')}</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.total ? Math.round(((stats.byStatus['resolved'] || 0) + (stats.byStatus['closed'] || 0)) / stats.total * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">{t('reports.tech.kpi.sub.finishedTickets')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('reports.tech.charts.byStatus')}</CardTitle>
                        <CardDescription>{t('reports.tech.charts.byStatusDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('reports.tech.charts.priority')}</CardTitle>
                        <CardDescription>{t('reports.tech.charts.priorityDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Operator Reports Section */}
            <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                {t('reports.tech.operator.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('reports.tech.operator.subtitle')}
                            </CardDescription>
                        </div>
                        {selectedOperator !== "all" && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportOperatorReport('pdf')}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {t('reports.tech.operator.exportPDF')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportOperatorReport('excel')}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {t('reports.tech.operator.exportExcel')}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Operator Selector */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">{t('reports.tech.operator.selectLabel')}</label>
                        <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder={t('reports.tech.operator.selectPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('reports.tech.operator.allOperators')}</SelectItem>
                                {techTeam?.map((member: any) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Individual Operator Stats */}
                    {selectedOperatorData && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {selectedOperatorData.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedOperatorData.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedOperatorData.email}</p>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {t('reports.tech.kpi.totalTickets')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedOperatorData.totalTickets}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {t('reports.tech.operator.resolved')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{selectedOperatorData.resolved}</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('reports.tech.operator.table.rate')}: {selectedOperatorData.resolutionRate}%
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {t('reports.tech.kpi.avgTime')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedOperatorData.avgResolutionTime}h</div>
                                        <p className="text-xs text-muted-foreground mt-1">{t('reports.tech.operator.resolution')}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {t('reports.tech.operator.slaCompliance')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${selectedOperatorData.slaCompliance >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {selectedOperatorData.slaCompliance}%
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {selectedOperatorData.slaMet} {t('reports.tech.kpi.slaMet')} / {selectedOperatorData.slaBreached} {t('reports.tech.kpi.slaBreached')}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Current Workload */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">{t('reports.tech.operator.workload')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{t('reports.tech.operator.inProgress')}</span>
                                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                                    {selectedOperatorData.inProgress}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{t('reports.tech.operator.pending')}</span>
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                    {selectedOperatorData.pending}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* All Operators Table */}
                    {selectedOperator === "all" && (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                                        <TableHead>{t('reports.tech.operator.table.operator')}</TableHead>
                                        <TableHead className="text-center">{t('reports.tech.operator.table.total')}</TableHead>
                                        <TableHead className="text-center">{t('reports.tech.operator.table.resolved')}</TableHead>
                                        <TableHead className="text-center">{t('reports.tech.operator.table.rate')}</TableHead>
                                        <TableHead className="text-center">{t('reports.tech.operator.table.avgTime')}</TableHead>
                                        <TableHead className="text-center">{t('reports.tech.operator.table.sla')}</TableHead>
                                        <TableHead className="text-center">{t('reports.tech.operator.table.inProgress')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {operatorStats.map((operator) => (
                                        <TableRow key={operator.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                        {operator.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{operator.name}</p>
                                                        <p className="text-xs text-muted-foreground">{operator.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">{operator.totalTickets}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-green-600 font-medium">{operator.resolved}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={operator.resolutionRate >= 70 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                                    {operator.resolutionRate}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-mono">{operator.avgResolutionTime}h</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={operator.slaCompliance >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {operator.slaCompliance}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                                    {operator.inProgress}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
