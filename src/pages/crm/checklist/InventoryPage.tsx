import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import {
    Plus,
    Search,
    FileUp,
    Laptop,
    Smartphone,
    Tablet,
    Monitor,
    Box,
    Cpu,
    Trash2,
    Loader2,
    Filter,
    ArrowUpAZ,
    ArrowDownZA,
    Check,
    ChevronsUpDown
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
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
} from '@/components/ui/dialog';
import { toast } from "sonner";

// --- TYPES ---

interface TechAsset {
    id: string;
    asset_tag: string;
    serial_number?: string;
    hostname?: string;
    model: string;
    brand: string;
    device_type: string;
    status: string;
    assigned_to_name?: string;
    location?: string;
    company?: string;
    notes?: string;
}

const MOCK_ASSETS: TechAsset[] = [
    { id: '1', asset_tag: 'MB-TEST-01', model: 'Teste', brand: 'Teste', device_type: 'notebook', status: 'available' }
];

export default function InventoryPage() {
    const [activeSubTab, setActiveSubTab] = useState<'notebook' | 'tablet' | 'smartphone' | 'chip'>('notebook');
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Sort Config
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    // Column Filters
    const [filters, setFilters] = useState({
        asset_tag: '',
        model: '',
        hostname: '',
        assigned_to_name: '',
        serial_number: '',
        location: '',
        status: ''
    });

    // Data States
    const [assets, setAssets] = useState<TechAsset[]>([]);

    // Edit Modal States
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Partial<TechAsset>>({});
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, [activeSubTab]);

    async function fetchData() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tech_assets')
                .select('*')
                .eq('device_type', activeSubTab);

            if (error) {
                console.warn(`Table 'tech_assets' might not exist, using mock data for ${activeSubTab}`, error);
                setAssets(MOCK_ASSETS.filter(a => a.device_type === activeSubTab));
            } else {
                setAssets(data || []);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }

    // Import Logic
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to array of arrays to access by index
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

                let processedCount = 0;
                // Use a Map to deduplicate based on asset_tag (patrimonio)
                // If the excel has duplicate tags, the last one wins.
                const assetsMap = new Map();

                console.log("Linhas encontradas na planilha:", jsonData.length);

                // Start from row 1 (index 1) assuming row 0 is header
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length < 3) continue; // Skip empty rows

                    // Force string conversion to avoid type errors
                    const patrimonio = row[0] ? String(row[0]).trim() : ""; // Col A

                    // Column Analysis based on screenshots:
                    // Col A [0]: Asset Tag
                    // Col B [1]: "Laptop" (Model/Type)
                    // Col C [2]: Hostname
                    // Col D [3]: Responsável ? (Assuming based on order)
                    // Col E [4]: Serial Number (Confirmed by screenshot)

                    const modelVal = row[1] ? String(row[1]).trim() : "Notebook (Importado)"; // Col B
                    const hostname = row[2] ? String(row[2]).trim() : ""; // Col C
                    const nomeResponsavel = row[3] ? String(row[3]).trim() : ""; // Col D
                    const serialNumber = row[4] ? String(row[4]).trim() : ""; // Col E

                    // Skip header row
                    // loose check for header keywords in first few columns
                    const rowString = (row[0] + " " + row[1] + " " + row[4]).toLowerCase();
                    if (i === 0 && (rowString.includes('patrimonio') || rowString.includes('serial'))) {
                        continue;
                    }

                    if (patrimonio) {
                        assetsMap.set(patrimonio, {
                            asset_tag: patrimonio,
                            serial_number: serialNumber,
                            assigned_to_name: nomeResponsavel || 'Disponível',
                            status: nomeResponsavel && nomeResponsavel !== 'Disponível' ? 'in_use' : 'available',
                            device_type: 'notebook',
                            model: modelVal || 'Notebook',
                            brand: 'Genérico',
                            hostname: hostname,
                        });
                    }
                }

                // Convert Map values to array for Supabase
                const assetsToUpsert = Array.from(assetsMap.values());

                console.log("Ativos para inserir/atualizar:", assetsToUpsert.length);

                if (assetsToUpsert.length > 0) {
                    const { error } = await supabase
                        .from('tech_assets')
                        .upsert(assetsToUpsert, { onConflict: 'asset_tag' });

                    if (error) {
                        console.error("Erro Supabase:", error);
                        throw error;
                    }
                    // Since upsert might not return count, we use array length as proxy for success if no error
                    processedCount = assetsToUpsert.length;
                }

                toast.success(`Processo finalizado!\nImportados/Atualizados: ${processedCount} registros.`);
                fetchData(); // Refresh list

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Erro ao importar:", err);
                toast.error(`Erro ao processar o arquivo: ${err.message || JSON.stringify(err)}`);
            } finally {
                setLoading(false);
                // Reset input
                event.target.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleDeleteAll = async () => {
        // if (activeSubTab !== 'notebook') return; // Restriction removed

        if (window.confirm(`ATENÇÃO: Você tem certeza que deseja EXCLUIR TODOS os itens da categoria ${activeSubTab.toUpperCase()}? Essa ação não pode ser desfeita.`)) {
            if (window.prompt("Digite 'DELETAR' para confirmar:") === 'DELETAR') {
                setLoading(true);
                try {
                    const { error } = await supabase
                        .from('tech_assets')
                        .delete()
                        .eq('device_type', activeSubTab);

                    if (error) throw error;

                    toast.success(`Todos os itens de ${activeSubTab} foram excluídos.`);
                    fetchData();
                } catch (err) {
                    console.error(err);
                    toast.error("Erro ao excluir.");
                } finally {
                    setLoading(false);
                }
            }
        }
    };


    async function handleSaveAsset() {
        if (!editingAsset?.asset_tag) return;
        setActionLoading(true);
        try {
            // Business Rule: If status is 'available', clear the assigned user
            let finalName = editingAsset.assigned_to_name;
            if (editingAsset.status === 'available') {
                finalName = '';
            }

            if (editingAsset.id) {
                const { error } = await supabase.from('tech_assets').update({
                    asset_tag: editingAsset.asset_tag,
                    model: editingAsset.model,
                    brand: editingAsset.brand,
                    hostname: editingAsset.hostname,
                    serial_number: editingAsset.serial_number,
                    assigned_to_name: finalName,
                    location: editingAsset.location,
                    status: editingAsset.status,
                    device_type: editingAsset.device_type,
                    company: editingAsset.company,
                    notes: editingAsset.notes
                }).eq('id', editingAsset.id);
                if (error) throw error;
            } else {
                // Business Rule: If status is 'available', clear the assigned user
                let finalName = editingAsset.assigned_to_name;
                if (editingAsset.status === 'available') {
                    finalName = '';
                }

                const { error } = await supabase.from('tech_assets').insert([{
                    asset_tag: editingAsset.asset_tag,
                    model: editingAsset.model || "",
                    brand: editingAsset.brand || "",
                    hostname: editingAsset.hostname,
                    serial_number: editingAsset.serial_number,
                    assigned_to_name: finalName,
                    location: editingAsset.location,
                    status: editingAsset.status || "available",
                    device_type: activeSubTab,
                    company: editingAsset.company,
                    notes: editingAsset.notes
                }]);
                if (error) throw error;
            }
            setIsAssetModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Save asset error:", err);
            toast.error("Erro ao salvar equipamento");
        } finally {
            setActionLoading(false);
        }
    }



    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("Arquivo selecionado:", file.name);
        setActionLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                console.log("Arquivo lido, processando XLSX...");
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                if (!workbook.SheetNames.length) {
                    throw new Error("O arquivo Excel está vazio ou não tem planilhas.");
                }

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                console.log(`Linhas encontradas: ${jsonData.length}`);

                if (jsonData.length === 0) {
                    toast.error("A planilha selecionada está vazia.");
                    return;
                }

                // Função auxiliar para encontrar dados mesmo com nomes de colunas variados
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const findValue = (row: any, synonyms: string[]) => {
                    const keys = Object.keys(row);
                    const foundKey = keys.find(k =>
                        synonyms.some(s => k.toLowerCase().trim() === s.toLowerCase().trim())
                    );
                    return foundKey ? row[foundKey] : null;
                };

                const assetsToImport = jsonData.map((row) => {
                    // Mapeamento Inteligente
                    const asset_tag = findValue(row, [
                        'Patrimônio', 'Patrimonio', 'Tag', 'Asset Tag', 'ID', 'Codigo', 'Código', 'Patrimonio/Ativo',
                        'Número da Linha', 'Número', 'Linha', 'Numero', 'Telefone', 'Celular', 'Sim Card', 'ICCID', 'Linha Vivo', 'Linha Claro', 'Linha Tim'
                    ]) || `MB-IMP-${Math.random().toString(36).substr(2, 5)}`;
                    const model = findValue(row, ['Equipamento', 'Modelo', 'Model', 'Descrição', 'Descricao', 'Aparelho', 'Plano', 'Pacote']) || 'Não Especificado';
                    const brand = findValue(row, ['Marca', 'Brand', 'Fabricante', 'Fabric']) || 'Outros';
                    const hostname = findValue(row, ['Hostname', 'Nome do Computador', 'PC Name', 'Nome', 'Host']) || '';
                    const assigned_to_name = findValue(row, ['Responsável', 'Responsavel', 'Usuário', 'Usuario', 'Colaborador', 'Owner', 'Pessoa']) || 'Disponível';
                    const location = findValue(row, ['Setor', 'Departamento', 'Unidade', 'Local', 'Location', 'Dept', 'Área']) || '';
                    const company = findValue(row, ['Empresa', 'Company', 'Organization', 'Org']) || '';
                    const notes = findValue(row, ['Observações', 'Observacoes', 'Notes', 'Obs', 'Comentários', 'Comentarios']) || '';
                    const serial_number = findValue(row, ['Série', 'Serie', 'Serial', 'S/N', 'Serial Number']) || '';

                    // Normalização de Status
                    let rawStatus = findValue(row, ['Status', 'Situação', 'Situacao', 'Estado', 'Status do Ativo']) || 'available';
                    let status = 'available';
                    rawStatus = rawStatus.toString().toLowerCase();

                    if (rawStatus.includes('uso') || rawStatus.includes('use') || rawStatus.includes('atribuido')) {
                        status = 'in_use';
                    } else if (rawStatus.includes('manutencao') || rawStatus.includes('conserto') || rawStatus.includes('maintenance')) {
                        status = 'maintenance';
                    } else if (rawStatus.includes('quebrado') || rawStatus.includes('defeito') || rawStatus.includes('broken')) {
                        status = 'broken';
                    } else if (rawStatus.includes('perda') || rawStatus.includes('extravio') || rawStatus.includes('lost')) {
                        status = 'lost';
                    }

                    // Regra de Negócio: Se tem usuário (e não é * ou **), o status é Em Uso
                    if (assigned_to_name &&
                        assigned_to_name !== 'Disponível' &&
                        assigned_to_name !== '*' &&
                        assigned_to_name !== '**') {
                        status = 'in_use';
                    }

                    // Normalização de Tipo
                    let rawType = findValue(row, ['Tipo', 'Categoria', 'Type', 'Device Type', 'Tipo de Equipamento']) || '';
                    let device_type: string = activeSubTab;

                    if (rawType) {
                        rawType = rawType.toString().toLowerCase();
                        if (rawType.includes('celular') || rawType.includes('phone') || rawType.includes('mobile') || rawType.includes('smartphone')) {
                            device_type = 'smartphone';
                        } else if (rawType.includes('tablet') || rawType.includes('ipad')) {
                            device_type = 'tablet';
                        } else if (rawType.includes('monitor') || rawType.includes('tela')) {
                            device_type = 'monitor';
                        } else if (rawType.includes('chip') || rawType.includes('sim') || rawType.includes('linha')) {
                            device_type = 'chip';
                        } else if (rawType.includes('note') || rawType.includes('lap') || rawType.includes('computador')) {
                            device_type = 'notebook';
                        }
                    }

                    // Regra de Ouro: Se hostname começa com LAP -> Sempre Notebook (independente da aba ou tipo na planilha)
                    if (hostname.toUpperCase().startsWith('LAP')) {
                        device_type = 'notebook';
                    }

                    return {
                        asset_tag,
                        model,
                        brand,
                        hostname,
                        assigned_to_name,
                        location,
                        status,
                        device_type,
                        company,
                        notes,
                        serial_number
                    };
                });

                // Deduplicação dentro do arquivo: evita erro de tentar atualizar a mesma linha duas vezes em uma transação
                const uniqueAssets = Array.from(
                    assetsToImport.reduce((map, asset) => {
                        map.set(asset.asset_tag, asset);
                        return map;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    }, new Map<string, any>()).values()
                );

                console.log(`Enviando ${uniqueAssets.length} registros únicos para o Supabase...`);
                const { error } = await supabase
                    .from('tech_assets')
                    .upsert(uniqueAssets, { onConflict: 'asset_tag' });

                if (error) {
                    console.error("Erro Supabase:", error);
                    throw error;
                }

                toast.success(`${assetsToImport.length} equipamentos importados com sucesso!`);
                fetchData();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Erro detalhado na importação:", err);
                toast.error(`Erro ao importar: ${err.message || 'Verifique o formato do arquivo'}`);
            } finally {
                setActionLoading(false);
                // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
                e.target.value = '';
            }
        };

        reader.onerror = (err) => {
            console.error("Erro na leitura do arquivo:", err);
            toast.error("Erro ao ler o arquivo físico.");
            setActionLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectAll = (items: any[]) => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(i => i.id));
        }
    };

    async function handleBulkDelete() {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Deseja excluir os ${selectedIds.length} itens selecionados?`)) return;

        setActionLoading(true);
        try {
            const { error } = await supabase.from('tech_assets').delete().in('id', selectedIds);
            if (error) throw error;

            toast.success('Itens excluídos com sucesso!');
            setSelectedIds([]);
            fetchData();
        } catch (err) {
            console.error("Bulk delete error:", err);
            toast.error("Erro ao excluir itens.");
        } finally {
            setActionLoading(false);
        }
    }




    const filteredItems = assets.filter(a => {
        // Global Search
        const matchesSearch =
            a.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Column Filters
        const matchesFilters =
            (!filters.asset_tag || a.asset_tag.toLowerCase().includes(filters.asset_tag.toLowerCase())) &&
            (!filters.model || a.model.toLowerCase().includes(filters.model.toLowerCase())) &&
            (!filters.hostname || (a.hostname || '').toLowerCase().includes(filters.hostname.toLowerCase())) &&
            (!filters.assigned_to_name || (a.assigned_to_name || '').toLowerCase().includes(filters.assigned_to_name.toLowerCase())) &&
            (!filters.serial_number || (a.serial_number || '').toLowerCase().includes(filters.serial_number.toLowerCase())) &&
            (!filters.location || (a.location || '').toLowerCase().includes(filters.location.toLowerCase())) &&
            (!filters.status || (
                (a.assigned_to_name && a.assigned_to_name !== 'Disponível' && a.assigned_to_name !== '*' && a.assigned_to_name !== '**')
                    ? 'in_use' : a.status
            ).toLowerCase().includes(filters.status.toLowerCase()));

        return matchesSearch && matchesFilters;
    });

    // Apply Sorting
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valA = a[sortConfig.key as keyof TechAsset] || "";
        let valB = b[sortConfig.key as keyof TechAsset] || "";

        if (sortConfig.key === 'status') {
            valA = (a.assigned_to_name && a.assigned_to_name !== 'Disponível' && a.assigned_to_name !== '*' && a.assigned_to_name !== '**') ? 'in_use' : a.status;
            valB = (b.assigned_to_name && b.assigned_to_name !== 'Disponível' && b.assigned_to_name !== '*' && b.assigned_to_name !== '**') ? 'in_use' : b.status;
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Helper for Header with Filter
    const FilterHeader = ({ label, field, placeholder }: { label: string, field: keyof typeof filters, placeholder?: string }) => {
        const [open, setOpen] = useState(false);
        const uniqueOptions = Array.from(new Set(assets.map(a => {
            if (field === 'status') {
                return (a.assigned_to_name && a.assigned_to_name !== 'Disponível' && a.assigned_to_name !== '*' && a.assigned_to_name !== '**') ? 'in_use' : a.status;
            }
            return a[field as keyof TechAsset] || "";
        }))).filter(Boolean).sort();

        return (
            <div className="flex items-center gap-2">
                {label}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${filters[field] || sortConfig.key === field ? 'text-rose-gold' : 'text-muted-foreground'}`}>
                            {sortConfig.key === field ? (
                                sortConfig.direction === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownZA className="h-4 w-4" />
                            ) : (
                                <Filter className="h-4 w-4" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                        <div className="flex flex-col p-2 gap-2 border-b">
                            <div className="flex gap-2">
                                <Button
                                    variant={sortConfig.key === field && sortConfig.direction === 'asc' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => setSortConfig({ key: field, direction: 'asc' })}
                                >
                                    <ArrowUpAZ className="h-3 w-3 mr-1" /> A-Z
                                </Button>
                                <Button
                                    variant={sortConfig.key === field && sortConfig.direction === 'desc' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => setSortConfig({ key: field, direction: 'desc' })}
                                >
                                    <ArrowDownZA className="h-3 w-3 mr-1" /> Z-A
                                </Button>
                            </div>
                            {(filters[field] || sortConfig.key === field) && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-6 text-[10px]"
                                    onClick={() => {
                                        setFilters(prev => ({ ...prev, [field]: '' }));
                                        if (sortConfig.key === field) setSortConfig({ key: '', direction: 'asc' });
                                    }}
                                >
                                    Limpar Filtros
                                </Button>
                            )}
                        </div>
                        <Command>
                            <CommandInput placeholder={placeholder || `Buscar ${label}...`} />
                            <CommandList>
                                <CommandEmpty>Sem resultados.</CommandEmpty>
                                <CommandGroup heading="Opções">
                                    {uniqueOptions.map((option) => (
                                        <CommandItem
                                            key={option}
                                            value={option}
                                            onSelect={(currentValue) => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    [field]: currentValue === filters[field] ? "" : currentValue
                                                }));
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    filters[field]?.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {field === 'status' ? (option === 'in_use' ? 'Em Uso' : option === 'available' ? 'Disponível' : option) : option}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        )
    };


    const getDeviceIcon = (item: TechAsset) => {
        const type = (item.device_type || "").toLowerCase();
        const host = (item.hostname || "").toUpperCase();

        if (host.startsWith('LAP') || type === 'notebook') return <Laptop className="h-4 w-4" />;

        switch (type) {
            case 'smartphone': return <Smartphone className="h-4 w-4" />;
            case 'tablet': return <Tablet className="h-4 w-4" />;
            case 'monitor': return <Monitor className="h-4 w-4" />;
            default: return <Box className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        if (!status) return <Badge variant="outline">Desconhecido</Badge>;
        const variants: Record<string, string> = {
            'available': 'bg-green-500/10 text-green-600 border-green-500/20',
            'in_use': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            'maintenance': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            'broken': 'bg-red-500/10 text-red-600 border-red-500/20',
            'disponível': 'bg-green-500/10 text-green-600 border-green-500/20', // Portuguese support
            'em uso': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        };
        const label: Record<string, string> = {
            'available': 'Disponível',
            'in_use': 'Em Uso',
            'maintenance': 'Manutenção',
            'broken': 'Defeito',
            'disponível': 'Disponível',
            'em uso': 'Em Uso',
        };
        return <Badge variant="outline" className={variants[status.toLowerCase()] || ""}>{label[status.toLowerCase()] || status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex p-1 bg-muted/30 rounded-lg w-fit border border-border/50 overflow-x-auto">

                    <button
                        onClick={() => setActiveSubTab('notebook')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-medium whitespace-nowrap ${activeSubTab === 'notebook' ? "bg-white dark:bg-card text-rose-gold-dark shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Laptop className="w-4 h-4" />
                        Notebooks
                    </button>
                    <button
                        onClick={() => setActiveSubTab('tablet')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-medium whitespace-nowrap ${activeSubTab === 'tablet' ? "bg-white dark:bg-card text-rose-gold-dark shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Tablet className="w-4 h-4" />
                        Tablets
                    </button>
                    <button
                        onClick={() => setActiveSubTab('smartphone')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-medium whitespace-nowrap ${activeSubTab === 'smartphone' ? "bg-white dark:bg-card text-rose-gold-dark shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Smartphone className="w-4 h-4" />
                        Smartphones
                    </button>
                    <button
                        onClick={() => setActiveSubTab('chip')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-medium whitespace-nowrap ${activeSubTab === 'chip' ? "bg-white dark:bg-card text-rose-gold-dark shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Cpu className="w-4 h-4" />
                        Chips
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={`Buscar ativo...`}
                        className="pl-9 bg-white dark:bg-card border-rose-gold/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>




            <Card className="border-rose-gold/20 shadow-soft">
                <CardHeader className="bg-muted/10 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-serif text-rose-gold-dark capitalize">
                                {`Gestão de ${activeSubTab}s`}
                            </CardTitle>
                            <CardDescription>
                                {`Acompanhamento de ${activeSubTab}s por colaborador.`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">

                            <div className="flex gap-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImportExcel}
                                        disabled={loading}
                                    />
                                    <Button variant="outline" className="gap-2 border-rose-gold/20 text-rose-gold-dark hover:bg-rose-gold/5">
                                        <FileUp className="w-4 h-4" />
                                        Importar Planilha (Nome)
                                    </Button>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAll}
                                    className="gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-none"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Zerar Tudo
                                </Button>
                            </div>

                            {selectedIds.length > 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={handleBulkDelete}
                                    className="gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-none"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir ({selectedIds.length})
                                </Button>
                            )}

                            <Button
                                onClick={() => {
                                    setEditingAsset({});
                                    setIsAssetModalOpen(true);
                                }}
                                className="bg-rose-gold hover:bg-rose-gold-dark text-white gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Novo Ativo
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-rose-gold" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20">
                                    <>
                                        <TableHead className="w-[40px] pl-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-rose-gold/30 text-rose-gold focus:ring-rose-gold"
                                                checked={sortedItems.length > 0 && selectedIds.length === sortedItems.length}
                                                onChange={() => handleSelectAll(sortedItems)}
                                            />
                                        </TableHead>
                                        {activeSubTab === 'chip' ? (
                                            <>
                                                <TableHead><FilterHeader label="Número da Linha" field="asset_tag" /></TableHead>
                                                <TableHead><FilterHeader label="Usuário" field="assigned_to_name" /></TableHead>
                                                <TableHead className="text-right pr-6"><FilterHeader label="Status" field="status" /></TableHead>
                                            </>
                                        ) : activeSubTab === 'tablet' ? (
                                            <>
                                                <TableHead><FilterHeader label="Patrimônio" field="asset_tag" /></TableHead>
                                                <TableHead><FilterHeader label="Modelo" field="model" /></TableHead>
                                                <TableHead><FilterHeader label="Nº de Série" field="serial_number" /></TableHead>
                                                <TableHead>Empresa</TableHead>
                                                <TableHead>Observações</TableHead>
                                                <TableHead className="text-right pr-6"><FilterHeader label="Status" field="status" /></TableHead>
                                            </>
                                        ) : activeSubTab === 'smartphone' ? (
                                            <>
                                                <TableHead><FilterHeader label="Patrimônio" field="asset_tag" /></TableHead>
                                                <TableHead><FilterHeader label="Modelo" field="model" /></TableHead>
                                                <TableHead><FilterHeader label="Nº de Série" field="serial_number" /></TableHead>
                                                <TableHead><FilterHeader label="Último User" field="assigned_to_name" /></TableHead>
                                                <TableHead className="text-right pr-6"><FilterHeader label="Status" field="status" /></TableHead>
                                            </>
                                        ) : (
                                            <>
                                                <TableHead><FilterHeader label="Patrimônio" field="asset_tag" /></TableHead>
                                                <TableHead><FilterHeader label="Equipamento" field="model" /></TableHead>
                                                <TableHead><FilterHeader label="Hostname" field="hostname" /></TableHead>
                                                <TableHead><FilterHeader label="Responsável" field="assigned_to_name" /></TableHead>
                                                <TableHead><FilterHeader label="Serial Number" field="serial_number" /></TableHead>
                                                <TableHead><FilterHeader label="Setor" field="location" /></TableHead>
                                                <TableHead><FilterHeader label="Status" field="status" /></TableHead>
                                            </>
                                        )}
                                    </>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={activeSubTab === 'notebook' || activeSubTab === 'smartphone' || activeSubTab === 'tablet' ? 8 : 5} className="h-32 text-center text-muted-foreground">
                                            Nenhum item encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedItems.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className={`${selectedIds.includes(item.id) ? 'bg-rose-gold/10' : 'hover:bg-rose-gold/5'} transition-colors cursor-pointer`}
                                            onClick={(e) => {
                                                // Previne abrir o modal ao clicar apenas no checkbox
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                if ((e.target as any).tagName === 'INPUT') return;

                                                setEditingAsset(item);
                                                setIsAssetModalOpen(true);
                                            }}
                                        >
                                            <TableCell className="pl-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="rounded border-rose-gold/30 text-rose-gold focus:ring-rose-gold"
                                                />
                                            </TableCell>
                                            {activeSubTab === 'chip' ? (
                                                <>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-md bg-rose-gold/10 text-rose-gold">
                                                                {getDeviceIcon(item)}
                                                            </div>
                                                            <span className="text-sm font-medium">{item.asset_tag}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-700">{item.assigned_to_name || "Disponível"}</TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {getStatusBadge(
                                                            (item.assigned_to_name &&
                                                                item.assigned_to_name !== "Disponível" &&
                                                                item.assigned_to_name !== "*" &&
                                                                item.assigned_to_name !== "**")
                                                                ? 'in_use' : item.status
                                                        )}
                                                    </TableCell>
                                                </>
                                            ) : activeSubTab === 'tablet' ? (
                                                <>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{item.asset_tag}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase">{item.serial_number || 'S/N'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-md bg-rose-gold/10 text-rose-gold">
                                                                {getDeviceIcon(item)}
                                                            </div>
                                                            <span className="text-sm font-medium">{item.model}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{item.serial_number || "-"}</TableCell>
                                                    <TableCell className="text-sm">{item.company || "-"}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{item.notes || "-"}</TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {getStatusBadge(item.status)}
                                                    </TableCell>
                                                </>
                                            ) : activeSubTab === 'smartphone' ? (
                                                <>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{item.asset_tag}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase">{item.serial_number || 'S/N'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-md bg-rose-gold/10 text-rose-gold">
                                                                {getDeviceIcon(item)}
                                                            </div>
                                                            <span className="text-sm font-medium">{item.model}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{item.serial_number || "-"}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-700">{item.assigned_to_name || "Disponível"}</TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {getStatusBadge(item.status)}
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{item.asset_tag}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase">{item.serial_number || 'S/N'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-md bg-rose-gold/10 text-rose-gold">
                                                                {getDeviceIcon(item)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold leading-none">{item.brand}</span>
                                                                <span className="text-sm font-medium">{item.model}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-mono text-muted-foreground">{item.hostname || "-"}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-700">{item.assigned_to_name || "Disponível"}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{item.serial_number || "-"}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{item.location || "-"}</TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(
                                                            (item.assigned_to_name &&
                                                                item.assigned_to_name !== "Disponível" &&
                                                                item.assigned_to_name !== "*" &&
                                                                item.assigned_to_name !== "**")
                                                                ? 'in_use' : item.status
                                                        )}
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>


            {/* Modal de Novo/Editar Ativo */}
            <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
                <DialogContent className="max-w-2xl bg-white dark:bg-card border-rose-gold/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-rose-gold-dark">
                            {editingAsset?.id ? "Editar Equipamento" : "Novo Equipamento"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Patrimônio / Asset Tag</label>
                            <Input
                                value={editingAsset?.asset_tag || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, asset_tag: e.target.value })}
                                placeholder="MB-001"
                                className="border-rose-gold/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Numero de Série (SN)</label>
                            <Input
                                value={editingAsset?.serial_number || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, serial_number: e.target.value })}
                                placeholder="XYZ123..."
                                className="border-rose-gold/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Marca</label>
                            <Input
                                value={editingAsset?.brand || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, brand: e.target.value })}
                                placeholder="Dell, Apple..."
                                className="border-rose-gold/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Modelo</label>
                            <Input
                                value={editingAsset?.model || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, model: e.target.value })}
                                placeholder="Latitude 3420..."
                                className="border-rose-gold/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Responsável</label>
                            <Input
                                value={editingAsset?.assigned_to_name || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, assigned_to_name: e.target.value })}
                                placeholder="Nome do colaborador"
                                className="border-rose-gold/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Setor / Local</label>
                            <Input
                                value={editingAsset?.location || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                                placeholder="Marketing, TI..."
                                className="border-rose-gold/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hostname</label>
                            <Input
                                value={editingAsset?.hostname || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, hostname: e.target.value })}
                                placeholder="LAP-MKT-01"
                                className="border-rose-gold/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Empresa</label>
                            <Input
                                value={editingAsset?.company || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, company: e.target.value })}
                                placeholder="MedBeauty, ..."
                                className="border-rose-gold/20"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Observações</label>
                            <Input
                                value={editingAsset?.notes || ""}
                                onChange={(e) => setEditingAsset({ ...editingAsset, notes: e.target.value })}
                                placeholder="..."
                                className="border-rose-gold/20"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={editingAsset?.status || "available"}
                                onValueChange={(val) => setEditingAsset({ ...editingAsset, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Disponível</SelectItem>
                                    <SelectItem value="in_use">Em Uso</SelectItem>
                                    <SelectItem value="maintenance">Manutenção</SelectItem>
                                    <SelectItem value="broken">Defeito</SelectItem>
                                    <SelectItem value="lost">Perdido/Roubado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsAssetModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveAsset} disabled={actionLoading} className="bg-rose-gold text-white">
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
