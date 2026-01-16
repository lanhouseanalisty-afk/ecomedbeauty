-- Create categories table
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.product_categories(id),
  image_url TEXT,
  images TEXT[],
  sku VARCHAR(50),
  stock INTEGER DEFAULT 0,
  in_stock BOOLEAN GENERATED ALWAYS AS (stock > 0) STORED,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  badge VARCHAR(20) CHECK (badge IN ('new', 'bestseller', 'limited', 'sale')),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_categories
CREATE POLICY "Anyone can read active categories"
ON public.product_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.product_categories FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Ecommerce manager can manage categories"
ON public.product_categories FOR ALL
USING (has_role(auth.uid(), 'ecommerce_manager'));

-- RLS policies for products
CREATE POLICY "Anyone can read active products"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Ecommerce manager can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'ecommerce_manager'));

-- Create updated_at triggers
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add ecommerce_manager role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'ecommerce_manager') THEN
    ALTER TYPE app_role ADD VALUE 'ecommerce_manager';
  END IF;
END$$;

-- Insert some initial categories
INSERT INTO public.product_categories (name, slug, description, sort_order) VALUES
('Preenchimentos', 'preenchimentos', 'Produtos para preenchimento dérmico', 1),
('Toxinas', 'toxinas', 'Toxinas botulínicas', 2),
('Skincare', 'skincare', 'Produtos para cuidados com a pele', 3),
('Equipamentos', 'equipamentos', 'Equipamentos e materiais', 4);