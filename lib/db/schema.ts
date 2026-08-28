export const SQLITE_SCHEMA = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'pro',
  monthly_token_quota INTEGER DEFAULT 10000000,
  c2pa_signing_key_id TEXT,
  spending_limit_usd REAL DEFAULT 1000.00,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 2. workspaces (Persona containers)
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  brand_vector TEXT, -- JSON array of 1536 floats
  autonomy_level TEXT DEFAULT 'auto',
  cliche_blacklist TEXT DEFAULT '["delve","tapestry","game-changer"]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. users_rbac
CREATE TABLE IF NOT EXISTS users_rbac (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'editor',
  api_key_hash TEXT,
  rate_limit_per_min INTEGER DEFAULT 60,
  last_login_at TEXT
);

-- 4. persona_memories (Vector Vault)
CREATE TABLE IF NOT EXISTS persona_memories (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  memory_type TEXT DEFAULT 'style',
  embedding TEXT NOT NULL, -- JSON array of 1536 floats
  exemplar_text TEXT,
  veritas_pass_rate REAL DEFAULT 95.0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 5. swarm_runs (Master DAG Pipeline)
CREATE TABLE IF NOT EXISTS swarm_runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  concept_prompt TEXT NOT NULL,
  dag_state TEXT, -- JSONB
  status TEXT DEFAULT 'queued',
  total_cost_usd REAL DEFAULT 0.0,
  sse_stream_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 6. swarm_tasks (Agent Execution Nodes)
CREATE TABLE IF NOT EXISTS swarm_tasks (
  id TEXT PRIMARY KEY,
  swarm_run_id TEXT NOT NULL REFERENCES swarm_runs(id) ON DELETE CASCADE,
  agent_role TEXT NOT NULL,
  model_engine TEXT,
  input_context TEXT, -- JSONB
  output_result TEXT, -- JSONB
  status TEXT DEFAULT 'idle',
  execution_ms INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 7. grounding_claims (Fact Registry)
CREATE TABLE IF NOT EXISTS grounding_claims (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  claim_statement TEXT NOT NULL,
  source_url TEXT,
  doi_citation TEXT,
  confidence_score REAL DEFAULT 99.0,
  verification_status TEXT DEFAULT 'verified',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 8. modality_artifacts (Generated Stems)
CREATE TABLE IF NOT EXISTS modality_artifacts (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  modality TEXT NOT NULL,
  storage_s3_url TEXT,
  payload TEXT, -- JSONB
  ast_syntax_valid INTEGER DEFAULT 1,
  c2pa_manifest_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 9. veritas_evaluations (5-Axis Audit)
CREATE TABLE IF NOT EXISTS veritas_evaluations (
  id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES modality_artifacts(id) ON DELETE CASCADE,
  composite_vqs REAL NOT NULL,
  factuality_score REAL NOT NULL,
  brand_tone_score REAL NOT NULL,
  consensus_score REAL NOT NULL,
  safety_policy_passed INTEGER DEFAULT 1,
  humanization_score REAL NOT NULL,
  gate_decision TEXT DEFAULT 'pass',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 10. defect_diff_reports (Auto-Repair)
CREATE TABLE IF NOT EXISTS defect_diff_reports (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES veritas_evaluations(id) ON DELETE CASCADE,
  failing_segment_idx INTEGER,
  error_category TEXT,
  observed_fault_text TEXT,
  ground_truth_patch TEXT,
  iteration_attempt INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 11. veritas_certificates (Signed VQC)
CREATE TABLE IF NOT EXISTS veritas_certificates (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES veritas_evaluations(id) ON DELETE CASCADE,
  ed25519_signature TEXT NOT NULL,
  c2pa_manifest_hash TEXT NOT NULL,
  sha256_root_checksum TEXT NOT NULL,
  signer_public_key_id TEXT,
  issued_at TEXT DEFAULT (datetime('now'))
);

-- 13. studio_series_tracks (Saved Series & Clips Library)
CREATE TABLE IF NOT EXISTS studio_series_tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT DEFAULT 'anime',
  character TEXT NOT NULL,
  video_src TEXT NOT NULL,
  duration REAL NOT NULL DEFAULT 56.0,
  acts_json TEXT NOT NULL,
  veritas_status TEXT DEFAULT 'CERTIFIED_VALID',
  snark_proof_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`;

export const POSTGRES_SCHEMA = `
-- Extension for 1536-dimensional vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  plan_tier VARCHAR(32) DEFAULT 'pro',
  monthly_token_quota BIGINT DEFAULT 10000000,
  c2pa_signing_key_id TEXT,
  spending_limit_usd NUMERIC(10,2) DEFAULT 1000.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  brand_vector VECTOR(1536),
  autonomy_level VARCHAR(32) DEFAULT 'auto',
  cliche_blacklist TEXT[] DEFAULT ARRAY['delve', 'tapestry', 'game-changer'],
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_brand_vector ON workspaces USING ivfflat (brand_vector vector_cosine_ops);

-- 3. users_rbac
CREATE TABLE IF NOT EXISTS users_rbac (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(32) DEFAULT 'editor',
  api_key_hash VARCHAR(64),
  rate_limit_per_min INT DEFAULT 60,
  last_login_at TIMESTAMPTZ
);

-- 4. persona_memories
CREATE TABLE IF NOT EXISTS persona_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  memory_type VARCHAR(32) DEFAULT 'style',
  embedding VECTOR(1536) NOT NULL,
  exemplar_text TEXT,
  veritas_pass_rate NUMERIC(5,2) DEFAULT 95.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. swarm_runs
CREATE TABLE IF NOT EXISTS swarm_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  concept_prompt TEXT NOT NULL,
  dag_state JSONB,
  status VARCHAR(32) DEFAULT 'queued',
  total_cost_usd NUMERIC(8,4) DEFAULT 0.0,
  sse_stream_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. swarm_tasks
CREATE TABLE IF NOT EXISTS swarm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swarm_run_id UUID NOT NULL REFERENCES swarm_runs(id) ON DELETE CASCADE,
  agent_role VARCHAR(64) NOT NULL,
  model_engine VARCHAR(64),
  input_context JSONB,
  output_result JSONB,
  status VARCHAR(32) DEFAULT 'idle',
  execution_ms INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. grounding_claims
CREATE TABLE IF NOT EXISTS grounding_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  claim_statement TEXT NOT NULL,
  source_url TEXT,
  doi_citation VARCHAR(100),
  confidence_score NUMERIC(5,2) DEFAULT 99.0,
  verification_status VARCHAR(32) DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. modality_artifacts
CREATE TABLE IF NOT EXISTS modality_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  modality VARCHAR(32) NOT NULL,
  storage_s3_url TEXT,
  payload JSONB,
  ast_syntax_valid BOOLEAN DEFAULT TRUE,
  c2pa_manifest_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. veritas_evaluations
CREATE TABLE IF NOT EXISTS veritas_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES modality_artifacts(id) ON DELETE CASCADE,
  composite_vqs NUMERIC(5,2) NOT NULL,
  factuality_score NUMERIC(5,2) NOT NULL,
  brand_tone_score NUMERIC(5,2) NOT NULL,
  consensus_score NUMERIC(5,2) NOT NULL,
  safety_policy_passed BOOLEAN DEFAULT TRUE,
  humanization_score NUMERIC(5,2) NOT NULL,
  gate_decision VARCHAR(32) DEFAULT 'pass',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. defect_diff_reports
CREATE TABLE IF NOT EXISTS defect_diff_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES veritas_evaluations(id) ON DELETE CASCADE,
  failing_segment_idx INT,
  error_category VARCHAR(32),
  observed_fault_text TEXT,
  ground_truth_patch TEXT,
  iteration_attempt INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. veritas_certificates
CREATE TABLE IF NOT EXISTS veritas_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES veritas_evaluations(id) ON DELETE CASCADE,
  ed25519_signature TEXT NOT NULL,
  c2pa_manifest_hash VARCHAR(64) NOT NULL,
  sha256_root_checksum VARCHAR(64) NOT NULL,
  signer_public_key_id TEXT,
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- 12. publish_dispatches
CREATE TABLE IF NOT EXISTS publish_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id UUID NOT NULL REFERENCES veritas_certificates(id) ON DELETE CASCADE,
  channel VARCHAR(32) NOT NULL,
  external_post_id VARCHAR(255),
  delivery_status VARCHAR(32) DEFAULT 'sent',
  error_response JSONB,
  published_at TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security (RLS) Policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_runs ENABLE ROW LEVEL SECURITY;
`;
