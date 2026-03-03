import React, { useState, useEffect } from "react";
import {
    Plus,
    Loader2,
    AlertCircle,
    Megaphone,
    Sparkles,
    User,
    Mail,
    Phone,
    Building2
} from "lucide-react";
import { useTickets } from "@/hooks/useTech";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ComunicarTIPage() {
    const { tickets, isLoading, createTicket } = useTickets();

    const { user, departmentModule } = useAuth();

    const [pastedImage, setPastedImage] = useState<string | null>(null);

    const [newTicket, setNewTicket] = useState({
        title: "",
        description: "",
        priority: "medium",
        department: "",
        requester_name: "",
        requester_email: "",
        requester_phone: "",
        schedule: "",
    });

    // Populate user info on mount/user change
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            try {
                // 1. Try to fetch from employees table first (for Intranet users)
                const { data: empData, error: empError } = await supabase
                    .from("employees")
                    .select("full_name, phone, departments(name)")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (!empError && empData) {
                    setNewTicket(prev => ({
                        ...prev,
                        requester_name: empData.full_name || prev.requester_name,
                        requester_phone: empData.phone || prev.requester_phone,
                        department: (empData.departments as any)?.name || prev.department
                    }));
                } else {
                    // 2. Fallback to profiles table
                    const { data: profData, error: profError } = await supabase
                        .from("profiles")
                        .select("full_name, phone")
                        .eq("id", user.id)
                        .single();

                    if (!profError && profData) {
                        setNewTicket(prev => ({
                            ...prev,
                            requester_name: profData.full_name || prev.requester_name,
                            requester_phone: profData.phone || prev.requester_phone,
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching user data for ticket:", err);
            }
        };

        if (user) {
            setNewTicket(prev => ({
                ...prev,
                requester_email: user.email || "",
                department: departmentModule || ""
            }));
            fetchUserData();
        }
    }, [user, departmentModule]);

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            const res = event.target.result as string;
                            if (res.length > 2000000) {
                                toast.error("Imagem muito grande. Tente recortar ou reduzir.");
                                return;
                            }
                            setPastedImage(res);
                            toast.success("Imagem colada!");
                        }
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    };

    const handleCreateTicket = () => {
        if (!user) return;

        if (!newTicket.title || !newTicket.description) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        createTicket.mutate({
            title: newTicket.title,
            description: newTicket.description,
            priority: newTicket.priority,
            requester_id: user.id,
            status: 'open',
            metadata: {
                department: newTicket.department,
                requester_name: newTicket.requester_name,
                requester_email: newTicket.requester_email,
                requester_phone: newTicket.requester_phone,
                preferred_schedule: newTicket.schedule,
                screenshot: pastedImage
            },
        } as any, {
            onSuccess: () => {
                setNewTicket({
                    title: "",
                    description: "",
                    priority: "medium",
                    department: departmentModule || "",
                    requester_name: user.user_metadata?.full_name || "",
                    requester_email: user.email || "",
                    requester_phone: user.user_metadata?.phone || "",
                    schedule: ""
                });
                setPastedImage(null);
                toast.success("Chamado aberto com sucesso! A equipe de TI foi notificada.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 container mx-auto p-6 max-w-4xl">
            <div className="flex items-center gap-3 border-b pb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                    <Megaphone className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-800">Abrir Chamado Técnico</h1>
                    <p className="text-muted-foreground">
                        Descreva o problema detalhadamente para agilizar o atendimento da equipe de TI.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-8">
                    {/* User Info Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="bg-blue-100 p-1.5 rounded-md">
                                <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800">Suas Informações</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="requester_name" className="text-slate-600 font-medium flex items-center gap-2">
                                    <User className="w-3 h-3" /> Nome Completo
                                </Label>
                                <Input
                                    id="requester_name"
                                    value={newTicket.requester_name}
                                    onChange={(e) => setNewTicket({ ...newTicket, requester_name: e.target.value })}
                                    className="h-10 border-slate-300 focus-visible:ring-purple-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="requester_email" className="text-slate-600 font-medium flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> E-mail
                                </Label>
                                <Input
                                    id="requester_email"
                                    type="email"
                                    value={newTicket.requester_email}
                                    onChange={(e) => setNewTicket({ ...newTicket, requester_email: e.target.value })}
                                    className="h-10 border-slate-300 focus-visible:ring-purple-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="requester_phone" className="text-slate-600 font-medium flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Telefone/Ramal
                                </Label>
                                <Input
                                    id="requester_phone"
                                    value={newTicket.requester_phone}
                                    onChange={(e) => setNewTicket({ ...newTicket, requester_phone: e.target.value })}
                                    className="h-10 border-slate-300 focus-visible:ring-purple-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="department" className="text-slate-600 font-medium flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> Setor
                                </Label>
                                <Input
                                    id="department"
                                    value={newTicket.department}
                                    onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })}
                                    className="h-10 border-slate-300 focus-visible:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Problem Details Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="bg-red-100 p-1.5 rounded-md">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800">Detalhes do Chamado</h3>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="text-slate-600 font-medium">Título do Problema <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Impressora não conecta, Erro no sistema..."
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                    className="font-medium h-11 border-slate-300 focus-visible:ring-purple-500"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-slate-600 font-medium">Descrição Detalhada <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    rows={5}
                                    placeholder="Descreva o problema com o máximo de detalhes possível..."
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    className="resize-none border-slate-300 focus-visible:ring-purple-500"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-slate-600 font-medium">Opcional: Print da Tela</Label>
                                <div
                                    className={`group border-2 border-dashed rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${pastedImage
                                        ? 'border-purple-300 bg-purple-50/30'
                                        : 'border-slate-300 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-400'
                                        }`}
                                    onPaste={handlePaste}
                                    tabIndex={0}
                                >
                                    {pastedImage ? (
                                        <div className="relative h-full w-full p-2 flex items-center justify-center">
                                            <img src={pastedImage} alt="Print" className="max-h-full max-w-full object-contain rounded-md shadow-sm" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setPastedImage(null); }}>
                                                    Remover
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center pointer-events-none p-4">
                                            <div className="bg-white p-3 rounded-full shadow-sm inline-flex mb-3 group-hover:scale-110 transition-transform">
                                                <Sparkles className="h-6 w-6 text-purple-500" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">Clique aqui e pressione <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-xs">Ctrl+V</span></p>
                                            <p className="text-xs text-slate-500 mt-1">para colar um print do erro</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t">
                        <div className="grid gap-2">
                            <Label className="text-xs font-semibold uppercase text-slate-500">Qual o impacto na sua rotina?</Label>
                            <Select
                                value={newTicket.priority}
                                onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                            >
                                <SelectTrigger className="bg-slate-50 h-11 focus:ring-purple-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Posso esperar (Não afeta meu trabalho direto)</SelectItem>
                                    <SelectItem value="medium">Incomoda (Afeta um pouco, mas consigo trabalhar)</SelectItem>
                                    <SelectItem value="high">Urgente (Estou travado em uma tarefa importante)</SelectItem>
                                    <SelectItem value="critical">Crítico (Sistema inteiro fora do ar / Não consigo trabalhar)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                        <Button variant="outline" onClick={() => window.history.back()} className="h-11 px-8">
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateTicket} disabled={createTicket.isPending} className="bg-purple-600 hover:bg-purple-700 h-11 px-8">
                            {createTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar para o TI
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
