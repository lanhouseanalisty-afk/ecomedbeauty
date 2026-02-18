import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getStoredEvents, StoredEvent, AnalyticsEvent } from "@/lib/analytics";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {
    Activity,
    Users,
    MousePointer2,
    Eye,
    RefreshCw,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, startOfDay, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboard() {
    const [events, setEvents] = useState<StoredEvent[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const refreshData = () => {
        setEvents(getStoredEvents());
        setLastUpdated(new Date());
    };

    useEffect(() => {
        refreshData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    const clearData = () => {
        if (confirm("Tem certeza que deseja limpar todos os dados de analytics locais?")) {
            localStorage.removeItem('ecomed_analytics_events');
            refreshData();
        }
    };

    // Metrics
    const metrics = useMemo(() => {
        const totalEvents = events.length;
        const pageViews = events.filter(e => e.type === 'page').length;
        const interactions = events.filter(e => e.type === 'track').length;
        const uniqueUsers = new Set(events.filter(e => e.type === 'identify').map(e => e.name)).size ||
            new Set(events.filter(e => e.properties?.userId).map(e => e.properties?.userId)).size;

        return { totalEvents, pageViews, interactions, uniqueUsers };
    }, [events]);

    // Page Views over last 7 days
    const pageViewsData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return startOfDay(d);
        });

        return last7Days.map(date => {
            const count = events.filter(e =>
                e.type === 'page' &&
                isSameDay(parseISO(e.timestamp), date)
            ).length;

            return {
                date: format(date, 'dd/MM', { locale: ptBR }),
                views: count
            };
        });
    }, [events]);

    // Event Distribution
    const eventDistribution = useMemo(() => {
        const counts: Record<string, number> = {};

        events
            .filter(e => e.type === 'track')
            .forEach(e => {
                const name = e.name;
                counts[name] = (counts[name] || 0) + 1;
            });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [events]);

    return (
        <div className="space-y-6 p-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Métricas em tempo real (Armazenamento Local)
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="text-sm text-muted-foreground self-center mr-2">
                        Atualizado: {format(lastUpdated, 'HH:mm:ss')}
                    </span>
                    <Button variant="outline" size="sm" onClick={refreshData}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={clearData}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpar
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <section aria-labelledby="kpi-heading" className="space-y-4">
                <h2 id="kpi-heading" className="sr-only">Visão Geral</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.pageViews}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Interações</CardTitle>
                            <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.interactions}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.uniqueUsers}</div>
                        </CardContent>
                    </Card>
                </div>


            </section >

            <section aria-labelledby="charts-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <h2 id="charts-heading" className="sr-only">Gráficos Detalhados</h2>
                {/* Page Views Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Visualizações de Página (7 dias)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={pageViewsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Event Distribution Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top Eventos de Negócio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={eventDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d">
                                        {eventDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>

                </Card>
            </section >

            {/* Recent Events Table */}
            <section aria-labelledby="events-heading">
                <h2 id="events-heading" className="sr-only">Registro de Eventos</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Eventos Recentes</CardTitle>
                        <CardDescription>Últimos 20 eventos capturados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.slice(0, 20).map((event, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono text-xs">
                                            {format(parseISO(event.timestamp), 'dd/MM HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${event.type === 'page' ? 'bg-blue-100 text-blue-800' :
                                                    event.type === 'track' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'}`}>
                                                {event.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium text-sm truncate max-w-[200px]" title={event.name}>
                                            {event.name}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground truncate max-w-[300px]">
                                            {JSON.stringify(event.properties)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {events.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                            Nenhum evento registrado ainda. Navegue pelo sistema para gerar dados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
