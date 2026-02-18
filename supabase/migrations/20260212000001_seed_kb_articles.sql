-- Seed: Populating kb_articles with Tech KB data (Corrected)
-- Purpose: Enable automatic KB article matching for tickets

DO $$ 
DECLARE
    cat_office UUID;
    cat_email UUID;
    cat_hw UUID;
    cat_sap UUID;
    cat_others UUID;
BEGIN
    -- Get category IDs by name
    SELECT id INTO cat_office FROM public.ticket_categories WHERE name = 'Software' LIMIT 1;
    SELECT id INTO cat_hw FROM public.ticket_categories WHERE name = 'Hardware' LIMIT 1;
    SELECT id INTO cat_others FROM public.ticket_categories WHERE name = 'Outros' LIMIT 1;
    
    -- Fallbacks
    IF cat_office IS NULL THEN cat_office := (SELECT id FROM public.ticket_categories LIMIT 1); END IF;
    IF cat_hw IS NULL THEN cat_hw := cat_office; END IF;
    IF cat_others IS NULL THEN cat_others := cat_office; END IF;

    -- Insert articles
    INSERT INTO public.kb_articles (title, slug, category_id, content, status, is_public, tags)
    VALUES 
    ('Excel: Travamento e Lentidão', 'excel-travamento-lentidao', cat_office, 'Se o Excel está travando ou lento, tente: 1. Desativar Aceleração Gráfica. 2. Verificar Suplementos. 3. Limpar Arquivos Temporários. 4. Atualizar Office.', 'published', true, ARRAY['excel', 'lento', 'travando', 'office']),
    ('Outlook: Configurar Assinatura', 'outlook-configurar-assinatura', cat_office, 'No Outlook, clique em Novo Email. Vá em Assinatura > Assinaturas. Clique em Novo e cole o modelo padrão.', 'published', true, ARRAY['outlook', 'assinatura', 'email']),
    ('Teams: Configuração de Áudio e Vídeo', 'teams-configuracao-audio-video', cat_others, 'Se ninguém te ouve: Verifique Configurações do dispositivo. Selecione Microfone correto. Faça Chamada de Teste.', 'published', true, ARRAY['teams', 'audio', 'video', 'camera', 'microfone']),
    ('E-mail: Identificando Phishing e Spam', 'email-identificando-phishing-spam', cat_others, 'Remetente suspeito: Verifique e-mail com erros. Senso de urgência: Desconfie de bloqueios imediatos. Links estranhos: Verifique endereço real sem clicar. Na dúvida, NÃO CLIQUE.', 'published', true, ARRAY['email', 'seguranca', 'spam', 'phishing', 'virus']),
    ('E-mail: Arquivamento e Cota Cheia', 'email-arquivamento-cota-cheia', cat_others, 'Se caixa cheia: Use Limpar Itens Antigos. Organize em arquivos .pst locais. Esvazie lixeira e Spam.', 'published', true, ARRAY['email', 'espaço', 'cota', 'limpeza']),
    ('PC Lento: Procedimentos Básicos', 'pc-lento-procedimentos-basicos', cat_hw, 'Melhore performance: Reinicie o PC. Verifique Windows Update. Feche abas excessivas. Libere 10% do disco.', 'published', true, ARRAY['computador', 'lento', 'travando', 'limpeza']),
    ('SAP B1: Erro de Licença', 'sap-b1-erro-licenca', cat_others, 'Mensagem "Não há licença": Verifique se já está logado em outra máquina. Peça verificação de alocação de licenças.', 'published', true, ARRAY['sap', 'licenca', 'erro', 'login'])
    ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        category_id = EXCLUDED.category_id,
        status = EXCLUDED.status,
        tags = EXCLUDED.tags;
END $$;
