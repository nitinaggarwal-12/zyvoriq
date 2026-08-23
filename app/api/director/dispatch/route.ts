import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { modelRouter } from "@/lib/ai/router";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, personaTone, autonomyMode, targetChannels, workspaceId } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing required prompt parameter" }, { status: 400 });
    }

    const taskId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const wsId = workspaceId || "ws_tech_eng";

    // 1. Dispatch Research & Grounding (Gemini 2.5 Pro)
    const claims = await modelRouter.dispatchGroundingResearch(prompt);

    // 2. Dispatch Scripting & AST (Claude 3.5 Sonnet)
    const scenes = await modelRouter.dispatchScriptingAndAst(prompt, personaTone || "Engineering-First", claims);

    // 3. Persist Swarm Run into Database
    db.createSwarmRun({
      id: taskId,
      workspace_id: wsId,
      concept_prompt: prompt,
      dag_state: {
        autonomyMode: autonomyMode || "auto",
        personaTone: personaTone || "Engineering-First",
        targetChannels: targetChannels || ["shorts", "linkedin", "x", "diagram"],
        claimsCount: claims.length,
        scenesCount: scenes.length
      }
    });

    return NextResponse.json({
      taskId,
      status: "queued",
      message: "Swarm DAG compiled and scheduled across Gemini 2.5 Pro & Claude 3.5 Sonnet",
      claims,
      scenes,
      dag: {
        root: "Agent 1: Director Swarm DAG Compiler (Gemini 2.5 Pro)",
        parallelWorkers: [
          "Agent 2: Research & Grounding (Gemini 2.5 Pro)",
          "Agent 3: Scripting & Narrative (Claude 3.5 Sonnet)",
          "Agent 4: Cinematic Video Storyboard (Veo 2)",
          "Agent 5: Speech & Vocal Dubbing (DeepMind Neural TTS)",
          "Agent 6: Code & Diagram Compiler (Draw.io XML AST)"
        ],
        qualityGate: "Agent 7: Veritas 5-Axis Consensus Auditor (Gemini + Claude)",
        autoRepair: "Agent 8: Surgical Defect Auto-Repair (Loop 1-3)",
        publisher: "Agent 9: Omnichannel C2PA Publisher (Ed25519 Signed)"
      },
      autonomyMode: autonomyMode || "auto",
      estimatedDurationMs: 1800,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error parsing dispatch payload" }, { status: 500 });
  }
}
