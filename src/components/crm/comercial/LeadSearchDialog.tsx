import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Instagram,
  Linkedin,
  Search,
  Phone,
  Globe,
  Star,
  Building,
  User,
  Plus,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportLeads: (leads: any[]) => void;
}

interface SearchResult {
  id: string;
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  rating?: number;
  username?: string;
  headline?: string;
  source: string;
  selected?: boolean;
}

export function LeadSearchDialog({ open, onOpenChange, onImportLeads }: LeadSearchDialogProps) {
  const [activeTab, setActiveTab] = useState("google-maps");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Form states
  const [gmQuery, setGmQuery] = useState("");
  const [gmLocation, setGmLocation] = useState("");
  const [igHashtag, setIgHashtag] = useState("");
  const [igUsername, setIgUsername] = useState("");
  const [liKeywords, setLiKeywords] = useState("");
  const [liCompany, setLiCompany] = useState("");
  const [liLocation, setLiLocation] = useState("");
  const [liTitle, setLiTitle] = useState("");

  const searchGoogleMaps = async () => {
    if (!gmQuery && !gmLocation) {
      toast.error("Preencha pelo menos um campo de busca");
      return;
    }

    try {
      setIsSearching(true);
      setResults([]); // Clear previous results immediately
      setSelectedLeads(new Set());

      // Artificial delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.functions.invoke("search-leads-google-maps", {
        body: { query: gmQuery, location: gmLocation },
      });

      if (error || (data && data.error)) {
        console.error("FULL API ERROR:", error || data?.error);
        console.warn("API error or not configured, using mock data");
        const mockResults: SearchResult[] = [
          {
            id: "gm-1",
            name: "Clínica Estética Bella Vita",
            company: "Clínica Estética Bella Vita",
            phone: "(11) 98765-4321",
            website: "www.bellavita.com.br",
            address: "Av. Paulista, 1000 - São Paulo, SP",
            rating: 4.8,
            source: "google_maps",
          },
          {
            id: "gm-2",
            name: "Espaço de Beleza Premium",
            company: "Espaço de Beleza Premium",
            phone: "(11) 97654-3210",
            website: "www.espacopremium.com.br",
            address: "Rua Augusta, 500 - São Paulo, SP",
            rating: 4.5,
            source: "google_maps",
          },
          {
            id: "gm-3",
            name: "Centro de Estética Avançada",
            company: "Centro de Estética Avançada",
            phone: "(11) 96543-2109",
            address: "Av. Faria Lima, 2000 - São Paulo, SP",
            rating: 4.9,
            source: "google_maps",
          },
        ];
        setResults(mockResults);
        toast.info("Dados de demonstração carregados");
      } else {
        const formattedResults: SearchResult[] = data.leads.map((lead: any, index: number) => ({
          id: `gm-${index}-${lead.place_id}`,
          name: lead.name,
          company: lead.name,
          phone: lead.phone,
          website: lead.website,
          address: lead.address,
          rating: lead.rating,
          source: "google_maps",
        }));
        setResults(formattedResults);
        toast.success(`${formattedResults.length} leads encontrados`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar leads");
    } finally {
      setIsSearching(false);
    }
  };

  const searchInstagram = async () => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResults([
      {
        id: "ig-1",
        name: "@clinicaestetica_sp",
        username: "clinicaestetica_sp",
        website: "linktr.ee/clinicaestetica",
        source: "instagram",
      }
    ]);
    setIsSearching(false);
  };

  const searchLinkedIn = async () => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResults([
      {
        id: "li-1",
        name: "Maria Silva",
        company: "Clínica Estética Premium",
        headline: "Diretora Comercial",
        source: "linkedin",
      }
    ]);
    setIsSearching(false);
  };

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedLeads(newSelected);
  };

  const selectAll = () => {
    if (selectedLeads.size === results.length) setSelectedLeads(new Set());
    else setSelectedLeads(new Set(results.map(r => r.id)));
  };

  const handleImport = () => {
    const leadsToImport = results
      .filter(r => selectedLeads.has(r.id))
      .map(r => ({
        first_name: r.name?.split(" ")[0] || "Lead",
        last_name: r.name?.split(" ").slice(1).join(" ") || "",
        company: r.company || r.name,
        phone: r.phone,
        source: r.source,
        notes: `Importado de ${r.source}`
      }));

    onImportLeads(leadsToImport);
    onOpenChange(false);
    setResults([]);
    setSelectedLeads(new Set());
    toast.success("Leads importados!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Leads Externos
          </DialogTitle>
          <DialogDescription>
            Busque leads no Google Maps, Instagram ou LinkedIn
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google-maps" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Google Maps
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google-maps" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria / Palavra-chave</Label>
                <Input
                  placeholder="Ex: clínicas estéticas"
                  value={gmQuery}
                  onChange={(e) => setGmQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input
                  placeholder="Ex: São Paulo, SP"
                  value={gmLocation}
                  onChange={(e) => setGmLocation(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={searchGoogleMaps} disabled={isSearching} className="w-full">
              {isSearching ? "Buscando..." : "Buscar no Google Maps"}
            </Button>
          </TabsContent>

          <TabsContent value="instagram" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hashtag</Label>
                <Input
                  value={igHashtag}
                  onChange={(e) => setIgHashtag(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input
                  value={igUsername}
                  onChange={(e) => setIgUsername(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={searchInstagram} disabled={isSearching} className="w-full">
              {isSearching ? "Buscando..." : "Buscar no Instagram"}
            </Button>
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Palavras-chave</Label>
                <Input
                  value={liKeywords}
                  onChange={(e) => setLiKeywords(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={liCompany}
                  onChange={(e) => setLiCompany(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={searchLinkedIn} disabled={isSearching} className="w-full">
              {isSearching ? "Buscando..." : "Buscar no LinkedIn"}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Results Area */}
        {results.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Resultados: {results.length}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedLeads.size === results.length ? "Desmarcar Todos" : "Selecionar Todos"}
                </Button>
                <Button size="sm" onClick={handleImport} disabled={selectedLeads.size === 0}>
                  Importar ({selectedLeads.size})
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`flex items-start gap-4 p-3 mb-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${selectedLeads.has(result.id) ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => toggleSelectLead(result.id)}
                >
                  <Checkbox
                    checked={selectedLeads.has(result.id)}
                    onCheckedChange={() => toggleSelectLead(result.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm md:text-base">{result.name}</p>
                      {result.rating && (
                        <Badge variant="secondary" className="text-[10px] flex gap-1 items-center bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
                          {result.rating} <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        </Badge>
                      )}
                    </div>

                    {result.company && result.company !== result.name && (
                      <p className="text-xs text-muted-foreground font-medium">{result.company}</p>
                    )}

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {result.address || "Endereço não disponível"}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-2">
                      {result.phone && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Phone className="h-3 w-3" />
                          {result.phone}
                        </div>
                      )}

                      {result.website && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Globe className="h-3 w-3" />
                          <a href={result.website} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
