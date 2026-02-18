import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    FileText,
    Receipt,
    Plus,
    Search,
    Calendar,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Filter,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import { NFERecord } from '@/types/nfe';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NFEFormModal from '@/components/crm/tech/NFEFormModal';

export default function NFEPage() {
    const [nfes, setNfes] = useState<NFERecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchNFEs();
    }, []);

    async function fetchNFEs() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('nfe_records')
                .select('*')
                .order('due_date', { ascending: true });

            if (error) throw error;
            setNfes(data || []);
        } catch (err) {
            console.error('Error fetching NFEs:', err);
            toast.error('Erro ao carregar NFEs');
        } finally {
            setLoading(false);
        }
    }

    // Filter NFEs
    const filteredNFEs = nfes.filter(nfe => {
        const matchesSearch =
            nfe.nfe_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nfe.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || nfe.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total: nfes.length,
        pending: nfes.filter(n => n.status === 'pending').length,
        dueSoon: nfes.filter(n => {
            if (n.status !== 'pending') return false;
            const daysUntilDue = differenceInDays(parseISO(n.due_date), new Date());
            return daysUntilDue >= 0 && daysUntilDue <= 5;
        }).length,
        overdue: nfes.filter(n => n.status === 'overdue').length,
        paid: nfes.filter(n => n.status === 'paid').length
    };

    const getStatusBadge = (nfe: NFERecord) => {
        const daysUntilDue = differenceInDays(parseISO(nfe.due_date), new Date());

        if (nfe.status === 'paid') {
            return (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Pago
                </Badge>
            );
        }

        if (nfe.status === 'overdue') {
            return (
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                    <XCircle className="w-3 h-3 mr-1" />
                    Vencido
                </Badge>
            );
        }

        if (nfe.status === 'cancelled') {
            return (
                <Badge variant="outline" className="text-muted-foreground">
                    <XCircle className="w-3 h-3 mr-1" />
                    Cancelado
                </Badge>
            );
        }

        // Pending - check days until due
        if (daysUntilDue <= 2) {
            return (
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Vence em {daysUntilDue} dia{daysUntilDue !== 1 ? 's' : ''}
                </Badge>
            );
        }

        if (daysUntilDue <= 5) {
            return (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Clock className="w-3 h-3 mr-1" />
                    Vence em {daysUntilDue} dias
                </Badge>
            );
        }

        return (
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Clock className="w-3 h-3 mr-1" />
                Pendente
            </Badge>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-rose-gold-dark">
                        Controle de NFE
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerenciamento de Notas Fiscais Eletrônicas
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-rose-gold hover:bg-rose-gold-dark text-white gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nova NFE
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-rose-gold/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-rose-gold-dark">{stats.total}</p>
                            </div>
                            <FileText className="w-8 h-8 text-rose-gold/50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pendentes</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-500/50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Vencendo</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.dueSoon}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-amber-500/50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Vencidas</p>
                                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-500/50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pagas</p>
                                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-rose-gold/20">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por número ou fornecedor..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                                size="sm"
                            >
                                Todos
                            </Button>
                            <Button
                                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('pending')}
                                size="sm"
                            >
                                Pendentes
                            </Button>
                            <Button
                                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('overdue')}
                                size="sm"
                            >
                                Vencidas
                            </Button>
                            <Button
                                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('paid')}
                                size="sm"
                            >
                                Pagas
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-rose-gold/20">
                <CardHeader>
                    <CardTitle>Lista de NFEs</CardTitle>
                    <CardDescription>
                        {filteredNFEs.length} {filteredNFEs.length === 1 ? 'registro' : 'registros'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/20">
                                <TableHead>Nº NFE</TableHead>
                                <TableHead>Fornecedor</TableHead>
                                <TableHead>Setor</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Emissão</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center">
                                        Carregando...
                                    </TableCell>
                                </TableRow>
                            ) : filteredNFEs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                        Nenhuma NFE encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredNFEs.map((nfe) => (
                                    <TableRow key={nfe.id} className="hover:bg-rose-gold/5">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-rose-gold" />
                                                {nfe.nfe_number}
                                                {nfe.nfe_series && <span className="text-xs text-muted-foreground">/{nfe.nfe_series}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{nfe.supplier_name}</div>
                                                {nfe.supplier_cnpj && (
                                                    <div className="text-xs text-muted-foreground">{nfe.supplier_cnpj}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {nfe.sector.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(nfe.total_value)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(nfe.emission_date)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDate(nfe.due_date)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(nfe)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                Ver Detalhes
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* NFE Form Modal */}
            <NFEFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={fetchNFEs}
            />
        </div>
    );
}
