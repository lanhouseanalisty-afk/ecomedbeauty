import { useState } from "react";
import {
    Plus,
    Loader2,
    MoreHorizontal,
    Play,
    Pause,
    Filter,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCampaigns } from "@/hooks/useMarketing";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/crm/shared/EmptyState";

export default function MarketingCampaignsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { campaigns, isLoading, createCampaign } = useCampaigns();

    const [newCampaign, setNewCampaign] = useState({
        name: "",
        type: "awareness",
        description: "",
        budget: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        channels: [] as string[],
    });

    const handleCreateCampaign = () => {
        createCampaign.mutate({
            name: newCampaign.name,
            type: newCampaign.type,
            description: newCampaign.description,
            budget: newCampaign.budget,
            start_date: newCampaign.start_date,
            end_date: newCampaign.end_date,
            channels: newCampaign.channels,
            status: 'draft',
        }, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setNewCampaign({
                    name: "",
                    type: "awareness",
                    description: "",
                    budget: 0,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: "",
                    channels: [],
                });
            }
        });
    };

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Ativa</Badge>;
            case "scheduled":
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Agendada</Badge>;
            case "completed":
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Finalizada</Badge>;
            case "paused":
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pausada</Badge>;
            case "draft":
                return <Badge variant="outline">Rascunho</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const filteredCampaigns = campaigns?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Campanhas</h1>
                    <p className="text-muted-foreground">Gerencie todas as suas campanhas de marketing</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar campanha..."
                            className="pl-9 w-[200px] lg:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Campanha
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Nova Campanha</DialogTitle>
                                <DialogDescription>
                                    Configure uma nova campanha de marketing.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome da Campanha</Label>
                                    <Input
                                        id="name"
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Tipo</Label>
                                        <select
                                            id="type"
                                            value={newCampaign.type}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="awareness">Awareness</option>
                                            <option value="leads">Geração de Leads</option>
                                            <option value="conversion">Conversão</option>
                                            <option value="retention">Retenção</option>
                                            <option value="remarketing">Remarketing</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="budget">Orçamento (R$)</Label>
                                        <Input
                                            id="budget"
                                            type="number"
                                            value={newCampaign.budget}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="start_date">Data Início</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={newCampaign.start_date}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="end_date">Data Fim</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={newCampaign.end_date}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={newCampaign.description}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreateCampaign} disabled={createCampaign.isPending}>
                                    {createCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Criar Campanha
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {!filteredCampaigns?.length ? (
                <EmptyState
                    title="Nenhuma campanha encontrada"
                    description={searchTerm ? "Tente buscar com outro termo" : "Crie sua primeira campanha"}
                    actionLabel={searchTerm ? undefined : "Nova Campanha"}
                    onAction={searchTerm ? undefined : () => setIsDialogOpen(true)}
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="hover-lift flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                                            {campaign.type}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(campaign.status)}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {campaign.status === 'active' ? (
                                                    <DropdownMenuItem>
                                                        <Pause className="h-4 w-4 mr-2" />
                                                        Pausar
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem>
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Ativar
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 flex flex-col">
                                <div className="flex-1">
                                    {campaign.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                            {campaign.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Orçamento</span>
                                        <span className="font-medium">
                                            {formatCurrency(campaign.spent || 0)} / {formatCurrency(campaign.budget || 0)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={campaign.budget ? ((campaign.spent || 0) / campaign.budget) * 100 : 0}
                                        className="h-2"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
                                    <span>
                                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('pt-BR') : '-'}
                                        {campaign.end_date ? ` até ${new Date(campaign.end_date).toLocaleDateString('pt-BR')}` : ''}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
