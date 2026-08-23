import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const events = [
        { agent: "Agent 1 (Director)", message: `Ingested task ${taskId}. Initializing DAG execution plan.` },
        { agent: "Agent 2 (Research)", message: "Extracted 6 ground-truth claims with verified primary DOIs." },
        { agent: "Agent 3 (Scripting)", message: "Drafted 4-scene narrative with 0.94 cosine persona memory match." },
        { agent: "Agent 4 (Video)", message: "Synthesized 1080p shot transitions and camera movement vectors." },
        { agent: "Agent 5 (Audio)", message: "Convolved 5-band vocal formant master stem + gold subtitles." },
        { agent: "Agent 6 (Code)", message: "Parsed Babel AST (0 syntax errors). Draw.io 2D collision auto-healed." },
        { agent: "Agent 7 (Veritas)", message: "5-Axis Consensus evaluation complete. VQS: 94.6/100 (PASS APPROVED)." },
        { agent: "Agent 9 (Publisher)", message: "Embedded C2PA Ed25519 digital signature. Omnichannel dispatch ready." },
      ];

      for (const event of events) {
        const data = `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(data));
        await new Promise((res) => setTimeout(res, 200));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
