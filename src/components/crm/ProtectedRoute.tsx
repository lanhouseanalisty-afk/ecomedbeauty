import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, ShieldAlert, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredModule?: string;
  requiredRoles?: string[];
  requireEmployee?: boolean;
}

export function ProtectedRoute({ children, requiredModule, requiredRoles, requireEmployee = true }: ProtectedRouteProps) {
  const { user, loading: authLoading, isEmployee } = useAuth();
  const { loading: roleLoading, canAccessModule, hasAnyRole, isAdmin } = useUserRole();
  const location = useLocation();

  // Show loading while checking auth
  if (authLoading || roleLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if employee access is required but user is a customer
  if (requireEmployee && !isEmployee) {
    return <CustomerRedirect />;
  }

  // Check module access
  if (requiredModule && !canAccessModule(requiredModule)) {
    return <AccessDenied module={requiredModule} />;
  }

  // Check specific roles
  if (requiredRoles && requiredRoles.length > 0 && !isAdmin) {
    const hasRequiredRole = requiredRoles.some(role => 
      hasAnyRole(role as any)
    );
    if (!hasRequiredRole) {
      return <AccessDenied />;
    }
  }

  return <>{children}</>;
}

function CustomerRedirect() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Área Restrita</CardTitle>
          <CardDescription>
            Esta área é exclusiva para funcionários da empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Como cliente, você pode acessar nossa loja para fazer compras.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" asChild>
              <Link to="/">Ir para a Loja</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/profile">Minha Conta</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccessDenied({ module }: { module?: string }) {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            {module 
              ? `Você não tem permissão para acessar o módulo ${module.charAt(0).toUpperCase() + module.slice(1)}.`
              : 'Você não tem permissão para acessar esta página.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Entre em contato com o administrador do sistema para solicitar acesso.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
