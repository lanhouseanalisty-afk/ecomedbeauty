
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Video, FileText, Search, PlayCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Document {
    id: string;
    title: string;
    description: string;
    category: 'manual' | 'video' | 'onboarding' | 'policy';
    content_type: 'url' | 'text';
    content: string;
    created_at: string;
}

export default function KnowledgeBasePage() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        // Mock data for immediate feedback if table is empty (User experience)
        // In real app, remove mock fallback once populated
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) console.error(error);

        if (data && data.length > 0) {
            setDocs(data);
        } else {
            // Mock Data for Demo
            setDocs([
                {
                    id: '1', title: 'Manual de Onboarding', description: 'Guia completo para novos colaboradores.',
                    category: 'onboarding', content_type: 'text', content: 'Bem-vindo à Ecomedbeauty! Este guia...', created_at: new Date().toISOString()
                },
                {
                    id: '2', title: 'Treinamento de Vendas', description: 'Vídeo aula sobre técnicas de negociação.',
                    category: 'video', content_type: 'url', content: 'https://youtube.com/...', created_at: new Date().toISOString()
                },
                {
                    id: '3', title: 'Política de Férias', description: 'Regras e prazos para solicitação.',
                    category: 'policy', content_type: 'text', content: 'As férias devem ser solicitadas com 30 dias...', created_at: new Date().toISOString()
                },
            ]);
        }
        setLoading(false);
    };

    const filteredDocs = docs.filter(doc => {
        const matchesCategory = filter === 'all' || doc.category === filter;
        const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
            doc.description?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getIcon = (category: string) => {
        switch (category) {
            case 'video': return <Video className="w-5 h-5 text-purple-500" />;
            case 'manual': return <BookOpen className="w-5 h-5 text-blue-500" />;
            case 'policy': return <FileText className="w-5 h-5 text-amber-500" />;
            default: return <BookOpen className="w-5 h-5" />;
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Biblioteca Interna</h1>
                <p className="text-muted-foreground mt-2">
                    Manuais, treinamentos e materiais educativos.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <Tabs defaultValue="all" onValueChange={setFilter} className="w-full md:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="manual">Manuais</TabsTrigger>
                        <TabsTrigger value="video">Vídeos</TabsTrigger>
                        <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                        <TabsTrigger value="policy">Políticas</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar material..."
                        className="pl-8"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredDocs.map(doc => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-rose-50 transition-colors">
                                    {getIcon(doc.category)}
                                </div>
                                {doc.content_type === 'url' && <Badge variant="outline"><PlayCircle className="w-3 h-3 mr-1" /> Vídeo</Badge>}
                            </div>
                            <CardTitle className="mt-4 text-lg">{doc.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full text-rose-gold border-rose-gold/20 group-hover:bg-rose-gold group-hover:text-white transition-all">
                                {doc.content_type === 'url' ? 'Assistir Agora' : 'Ler Documento'} <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
