-- Create testimonials table if not exists
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
CREATE POLICY "Anyone can read testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed Testimonials
INSERT INTO public.testimonials (name, role, location, avatar, content, rating)
VALUES 
('Dra. Marina Costa', 'Dermatologista', 'São Paulo, SP', 'MC', 'A MedBeauty revolucionou minha clínica. Produtos de qualidade excepcional e suporte técnico impecável.', 5),
('Dr. Roberto Lima', 'Cirurgião Plástico', 'Rio de Janeiro, RJ', 'RL', 'Confio nos produtos MedBeauty há mais de 5 anos. A consistência e qualidade são incomparáveis.', 5),
('Dra. Patricia Alves', 'Esteticista', 'Belo Horizonte, MG', 'PA', 'Meus pacientes percebem a diferença. Os resultados com os fios i-THREAD são extraordinários.', 5)
ON CONFLICT DO NOTHING;

-- Seed Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, is_active)
VALUES 
('PRIMEIRA10', 'percentage', 10, 200, true),
('FRETE50', 'fixed', 50, 500, true),
('MEDBEAUTY20', 'percentage', 20, 1000, true)
ON CONFLICT (code) DO UPDATE 
SET discount_type = EXCLUDED.discount_type, 
    discount_value = EXCLUDED.discount_value, 
    min_order_value = EXCLUDED.min_order_value;

-- Note: To seed reviews, you need product IDs and user IDs.
-- This can be done after products are seeded.
-- To seed loyalty points for a specific user:
-- INSERT INTO public.loyalty_points (user_id, balance, total_earned)
-- VALUES ('USER_ID_HERE', 500, 500)
-- ON CONFLICT DO NOTHING;
