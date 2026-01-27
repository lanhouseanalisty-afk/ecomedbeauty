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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function TechAssetsPage() {
    const { assets, isLoading, createAsset } = useTechAssets();

    // Fetch employees to map names to CPFs
    const { data: employees } = useQuery({
        queryKey: ['employees-basic-list'],
        queryFn: async () => {
            const { data } = await supabase
                .from('employees')
                .select('id, full_name, cpf');
            return data || [];
        }
    });

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

    // ... (Keep handleFileUpload logic exactly as is, it's long so I'll reference it or copy it if I must. Since I'm replacing the whole file content effectively in this block, I must include it.)
    // For brevity in this replace block, I will re-include the handleFileUpload logic.

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

                let separator = ',';
                if (lines[0].indexOf(';') > -1) {
                    separator = ';';
                }

                const headers = lines[0].toLowerCase().split(separator).map(h => h.trim().replace(/"/g, ''));

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

                    const tag = getVal('tag') || getVal('patrimonio') || getVal('asset') || (values.length > 0 ? values[0] : '');
                    const typeRaw = getVal('tipo') || getVal('device') || getVal('categoria');
                    const brand = getVal('marca') || getVal('fabricante');
                    const model = getVal('modelo') || getVal('produto');
                    const user = getVal('resp') || getVal('user') || getVal('usuario') || getVal('nome');
                    const serial = getVal('serial') || getVal('serie');
                    const local = getVal('local') || getVal('depto') || getVal('departamento');

                    if (!tag) {
                        skippedCount++;
                        continue;
                    }

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
                    toast.warning(`Nenhum item importado.`);
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

    // Filter Logic
    const filteredAssets = assets?.filter(asset => {
        const matchesSearch =
            asset.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && asset.device_type === activeTab;
    });

    // Grouping Logic
    const groupedAssets = filteredAssets?.reduce((acc, asset) => {
        const key = asset.assigned_to_name || "Estoque / Disponível";
        if (!acc[key]) {
            acc[key] = {
                name: key,
                location: asset.location || "",
                items: []
            };
        }
        acc[key].items.push(asset);
        // Update location if we found one and previous was empty
        if (!acc[key].location && asset.location) {
            acc[key].location = asset.location;
        }
        return acc;
    }, {} as Record<string, { name: string, location: string, items: TechAsset[] }>);

    const groupedList = Object.values(groupedAssets || {}).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight">Controle de Ativos</h1>
                    <p className="text-muted-foreground">
                        Gestão de equipamentos por colaborador.
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
                                {/* Form fields same as before... re-implementing for completeness */}
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
                        <CardTitle>Inventário por Colaborador</CardTitle>
                        <div className="relative w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Nome</TableHead>
                                <TableHead className="w-[150px]">Setor</TableHead>
                                <TableHead>Equipamentos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : groupedList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groupedList.map((group, idx) => {
                                    // Try to match employee by name to show ID
                                    const employee = employees?.find(e => e.full_name === group.name);
                                    const cpfDisplay = employee?.cpf ? `ID: ${employee.cpf.replace(/\D/g, '').slice(0, 3)}...` : '';

                                    return (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                {group.name}
                                                {cpfDisplay && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                        {cpfDisplay}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {group.location || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {group.items.map((item, i) => (
                                                        <span key={item.id} className="text-sm text-muted-foreground">
                                                            {item.device_type === 'notebook' && <Laptop className="inline h-3 w-3 mr-1" />}
                                                            {item.device_type === 'smartphone' && <Smartphone className="inline h-3 w-3 mr-1" />}
                                                            {item.model} <span className="font-mono text-xs">({item.asset_tag})</span>
                                                            {i < group.items.length - 1 ? ", " : ""}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
