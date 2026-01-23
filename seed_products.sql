-- Seed Categories
INSERT INTO public.product_categories (name, slug, description, sort_order)
VALUES 
('Fios', 'fios', 'Fios de PDO para bioestimulação e sustentação', 1),
('Instrumentais', 'instrumentais', 'Instrumental cirúrgico e descartável', 5)
ON CONFLICT (slug) DO NOTHING;

-- Get Category IDs
DO $$
DECLARE
    cat_fios uuid;
    cat_preenchimentos uuid;
    cat_skincare uuid;
    cat_instrumentais uuid;
BEGIN
    SELECT id INTO cat_fios FROM public.product_categories WHERE slug = 'fios';
    SELECT id INTO cat_preenchimentos FROM public.product_categories WHERE slug = 'preenchimentos'; -- Assuming this exists from full_schema.sql, if not I should have inserted it.
    -- Wait, full_schema inserted 'preenchimentos', 'toxinas', 'skincare', 'equipamentos'.
    -- The mock data uses "Preenchedores". I will map it to "Preenchimentos".
    
    SELECT id INTO cat_skincare FROM public.product_categories WHERE slug = 'skincare';
    
    -- "Instrumentais" -> "Equipamentos" or new category?
    -- I inserted "Instrumentais" above.
    SELECT id INTO cat_instrumentais FROM public.product_categories WHERE slug = 'instrumentais';
    
    -- If 'preenchimentos' missing (unlikely if full_schema ran), I'll handle it visually or assume it's there. 
    -- Actually full_schema.sql had: ('Preenchimentos', 'preenchimentos', ...)
    
    -- Insert Products
    -- 1. i-THREAD
    INSERT INTO public.products (name, slug, description, long_description, price, original_price, category_id, image_url, sku, stock, rating, review_count, badge, tags, is_active)
    VALUES (
        'i-THREAD', 
        'i-thread', 
        'Fios de PDO para bioestimulação de colágeno e reposicionamento tecidual.',
        'O i-THREAD é a linha pioneira de fios de PDO no Brasil...', 
        890.00, 
        1090.00, 
        cat_fios, 
        '/assets/product-ithread.jpg', 
        'ITH-001', 
        45, 
        4.9, 
        127, 
        'bestseller', 
        ARRAY['PDO', 'Lifting', 'Rejuvenescimento'], 
        true
    );

    -- 2. e.p.t.q
    INSERT INTO public.products (name, slug, description, long_description, price, category_id, image_url, sku, stock, rating, review_count, badge, tags, is_active)
    VALUES (
        'e.p.t.q', 
        'eptq', 
        'Preenchedor de ácido hialurônico com equilíbrio perfeito entre firmeza e fluidez.',
        'O e.p.t.q é um preenchedor de ácido hialurônico premium...', 
        650.00, 
        cat_preenchimentos, 
        '/assets/product-eptq.jpg', 
        'EPT-001', 
        32, 
        4.8, 
        89, 
        'new', 
        ARRAY['Ácido Hialurônico', 'Preenchimento', 'Harmonização'], 
        true
    );

    -- 3. Idebenone Ampoule
    INSERT INTO public.products (name, slug, description, long_description, price, original_price, category_id, image_url, sku, stock, rating, review_count, badge, tags, is_active)
    VALUES (
        'Idebenone Ampoule', 
        'idebenone-ampoule', 
        'Tratamento antioxidante premium em ampolas com tecnologia de duas soluções.',
        'O Idebenone Ampoule é um tratamento antioxidante de alta performance...', 
        420.00, 
        520.00, 
        cat_skincare, 
        '/assets/product-idebenone.jpg', 
        'IDE-001', 
        78, 
        4.7, 
        56, 
        'sale', 
        ARRAY['Antioxidante', 'Anti-aging', 'Ampolas'], 
        true
    );

    -- 4. Nano Cânula
    INSERT INTO public.products (name, slug, description, long_description, price, category_id, image_url, sku, stock, rating, review_count, tags, is_active)
    VALUES (
        'Nano Cânula', 
        'nano-canula', 
        'Cânulas de alta precisão para procedimentos estéticos minimamente invasivos.',
        'A Nano Cânula MedBeauty oferece precisão máxima...', 
        180.00, 
        cat_instrumentais, 
        '/assets/product-nanocannula.jpg', 
        'NAN-001', 
        150, 
        4.6, 
        203, 
        ARRAY['Cânula', 'Procedimentos', 'Precisão'], 
        true
    );

    -- 5. Ultra Lift PDO
    INSERT INTO public.products (name, slug, description, long_description, price, original_price, category_id, image_url, sku, stock, rating, review_count, badge, tags, is_active)
    VALUES (
        'Ultra Lift PDO', 
        'ultra-lift-pdo', 
        'Fios tensores premium com máxima capacidade de sustentação para lifting avançado.',
        'O Ultra Lift PDO representa o que há de mais avançado...', 
        1290.00, 
        1490.00, 
        cat_fios, 
        '/assets/product-ithread.jpg', 
        'ULT-001', 
        12, 
        5.0, 
        42, 
        'limited', 
        ARRAY['PDO', 'Lifting', 'Tensor'], 
        true
    );

    -- 6. Hydra Boost Serum
    INSERT INTO public.products (name, slug, description, long_description, price, category_id, image_url, sku, stock, rating, review_count, badge, tags, is_active)
    VALUES (
        'Hydra Boost Serum', 
        'hydra-boost-serum', 
        'Sérum intensivo de hidratação profunda com ácido hialurônico de baixo peso molecular.',
        'O Hydra Boost Serum penetra nas camadas mais profundas...', 
        280.00, 
        cat_skincare, 
        '/assets/product-idebenone.jpg', 
        'HYD-001', 
        95, 
        4.8, 
        178, 
        'bestseller', 
        ARRAY['Hidratação', 'Ácido Hialurônico', 'Sérum'], 
        true
    );

    -- 7. Precision Needle Set
    INSERT INTO public.products (name, slug, description, long_description, price, category_id, image_url, sku, stock, rating, review_count, tags, is_active)
    VALUES (
        'Precision Needle Set', 
        'precision-needle-set', 
        'Kit profissional de agulhas de alta precisão para procedimentos estéticos variados.',
        'O Precision Needle Set contém uma seleção completa...', 
        350.00, 
        cat_instrumentais, 
        '/assets/product-nanocannula.jpg', 
        'PRE-001', 
        0, 
        4.5, 
        67, 
        ARRAY['Agulhas', 'Kit', 'Precisão'], 
        true
    );

    -- 8. Volume Plus HA
    INSERT INTO public.products (name, slug, description, long_description, price, category_id, image_url, sku, stock, rating, review_count, badge, tags, is_active)
    VALUES (
        'Volume Plus HA', 
        'volume-plus-ha', 
        'Preenchedor volumizador de alta densidade para áreas que necessitam maior sustentação.',
        'O Volume Plus HA é formulado especialmente...', 
        890.00, 
        cat_preenchimentos, 
        '/assets/product-eptq.jpg', 
        'VOL-001', 
        28, 
        4.9, 
        94, 
        'new', 
        ARRAY['Ácido Hialurônico', 'Volume', 'Contorno'], 
        true
    );

END $$;
