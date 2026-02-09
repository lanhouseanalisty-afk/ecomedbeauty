
-- UPDATE_ENUM_TYPE.sql
-- Adiciona o valor 'chip' ao enum tech_device_type

ALTER TYPE tech_device_type ADD VALUE IF NOT EXISTS 'chip';
