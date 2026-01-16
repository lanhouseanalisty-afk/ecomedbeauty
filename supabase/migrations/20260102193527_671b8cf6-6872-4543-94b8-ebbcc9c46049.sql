-- Add UPDATE and DELETE policies for products table
CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);