-- Create marketing_requests table for event material requests
CREATE TABLE IF NOT EXISTS marketing_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id TEXT UNIQUE NOT NULL,
  event_name TEXT NOT NULL,
  consultant_name TEXT NOT NULL,
  regional_manager TEXT NOT NULL,
  event_date DATE NOT NULL,
  kit_type TEXT NOT NULL,
  has_thread_order BOOLEAN DEFAULT false,
  bonus_order_number TEXT,
  cep TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  extra_materials TEXT,
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE marketing_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON marketing_requests
  FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Users can create requests
CREATE POLICY "Users can create requests"
  ON marketing_requests
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Marketing managers can view all requests
CREATE POLICY "Marketing managers can view all"
  ON marketing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'marketing_manager')
    )
  );

-- Policy: Marketing managers can update requests
CREATE POLICY "Marketing managers can update"
  ON marketing_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'marketing_manager')
    )
  );

-- Create index for faster queries
CREATE INDEX idx_marketing_requests_created_by ON marketing_requests(created_by);
CREATE INDEX idx_marketing_requests_status ON marketing_requests(status);
CREATE INDEX idx_marketing_requests_request_id ON marketing_requests(request_id);
CREATE INDEX idx_marketing_requests_event_date ON marketing_requests(event_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_marketing_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_requests_updated_at
  BEFORE UPDATE ON marketing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_requests_updated_at();
