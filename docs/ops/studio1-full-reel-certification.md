# Studio1 Full Reel Certification

Studio1 must not present a previously encoded narrated rough cut as a fixed Full Reel merely because newer synchronization code has been deployed.

A Full Reel is authoritative only when the stored narrated rough cut contains both semantic timeline evidence and render QA with all of the following evidence:

- Studio1 `timelineSync.version >= 2`.
- `timelineSync.source === "transcript-scene-alignment"`.
- Global exact script-to-transcript match is at least 70%.
- Every scene has passing alignment evidence using the same thresholds enforced by the timeline engine.
- There is one semantic boundary anchor between each adjacent pair of scenes and one complete boundary array covering the Reel.
- `timelineQa.timingContract === "narration-master-clock"`.
- `timelineQa.passed === true`.
- `timelineQa.maxBoundaryDriftMs <= timelineQa.maxAllowedBoundaryDriftMs`.

Legacy outputs without this evidence remain rebuildable but are not certified. The Studio1 API suppresses uncertified rough-cut/master URLs from response views so an old encoded MP4 cannot be mistaken for the repaired Full Reel. Durable history is left unchanged.

Rebuilding must run through the exact transcript-aligned timeline, preserve semantic scene boundaries, use local clip adaptation only within the configured safety envelope, and fail for selective scene regeneration when a source clip cannot safely cover its narration slot.
