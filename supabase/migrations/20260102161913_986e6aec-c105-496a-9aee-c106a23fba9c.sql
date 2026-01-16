-- Criar tabela de notificações de admissão
CREATE TABLE public.admission_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_process_id UUID NOT NULL REFERENCES public.admission_processes(id) ON DELETE CASCADE,
  target_step TEXT NOT NULL, -- 'gestor', 'ti', 'colaborador'
  target_email TEXT,
  target_department TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'step_pending', -- 'step_pending', 'step_completed', 'reminder'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  link_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admission_notifications ENABLE ROW LEVEL SECURITY;

-- Policies - authenticated users can read notifications for their department
CREATE POLICY "Authenticated users can read notifications"
ON public.admission_notifications
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update notifications"
ON public.admission_notifications
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert notifications"
ON public.admission_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_admission_notifications_process ON public.admission_notifications(admission_process_id);
CREATE INDEX idx_admission_notifications_token ON public.admission_notifications(link_token);
CREATE INDEX idx_admission_notifications_status ON public.admission_notifications(status);

-- Trigger for updated_at
CREATE TRIGGER update_admission_notifications_updated_at
BEFORE UPDATE ON public.admission_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admission_notifications;