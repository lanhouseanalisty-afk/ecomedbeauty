import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,

} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Car, Plus, Search, MapPin, Gauge, Edit2, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Vehicle {
    id: string;
    model: string;
    plate: string;
    mileage: number;
    location: string;
    status: 'available' | 'in_use' | 'maintenance';
    rental_company: string;
    assigned_to_name?: string;
}

export function FleetView({ embedded = false }: { embedded?: boolean }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    // Form State
    const [newModel, setNewModel] = useState('');
    const [newPlate, setNewPlate] = useState('');
    const [newMileage, setNewMileage] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newCompany, setNewCompany] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [newStatus, setNewStatus] = useState<'available' | 'in_use' | 'maintenance'>('available');

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (editingVehicle) {
            setNewModel(editingVehicle.model);
            setNewPlate(editingVehicle.plate);
            setNewMileage(editingVehicle.mileage.toString());
            setNewLocation(editingVehicle.location);
            setNewCompany(editingVehicle.rental_company);
            setNewStatus(editingVehicle.status);
            setIsDialogOpen(true);
        } else {
            resetForm();
        }
    }, [editingVehicle]);

    async function fetchVehicles() {
        setLoading(true);
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('model');

        if (error) {
            console.error('Error fetching vehicles:', error);
            // Don't show error toast on initial load to avoid spam if table doesn't exist yet
        } else {
            setVehicles(data || []);
        }
        setLoading(false);
    }

    function resetForm() {
        setNewModel('');
        setNewPlate('');
        setNewMileage('');
        setNewLocation('');
        setNewCompany('');
        setNewStatus('available');
    }

    async function handleSave() {
        if (!newModel || !newPlate) {
            toast.error("Modelo e Placa são obrigatórios");
            return;
        }

        const vehicleData = {
            model: newModel,
            plate: newPlate,
            mileage: parseInt(newMileage) || 0,
            location: newLocation,
            rental_company: newCompany,
            status: newStatus
        };

        if (editingVehicle) {
            // Update
            const { error } = await supabase
                .from('vehicles')
                .update(vehicleData)
                .eq('id', editingVehicle.id);

            if (error) {
                toast.error("Erro ao atualizar veículo");
            } else {
                toast.success("Veículo atualizado!");
            }
        } else {
            // Create
            const { error } = await supabase
                .from('vehicles')
                .insert(vehicleData);

            if (error) {
                toast.error("Erro ao criar veículo");
            } else {
                toast.success("Veículo criado!");
            }
        }

        setIsDialogOpen(false);
        setEditingVehicle(null);
        resetForm();
        fetchVehicles();
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Tem certeza que deseja excluir este veículo?")) return;

        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) {
            toast.error("Erro ao excluir");
        } else {
            toast.success("Veículo excluído");
            fetchVehicles();
        }
    }

    async function handleCreateExample() {
        setLoading(true);
        const exampleVehicle = {
            model: "Fiat Mobi Like 1.0",
            plate: "ABC-" + Math.floor(1000 + Math.random() * 9000), // Randomize plate to avoid unique constraint
            mileage: 12500,
            location: "São Paulo - SP",
            rental_company: "Localiza",
            status: "available"
        };

        const { error } = await supabase.from('vehicles').insert(exampleVehicle);
        if (error) {
            console.error(error);
            toast.error("Erro ao criar exemplo: " + error.message);
        } else {
            toast.success("Exemplo criado!");
            fetchVehicles();
        }
        setLoading(false);
    }

    const filteredVehicles = vehicles.filter(v =>
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`space-y-6 animate-in fade-in ${embedded ? '' : 'container mx-auto p-6'}`}>

            {!embedded && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-rose-gold-dark flex items-center gap-3">
                            <Car className="h-8 w-8 text-rose-gold" />
                            Gestão de Frota
                        </h1>
                        <p className="text-muted-foreground mt-1">Gerencie os veículos alugados da empresa.</p>
                    </div>
                    <Button onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }} className="bg-rose-gold hover:bg-rose-gold-dark text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Veículo
                    </Button>
                </div>
            )}

            {embedded && (
                <div className="flex justify-end mb-4">
                    <Button onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }} className="bg-rose-gold hover:bg-rose-gold-dark text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Veículo
                    </Button>
                </div>
            )}

            {/* Filters and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por modelo, placa ou local..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                        Disponíveis: {vehicles.filter(v => v.status === 'available').length}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                        Em Uso: {vehicles.filter(v => v.status === 'in_use').length}
                    </Badge>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card shadow-soft">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Placa</TableHead>
                            <TableHead>Locadora</TableHead>
                            <TableHead>Localização</TableHead>
                            <TableHead>KM Atual</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Atribuído a</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">Carregando frota...</TableCell>
                            </TableRow>
                        ) : filteredVehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <p>Nenhum veículo encontrado.</p>
                                        <Button variant="outline" onClick={handleCreateExample} className="mt-2 text-rose-gold border-rose-gold/20 hover:bg-rose-gold/5">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Gerar Exemplo
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVehicles.map((vehicle) => (
                                <TableRow key={vehicle.id} className="hover:bg-muted/5 transition-colors">
                                    <TableCell className="font-medium">{vehicle.model}</TableCell>
                                    <TableCell><Badge variant="outline" className="font-mono bg-gray-100">{vehicle.plate}</Badge></TableCell>
                                    <TableCell>{vehicle.rental_company}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="w-3 h-3" /> {vehicle.location}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Gauge className="w-3 h-3" /> {vehicle.mileage.toLocaleString()} km
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${vehicle.status === 'available' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                            vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                            } border-none shadow-none`}>
                                            {vehicle.status === 'available' ? 'Disponível' :
                                                vehicle.status === 'in_use' ? 'Em Uso' : 'Manutenção'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{vehicle.assigned_to_name || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingVehicle(vehicle)}>
                                                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-rose-gold" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog for Add/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingVehicle(null); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label>Modelo</label>
                            <Input value={newModel} onChange={e => setNewModel(e.target.value)} placeholder="Ex: Fiat Mobi Like" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label>Placa</label>
                                <Input value={newPlate} onChange={e => setNewPlate(e.target.value.toUpperCase())} placeholder="ABC-1234" />
                            </div>
                            <div className="grid gap-2">
                                <label>Kilometragem</label>
                                <Input type="number" value={newMileage} onChange={e => setNewMileage(e.target.value)} placeholder="0" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label>Locadora</label>
                            <Input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Ex: Localiza" />
                        </div>
                        <div className="grid gap-2">
                            <label>Localização Atual</label>
                            <Input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Endereço ou Cidade" />
                        </div>
                        <div className="grid gap-2">
                            <label>Status</label>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Disponível</SelectItem>
                                    <SelectItem value="in_use">Em Uso</SelectItem>
                                    <SelectItem value="maintenance">Manutenção</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="bg-rose-gold text-white">Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
