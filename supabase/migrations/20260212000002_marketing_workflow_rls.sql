-- Migration to update marketing_requests policies and workflow
-- Statuses: pending -> approved -> in_progress -> completed

-- Policy: Logistics can view approved requests
CREATE POLICY "Logistics can view approved"
  ON marketing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'logistica')
    )
    AND status IN ('approved', 'in_progress', 'completed')
  );

-- Policy: Logistics can update approved requests (separator/deliver)
CREATE POLICY "Logistics can update requests"
  ON marketing_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'logistica')
    )
  );

-- Ensure all authenticated users can create requests (Any collaborator)
DROP POLICY IF EXISTS "Users can create requests" ON marketing_requests;
CREATE POLICY "Users can create requests"
  ON marketing_requests
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Ensure all authenticated users can view their own requests
DROP POLICY IF EXISTS "Users can view own requests" ON marketing_requests;
CREATE POLICY "Users can view own requests"
  ON marketing_requests
  FOR SELECT
  USING (auth.uid() = created_by);
