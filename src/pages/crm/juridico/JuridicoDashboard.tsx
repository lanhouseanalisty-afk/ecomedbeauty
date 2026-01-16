import { useState } from "react";
import { 
  Scale, 
  Plus, 
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Loader2,
  Calendar,
  Eye,
  Download,
  FileSignature,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContracts, useLegalStats } from "@/hooks/useJuridico";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { SearchFilter } from "@/components/crm/shared/SearchFilter";
import { DataExport } from "@/components/crm/shared/DataExport";
import { EmptyState } from "@/components/crm/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";

const complianceData = [
  { name: "Conforme", value: 85 },
  { name: "Em Revisão", value: 10 },
  { name: "Não Conforme", value: 5 },
];

export default function JuridicoDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { contracts, isLoading, createContract } = useContracts();
  const { data: stats } = useLegalStats();

  const [newContract, setNewContract] = useState({
    title: "",
    contract_number: "",
    type: "service",
    party_name: "",
    value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  const handleCreateContract = () => {
    createContract.mutate({
      title: newContract.title,
      contract_number: newContract.contract_number || `CTR-${Date.now()}`,
      type: newContract.type,
      party_name: newContract.party_name,
      value: newContract.value,
      start_date: newContract.start_date,
      end_date: newContract.end_date,
      status: 'draft',
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewContract({
          title: "",
          contract_number: "",
          type: "service",
          party_name: "",
          value: 0,
          start_date: new Date().toISOString().split('T')[0],
          end_date: "",
        });
      }
    });
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Ativo", className: "bg-success/10 text-success" },
      pending_signature: { label: "Aguardando Assinatura", className: "bg-warning/10 text-warning" },
      expiring: { label: "A Vencer", className: "bg-destructive/10 text-destructive" },
      expired: { label: "Vencido", className: "bg-muted text-muted-foreground" },
      draft: { label: "Rascunho", className: "bg-info/10 text-info" },
      cancelled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
    };
    const config = statusMap[status || 'draft'] || { label: status || 'Rascunho', className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string | null) => {
    const typeMap: Record<string, string> = {
      supplier: "Fornecedor",
      client: "Cliente",
      nda: "NDA",
      lease: "Aluguel",
      service: "Serviço",
      employment: "Trabalho",
    };
    return <Badge variant="outline">{typeMap[type || 'service'] || type}</Badge>;
  };

  const quickStats = [
    { title: "Contratos Ativos", value: stats?.activeContracts || 0, icon: FileText, color: "text-primary", trend: { value: 5 } },
    { title: "A Vencer (30d)", value: stats?.expiringContracts || 0, icon: Clock, color: "text-warning" },
    { title: "Casos Abertos", value: stats?.openCases || 0, icon: AlertTriangle, color: "text-destructive" },
    { title: "Compliance", value: `${stats?.complianceRate || 0}%`, icon: Shield, color: "text-success", description: "Taxa de conformidade" },
  ];

  const filteredContracts = contracts?.filter(contract => {
    return contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.party_name?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Jurídico</h1>
          <p className="text-muted-foreground">Contratos, casos e compliance</p>
        </div>
        <div className="flex gap-2">
          <DataExport 
            data={filteredContracts} 
            filename="contratos"
            columns={[
              { key: 'contract_number', label: 'Número' },
              { key: 'title', label: 'Título' },
              { key: 'party_name', label: 'Parte' },
              { key: 'type', label: 'Tipo' },
              { key: 'status', label: 'Status' },
              { key: 'value', label: 'Valor' },
            ]}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Contrato</DialogTitle>
                <DialogDescription>
                  Registre um novo contrato no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título do Contrato</Label>
                  <Input
                    id="title"
                    value={newContract.title}
                    onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contract_number">Número</Label>
                    <Input
                      id="contract_number"
                      placeholder="CTR-001"
                      value={newContract.contract_number}
                      onChange={(e) => setNewContract({ ...newContract, contract_number: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newContract.type}
                      onValueChange={(value) => setNewContract({ ...newContract, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Serviço</SelectItem>
                        <SelectItem value="supplier">Fornecedor</SelectItem>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="nda">NDA</SelectItem>
                        <SelectItem value="lease">Aluguel</SelectItem>
                        <SelectItem value="employment">Trabalho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="party_name">Parte Contratante</Label>
                    <Input
                      id="party_name"
                      value={newContract.party_name}
                      onChange={(e) => setNewContract({ ...newContract, party_name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newContract.value}
                      onChange={(e) => setNewContract({ ...newContract, value: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Data Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newContract.start_date}
                      onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">Data Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newContract.end_date}
                      onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateContract} disabled={createContract.isPending}>
                  {createContract.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Contrato
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <QuickStats stats={quickStats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <KPIChart
          title="Status de Compliance"
          description="Distribuição por status de conformidade"
          data={complianceData}
          type="pie"
        />
        <Card>
          <CardHeader>
            <CardTitle>Alertas Jurídicos</CardTitle>
            <CardDescription>Itens que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Contratos a vencer</p>
                <p className="text-xs text-muted-foreground">3 contratos vencem nos próximos 30 dias</p>
              </div>
              <Button variant="outline" size="sm">Ver</Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <Clock className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Prazos próximos</p>
                <p className="text-xs text-muted-foreground">2 casos com prazo judicial esta semana</p>
              </div>
              <Button variant="outline" size="sm">Ver</Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-info/5 rounded-lg border border-info/20">
              <FileSignature className="h-5 w-5 text-info flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Assinaturas pendentes</p>
                <p className="text-xs text-muted-foreground">5 contratos aguardando assinatura</p>
              </div>
              <Button variant="outline" size="sm">Ver</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Contratos</CardTitle>
              <CardDescription>Gestão de contratos e documentos legais</CardDescription>
            </div>
            <SearchFilter
              searchPlaceholder="Buscar contrato..."
              onSearchChange={setSearchTerm}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({contracts?.length || 0})</TabsTrigger>
              <TabsTrigger value="active">Ativos ({contracts?.filter(c => c.status === 'active').length || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({contracts?.filter(c => c.status === 'pending_signature').length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredContracts.length === 0 ? (
                <EmptyState
                  variant={searchTerm ? 'search' : 'empty'}
                  title={searchTerm ? 'Nenhum resultado' : 'Nenhum contrato'}
                  description={searchTerm 
                    ? 'Tente um termo diferente'
                    : 'Registre seu primeiro contrato'
                  }
                  actionLabel={!searchTerm ? 'Novo Contrato' : undefined}
                  onAction={() => setIsDialogOpen(true)}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Parte</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contract_number}</TableCell>
                        <TableCell>{contract.title}</TableCell>
                        <TableCell>{contract.party_name || '-'}</TableCell>
                        <TableCell>{getTypeBadge(contract.type)}</TableCell>
                        <TableCell>
                          {contract.value ? formatCurrency(contract.value) : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Contrato
                              </DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileSignature className="h-4 w-4 mr-2" />
                                Solicitar Assinatura
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Renovar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
