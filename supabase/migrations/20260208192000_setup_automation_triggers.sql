
-- Migration: Setup Automation Triggers for Notifications

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_system_notification(
    p_user_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_type TEXT,
    p_link TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, description, type, link, metadata)
    VALUES (p_user_id, p_title, p_description, p_type, p_link, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Trigger for Sector Requests (Notify managers)
CREATE OR REPLACE FUNCTION public.on_sector_request_created()
RETURNS TRIGGER AS $$
DECLARE
    role_name TEXT;
    target_user_id UUID;
BEGIN
    -- Map sector slug to role name
    role_name := NEW.target_sector || '_manager';
    
    -- Insert notification for all managers of that sector AND admins
    FOR target_user_id IN 
        SELECT user_id FROM public.user_roles 
        WHERE role = role_name OR role = 'admin'
    LOOP
        PERFORM public.create_system_notification(
            target_user_id,
            'Nova Solicitação: ' || NEW.title,
            'Setor ' || NEW.source_sector || ' solicitou suporte.',
            'request',
            '/crm/' || NEW.target_sector || '/solicitacoes',
            jsonb_build_object('request_id', NEW.id, 'priority', NEW.priority)
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_sector_request_created
AFTER INSERT ON public.sector_requests
FOR EACH ROW EXECUTE PROCEDURE public.on_sector_request_created();

-- 2. Trigger for Support Tickets
CREATE OR REPLACE FUNCTION public.on_ticket_event()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- On New Ticket (Notify all tech support)
    IF (TG_OP = 'INSERT') THEN
        FOR target_user_id IN 
            SELECT user_id FROM public.user_roles 
            WHERE role IN ('tech_support', 'admin')
        LOOP
            PERFORM public.create_system_notification(
                target_user_id,
                'Novo Chamado de TI',
                'Ticket #' || NEW.ticket_number || ': ' || NEW.title,
                'ticket',
                '/crm/tech/tickets',
                jsonb_build_object('ticket_id', NEW.id, 'priority', NEW.priority)
            );
        END LOOP;
    -- On Assignment (Notify the assigned technician)
    ELSIF (TG_OP = 'UPDATE' AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL) THEN
        PERFORM public.create_system_notification(
            NEW.assigned_to,
            'Chamado Atribuído a Você',
            'Você agora é o responsável pelo ticket #' || NEW.ticket_number,
            'ticket',
            '/crm/tech/tickets',
            jsonb_build_object('ticket_id', NEW.id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_ticket_event
AFTER INSERT OR UPDATE ON public.tickets
FOR EACH ROW EXECUTE PROCEDURE public.on_ticket_event();

-- 3. Bridge Admission Notifications to the new system
CREATE OR REPLACE FUNCTION public.bridge_admission_notifications()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    role_needed TEXT;
BEGIN
    -- Determine role based on step
    IF NEW.target_step = 'ti' THEN
        role_needed := 'tech_support';
        
        -- SMART TRIGGER: Create a TI Ticket automatically for setup
        INSERT INTO public.tickets (
            title,
            description,
            category_id,
            priority,
            requester_id,
            status,
            metadata
        ) VALUES (
            'Setup de TI: ' || (NEW.metadata->>'employee_name'),
            'Automatizado: Realizar setup inicial para ' || (NEW.metadata->>'employee_name') || ' (Cargo: ' || (NEW.metadata->>'position') || '). Verificar checklist de admissão.',
            (SELECT id FROM public.ticket_categories WHERE name ILIKE '%Hardware%' OR name ILIKE '%Setup%' LIMIT 1),
            'medium',
            auth.uid(), -- The system/manager doing the action
            'open',
            jsonb_build_object('admission_process_id', NEW.admission_process_id, 'is_automated', true)
        );
    ELSIF NEW.target_step = 'gestor' THEN
        role_needed := NEW.target_department || '_manager';
    ELSE
        -- For 'colaborador', we normally don't have a specific role in user_roles for them yet
        -- but if we had their user_id, we'd notify them.
        RETURN NEW;
    END IF;

    -- Notify relevant users
    FOR target_user_id IN 
        SELECT user_id FROM public.user_roles 
        WHERE role = role_needed OR role = 'admin'
    LOOP
        PERFORM public.create_system_notification(
            target_user_id,
            'Pendência de Admissão',
            'Novo processo aguardando sua ação na etapa: ' || NEW.target_step,
            'admission',
            CASE 
                WHEN NEW.target_step = 'ti' THEN '/crm/tech/admissao'
                WHEN NEW.target_step = 'gestor' THEN '/crm/' || NEW.target_department || '/admissao'
                ELSE '/crm'
            END,
            jsonb_build_object('process_id', NEW.admission_process_id, 'step', NEW.target_step)
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_bridge_admission_notifications
AFTER INSERT ON public.admission_notifications
FOR EACH ROW EXECUTE PROCEDURE public.bridge_admission_notifications();
