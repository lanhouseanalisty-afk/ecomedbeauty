-- Setup initial gamification badges and the logic for completing challenges
-- 1. Insert Initial Badges (if they don't exist)
INSERT INTO public.gamification_badges (id, name, description, icon_name, color_hex)
VALUES (
        gen_random_uuid(),
        'Primeiro Passo',
        'Concluiu o seu primeiro desafio na Gamônia.',
        'Star',
        '#10B981'
    ),
    (
        gen_random_uuid(),
        'Máquina de Metas',
        'Concluiu 10 desafios de produtividade.',
        'Zap',
        '#F59E0B'
    ),
    (
        gen_random_uuid(),
        'Veterano de Vendas',
        'Atingiu o prestimoso Nível 10.',
        'Award',
        '#3B82F6'
    ) ON CONFLICT DO NOTHING;
-- NOTE: Gamification badges doesn't have a unique constraint on name, but this runs only once.
-- 2. Create RPC Function to process challenge completion securely
CREATE OR REPLACE FUNCTION public.complete_challenge(p_user_id uuid, p_challenge_id uuid) RETURNS json LANGUAGE plpgsql SECURITY DEFINER -- Runs as elevated privileges to bypass RLS for necessary inserts
    AS $$
DECLARE v_xp_reward integer;
v_points_reward integer;
v_current_xp integer;
v_current_level integer;
v_new_xp integer;
v_new_level integer;
v_completed_count integer;
v_badge_id uuid;
v_result json;
v_badge_awarded text := null;
v_leveled_up boolean := false;
BEGIN -- 1. Safely verify challenge exists and get rewards
SELECT xp_reward,
    points_reward INTO v_xp_reward,
    v_points_reward
FROM public.gamification_challenges
WHERE id = p_challenge_id
    AND is_active = true;
IF NOT FOUND THEN RETURN json_build_object(
    'success',
    false,
    'error',
    'Challenge not found or inactive'
);
END IF;
-- 2. Prevent completing the same challenge multiple times if already completed
IF EXISTS (
    SELECT 1
    FROM public.user_challenges
    WHERE user_id = p_user_id
        AND challenge_id = p_challenge_id
        AND status = 'completed'
) THEN RETURN json_build_object(
    'success',
    false,
    'error',
    'Challenge already completed'
);
END IF;
-- 3. Upsert user_challenges progress
INSERT INTO public.user_challenges (
        user_id,
        challenge_id,
        progress,
        status,
        completed_at
    )
VALUES (
        p_user_id,
        p_challenge_id,
        100,
        'completed',
        now()
    ) ON CONFLICT (user_id, challenge_id) DO
UPDATE
SET status = 'completed',
    progress = 100,
    completed_at = now();
-- 4. Get Current XP and Level or Create Profile
SELECT xp,
    level INTO v_current_xp,
    v_current_level
FROM public.user_gamification
WHERE user_id = p_user_id;
IF NOT FOUND THEN v_current_xp := 0;
v_current_level := 1;
INSERT INTO public.user_gamification (user_id, xp, level, points)
VALUES (p_user_id, 0, 1, 0);
END IF;
-- 5. Calculate New XP and Level (Formula: Level = Floor(Sqrt(XP / 100)) + 1)
v_new_xp := v_current_xp + v_xp_reward;
v_new_level := TRUNC(SQRT(v_new_xp / 100)) + 1;
IF v_new_level > v_current_level THEN v_leveled_up := true;
END IF;
-- 6. Update Profile
UPDATE public.user_gamification
SET xp = v_new_xp,
    level = v_new_level,
    points = points + v_points_reward,
    updated_at = now()
WHERE user_id = p_user_id;
-- 7. Automated Badge Unlocking Logic
-- Check how many challenges have been completed
SELECT count(*) INTO v_completed_count
FROM public.user_challenges
WHERE user_id = p_user_id
    AND status = 'completed';
-- Logic for "Primeiro Passo" (1 Challenge)
IF v_completed_count = 1 THEN
SELECT id INTO v_badge_id
FROM public.gamification_badges
WHERE name = 'Primeiro Passo'
LIMIT 1;
IF FOUND THEN
INSERT INTO public.user_badges (user_id, badge_id)
VALUES (p_user_id, v_badge_id) ON CONFLICT DO NOTHING;
v_badge_awarded := 'Primeiro Passo';
END IF;
END IF;
-- Logic for "Máquina de Metas" (10 Challenges)
IF v_completed_count = 10 THEN
SELECT id INTO v_badge_id
FROM public.gamification_badges
WHERE name = 'Máquina de Metas'
LIMIT 1;
IF FOUND THEN
INSERT INTO public.user_badges (user_id, badge_id)
VALUES (p_user_id, v_badge_id) ON CONFLICT DO NOTHING;
v_badge_awarded := 'Máquina de Metas';
END IF;
END IF;
-- Return success payload
v_result := json_build_object(
    'success',
    true,
    'xp_gained',
    v_xp_reward,
    'new_level',
    v_new_level,
    'leveled_up',
    v_leveled_up,
    'badge_awarded',
    v_badge_awarded
);
RETURN v_result;
END;
$$;