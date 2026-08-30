import type { ReelProductionManifest, ReelShot, WordTiming, CaptionCue } from "./types";

export interface ReelFrameEvidence {
  frame: number;
  timeSec: number;
  shotId: string | null;
  shotFrame: number | null;
  sourceVideoUrl?: string;
  expected: {
    scriptText?: string;
    spokenWords: string[];
    caption?: string;
    characterIds: string[];
    environmentId?: string;
    wardrobe?: string;
    action?: string;
    pose?: string;
    camera?: string;
    cameraMotion?: string;
    subjectMotion?: string;
    emotion?: unknown;
    objects: unknown[];
  };
  audio: {
    narrationActive: boolean;
    narrationUrl?: string;
    musicActive: boolean;
    musicUrl?: string;
    sfxActive: boolean;
    ambienceActive: boolean;
  };
  boundary?: { id: string; fromShotId: string; toShotId: string; strategy: string };
  observed: {
    identityScore: null;
    emotionScore: null;
    poseScore: null;
    backgroundScore: null;
    lipSyncScore: null;
    captionScore: null;
    semanticScore: null;
  };
}

function activeWords(words: WordTiming[] | undefined, t: number) {
  return (words || []).filter(w => t >= w.startSec && t < w.endSec).map(w => w.word);
}
function activeCaption(cues: CaptionCue[] | undefined, t: number) {
  return (cues || []).find(c => t >= c.startSec && t < c.endSec)?.text;
}
function shotAt(shots: ReelShot[], t: number) {
  return shots.find(s => t >= s.editorialStartSec && t < s.editorialStartSec + s.editorialDurationSec) || null;
}

export function buildInspectionPackage(manifest: ReelProductionManifest, fps = 30) {
  const durationSec = Number(manifest.audio.actualDurationSec || manifest.plannedDurationSec || 0);
  const frameCount = Math.max(0, Math.ceil(durationSec * fps));
  const chars = manifest.continuity?.characters || [];
  const envs = manifest.continuity?.environments || [];
  const boundaries = manifest.continuity?.boundaries || [];
  const frames: ReelFrameEvidence[] = [];

  for (let frame = 0; frame < frameCount; frame++) {
    const t = Number((frame / fps).toFixed(6));
    const shot = shotAt(manifest.shots, t);
    const boundary = boundaries.find(b => Math.abs(t - b.toTimeSec) <= 1 / fps);
    const characterId = shot?.continuityIn?.characterId || shot?.continuityOut?.characterId;
    const environmentId = shot?.continuityIn?.environmentId || shot?.continuityOut?.environmentId;
    frames.push({
      frame,
      timeSec: t,
      shotId: shot?.id || null,
      shotFrame: shot ? Math.max(0, Math.floor((t - shot.editorialStartSec) * fps)) : null,
      sourceVideoUrl: shot?.asset?.videoUrl,
      expected: {
        scriptText: shot?.scriptText,
        spokenWords: activeWords(manifest.audio.wordTimings, t),
        caption: activeCaption(manifest.captions?.cues, t),
        characterIds: characterId ? [characterId] : chars.map(c => c.id),
        environmentId: environmentId || envs[0]?.id,
        wardrobe: shot?.continuityIn?.wardrobe || shot?.continuityOut?.wardrobe,
        action: shot?.continuityIn?.action || shot?.continuityOut?.action,
        pose: shot?.continuityIn?.pose || shot?.continuityOut?.pose,
        camera: shot?.continuityIn?.camera || shot?.continuityOut?.camera,
        cameraMotion: shot?.continuityIn?.cameraMotion || shot?.continuityOut?.cameraMotion,
        subjectMotion: shot?.continuityIn?.subjectMotion || shot?.continuityOut?.subjectMotion,
        emotion: shot?.continuityIn?.emotion || shot?.continuityOut?.emotion,
        objects: shot?.continuityIn?.objectStates || shot?.continuityOut?.objectStates || [],
      },
      audio: {
        narrationActive: activeWords(manifest.audio.wordTimings, t).length > 0,
        narrationUrl: manifest.audio.narrationUrl,
        musicActive: Boolean(manifest.audio.musicUrl || manifest.musicPlan?.sections.some(s => t >= s.startSec && t < s.endSec)),
        musicUrl: manifest.audio.musicUrl,
        sfxActive: false,
        ambienceActive: false,
      },
      boundary: boundary ? { id: boundary.id, fromShotId: boundary.fromShotId, toShotId: boundary.toShotId, strategy: boundary.strategy } : undefined,
      observed: { identityScore: null, emotionScore: null, poseScore: null, backgroundScore: null, lipSyncScore: null, captionScore: null, semanticScore: null },
    });
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    productionId: manifest.id,
    fps,
    durationSec,
    frameCount,
    pieces: {
      finalMp4: manifest.outputs?.master?.videoUrl || manifest.outputs?.narratedRoughCut?.videoUrl,
      shots: manifest.shots.map(s => ({ id: s.id, videoUrl: s.asset?.videoUrl, startSec: s.editorialStartSec, durationSec: s.editorialDurationSec, model: s.asset?.model })),
      narration: manifest.audio.narrationUrl,
      music: manifest.audio.musicUrl,
      captions: manifest.captions || null,
      wordTimings: manifest.audio.wordTimings || [],
      characters: chars,
      environments: envs,
      objectStateGraph: manifest.continuity?.objectStateGraph || {},
      performanceTracks: manifest.continuity?.performanceTracks || [],
      boundaries,
      musicPlan: manifest.musicPlan || null,
      qa: manifest.qa,
    },
    frames,
    note: "Expected timeline evidence is derived from the canonical manifest and real alignment. Observed multimodal quality scores remain null until real evaluators produce evidence."
  };
}
