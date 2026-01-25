-- FIX_TICKETS_PROFILES_RELATION.sql
-- Cria a chave estrangeira explícita entre tickets e profiles para permitir o JOIN (select *, requester:profiles(...))

DO $$ BEGIN
    -- Tenta adicionar a constraint apenas se ela não existir
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tickets_requester_profile') THEN
        ALTER TABLE tickets
        ADD CONSTRAINT fk_tickets_requester_profile
        FOREIGN KEY (requester_id)
        REFERENCES profiles(id);
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN 
        RAISE NOTICE 'Não foi possível criar a FK pois existem tickets com requester_id que não existem na tabela profiles.';
    WHEN others THEN
        RAISE NOTICE 'Erro ao criar FK: %', SQLERRM;
END $$;
