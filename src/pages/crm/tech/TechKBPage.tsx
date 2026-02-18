import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Search,
    BookOpen,
    Monitor,
    Mail,
    Users,
    Database,
    FileText,
    Wrench,
    ThumbsUp,
    ThumbsDown,
    Cloud
} from "lucide-react";
import { toast } from "sonner";

interface KBArticle {
    id: string;
    category: string;
    title: string;
    content: React.ReactNode;
    tags: string[];
}

const KB_DATA: KBArticle[] = [
    // --- MICROSOFT OFFICE ---
    {
        id: "office-1",
        category: "office",
        title: "Excel: Travamento e Lentidão",
        tags: ["excel", "lento", "travando", "office"],
        content: (
            <div className="space-y-4">
                <p>Se o Excel está travando ou lento, tente as seguintes etapas:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Desativar Aceleração Gráfica:</strong> Vá em Arquivo &gt; Opções &gt; Avançado &gt; Exibir e marque "Desabilitar aceleração gráfica de hardware".</li>
                    <li><strong>Verificar Suplementos:</strong> Vá em Arquivo &gt; Opções &gt; Suplementos. Em "Gerenciar", selecione "Suplementos COM" e clique em "Ir". Desmarque suplementos suspeitos.</li>
                    <li><strong>Limpar Arquivos Temporários:</strong> Pressione <code>Win + R</code>, digite <code>%temp%</code> e delete o conteúdo da pasta.</li>
                    <li><strong>Atualizar Office:</strong> Vá em Arquivo &gt; Conta &gt; Opções de Atualização &gt; Atualizar Agora.</li>
                </ol>
            </div>
        )
    },
    {
        id: "office-2",
        category: "office",
        title: "Word: Recuperar documento não salvo",
        tags: ["word", "recuperar", "arquivo", "nao salvo"],
        content: (
            <div className="space-y-4">
                <p>Para recuperar um arquivo fechado sem salvar:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Abra o Word e vá em <strong>Arquivo &gt; Abrir</strong>.</li>
                    <li>No rodapé, clique em <strong>Recuperar Documentos Não Salvos</strong>.</li>
                    <li>Procure pelo arquivo .asd na pasta que abrir e clique em Abrir.</li>
                </ol>
                <div className="p-3 bg-muted rounded-md text-sm">
                    <strong>Dica:</strong> Configure o AutoSalvar para cada 5 minutos em Arquivo &gt; Opções &gt; Salvar.
                </div>
            </div>
        )
    },
    {
        id: "office-3",
        category: "office",
        title: "Outlook: Configurar Assinatura",
        tags: ["outlook", "assinatura", "email"],
        content: (
            <div className="space-y-4">
                <p>Padronize sua assinatura de e-mail:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>No Outlook, clique em <strong>Novo Email</strong>.</li>
                    <li>No menu superior, vá em <strong>Assinatura &gt; Assinaturas</strong>.</li>
                    <li>Clique em <strong>Novo</strong>, dê um nome e cole o modelo padrão da empresa.</li>
                    <li>Em "Escolher assinatura padrão", selecione a nova assinatura para "Novas mensagens" e "Respostas/Encaminhamentos".</li>
                </ol>
            </div>
        )
    },

    // --- TEAMS ---
    {
        id: "teams-1",
        category: "teams",
        title: "Teams: Configuração de Áudio e Vídeo",
        tags: ["teams", "audio", "video", "camera", "microfone"],
        content: (
            <div className="space-y-4">
                <p>Se ninguém te ouve ou te vê:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Antes de entrar na reunião, clique na engrenagem (Configurações do dispositivo).</li>
                    <li>Verifique se o <strong>Microfone</strong> correto está selecionado (ex: Headset vs Microfone do Notebook).</li>
                    <li>Faça uma <strong>Chamada de Teste</strong> nas configurações do Teams para validar seu áudio.</li>
                    <li>Verifique se o botão de "Mudo" físico do seu headset não está ativado.</li>
                </ul>
            </div>
        )
    },
    {
        id: "teams-2",
        category: "teams",
        title: "Teams: Criar uma Equipe",
        tags: ["teams", "equipe", "criar"],
        content: (
            <div className="space-y-4">
                <p>Para criar um novo espaço de colaboração:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Na aba "Equipes", clique em <strong>Entrar ou criar uma equipe</strong>.</li>
                    <li>Selecione <strong>Criar equipe</strong>.</li>
                    <li>Escolha "Do zero" ou use um modelo.</li>
                    <li>Defina como <strong>Privada</strong> (apenas convidados) ou <strong>Pública</strong> (qualquer um da empresa).</li>
                    <li>Adicione os membros pelo nome ou e-mail.</li>
                </ol>
            </div>
        )
    },

    // --- E-MAIL ---
    {
        id: "email-1",
        category: "email",
        title: "E-mail: Identificando Phishing e Spam",
        tags: ["email", "seguranca", "spam", "phishing", "virus"],
        content: (
            <div className="space-y-4">
                <p>Proteja-se contra e-mails maliciosos:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Remetente suspeito:</strong> Verifique se o e-mail (ex: suporte@micr0soft.com) tem erros de digitação.</li>
                    <li><strong>Senso de urgência:</strong> Desconfie de "Sua conta será bloqueada AGORA" ou "Pague IMEDIATAMENTE".</li>
                    <li><strong>Links estranhos:</strong> Passe o mouse sobre o link sem clicar para ver o endereço real.</li>
                    <li><strong>Anexos:</strong> Nunca abra .exe, .scr ou .bat recebidos por e-mail.</li>
                </ul>
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-bold">
                    Na dúvida, NÃO CLIQUE. Encaminhe para o time de Tech analisar.
                </div>
            </div>
        )
    },
    {
        id: "email-2",
        category: "email",
        title: "E-mail: Arquivamento e Cota Cheia",
        tags: ["email", "espaço", "cota", "limpeza"],
        content: (
            <div className="space-y-4">
                <p>Se sua caixa de correio está cheia:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Vá em Arquivo &gt; Ferramentas &gt; <strong>Limpar Itens Antigos</strong> (AutoArquivar).</li>
                    <li>Organize e-mails antigos em Arquivos de Dados do Outlook (.pst) locais.</li>
                    <li>Esvazie a lixeira e a pasta de Spam regularmente.</li>
                    <li>Ordene por tamanho e exclua e-mails com anexos pesados que já foram salvos na rede.</li>
                </ol>
            </div>
        )
    },

    // --- MANUTENCAO ---
    {
        id: "hw-1",
        category: "hardware",
        title: "PC Lento: Procedimentos Básicos",
        tags: ["computador", "lento", "travando", "limpeza"],
        content: (
            <div className="space-y-4">
                <p>Melhore a performance do seu computador:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Reinicie:</strong> Parece óbvio, mas reiniciar limpa a memória RAM e encerra processos travados.</li>
                    <li><strong>Atualizações:</strong> Verifique o Windows Update.</li>
                    <li><strong>Programas em 2º plano:</strong> Feche abas excessivas do Chrome e softwares não utilizados.</li>
                    <li><strong>Espaço em Disco:</strong> Mantenha pelo menos 10% do disco livre (C:).</li>
                </ul>
            </div>
        )
    },
    {
        id: "hw-2",
        category: "hardware",
        title: "Monitor não liga ou sem sinal",
        tags: ["monitor", "tela", "preta", "cabo"],
        content: (
            <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                    <li>Verifique se o cabo de energia está bem conectado no monitor e na tomada.</li>
                    <li>Verifique o cabo HDMI/DisplayPort. Tente desconectar e conectar novamente.</li>
                    <li>Teste com outro cabo se possível.</li>
                    <li>No notebook, pressione <code>Win + P</code> e selecione "Estender" ou "Duplicar".</li>
                </ol>
            </div>
        )
    },

    // --- SALESFORCE ---
    {
        id: "sf-1",
        category: "salesforce",
        title: "Salesforce: Reset de Senha",
        tags: ["salesforce", "senha", "login", "acesso"],
        content: (
            <div className="space-y-4">
                <p>Se você esqueceu sua senha do Salesforce:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Na tela de login, clique em <strong>Esqueceu sua senha?</strong>.</li>
                    <li>Digite seu usuário (geralmente seu e-mail corporativo).</li>
                    <li>Verifique seu e-mail para o link de redefinição.</li>
                    <li>A nova senha deve ter 8 caracteres, letras e números.</li>
                </ol>
                <p className="text-sm text-muted-foreground">Se sua conta estiver bloqueada por muitas tentativas, abra um chamado para o Admin desbloquear.</p>
            </div>
        )
    },
    {
        id: "sf-2",
        category: "salesforce",
        title: "Salesforce: Criar um Lead",
        tags: ["salesforce", "lead", "comercial", "novo"],
        content: (
            <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                    <li>Acesse a aba <strong>Leads</strong>.</li>
                    <li>Clique em <strong>Novo</strong>.</li>
                    <li>Preencha os campos obrigatórios (Sobrenome, Empresa, Status).</li>
                    <li>Preencha a Origem do Lead corretamente para relatórios de Marketing.</li>
                    <li>Clique em <strong>Salvar</strong>.</li>
                </ol>
            </div>
        )
    },

    // --- SAP B1 ---
    {
        id: "sap-1",
        category: "sap",
        title: "SAP B1: Erro de Licença",
        tags: ["sap", "licenca", "erro", "login"],
        content: (
            <div className="space-y-4">
                <p>Mensagem "Não há licença disponível":</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Verifique se você já está logado em outra máquina. O SAP B1 permite apenas 1 sessão por usuário.</li>
                    <li>Peça ao Admin para verificar a alocação de licenças no License Manager.</li>
                    <li>Tente aguardar 5 minutos e logar novamente se a sessão anterior travou.</li>
                </ul>
            </div>
        )
    },
    {
        id: "sap-2",
        category: "sap",
        title: "SAP B1: Impressão de Nota Fiscal",
        tags: ["sap", "nfe", "impressao", "nota"],
        content: (
            <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                    <li>Abra a Nota Fiscal de Saída.</li>
                    <li>Localize o registro desejado (setas de navegação).</li>
                    <li>Clique no ícone de Impressora na barra de ferramentas ou <code>Ctrl + P</code>.</li>
                    <li>Selecione o layout "DANFE Padrão".</li>
                    <li>Se der erro de layout, verifique se o Add-on TaxOne está iniciado.</li>
                </ol>
            </div>
        )
    },
];

const CATEGORIES = [
    { id: "all", name: "Todos", icon: BookOpen },
    { id: "office", name: "Office 365", icon: FileText },
    { id: "teams", name: "Teams", icon: Users },
    { id: "email", name: "E-mail", icon: Mail },
    { id: "hardware", name: "Manutenção", icon: Wrench },
    { id: "salesforce", name: "Salesforce", icon: Cloud },
    { id: "sap", name: "SAP B1", icon: Database },
];

export default function TechKBPage() {
    const [searchTerm, setSearchTerm] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('search') || "";
    });
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredArticles = KB_DATA.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === "all" || article.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    Base de Conhecimento Tech
                </h1>
                <p className="text-muted-foreground">
                    Encontre soluções rápidas para os problemas mais comuns do dia a dia.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/30 p-4 rounded-lg border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por erro, software ou termo..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(cat.id)}
                            className="flex items-center gap-2 whitespace-nowrap"
                        >
                            <cat.icon className="h-4 w-4" />
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="grid gap-4">
                {filteredArticles.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {filteredArticles.map(article => (
                            <AccordionItem key={article.id} value={article.id} className="border rounded-lg bg-card px-4">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center text-left gap-3">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            {CATEGORIES.find(c => c.id === article.category)?.icon && (
                                                (() => {
                                                    const Icon = CATEGORIES.find(c => c.id === article.category)!.icon;
                                                    return <Icon className="h-5 w-5 text-primary" />;
                                                })()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{article.title}</h3>
                                            <div className="flex gap-2 mt-1">
                                                {article.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-4 text-base space-y-4 border-t">
                                    {article.content}

                                    <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-dashed">
                                        <span className="text-sm text-muted-foreground">Isso foi útil?</span>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => toast.success("Obrigado pelo feedback!")}>
                                                <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
                                                Sim
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => toast.info("Vamos melhorar este artigo.")}>
                                                <ThumbsDown className="h-4 w-4 text-red-600 mr-2" />
                                                Não
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">Nenhum resultado encontrado</h3>
                        <p className="text-muted-foreground">Tente buscar por outros termos ou navegue pelas categorias.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
