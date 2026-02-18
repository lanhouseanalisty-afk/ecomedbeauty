
SELECT id, full_name, email FROM public.profiles WHERE full_name ILIKE '%Tech%' OR full_name ILIKE '%Marcelo Ravagnani%';
SELECT id, title FROM public.legal_contracts WHERE title ILIKE '%fornecedor de impressoras%' OR title ILIKE '%impressora%';
