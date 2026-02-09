import { useState } from "react";
import {
    Users,
    Plus,
    Target,
    TrendingUp,
    DollarSign,
    Phone,
    Mail,
    Building,
    MoreHorizontal,
    Loader2,
    Search,
    LayoutGrid,
    List as ListIcon,
    Globe,
    MapPin,
    Store
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
    DropdownMenuTrigger,
    DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";
import SectorHROperationsPage from "../SectorHROperationsPage";

export default function FranquiasPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
    const [newStore, setNewStore] = useState({
        name: "",
        manager: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        status: "active",
    });

    // Mock data for initial display
    const stores = [
        { id: 1, name: "Franquia Centro", manager: "Roberto Silva", city: "São Paulo", state: "SP", status: "active", sales: 156000 },
        { id: 2, name: "Franquia Zona Sul", manager: "Ana Oliveira", city: "Porto Alegre", state: "RS", status: "active", sales: 142000 },
        { id: 3, name: "Franquia Norte", manager: "Carlos Santos", city: "Manaus", state: "AM", status: "setup", sales: 0 },
    ];

    const handleCreateStore = () => {
        // Add logic to save new store
        setIsDialogOpen(false);
        // Reset form
        setNewStore({
            name: "",
            manager: "",
            email: "",
            phone: "",
            city: "",
            state: "",
            status: "active",
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            active: { label: "Ativa", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
            setup: { label: "Em Implantação", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
            inactive: { label: "Inativa", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
        };
        const config = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700" };
        return <Badge variant="outline" className={cn("font-medium", config.className)}>{config.label}</Badge>;
    };

    const stats = [
        {
            title: "Total Franquias",
            value: "3",
            icon: Store,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            trend: "2 Ativas, 1 Implantação"
        },
        {
            title: "Faturamento Total",
            value: "R$ 298K",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            trend: "+15% vs mês anterior"
        },
        {
            title: "Ticket Médio",
            value: "R$ 450",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            trend: "+5% vs mês anterior"
        },
        {
            title: "Leads/Franquia",
            value: "45",
            icon: Users,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            trend: "Média mensal"
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                            Gestão de Franquias
                        </h1>
                        <p className="text-muted-foreground mt-1">Acompanhamento e suporte à rede de franquias</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <TabsList>
                            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                            <TabsTrigger value="people">Gestão de Pessoas</TabsTrigger>
                        </TabsList>
                        <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestor: Anderson Gomes</Badge>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-orange-600 text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nova Franquia
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Nova Franquia</DialogTitle>
                                    <DialogDescription>
                                        Cadastre uma nova unidade franqueada.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nome da Unidade</Label>
                                        <Input
                                            id="name"
                                            value={newStore.name}
                                            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="manager">Gerente</Label>
                                            <Input
                                                id="manager"
                                                value={newStore.manager}
                                                onChange={(e) => setNewStore({ ...newStore, manager: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Telefone</Label>
                                            <Input
                                                id="phone"
                                                value={newStore.phone}
                                                onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">Cidade</Label>
                                            <Input
                                                id="city"
                                                value={newStore.city}
                                                onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="state">Estado</Label>
                                            <Input
                                                id="state"
                                                value={newStore.state}
                                                onChange={(e) => setNewStore({ ...newStore, state: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={newStore.status}
                                            onValueChange={(value) => setNewStore({ ...newStore, status: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Ativa</SelectItem>
                                                <SelectItem value="setup">Em Implantação</SelectItem>
                                                <SelectItem value="inactive">Inativa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreateStore}>
                                        Cadastrar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card key={stat.title} className={cn("border-l-4 hover:shadow-lg transition-all", `stagger-${index + 1}`)} style={{ borderLeftColor: stat.color.replace('text-', '').replace('600', '500') }}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={cn("p-2 rounded-full", stat.bg)}>
                                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-t-4 border-t-primary/20 shadow-md">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Unidades Franqueadas</CardTitle>
                                    <CardDescription>Lista de lojas e status operacional</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar franquia..."
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Gerente</TableHead>
                                            <TableHead>Localização</TableHead>
                                            <TableHead>Faturamento (Mês)</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stores.map((store) => (
                                            <TableRow key={store.id} className="group hover:bg-muted/30 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Store className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-semibold">{store.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{store.manager}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        {store.city}/{store.state}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {store.sales > 0 ? (
                                                        <span className="font-medium">
                                                            R$ {(store.sales / 1000).toFixed(1)}K
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(store.status)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="people">
                    <SectorHROperationsPage departmentSlug="franquias" departmentName="Franquias" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
