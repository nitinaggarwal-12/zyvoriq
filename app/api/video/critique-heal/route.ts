import { NextRequest, NextResponse } from "next/server";
import { critiqueVideoWithDeepMind, runAutonomousVideoLoop, VideoCritiqueCriteria } from "@/lib/ai/videoCriticEngine";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // Allow sufficient duration for video analysis loop

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "critique", prompt, videoBase64, videoPath, criteria = {}, options = {} } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required." }, { status: 400 });
    }

    if (action === "critique") {
      let buffer: Buffer | null = null;
      if (videoBase64) {
        buffer = Buffer.from(videoBase64, "base64");
      } else if (videoPath) {
        const resolved = path.resolve(process.cwd(), videoPath.replace(/^\//, ""));
        if (fs.existsSync(resolved)) {
          buffer = fs.readFileSync(resolved);
        }
      }

      if (!buffer) {
        return NextResponse.json(
          { success: false, error: "Either videoBase64 or a valid local videoPath is required for critique." },
          { status: 400 }
        );
      }

      const report = await critiqueVideoWithDeepMind(buffer, prompt, criteria as VideoCritiqueCriteria);
      return NextResponse.json({
        success: true,
        critique: report
      });
    }

    if (action === "auto-heal" || action === "loop") {
      const loopResult = await runAutonomousVideoLoop(
        prompt,
        criteria as VideoCritiqueCriteria,
        {
          durationSeconds: options.durationSeconds || 6,
          aspectRatio: options.aspectRatio || "9:16",
          modelTier: options.modelTier || "fast",
          maxIterations: options.maxIterations || 2
        }
      );

      return NextResponse.json({
        success: true,
        autoHealed: loopResult.autoHealed,
        totalIterations: loopResult.totalIterations,
        finalCritique: loopResult.finalCritique,
        iterations: loopResult.iterations.map(it => ({
          iteration: it.iterationNumber,
          prompt: it.promptUsed,
          score: it.critique.overallScore,
          verdict: it.critique.verdict,
          issues: it.critique.issuesDetected,
          recommendations: it.critique.refinedPromptRecommendations
        })),
        operationName: loopResult.finalVideo.operationName,
        fileSizeBytes: loopResult.finalVideo.fileSize
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("[API critique-heal error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during video critique loop." },
      { status: 500 }
    );
  }
}
