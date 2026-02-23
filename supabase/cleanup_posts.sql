-- Função para deletar posts com mais de 7 dias
-- Você pode rodar isso no SQL Editor do Supabase
CREATE OR REPLACE FUNCTION delete_old_employee_posts() RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
DELETE FROM public.employee_posts
WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;
-- Agendamento (Requer a extensão pg_cron habilitada no dashboard do Supabase)
-- Se não conseguir habilitar a extensão, você pode rodar 'SELECT delete_old_employee_posts();' manualmente ou via Edge Function.
-- SELECT cron.schedule('delete-old-posts-daily', '0 0 * * *', 'SELECT delete_old_employee_posts();');