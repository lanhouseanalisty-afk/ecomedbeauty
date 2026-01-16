import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ShipmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  carriers: { id: string; name: string; code: string }[];
  warehouses: { id: string; name: string }[];
  shipment?: any;
}

export function ShipmentFormModal({ open, onOpenChange, onSubmit, carriers, warehouses, shipment }: ShipmentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    order_id: shipment?.order_id || "",
    carrier_id: shipment?.carrier_id || "",
    warehouse_id: shipment?.warehouse_id || "",
    tracking_code: shipment?.tracking_code || "",
    shipping_method: shipment?.shipping_method || "",
    weight_kg: shipment?.weight_kg || "",
    packages_count: shipment?.packages_count || 1,
    shipping_cost: shipment?.shipping_cost || "",
    estimated_delivery: shipment?.estimated_delivery || "",
    notes: shipment?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.order_id) {
      toast.error("ID do pedido é obrigatório");
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg.toString()) : null,
        packages_count: parseInt(formData.packages_count.toString()) || 1,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost.toString()) : null,
      });
      toast.success(shipment ? "Envio atualizado!" : "Envio criado!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar envio");
    } finally {
      setLoading(false);
    }
  };

  const shippingMethods = [
    { value: "standard", label: "Padrão" },
    { value: "express", label: "Expresso" },
    { value: "same_day", label: "Same Day" },
    { value: "pickup", label: "Retirada" },
    { value: "international", label: "Internacional" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{shipment ? "Editar Envio" : "Novo Envio"}</DialogTitle>
          <DialogDescription>
            {shipment ? "Atualize os dados do envio" : "Cadastre um novo envio"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_id">ID do Pedido *</Label>
                <Input 
                  id="order_id" 
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  placeholder="UUID do pedido"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking_code">Código de Rastreio</Label>
                <Input 
                  id="tracking_code" 
                  value={formData.tracking_code}
                  onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
                  placeholder="BR123456789"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carrier">Transportadora</Label>
                <Select 
                  value={formData.carrier_id} 
                  onValueChange={(value) => setFormData({ ...formData, carrier_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.name} ({carrier.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Armazém</Label>
                <Select 
                  value={formData.warehouse_id} 
                  onValueChange={(value) => setFormData({ ...formData, warehouse_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping_method">Método de Envio</Label>
                <Select 
                  value={formData.shipping_method} 
                  onValueChange={(value) => setFormData({ ...formData, shipping_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Peso (kg)</Label>
                <Input 
                  id="weight_kg" 
                  type="number"
                  step="0.01"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packages_count">Volumes</Label>
                <Input 
                  id="packages_count" 
                  type="number"
                  value={formData.packages_count}
                  onChange={(e) => setFormData({ ...formData, packages_count: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping_cost">Custo do Frete (R$)</Label>
                <Input 
                  id="shipping_cost" 
                  type="number"
                  step="0.01"
                  value={formData.shipping_cost}
                  onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_delivery">Previsão de Entrega</Label>
                <Input 
                  id="estimated_delivery" 
                  type="date"
                  value={formData.estimated_delivery}
                  onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Instruções especiais de entrega..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : shipment ? "Atualizar" : "Criar Envio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
