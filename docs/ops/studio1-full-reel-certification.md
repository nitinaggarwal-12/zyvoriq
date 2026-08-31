# Studio1 Full Reel Certification

Studio1 must not present a previously encoded narrated rough cut as a fixed Full Reel merely because newer synchronization code has been deployed.

A Full Reel is authoritative only when the stored narrated rough cut contains render QA with all of the following evidence:

- Studio1 `timelineSync.version >= 2`.
- `timelineQa.timingContract === "narration-master-clock"`.
- `timelineQa.passed === true`.
- `timelineQa.maxBoundaryDriftMs <= timelineQa.maxAllowedBoundaryDriftMs`.

Legacy outputs without this evidence remain rebuildable but are not certified. Rebuilding must run through the exact transcript-aligned timeline, preserve semantic scene boundaries, use local clip adaptation only within the configured safety envelope, and fail for selective scene regeneration when a source clip cannot safely cover its narration slot.
