-- SEED_INVENTORY_DATA.sql
-- Adiciona dados de teste para Depósitos e Estoque se as tabelas estiverem vazias.

-- 1. Garante que existam depósitos
INSERT INTO public.warehouses (name, address, is_active, sap_warehouse_code)
VALUES 
    ('CD Principal - São Paulo', 'Av. Paulista, 1000, SP', true, 'WRH-001'),
    ('Filial - Rio de Janeiro', 'Rua da Assembleia, 10, RJ', true, 'WRH-002')
ON CONFLICT (sap_warehouse_code) DO NOTHING;

-- 2. Garante que existam itens no estoque (Usando SKUs comuns da MedBeauty)
-- Nota: product_id aqui é o código do SAP, não o UUID da tabela products para este modelo.
INSERT INTO public.inventory (product_id, warehouse_id, sku, quantity_available, quantity_reserved, min_stock, location)
SELECT 'P-PREENCH-HYA', id, 'SKU-HYA-001', 150, 10, 50, 'PR-A1' FROM public.warehouses WHERE sap_warehouse_code = 'WRH-001'
ON CONFLICT DO NOTHING;

INSERT INTO public.inventory (product_id, warehouse_id, sku, quantity_available, quantity_reserved, min_stock, location)
SELECT 'P-TOXIN-BOT', id, 'SKU-BOT-002', 8, 2, 10, 'GE-B2' FROM public.warehouses WHERE sap_warehouse_code = 'WRH-001'
ON CONFLICT DO NOTHING;

INSERT INTO public.inventory (product_id, warehouse_id, sku, quantity_available, quantity_reserved, min_stock, location)
SELECT 'P-SKIN-DERM', id, 'SKU-DERM-003', 45, 0, 20, 'SK-C3' FROM public.warehouses WHERE sap_warehouse_code = 'WRH-002'
ON CONFLICT DO NOTHING;
