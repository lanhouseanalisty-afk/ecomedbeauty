import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePositions } from "@/hooks/useRH";
import { UserPlus, Loader2 } from "lucide-react";

export function UserCreationModal({ onUserCreated }: { onUserCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { data: positions } = usePositions();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "user",
            positionId: "",
            cpf: "",
            employeeCode: "",
        },
    });

    async function onSubmit(data: any) {
        setLoading(true);
        console.log("Submitting user creation:", data);
        try {
            const { error: invokeError } = await supabase.functions.invoke("update-user-password", {
                body: {
                    email: data.email,
                    newPassword: data.password,
                    employeeName: data.fullName,
                    role: data.role,
                    positionId: data.positionId || null,
                    cpf: data.cpf,
                    employeeCode: data.employeeCode,
                },
            });

            if (invokeError) throw invokeError;

            toast.success("Usuário criado com sucesso!");

            // Defensive delay to let toast/DOM settle before closing and refreshing
            setTimeout(() => {
                setOpen(false);
                reset();
                onUserCreated?.();
            }, 1000);
        } catch (error: any) {
            console.error("Error creating user:", error);
            toast.error("Erro: " + (error.message || "Falha desconhecida"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !loading && setOpen(val)}>
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
                        Cadastre um novo colaborador preenchendo as informações obrigatórias.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input {...register("fullName")} placeholder="João Silva" required disabled={loading} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input {...register("email")} type="email" placeholder="usuario@medbeauty.com.br" required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <Input {...register("password")} type="password" placeholder="••••••••" required disabled={loading} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>CPF</Label>
                            <Input {...register("cpf")} placeholder="000.000.000-00" required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <Label>Código do Funcionário</Label>
                            <Input {...register("employeeCode")} placeholder="Ex: MB-123" required disabled={loading} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Nível de Acesso (Role)</Label>
                        <select {...register("role")} className="w-full p-2 border rounded-md bg-transparent" disabled={loading}>
                            <option value="user">Usuário Padrão</option>
                            <option value="admin">Administrador</option>
                            <option value="manager">Gerente</option>
                            <option value="analyst">Analista</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Cargo / Função</Label>
                        <select {...register("positionId")} className="w-full p-2 border rounded-md bg-transparent" required disabled={loading}>
                            <option value="">Selecione um cargo</option>
                            {positions?.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Usuário"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
