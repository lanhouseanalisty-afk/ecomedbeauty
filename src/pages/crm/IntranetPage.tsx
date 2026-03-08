
import { NoticeBoard } from '@/components/intranet/NoticeBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, FileText, Megaphone, Shield, Trophy, Coffee } from 'lucide-react';

export default function IntranetPage() {
    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold text-gray-800">Intranet Ecomedbeauty</h1>

            <div className="space-y-6">
                {/* Mural Interativo - Full Width */}
                <div className="w-full">
                    <NoticeBoard />
                </div>

                {/* Bottom Section: Status and Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Status */}
                    <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center gap-2 font-serif">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                                Status da Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Meta do Mês</h4>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-4xl font-black text-rose-600 tracking-tighter">85%</span>
                                    <span className="text-sm font-bold text-slate-400">R$ 1.2M / 1.5M</span>
                                </div>
                                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: '85%' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Users className="w-3 h-3 text-blue-500" /> Equipe
                                    </h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-blue-600">42</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Colabs</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Target className="w-3 h-3 text-amber-500" /> Projetos
                                    </h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-amber-600">8</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Ativos</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-serif">Links Rápidos</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ul className="space-y-3">
                                <li>
                                    <a href="/crm/intranet/gamificacao" className="group flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 font-bold transition-all hover:bg-amber-100 hover:scale-[1.02]">
                                        <Trophy className="w-5 h-5" />
                                        <span>Gamificação (Gamônia)</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/crm/intranet/compliance" className="group flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 font-bold transition-all hover:bg-rose-100 hover:scale-[1.02]">
                                        <Shield className="w-5 h-5" />
                                        <span>Compliance & Assistente IA</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/crm/biblioteca" className="group flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold transition-all hover:bg-blue-100 hover:scale-[1.02]">
                                        <FileText className="w-5 h-5" />
                                        <span>Manual de Processos & Biblioteca</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/crm/limpeza/agenda" className="group flex items-center gap-3 p-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-bold transition-all hover:bg-teal-100 hover:scale-[1.02]">
                                        <Coffee className="w-5 h-5" />
                                        <span>Solicitação de Copa & Limpeza</span>
                                    </a>
                                </li>
                                <li className="grid grid-cols-1 gap-2 mt-4">
                                    <a href="#" className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 hover:underline transition-colors pl-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Políticas de RH
                                    </a>
                                    <a href="#" className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 hover:underline transition-colors pl-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Solicitar Férias
                                    </a>
                                    <a href="#" className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 hover:underline transition-colors pl-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Abrir Ticket TI
                                    </a>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
