// @ts-ignore
import { verifyPromptPreFlight as verifyMjs, repairRejectedPrompt as repairMjs, sanitizeAndEnrichUserPrompt as sanitizeMjs } from "./promptVerifier.mjs";

export interface PreFlightResult {
  verifiedPrompt: string;
  wasRewritten: boolean;
  reasons: string[];
}

export interface RepairResult {
  repairedPrompt: string;
  fixApplied: string;
}

export interface SanitizedPromptResult {
  sanitizedTopic: string;
  originalTopic: string;
  wasRewritten: boolean;
  reasons: string[];
}

export async function verifyPromptPreFlight(
  prompt: string,
  context: { genre?: string; characterName?: string } = {}
): Promise<PreFlightResult> {
  return verifyMjs(prompt, context);
}

export async function repairRejectedPrompt(
  rejectedPrompt: string,
  rejectionReason: string,
  context: { genre?: string; characterName?: string; isAudioRejection?: boolean } = {}
): Promise<RepairResult> {
  return repairMjs(rejectedPrompt, rejectionReason, context);
}

export async function sanitizeAndEnrichUserPrompt(
  prompt: string,
  options?: { genre?: string }
): Promise<SanitizedPromptResult> {
  return sanitizeMjs(prompt, options);
}

