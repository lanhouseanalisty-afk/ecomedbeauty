-- Add missing RLS policies for gamification_challenges
-- This allows updates and deletions by authenticated users (admins)
CREATE POLICY "Admins can update challenges" ON public.gamification_challenges FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete challenges" ON public.gamification_challenges FOR DELETE USING (auth.role() = 'authenticated');