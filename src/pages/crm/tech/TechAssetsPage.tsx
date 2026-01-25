import { useState, useRef } from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Loader2,
    Laptop,
    Smartphone,
    Tablet,
    Monitor,
    Box,
    QrCode
} from "lucide-react";
import { format } from "date-fns";
import { useTechAssets, TechAsset } from "@/hooks/useTech";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function TechAssetsPage() {
    const { assets, isLoading, createAsset } = useTechAssets();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [isNewAssetOpen, setIsNewAssetOpen] = useState(false);

    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [newAsset, setNewAsset] = useState<Partial<TechAsset>>({
        device_type: 'notebook',
        status: 'available',
        brand: '',
        model: '',
        asset_tag: '',
        serial_number: '',
        location: '',
        assigned_to_name: ''
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) return;

                const lines = text.split(/\r?\n/);
                if (lines.length === 0) return;

                // Better CSV parsing detecting separator from FIRST LINE
                let separator = ',';
                if (lines[0].indexOf(';') > -1) {
                    separator = ';';
                }

                const headers = lines[0].toLowerCase().split(separator).map(h => h.trim().replace(/"/g, ''));
                console.log('Detected headers:', headers, 'Separator:', separator);

                let successCount = 0;
                let errorCount = 0;
                let skippedCount = 0;

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));

                    const getVal = (keyPart: string) => {
                        const index = headers.findIndex(h => h.includes(keyPart));
                        return index !== -1 ? values[index] : '';
                    };

                    // Flexible Column Matching
                    const tag = getVal('tag') || getVal('patrimonio') || getVal('asset') || (values.length > 0 ? values[0] : '');
                    const typeRaw = getVal('tipo') || getVal('device') || getVal('categoria');
                    const brand = getVal('marca') || getVal('fabricante');
                    const model = getVal('modelo') || getVal('produto');
                    const user = getVal('resp') || getVal('user') || getVal('usuario') || getVal('nome');
                    const serial = getVal('serial') || getVal('serie');
                    const local = getVal('local') || getVal('depto') || getVal('departamento');

                    if (!tag) {
                        console.warn(`Skipping line ${i}: Missing tag. Values:`, values);
                        skippedCount++;
                        continue;
                    }

                    // Normalize type
                    let type: any = 'other';
                    const t = (typeRaw || '').toLowerCase();
                    const mUpper = (model || '').toUpperCase();

                    if (mUpper.startsWith('SM-X') || mUpper.includes('TAB')) {
                        type = 'tablet';
                    } else if (mUpper.startsWith('SM-A') || mUpper.startsWith('SM-S') || mUpper.startsWith('IPHONE') || t.includes('smart') || t.includes('cel')) {
                        type = 'smartphone';
                    } else if (t.includes('note') || t.includes('laptop') || mUpper.includes('BOOK') || mUpper.includes('LATITUDE')) {
                        type = 'notebook';
                    } else if (t.includes('mon')) {
                        type = 'monitor';
                    }

                    // Normalize status
                    let status: any = 'available';
                    const statusRaw = (getVal('status') || '').toLowerCase();
                    if (statusRaw.includes('uso') || user) status = 'in_use';
                    if (statusRaw.includes('disp')) status = 'available';
                    if (statusRaw.includes('manut')) status = 'maintenance';
                    if (statusRaw.includes('queb') || statusRaw.includes('defeit') || statusRaw.includes('broken')) status = 'broken';

                    const newAssetData: any = {
                        asset_tag: tag,
                        device_type: type,
                        brand: brand || 'Genérica',
                        model: model || 'Modelo Desconhecido',
                        status: status,
                        assigned_to_name: user || '',
                        location: local || '',
                        serial_number: serial || ''
                    };

                    try {
                        await createAsset.mutateAsync(newAssetData);
                        successCount++;
                    } catch (err) {
                        console.error('Failed to import asset:', newAssetData, err);
                        errorCount++;
                    }
                }

                if (successCount > 0) {
                    toast.success(`${successCount} importados com sucesso! (${skippedCount} pulados)`);
                } else {
                    toast.warning(`Nenhum item importado. Headers: ${headers.join(', ')}`);
                }

            } catch (error) {
                console.error("Error parsing CSV:", error);
                toast.error("Erro ao processar arquivo CSV");
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    const handleCreateAsset = () => {
        if (!newAsset.asset_tag || !newAsset.model || !newAsset.brand || !newAsset.device_type) {
            toast.error("Preencha os campos obrigatórios (*)");
            return;
        }

        createAsset.mutate(newAsset as any, {
            onSuccess: () => {
                setIsNewAssetOpen(false);
                setNewAsset({
                    device_type: 'notebook',
                    status: 'available',
                    brand: '',
                    model: '',
                    asset_tag: '',
                    serial_number: '',
                    location: '',
                    assigned_to_name: ''
                });
            }
        });
    };

    const filteredAssets = assets?.filter(asset => {
        const matchesSearch =
            asset.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());

        // Tab Logic
        if (activeTab === 'all') return matchesSearch;

        // Custom logic for misclassified items (optional, but good for UI consistency if backend data is messy)
        if (activeTab === 'notebook' && (asset.device_type === 'notebook' || asset.device_type === 'other')) return matchesSearch; // Show 'other' in notebooks if needed? No, strict filtering is better.

        return matchesSearch && asset.device_type === activeTab;
    });

    const statusMap: Record<string, { label: string; className: string }> = {
        available: { label: "Disponível", className: "bg-green-100 text-green-800" },
        in_use: { label: "Em Uso", className: "bg-blue-100 text-blue-800" },
        maintenance: { label: "Manutenção", className: "bg-yellow-100 text-yellow-800" },
        broken: { label: "Quebrado", className: "bg-red-100 text-red-800" },
        lost: { label: "Perdido", className: "bg-gray-100 text-gray-800" },
        retired: { label: "Aposentado", className: "bg-gray-200 text-gray-500" },
    };

    const typeIcon = (type: string) => {
        switch (type) {
            case 'notebook': return <Laptop className="h-4 w-4" />;
            case 'smartphone': return <Smartphone className="h-4 w-4" />;
            case 'tablet': return <Tablet className="h-4 w-4" />;
            case 'monitor': return <Monitor className="h-4 w-4" />;
            default: return <Box className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight">Controle de Ativos</h1>
                    <p className="text-muted-foreground">
                        Gerencie o inventário de TI: Notebooks, Tablets e Celulares.
                    </p>
                </div>

                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                        {isImporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        )}
                        Importar CSV
                    </Button>
                    <Dialog open={isNewAssetOpen} onOpenChange={setIsNewAssetOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Ativo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                                <DialogTitle>Cadastrar Novo Ativo</DialogTitle>
                                <DialogDescription>
                                    Insira as informações do equipamento para controle de inventário.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Tipo de Dispositivo *</Label>
                                        <Select
                                            value={newAsset.device_type}
                                            onValueChange={(v: any) => setNewAsset({ ...newAsset, device_type: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="notebook">Notebook</SelectItem>
                                                <SelectItem value="smartphone">Smartphone</SelectItem>
                                                <SelectItem value="tablet">Tablet</SelectItem>
                                                <SelectItem value="monitor">Monitor</SelectItem>
                                                <SelectItem value="other">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status Atual *</Label>
                                        <Select
                                            value={newAsset.status}
                                            onValueChange={(v: any) => setNewAsset({ ...newAsset, status: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Disponível</SelectItem>
                                                <SelectItem value="in_use">Em Uso</SelectItem>
                                                <SelectItem value="maintenance">Em Manutenção</SelectItem>
                                                <SelectItem value="broken">Com Defeito</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Patrimônio (Tag) *</Label>
                                        <Input
                                            placeholder="Ex: MB-NB-100"
                                            value={newAsset.asset_tag}
                                            onChange={e => setNewAsset({ ...newAsset, asset_tag: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Número de Série</Label>
                                        <Input
                                            placeholder="Serial Number"
                                            value={newAsset.serial_number}
                                            onChange={e => setNewAsset({ ...newAsset, serial_number: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Marca *</Label>
                                        <Input
                                            placeholder="Ex: Dell, Samsung"
                                            value={newAsset.brand}
                                            onChange={e => setNewAsset({ ...newAsset, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Modelo *</Label>
                                        <Input
                                            placeholder="Ex: Latitude 5420"
                                            value={newAsset.model}
                                            onChange={e => setNewAsset({ ...newAsset, model: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Localização</Label>
                                        <Input
                                            placeholder="Ex: Matriz - Sala TI"
                                            value={newAsset.location}
                                            onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Usuário Responsável</Label>
                                        <Input
                                            placeholder="Nome do colaborador"
                                            value={newAsset.assigned_to_name}
                                            onChange={e => setNewAsset({ ...newAsset, assigned_to_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsNewAssetOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreateAsset} disabled={createAsset.isPending}>
                                    {createAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Cadastrar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Inventário</CardTitle>
                        <div className="relative w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por tag, modelo ou usuário..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="notebook" className="gap-2"><Laptop className="h-3 w-3" /> Notebooks</TabsTrigger>
                            <TabsTrigger value="tablet" className="gap-2"><Tablet className="h-3 w-3" /> Tablets</TabsTrigger>
                            <TabsTrigger value="smartphone" className="gap-2"><Smartphone className="h-3 w-3" /> Celulares</TabsTrigger>
                        </TabsList>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tag</TableHead>
                                    <TableHead>Equipamento</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Responsável / Local</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAssets?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            Nenhum ativo encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAssets?.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-mono font-medium text-xs">
                                                <div className="flex items-center gap-2">
                                                    <QrCode className="h-3 w-3 text-muted-foreground" />
                                                    {asset.asset_tag}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium flex items-center gap-2">
                                                        {typeIcon(asset.device_type)}
                                                        {asset.model}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{asset.brand} - {asset.serial_number || 'S/N N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={statusMap[asset.status]?.className}>
                                                    {statusMap[asset.status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium">{asset.assigned_to_name || '-'}</span>
                                                    <span className="text-xs text-muted-foreground">{asset.location}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
