-- Simplificar a política de RLS para evitar recursividade infinita
-- Usando a função has_role que já é SECURITY DEFINER, o que quebra a recursão do RLS

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Permissões para Admins (Gerenciar tudo)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Permissões para usuários verem suas próprias roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Adicional: Garantir que o RH também possa gerenciar roles (opcional, mas comum)
-- Se quiser que o RH também gerencie, adicione: OR public.has_role(auth.uid(), 'rh')
