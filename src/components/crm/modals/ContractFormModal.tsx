import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ContractFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  contract?: any;
}

export function ContractFormModal({ open, onOpenChange, onSubmit, contract }: ContractFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: contract?.title || "",
    type: contract?.type || "",
    party_name: contract?.party_name || "",
    party_document: contract?.party_document || "",
    value: contract?.value || "",
    start_date: contract?.start_date || "",
    end_date: contract?.end_date || "",
    payment_terms: contract?.payment_terms || "",
    terms_summary: contract?.terms_summary || "",
    auto_renew: contract?.auto_renew || false,
    renewal_notice_days: contract?.renewal_notice_days || 30,
    contract_number: contract?.contract_number || `CTR-${Date.now().toString().slice(-8)}`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.party_name) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        value: formData.value ? parseFloat(formData.value.toString()) : null,
        renewal_notice_days: parseInt(formData.renewal_notice_days.toString()) || 30,
      });
      toast.success(contract ? "Contrato atualizado!" : "Contrato criado!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar contrato");
    } finally {
      setLoading(false);
    }
  };

  const contractTypes = [
    { value: "supplier", label: "Fornecedor" },
    { value: "client", label: "Cliente" },
    { value: "service", label: "Serviço" },
    { value: "lease", label: "Aluguel" },
    { value: "nda", label: "NDA / Confidencialidade" },
    { value: "partnership", label: "Parceria" },
    { value: "employment", label: "Trabalho" },
    { value: "other", label: "Outro" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{contract ? "Editar Contrato" : "Novo Contrato"}</DialogTitle>
          <DialogDescription>
            {contract ? "Atualize os dados do contrato" : "Cadastre um novo contrato"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do contrato"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="party_name">Parte Contratante *</Label>
                <Input
                  id="party_name"
                  value={formData.party_name}
                  onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                  placeholder="Nome da empresa/pessoa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="party_document">CNPJ/CPF</Label>
                <Input
                  id="party_document"
                  value={formData.party_document}
                  onChange={(e) => setFormData({ ...formData, party_document: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <CurrencyInput
                  id="value"
                  value={formData.value}
                  onValueChange={(val) => setFormData({ ...formData, value: val || 0 })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Condições de Pagamento</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="Ex: 30 dias após emissão da NF"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_summary">Resumo dos Termos</Label>
              <Textarea
                id="terms_summary"
                value={formData.terms_summary}
                onChange={(e) => setFormData({ ...formData, terms_summary: e.target.value })}
                placeholder="Principais cláusulas e condições..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="auto_renew" className="font-medium">Renovação Automática</Label>
                <p className="text-sm text-muted-foreground">O contrato será renovado automaticamente</p>
              </div>
              <Switch
                id="auto_renew"
                checked={formData.auto_renew}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_renew: checked })}
              />
            </div>
            {formData.auto_renew && (
              <div className="space-y-2">
                <Label htmlFor="renewal_notice_days">Dias de Aviso para Renovação</Label>
                <Input
                  id="renewal_notice_days"
                  type="number"
                  value={formData.renewal_notice_days}
                  onChange={(e) => setFormData({ ...formData, renewal_notice_days: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : contract ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
