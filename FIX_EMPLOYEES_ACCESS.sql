-- Arquivo para corrigir visualização de funcionários (RLS e Dados de Teste)

-- 1. Permitir leitura da tabela employees para todos os usuários autenticados (Fix para Dev)
-- Removemos politicas restritivas para facilitar leitura em ambiente de testes
DROP POLICY IF EXISTS "Anyone view employees" ON public.employees;
CREATE POLICY "Anyone view employees" ON public.employees FOR SELECT USING (true);

-- 2. Inserir dados de teste se necessário (ignora se já existir código)
-- Isso garante que haja pelo menos dois funcionários, incluindo um gestor.
INSERT INTO public.employees (
    employee_code,
    full_name,
    cpf,
    email,
    hire_date,
    status
) VALUES 
    ('FUNC-TEST-001', 'Funcionário Teste', '00000000001', 'func.teste@medbeauty.com', CURRENT_DATE, 'active'),
    ('MGR-TEST-001', 'Gestor de Teste', '00000000002', 'gestor.teste@medbeauty.com', CURRENT_DATE, 'active')
ON CONFLICT (employee_code) DO NOTHING;

-- Commit explicito não é necessário no editor SQL do Supabase normalmente, mas deixamos o script simples.
