-- Create employee_posts table
CREATE TABLE IF NOT EXISTS public.employee_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id), -- The user who created the post (could be the employee themselves or someone else posting on their wall)
    content TEXT,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create employee_post_comments table
CREATE TABLE IF NOT EXISTS public.employee_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.employee_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create employee_post_likes table
CREATE TABLE IF NOT EXISTS public.employee_post_likes (
    post_id UUID NOT NULL REFERENCES public.employee_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.employee_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_post_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read posts
CREATE POLICY "Everyone can read posts" ON public.employee_posts
    FOR SELECT USING (true);

-- Policy: Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.employee_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authors can update their own posts
CREATE POLICY "Authors can update own posts" ON public.employee_posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Policy: Authors can delete their own posts
CREATE POLICY "Authors can delete own posts" ON public.employee_posts
    FOR DELETE USING (auth.uid() = author_id);

-- Same basic policies for comments and likes
CREATE POLICY "Everyone can read comments" ON public.employee_post_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.employee_post_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Everyone can read likes" ON public.employee_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.employee_post_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can unlike" ON public.employee_post_likes
    FOR DELETE USING (auth.uid() = user_id);
