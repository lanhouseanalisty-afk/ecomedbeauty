-- Drop restrictive policy and create one that allows authenticated users to read all products in CRM
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
DROP POLICY IF EXISTS "Anyone can read active categories" ON public.product_categories;

-- Allow authenticated users to read all products (active and inactive) for CRM
CREATE POLICY "Authenticated users can read all products"
ON public.products FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to read all categories for CRM
CREATE POLICY "Authenticated users can read all categories"
ON public.product_categories FOR SELECT
USING (auth.uid() IS NOT NULL);