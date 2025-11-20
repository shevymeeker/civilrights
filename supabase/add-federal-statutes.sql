-- Add Federal Statutes Table
-- Run this AFTER initial schema.sql to add federal statute support

-- =====================================================
-- FEDERAL STATUTES TABLE (USC Codes)
-- =====================================================
CREATE TABLE IF NOT EXISTS federal_statutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Code Identification
  code TEXT NOT NULL, -- e.g., "18 USC 242" or "42 USC 1983"
  title_number INTEGER, -- e.g., 18, 42
  section TEXT NOT NULL, -- e.g., "242", "1983"
  title_name TEXT, -- e.g., "Crimes and Criminal Procedure"

  -- Content
  heading TEXT NOT NULL, -- Section heading/title
  full_text TEXT NOT NULL,
  summary TEXT,

  -- Organization
  category TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Related Information
  related_cases UUID[] DEFAULT '{}',
  related_krs TEXT[] DEFAULT '{}',
  related_usc TEXT[] DEFAULT '{}', -- Related USC sections

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(code, '') || ' ' ||
      coalesce(heading, '') || ' ' ||
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
  updated_by TEXT,

  UNIQUE(code)
);

-- Create indexes
CREATE INDEX idx_federal_statutes_search ON federal_statutes USING GIN(search_vector);
CREATE INDEX idx_federal_statutes_tags ON federal_statutes USING GIN(tags);
CREATE INDEX idx_federal_statutes_code ON federal_statutes(code);
CREATE INDEX idx_federal_statutes_title ON federal_statutes(title_number);

-- Auto-update timestamp
CREATE TRIGGER update_federal_statutes_updated_at BEFORE UPDATE ON federal_statutes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Search function for federal statutes
CREATE OR REPLACE FUNCTION search_federal_statutes(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  code TEXT,
  heading TEXT,
  summary TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.code,
    f.heading,
    f.summary,
    ts_rank(f.search_vector, plainto_tsquery('english', search_query)) AS relevance
  FROM federal_statutes f
  WHERE f.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY relevance DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE federal_statutes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access to federal statutes" ON federal_statutes
  FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admin write access to federal statutes" ON federal_statutes
  FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON TABLE federal_statutes IS 'United States Code (USC) federal statutes database';

-- =====================================================
-- UPDATE SCENARIOS TABLE to track federal statute matches
-- =====================================================
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS matched_usc TEXT[] DEFAULT '{}';

COMMENT ON COLUMN scenarios.matched_usc IS 'Federal statutes (USC) matched in scenario analysis';

-- =====================================================
-- Commonly Referenced Federal Statutes (Seed Data)
-- =====================================================

-- 42 USC 1983 - Civil Rights violations by state actors
INSERT INTO federal_statutes (code, title_number, section, title_name, heading, full_text, category, tags, summary)
VALUES (
  '42 USC 1983',
  42,
  '1983',
  'The Public Health and Welfare',
  'Civil action for deprivation of rights',
  'Every person who, under color of any statute, ordinance, regulation, custom, or usage, of any State or Territory or the District of Columbia, subjects, or causes to be subjected, any citizen of the United States or other person within the jurisdiction thereof to the deprivation of any rights, privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured in an action at law, suit in equity, or other proper proceeding for redress...',
  ARRAY['Civil Rights', 'Constitutional Law'],
  ARRAY['civil-rights', 'constitutional-violations', 'state-actors', 'qualified-immunity'],
  'Allows citizens to sue state actors (police, officials) for constitutional violations'
)
ON CONFLICT (code) DO NOTHING;

-- 18 USC 242 - Criminal deprivation of rights under color of law
INSERT INTO federal_statutes (code, title_number, section, title_name, heading, full_text, category, tags, summary)
VALUES (
  '18 USC 242',
  18,
  '242',
  'Crimes and Criminal Procedure',
  'Deprivation of rights under color of law',
  'Whoever, under color of any law, statute, ordinance, regulation, or custom, willfully subjects any person in any State, Territory, Commonwealth, Possession, or District to the deprivation of any rights, privileges, or immunities secured or protected by the Constitution or laws of the United States...shall be fined under this title or imprisoned...',
  ARRAY['Criminal Law', 'Civil Rights'],
  ARRAY['civil-rights', 'police-misconduct', 'criminal-violations', 'excessive-force'],
  'Criminal statute for police/official violations of constitutional rights'
)
ON CONFLICT (code) DO NOTHING;

-- 18 USC 241 - Conspiracy against rights
INSERT INTO federal_statutes (code, title_number, section, title_name, heading, full_text, category, tags, summary)
VALUES (
  '18 USC 241',
  18,
  '241',
  'Crimes and Criminal Procedure',
  'Conspiracy against rights',
  'If two or more persons conspire to injure, oppress, threaten, or intimidate any person in any State, Territory, Commonwealth, Possession, or District in the free exercise or enjoyment of any right or privilege secured to him by the Constitution or laws of the United States, or because of his having so exercised the same...they shall be fined under this title or imprisoned...',
  ARRAY['Criminal Law', 'Civil Rights'],
  ARRAY['conspiracy', 'civil-rights', 'constitutional-violations'],
  'Criminal conspiracy to violate constitutional rights'
)
ON CONFLICT (code) DO NOTHING;

-- 18 USC 2340A - Torture
INSERT INTO federal_statutes (code, title_number, section, title_name, heading, full_text, category, tags, summary)
VALUES (
  '18 USC 2340A',
  18,
  '2340A',
  'Crimes and Criminal Procedure',
  'Torture',
  'Whoever outside the United States commits or attempts to commit torture shall be fined under this title or imprisoned not more than 20 years, or both, and if death results to any person from conduct prohibited by this subsection, shall be punished by death or imprisoned for any term of years or for life...',
  ARRAY['Criminal Law', 'Human Rights'],
  ARRAY['torture', 'cruel-punishment', 'human-rights'],
  'Federal prohibition on torture'
)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE federal_statutes IS 'United States Code (USC) - Federal statutory law including civil rights statutes like 42 USC 1983 and 18 USC 242';
