-- Migration: Active Directory Integration
-- Description: Adds support for AD synchronization with employees table
-- Date: 2026-02-09

-- ============================================================================
-- 1. Add AD sync columns to employees table
-- ============================================================================

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS ad_object_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'manual' CHECK (sync_status IN ('manual', 'synced', 'pending', 'error'));

COMMENT ON COLUMN employees.ad_object_id IS 'Unique identifier from Active Directory (objectId)';
COMMENT ON COLUMN employees.synced_at IS 'Timestamp of last successful sync with AD';
COMMENT ON COLUMN employees.sync_status IS 'Sync status: manual (created manually), synced (from AD), pending (awaiting sync), error (sync failed)';

-- ============================================================================
-- 2. Create AD sync log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'deleted', 'bulk_import')),
    ad_object_id TEXT NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
    details JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_sync_log_ad_object_id ON ad_sync_log(ad_object_id);
CREATE INDEX IF NOT EXISTS idx_ad_sync_log_created_at ON ad_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_sync_log_status ON ad_sync_log(status);

COMMENT ON TABLE ad_sync_log IS 'Log of all Active Directory synchronization events';
COMMENT ON COLUMN ad_sync_log.event_type IS 'Type of AD event that triggered the sync';
COMMENT ON COLUMN ad_sync_log.details IS 'JSON payload with full AD user data and changes';

-- ============================================================================
-- 3. Create AD department mapping table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_department_mapping (
    ad_department_name TEXT PRIMARY KEY,
    crm_department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ad_department_mapping IS 'Maps Active Directory department names to CRM departments';

-- Insert default mappings (adjust based on your AD structure)
INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Comercial', id FROM departments WHERE name = 'Comercial'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Comercial');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'TI', id FROM departments WHERE name = 'Tech/TI'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'TI');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Marketing', id FROM departments WHERE name = 'Marketing'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Marketing');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'RH', id FROM departments WHERE name = 'RH'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'RH');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Financeiro', id FROM departments WHERE name = 'Financeiro'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Financeiro');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Compras', id FROM departments WHERE name = 'Compras'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Compras');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Logística', id FROM departments WHERE name = 'Logística'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Logística');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Científica', id FROM departments WHERE name = 'Científica'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Científica');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'E-commerce', id FROM departments WHERE name = 'E-commerce'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'E-commerce');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Jurídico', id FROM departments WHERE name = 'Jurídico'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Jurídico');

INSERT INTO ad_department_mapping (ad_department_name, crm_department_id)
SELECT 'Manutenção', id FROM departments WHERE name = 'Manutenção'
WHERE NOT EXISTS (SELECT 1 FROM ad_department_mapping WHERE ad_department_name = 'Manutenção');

-- ============================================================================
-- 4. Create AD sync configuration table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_sync_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ad_sync_config IS 'Configuration settings for AD synchronization';

-- Insert default configuration
INSERT INTO ad_sync_config (config_key, config_value, description)
VALUES 
    ('sync_enabled', 'true'::jsonb, 'Enable/disable automatic AD synchronization'),
    ('sync_interval_minutes', '15'::jsonb, 'Interval for polling AD changes (if not using webhooks)'),
    ('auto_create_auth_users', 'true'::jsonb, 'Automatically create Supabase auth users for new employees'),
    ('default_user_role', '"employee"'::jsonb, 'Default role for new users created from AD')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- 5. Create function to get department by AD name
-- ============================================================================

CREATE OR REPLACE FUNCTION get_department_id_from_ad(ad_dept_name TEXT)
RETURNS UUID AS $$
DECLARE
    dept_id UUID;
BEGIN
    SELECT crm_department_id INTO dept_id
    FROM ad_department_mapping
    WHERE LOWER(ad_department_name) = LOWER(ad_dept_name)
    AND is_active = true;
    
    RETURN dept_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_department_id_from_ad IS 'Maps AD department name to CRM department ID';

-- ============================================================================
-- 6. Create function to log sync events
-- ============================================================================

CREATE OR REPLACE FUNCTION log_ad_sync_event(
    p_event_type TEXT,
    p_ad_object_id TEXT,
    p_employee_id UUID,
    p_status TEXT,
    p_details JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO ad_sync_log (
        event_type,
        ad_object_id,
        employee_id,
        status,
        details,
        error_message
    ) VALUES (
        p_event_type,
        p_ad_object_id,
        p_employee_id,
        p_status,
        p_details,
        p_error_message
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_ad_sync_event IS 'Logs AD synchronization events for auditing';

-- ============================================================================
-- 7. Create view for sync dashboard
-- ============================================================================

CREATE OR REPLACE VIEW ad_sync_dashboard AS
SELECT 
    COUNT(*) FILTER (WHERE sync_status = 'synced') as synced_employees,
    COUNT(*) FILTER (WHERE sync_status = 'manual') as manual_employees,
    COUNT(*) FILTER (WHERE sync_status = 'error') as error_employees,
    COUNT(*) FILTER (WHERE sync_status = 'pending') as pending_employees,
    MAX(synced_at) as last_sync_time,
    (
        SELECT COUNT(*) 
        FROM ad_sync_log 
        WHERE created_at > NOW() - INTERVAL '24 hours'
    ) as syncs_last_24h,
    (
        SELECT COUNT(*) 
        FROM ad_sync_log 
        WHERE status = 'error' 
        AND created_at > NOW() - INTERVAL '24 hours'
    ) as errors_last_24h
FROM employees;

COMMENT ON VIEW ad_sync_dashboard IS 'Dashboard metrics for AD synchronization status';

-- ============================================================================
-- 8. Create RLS policies for new tables
-- ============================================================================

-- Enable RLS
ALTER TABLE ad_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_department_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sync_config ENABLE ROW LEVEL SECURITY;

-- ad_sync_log policies (admin and HR only)
CREATE POLICY "Admin and HR can view sync logs"
    ON ad_sync_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'rh')
        )
    );

-- ad_department_mapping policies (admin only for modifications)
CREATE POLICY "Everyone can view department mappings"
    ON ad_department_mapping FOR SELECT
    USING (true);

CREATE POLICY "Only admin can modify department mappings"
    ON ad_department_mapping FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ad_sync_config policies (admin only)
CREATE POLICY "Only admin can view sync config"
    ON ad_sync_config FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admin can modify sync config"
    ON ad_sync_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- 9. Grant permissions
-- ============================================================================

GRANT SELECT ON ad_sync_log TO authenticated;
GRANT SELECT ON ad_department_mapping TO authenticated;
GRANT SELECT ON ad_sync_config TO authenticated;
GRANT SELECT ON ad_sync_dashboard TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify migration
DO $$
BEGIN
    RAISE NOTICE 'Active Directory integration schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure Azure AD application';
    RAISE NOTICE '2. Create Supabase Edge Function for webhooks';
    RAISE NOTICE '3. Update department mappings if needed';
    RAISE NOTICE '4. Run initial bulk import';
END $$;
