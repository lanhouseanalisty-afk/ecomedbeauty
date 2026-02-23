import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePositions } from "@/hooks/useRH";
import { UserPlus, Loader2 } from "lucide-react";

const userSchema = z.object({
    fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    role: z.string().min(1, "Selecione uma permissão"),
    positionId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserCreationModalProps {
    onUserCreated?: () => void;
}

const ROLES = [
    { value: "admin", label: "Administrador" },
    { value: "rh_manager", label: "Gestor RH" },
    { value: "finance_manager", label: "Gestor Financeiro" },
    { value: "marketing_manager", label: "Gestor Marketing" },
    { value: "sales_manager", label: "Gestor Comercial" },
    { value: "logistics_manager", label: "Gestor Logística" },
    { value: "tech_support", label: "Suporte Técnico" },
    { value: "ecommerce_manager", label: "Gestor E-commerce" },
    { value: "tech_digital", label: "Tech Digital (TI)" },
    { value: "manager", label: "Gerente" },
    { value: "analyst", label: "Analista" },
    { value: "user", label: "Usuário Padrão" },
];

export function UserCreationModal({ onUserCreated }: UserCreationModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { data: positions } = usePositions();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "user",
            positionId: "",
        },
    });

    async function onSubmit(data: UserFormValues) {
        setLoading(true);
        try {
            const { data: response, error } = await supabase.functions.invoke("update-user-password", {
                body: {
                    email: data.email,
                    newPassword: data.password,
                    employeeName: data.fullName,
                    role: data.role,
                    positionId: data.positionId || null,
                },
            });

            if (error) throw error;

            toast.success("Usuário criado com sucesso!");
            setOpen(false);
            form.reset();
            onUserCreated?.();
        } catch (error: any) {
            console.error("Error creating user:", error);
            toast.error("Erro ao criar usuário: " + (error.message || "Tente novamente mais tarde"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) form.reset();
        }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Novo Usuário
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Cadastre um novo colaborador e defina seus acessos e cargo.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: João Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="usuario@medbeauty.com.br" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha inicial</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nível de Acesso (Role)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma permissão" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="positionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cargo / Função</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um cargo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {positions?.map((position) => (
                                                <SelectItem key={position.id} value={position.id}>
                                                    {position.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Criar Usuário
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
