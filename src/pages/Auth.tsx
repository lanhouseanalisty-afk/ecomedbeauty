import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Building2, ShoppingBag, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'employee' ? 'employee' : 'customer';
  const [loginRole, setLoginRole] = useState<'customer' | 'employee'>(initialRole);
  const { signIn, signUp, signOut, user, isEmployee, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect based on user role when already logged in
  useEffect(() => {
    if (!loading && user) {
      if (isEmployee) {
        navigate("/crm");
      } else {
        navigate("/");
      }
    }
  }, [user, isEmployee, loading, navigate]);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const handleADLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/crm`,
        scopes: 'email profile openid',
      },
    });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    const { error, isEmployee: isEmployeeUser } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("E-mail ou senha incorretos");
      } else if (error.message.includes("Email logins are disabled")) {
        toast.error("O login por e-mail está temporariamente desativado no servidor. Por favor, contate o administrador.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Role validation
    if (loginRole === 'employee' && !isEmployeeUser) {
      toast.error("Este acesso é restrito a colaboradores cadastrados no CRM.");
      await signOut(); // Force logout if not an employee
      return;
    }

    toast.success("Login realizado com sucesso!");

    // Redirect based on role
    if (isEmployeeUser && loginRole === 'employee') {
      navigate("/crm");
    } else {
      navigate("/");
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este e-mail já está cadastrado");
      } else if (error.message.includes("email rate limit exceeded")) {
        toast.error("Limite de envio de e-mail excedido. Por favor, aguarde alguns minutos antes de tentar novamente.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Conta criada com sucesso! Você pode fazer login agora.");
    setIsSignUp(false);
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render form if user is logged in (will redirect via useEffect)
  if (user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`${isSignUp ? "Criar Conta" : "Entrar"} | MedBeauty`}</title>
      </Helmet>

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl font-bold text-primary">MedBeauty</span>
            </Link>
            <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
              {isSignUp ? "Criar sua conta" : "Bem-vindo de volta"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSignUp
                ? "Preencha os dados abaixo para se cadastrar"
                : "Entre com suas credenciais para continuar"}
            </p>
          </div>

          {/* Role info banner */}
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <div className="flex gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="p-2 rounded-md bg-success/10">
                  <ShoppingBag className="h-4 w-4 text-success" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Acesso por perfil</p>
                <p><span className="text-primary">Funcionários</span> são redirecionados para o CRM</p>
                <p><span className="text-success">Clientes</span> acessam a loja normalmente</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in-up">
            {isSignUp ? (
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                {/* ... existing sign up fields ... */}
                <div>
                  <Label htmlFor="fullName">Nome completo</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Seu nome"
                      className="pl-10"
                      {...signUpForm.register("fullName")}
                    />
                  </div>
                  {signUpForm.formState.errors.fullName && (
                    <p className="mt-1 text-sm text-destructive">
                      {signUpForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      {...signUpForm.register("email")}
                    />
                  </div>
                  {signUpForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...signUpForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signUpForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-destructive">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10"
                      {...signUpForm.register("confirmPassword")}
                    />
                  </div>
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-destructive">
                      {signUpForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar conta"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Tabs value={loginRole} onValueChange={(v) => setLoginRole(v as 'customer' | 'employee')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="customer" className="gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Cliente
                  </TabsTrigger>
                  <TabsTrigger value="employee" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Colaborador
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-mail {loginRole === 'employee' ? 'Corporativo' : ''}</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        {...signInForm.register("email")}
                      />
                    </div>
                    {signInForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-destructive">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...signInForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-destructive">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar como " + (loginRole === 'employee' ? 'Colaborador' : 'Cliente')}
                    <LogIn className="h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={async () => {
                        const email = signInForm.getValues("email");
                        if (!email) {
                          toast.error("Por favor, informe seu e-mail para recuperar a senha.");
                          return;
                        }
                        setIsLoading(true);
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
                        });
                        setIsLoading(false);
                        if (error) {
                          toast.error("Erro ao enviar e-mail de recuperação: " + error.message);
                        } else {
                          toast.success("E-mail de recuperação enviado com sucesso!");
                        }
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  {loginRole === 'employee' && (
                    <>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Ou corporativo
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" type="button" className="w-full gap-2" onClick={handleADLogin} disabled={isLoading}>
                        <Building2 className="h-4 w-4" />
                        Entrar com AD (Microsoft 365)
                      </Button>
                    </>
                  )}
                </form>
              </Tabs>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-1 font-medium text-primary hover:underline"
                >
                  {isSignUp ? "Entrar" : "Criar conta"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
