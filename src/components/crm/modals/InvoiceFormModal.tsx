import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  type: "receivable" | "payable";
  invoice?: any;
}

export function InvoiceFormModal({ open, onOpenChange, onSubmit, type, invoice }: InvoiceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: invoice?.invoice_number || `INV-${Date.now().toString().slice(-8)}`,
    type: type,
    subtotal: invoice?.subtotal || "",
    tax_amount: invoice?.tax_amount || 0,
    discount_amount: invoice?.discount_amount || 0,
    total: invoice?.total || "",
    due_date: invoice?.due_date || "",
    notes: invoice?.notes || "",
    status: invoice?.status || "pending",
  });

  const calculateTotal = () => {
    const subtotal = parseFloat(formData.subtotal.toString()) || 0;
    const tax = parseFloat(formData.tax_amount.toString()) || 0;
    const discount = parseFloat(formData.discount_amount.toString()) || 0;
    return subtotal + tax - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subtotal || !formData.due_date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    
    setLoading(true);
    try {
      const total = calculateTotal();
      await onSubmit({
        ...formData,
        subtotal: parseFloat(formData.subtotal.toString()),
        tax_amount: parseFloat(formData.tax_amount.toString()) || 0,
        discount_amount: parseFloat(formData.discount_amount.toString()) || 0,
        total,
      });
      toast.success(invoice ? "Fatura atualizada!" : "Fatura criada!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar fatura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {invoice ? "Editar" : "Nova"} {type === "receivable" ? "Receita" : "Despesa"}
          </DialogTitle>
          <DialogDescription>
            {type === "receivable" 
              ? "Cadastre uma nova conta a receber" 
              : "Cadastre uma nova conta a pagar"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Número da Fatura</Label>
                <Input 
                  id="invoice_number" 
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="INV-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Vencimento *</Label>
                <Input 
                  id="due_date" 
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subtotal">Valor *</Label>
                <Input 
                  id="subtotal" 
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_amount">Impostos</Label>
                <Input 
                  id="tax_amount" 
                  type="number"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_amount">Desconto</Label>
                <Input 
                  id="discount_amount" 
                  type="number"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold">
                  R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionais..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : invoice ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
