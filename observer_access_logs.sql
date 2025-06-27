-- Create observer_access_logs table for tracking observer activity
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE observer_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observer_id UUID NOT NULL REFERENCES observers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_observer_access_logs_observer_id ON observer_access_logs(observer_id);
CREATE INDEX idx_observer_access_logs_accessed_at ON observer_access_logs(accessed_at);
CREATE INDEX idx_observer_access_logs_action ON observer_access_logs(action);

-- Enable Row Level Security (RLS)
ALTER TABLE observer_access_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for observer_access_logs table
-- Observers can only see their own access logs
CREATE POLICY "Observers can view their own access logs" ON observer_access_logs
  FOR SELECT USING (
    observer_id IN (
      SELECT id FROM observers 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Grant access users can insert logs for observers they granted access to
CREATE POLICY "Grant access users can insert access logs" ON observer_access_logs
  FOR INSERT WITH CHECK (
    observer_id IN (
      SELECT id FROM observers 
      WHERE granted_by = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE observer_access_logs IS 'Stores access logs for observer activities';
COMMENT ON COLUMN observer_access_logs.action IS 'The action performed (e.g., view_document, view_report)';
COMMENT ON COLUMN observer_access_logs.resource IS 'The resource accessed (e.g., opportunity_details, financial_report)'; 