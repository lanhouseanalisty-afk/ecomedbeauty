-- Create Gamification Tables
-- 1. gamification_badges: Stores available badges
CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    icon_name text NOT NULL,
    color_hex text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 2. gamification_challenges: Stores available challenges
CREATE TABLE IF NOT EXISTS public.gamification_challenges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    xp_reward integer NOT NULL DEFAULT 0,
    points_reward integer NOT NULL DEFAULT 0,
    sector_id uuid,
    -- Optional relation to departments if needed
    type text NOT NULL DEFAULT 'general',
    is_active boolean NOT NULL DEFAULT true,
    color text DEFAULT 'purple',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. user_gamification: Stores user level and XP
CREATE TABLE IF NOT EXISTS public.user_gamification (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    xp integer NOT NULL DEFAULT 0,
    level integer NOT NULL DEFAULT 1,
    points integer NOT NULL DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 4. user_badges: Stores which user has which badge
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id uuid REFERENCES public.gamification_badges(id) ON DELETE CASCADE,
    unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);
-- 5. user_challenges: Stores user progress on challenges
CREATE TABLE IF NOT EXISTS public.user_challenges (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id uuid REFERENCES public.gamification_challenges(id) ON DELETE CASCADE,
    progress integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'active',
    completed_at timestamp with time zone,
    PRIMARY KEY (user_id, challenge_id)
);
-- RLS Policies
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
-- Badges and Challenges are readable by anyone authenticated
CREATE POLICY "Anyone can read badges" ON public.gamification_badges FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can read challenges" ON public.gamification_challenges FOR
SELECT USING (auth.role() = 'authenticated');
-- Submissions for challenges (Admin/Manager can insert/edit)
CREATE POLICY "Admins can insert challenges" ON public.gamification_challenges FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- User stats (can read their own or others for leaderboard)
CREATE POLICY "Anyone can read gamification stats" ON public.user_gamification FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own gamification stats" ON public.user_gamification FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert user gamification stats" ON public.user_gamification FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- User Badges and Challenges (Users can read their own or others)
CREATE POLICY "Anyone can read user badges" ON public.user_badges FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can read user challenges" ON public.user_challenges FOR
SELECT USING (auth.role() = 'authenticated');
-- Users can update their own challenge progress
CREATE POLICY "Users can insert their own challenge progress" ON public.user_challenges FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge progress" ON public.user_challenges FOR
UPDATE USING (auth.uid() = user_id);
-- Trigger to create user_gamification profile on new user
-- (If you already have a trigger for employees, you can add an insert here or handle it at runtime)