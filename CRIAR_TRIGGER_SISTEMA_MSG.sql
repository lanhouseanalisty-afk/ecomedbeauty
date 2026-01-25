-- CRIAR_TRIGGER_SISTEMA_MSG.sql
-- Trigger para criar automaticamente mensagens de auditoria quando o status do ticket muda

CREATE OR REPLACE FUNCTION log_ticket_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_message TEXT;
BEGIN
    -- Se o status não mudou, não faz nada
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Tenta capturar o usuário que fez a alteração (funciona no Supabase)
    v_user_id := auth.uid();

    -- Define a mensagem
    IF NEW.status = 'in_progress' THEN v_message := 'iniciou o atendimento deste ticket.';
    ELSIF NEW.status = 'resolved' THEN v_message := 'marcou o ticket como resolvido.';
    ELSIF NEW.status = 'closed' THEN v_message := 'fechou o ticket.';
    ELSIF NEW.status = 'pending' THEN v_message := 'marcou o ticket como pendente.';
    ELSIF NEW.status = 'open' THEN v_message := 'reabriu o ticket.';
    ELSE v_message := 'alterou o status para ' || NEW.status;
    END IF;

    -- Insere a mensagem de auditoria
    -- Se não houver usuário logado (ex: trigger system), usa o requester do ticket ou deixa null se a FK permitir
    -- Aqui assumimos que v_user_id pode ser null, mas a tabela ticket_messages exige user_id.
    -- Se v_user_id for null, usamos o próprio requester do ticket como fallback ou um usuário de sistema se existir.
    
    IF v_user_id IS NULL THEN
        v_user_id := NEW.requester_id; -- Fallback
    END IF;

    INSERT INTO ticket_messages (ticket_id, user_id, content, is_internal)
    VALUES (NEW.id, v_user_id, 'Sistema: O usuário ' || v_message, true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove a trigger se já existir para recriar
DROP TRIGGER IF EXISTS trg_log_ticket_status ON tickets;

CREATE TRIGGER trg_log_ticket_status
    AFTER UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION log_ticket_status_change();
