// lib/reel/omniPlanGate.ts
// Omni execution-plan authorization and remediation helpers.

import type { OmniExecutionPlan, OmniRemediationDirective, OmniPlanNode } from "./omniExecutionPlan";
import { buildOmniExecutionPlan, issueOmniPlanToken } from "./omniExecutionPlan";

export interface ProductionControlRow {
  production_id: string;
  generation_token: string;
  omni_plan_token: string | null;
  omni_plan_json: OmniExecutionPlan | string | null;
  cancelled_at?: string | null;
  superseded_by?: string | null;
}

export interface OmniAuthorizedOp {
  id: string;
  kind: string;
  production_id: string;
  target_id?: string | null;
  payload_json?: {
    generationToken?: string;
    omniPlanToken?: string;
    omniNodeId?: string;
    [k: string]: unknown;
  } | null;
}

export class OmniAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OmniAuthorizationError";
  }
}

function parsePlan(row: ProductionControlRow): OmniExecutionPlan | null {
  if (!row.omni_plan_json) return null;
  if (typeof row.omni_plan_json === "string") {
    try { return JSON.parse(row.omni_plan_json) as OmniExecutionPlan; } catch { return null; }
  }
  return row.omni_plan_json;
}

export function assertAuthorizedByOmniPlan(op: OmniAuthorizedOp, control: ProductionControlRow): OmniPlanNode {
  if (!control.omni_plan_token) {
    throw new OmniAuthorizationError(
      `OPERATION_CANCELLED: production ${op.production_id} has no Omni plan. No model may run without an Omni-authorized plan.`
    );
  }
  const opToken = String(op.payload_json?.omniPlanToken || "");
  if (opToken !== control.omni_plan_token) {
    throw new OmniAuthorizationError(
      `OPERATION_CANCELLED: op ${op.id} carries stale Omni plan token; a newer Omni plan supersedes it.`
    );
  }
  const plan = parsePlan(control);
  if (!plan) {
    throw new OmniAuthorizationError(
      `OPERATION_CANCELLED: Omni plan for ${op.production_id} is unreadable; refusing to execute unplanned work.`
    );
  }
  const nodeId = String(op.payload_json?.omniNodeId || "");
  const node = plan.nodes.find(n => n.id === nodeId);
  if (!node) {
    throw new OmniAuthorizationError(
      `OPERATION_CANCELLED: op ${op.id} (${op.kind}) maps to no node in the current Omni plan. Omni did not authorize this work.`
    );
  }
  return node;
}

export function planRemediation(
  directive: OmniRemediationDirective,
  ctx: { plan: OmniExecutionPlan; productionId: string }
):
  | { effect: "pass" }
  | { effect: "surgical_fix"; op: string; params: Record<string, unknown> }
  | { effect: "requeue_shot"; shotId: string }
  | { effect: "regen_reel"; newPlanToken: string } {
  switch (directive.action) {
    case "pass":
      return { effect: "pass" };
    case "surgical_fix":
      return { effect: "surgical_fix", op: directive.op, params: directive.params };
    case "regen_clip":
      return { effect: "requeue_shot", shotId: directive.targetShotId };
    case "regen_reel": {
      const newToken = issueOmniPlanToken(ctx.productionId, ctx.plan.nodes) + "_r" + Date.now().toString(36);
      return { effect: "regen_reel", newPlanToken: newToken };
    }
  }
}

export function initialOmniControlColumns(args: Parameters<typeof buildOmniExecutionPlan>[0]) {
  const plan = buildOmniExecutionPlan(args);
  return {
    omni_plan_token: plan.planToken,
    omni_plan_json: JSON.stringify(plan),
    plan,
  };
}
