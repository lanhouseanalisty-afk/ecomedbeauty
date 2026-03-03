import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordFormProps {
    onSuccess: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não conferem.");
            return;
        }

        setLoading(true);
        try {
            // 1. Update Password in Auth
            const { error: authError } = await supabase.auth.updateUser({
                password: password
            });

            if (authError) throw authError;

            // 2. Update must_change_password flag in profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .update({ must_change_password: false })
                    .eq("id", user.id);

                if (profileError) throw profileError;
            }

            toast.success("Senha alterada com sucesso!");
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } catch (error: any) {
            console.error("Error changing password:", error);
            toast.error(error.message || "Erro ao alterar senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <KeyRound className="h-5 w-5" />
                    <CardTitle className="text-xl">Alterar Senha Obrigatória</CardTitle>
                </div>
                <CardDescription>
                    Para sua segurança, você deve alterar sua senha inicial no primeiro acesso.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="new-password"
                                type="password"
                                placeholder=" Digite sua nova senha"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder=" Confirme sua nova senha"
                                className="pl-10"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <KeyRound className="h-4 w-4" />
                        )}
                        Alterar Senha e Continuar
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
