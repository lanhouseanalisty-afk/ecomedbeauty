import { useState } from "react";
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
  Loader2,
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

  // Google Maps search state
  const [gmQuery, setGmQuery] = useState("");
  const [gmLocation, setGmLocation] = useState("");

  // Instagram search state
  const [igHashtag, setIgHashtag] = useState("");
  const [igUsername, setIgUsername] = useState("");

  // LinkedIn search state
  const [liKeywords, setLiKeywords] = useState("");
  const [liCompany, setLiCompany] = useState("");
  const [liLocation, setLiLocation] = useState("");
  const [liTitle, setLiTitle] = useState("");

  // Search function for Google Maps with real API
  const searchGoogleMaps = async () => {
    if (!gmQuery && !gmLocation) {
      toast.error("Preencha pelo menos um campo de busca");
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSelectedLeads(new Set());

    try {
      // Try to call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("search-leads-google-maps", {
        body: {
          query: gmQuery,
          location: gmLocation,
        },
      });

      if (error) {
        console.warn("API not configured, using mock data:", error);
        // Fallback to mock data if API is not configured
        await new Promise(resolve => setTimeout(resolve, 1500));

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
        toast.info(`${mockResults.length} leads encontrados (dados de demonstração)`);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Format real API results
      const formattedResults: SearchResult[] = data.leads.map((lead: any, index: number) => ({
        id: `gm-${index}-${lead.place_id || Date.now()}`,
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
    } catch (error: any) {
      console.error("Error searching Google Maps:", error);
      toast.error("Erro ao buscar leads. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  // Simulated search function for Instagram
  const searchInstagram = async () => {
    if (!igHashtag && !igUsername) {
      toast.error("Preencha pelo menos um campo de busca");
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSelectedLeads(new Set());

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResults: SearchResult[] = [
        {
          id: "ig-1",
          name: "@clinicaestetica_sp",
          username: "clinicaestetica_sp",
          website: "linktr.ee/clinicaestetica",
          source: "instagram",
        },
        {
          id: "ig-2",
          name: "@belezaesaude_oficial",
          username: "belezaesaude_oficial",
          source: "instagram",
        },
      ];

      setResults(mockResults);
      toast.success(`${mockResults.length} leads encontrados`);
    } catch (error: any) {
      console.error("Error searching Instagram:", error);
      toast.error("Erro ao buscar leads. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  // Simulated search function for LinkedIn
  const searchLinkedIn = async () => {
    if (!liKeywords && !liCompany && !liLocation && !liTitle) {
      toast.error("Preencha pelo menos um campo de busca");
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSelectedLeads(new Set());

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResults: SearchResult[] = [
        {
          id: "li-1",
          name: "Maria Silva",
          company: "Clínica Estética Premium",
          headline: "Diretora Comercial | Estética Avançada",
          source: "linkedin",
        },
        {
          id: "li-2",
          name: "João Santos",
          company: "Espaço Beleza & Saúde",
          headline: "Gerente de Vendas | Cosméticos Profissionais",
          source: "linkedin",
        },
      ];

      setResults(mockResults);
      toast.success(`${mockResults.length} leads encontrados`);
    } catch (error: any) {
      console.error("Error searching LinkedIn:", error);
      toast.error("Erro ao buscar leads. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const selectAll = () => {
    if (selectedLeads.size === results.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(results.map(r => r.id)));
    }
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
        notes: [
          r.address ? `Endereço: ${r.address}` : "",
          r.website ? `Website: ${r.website}` : "",
          r.rating ? `Avaliação: ${r.rating}/5` : "",
          r.headline ? `${r.headline}` : "",
          r.username ? `Instagram: @${r.username}` : "",
        ].filter(Boolean).join("\n"),
      }));

    onImportLeads(leadsToImport);
    onOpenChange(false);
    setResults([]);
    setSelectedLeads(new Set());
    toast.success(`${leadsToImport.length} leads importados com sucesso`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
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

          {/* Google Maps Tab */}
          <TabsContent value="google-maps" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gm-query">Categoria / Palavra-chave</Label>
                <Input
                  id="gm-query"
                  placeholder="Ex: clínicas estéticas, restaurantes..."
                  value={gmQuery}
                  onChange={(e) => setGmQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gm-location">Localização</Label>
                <Input
                  id="gm-location"
                  placeholder="Ex: São Paulo, SP"
                  value={gmLocation}
                  onChange={(e) => setGmLocation(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={searchGoogleMaps} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar no Google Maps
            </Button>
          </TabsContent>

          {/* Instagram Tab */}
          <TabsContent value="instagram" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ig-hashtag">Hashtag</Label>
                <Input
                  id="ig-hashtag"
                  placeholder="Ex: estetica, beleza..."
                  value={igHashtag}
                  onChange={(e) => setIgHashtag(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ig-username">Nome de Usuário</Label>
                <Input
                  id="ig-username"
                  placeholder="Ex: clinicaxyz"
                  value={igUsername}
                  onChange={(e) => setIgUsername(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={searchInstagram} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar no Instagram
            </Button>
          </TabsContent>

          {/* LinkedIn Tab */}
          <TabsContent value="linkedin" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="li-keywords">Palavras-chave</Label>
                <Input
                  id="li-keywords"
                  placeholder="Ex: dermatologista, médico..."
                  value={liKeywords}
                  onChange={(e) => setLiKeywords(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="li-company">Empresa</Label>
                <Input
                  id="li-company"
                  placeholder="Ex: Hospital Albert Einstein"
                  value={liCompany}
                  onChange={(e) => setLiCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="li-location">Localização</Label>
                <Input
                  id="li-location"
                  placeholder="Ex: São Paulo, Brasil"
                  value={liLocation}
                  onChange={(e) => setLiLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="li-title">Cargo</Label>
                <Input
                  id="li-title"
                  placeholder="Ex: Diretor, Gerente..."
                  value={liTitle}
                  onChange={(e) => setLiTitle(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={searchLinkedIn} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar no LinkedIn
            </Button>
          </TabsContent>
        </Tabs>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  Resultados ({results.length})
                </h3>
                <Badge variant="outline">
                  {selectedLeads.size} selecionado(s)
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedLeads.size === results.length ? "Desmarcar Todos" : "Selecionar Todos"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={selectedLeads.size === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Importar Selecionados
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px] rounded-md border">
              <div className="divide-y">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${selectedLeads.has(result.id) ? "bg-primary/5" : ""
                      }`}
                    onClick={() => toggleSelectLead(result.id)}
                  >
                    <Checkbox
                      checked={selectedLeads.has(result.id)}
                      onCheckedChange={() => toggleSelectLead(result.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{result.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {result.source === "google_maps" && <MapPin className="h-3 w-3 mr-1" />}
                          {result.source === "instagram" && <Instagram className="h-3 w-3 mr-1" />}
                          {result.source === "linkedin" && <Linkedin className="h-3 w-3 mr-1" />}
                          {result.source}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {result.company && result.company !== result.name && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {result.company}
                          </span>
                        )}
                        {result.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {result.phone}
                          </span>
                        )}
                        {result.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {result.website.replace(/^https?:\/\//, "").split("/")[0]}
                          </span>
                        )}
                        {result.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {result.rating}
                          </span>
                        )}
                        {result.username && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            @{result.username}
                          </span>
                        )}
                      </div>
                      {result.address && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {result.address}
                        </p>
                      )}
                      {result.headline && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {result.headline}
                        </p>
                      )}
                    </div>
                    {selectedLeads.has(result.id) && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Buscando leads...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
