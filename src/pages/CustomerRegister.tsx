import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    User, Mail, Lock, Phone, CreditCard,
    Stethoscope, GraduationCap, CheckCircle2,
    ChevronRight, ChevronLeft, Upload, Loader2,
    ShieldCheck, ArrowRight, Building2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const registerSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    fullName: z.string().min(3, "Nome completo é obrigatório"),
    cpf: z.string().min(11, "CPF inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    professionalType: z.enum(["hof", "med", "other"]),
    professionalId: z.string().min(2, "Registro profissional é obrigatório"),
    professionalState: z.string().min(2, "UF é obrigatória"),
});

type RegisterData = z.infer<typeof registerSchema>;

const STEPS = [
    { id: 1, title: "Acesso", icon: Lock },
    { id: 2, title: "Pessoal", icon: User },
    { id: 3, title: "Profissional", icon: Stethoscope },
    { id: 4, title: "Documentos", icon: GraduationCap },
];

export default function CustomerRegister() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        idDocument: null,
        professionalId: null,
        diploma: null,
    });

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const form = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            professionalType: "hof",
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const uploadDocument = async (userId: string, file: File, type: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${type}_${Math.random()}.${fileExt}`;
        // The bucket is 'professional-documents'
        const { error: uploadError } = await supabase.storage
            .from('professional-documents')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('professional-documents')
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    const onSubmit = async (data: RegisterData) => {
        if (!files.idDocument || !files.professionalId || !files.diploma) {
            toast.error("Por favor, anexe todos os documentos obrigatórios.");
            setStep(4);
            return;
        }

        setIsLoading(true);
        try {
            const { data: authData, error: authError } = await signUp(
                data.email,
                data.password,
                data.fullName,
                {
                    role: 'customer',
                    professional_type: data.professionalType,
                    professional_id: data.professionalId,
                    professional_state: data.professionalState
                }
            );

            if (authError) throw authError;
            if (!authData?.user) throw new Error("Erro ao criar usuário.");

            const userId = authData.user.id;

            const [idDocUrl, profIdUrl, diplomaUrl] = await Promise.all([
                uploadDocument(userId, files.idDocument, 'id_document'),
                uploadDocument(userId, files.professionalId, 'professional_id'),
                uploadDocument(userId, files.diploma, 'diploma'),
            ]);

            const { error: dbError } = await supabase.from('ecommerce_customers').insert({
                user_id: userId,
                full_name: data.fullName,
                email: data.email,
                phone: data.phone,
                professional_type: data.professionalType,
                professional_id: data.professionalId,
                professional_state: data.professionalState,
                id_document_url: idDocUrl,
                professional_id_url: profIdUrl,
                diploma_url: diplomaUrl,
                verification_status: 'pending'
            });

            if (dbError) throw dbError;

            toast.success("Cadastro realizado! Aguarde a verificação dos seus documentos.");
            navigate("/auth?role=customer");
        } catch (error: any) {
            toast.error("Erro no cadastro: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStep(s => Math.min(s + 1, 4));
    };

    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStep(s => Math.max(s - 1, 1));
    };

    const progressValue = (step / 4) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Helmet>
                <title>Cadastro Profissional | MedBeauty</title>
            </Helmet>

            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-2">
                    <span className="font-sans text-2xl font-bold tracking-[0.2em] text-primary uppercase flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-gold animate-pulse" />
                        MedBeauty
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-bold bg-rose-gold/10 text-rose-gold-dark px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        B2B Professional
                    </span>
                </Link>
                <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Voltar para o Login
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-2xl">
                    {/* Progress Bar Area */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-serif font-bold text-slate-900">Cadastro de Profissional</h1>
                            <span className="text-sm font-medium text-muted-foreground">Passo {step} de 4</span>
                        </div>
                        <Progress value={progressValue} className="h-2 bg-slate-200" />

                        <div className="flex justify-between mt-4">
                            {STEPS.map((s) => (
                                <div
                                    key={s.id}
                                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${step >= s.id ? "text-primary opacity-100" : "text-slate-400 opacity-60"
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${step === s.id ? "bg-primary/10 ring-2 ring-primary/20" : ""}`}>
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="border-none shadow-xl overflow-hidden bg-white">
                        <CardContent className="p-0">
                            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8">

                                {/* Steps with fixed keys for DOM stability */}
                                <div className="min-h-[300px]">
                                    {step === 1 && (
                                        <div key="step-1" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="space-y-2 text-center mb-4">
                                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                    <Lock className="h-6 w-6 text-primary" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">Dados de Acesso</h2>
                                                <p className="text-sm text-muted-foreground">Defina suas credenciais de acesso</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">E-mail Profissional</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <Input id="email" type="email" placeholder="seu@email.com" className="pl-10 h-11" {...form.register("email")} />
                                                    </div>
                                                    {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Senha Forte</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11" {...form.register("password")} />
                                                    </div>
                                                    {form.formState.errors.password && <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div key="step-2" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="space-y-2 text-center mb-4">
                                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                    <User className="h-6 w-6 text-primary" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">Dados Pessoais</h2>
                                                <p className="text-sm text-muted-foreground">Precisamos saber quem você é</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="fullName">Nome Completo</Label>
                                                    <Input id="fullName" placeholder="Digite seu nome completo" className="h-11" {...form.register("fullName")} />
                                                    {form.formState.errors.fullName && <p className="text-xs text-destructive mt-1">{form.formState.errors.fullName.message}</p>}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cpf">CPF</Label>
                                                        <Input id="cpf" placeholder="000.000.000-00" className="h-11" {...form.register("cpf")} />
                                                        {form.formState.errors.cpf && <p className="text-xs text-destructive mt-1">{form.formState.errors.cpf.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                                        <Input id="phone" placeholder="(00) 00000-0000" className="h-11" {...form.register("phone")} />
                                                        {form.formState.errors.phone && <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div key="step-3" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="space-y-2 text-center mb-4">
                                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                    <Stethoscope className="h-6 w-6 text-primary" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">Dados Profissionais</h2>
                                                <p className="text-sm text-muted-foreground">Sua atuação no mercado</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Sua Profissão</Label>
                                                    <Select
                                                        onValueChange={(val) => form.setValue("professionalType", val as any)}
                                                        defaultValue={form.getValues("professionalType")}
                                                    >
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="Selecione sua área" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white">
                                                            <SelectItem value="hof">HOF (Harmonização Orofacial)</SelectItem>
                                                            <SelectItem value="med">Médico / Especialista</SelectItem>
                                                            <SelectItem value="other">Outros (Biomédico / Esteticista)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="col-span-2 space-y-2">
                                                        <Label htmlFor="professionalId">Registro Profissional (CRO/CRM)</Label>
                                                        <Input id="professionalId" placeholder="Número do registro" className="h-11" {...form.register("professionalId")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="professionalState">UF</Label>
                                                        <Input id="professionalState" placeholder="EX: SP" className="h-11 uppercase" maxLength={2} {...form.register("professionalState")} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div key="step-4" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="space-y-2 text-center mb-4">
                                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                    <GraduationCap className="h-6 w-6 text-primary" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">Documentação</h2>
                                                <p className="text-sm text-muted-foreground">Envie fotos ou PDFs legíveis</p>
                                            </div>

                                            <div className="space-y-4">
                                                {[
                                                    { id: "idDocument", label: "Documento de Identidade (RG/CNH)", file: files.idDocument },
                                                    { id: "professionalId", label: "Carteira do Conselho", file: files.professionalId },
                                                    { id: "diploma", label: "Diploma ou Graduação", file: files.diploma },
                                                ].map((doc) => (
                                                    <div key={doc.id} className="p-4 border-2 border-dashed rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors group bg-slate-50/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${doc.file ? "bg-green-100 text-green-600" : "bg-white border text-slate-400 group-hover:text-primary transition-colors"}`}>
                                                                {doc.file ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                                                            </div>
                                                            <div className="text-left overflow-hidden">
                                                                <p className="text-sm font-semibold text-slate-800 truncate">{doc.label}</p>
                                                                <p className="text-[10px] text-muted-foreground truncate">{doc.file ? doc.file.name : "Clique para anexar arquivo"}</p>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            id={`file-input-${doc.id}`}
                                                            accept="image/*,application/pdf"
                                                            onChange={(e) => handleFileChange(e, doc.id)}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-primary hover:bg-primary/5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                document.getElementById(`file-input-${doc.id}`)?.click();
                                                            }}
                                                        >
                                                            {doc.file ? "Trocar" : "Escolher"}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-primary/5 rounded-lg p-4 flex gap-3 border border-primary/10">
                                                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    Seus dados estão protegidos. A análise documental é feita manualmente por nossa equipe de compliance.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Buttons - Unified for stability */}
                                <div className="mt-10 flex gap-4 pt-6 border-t">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 h-12 border-slate-200"
                                            onClick={prevStep}
                                            disabled={isLoading}
                                        >
                                            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                                        </Button>
                                    )}

                                    <Button
                                        type={step === 4 ? "submit" : "button"}
                                        className={`flex-1 h-12 font-bold transition-all ${step === 4 ? 'bg-success hover:bg-success-dark text-white' : 'bg-primary hover:bg-primary-dark text-white'}`}
                                        onClick={step < 4 ? nextStep : undefined}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                {step < 4 ? (
                                                    <>Próximo <ChevronRight className="h-4 w-4" /></>
                                                ) : (
                                                    <>Finalizar Cadastro <ArrowRight className="h-4 w-4" /></>
                                                )}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <footer className="mt-12 text-center text-slate-400 text-xs">
                        <p>© 2026 MedBeauty Professional. Conteúdo Científico Privado.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
