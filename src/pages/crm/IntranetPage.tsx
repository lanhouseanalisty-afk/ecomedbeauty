
import { NoticeBoard } from '@/components/intranet/NoticeBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, FileText, Megaphone, Shield } from 'lucide-react';

export default function IntranetPage() {
    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold text-gray-800">Intranet Ecomedbeauty</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content: Notice Board (Takes up 2 columns) */}
                <div className="md:col-span-2 space-y-6">

                    <NoticeBoard />
                </div>

                {/* Sidebar: Company Status (Takes up 1 column) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Status da Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg border">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">Meta do Mês</h4>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold text-rose-600">85%</span>
                                    <span className="text-xs text-muted-foreground">R$ 1.2M / 1.5M</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full mt-2">
                                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-lg border">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Equipe Ativa
                                </h4>
                                <span className="text-2xl font-bold text-blue-600">42</span>
                                <span className="text-xs text-muted-foreground ml-2">Colaboradores</span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-lg border">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Projetos
                                </h4>
                                <span className="text-2xl font-bold text-amber-600">8</span>
                                <span className="text-xs text-muted-foreground ml-2">Em andamento</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Links Rápidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li><a href="/crm/intranet/compliance" className="text-rose-600 font-semibold hover:underline flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Compliance & Assistente IA
                                </a></li>
                                <li><a href="/crm/biblioteca" className="text-blue-600 hover:underline">Manual de Processos & Biblioteca</a></li>
                                <li><a href="#" className="text-blue-600 hover:underline">Políticas de RH</a></li>
                                <li><a href="#" className="text-blue-600 hover:underline">Solicitar Férias</a></li>
                                <li><a href="#" className="text-blue-600 hover:underline">Abrir Ticket TI</a></li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
