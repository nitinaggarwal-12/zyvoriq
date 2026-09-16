# Studio1 Full Reel Certification

Studio1 must not present a previously encoded narrated rough cut as a fixed Full Reel merely because newer synchronization code has been deployed.

A Full Reel is authoritative only when the stored narrated rough cut contains both semantic timeline evidence and render QA with all of the following evidence:

- Studio1 `timelineSync.version >= 2`.
- `timelineSync.source === "transcript-scene-alignment"`.
- Global exact script-to-transcript match is at least 70%.
- Every scene has passing alignment evidence using the same thresholds enforced by the timeline engine.
- There is one semantic boundary anchor between each adjacent pair of scenes and one complete boundary array covering the Reel.
- `timelineQa.timingContract === "narration-master-clock"` or `"lyria-master-clock"`.
- `timelineQa.passed === true`.
- `timelineQa.maxBoundaryDriftMs <= timelineQa.maxAllowedBoundaryDriftMs`.
- **Multi-Component 4-Clock Drift Ceiling (`multi_component_4_clock_drift_gate`)**: The physical stitched MP4 duration (`T_rendered`) must match both the planned editorial timeline sum (`T_editorial`) and master audio track (`T_audio`) within **`±50ms` (`0.05s`)**. Native-audio assembly (`hasNativeAudio`) must apply frame-accurate `trim=duration=${editorialDurationSec},setpts=PTS-STARTPTS` and `atrim=duration=${editorialDurationSec},asetpts=PTS-STARTPTS` filters with `amix=duration=first` so raw 8.0s Veo generation buckets are never concatenated un-trimmed.
- **Cross-Environment Asset Verification Parity (`cross_environment_asset_verification_parity`)**: `/api/reels/verify-assets` must validate both local disk (`fs.existsSync`) and `readAsset()` / proxied Railway storage routes (`/api/reels/assets/reels/studio1_*`) so `/my-reels` displays `✓ VALID MEDIA` across both local dev and cloud production.

Legacy outputs without this evidence remain rebuildable via `node scripts/audit_and_heal_drift.mjs <productionId>` but are not certified. The Studio1 API suppresses uncertified rough-cut/master URLs from response views so an old encoded MP4 cannot be mistaken for the repaired Full Reel. Durable history is left unchanged.

Rebuilding must run through the exact transcript-aligned timeline, preserve semantic scene boundaries, use local clip adaptation only within the configured safety envelope, and fail for selective scene regeneration when a source clip cannot safely cover its narration slot.

