-- Gamification System Schema
-- 1. Create User Gamification Table
CREATE TABLE IF NOT EXISTS public.user_gamification (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 2. Create Challenges Table
CREATE TABLE IF NOT EXISTS public.gamification_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 100 NOT NULL,
    points_reward INTEGER DEFAULT 50 NOT NULL,
    sector_id TEXT,
    -- e.g., 'comercial', 'rh'
    type TEXT DEFAULT 'general' NOT NULL,
    -- 'sales', 'attendance', etc.
    criteria JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. Create User Challenges Table (Tracking)
CREATE TABLE IF NOT EXISTS public.user_challenges (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.gamification_challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    -- 'active', 'completed'
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, challenge_id)
);
-- 4. Create Badges Table
CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT NOT NULL,
    -- Lucide icon name
    color_hex TEXT DEFAULT '#8347EB' NOT NULL,
    criteria JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 5. Create User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.gamification_badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);
-- 6. Enable RLS
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
-- 7. RLS Policies
-- User Gamification: Anyone can read (for ranking), but only the user/system can update
CREATE POLICY "Anyone can view gamification stats" ON public.user_gamification FOR
SELECT USING (true);
CREATE POLICY "Users can see their own challenges" ON public.user_challenges FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view challenges" ON public.gamification_challenges FOR
SELECT USING (is_active = true);
CREATE POLICY "Anyone can view badges" ON public.gamification_badges FOR
SELECT USING (true);
CREATE POLICY "Users can see their own badges" ON public.user_badges FOR
SELECT USING (auth.uid() = user_id);
-- 8. Functions & Triggers
-- Update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_user_gamification_updated_at BEFORE
UPDATE ON public.user_gamification FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- Automatically initialize gamification profile for new users
CREATE OR REPLACE FUNCTION public.initialize_gamification_profile() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.user_gamification (user_id, xp, level, points)
VALUES (NEW.id, 0, 1, 0) ON CONFLICT (user_id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- 9. Seed some basic data (Optional but helpful for testing)
INSERT INTO public.gamification_challenges (
        title,
        description,
        xp_reward,
        points_reward,
        type
    )
VALUES (
        'Primeiro Contrato',
        'Feche seu primeiro contrato no sistema.',
        500,
        100,
        'sales'
    ),
    (
        'Pioneiro',
        'Seja um dos primeiros a usar o novo mural.',
        200,
        50,
        'social'
    ),
    (
        'Mestre da Organização',
        'Complete todas as suas tarefas pendentes.',
        300,
        75,
        'productivity'
    );
INSERT INTO public.gamification_badges (name, description, icon_name, color_hex)
VALUES (
        'Primeiro Dia',
        'Completou seu primeiro dia na empresa.',
        'Sun',
        '#F59E0B'
    ),
    (
        'Negociador',
        'Fechou um contrato acima de 10k.',
        'DollarSign',
        '#10B981'
    ),
    (
        'Inovador',
        'Teve uma ideia aprovada no Banco de Ideias.',
        'Lightbulb',
        '#8347EB'
    );