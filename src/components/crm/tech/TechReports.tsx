import { useMemo } from "react";
import { useTickets } from "@/hooks/useTech";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Ticket as TicketIcon, CheckCircle2, AlertTriangle, Clock, TrendingUp } from "lucide-react";
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
import { differenceInHours } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS: Record<string, string> = {
    open: '#3b82f6', // blue
    in_progress: '#a855f7', // purple
    resolved: '#22c55e', // green
    closed: '#64748b', // gray
    pending: '#eab308' // yellow
};

export function TechReports() {
    const { tickets, isLoading } = useTickets();

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
                        <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
                        <TicketIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">+20% em relação ao mês anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SLA Violados</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.slaBreached || 0}</div>
                        <p className="text-xs text-muted-foreground">Tickets atrasados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio Resolução</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.avgResolutionTime}h</div>
                        <p className="text-xs text-muted-foreground">Média em horas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.total ? Math.round(((stats.byStatus['resolved'] || 0) + (stats.byStatus['closed'] || 0)) / stats.total * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Tickets finalizados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Tickets por Status</CardTitle>
                        <CardDescription>Distribuição atual do volume de chamados</CardDescription>
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
                        <CardTitle>Prioridade</CardTitle>
                        <CardDescription>Classificação de urgência dos tickets</CardDescription>
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
        </div>
    );
}
