
import { useState } from "react";
import {
    FileText,
    Search,
    Plus,
    Filter,
    Download,
    Eye,
    Calendar,
    User,
    Tag,
    Loader2,
    X,
    FileUp,
    Trash2,
    Video,
    FileBadge
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useScientific, ScientificPresentation } from "@/hooks/useScientific";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORIES = ["Geral", "Estudo Clínico", "Lançamento", "Treinamento", "Congresso", "Protocolo"];

export default function ScientificPresentationsPage() {
    const { user, roles } = useAuth();
    const { presentations, isLoading, createPresentation, uploadFile, deletePresentation } = useScientific();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [viewerItem, setViewerItem] = useState<ScientificPresentation | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Geral",
        speaker: "",
        presentation_date: format(new Date(), "yyyy-MM-dd")
    });

    const canManage = roles.some(r => ["admin", "scientific_manager", "tech"].includes(r));

    const filteredPresentations = presentations?.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.speaker?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getFileIcon = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext || '')) return Video;
        if (['ppt', 'pptx'].includes(ext || '')) return FileBadge;
        return FileText;
    };

    const getFileTypeLabel = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext || '')) return "Vídeo";
        if (['ppt', 'pptx'].includes(ext || '')) return "PowerPoint";
        if (ext === 'pdf') return "PDF";
        return "Arquivo";
    };

    const isVideoFile = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext || '');
    };

    const isOfficeFile = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        return ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(ext || '');
    };

    const handleUpload = async () => {
        if (!selectedFile || !formData.title) return;

        try {
            const fileUrl = await uploadFile(selectedFile);
            await createPresentation.mutateAsync({
                ...formData,
                file_url: fileUrl,
                created_by: user?.id
            });
            setIsUploadOpen(false);
            setSelectedFile(null);
            setFormData({
                title: "",
                description: "",
                category: "Geral",
                speaker: "",
                presentation_date: format(new Date(), "yyyy-MM-dd")
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Apresentações Científicas</h1>
                    <p className="text-muted-foreground">Repositório central de estudos, vídeos, PowerPoint e protocolos.</p>
                </div>

                {canManage && (
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Apresentação
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Nova Apresentação</DialogTitle>
                                <DialogDescription>
                                    Anexe o arquivo (PDF, Vídeo ou PowerPoint) e preencha os detalhes.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Novo Protocolo de Rejuvenescimento"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Categoria</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={v => setFormData({ ...formData, category: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">Data</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.presentation_date}
                                            onChange={e => setFormData({ ...formData, presentation_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="speaker">Palestrante</Label>
                                    <Input
                                        id="speaker"
                                        value={formData.speaker}
                                        onChange={e => setFormData({ ...formData, speaker: e.target.value })}
                                        placeholder="Nome do palestrante"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Descrição</Label>
                                    <Textarea
                                        id="desc"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Breve resumo..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Arquivo (PDF, Vídeo ou PPTX)</Label>
                                    <div className="relative border-2 border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                                        <Input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                            accept=".pdf,.ppt,.pptx,.mp4,.webm,.mov"
                                        />
                                        <FileUp className="h-8 w-8 text-muted-foreground" />
                                        {selectedFile ? (
                                            <span className="text-sm font-medium text-primary">{selectedFile.name}</span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Clique ou arraste o arquivo aqui</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancelar</Button>
                                <Button onClick={handleUpload} disabled={!selectedFile || !formData.title || createPresentation.isPending}>
                                    {createPresentation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Fazer Upload
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por título ou palestrante..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPresentations?.map((p) => {
                    const Icon = getFileIcon(p.file_url);
                    return (
                        <Card key={p.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-sidebar-border/50">
                            <div className="aspect-[16/9] bg-muted flex items-center justify-center relative group-hover:bg-muted/30 transition-colors">
                                <Icon className="h-12 w-12 text-muted-foreground/50 group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                        {getFileTypeLabel(p.file_url)}
                                    </Badge>
                                </div>
                                <Badge className="absolute top-2 right-2" variant="secondary">
                                    {p.category}
                                </Badge>
                            </div>
                            <CardHeader className="p-4">
                                <CardTitle className="line-clamp-1">{p.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {p.description || "Sem descrição."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <User className="h-4 w-4" />
                                    {p.speaker || "Palestrante não informado"}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(p.presentation_date), "dd/MM/yyyy")}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 bg-muted/50 flex justify-between gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewerItem(p)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver
                                </Button>
                                <Button variant="ghost" size="sm" asChild title="Download">
                                    <a href={p.file_url} download target="_blank" rel="noreferrer">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                                {canManage && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => deletePresentation.mutate(p.id)}
                                        title="Excluir"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {filteredPresentations?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                    <p>Nenhuma apresentação encontrada.</p>
                </div>
            )}

            {/* Presentation Viewer Dialog */}
            <Dialog open={!!viewerItem} onOpenChange={() => setViewerItem(null)}>
                <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 overflow-hidden border-none bg-zinc-950 flex flex-col">
                    <div className="bg-background/80 backdrop-blur-sm border-b p-4 flex items-center justify-between z-50">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold line-clamp-1">{viewerItem?.title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {viewerItem?.speaker} • {viewerItem && format(new Date(viewerItem.presentation_date), "dd/MM/yyyy")}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setViewerItem(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                        {viewerItem && isVideoFile(viewerItem.file_url) ? (
                            <video
                                src={viewerItem.file_url}
                                controls
                                className="max-h-full max-w-full"
                                autoPlay
                            />
                        ) : viewerItem && isOfficeFile(viewerItem.file_url) ? (
                            <iframe
                                src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(viewerItem.file_url)}`}
                                className="w-full h-full border-none"
                                title="Office Viewer"
                            />
                        ) : viewerItem && (
                            <iframe
                                src={`${viewerItem.file_url}#toolbar=0&navpanes=0`}
                                className="w-full h-full border-none"
                                title="PDF Viewer"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
