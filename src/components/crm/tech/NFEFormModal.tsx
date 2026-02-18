import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { NFEFormData } from '@/types/nfe';
import { FileUp, Loader2 } from 'lucide-react';

interface NFEFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    defaultSector?: string;
}

const SECTORS = [
    { value: 'tech_digital', label: 'Tech Digital' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'logistica', label: 'Logística' },
    { value: 'comercial_inside_sales', label: 'Comercial - Inside Sales' },
    { value: 'comercial_franquias', label: 'Comercial - Franquias' },
    { value: 'comercial_sudeste', label: 'Comercial - Sudeste' },
    { value: 'comercial_sul', label: 'Comercial - Sul' },
    { value: 'comercial_centro', label: 'Comercial - Centro' },
    { value: 'comercial_norte', label: 'Comercial - Norte' },
    { value: 'rh', label: 'RH' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'compras', label: 'Compras' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'cientifica', label: 'Científica' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'admin', label: 'Administração' }
];

export default function NFEFormModal({ open, onOpenChange, onSuccess, defaultSector = 'tech_digital' }: NFEFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<NFEFormData>({
        sector: defaultSector,
        nfe_number: '',
        nfe_series: '',
        emission_date: '',
        due_date: '',
        supplier_name: '',
        supplier_cnpj: '',
        total_value: 0,
        description: '',
        is_recurring: false,
        recurrence_type: 'monthly'
    });
    const [nfeFile, setNfeFile] = useState<File | null>(null);
    const [boletoFile, setBoletoFile] = useState<File | null>(null);
    const [displayValue, setDisplayValue] = useState('0,00');

    // Format currency for display
    const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Parse currency input
    const parseCurrency = (value: string): number => {
        // Remove tudo exceto números
        const numbers = value.replace(/\D/g, '');
        // Converte para número (divide por 100 para considerar centavos)
        return parseFloat(numbers) / 100 || 0;
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = parseCurrency(inputValue);

        setFormData({ ...formData, total_value: numericValue });
        setDisplayValue(formatCurrency(numericValue));
    };

    // Format CNPJ: 00.000.000/0000-00
    const formatCNPJ = (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 14) {
            return numbers
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }
        return value;
    };

    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCNPJ(e.target.value);
        setFormData({ ...formData, supplier_cnpj: formatted });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nfe_number || !formData.supplier_name || !formData.emission_date || !formData.due_date) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            // Calculate next due date if recurring
            let next_due_date = null;
            if (formData.is_recurring && formData.recurrence_type) {
                const dueDate = new Date(formData.due_date);
                if (formData.recurrence_type === 'monthly') {
                    dueDate.setMonth(dueDate.getMonth() + 1);
                } else if (formData.recurrence_type === 'quarterly') {
                    dueDate.setMonth(dueDate.getMonth() + 3);
                } else if (formData.recurrence_type === 'annual') {
                    dueDate.setFullYear(dueDate.getFullYear() + 1);
                }
                next_due_date = dueDate.toISOString().split('T')[0];
            }

            // Insert NFE record
            const { data: nfeData, error: nfeError } = await supabase
                .from('nfe_records')
                .insert([{
                    sector: formData.sector,
                    nfe_number: formData.nfe_number,
                    nfe_series: formData.nfe_series || null,
                    emission_date: formData.emission_date,
                    due_date: formData.due_date,
                    supplier_name: formData.supplier_name,
                    supplier_cnpj: formData.supplier_cnpj || null,
                    total_value: formData.total_value,
                    description: formData.description || null,
                    is_recurring: formData.is_recurring,
                    recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
                    recurrence_day: formData.is_recurring ? new Date(formData.due_date).getDate() : null,
                    next_due_date: next_due_date,
                    status: 'pending'
                }])
                .select()
                .single();

            if (nfeError) throw nfeError;

            // Upload files if provided
            if (nfeFile && nfeData) {
                const nfeFilePath = `${formData.sector}/${nfeData.id}/nfe_${nfeFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('nfe-documents')
                    .upload(nfeFilePath, nfeFile);

                if (uploadError) {
                    console.error('NFE file upload error:', uploadError);
                } else {
                    // Save attachment record
                    await supabase.from('nfe_attachments').insert([{
                        nfe_id: nfeData.id,
                        file_type: 'nfe_pdf',
                        file_name: nfeFile.name,
                        file_path: nfeFilePath,
                        file_size: nfeFile.size
                    }]);
                }
            }

            if (boletoFile && nfeData) {
                const boletoFilePath = `${formData.sector}/${nfeData.id}/boleto_${boletoFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('nfe-documents')
                    .upload(boletoFilePath, boletoFile);

                if (uploadError) {
                    console.error('Boleto file upload error:', uploadError);
                } else {
                    // Save attachment record
                    await supabase.from('nfe_attachments').insert([{
                        nfe_id: nfeData.id,
                        file_type: 'boleto_pdf',
                        file_name: boletoFile.name,
                        file_path: boletoFilePath,
                        file_size: boletoFile.size
                    }]);
                }
            }

            toast.success('NFE cadastrada com sucesso!');
            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (err: any) {
            console.error('Error creating NFE:', err);
            toast.error(`Erro ao cadastrar NFE: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            sector: defaultSector,
            nfe_number: '',
            nfe_series: '',
            emission_date: '',
            due_date: '',
            supplier_name: '',
            supplier_cnpj: '',
            total_value: 0,
            description: '',
            is_recurring: false,
            recurrence_type: 'monthly'
        });
        setNfeFile(null);
        setBoletoFile(null);
        setDisplayValue('0,00');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-rose-gold-dark">
                        Nova NFE
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Setor */}
                        <div className="space-y-2">
                            <Label htmlFor="sector">Setor *</Label>
                            <Select
                                value={formData.sector}
                                onValueChange={(value) => setFormData({ ...formData, sector: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTORS.map((sector) => (
                                        <SelectItem key={sector.value} value={sector.value}>
                                            {sector.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Número NFE */}
                        <div className="space-y-2">
                            <Label htmlFor="nfe_number">Número da NFE *</Label>
                            <Input
                                id="nfe_number"
                                value={formData.nfe_number}
                                onChange={(e) => setFormData({ ...formData, nfe_number: e.target.value })}
                                placeholder="123456"
                                required
                            />
                        </div>

                        {/* Série */}
                        <div className="space-y-2">
                            <Label htmlFor="nfe_series">Série</Label>
                            <Input
                                id="nfe_series"
                                value={formData.nfe_series}
                                onChange={(e) => setFormData({ ...formData, nfe_series: e.target.value })}
                                placeholder="1"
                            />
                        </div>

                        {/* Data de Emissão */}
                        <div className="space-y-2">
                            <Label htmlFor="emission_date">Data de Emissão *</Label>
                            <Input
                                id="emission_date"
                                type="date"
                                value={formData.emission_date}
                                onChange={(e) => setFormData({ ...formData, emission_date: e.target.value })}
                                required
                            />
                        </div>

                        {/* Data de Vencimento */}
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Data de Vencimento *</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                required
                            />
                        </div>

                        {/* Valor */}
                        <div className="space-y-2">
                            <Label htmlFor="total_value">Valor Total (R$) *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    R$
                                </span>
                                <Input
                                    id="total_value"
                                    type="text"
                                    value={displayValue}
                                    onChange={handleValueChange}
                                    placeholder="0,00"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Fornecedor */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="supplier_name">Nome do Fornecedor *</Label>
                            <Input
                                id="supplier_name"
                                value={formData.supplier_name}
                                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                                placeholder="Empresa XYZ Ltda"
                                required
                            />
                        </div>

                        {/* CNPJ */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="supplier_cnpj">CNPJ do Fornecedor</Label>
                            <Input
                                id="supplier_cnpj"
                                value={formData.supplier_cnpj}
                                onChange={handleCNPJChange}
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                            />
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detalhes sobre a NFE..."
                                rows={3}
                            />
                        </div>

                        {/* Recorrência */}
                        <div className="space-y-2 col-span-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_recurring"
                                    checked={formData.is_recurring}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, is_recurring: checked as boolean })
                                    }
                                />
                                <Label htmlFor="is_recurring" className="cursor-pointer">
                                    Esta NFE é recorrente
                                </Label>
                            </div>
                        </div>

                        {formData.is_recurring && (
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="recurrence_type">Tipo de Recorrência</Label>
                                <Select
                                    value={formData.recurrence_type}
                                    onValueChange={(value: any) => setFormData({ ...formData, recurrence_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Mensal</SelectItem>
                                        <SelectItem value="quarterly">Trimestral</SelectItem>
                                        <SelectItem value="annual">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Upload NFE */}
                        <div className="space-y-2">
                            <Label htmlFor="nfe_file">Anexar NFE (PDF)</Label>
                            <div className="relative">
                                <Input
                                    id="nfe_file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setNfeFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer"
                                />
                                <FileUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                            {nfeFile && (
                                <p className="text-xs text-muted-foreground">{nfeFile.name}</p>
                            )}
                        </div>

                        {/* Upload Boleto */}
                        <div className="space-y-2">
                            <Label htmlFor="boleto_file">Anexar Boleto (PDF)</Label>
                            <div className="relative">
                                <Input
                                    id="boleto_file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setBoletoFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer"
                                />
                                <FileUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                            {boletoFile && (
                                <p className="text-xs text-muted-foreground">{boletoFile.name}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-rose-gold hover:bg-rose-gold-dark text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Cadastrar NFE'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
