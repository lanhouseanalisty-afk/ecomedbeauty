import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface CampaignFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  campaign?: any;
}

export function CampaignFormModal({ open, onOpenChange, onSubmit, campaign }: CampaignFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    type: campaign?.type || "",
    objective: campaign?.objective || "",
    description: campaign?.description || "",
    budget: campaign?.budget || "",
    start_date: campaign?.start_date || "",
    end_date: campaign?.end_date || "",
    channels: campaign?.channels || [],
    utm_source: campaign?.utm_source || "",
    utm_medium: campaign?.utm_medium || "",
    utm_campaign: campaign?.utm_campaign || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast.error("Nome e tipo são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget.toString()) : null,
      });
      toast.success(campaign ? "Campanha atualizada!" : "Campanha criada!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar campanha");
    } finally {
      setLoading(false);
    }
  };

  const campaignTypes = [
    { value: "brand_awareness", label: "Awareness de Marca" },
    { value: "lead_generation", label: "Geração de Leads" },
    { value: "product_launch", label: "Lançamento de Produto" },
    { value: "promotion", label: "Promoção" },
    { value: "remarketing", label: "Remarketing" },
    { value: "seasonal", label: "Sazonal" },
    { value: "content", label: "Marketing de Conteúdo" },
  ];

  const channelOptions = [
    { value: "google_ads", label: "Google Ads" },
    { value: "meta_ads", label: "Meta Ads (Facebook/Instagram)" },
    { value: "email", label: "Email Marketing" },
    { value: "sms", label: "SMS" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "youtube", label: "YouTube" },
    { value: "tiktok", label: "TikTok" },
  ];

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, channels: [...formData.channels, channel] });
    } else {
      setFormData({ ...formData, channels: formData.channels.filter((c: string) => c !== channel) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
          <DialogDescription>
            {campaign ? "Atualize os dados da campanha" : "Configure uma nova campanha de marketing"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Black Friday 2024"
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
                    {campaignTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo</Label>
              <Input
                id="objective"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Ex: Aumentar vendas em 30%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes da campanha..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento (R$)</Label>
                <CurrencyInput
                  id="budget"
                  value={formData.budget}
                  onValueChange={(val) => setFormData({ ...formData, budget: val || 0 })}
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
              <Label>Canais</Label>
              <div className="grid grid-cols-2 gap-2">
                {channelOptions.map((channel) => (
                  <div key={channel.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel.value}
                      checked={formData.channels.includes(channel.value)}
                      onCheckedChange={(checked) => handleChannelChange(channel.value, checked as boolean)}
                    />
                    <Label htmlFor={channel.value} className="text-sm font-normal cursor-pointer">
                      {channel.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">UTM Parameters</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="utm_source" className="text-xs text-muted-foreground">Source</Label>
                  <Input
                    id="utm_source"
                    value={formData.utm_source}
                    onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
                    placeholder="google"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="utm_medium" className="text-xs text-muted-foreground">Medium</Label>
                  <Input
                    id="utm_medium"
                    value={formData.utm_medium}
                    onChange={(e) => setFormData({ ...formData, utm_medium: e.target.value })}
                    placeholder="cpc"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="utm_campaign" className="text-xs text-muted-foreground">Campaign</Label>
                  <Input
                    id="utm_campaign"
                    value={formData.utm_campaign}
                    onChange={(e) => setFormData({ ...formData, utm_campaign: e.target.value })}
                    placeholder="black_friday_2024"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : campaign ? "Atualizar" : "Criar Campanha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
