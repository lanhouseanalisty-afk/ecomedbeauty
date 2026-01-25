-- Seeding Categories
INSERT INTO product_categories (name, slug, description, image_url, sort_order, is_active)
VALUES 
('Fios de PDO', 'fios-de-pdo', 'Fios de sustentação e estímulo de colágeno', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', 1, true),
('Preenchedores', 'preenchedores', 'Ácido Hialurônico para volumização e contorno', 'https://images.unsplash.com/photo-1571781565025-a7b6a18d3b84', 2, true),
('Bioestimuladores', 'bioestimuladores', 'Estimuladores de colágeno injetáveis', 'https://images.unsplash.com/photo-1612817288484-9691c6e67a1a', 3, true),
('Toxinas', 'toxinas', 'Toxina Botulínica Tipo A', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f', 4, true),
('Descartáveis', 'descartaveis', 'Agulhas, cânulas e seringas', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Function to get category id by slug
CREATE OR REPLACE FUNCTION get_category_id(cat_slug TEXT)
RETURNS UUID AS $$
    SELECT id FROM product_categories WHERE slug = cat_slug LIMIT 1;
$$ LANGUAGE SQL;

-- Seeding Products (removed in_stock as it is a generated column)
INSERT INTO products (name, slug, description, long_description, price, stock, category_id, image_url, sku, rating, review_count, badge)
VALUES
-- Fios
('Fio PDO Liso 29G 38mm', 'fio-pdo-liso-29g-38mm', 'Fio liso para estímulo de colágeno em áreas delicadas.', 'Fio de Polidioxanona (PDO) Liso, indicado para bioestimulação de colágeno. Ideal para pálpebras, glabela e código de barras. Caixa com 20 unidades.', 189.90, 100, get_category_id('fios-de-pdo'), 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', 'PDO-L-2938', 4.8, 12, 'bestseller'),
('Fio PDO Espiculado 19G 100mm', 'fio-pdo-espiculado-19g-100mm', 'Fio de tração com garras bidirecionais.', 'Fio de Polidioxanona (PDO) Espiculado (Cog), indicado para lifting facial e corporal. Alta capacidade de tração. Canula L-Type. Pacote com 4 unidades.', 259.00, 50, get_category_id('fios-de-pdo'), 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', 'PDO-E-19100', 5.0, 8, 'new'),
('Fio PDO Parafuso 29G 38mm', 'fio-pdo-parafuso-29g-38mm', 'Fio screw para volumização sutil.', 'Fio de Polidioxanona (PDO) em formato de parafuso (Screw/Twister). Ideal para preenchimento de sulcos finos e estímulo intenso. Caixa com 20 unidades.', 210.50, 80, get_category_id('fios-de-pdo'), 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', 'PDO-S-2938', 4.6, 5, null),

-- Preenchedores
('HyaluroVol 1ml', 'hyalurovol-1ml', 'Ácido Hialurônico reticulado de alta densidade.', 'Preenchedor monofásico de alta viscosidade, indicado para mento, malar e mandíbula. Seringa de 1ml com 2 agulhas.', 450.00, 30, get_category_id('preenchedores'), 'https://images.unsplash.com/photo-1571781565025-a7b6a18d3b84', 'HYA-VOL-1', 4.9, 45, 'bestseller'),
('HyaluroLips 1ml', 'hyalurolips-1ml', 'Ácido Hialurônico para lábios e olheiras.', 'Preenchedor de média densidade, ideal para contorno e volume labial. Tecnologia cross-linked suave.', 399.90, 45, get_category_id('preenchedores'), 'https://images.unsplash.com/photo-1571781565025-a7b6a18d3b84', 'HYA-LIP-1', 4.8, 120, 'sale'),

-- Bioestimuladores
('Elleva 210mg', 'elleva-210mg', 'Ácido PLLA para corpo e face.', 'Bioestimulador de colágeno à base de Ácido Poli-L-Lático. Frasco com 210mg. Reconstituição imediata.', 1200.00, 20, get_category_id('bioestimuladores'), 'https://images.unsplash.com/photo-1612817288484-9691c6e67a1a', 'PLLA-210', 5.0, 15, null),
('Hidroxiapatita de Cálcio 1.25ml', 'hidroxiapatita-125', 'Bioestimulador para contorno e firmeza.', 'Seringa preenchida com microesferas de hidroxiapatita de cálcio. Efeito lifting imediato e duradouro.', 890.00, 25, get_category_id('bioestimuladores'), 'https://images.unsplash.com/photo-1612817288484-9691c6e67a1a', 'RAD-125', 4.7, 10, null),

-- Toxinas
('Botulift 100U', 'botulift-100u', 'Toxina botulínica de alta pureza.', 'Toxina Botulínica Tipo A. Frasco com 100 unidades. Conservação refrigerada.', 650.00, 60, get_category_id('toxinas'), 'https://images.unsplash.com/photo-1583947215259-38e31be8751f', 'BTX-100', 4.9, 200, 'bestseller'),

-- Descartáveis
('Cânula 22G 50mm cx/10', 'canula-22g-50mm', 'Microcânulas semiflexíveis.', 'Caixa com 10 unidades. Acompanha agulha de pertuito. Ideal para preenchimentos corporais.', 89.90, 150, get_category_id('descartaveis'), 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae', 'CAN-2250', 5.0, 30, null)

ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    updated_at = NOW();

-- Clean up helper function
DROP FUNCTION get_category_id;
