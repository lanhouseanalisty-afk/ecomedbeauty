import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Briefcase, UserMinus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Checklist {
    id: string;
    title: string;
    type: string;
    status: string;
    created_at: string;
    data: any;
    employee_id?: string;
}

export default function ChecklistDashboardPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    // Fetch checklists
    const { data: checklists, isLoading } = useQuery({
        queryKey: ['checklists'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('checklists')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Checklist[];
        }
    });

    const onCreateChecklist = async (type: string) => {
        const title = type === "admissao" ? "Novo Processo de Admissão" : "Novo Processo de Demissão";

        const { data, error } = await supabase
            .from('checklists')
            .insert([
                {
                    title,
                    type,
                    status: 'pending',
                    data: { currentSection: 1 }
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Erro detalhado:", error);
            alert(`Erro ao criar checklist: ${error.message || JSON.stringify(error)}`);
        } else {
            navigate(`/crm/checklist/${data.id}`);
        }
    };

    const filteredChecklists = checklists ? checklists.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || c.type === filterType;
        return matchesSearch && matchesType;
    }) : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-gray-800">Checklist & Fluxos</h1>
                    <p className="text-muted-foreground mt-1">Gerencie admissões, demissões e processos internos.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-rose-gold hover:bg-rose-gold-dark text-white shadow-md" onClick={() => onCreateChecklist('admissao')}>
                        <Plus className="w-4 h-4 mr-2" /> Nova Admissão
                    </Button>
                    <Button variant="destructive" onClick={() => onCreateChecklist('demissao')}>
                        <UserMinus className="w-4 h-4 mr-2" /> Nova Demissão
                    </Button>
                </div>
            </div>

            <Card className="shadow-soft border-rose-gold/10">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar checklist..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="admissao">Admissão</SelectItem>
                                    <SelectItem value="demissao">Demissão</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">Carregando...</div>
                    ) : filteredChecklists.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                            Nenhum checklist encontrado. Inicie um novo processo.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredChecklists.map((checklist) => (
                                <div
                                    key={checklist.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-white group cursor-pointer"
                                    onClick={() => navigate(`/crm/checklist/${checklist.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${checklist.type === 'admissao' ? 'bg-rose-gold/10 text-rose-gold' : 'bg-red-100 text-red-600'}`}>
                                            {checklist.type === 'admissao' ? <Briefcase className="h-5 w-5" /> : <UserMinus className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 group-hover:text-rose-gold-dark transition-colors">{checklist.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <span>Criado em {new Date(checklist.created_at).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <Badge variant="outline" className={`${getStatusColor(checklist.status)}`}>
                                                    {checklist.status === 'pending' ? 'Em Andamento' : 'Concluído'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-rose-gold" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
