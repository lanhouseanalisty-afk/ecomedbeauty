
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function ReportsDashboard() {
    const [statusData, setStatusData] = useState<any[]>([]);
    const [sectorData, setSectorData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processData = async () => {
            const { data } = await supabase.from('sector_requests').select('*');
            if (!data) return;

            // 1. Status Distribution
            const statusCount = data.reduce((acc: any, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
            }, {});

            const stats = Object.keys(statusCount).map(key => ({
                name: key === 'in_progress' ? 'Em Andamento' : key === 'pending' ? 'Pendente' : 'Concluído',
                value: statusCount[key]
            }));
            setStatusData(stats);

            // 2. Sector Distribution
            const sectorCount = data.reduce((acc: any, curr) => {
                acc[curr.target_sector] = (acc[curr.target_sector] || 0) + 1;
                return acc;
            }, {});

            const sectors = Object.keys(sectorCount).map(key => ({
                name: key.toUpperCase(),
                requests: sectorCount[key]
            }));
            setSectorData(sectors);
            setLoading(false);
        };

        processData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) return <div>Carregando analíticos...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Status das Solicitações</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Demandas por Setor</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectorData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="requests" fill="#Eeb193" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
