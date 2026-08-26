# 🛡️ ZYVORIQ SOVEREIGN ARCHITECTURAL GOVERNANCE & LEGACY PREVENTION POLICY

## 1. Zero-Tolerance Technical Ban List
The following tools, models, and paradigms are permanently banned from the codebase:
- ❌ **Legacy 2D Talking Head Models**: `SadTalker`, `Wav2Lip`, `D-ID` (isolated facial landmark warpers that freeze body pixels).
- ❌ **Synthetic Geometric / UV Warping Hacks**: Procedural trigonometric fragment/vertex offsets on still portraits (e.g. sinusoidal mouth/chest displacements).
- ❌ **Non-Standard Video Codecs**: OpenCV `mp4v` (MPEG-4 Part 2). All MP4 containers must strictly be `H.264 (avc1)` with `yuv420p` pixel format and `moov` faststart.
- ❌ **Local CPU Neural Checkpoint Hosting**: No multi-process CPU thrashing. All heavy AI workloads must use cloud-native foundation APIs (Vertex AI / DeepMind).

---

## 2. Approved 2026 Production Standard Stack
- ✅ **Video Diffusion (Broadcast Mode)**: Google DeepMind Veo 2 (`veo-2.0-generate-001`) via `@google/genai`.
- ✅ **Audio & Multimodal TTS**: Google DeepMind 48kHz Neural Audio (`gemini-2.5-flash-preview-tts` / `gemini-3.1-flash-tts-preview`).
- ✅ **Interactive 3D Stage (Real-Time Mode)**: Full 3D Skinned Humanoid Rigs (GLTF / VRM / `@pixiv/three-vrm`) with skeletal bone hierarchies and blendshape visemes.
- ✅ **Cryptographic Provenance**: Veritas C2PA / Ed25519 tamper-proof signed manifests.

---

## 3. Automated Enforcement Quality Gates
1. **Static AST & Keyword Scan**: `npm run guard:legacy` scans all commits and source files for banned dependencies and patterns.
2. **Video Asset Codec Verification**: Automatically inspects every MP4 asset with `ffprobe` to guarantee `h264 + yuv420p`.
3. **Temporal Motion Delta Harness**: Automated E2E harness checks that full-body pixel motion is $> 0.5\%$ across frames.
