-- Kentucky Legal Research Platform - Database Schema
-- Supabase PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CASE LAW TABLE
-- =====================================================
CREATE TABLE case_law (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Case Identification
  case_name TEXT,
  citation TEXT,
  full_title TEXT NOT NULL,
  year INTEGER,
  court TEXT,

  -- Case Content
  facts TEXT,
  issue TEXT,
  holding TEXT,
  discussion TEXT,
  full_text TEXT,

  -- Organization
  category TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Related Information
  related_krs TEXT[] DEFAULT '{}',
  related_cases UUID[] DEFAULT '{}',

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(case_name, '') || ' ' ||
      coalesce(citation, '') || ' ' ||
      coalesce(full_title, '') || ' ' ||
      coalesce(facts, '') || ' ' ||
      coalesce(issue, '') || ' ' ||
      coalesce(holding, '') || ' ' ||
      coalesce(discussion, '') || ' ' ||
      coalesce(full_text, '')
    )
  ) STORED,

  -- Metadata
  importance INTEGER DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Create index for full-text search
CREATE INDEX idx_case_law_search ON case_law USING GIN(search_vector);
CREATE INDEX idx_case_law_tags ON case_law USING GIN(tags);
CREATE INDEX idx_case_law_category ON case_law(category);
CREATE INDEX idx_case_law_importance ON case_law(importance);

-- =====================================================
-- KRS CODES TABLE
-- =====================================================
CREATE TABLE krs_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Code Identification
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  chapter TEXT,
  section TEXT,

  -- Content
  full_text TEXT NOT NULL,
  summary TEXT,

  -- Organization
  category TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Related Information
  related_cases UUID[] DEFAULT '{}',
  related_krs TEXT[] DEFAULT '{}',

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(code, '') || ' ' ||
      coalesce(title, '') || ' ' ||
      coalesce(full_text, '') || ' ' ||
      coalesce(summary, '')
    )
  ) STORED,

  -- Metadata
  effective_date DATE,
  amended_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Create indexes
CREATE INDEX idx_krs_search ON krs_codes USING GIN(search_vector);
CREATE INDEX idx_krs_tags ON krs_codes USING GIN(tags);
CREATE INDEX idx_krs_code ON krs_codes(code);

-- =====================================================
-- SCENARIOS TABLE (User searches for analytics)
-- =====================================================
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Input
  scenario_text TEXT NOT NULL,

  -- AI Response
  ai_response JSONB,
  matched_cases UUID[],
  matched_krs TEXT[],

  -- Feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  was_helpful BOOLEAN,
  user_feedback TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_scenarios_created_at ON scenarios(created_at);
CREATE INDEX idx_scenarios_rating ON scenarios(user_rating);

-- =====================================================
-- ADMIN USERS TABLE (for authentication)
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_admin_email ON admin_users(email);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_case_law_updated_at BEFORE UPDATE ON case_law
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_krs_codes_updated_at BEFORE UPDATE ON krs_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEARCH FUNCTIONS
-- =====================================================

-- Search case law by keyword
CREATE OR REPLACE FUNCTION search_case_law(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  case_name TEXT,
  citation TEXT,
  holding TEXT,
  importance INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.case_name,
    c.citation,
    c.holding,
    c.importance,
    ts_rank(c.search_vector, plainto_tsquery('english', search_query)) AS relevance
  FROM case_law c
  WHERE c.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY importance DESC, relevance DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Search KRS codes by keyword
CREATE OR REPLACE FUNCTION search_krs(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  code TEXT,
  title TEXT,
  summary TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.code,
    k.title,
    k.summary,
    ts_rank(k.search_vector, plainto_tsquery('english', search_query)) AS relevance
  FROM krs_codes k
  WHERE k.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY relevance DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE case_law ENABLE ROW LEVEL SECURITY;
ALTER TABLE krs_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access to case law and KRS
CREATE POLICY "Public read access to case law" ON case_law FOR SELECT USING (true);
CREATE POLICY "Public read access to KRS codes" ON krs_codes FOR SELECT USING (true);

-- Only authenticated admins can modify
CREATE POLICY "Admin write access to case law" ON case_law FOR ALL
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access to KRS codes" ON krs_codes FOR ALL
  USING (auth.role() = 'authenticated');

-- Anyone can create scenarios (for public use)
CREATE POLICY "Public can create scenarios" ON scenarios FOR INSERT WITH CHECK (true);

-- =====================================================
-- INITIAL DATA COMMENTS
-- =====================================================
COMMENT ON TABLE case_law IS 'Supreme Court and Kentucky case law database';
COMMENT ON TABLE krs_codes IS 'Kentucky Revised Statutes database';
COMMENT ON TABLE scenarios IS 'User scenario searches for analytics and improvement';
COMMENT ON TABLE admin_users IS 'Admin panel user authentication';
