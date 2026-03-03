import { useState } from "react";
import {
  Building2,
  Users,
  Shield,
  Settings,
  Activity,
  MoreHorizontal,
  Search,
  Plus,
  Beaker,
  FlaskConical,
  FileText,
  Loader2,
  UserPlus,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScientific } from "@/hooks/useScientific";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CientificaDashboard() {
  const { presentations, isLoading } = useScientific();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPresentations = presentations?.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.speaker?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: "Total de Arquivos",
      value: presentations?.length || "0",
      icon: FileText
    },
    {
      title: "Categorias Ativas",
      value: presentations ? new Set(presentations.map(p => p.category)).size : "0",
      icon: FlaskConical
    },
    {
      title: "Palestrantes",
      value: presentations ? new Set(presentations.filter(p => p.speaker).map(p => p.speaker)).size : "0",
      icon: Users
    },
    {
      title: "Última Atualização",
      value: presentations?.[0] ? format(new Date(presentations[0].created_at), "dd/MM", { locale: ptBR }) : "-",
      icon: Activity
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Científica</h1>
          <p className="text-muted-foreground">Pesquisa, Desenvolvimento e Inovação em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = "/crm/cientifica/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700">
            <UserPlus className="h-4 w-4" />
            Admissão & Demissão
          </Button>
          <Button onClick={() => navigate("/crm/cientifica/apresentacoes")}>
            <Plus className="mr-2 h-4 w-4" />
            Gerenciar Biblioteca
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="presentations">
        <TabsList>
          <TabsTrigger value="presentations">Apresentações & Estudos</TabsTrigger>
          <TabsTrigger value="research">Pesquisa</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="presentations" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Biblioteca Científica</CardTitle>
                  <CardDescription>Materiais e estudos clínicos cadastrados</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar estudo ou categoria..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Palestrante / Autor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPresentations?.map((pres) => (
                      <TableRow key={pres.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate("/crm/cientifica/apresentacoes")}>
                        <TableCell className="font-medium">{pres.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{pres.category}</Badge>
                        </TableCell>
                        <TableCell>{pres.speaker || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(pres.presentation_date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPresentations?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum material encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden border-t-4 border-t-orange-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-2 relative">
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                    Gestora Científica
                  </Badge>
                </div>
                <div className="flex justify-center mb-4 pt-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarFallback className="text-2xl font-bold bg-orange-500 text-white">
                      LM
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl font-bold">Luciana Maluf</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" /> São Paulo - SP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground italic px-4">
                  "Lidera a estratégia de pesquisa, desenvolvimento e inovação científica da MedBeauty, garantindo o respaldo técnico e a excelência clínica do nosso portfólio."
                </p>

                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge variant="outline" className="text-xs">P&D</Badge>
                  <Badge variant="outline" className="text-xs">Inovação</Badge>
                  <Badge variant="outline" className="text-xs">Respaldo Clínico</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-3 bg-muted/30 pt-4 pb-6">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = 'mailto:luciana.maluf@medbeauty.com.br'}>
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Contato
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="research" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pesquisa & Desenvolvimento</CardTitle>
              <CardDescription>Módulo de gestão de projetos de pesquisa em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
              Nenhuma pesquisa ativa no momento.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
