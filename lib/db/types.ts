export interface Organization {
  id: string;
  name: string;
  plan_tier: "free" | "pro" | "enterprise";
  monthly_token_quota: number;
  c2pa_signing_key_id: string;
  spending_limit_usd: number;
  created_at: string;
}

export interface Workspace {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  brand_vector: number[]; // 1536-dimensional embedding
  autonomy_level: "auto" | "copilot" | "supervised";
  cliche_blacklist: string[];
  created_at: string;
}

export interface UserRBAC {
  id: string;
  workspace_id: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  api_key_hash: string;
  rate_limit_per_min: number;
  last_login_at?: string;
}

export interface PersonaMemory {
  id: string;
  workspace_id: string;
  memory_type: "style" | "voice" | "rule";
  embedding: number[];
  exemplar_text: string;
  veritas_pass_rate: number;
  created_at: string;
}

export interface SwarmRun {
  id: string;
  workspace_id: string;
  concept_prompt: string;
  dag_state: Record<string, any>;
  status: "queued" | "running" | "completed" | "failed";
  total_cost_usd: number;
  sse_stream_id: string;
  created_at: string;
}

export interface SwarmTask {
  id: string;
  swarm_run_id: string;
  agent_role: string;
  model_engine: string;
  input_context: Record<string, any>;
  output_result?: Record<string, any>;
  status: "idle" | "running" | "completed" | "failed";
  execution_ms: number;
  created_at: string;
}

export interface GroundingClaim {
  id: string;
  task_id: string;
  claim_statement: string;
  source_url: string;
  doi_citation?: string;
  confidence_score: number;
  verification_status: "verified" | "rejected" | "pending";
  created_at: string;
}

export interface ModalityArtifact {
  id: string;
  task_id: string;
  modality: "video" | "audio" | "code" | "text";
  storage_s3_url: string;
  payload: Record<string, any>;
  ast_syntax_valid: boolean;
  c2pa_manifest_id?: string;
  created_at: string;
}

export interface VeritasEvaluation {
  id: string;
  artifact_id: string;
  composite_vqs: number;
  factuality_score: number;
  brand_tone_score: number;
  consensus_score: number;
  safety_policy_passed: boolean;
  humanization_score: number;
  gate_decision: "pass" | "repair" | "review";
  created_at: string;
}

export interface DefectDiffReport {
  id: string;
  evaluation_id: string;
  failing_segment_idx: number;
  error_category: "fact" | "tone" | "ast" | "pii";
  observed_fault_text: string;
  ground_truth_patch: string;
  iteration_attempt: number;
  created_at: string;
}

export interface VeritasCertificate {
  id: string;
  evaluation_id: string;
  ed25519_signature: string;
  c2pa_manifest_hash: string;
  sha256_root_checksum: string;
  signer_public_key_id: string;
  issued_at: string;
}

export interface PublishDispatch {
  id: string;
  cert_id: string;
  channel: "youtube" | "linkedin" | "x" | "substack";
  external_post_id: string;
  delivery_status: "sent" | "scheduled" | "failed";
  error_response?: string;
  published_at: string;
}
