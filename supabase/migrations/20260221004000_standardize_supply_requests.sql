-- Add sector column to marketing_requests to allow shared use across all CRM sectors
ALTER TABLE marketing_requests
ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'marketing';
-- Update RLS policies to be more inclusive while maintaining security
-- Note: existing policies might need to be dropped or adjusted if they are too restrictive
-- Allow all authenticated users to insert requests (with their uid)
DROP POLICY IF EXISTS "Users can create requests" ON marketing_requests;
CREATE POLICY "Users can create requests" ON marketing_requests FOR
INSERT WITH CHECK (auth.uid() = created_by);
-- Allow users to view their own requests from any sector
DROP POLICY IF EXISTS "Users can view own requests" ON marketing_requests;
CREATE POLICY "Users can view own requests" ON marketing_requests FOR
SELECT USING (auth.uid() = created_by);
-- Allow Logistics and Admin to view all requests (as they process them)
CREATE POLICY "Logistics and Admin can view all" ON marketing_requests FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role IN (
                    'admin',
                    'logistica_manager',
                    'logistica_operator'
                )
        )
    );