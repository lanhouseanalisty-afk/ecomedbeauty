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

interface NFEPageProps {
    sector: string;
    sectorLabel?: string;
}

export default function NFEPage({ sector, sectorLabel }: NFEPageProps) {
    const [nfes, setNfes] = useState<NFERecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchNFEs();
    }, [sector]);

    async function fetchNFEs() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('nfe_records')
                .select('*')
                .eq('sector', sector) // Filter by sector
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

        if (daysUntilDue >= 0 && daysUntilDue <= 2) {
            return (
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Vence em {daysUntilDue} dia{daysUntilDue !== 1 ? 's' : ''}
                </Badge>
            );
        }

        if (daysUntilDue >= 3 && daysUntilDue <= 5) {
            return (
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
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
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-rose-gold-dark">
                        Controle de NFE {sectorLabel && `- ${sectorLabel}`}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie notas fiscais e boletos do setor
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total de NFEs
                        </CardTitle>
                        <FileText className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pendentes
                        </CardTitle>
                        <Clock className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Vencem em Breve
                        </CardTitle>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.dueSoon}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Vencidas
                        </CardTitle>
                        <XCircle className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overdue}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pagas
                        </CardTitle>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.paid}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número ou fornecedor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('all')}
                            >
                                Todas
                            </Button>
                            <Button
                                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('pending')}
                            >
                                Pendentes
                            </Button>
                            <Button
                                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('overdue')}
                            >
                                Vencidas
                            </Button>
                            <Button
                                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('paid')}
                            >
                                Pagas
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NFE</TableHead>
                                <TableHead>Fornecedor</TableHead>
                                <TableHead>Emissão</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Carregando...
                                    </TableCell>
                                </TableRow>
                            ) : filteredNFEs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhuma NFE encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredNFEs.map((nfe) => (
                                    <TableRow key={nfe.id}>
                                        <TableCell className="font-medium">{nfe.nfe_number}</TableCell>
                                        <TableCell>{nfe.supplier_name}</TableCell>
                                        <TableCell>{formatDate(nfe.emission_date)}</TableCell>
                                        <TableCell>{formatDate(nfe.due_date)}</TableCell>
                                        <TableCell>{formatCurrency(nfe.total_value)}</TableCell>
                                        <TableCell>{getStatusBadge(nfe)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <NFEFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={fetchNFEs}
                defaultSector={sector}
            />
        </div>
    );
}
