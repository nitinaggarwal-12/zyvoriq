const fs = require('fs');

console.log('📝 Compiling 10-Minute Executive Keynote Storyboard for Priya Sharma...');

const KEYNOTE_STORYBOARD = {
  title: "The Sovereign AI Enterprise: Architecture, Autonomous Swarms & Cryptographic Veritas",
  presenter: {
    name: "Priya Sharma",
    role: "Chief Architect & AI Systems Fellow",
    personaId: "priya",
    voiceModel: "gemini-2.5-flash-preview-tts",
    videoModel: "veo-3.1-generate-preview"
  },
  totalDurationSeconds: 600, // 10 minutes
  acts: [
    {
      act: 1,
      name: "The Sovereign AI Imperative",
      startSec: 0,
      endSec: 120,
      scenes: [
        {
          id: "act1_scene1",
          type: "A_ROLL",
          title: "Executive Hook & Opening Keynote Address",
          durationSec: 30,
          script: "Good morning and welcome to the future of enterprise intelligence. Over the last decade, organizations invested billions into cloud infrastructure, yet today's AI systems still operate in fragmented silos. Today, we are proud to unveil Zyvoriq Sovereign Gen 7—a unified autonomous architecture that bridges real-time neural twins with enterprise-grade cryptographic trust.",
          veoPrompt: "Cinematic 4K keynote video of executive Priya Sharma standing on stage in dark navy blazer, smiling warmly and confidently, gesturing expansively with both hands toward the tech audience, dynamic keynote stage lighting and arena background",
          cameraAngle: "24mm_hero"
        },
        {
          id: "act1_scene2",
          type: "B_ROLL_ARCH",
          title: "Global Infrastructure Disconnect vs Sovereign Layer",
          durationSec: 90,
          script: "When we look at modern Fortune 500 topologies, the challenge isn't compute availability—it is orchestration velocity and provenance. Legacy batch cron pipelines introduce latency drifts exceeding 14 seconds. With Sovereign Twin synthesis, every single telemetry event is evaluated in sub-millisecond cycles.",
          visualTopic: "Global Hybrid Cloud Topography & Latency Matrix",
          cameraAngle: "drawio_zoom"
        }
      ]
    },
    {
      act: 2,
      name: "Zero-Trust Ingress & Global Edge Mesh",
      startSec: 120,
      endSec: 240,
      scenes: [
        {
          id: "act2_scene1",
          type: "A_ROLL",
          title: "Zero-Trust Ingress Strategy",
          durationSec: 30,
          script: "Security cannot be an afterthought bolted onto AI inference. At the perimeter, our Cloud Armor Edge fabric intercepts 1.4 million requests per second, enforcing strict mutual TLS and continuous neural anomaly filtration before a single token reaches the core.",
          veoPrompt: "Cinematic 4K video of Priya Sharma standing on the keynote stage, gesturing assertively with her right hand to emphasize security architecture, looking directly into the camera with confident executive presence, keynote LED screen behind her",
          cameraAngle: "70mm_close"
        },
        {
          id: "act2_scene2",
          type: "B_ROLL_ARCH",
          title: "Cloud Armor Edge & WAF Packet Inspection Topology",
          durationSec: 90,
          script: "By distributing cryptographic session keys directly across regional edge points of presence, we reduce cold-start ingress latency to under 0.2 milliseconds while eliminating 99.98% of volumetric DDoS vectors.",
          visualTopic: "Edge Security Gateways & DDoS Filtration Nodes",
          cameraAngle: "stage_screen_focus"
        }
      ]
    },
    {
      act: 3,
      name: "Autonomous Multi-Agent Mesh & Swarm Orchestration",
      startSec: 240,
      endSec: 360,
      scenes: [
        {
          id: "act3_scene1",
          type: "A_ROLL",
          title: "The Shift to Autonomous Swarms",
          durationSec: 30,
          script: "Next, let us look at the brain of the platform: our Autonomous Multi-Agent Mesh. Rather than relying on single monolithic LLM calls, Zyvoriq deploys specialized recursive agent swarms that collaborate, critique, and self-correct in parallel.",
          veoPrompt: "Cinematic 4K video of Priya Sharma pacing smoothly across the keynote stage, smiling enthusiastically, pointing toward the holographic architecture display with expressive hand gestures, arena spotlights illuminating the stage",
          cameraAngle: "35mm_wide"
        },
        {
          id: "act3_scene2",
          type: "B_ROLL_ARCH",
          title: "Swarm DAG Orchestration & Dynamic Task Decomposition",
          durationSec: 90,
          script: "Each agent in the mesh operates under strict role isolation: Codebase Researchers, Database Guards, Security Auditors, and Visual Synthesizers. When a task is queued, the Swarm Controller decomposes the goal into a dependency DAG, achieving 4.8x higher execution throughput than linear workflows.",
          visualTopic: "Multi-Agent DAG Execution & Parallel Worker Nodes",
          cameraAngle: "drawio_zoom"
        }
      ]
    },
    {
      act: 4,
      name: "Veritas Cryptographic Provenance & Auto-Repair",
      startSec: 360,
      endSec: 480,
      scenes: [
        {
          id: "act4_scene1",
          type: "A_ROLL",
          title: "Zero-Knowledge Provenance & Veritas Trust",
          durationSec: 30,
          script: "In high-stakes enterprise decisions, hallucination is unacceptable. That is why every artifact, code change, and speech output in Gen 7 is mathematically bound with a Veritas zk-SNARK cryptographic seal.",
          veoPrompt: "Cinematic 4K close-up of Priya Sharma speaking with high conviction and precision, subtle hand gestures underscoring cryptographic integrity, clear stage lighting and deep blue background",
          cameraAngle: "70mm_close"
        },
        {
          id: "act4_scene2",
          type: "B_ROLL_ARCH",
          title: "Veritas Circuit Architecture & Autonomous Self-Healing",
          durationSec: 90,
          script: "When an anomaly or test regression is detected, our Veritas Auto-Repair circuit trips autonomously. It captures the diagnostic state delta, generates isolated micro-patches, and re-verifies against the golden harness before human review is ever needed.",
          visualTopic: "Veritas zk-SNARK Circuit & Feedback Self-Healing Loops",
          cameraAngle: "stage_screen_focus"
        }
      ]
    },
    {
      act: 5,
      name: "Enterprise Horizon, TCO Reduction & Closing",
      startSec: 480,
      endSec: 600,
      scenes: [
        {
          id: "act5_scene1",
          type: "A_ROLL",
          title: "Financial Realization & 3-Year ROI",
          durationSec: 30,
          script: "The economic impact for enterprise leaders is immediate. Across early deployments, organizations have realized a 42% reduction in cloud compute waste and an annualized ROI between $2.3 million and $4.2 million.",
          veoPrompt: "Cinematic 4K wide shot of Priya Sharma standing tall at center stage, opening her hands to the full audience in closing keynote posture, vibrant auditorium lighting and enthusiastic keynote atmosphere",
          cameraAngle: "24mm_hero"
        },
        {
          id: "act5_scene2",
          type: "B_ROLL_ARCH",
          title: "30-60-90 Day Transformation Horizon & Executive Sign-off",
          durationSec: 90,
          script: "The path forward is clear: with automated governance guards, zero legacy tech footprint, and sovereign foundation models, your enterprise is ready for the next decade of AI innovation. Thank you, and welcome to Zyvoriq.",
          visualTopic: "Enterprise Transformation Roadmap & Executive Seal",
          cameraAngle: "drawio_zoom"
        }
      ]
    }
  ]
};

fs.writeFileSync('scratch/keynote_10min/storyboard_spec.json', JSON.stringify(KEYNOTE_STORYBOARD, null, 2));
console.log('✅ 10-Minute Keynote Storyboard written to scratch/keynote_10min/storyboard_spec.json');
