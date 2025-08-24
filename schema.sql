-- Forward Horizon AI Agent Database Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leads table (if not exists from lead API)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(100) DEFAULT 'website',
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add constraints
  CONSTRAINT leads_name_check CHECK (length(trim(name)) > 0),
  CONSTRAINT leads_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'))
);

-- Create agent memories table
CREATE TABLE IF NOT EXISTS agent_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'system',
  importance VARCHAR(20) NOT NULL DEFAULT 'medium',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT memories_type_check CHECK (type IN ('conversation', 'lead', 'action', 'business', 'research', 'system')),
  CONSTRAINT memories_importance_check CHECK (importance IN ('low', 'medium', 'high', 'critical'))
);

-- Create lead interactions table
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_data JSONB NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT interactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

-- Create business metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
-- Leads table indexes
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_source_idx ON leads(source);

-- Agent memories indexes
CREATE INDEX IF NOT EXISTS memories_type_idx ON agent_memories(type);
CREATE INDEX IF NOT EXISTS memories_importance_idx ON agent_memories(importance);
CREATE INDEX IF NOT EXISTS memories_created_at_idx ON agent_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS memories_expires_at_idx ON agent_memories(expires_at) WHERE expires_at IS NOT NULL;

-- Lead interactions indexes
CREATE INDEX IF NOT EXISTS lead_interactions_lead_id_idx ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS lead_interactions_type_status_idx ON lead_interactions(interaction_type, status);
CREATE INDEX IF NOT EXISTS lead_interactions_scheduled_idx ON lead_interactions(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Business metrics indexes
CREATE INDEX IF NOT EXISTS business_metrics_type_date_idx ON business_metrics(metric_type, date);
CREATE INDEX IF NOT EXISTS business_metrics_name_date_idx ON business_metrics(metric_name, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memories_updated_at ON agent_memories;
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON agent_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interactions_updated_at ON lead_interactions;
CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON lead_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metrics_updated_at ON business_metrics;
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON business_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous inserts for leads (for lead capture)
CREATE POLICY "Allow anonymous lead creation" ON leads
  FOR INSERT WITH CHECK (true);

-- Policy to allow service role all operations on all tables
CREATE POLICY "Allow service role all operations on leads" ON leads
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role all operations on memories" ON agent_memories
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role all operations on interactions" ON lead_interactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role all operations on metrics" ON business_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create views for analytics
CREATE OR REPLACE VIEW lead_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as count,
  COUNT(DISTINCT email) FILTER (WHERE email IS NOT NULL) as unique_emails,
  source,
  status
FROM leads
GROUP BY DATE_TRUNC('day', created_at), source, status
ORDER BY date DESC;

CREATE OR REPLACE VIEW memory_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  type,
  importance,
  COUNT(*) as count
FROM agent_memories
GROUP BY DATE_TRUNC('day', created_at), type, importance
ORDER BY date DESC;

CREATE OR REPLACE VIEW interaction_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  interaction_type,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_completion_hours
FROM lead_interactions
WHERE completed_at IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at), interaction_type, status
ORDER BY date DESC;

-- Grant permissions on views
GRANT SELECT ON lead_analytics TO anon, authenticated;
GRANT SELECT ON memory_analytics TO anon, authenticated;
GRANT SELECT ON interaction_analytics TO anon, authenticated;

-- Add sample data (optional - remove in production)
-- INSERT INTO leads (name, email, phone, source) VALUES 
--   ('John Doe', 'john@example.com', '555-0123', 'website'),
--   ('Jane Smith', 'jane@example.com', '555-0456', 'website');

-- INSERT INTO agent_memories (content, type, importance) VALUES
--   ('AI Agent system initialized successfully', 'system', 'high'),
--   ('Database schema created and configured', 'system', 'medium');

-- Show table info
\d+ leads;
\d+ agent_memories;
\d+ lead_interactions;
\d+ business_metrics;

-- Show indexes
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE tablename IN ('leads', 'agent_memories', 'lead_interactions', 'business_metrics')
ORDER BY tablename, indexname;