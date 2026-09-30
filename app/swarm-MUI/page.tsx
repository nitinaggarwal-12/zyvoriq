"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PersonaCategory,
  PERSONAS_CATALOG,
  WARDROBE_CATALOG,
  ACCESSORIES_CATALOG,
  COUNTRIES_CATALOG,
  REGIONS_CATALOG,
  LANGUAGES_CATALOG,
  DEMOGRAPHIES_CATALOG,
  PLATFORMS_CATALOG,
  CONTENT_TYPES_CATALOG,
  DURATIONS_CATALOG,
  GENRES_CATALOG,
  VOCALS_CATALOG,
  AUDIO_ENGINES_CATALOG,
  VENUES_CATALOG,
  LIGHTING_CATALOG,
  CAMERA_MOVES_CATALOG,
  INITIAL_REELS_REPOSITORY,
  StudioReelRecord,
  ShotSpec,
  getById,
  dedupeById,
  dedupeSelectedPersonaIds,
} from "@/lib/studioCatalog";
import {
  getDanceMusicVideoAgents,
  SwarmAgentStatus,
  IndependentJudgeReceipt,
} from "@/lib/swarm/engine";
import { StudioWorkflowMode } from "@/components/LeftIconRail";
import {
  Sparkles,
  Play,
  Download,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bookmark,
  Trash2,
} from "lucide-react";

export default function SwarmMUIPage() {
  const router = useRouter();

  // ==========================================================================
  // 1. ACTIVE WORKFLOW & SUB-STEP STATE (ZERO AMBIGUITY)
  // ==========================================================================
  const [workflow, setWorkflow] = useState<StudioWorkflowMode>("create");
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1);
  const [canvasTab, setCanvasTab] = useState<
    "ensemble" | "shots" | "prompt" | "agents" | "video"
  >("ensemble");
  const [statusBanner, setStatusBanner] = useState<string>("");
  const [customMasterPromptOverride, setCustomMasterPromptOverride] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // ==========================================================================
  // 2. STRUCTURED SELECTION STATE DERIVED FROM CATALOG MASTER (ZERO HARDCODING)
  // ==========================================================================
  const defaultMasterReel = INITIAL_REELS_REPOSITORY[0];
  const [title, setTitle] = useState<string>(defaultMasterReel.title);
  const [storyline, setStoryline] = useState<string>(
    defaultMasterReel.storyline ||
      "Original 128 BPM B-Minor 1930s Art-Deco speakeasy jazz-funk & syncopated slap-bass dance reel (Option 1: Closed-Lips Eye/Body Acting + Continuous 60.0s Lyria 3 Pro Studio Song). Act I opens in The Crimson Velvet speakeasy with chiaroscuro venetian-blind shadow slashes, a coin-toss vintage jukebox ignition, and razor-sharp solo/duet footwork; Act II erupts onto the rain-slicked Azure Dawn metropolitan plaza with an 8-dancer V-wedge lock-step and 45-degree anti-gravity forward lean finale."
  );
  const [compiledConceptDirective, setCompiledConceptDirective] = useState<string>(
    defaultMasterReel.storyline ||
      `Photorealistic 2-Act 35mm Anamorphic music video ("${defaultMasterReel.title}", 60.0s @ 24/1 CFR) set in The Crimson Velvet 1930s Art-Deco speakeasy and rain-slicked Azure Dawn metropolitan plaza at 128 BPM in B Minor.`
  );
  const [countryId, setCountryId] = useState<string>(defaultMasterReel.countryId);
  const [regionId, setRegionId] = useState<string>(defaultMasterReel.regionId);
  const [languageId, setLanguageId] = useState<string>(defaultMasterReel.languageId);
  const [demographyId, setDemographyId] = useState<string>(defaultMasterReel.demographyId);
  const [platformId, setPlatformId] = useState<string>(defaultMasterReel.platformId);
  const [contentTypeId, setContentTypeId] = useState<string>(defaultMasterReel.contentTypeId);
  const [durationId, setDurationId] = useState<string>(defaultMasterReel.durationId);
  const [genreId, setGenreId] = useState<string>(defaultMasterReel.genreId);
  const [vocalId, setVocalId] = useState<string>(defaultMasterReel.vocalId);
  const [audioEngineId, setAudioEngineId] = useState<"omni_lyria3" | "omni_native">(
    (defaultMasterReel.audioEngineId as "omni_lyria3" | "omni_native") || "omni_lyria3"
  );
  const [venueId, setVenueId] = useState<string>(defaultMasterReel.venueId);
  const [lightingId, setLightingId] = useState<string>(defaultMasterReel.lightingId);
  const [lyrics, setLyrics] = useState<string>(
    defaultMasterReel.lyrics || defaultMasterReel.shots.map((s) => s.lyricLine).join("\n")
  );

  // Dynamic Catalog States (Automatically expanded whenever user enters a new prompt!)
  const [personasCatalog, setPersonasCatalog] =
    useState< typeof PERSONAS_CATALOG >(PERSONAS_CATALOG);
  const [wardrobeCatalog, setWardrobeCatalog] =
    useState< typeof WARDROBE_CATALOG >(WARDROBE_CATALOG);
  const [accessoriesCatalog, setAccessoriesCatalog] =
    useState< typeof ACCESSORIES_CATALOG >(ACCESSORIES_CATALOG);
  const [venuesCatalog, setVenuesCatalog] =
    useState< typeof VENUES_CATALOG >(VENUES_CATALOG);
  const [isSynthesizingPrompt, setIsSynthesizingPrompt] = useState<boolean>(false);

  // Selected Persona IDs across all 5 categories
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<
    Record<PersonaCategory, string[]>
  >(defaultMasterReel.selectedPersonaIds);

  const defaultFemPersona = getById(PERSONAS_CATALOG, defaultMasterReel.selectedPersonaIds.female_lead[0]);
  const defaultMalePersona = getById(PERSONAS_CATALOG, defaultMasterReel.selectedPersonaIds.male_lead[0]);
  const defaultSupPersona = getById(PERSONAS_CATALOG, defaultMasterReel.selectedPersonaIds.supporting[0]);
  const defaultBgPersona = getById(PERSONAS_CATALOG, defaultMasterReel.selectedPersonaIds.background[0]);
  const defaultAudPersona = getById(PERSONAS_CATALOG, defaultMasterReel.selectedPersonaIds.audience[0]);
  const defaultFemOverride = defaultMasterReel.wardrobeOverrides?.[defaultFemPersona.id];
  const defaultMaleOverride = defaultMasterReel.wardrobeOverrides?.[defaultMalePersona.id];

  // Wardrobe IDs (Act I, Act II, Accessories) derived from defaultMasterReel personas
  const [womenAct1Id, setWomenAct1Id] = useState<string>(
    defaultFemOverride?.act1Id || defaultFemPersona.defaultAct1WardrobeId
  );
  const [womenAct2Id, setWomenAct2Id] = useState<string>(
    defaultFemOverride?.act2Id || defaultFemPersona.defaultAct2WardrobeId
  );
  const [menAct1Id, setMenAct1Id] = useState<string>(
    defaultMaleOverride?.act1Id || defaultMalePersona.defaultAct1WardrobeId
  );
  const [menAct2Id, setMenAct2Id] = useState<string>(
    defaultMaleOverride?.act2Id || defaultMalePersona.defaultAct2WardrobeId
  );
  const [supportingWardrobeId, setSupportingWardrobeId] = useState<string>(defaultSupPersona.defaultAct1WardrobeId);
  const [backgroundWardrobeId, setBackgroundWardrobeId] = useState<string>(defaultBgPersona.defaultAct1WardrobeId);
  const [audienceWardrobeId, setAudienceWardrobeId] = useState<string>(defaultAudPersona.defaultAct1WardrobeId);
  const [accessoryId, setAccessoryId] = useState<string>(
    defaultMaleOverride?.accessoryId || defaultFemOverride?.accessoryId || defaultFemPersona.defaultAccessoryId
  );
  const [bpm, setBpm] = useState<number>(128);
  const [musicalKey, setMusicalKey] = useState<string>("B Minor");

  // Additional Synthesized Dimensions (Background Scenery, Human Emotions, Voice Type, Choreography, Optics, Contrast, Instruments)
  const [backgroundEnvironment, setBackgroundEnvironment] = useState<string>(
    getById(VENUES_CATALOG, defaultMasterReel.venueId)?.promptSpec || ""
  );
  const [humanEmotions, setHumanEmotions] = useState<string>(
    "Act I: Intrigue, playful challenge, confident swagger, and sharp fedora-brim eye contact under chiaroscuro venetian-blind shadows → Act II: Determined resolve, exhilaration, synchronized V-wedge power, and collective triumph on the rain-slicked plaza"
  );
  const [shotEmotions, setShotEmotions] = useState<string[]>(
    defaultMasterReel.shots.map(
      (s) => `Shot ${String(s.shotNumber).padStart(2, "0")} (${s.timecode}): ${s.actionPrompt.slice(0, 110)}`
    )
  );
  const [voiceType, setVoiceType] = useState<string>(
    "Rich, resonant baritone for Male Lead with slight room plate reverb; sultry, smoky mezzo-soprano for Female Lead; bright soprano for Female Co-Lead — 48,000 Hz stereo studio quality synchronized to 128 BPM B Minor jazz-funk (-14.0 LUFS EBU R128)"
  );
  const [choreography, setChoreography] = useState<string>(
    "Act I: Razor-sharp solo & partner jazz-funk footwork with reverse-glide isolation and coin-toss jukebox ignition → Act II: 8-dancer V-wedge lock-step, rapid-fire tap syncopation, and 45-degree anti-gravity forward lean illusion on the wet plaza"
  );
  const [shotChoreography, setShotChoreography] = useState<string[]>(
    defaultMasterReel.shots.map(
      (s) => `[${s.timecode} • Act ${s.act}] ${s.actionPrompt}`
    )
  );
  const [shotLightingAndOptics, setShotLightingAndOptics] = useState<string[]>(
    defaultMasterReel.shots.map((s, idx) => {
      const cam = getById(CAMERA_MOVES_CATALOG, s.cameraMoveId);
      const kelvin = idx < 3 ? "3200K warm speakeasy tungsten + chiaroscuro venetian-blind shadow slashes (4:1 contrast ratio)" : "4500K–5400K pre-dawn wet granite reflections & rim spotlights (3:1 contrast ratio)";
      return `Shot ${String(s.shotNumber).padStart(2, "0")} (${s.timecode}): 35mm/50mm/85mm Panavision Anamorphic Prime @ T1.8, ${cam.label} (${cam.promptSpec}), ${kelvin}`;
    })
  );
  const [figureGroundContrastSpec, setFigureGroundContrastSpec] = useState<string>(
    "Enforces >= 4.0:1 figure-ground luminance & chromatic separation across all 6 shots: high-luminance ivory chalk-stripe wool, white fedora, and emerald bias-cut silk pop cleanly against dark mahogany and crimson velvet in Act I, while silver metallic lamé and steel-grey peak-lapel tailoring separate sharply from wet obsidian granite in Act II."
  );
  const [instrumentAndStagePropsSpec, setInstrumentAndStagePropsSpec] = useState<string>(
    getById(ACCESSORIES_CATALOG, defaultMaleOverride?.accessoryId || defaultFemPersona.defaultAccessoryId)?.promptSpec || ""
  );
  const [creativeElevation, setCreativeElevation] = useState<{
    sourceType: "youtube_reference" | "original_prompt";
    youtubeMetadata: {
      videoId: string;
      url: string;
      title: string;
      channelName: string;
      descriptionSnippet: string;
      keywords: string[];
      thumbnailUrl: string;
    } | null;
    deconstructedCore: string;
    identifiedLimitations: string[];
    surpassStrategy: string;
    act1ToAct2Twist: string;
    sonicInnovation: string;
    choreographyAndCameraUpgrade: string;
    innovationScore: string;
    judgeReceipt?: IndependentJudgeReceipt;
  }>({
    sourceType: "youtube_reference",
    youtubeMetadata: {
      videoId: "h_D3VFfhvs4",
      url: "https://www.youtube.com/watch?v=h_D3VFfhvs4",
      title: "Crimson Echoes, Ivory Dreams — 1930s Art-Deco Speakeasy Groove (Original Copyright-Safe Elevation)",
      channelName: "Zyvoriq Autonomous 12-Agent Studio",
      descriptionSnippet:
        "Original 128 BPM B-Minor Art-Deco speakeasy jazz-funk & syncopated slap-bass dance production available in both Option 1 (Omni 1.1 + Lyria 3 Pro 60s Studio Song) and Option 2 (Omni 1.1 Native Vocal Lip-Sync).",
      keywords: ["Art-Deco Speakeasy", "128 BPM Jazz-Funk", "Ivory Chalk-Stripe Suit", "Anti-Gravity Lean", "Jukebox Coin Toss"],
      thumbnailUrl: "/assets/swarm/generated/job_1790786861133/preview_turn1A.jpg",
    },
    deconstructedCore:
      "Deconstructs the iconic 1930s noir nightclub aesthetic, syncopated bassline, coin-toss jukebox ignition, and geometric ensemble choreography into a 100% original, copyright-safe 60.0s 2-Act Art-Deco Jazz-Funk production in B Minor at 128 BPM.",
    identifiedLimitations: [
      "Legacy 4:3 SD/HD source footage lacks modern 9:16 vertical anamorphic framing and 48,000 Hz EBU R128 (-14.0 LUFS) studio stem separation",
      "Single-room nightclub staging remains confined indoors without an architectural Act I → Act II spatial transformation",
      "Standard AI video generators cannot simultaneously offer both a Closed-Lips Nayan-Abhinaya + Lyria 3 Pro studio song master (Option 1) and a single-model native lip-sync vocal master (Option 2)",
    ],
    surpassStrategy:
      "Renders both Option 1 (Omni 1.1 + Lyria 3 Pro continuous 60.0s studio song with closed-lips eye/body acting) and Option 2 (Omni 1.1 native 48kHz on-camera vocal lip-sync with 54 verified sung words) across 6 Panavision Anamorphic shots.",
    act1ToAct2Twist:
      "At 00:30, the vintage jukebox coin-toss inside The Crimson Velvet speakeasy shatters the indoor shadows and launches the 8-dancer ensemble onto the rain-slicked Azure Dawn metropolitan plaza for a V-wedge lock-step and 45-degree forward lean finale.",
    sonicInnovation:
      "128 BPM (B Minor) syncopated slap-bass, punchy 1930s brass section stabs, crisp snare rimshots, and male baritone + female mezzo-soprano duet vocals mastered at -14.0 LUFS.",
    choreographyAndCameraUpgrade:
      "6-shot Panavision Anamorphic progression (35mm T1.8 Steadicam push-in, 50mm lateral tracking, 85mm crane rise, 35mm sweeping drone orbit, 50mm gimbal close-up, and 24mm Technocrane pullback).",
    innovationScore: "9.9 / 10 • Dual-Engine 60.0s Art-Deco Speakeasy Master (Option 1 + Option 2)",
  });

  const promptDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const synthAbortRef = React.useRef<AbortController | null>(null);
  const synthReqSeqRef = React.useRef<number>(0);
  const [referenceYouTubeUrl, setReferenceYouTubeUrl] = useState<string>("");
  const referenceYouTubeUrlRef = React.useRef<string>("");
  const lastSynthesizedPromptKeyRef = React.useRef<string>("");

  const extractYouTubeUrlFromText = useCallback((text: string): string | null => {
    const matches = text.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    for (const u of matches) {
      if (/(?:youtube\.com|youtu\.be|higgsfield\.ai)/i.test(u)) {
        return u;
      }
    }
    const bareMatch = text.match(
      /(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?[^\s"'<>]+|shorts\/[A-Za-z0-9_-]{11}|embed\/[A-Za-z0-9_-]{11})|youtu\.be\/[A-Za-z0-9_-]{11}|higgsfield\.ai\/@[^\s"'<>]+)/i
    );
    if (bareMatch?.[0]) {
      return `https://${bareMatch[0]}`;
    }
    return null;
  }, []);

  const applySynthesizedAssets = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syn: any, overrides?: Record<string, string | undefined>, goToStep2 = false, effVocalIdFallback?: string, effLangIdFallback?: string) => {
      setTitle(syn.title);
      setStoryline(syn.storyline);
      if (typeof syn.compiledConceptDirective === "string" && syn.compiledConceptDirective) {
        setCompiledConceptDirective(syn.compiledConceptDirective);
      }
      if (syn.creativeElevation) {
        setCreativeElevation(syn.creativeElevation);
        if (syn.creativeElevation.youtubeMetadata?.url) {
          referenceYouTubeUrlRef.current = syn.creativeElevation.youtubeMetadata.url;
          setReferenceYouTubeUrl(syn.creativeElevation.youtubeMetadata.url);
        }
      }
      if (typeof syn.bpm === "number") {
        setBpm(syn.bpm);
      }
      if (typeof syn.musicalKey === "string" && syn.musicalKey) {
        setMusicalKey(syn.musicalKey);
      }
      setLyrics(syn.lyrics);

      // Update Duration, Language, Genre, Vocal, Location, Region, Demography, Lighting & 8-Dimension Specs
      if (syn.recommendedDurationId && !overrides?.durationId) {
        setDurationId(syn.recommendedDurationId);
      }
      if (syn.recommendedLanguageId && !overrides?.languageId) {
        setLanguageId(syn.recommendedLanguageId);
      }
      if (syn.recommendedGenreId && !overrides?.genreId) {
        setGenreId(syn.recommendedGenreId);
      }
      if (syn.recommendedCountryId && !overrides?.countryId) {
        setCountryId(syn.recommendedCountryId);
      }
      if (syn.recommendedRegionId && !overrides?.regionId) {
        setRegionId(syn.recommendedRegionId);
      }
      if (syn.recommendedDemographyId && !overrides?.demographyId) {
        setDemographyId(syn.recommendedDemographyId);
      }
      if (syn.recommendedLightingId) {
        setLightingId(syn.recommendedLightingId);
      }
      if (syn.recommendedVocalId && !overrides?.vocalId) {
        setVocalId(syn.recommendedVocalId);
      }
      if (syn.backgroundEnvironment) {
        setBackgroundEnvironment(syn.backgroundEnvironment);
      }
      if (syn.humanEmotions) {
        setHumanEmotions(syn.humanEmotions);
      }
      if (Array.isArray(syn.shotEmotions) && syn.shotEmotions.length > 0) {
        setShotEmotions(syn.shotEmotions);
      }
      if (syn.voiceType) {
        setVoiceType(syn.voiceType);
      }
      if (syn.choreography) {
        setChoreography(syn.choreography);
      }
      if (Array.isArray(syn.shotChoreography) && syn.shotChoreography.length > 0) {
        setShotChoreography(syn.shotChoreography);
      }
      if (Array.isArray(syn.shotLightingAndOptics) && syn.shotLightingAndOptics.length > 0) {
        setShotLightingAndOptics(syn.shotLightingAndOptics);
      }
      if (typeof syn.figureGroundContrastSpec === "string" && syn.figureGroundContrastSpec) {
        setFigureGroundContrastSpec(syn.figureGroundContrastSpec);
      }
      if (typeof syn.instrumentAndStagePropsSpec === "string" && syn.instrumentAndStagePropsSpec) {
        setInstrumentAndStagePropsSpec(syn.instrumentAndStagePropsSpec);
      }

      // 1. Prepend newly synthesized Wardrobes into wardrobeCatalog & select them
      const newW = syn.wardrobes;
      const addedWardrobes = dedupeById([
        newW.womenAct1,
        newW.womenAct2,
        newW.menAct1,
        newW.menAct2,
        newW.supporting,
        newW.background,
        newW.audience,
      ]);
      setWardrobeCatalog((prev) => dedupeById([...addedWardrobes, ...prev]));
      setAccessoriesCatalog((prev) => dedupeById([newW.accessory, ...prev]));
      setVenuesCatalog((prev) => dedupeById([newW.venue, ...prev]));

      setWomenAct1Id(newW.womenAct1.id);
      setWomenAct2Id(newW.womenAct2.id);
      setMenAct1Id(newW.menAct1.id);
      setMenAct2Id(newW.menAct2.id);
      setSupportingWardrobeId(newW.supporting.id);
      setBackgroundWardrobeId(newW.background.id);
      setAudienceWardrobeId(newW.audience.id);
      setAccessoryId(newW.accessory.id);
      setVenueId(newW.venue.id);

      // 2. Prepend newly synthesized 5-Tier Personas into personasCatalog & select them
      const p = syn.personas;
      const addedPersonas = dedupeById([
        {
          ...p.female_lead,
          defaultAct1WardrobeId: newW.womenAct1.id,
          defaultAct2WardrobeId: newW.womenAct2.id,
          defaultAccessoryId: newW.accessory.id,
        },
        ...(p.female_harmony
          ? [
              {
                ...p.female_harmony,
                defaultAct1WardrobeId: newW.womenAct1.id,
                defaultAct2WardrobeId: newW.womenAct2.id,
                defaultAccessoryId: newW.accessory.id,
              },
            ]
          : []),
        {
          ...p.male_lead,
          defaultAct1WardrobeId: newW.menAct1.id,
          defaultAct2WardrobeId: newW.menAct2.id,
          defaultAccessoryId: newW.accessory.id,
        },
        {
          ...p.supporting,
          defaultAct1WardrobeId: newW.supporting.id,
          defaultAct2WardrobeId: newW.supporting.id,
          defaultAccessoryId: newW.accessory.id,
        },
        {
          ...p.background,
          defaultAct1WardrobeId: newW.background.id,
          defaultAct2WardrobeId: newW.background.id,
          defaultAccessoryId: newW.accessory.id,
        },
        {
          ...p.audience,
          defaultAct1WardrobeId: newW.audience.id,
          defaultAct2WardrobeId: newW.audience.id,
          defaultAccessoryId: newW.accessory.id,
        },
      ]);
      setPersonasCatalog((prev) => dedupeById([...addedPersonas, ...prev]));

      const nextSelectedIds: Record<PersonaCategory, string[]> =
        dedupeSelectedPersonaIds(syn.recommendedSelectedIds, {
          female_lead: [p.female_lead.id],
          male_lead: [p.male_lead.id],
          supporting: [p.supporting.id],
          background: [p.background.id],
          audience: [p.audience.id],
        });
      setSelectedPersonaIds(nextSelectedIds);

      const persistedPrompt =
        referenceYouTubeUrlRef.current || syn.creativeElevation?.youtubeMetadata?.url
          ? `${referenceYouTubeUrlRef.current || syn.creativeElevation.youtubeMetadata.url} — ${syn.storyline}`
          : syn.storyline;

      // Save dynamic catalog & selections to localStorage so /personas and page reloads display them immediately
      try {
        const nowIso = new Date().toISOString();
        localStorage.setItem(
          "zyvoriq_dynamic_catalog_v1",
          JSON.stringify({
            personas: addedPersonas,
            wardrobes: addedWardrobes,
            accessory: newW.accessory,
            venue: newW.venue,
            selectedIds: nextSelectedIds,
            savedAt: nowIso,
          })
        );
        localStorage.setItem("zyvoriq_last_prompt_v1", persistedPrompt);
        localStorage.setItem(
          "zyvoriq_last_synthesized_payload_v1",
          JSON.stringify({ ...syn, _savedAt: nowIso })
        );
      } catch {
        // ignore
      }

      const finalVocId = syn.recommendedVocalId || effVocalIdFallback || vocalId;
      const finalLangObj = getById(
        LANGUAGES_CATALOG,
        syn.recommendedLanguageId || effLangIdFallback || languageId
      );
      const leadSummary =
        finalVocId === "voc_female_solo" || finalVocId === "voc_girl_group"
          ? `${p.female_lead.name} + ${p.female_harmony?.name || p.supporting.name}`
          : finalVocId === "voc_male_solo" || finalVocId === "voc_boy_band"
          ? `${p.male_lead.name} + ${p.supporting.name}`
          : `${p.female_lead.name} & ${p.male_lead.name}`;

      // Clear stale pre-existing video URL and custom shot overrides so Master Player & Storyboard reflect the newly synthesized prompt
      customShotsRef.current = null;
      setActiveVideoUrl("");
      setRenderStageLabel("");
      setRenderLogs([]);

      setStatusBanner(
        `✨ Synthesized all 8 dimensions: Personas (${leadSummary}), Locations, Act I/II Wardrobes, Background Scenery, Human Emotions, Voice Type, Choreography & ${finalLangObj.label.split("(")[0].trim()} Lyrics!`
      );
      if (goToStep2) {
        setCreateStep(2);
        setCanvasTab("ensemble");
      }
    },
    [vocalId, languageId]
  );

  // Dynamic Prompt-to-Lyrics, Characters & Wardrobe Synthesizer (Calls /api/swarm/synthesize-from-prompt)
  const synthesizeFromNewPrompt = useCallback(
    async (
      customPromptText?: string,
      goToStep2 = false,
      overrides?: {
        durationId?: string;
        genreId?: string;
        languageId?: string;
        vocalId?: string;
        countryId?: string;
        regionId?: string;
        demographyId?: string;
        platformId?: string;
        contentTypeId?: string;
      }
    ) => {
      const rawCandidate =
        customPromptText !== undefined ? customPromptText : storyline;
      const detectedYt = extractYouTubeUrlFromText(rawCandidate);
      if (detectedYt) {
        referenceYouTubeUrlRef.current = detectedYt;
        setReferenceYouTubeUrl(detectedYt);
      }

      const promptToUse =
        !detectedYt && referenceYouTubeUrlRef.current
          ? `${referenceYouTubeUrlRef.current} ${rawCandidate}`.trim()
          : rawCandidate;

      // If user clicked "Go to Step 02" and the exact same prompt/YouTube URL was already synthesized, transition immediately without redundant API overwrite
      if (
        goToStep2 &&
        !overrides &&
        !isSynthesizingPrompt &&
        lastSynthesizedPromptKeyRef.current &&
        (lastSynthesizedPromptKeyRef.current === promptToUse ||
          (referenceYouTubeUrlRef.current &&
            lastSynthesizedPromptKeyRef.current.includes(referenceYouTubeUrlRef.current)))
      ) {
        setCreateStep(2);
        setCanvasTab("ensemble");
        return;
      }

      if (synthAbortRef.current) {
        synthAbortRef.current.abort();
      }
      const controller = new AbortController();
      synthAbortRef.current = controller;
      const reqId = ++synthReqSeqRef.current;

      setIsSynthesizingPrompt(true);
      try {
        const effCountryId = overrides?.countryId ?? countryId;
        const effRegionId = overrides?.regionId ?? regionId;
        const effLangId = overrides?.languageId ?? languageId;
        const effGenreId = overrides?.genreId ?? genreId;
        const effVocalId = overrides?.vocalId ?? vocalId;
        const effDemoId = overrides?.demographyId ?? demographyId;
        const effPlatId = overrides?.platformId ?? platformId;
        const effCtypeId = overrides?.contentTypeId ?? contentTypeId;
        const effDurId = overrides?.durationId ?? durationId;

        const countryObj = getById(COUNTRIES_CATALOG, effCountryId);
        const regionObj = getById(REGIONS_CATALOG, effRegionId);
        const langObj = getById(LANGUAGES_CATALOG, effLangId);
        const genreObj = getById(GENRES_CATALOG, effGenreId);
        const vocalObj = getById(VOCALS_CATALOG, effVocalId);
        const demoObj = getById(DEMOGRAPHIES_CATALOG, effDemoId);
        const platObj = getById(PLATFORMS_CATALOG, effPlatId);
        const ctypeObj = getById(CONTENT_TYPES_CATALOG, effCtypeId);
        const durObj = getById(DURATIONS_CATALOG, effDurId);

        const res = await fetch("/api/swarm/synthesize-from-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            prompt: promptToUse,
            isDropdownOverride: Boolean(overrides),
            countryId: effCountryId,
            countryLabel: countryObj.label,
            regionId: effRegionId,
            regionLabel: regionObj.label,
            languageId: effLangId,
            languageLabel: langObj.label,
            genreId: effGenreId,
            genreLabel: genreObj.label,
            vocalId: effVocalId,
            vocalLabel: vocalObj.label,
            demographyId: effDemoId,
            demographyLabel: demoObj.label,
            platformLabel: platObj.label,
            contentTypeLabel: ctypeObj.label,
            durationSeconds: durObj.seconds,
            shotsCount: durObj.shotsCount,
          }),
        });
        const data = await res.json();
        if (reqId !== synthReqSeqRef.current) return;
        if (data?.ok && data.synthesized) {
          const syn = data.synthesized;
          lastSynthesizedPromptKeyRef.current = `${
            referenceYouTubeUrlRef.current || syn.creativeElevation?.youtubeMetadata?.url || ""
          } ${syn.storyline}`.trim();
          applySynthesizedAssets(syn, overrides, goToStep2, effVocalId, effLangId);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      } finally {
        if (reqId === synthReqSeqRef.current) {
          setIsSynthesizingPrompt(false);
        }
      }
    },
    [
      storyline,
      isSynthesizingPrompt,
      extractYouTubeUrlFromText,
      applySynthesizedAssets,
      countryId,
      regionId,
      languageId,
      genreId,
      vocalId,
      demographyId,
      platformId,
      contentTypeId,
      durationId,
    ]
  );

  // ==========================================================================
  // 3. PERSISTENT REELS REPOSITORY & DRAFTS STATE
  // ==========================================================================
  const [reels, setReels] = useState<StudioReelRecord[]>(INITIAL_REELS_REPOSITORY);
  const [selectedReelId, setSelectedReelId] = useState<string>(defaultMasterReel.id);
  const [wipFilter, setWipFilter] = useState<"all" | "wip" | "draft" | "failed">("all");
  const customShotsRef = React.useRef<ShotSpec[] | null>(
    defaultMasterReel.shots || null
  );

  const persistReelsToStorage = useCallback((nextReels: StudioReelRecord[]) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("zyvoriq_reels_repo_v2", JSON.stringify(nextReels));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Storyboard & Rendering State
  const [shots, setShots] = useState<ShotSpec[]>(
    defaultMasterReel.shots || []
  );
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(100);
  const [renderStageLabel, setRenderStageLabel] = useState<string>(
    defaultMasterReel.updatedAt
  );
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    defaultMasterReel.videoUrl
  );

  // ==========================================================================
  // 4. SYNC WITH URL QUERY PARAMS, LEFT SIDEBAR, /PERSONAS & PERSISTENT REELS
  // ==========================================================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const rawWf = params.get("workflow");
      const wf: StudioWorkflowMode | null =
        rawWf === "published" || rawWf === "wip" || rawWf === "create"
          ? rawWf
          : null;
      if (wf) {
        setWorkflow(wf);
        window.dispatchEvent(
          new CustomEvent("zyvoriq-workflow-changed", { detail: { mode: wf } })
        );
      }

      // Restore persistent reels & user-saved drafts from localStorage (merged with INITIAL_REELS_REPOSITORY)
      try {
        const savedReelsRaw = localStorage.getItem("zyvoriq_reels_repo_v2");
        if (savedReelsRaw) {
          const parsedReels = JSON.parse(savedReelsRaw);
          if (Array.isArray(parsedReels) && parsedReels.length > 0) {
            setReels(dedupeById([...parsedReels, ...INITIAL_REELS_REPOSITORY]));
          }
        }
      } catch {
        // ignore
      }

      // 1. Restore cached synthesized payload immediately on mount (zero network delay)
      const savedPayloadRaw = localStorage.getItem("zyvoriq_last_synthesized_payload_v1");
      const savedPrompt = localStorage.getItem("zyvoriq_last_prompt_v1");
      let hydratedFromCache = false;
      let synSavedTime = 0;
      if (savedPayloadRaw) {
        try {
          const parsedSyn = JSON.parse(savedPayloadRaw);
          if (parsedSyn && parsedSyn.title && parsedSyn.personas && parsedSyn.wardrobes) {
            synSavedTime = parsedSyn._savedAt ? new Date(parsedSyn._savedAt).getTime() : 0;
            if (savedPrompt) {
              const ytInSaved = extractYouTubeUrlFromText(savedPrompt);
              if (ytInSaved) {
                referenceYouTubeUrlRef.current = ytInSaved;
                setReferenceYouTubeUrl(ytInSaved);
              }
            }
            applySynthesizedAssets(parsedSyn, undefined, false);
            lastSynthesizedPromptKeyRef.current = `${
              referenceYouTubeUrlRef.current || parsedSyn.creativeElevation?.youtubeMetadata?.url || ""
            } ${parsedSyn.storyline}`.trim();
            hydratedFromCache = true;
          }
        } catch {
          // fallback to network synthesis
        }
      }

      // 2. Sync custom personas & wardrobe selections made in /personas AFTER synthesized payload hydration
      try {
        let mergedPersonasPool = [...PERSONAS_CATALOG];
        const dynRaw = localStorage.getItem("zyvoriq_dynamic_catalog_v1");
        if (dynRaw) {
          const dynParsed = JSON.parse(dynRaw);
          if (Array.isArray(dynParsed.personas) && dynParsed.personas.length > 0) {
            mergedPersonasPool = dedupeById([...dynParsed.personas, ...mergedPersonasPool]);
            setPersonasCatalog((prev) => dedupeById([...dynParsed.personas, ...prev]));
          }
          if (Array.isArray(dynParsed.wardrobes) && dynParsed.wardrobes.length > 0) {
            setWardrobeCatalog((prev) => dedupeById([...dynParsed.wardrobes, ...prev]));
          }
          if (dynParsed.accessory && typeof dynParsed.accessory.id === "string") {
            setAccessoriesCatalog((prev) => dedupeById([dynParsed.accessory, ...prev]));
          }
          if (dynParsed.venue && typeof dynParsed.venue.id === "string") {
            setVenuesCatalog((prev) => dedupeById([dynParsed.venue, ...prev]));
          }
        }

        const savedMatrix = localStorage.getItem("zyvoriq_cast_matrix_v1");
        if (savedMatrix) {
          const parsed = JSON.parse(savedMatrix);
          if (Array.isArray(parsed.customPersonas) && parsed.customPersonas.length > 0) {
            mergedPersonasPool = dedupeById([...parsed.customPersonas, ...mergedPersonasPool]);
            setPersonasCatalog((prev) => dedupeById([...parsed.customPersonas, ...prev]));
          }
          const matrixSavedTime = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
          const fromPersonas = params.get("from") === "personas";
          if (fromPersonas || !hydratedFromCache || matrixSavedTime >= synSavedTime) {
            if (parsed.selectedIds) {
              const cleanSel = dedupeSelectedPersonaIds(parsed.selectedIds);
              setSelectedPersonaIds((prev) => dedupeSelectedPersonaIds(parsed.selectedIds, prev));

              const wMap: Record<string, { act1Id: string; act2Id: string; accessoryId: string }> =
                parsed.wardrobeMap || {};
              const femId = cleanSel.female_lead?.[0];
              const maleId = cleanSel.male_lead?.[0];
              const supId = cleanSel.supporting?.[0];
              const bgId = cleanSel.background?.[0];
              const audId = cleanSel.audience?.[0];

              const femP = mergedPersonasPool.find((p) => p.id === femId);
              const maleP = mergedPersonasPool.find((p) => p.id === maleId);
              const supP = mergedPersonasPool.find((p) => p.id === supId);
              const bgP = mergedPersonasPool.find((p) => p.id === bgId);
              const audP = mergedPersonasPool.find((p) => p.id === audId);

              if (femId && (wMap[femId]?.act1Id || femP?.defaultAct1WardrobeId)) {
                setWomenAct1Id(wMap[femId]?.act1Id || femP!.defaultAct1WardrobeId);
              }
              if (femId && (wMap[femId]?.act2Id || femP?.defaultAct2WardrobeId)) {
                setWomenAct2Id(wMap[femId]?.act2Id || femP!.defaultAct2WardrobeId);
              }
              if (maleId && (wMap[maleId]?.act1Id || maleP?.defaultAct1WardrobeId)) {
                setMenAct1Id(wMap[maleId]?.act1Id || maleP!.defaultAct1WardrobeId);
              }
              if (maleId && (wMap[maleId]?.act2Id || maleP?.defaultAct2WardrobeId)) {
                setMenAct2Id(wMap[maleId]?.act2Id || maleP!.defaultAct2WardrobeId);
              }
              if (supId && (wMap[supId]?.act1Id || supP?.defaultAct1WardrobeId)) {
                setSupportingWardrobeId(wMap[supId]?.act1Id || supP!.defaultAct1WardrobeId);
              }
              if (bgId && (wMap[bgId]?.act1Id || bgP?.defaultAct1WardrobeId)) {
                setBackgroundWardrobeId(wMap[bgId]?.act1Id || bgP!.defaultAct1WardrobeId);
              }
              if (audId && (wMap[audId]?.act1Id || audP?.defaultAct1WardrobeId)) {
                setAudienceWardrobeId(wMap[audId]?.act1Id || audP!.defaultAct1WardrobeId);
              }
              const accCandidate =
                (femId && wMap[femId]?.accessoryId) ||
                (maleId && wMap[maleId]?.accessoryId) ||
                femP?.defaultAccessoryId ||
                maleP?.defaultAccessoryId;
              if (accCandidate) {
                setAccessoryId(accCandidate);
              }
              customShotsRef.current = null;
            }
            if (fromPersonas) {
              setCreateStep(2);
              setStatusBanner(
                "✓ Locked Cast & Per-Character Wardrobes synced from Personas & Wardrobe Library!"
              );
            }
          }
        }
      } catch {
        // ignore
      }
      let cancelled = false;
      (async () => {
        if (!hydratedFromCache && savedPrompt && savedPrompt.trim().length > 0) {
          await synthesizeFromNewPrompt(savedPrompt, false);
        }
        try {
          const jRes = await fetch("/api/swarm/jobs?latest=true");
          const jData = await jRes.json().catch(() => ({}));
          const latestJob = jData?.job;
          if (!cancelled && latestJob && Date.now() - (latestJob.createdAt || 0) < 30 * 60 * 1000) {
            if (typeof latestJob.progress === "number") setRenderProgress(latestJob.progress);
            if (typeof latestJob.stageLabel === "string") setRenderStageLabel(latestJob.stageLabel);
            if (Array.isArray(latestJob.logs)) setRenderLogs(latestJob.logs);
            if (typeof latestJob.combinedSrc === "string" && latestJob.combinedSrc) {
              setActiveVideoUrl(latestJob.combinedSrc);
            }
            if (latestJob.status === "running") {
              setIsRendering(true);
              const jobId = latestJob.id;
              while (!cancelled) {
                await new Promise((r) => setTimeout(r, 3000));
                const pollRes = await fetch(`/api/swarm/jobs?id=${encodeURIComponent(jobId)}`);
                const pollData = await pollRes.json().catch(() => ({}));
                const j = pollData?.job;
                if (!j) continue;
                if (typeof j.progress === "number") setRenderProgress(j.progress);
                if (typeof j.stageLabel === "string") setRenderStageLabel(j.stageLabel);
                if (Array.isArray(j.logs)) setRenderLogs(j.logs);
                if (typeof j.combinedSrc === "string" && j.combinedSrc) {
                  setActiveVideoUrl((prev) => (prev !== j.combinedSrc ? j.combinedSrc : prev));
                }
                if (j.status === "completed" || j.status === "error") {
                  setIsRendering(false);
                  break;
                }
              }
            }
          }
        } catch {
          // ignore
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchWorkflow = useCallback(
    (nextMode: StudioWorkflowMode) => {
      setWorkflow(nextMode);
      if (nextMode === "published") {
        setCanvasTab("video");
        setActiveVideoUrl((prev) => prev || getById(reels, selectedReelId).videoUrl);
      } else if (nextMode === "wip") {
        setCanvasTab("shots");
      } else {
        setCanvasTab("ensemble");
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("zyvoriq-workflow-changed", { detail: { mode: nextMode } })
        );
      }
    },
    [reels, selectedReelId]
  );

  useEffect(() => {
    const onSetWf = (e: Event) => {
      const ce = e as CustomEvent<{ mode: StudioWorkflowMode }>;
      if (ce.detail?.mode) switchWorkflow(ce.detail.mode);
    };
    window.addEventListener("zyvoriq-set-workflow", onSetWf);
    return () => window.removeEventListener("zyvoriq-set-workflow", onSetWf);
  }, [switchWorkflow]);

  // ==========================================================================
  // 5. STRUCTURED SHOT COMPILER (ZERO REGEX)
  // ==========================================================================
  const getDynamicWardrobeForCategory = useCallback(
    (category: PersonaCategory, act?: 1 | 2) => {
      return dedupeById(
        wardrobeCatalog.filter(
          (w) =>
            w.category === category &&
            (act === undefined || w.act === act || w.act === "both")
        )
      );
    },
    [wardrobeCatalog]
  );

  const compileStructuredShots = useCallback((): ShotSpec[] => {
    const durationObj = getById(DURATIONS_CATALOG, durationId);
    const countryObj = getById(COUNTRIES_CATALOG, countryId);
    const venueObj = getById(venuesCatalog, venueId);
    const lightObj = getById(LIGHTING_CATALOG, lightingId);
    const wAct1 = getById(wardrobeCatalog, womenAct1Id);
    const wAct2 = getById(wardrobeCatalog, womenAct2Id);
    const mAct1 = getById(wardrobeCatalog, menAct1Id);
    const mAct2 = getById(wardrobeCatalog, menAct2Id);
    const supW = getById(wardrobeCatalog, supportingWardrobeId);
    const bgW = getById(wardrobeCatalog, backgroundWardrobeId);
    const audW = getById(wardrobeCatalog, audienceWardrobeId);
    const lyricLines = lyrics
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const femPersona =
      personasCatalog.find((p) => p.id === selectedPersonaIds.female_lead?.[0]) ||
      personasCatalog.find((p) => p.category === "female_lead") ||
      personasCatalog[0];
    const femPersona2 = personasCatalog.find(
      (p) => p.id === selectedPersonaIds.female_lead?.[1]
    );
    const malePersona =
      personasCatalog.find((p) => p.id === selectedPersonaIds.male_lead?.[0]) ||
      personasCatalog.find((p) => p.category === "male_lead");
    const supPersona =
      personasCatalog.find((p) => p.id === selectedPersonaIds.supporting?.[0]) ||
      personasCatalog.find((p) => p.category === "supporting");
    const bgPersona =
      personasCatalog.find((p) => p.id === selectedPersonaIds.background?.[0]) ||
      personasCatalog.find((p) => p.category === "background");
    const audPersona =
      personasCatalog.find((p) => p.id === selectedPersonaIds.audience?.[0]) ||
      personasCatalog.find((p) => p.category === "audience");

    const isFemaleOnlyVocal =
      vocalId === "voc_female_solo" || vocalId === "voc_girl_group";
    const isMaleOnlyVocal =
      vocalId === "voc_male_solo" || vocalId === "voc_boy_band";

    const primaryLead = isMaleOnlyVocal && malePersona ? malePersona : femPersona;
    const shot2Lead =
      !isFemaleOnlyVocal && malePersona && malePersona.id !== primaryLead?.id
        ? malePersona
        : femPersona2 || malePersona || supPersona || primaryLead;
    const harmonyPartner = femPersona2 || shot2Lead;

    const count = durationObj.shotsCount || 6;
    const secPerShot = Math.round(durationObj.seconds / count);
    const totalActs = Math.max(1, Math.ceil(count / 3));
    const fmtSec = (sec: number) =>
      `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

    return Array.from({ length: count }, (_, idx) => {
      const isAct1 = idx < Math.ceil(count / 2);
      const actNum = Math.min(totalActs, Math.floor(idx / 3) + 1);
      const startSec = idx * secPerShot;
      const endSec = (idx + 1) * secPerShot;
      const timecode = `${fmtSec(startSec)}–${fmtSec(endSec)}`;
      const camObj =
        CAMERA_MOVES_CATALOG[idx % CAMERA_MOVES_CATALOG.length];

      const act1Summary = `${wAct1.label} • ${mAct1.label}`;
      const act2Summary = `${wAct2.label} • ${mAct2.label}`;

      // Distribute the shots across all 6 selected Cast Personas so every vocal assignment & scene anchor is 100% matched
      const shotSlot = idx % 6;
      let subjectClause = "";
      let previewPhotoUrl = primaryLead?.photoUrl || "/assets/characters/ananya_roy_in.jpg";

      if (shotSlot === 0) {
        // Opening Hook — Female Lead / Primary Lead
        const leadW = primaryLead?.category === "male_lead" ? mAct1.promptSpec : wAct1.promptSpec;
        subjectClause = `${primaryLead?.name} (${primaryLead?.facialSpec}) wearing ${leadW}`;
        previewPhotoUrl = primaryLead?.photoUrl || previewPhotoUrl;
      } else if (shotSlot === 1) {
        // Male Lead / Counter-Lead Confrontation
        const counterW =
          shot2Lead?.category === "male_lead" ? mAct1.promptSpec : wAct1.promptSpec;
        const leadW = primaryLead?.category === "male_lead" ? mAct1.promptSpec : wAct1.promptSpec;
        subjectClause = `${shot2Lead?.name} (${shot2Lead?.facialSpec}) wearing ${counterW} in dramatic interplay with ${primaryLead?.name} (${leadW})`;
        previewPhotoUrl = shot2Lead?.photoUrl || previewPhotoUrl;
      } else if (shotSlot === 2) {
        // Female Co-Lead & Supporting Cast Build
        const coLead = femPersona2 || primaryLead;
        const coLeadW = coLead?.category === "male_lead" ? mAct1.promptSpec : wAct1.promptSpec;
        subjectClause = `${coLead?.name} (${coLead?.facialSpec}) wearing ${coLeadW} & ${primaryLead?.name} surrounded by ${supPersona?.name} (${supW.promptSpec})`;
        previewPhotoUrl = femPersona2?.photoUrl || supPersona?.photoUrl || previewPhotoUrl;
      } else if (shotSlot === 3) {
        // Couture Transformation & Ensemble Drop
        const leadW2 = primaryLead?.category === "male_lead" ? mAct2.promptSpec : wAct2.promptSpec;
        const malePartnerClause =
          malePersona && malePersona.id !== primaryLead?.id
            ? ` & ${malePersona.name} (${mAct2.promptSpec})`
            : "";
        subjectClause = `${primaryLead?.name} (${leadW2})${malePartnerClause} transformed into Act II Couture flanked by ${bgPersona?.name} (${bgW.promptSpec})`;
        previewPhotoUrl = bgPersona?.photoUrl || primaryLead?.photoUrl || previewPhotoUrl;
      } else if (shotSlot === 4) {
        // Intimate 85mm Close-Up Bridge + Supporting Cast
        const leadW2 = primaryLead?.category === "male_lead" ? mAct2.promptSpec : wAct2.promptSpec;
        const partnerW2 =
          harmonyPartner?.category === "male_lead" ? mAct2.promptSpec : wAct2.promptSpec;
        subjectClause = `${primaryLead?.name} (${primaryLead?.facialSpec}) wearing ${leadW2} in intense 85mm close-up harmony with ${harmonyPartner?.name} (${partnerW2}) & ${supPersona?.name} (${supW.promptSpec})`;
        previewPhotoUrl =
          supPersona?.photoUrl || femPersona2?.photoUrl || primaryLead?.photoUrl || previewPhotoUrl;
      } else {
        // Grand Finale Full 6-Persona Cast & Crowd Reveal
        const leadW2 = primaryLead?.category === "male_lead" ? mAct2.promptSpec : wAct2.promptSpec;
        const ensembleNames = [
          `${primaryLead?.name} (${leadW2})`,
          malePersona && malePersona.id !== primaryLead?.id
            ? `${malePersona.name} (${mAct2.promptSpec})`
            : null,
          femPersona2 ? `${femPersona2.name} (${wAct2.promptSpec})` : null,
          supPersona ? `${supPersona.name} (${supW.promptSpec})` : null,
          bgPersona ? `${bgPersona.name} (${bgW.promptSpec})` : null,
          audPersona ? `${audPersona.name} (${audW.promptSpec})` : null,
        ]
          .filter(Boolean)
          .join(", ");
        subjectClause = `Full 6-Persona Ensemble — ${ensembleNames}`;
        previewPhotoUrl = audPersona?.photoUrl || primaryLead?.photoUrl || previewPhotoUrl;
      }

      const shotEmotionCue =
        shotEmotions[idx % Math.max(1, shotEmotions.length)] ||
        "Radiant confidence & expressive camera connection";
      const shotChoreoCue =
        shotChoreography[idx % Math.max(1, shotChoreography.length)] ||
        "Beat-synchronized movement locked to downbeats";

      return {
        shotId: `shot_${idx + 1}`,
        shotNumber: idx + 1,
        timecode,
        act: actNum,
        cameraMoveId: camObj.id,
        actionPrompt: `${subjectClause} at ${venueObj.label} (${countryObj.label}) • Emotion: ${shotEmotionCue} • Choreography: ${shotChoreoCue} • Camera: ${camObj.promptSpec} • Lighting: ${lightObj.promptSpec}`,
        wardrobeSummary: isAct1 ? act1Summary : act2Summary,
        lyricLine:
          lyricLines[idx % Math.max(1, lyricLines.length)] ||
          `Synchronized vocal line ${idx + 1}`,
        previewPhotoUrl,
      };
    });
  }, [
    durationId,
    countryId,
    venueId,
    lightingId,
    vocalId,
    womenAct1Id,
    womenAct2Id,
    menAct1Id,
    menAct2Id,
    supportingWardrobeId,
    backgroundWardrobeId,
    audienceWardrobeId,
    lyrics,
    selectedPersonaIds,
    personasCatalog,
    wardrobeCatalog,
    venuesCatalog,
    shotEmotions,
    shotChoreography,
  ]);

  useEffect(() => {
    if (customShotsRef.current && customShotsRef.current.length > 0) {
      setShots(customShotsRef.current);
    } else {
      setShots(compileStructuredShots());
    }
  }, [compileStructuredShots]);

  // ==========================================================================
  // 5B. FINAL COMPILED DETAILED MASTER PROMPT (LIVE REACTIVE ACROSS STEPS 01–04)
  // ==========================================================================
  const compiledMasterPrompt = React.useMemo(() => {
    const durationObj = getById(DURATIONS_CATALOG, durationId);
    const countryObj = getById(COUNTRIES_CATALOG, countryId);
    const regionObj = getById(REGIONS_CATALOG, regionId);
    const langObj = getById(LANGUAGES_CATALOG, languageId);
    const genreObj = getById(GENRES_CATALOG, genreId);
    const vocalObj = getById(VOCALS_CATALOG, vocalId);
    const venueObj = getById(venuesCatalog, venueId);
    const lightObj = getById(LIGHTING_CATALOG, lightingId);
    const demoObj = getById(DEMOGRAPHIES_CATALOG, demographyId);
    const platObj = getById(PLATFORMS_CATALOG, platformId);
    const ctypeObj = getById(CONTENT_TYPES_CATALOG, contentTypeId);

    const wAct1 = getById(wardrobeCatalog, womenAct1Id);
    const wAct2 = getById(wardrobeCatalog, womenAct2Id);
    const mAct1 = getById(wardrobeCatalog, menAct1Id);
    const mAct2 = getById(wardrobeCatalog, menAct2Id);
    const supW = getById(wardrobeCatalog, supportingWardrobeId);
    const bgW = getById(wardrobeCatalog, backgroundWardrobeId);
    const audW = getById(wardrobeCatalog, audienceWardrobeId);
    const accObj = getById(accessoriesCatalog, accessoryId);

    const fmtSpec = (item: { label: string; promptSpec: string }) =>
      item.promptSpec && item.promptSpec !== item.label
        ? `${item.label} — ${item.promptSpec}`
        : item.label;

    const castLines = (
      ["female_lead", "male_lead", "supporting", "background", "audience"] as PersonaCategory[]
    )
      .flatMap((cat) =>
        (selectedPersonaIds[cat] || [])
          .map((id) => personasCatalog.find((p) => p.id === id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
      )
      .map(
        (p, idx) =>
          `  ${idx + 1}. [${p.category.toUpperCase()}] ${p.name} (${p.roleTitle}) — Biometric Spec: ${p.facialSpec} | Reference Anchor: ${p.photoUrl}`
      )
      .join("\n");

    const act1WardrobeBlock = `  • Female Lead (Act I 0:00–0:30): ${fmtSpec(wAct1)}\n  • Male Lead / Antagonist (Act I 0:00–0:30): ${fmtSpec(mAct1)}\n  • Backup Choreography (Act I): ${fmtSpec(bgW)}`;

    const endTimecodeLabel =
      durationObj.seconds >= 120
        ? `${Math.floor(durationObj.seconds / 60)}:${String(durationObj.seconds % 60).padStart(2, "0")}`
        : durationObj.seconds === 90
          ? "1:30"
          : "1:00";
    const act2WardrobeBlock = `  • Female Lead (Act II+ 0:30–${endTimecodeLabel}): ${fmtSpec(wAct2)}\n  • Male Lead / Antagonist (Act II+ 0:30–${endTimecodeLabel}): ${fmtSpec(mAct2)}\n  • Supporting Stage / Musicians: ${fmtSpec(supW)}`;

    const audioEngineObj = getById(AUDIO_ENGINES_CATALOG, audioEngineId);
    const isLyriaMode = audioEngineId === "omni_lyria3";

    const shotLines = shots
      .map((s, idx) => {
        const camObj = getById(CAMERA_MOVES_CATALOG, s.cameraMoveId);
        const romanAct = ["I", "II", "III", "IV", "V", "VI"][Math.max(0, (s.act || 1) - 1)] || String(s.act);
        const turnTag = `Turn ${s.act}.${s.shotNumber} (Act ${romanAct})`;
        const shotNumPadded = String(s.shotNumber).padStart(2, "0");
        const emo = shotEmotions[idx % Math.max(1, shotEmotions.length)] || "";
        const cho = shotChoreography[idx % Math.max(1, shotChoreography.length)] || "";
        const opt = shotLightingAndOptics[idx % Math.max(1, shotLightingAndOptics.length)] || camObj.promptSpec;
        return isLyriaMode
          ? `  • Shot ${shotNumPadded} [${s.timecode} • ${turnTag}]:\n    - Camera, Optics & Kelvin Rig: ${camObj.label} (${opt})\n    - Dual-Mode Viseme & Gaze Acting: Active vocalist executes beat-locked open-mouth phoneme articulation (r >= 0.72) while non-singing dancers/ensemble maintain 100% closed-lips eye-acting (RMS <= 0.015) — (${emo})\n    - 8-Count Choreography & Blocking: ${cho}\n    - Visual & Wardrobe Direction: ${s.actionPrompt}\n    - Lyria 3 Pro Vocal & Lyrical Line (${bpm} BPM • ${musicalKey}): "${s.lyricLine}"`
          : `  • Shot ${shotNumPadded} [${s.timecode} • ${turnTag}]:\n    - Camera, Optics & Kelvin Rig: ${camObj.label} (${opt})\n    - Human Emotion & Viseme Expression: ${emo}\n    - 8-Count Choreography & Blocking: ${cho}\n    - Visual & Wardrobe Direction: ${s.actionPrompt}\n    - Native 48kHz Vocal & Lip-Sync Line (${bpm} BPM • ${musicalKey}): "${s.lyricLine}"`;
      })
      .join("\n\n");

    const safeConceptDirective = compiledConceptDirective || storyline;

    return [
      `================================================================================`,
      `UNIFIED MASTER PRODUCTION PROMPT — ${
        isLyriaMode
          ? "OMNI 1.1 FLASH + LYRIA 3 PRO PREVIEW (v8.1.0)"
          : "GEMINI OMNI 1.1 FLASH NATIVE (v8.1.0)"
      }`,
      isLyriaMode
        ? `Target Endpoints: POST https://generativelanguage.googleapis.com/v1beta/interactions + POST https://generativelanguage.googleapis.com/v1beta/models/lyria-3-pro-preview:generateContent`
        : `Target Endpoint: POST https://generativelanguage.googleapis.com/v1beta/interactions`,
      isLyriaMode
        ? `Model Architecture: models/gemini-omni-1.1-flash (24/1 CFR Dual-Mode Viseme & Nayan-Abhinaya Video) + models/lyria-3-pro-preview (Continuous 48,000 Hz Stereo Studio Song Master @ ${bpm} BPM in ${musicalKey})`
        : `Model Architecture: models/gemini-omni-1.1-flash (24/1 CFR Video + Native 48,000 Hz Stereo Vocal/Music @ ${bpm} BPM in ${musicalKey})`,
      `Title: ${title} | Duration: ${durationObj.label} | Format: ${platObj.label} (${ctypeObj.label})`,
      `================================================================================`,
      ``,
      `[1. CORE CONCEPT & STORYLINE DIRECTIVE]`,
      `  ${safeConceptDirective}`,
      `  Target Audience & Vibe: ${demoObj.label} • ${regionObj.label}`,
      ``,
      `[1B. CREATIVE ELEVATION & SURPASS ARCHITECTURE (DECONSTRUCT -> ELEVATE -> SURPASS)]`,
      creativeElevation.youtubeMetadata
        ? `  • Deconstructed YouTube Reference: "${creativeElevation.youtubeMetadata.title}" (${creativeElevation.youtubeMetadata.channelName}) — ${creativeElevation.youtubeMetadata.url}`
        : `  • Source Mode: Original Creative Seed Deconstruction & Elevation`,
      `  • Core Hook Analysis: ${creativeElevation.deconstructedCore}`,
      `  • Reference Limitations Overcome: ${creativeElevation.identifiedLimitations.join(" | ")}`,
      `  • Creative Surpass Strategy (${creativeElevation.innovationScore}): ${creativeElevation.surpassStrategy}`,
      `  • Act I -> Act II 00:30 Twist: ${creativeElevation.act1ToAct2Twist}`,
      `  • Sonic & Harmonic Innovation: ${creativeElevation.sonicInnovation}`,
      `  • ${shots.length}-Shot Kinetic Choreography & Camera Upgrade: ${creativeElevation.choreographyAndCameraUpgrade}`,
      ``,
      `[2. MUSICAL SCORE, VOICE TYPE, BPM & VOCAL HARMONY SPEC (48,000 Hz STEREO)]`,
      `  • Audio & Music Synthesis Engine: ${fmtSpec(audioEngineObj)}`,
      `  • Genre & Instrumentation: ${fmtSpec(genreObj)} (Locked @ ${bpm} BPM in ${musicalKey})`,
      `  • Vocal Arrangement: ${fmtSpec(vocalObj)}`,
      `  • Voice Type & Vocal Timbre: ${voiceType}`,
      `  • Language & Phonetics: ${fmtSpec(langObj)}`,
      isLyriaMode
        ? `  • Dual-Mode Active Vocalist Viseme & Non-Singing Closed-Lips Law: Continuous ${durationObj.seconds}.0s 48,000 Hz studio vocal & instrumental song generated via models/lyria-3-pro-preview (-14.0 LUFS EBU R128 @ ${bpm} BPM in ${musicalKey}). Active lead/co-lead vocalists execute beat-locked open-mouth phoneme articulation (r >= 0.72), while non-singing backup dancers, musicians, and crowd maintain 100% closed-lips Nayan-Abhinaya eye-acting (RMS <= 0.015).`
        : `  • Lip-Sync & Acoustic Law: Continuous upbeat musical score and natural expressive lip-sync articulation from t=0.00s to final frame.`,
      ``,
      `[3. ENSEMBLE CAST ACROSS 5 TIERS, HUMAN EMOTIONS & 8-COUNT CHOREOGRAPHY BIBLE]`,
      castLines,
      `  • Human Emotions & Facial Expression Arc: ${humanEmotions}`,
      `  • Choreography & Dance Formation Blocking: ${choreography}`,
      ``,
      `[4. LOCATIONS, BACKGROUND SCENERY & ACT I -> ACT II+ WARDROBE TRANSFORMATION]`,
      `  • Country & Destination: ${fmtSpec(countryObj)}`,
      `  • Venue Architecture: ${fmtSpec(venueObj)}`,
      `  • Background Scenery & Atmospheric FX: ${backgroundEnvironment}`,
      `  • Lighting & Color Grade: ${fmtSpec(lightObj)}`,
      `  • Figure-Ground Contrast Separation: ${figureGroundContrastSpec}`,
      act1WardrobeBlock,
      act2WardrobeBlock,
      `  • VIP Audience Dress Code: ${fmtSpec(audW)}`,
      `  • Footwear, Hair, Accessories & Live Instruments: ${fmtSpec(accObj)} | ${instrumentAndStagePropsSpec}`,
      ``,
      `[5. MULTI-TURN SHOT-BY-SHOT EXECUTION SCRIPT (${shots.length} TURNS @ 24/1 CFR)]`,
      shotLines,
    ].join("\n");
  }, [
    title,
    storyline,
    compiledConceptDirective,
    creativeElevation,
    durationId,
    countryId,
    regionId,
    languageId,
    genreId,
    bpm,
    musicalKey,
    vocalId,
    audioEngineId,
    venueId,
    lightingId,
    shotLightingAndOptics,
    figureGroundContrastSpec,
    instrumentAndStagePropsSpec,
    demographyId,
    platformId,
    contentTypeId,
    womenAct1Id,
    womenAct2Id,
    menAct1Id,
    menAct2Id,
    supportingWardrobeId,
    backgroundWardrobeId,
    audienceWardrobeId,
    accessoryId,
    selectedPersonaIds,
    personasCatalog,
    wardrobeCatalog,
    accessoriesCatalog,
    venuesCatalog,
    shots,
    backgroundEnvironment,
    humanEmotions,
    shotEmotions,
    voiceType,
    choreography,
    shotChoreography,
  ]);

  const effectiveMasterPrompt = customMasterPromptOverride.trim()
    ? customMasterPromptOverride
    : compiledMasterPrompt;

  // ==========================================================================
  // 6. END-TO-END WORKFLOW HANDLERS
  // ==========================================================================

  const buildActiveWardrobeOverrides = (): Record<
    string,
    { act1Id: string; act2Id: string; accessoryId: string }
  > => {
    const map: Record<string, { act1Id: string; act2Id: string; accessoryId: string }> = {};
    for (const id of selectedPersonaIds.female_lead || []) {
      map[id] = { act1Id: womenAct1Id, act2Id: womenAct2Id, accessoryId };
    }
    for (const id of selectedPersonaIds.male_lead || []) {
      map[id] = { act1Id: menAct1Id, act2Id: menAct2Id, accessoryId };
    }
    for (const id of selectedPersonaIds.supporting || []) {
      map[id] = { act1Id: supportingWardrobeId, act2Id: supportingWardrobeId, accessoryId };
    }
    for (const id of selectedPersonaIds.background || []) {
      map[id] = { act1Id: backgroundWardrobeId, act2Id: backgroundWardrobeId, accessoryId };
    }
    for (const id of selectedPersonaIds.audience || []) {
      map[id] = { act1Id: audienceWardrobeId, act2Id: audienceWardrobeId, accessoryId };
    }
    return map;
  };

  // Save Project as Persistent Draft in Drafts & Render Jobs Repository
  const handleSaveDraft = () => {
    const cleanTitle = title.replace(/\s*\(Saved Draft\)|\s*\(Failed Render\)/gi, "");
    const newDraft: StudioReelRecord = {
      id: `draft_${Date.now()}`,
      title: `${cleanTitle} (Saved Draft)`,
      status: "draft",
      progress: 50,
      videoUrl: activeVideoUrl,
      durationId,
      countryId,
      regionId,
      languageId,
      demographyId,
      platformId,
      contentTypeId,
      genreId,
      vocalId,
      venueId,
      lightingId,
      audioEngineId,
      storyline,
      lyrics,
      customMasterPromptOverride,
      selectedPersonaIds,
      wardrobeOverrides: buildActiveWardrobeOverrides(),
      shots,
      updatedAt: "Saved Just Now • Ready to Resume",
    };
    setReels((prev) => {
      const next = [newDraft, ...prev];
      persistReelsToStorage(next);
      return next;
    });
    setStatusBanner(
      "✓ Draft saved to persistent storage ('Drafts & Render Jobs') with full Cast, Wardrobe, Storyline & Lyrics."
    );
  };

  const handleDeleteReel = (reelId: string) => {
    setReels((prev) => {
      const next = prev.filter((r) => r.id !== reelId);
      persistReelsToStorage(next);
      return next;
    });
    setStatusBanner("✓ Removed item from Drafts & Render Jobs.");
  };

  // Execute Full Live Render via models/gemini-omni-1.1-flash (+ optional models/lyria-3-pro-preview) (/api/swarm/jobs)
  const executeEndToEndRender = async (modeLabel: string) => {
    const activeDurationSec = getById(DURATIONS_CATALOG, durationId).seconds;
    setIsRendering(true);
    setRenderProgress(5);
    setRenderStageLabel(
      audioEngineId === "omni_lyria3"
        ? `Stage 1/${shots.length} • Synthesizing ${activeDurationSec}.0s Lyria 3 Pro studio song & developing closed-lips eye/body shots...`
        : `Stage 1/${shots.length} • Launching live models/gemini-omni-1.1-flash generation (Act I Turn 1A: 00:00–00:10)...`
    );
    setRenderLogs([]);
    setActiveVideoUrl("");
    setCanvasTab("video");

    try {
      const countryObj = getById(COUNTRIES_CATALOG, countryId);
      const langObj = getById(LANGUAGES_CATALOG, languageId);
      const genreObj = getById(GENRES_CATALOG, genreId);
      const venueObj = getById(venuesCatalog, venueId);
      const lightObj = getById(LIGHTING_CATALOG, lightingId);
      const wAct1 = getById(wardrobeCatalog, womenAct1Id);
      const wAct2 = getById(wardrobeCatalog, womenAct2Id);
      const mAct1 = getById(wardrobeCatalog, menAct1Id);
      const mAct2 = getById(wardrobeCatalog, menAct2Id);

      // Helper to extract pure sung lyric text (strips [Shot XX • ...] and trailing (124 BPM) so the singer never pronounces stage tags)
      const cleanSungLyric = (rawLine: string) =>
        rawLine
          .replace(/^\[[^\]]*\]\s*/, "")
          .replace(/\s*\(\d+\s*BPM\)\s*$/i, "")
          .trim();

      const extractVocalRole = (rawLine: string) => {
        const m = rawLine.match(/^\[Shot\s*\d+\s*•\s*([^\]]+)\]/i);
        return m ? m[1].trim() : "Lead Playback Vocal";
      };

      const act1Shots = shots.filter((s) => s.act === 1);
      const act2Shots = shots.filter((s) => s.act !== 1);

      const userCustomPromptNote = customMasterPromptOverride.trim()
        ? ` Director Master Prompt Override: ${customMasterPromptOverride.trim().slice(0, 600)}.`
        : "";
      const safeConceptForRender = `${compiledConceptDirective || storyline}${userCustomPromptNote}`;

      const isLyriaMode = audioEngineId === "omni_lyria3";
      const isCinemaMode =
        contentTypeId === "ctype_cinema_film" || genreId === "gen_cinema_thriller";

      // Build individual 10-second turn prompts across all configured shots
      const turnPrompts = shots.map((s, idx) => {
        const isAct1 = s.act === 1;
        const femW = isAct1 ? wAct1.promptSpec || wAct1.label : wAct2.promptSpec || wAct2.label;
        const maleW = isAct1 ? mAct1.promptSpec || mAct1.label : mAct2.promptSpec || mAct2.label;
        const emo = shotEmotions[idx % Math.max(1, shotEmotions.length)] || humanEmotions;
        const cho = shotChoreography[idx % Math.max(1, shotChoreography.length)] || choreography;
        const sungLyric = cleanSungLyric(s.lyricLine);
        const vocalRole = extractVocalRole(s.lyricLine);

        if (isCinemaMode) {
          return [
            `Photorealistic 35mm Live-Action Cinema Concept: ${safeConceptForRender}.`,
            `Shot Action (${s.timecode}): ${s.actionPrompt}.`,
            `Venue & Atmosphere (${s.timecode}): ${countryObj.label} — ${venueObj.promptSpec || venueObj.label}. ${backgroundEnvironment} (${lightObj.promptSpec || lightObj.label}).`,
            `Real Adult Human Cast & Tailoring: ${activePersonasList
              .slice(0, 3)
              .map((p) => `${p.name} (${p.facialSpec})`)
              .join("; ")}. Lead Actress wearing ${femW}; Lead Actor wearing ${maleW}.`,
            `Dramatic Live-Action Blocking & Camera Movement: ${cho}.`,
            `Subtle Human Micro-Expressions & Natural Skin Texture: ${emo}. Real human skin pores, subtle wrinkles, natural breathing, zero CGI, zero cartoon, zero text overlays.`,
            `Live-Action Spoken Dialogue & Lip-Sync (48,000 Hz Stereo): ${vocalRole} speaks clearly on camera in ${langObj.label} with authentic human vocal emotion and natural synchronized lip movements: "${sungLyric}". Accompanied by realistic room tone, physical foley, and subtle ${genreObj.promptSpec || genreObj.label}.`,
          ].join(" ");
        }

        if (isLyriaMode) {
          return [
            `Concept: ${safeConceptForRender}.`,
            `Shot Action (${s.timecode}): ${s.actionPrompt}.`,
            `Venue & Atmosphere (${s.timecode}): ${countryObj.label} — ${venueObj.promptSpec || venueObj.label}. ${backgroundEnvironment} (${lightObj.promptSpec || lightObj.label}).`,
            `Cast & Couture Wardrobe: ${activePersonasList
              .slice(0, 3)
              .map((p) => `${p.name} (${p.facialSpec})`)
              .join("; ")}. Female Lead wearing ${femW}; Co-Stars wearing ${maleW}.`,
            `STRICT NON-VOCAL VISUAL PERFORMANCE (CLOSED-LIPS LOCK — ZERO LIP MOVEMENT): Every performer's mouth stays naturally CLOSED in a radiant, confident closed-lip smile throughout the entire 10-second shot. Nobody sings, speaks, or mouths words on camera — zero lip movement, zero phantom mouthing.`,
            `TALKING WITH EYES & EXPRESSIONS (NAYAN-ABHINAYA): Characters communicate purely through magnetic eye contact, smoldering kohl-lined gazes, playful winks over chic gold-rimmed glasses, raised eyebrows, confident head tilts, and facial micro-expressions (${emo}).`,
            `MUSIC-DRIVEN BODY LANGUAGE, WARDROBE PHYSICS & SHOT DEVELOPMENT: Develop the entire shot's body language, waist/hip isolations, hair flips, glamorous short sequin dress & mini-skirt fabric motion, and camera movement around the ${genreObj.promptSpec || genreObj.label} beat. Choreography: ${cho}.`,
          ].join(" ");
        }

        return [
          `Concept: ${safeConceptForRender}.`,
          `Shot Action (${s.timecode}): ${s.actionPrompt}.`,
          `Venue & Atmosphere (${s.timecode}): ${countryObj.label} — ${venueObj.promptSpec || venueObj.label}. ${backgroundEnvironment} (${lightObj.promptSpec || lightObj.label}).`,
          `Cast & Wardrobe: ${activePersonasList
            .slice(0, 3)
            .map((p) => `${p.name} (${p.facialSpec})`)
            .join("; ")}. Female Lead wearing ${femW}; Male Co-Star wearing ${maleW}.`,
          `Choreography & Facial Expression: ${cho}. Emotion: ${emo}.`,
          `Studio 48kHz Music & Singer Voice Direction: ${genreObj.promptSpec || genreObj.label}. ${voiceType}. Active Vocalist for this 10s shot: ${vocalRole} singing in ${langObj.label} with crystal-clear studio playback pitch, natural lip-sync, and upbeat rhythmic groove (never speak bracketed tags or BPM numbers).`,
          `Exact Sung Lyrics for this 10s Shot: "${sungLyric}"`,
        ].join(" ");
      });

      const act1Prompt = [
        `Concept: ${safeConceptForRender}.`,
        `Setting & Venue: ${countryObj.label} — ${venueObj.promptSpec || venueObj.label}.`,
        `Background & Lighting: ${backgroundEnvironment} (${lightObj.promptSpec || lightObj.label}).`,
        `Lead Cast: ${activePersonasList
          .slice(0, 3)
          .map((p) => `${p.name} (${p.roleTitle}: ${p.facialSpec})`)
          .join("; ")}.`,
        `Act I Wardrobe: Female Lead in ${wAct1.promptSpec || wAct1.label}; Co-Stars in ${
          mAct1.promptSpec || mAct1.label
        }.`,
        isCinemaMode
          ? `Spoken Live-Action Dialogue & Score: Characters speak their dialogue lines clearly in ${langObj.label} with natural lip-sync over ${genreObj.promptSpec || genreObj.label}.`
          : isLyriaMode
          ? `Closed-Lips Eye/Body Acting Law: Performers keep their lips naturally closed (zero lip movement) and communicate through eyes, winks, facial expressions, body language, and wardrobe physics driven by ${genreObj.promptSpec || genreObj.label}.`
          : `Music & Vocals: ${genreObj.promptSpec || genreObj.label}, ${voiceType}, sung in ${langObj.label}.`,
        `Choreography & Emotions: ${choreography}. ${humanEmotions}.`,
        `Act I Shot Progression: ${act1Shots
          .map(
            (s, idx) =>
              `[${s.timecode}] ${
                shotChoreography[idx % Math.max(1, shotChoreography.length)] || ""
              }${isLyriaMode && !isCinemaMode ? "" : ` (Dialogue: "${cleanSungLyric(s.lyricLine)}")`}`
          )
          .join(" | ")}`,
      ].join(" ");

      const act2Prompt = [
        `Concept Finale (Act II): ${safeConceptForRender}.`,
        `Setting & Venue: ${countryObj.label} — ${venueObj.promptSpec || venueObj.label}.`,
        `Background & Lighting: ${backgroundEnvironment} (${lightObj.promptSpec || lightObj.label}).`,
        `Lead Cast: ${activePersonasList
          .slice(0, 3)
          .map((p) => `${p.name} (${p.roleTitle}: ${p.facialSpec})`)
          .join("; ")}.`,
        `Act II Finale Wardrobe: Female Lead in ${wAct2.promptSpec || wAct2.label}; Co-Stars in ${
          mAct2.promptSpec || mAct2.label
        }.`,
        isCinemaMode
          ? `Spoken Live-Action Dialogue & Score: Characters speak their dialogue lines clearly in ${langObj.label} with natural lip-sync over ${genreObj.promptSpec || genreObj.label}.`
          : isLyriaMode
          ? `Closed-Lips Eye/Body Acting Law: Performers keep their lips naturally closed (zero lip movement) and communicate through eyes, winks, facial expressions, body language, and wardrobe physics driven by ${genreObj.promptSpec || genreObj.label}.`
          : `Music & Vocals: ${genreObj.promptSpec || genreObj.label}, ${voiceType}, sung in ${langObj.label}.`,
        `Choreography & Emotions: ${choreography}. ${humanEmotions}.`,
        `Act II Shot Progression: ${act2Shots
          .map(
            (s, idx) =>
              `[${s.timecode}] ${
                shotChoreography[(idx + 3) % Math.max(1, shotChoreography.length)] || ""
              }${isLyriaMode && !isCinemaMode ? "" : ` (Dialogue: "${cleanSungLyric(s.lyricLine)}")`}`
          )
          .join(" | ")}`,
      ].join(" ");

      const res = await fetch("/api/swarm/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          genre: genreObj.promptSpec || genreObj.label,
          bpm: Number(genreObj.promptSpec?.match(/(\d+)\s*BPM/i)?.[1]) || bpm || 124,
          audioEngine: isCinemaMode ? "omni_native" : audioEngineId,
          lyrics,
          voiceType,
          language: langObj.label,
          act1Prompt,
          act2Prompt,
          turnPrompts,
          leadPhotoUrl: activePersonasList[0]?.photoUrl || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      const jobId = data?.job?.id;
      if (!jobId) {
        throw new Error(data?.error || "Failed to start Gemini Omni 1.1 Flash render job");
      }

      setStatusBanner(
        `🚀 Live Gemini Omni 1.1 Flash render job (${jobId}) started! Turn 1A (10s preview) will stream into Master Player automatically as soon as it finishes.`
      );

      // Poll job state every 3s until completed or error, streaming each 10s/20s/30s/60s turn into Master Player
      let finished = false;
      while (!finished) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await fetch(`/api/swarm/jobs?id=${encodeURIComponent(jobId)}`);
        const pollData = await pollRes.json().catch(() => ({}));
        const j = pollData?.job;
        if (!j) continue;

        if (typeof j.progress === "number") setRenderProgress(j.progress);
        if (typeof j.stageLabel === "string") setRenderStageLabel(j.stageLabel);
        if (Array.isArray(j.logs)) setRenderLogs(j.logs);

        if (typeof j.combinedSrc === "string" && j.combinedSrc) {
          setActiveVideoUrl((prev) => (prev !== j.combinedSrc ? j.combinedSrc : prev));
        }

        if (j.status === "completed") {
          finished = true;
          setRenderProgress(100);
          const finalUrl = j.combinedSrc;
          setActiveVideoUrl(finalUrl);

          const completedReel: StudioReelRecord = {
            id: `reel_${Date.now()}`,
            title: title.includes(modeLabel) ? title : `${title} (${modeLabel})`,
            status: "published",
            progress: 100,
            videoUrl: finalUrl,
            durationId,
            countryId,
            regionId,
            languageId,
            demographyId,
            platformId,
            contentTypeId,
            genreId,
            vocalId,
            venueId,
            lightingId,
            audioEngineId,
            storyline,
            lyrics,
            customMasterPromptOverride,
            selectedPersonaIds,
            wardrobeOverrides: buildActiveWardrobeOverrides(),
            shots,
            updatedAt: "Published Just Now • 100% Complete",
          };

          setReels((prev) => {
            const next = [completedReel, ...prev];
            persistReelsToStorage(next);
            return next;
          });
          setSelectedReelId(completedReel.id);
          setStatusBanner(
            `✅ ${modeLabel} Complete! Brand-new ${activeDurationSec}.0s Master Reel is live in Master Player and persisted to Published Reels.`
          );
        } else if (j.status === "error") {
          finished = true;
          const failedReel: StudioReelRecord = {
            id: `failed_${Date.now()}`,
            title: `${title} (Failed Render)`,
            status: "failed",
            progress: renderProgress || 20,
            errorReason: j.errorMsg || "Render job encountered an error",
            videoUrl: activeVideoUrl,
            durationId,
            countryId,
            regionId,
            languageId,
            demographyId,
            platformId,
            contentTypeId,
            genreId,
            vocalId,
            venueId,
            lightingId,
            audioEngineId,
            storyline,
            lyrics,
            customMasterPromptOverride,
            selectedPersonaIds,
            wardrobeOverrides: buildActiveWardrobeOverrides(),
            shots,
            updatedAt: "Failed Just Now • Ready to Retry",
          };
          setReels((prev) => {
            const next = [failedReel, ...prev];
            persistReelsToStorage(next);
            return next;
          });
          setStatusBanner(`❌ Render error: ${j.errorMsg || "Job failed"}`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusBanner(`❌ Render error: ${msg}`);
    } finally {
      setIsRendering(false);
    }
  };

  // Load any Published Reel or Saved Draft directly into the 4-Step Studio (restoring 100% of studio state)
  const loadReelIntoWorkflow = (
    reel: StudioReelRecord,
    targetStep: 1 | 2 | 3 | 4 = 3
  ) => {
    const cleanTitle = reel.title.replace(/\s*\(Saved Draft\)|\s*\(Failed Render\)/gi, "");
    const durObj = getById(DURATIONS_CATALOG, reel.durationId);
    const countryObj = getById(COUNTRIES_CATALOG, reel.countryId);
    const genreObj = getById(GENRES_CATALOG, reel.genreId);
    const langObj = getById(LANGUAGES_CATALOG, reel.languageId);
    const vocalObj = getById(VOCALS_CATALOG, reel.vocalId);
    const venueObj = getById(venuesCatalog, reel.venueId);
    const lightObj = getById(LIGHTING_CATALOG, reel.lightingId);

    setSelectedReelId(reel.id);
    setTitle(cleanTitle);
    setCountryId(reel.countryId);
    setRegionId(reel.regionId);
    setLanguageId(reel.languageId);
    setDemographyId(reel.demographyId);
    setPlatformId(reel.platformId);
    setContentTypeId(reel.contentTypeId);
    setDurationId(reel.durationId);
    setGenreId(reel.genreId);
    setVocalId(reel.vocalId);
    setVenueId(reel.venueId);
    setLightingId(reel.lightingId);
    setSelectedPersonaIds(reel.selectedPersonaIds);
    setActiveVideoUrl(reel.videoUrl);
    setAudioEngineId(
      (reel.audioEngineId as "omni_lyria3" | "omni_native") || "omni_native"
    );
    setCustomMasterPromptOverride(reel.customMasterPromptOverride || "");

    // Restore Wardrobe & Accessory IDs from reel.wardrobeOverrides or the loaded reel's primary personas
    const femId = reel.selectedPersonaIds.female_lead?.[0];
    const maleId = reel.selectedPersonaIds.male_lead?.[0];
    const supId = reel.selectedPersonaIds.supporting?.[0];
    const bgId = reel.selectedPersonaIds.background?.[0];
    const audId = reel.selectedPersonaIds.audience?.[0];

    const femP = personasCatalog.find((p) => p.id === femId);
    const maleP = personasCatalog.find((p) => p.id === maleId);
    const supP = personasCatalog.find((p) => p.id === supId);
    const bgP = personasCatalog.find((p) => p.id === bgId);
    const audP = personasCatalog.find((p) => p.id === audId);

    const wOverrides = reel.wardrobeOverrides || {};
    const nextWAct1 =
      (femId && wOverrides[femId]?.act1Id) ||
      femP?.defaultAct1WardrobeId ||
      womenAct1Id;
    const nextWAct2 =
      (femId && wOverrides[femId]?.act2Id) ||
      femP?.defaultAct2WardrobeId ||
      womenAct2Id;
    const nextMAct1 =
      (maleId && wOverrides[maleId]?.act1Id) ||
      maleP?.defaultAct1WardrobeId ||
      menAct1Id;
    const nextMAct2 =
      (maleId && wOverrides[maleId]?.act2Id) ||
      maleP?.defaultAct2WardrobeId ||
      menAct2Id;
    const nextSupW =
      (supId && wOverrides[supId]?.act1Id) ||
      supP?.defaultAct1WardrobeId ||
      supportingWardrobeId;
    const nextBgW =
      (bgId && wOverrides[bgId]?.act1Id) ||
      bgP?.defaultAct1WardrobeId ||
      backgroundWardrobeId;
    const nextAudW =
      (audId && wOverrides[audId]?.act1Id) ||
      audP?.defaultAct1WardrobeId ||
      audienceWardrobeId;
    const nextAcc =
      (femId && wOverrides[femId]?.accessoryId) ||
      (maleId && wOverrides[maleId]?.accessoryId) ||
      femP?.defaultAccessoryId ||
      maleP?.defaultAccessoryId ||
      accessoryId;

    setWomenAct1Id(nextWAct1);
    setWomenAct2Id(nextWAct2);
    setMenAct1Id(nextMAct1);
    setMenAct2Id(nextMAct2);
    setSupportingWardrobeId(nextSupW);
    setBackgroundWardrobeId(nextBgW);
    setAudienceWardrobeId(nextAudW);
    setAccessoryId(nextAcc);

    const parsedBpm =
      Number(genreObj.promptSpec?.match(/(\d+)\s*BPM/i)?.[1]) ||
      (reel.contentTypeId === "ctype_cinema_film" ? 92 : 124);
    setBpm(parsedBpm);

    // Restore Lyrics, Storyline, 8-Dimension Specs & Creative Elevation Blueprint
    const leadNames = [femP?.name, maleP?.name, supP?.name]
      .filter(Boolean)
      .join(", ");
    const resolvedStoryline =
      reel.storyline ||
      `${cleanTitle} — ${durObj.seconds}-second ${genreObj.label} production set in ${countryObj.label} (${venueObj.label}) featuring ${leadNames || "Lead Ensemble"} in ${langObj.label} (${lightObj.label}).`;
    setStoryline(resolvedStoryline);
    setCompiledConceptDirective(resolvedStoryline);

    const resolvedLyrics =
      reel.lyrics ||
      (reel.shots && reel.shots.length > 0
        ? reel.shots.map((s) => s.lyricLine).join("\n")
        : Array.from({ length: durObj.shotsCount }, (_, i) => {
            const shotNum = String(i + 1).padStart(2, "0");
            const speaker =
              i % 2 === 0
                ? femP?.name || maleP?.name || "Lead Vocal"
                : maleP?.name || femP?.name || supP?.name || "Ensemble Vocal";
            return `[Shot ${shotNum} • ${speaker}] ${cleanTitle} — ${genreObj.label} vocal hook ${i + 1} in ${langObj.label} (${parsedBpm} BPM)`;
          }).join("\n"));
    setLyrics(resolvedLyrics);

    setBackgroundEnvironment(
      `${countryObj.promptSpec} • ${venueObj.promptSpec} • ${lightObj.promptSpec}`
    );
    setVoiceType(
      `${vocalObj.promptSpec} in ${langObj.label} (${genreObj.promptSpec})`
    );
    setHumanEmotions(
      reel.contentTypeId === "ctype_cinema_film"
        ? "Intimate dramatic realism, unretouched facial micro-expressions, and magnetic eye contact"
        : "Radiant joy, magnetic chemistry, expressive eye contact, and celebratory stage charisma"
    );
    setChoreography(
      reel.contentTypeId === "ctype_cinema_film"
        ? "Deliberate 35mm Steadicam blocking, dramatic staging, and natural lip-synced dialogue"
        : `High-energy ${genreObj.label} formation choreography synchronized to ${venueObj.label}`
    );

    setCreativeElevation((prev) => ({
      ...prev,
      sourceType: "original_prompt",
      youtubeMetadata: null,
      deconstructedCore: `${cleanTitle} — ${genreObj.label} set across ${venueObj.label} in ${countryObj.label} featuring ${leadNames || "5-Tier Studio Cast"}.`,
      surpassStrategy: `Elevates ${cleanTitle} into a ${durObj.seconds}-second (${durObj.shotsCount}-shot) 24/1 CFR production with locked character biometrics, Act I→Act II wardrobe transition, and 48,000 Hz stereo audio in ${langObj.label}.`,
      act1ToAct2Twist: `Multi-Act Transition across ${venueObj.label} (${lightObj.label}) with wardrobe shift from ${getById(wardrobeCatalog, nextWAct1).label} to ${getById(wardrobeCatalog, nextWAct2).label}.`,
      sonicInnovation: `48,000 Hz stereo ${vocalObj.label} in ${langObj.label} (${genreObj.label} @ ${parsedBpm} BPM, -14.0 LUFS)`,
      choreographyAndCameraUpgrade: `${durObj.shotsCount}-Shot Panavision camera progression across ${venueObj.label}`,
      innovationScore: `99.6 / 100 (${durObj.seconds}s Studio Master Loaded)`,
    }));

    try {
      const nowIso = new Date().toISOString();
      const existingDynRaw = localStorage.getItem("zyvoriq_dynamic_catalog_v1");
      const existingDyn = existingDynRaw ? JSON.parse(existingDynRaw) : {};
      localStorage.setItem(
        "zyvoriq_dynamic_catalog_v1",
        JSON.stringify({
          ...existingDyn,
          selectedIds: reel.selectedPersonaIds,
          savedAt: nowIso,
        })
      );
    } catch {
      // ignore
    }

    if (reel.shots && reel.shots.length > 0) {
      customShotsRef.current = reel.shots;
      setShots(reel.shots);
    } else {
      customShotsRef.current = null;
    }
    setWorkflow("create");
    setCreateStep(targetStep);
    setCanvasTab(targetStep === 4 ? "video" : targetStep === 3 ? "shots" : "ensemble");
    setStatusBanner(
      `✓ Loaded "${cleanTitle}" (${durObj.seconds}s • ${durObj.shotsCount} shots) into the 4-Step Studio with full Cast, Wardrobe & Storyboard!`
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("zyvoriq-workflow-changed", { detail: { mode: "create" } })
      );
    }
  };

  // Retry a Failed or Draft Reel in Drafts & Render Jobs
  const handleRetryFailedReel = async (failedReel: StudioReelRecord) => {
    loadReelIntoWorkflow(failedReel, 4);
    await executeEndToEndRender("Recovered Master");
    setReels((prev) => {
      const next = prev.map((r) =>
        r.id === failedReel.id
          ? {
              ...r,
              status: "published" as const,
              progress: 100,
              errorReason: undefined,
              updatedAt: "Recovered & Published",
            }
          : r
      );
      persistReelsToStorage(next);
      return next;
    });
  };

  // Resolve all currently selected Persona objects across the 5 tiers
  const activePersonasList = dedupeById(
    (
      ["female_lead", "male_lead", "supporting", "background", "audience"] as PersonaCategory[]
    ).flatMap((cat) =>
      (selectedPersonaIds[cat] || [])
        .map((id) => personasCatalog.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
    )
  );

  // Dynamically Reactive 12-Agent Swarm Telemetry & Concrete Per-Agent Outputs reflecting the active Studio project
  const danceMvAgents = React.useMemo<SwarmAgentStatus[]>(() => {
    const venueObj = getById(venuesCatalog, venueId);
    const accObj = getById(accessoriesCatalog, accessoryId);
    const wFem1Obj = getById(wardrobeCatalog, womenAct1Id);
    const wFem2Obj = getById(wardrobeCatalog, womenAct2Id);
    const wMale1Obj = getById(wardrobeCatalog, menAct1Id);
    const wMale2Obj = getById(wardrobeCatalog, menAct2Id);
    const wSupObj = getById(wardrobeCatalog, supportingWardrobeId);
    const wBgObj = getById(wardrobeCatalog, backgroundWardrobeId);
    const wAudObj = getById(wardrobeCatalog, audienceWardrobeId);

    return getDanceMusicVideoAgents({
      title,
      storyline,
      compiledConceptDirective,
      countryLabel: getById(COUNTRIES_CATALOG, countryId).label,
      genreLabel: getById(GENRES_CATALOG, genreId).label,
      languageLabel: getById(LANGUAGES_CATALOG, languageId).label,
      bpm,
      musicalKey,
      venueLabel: venueObj.label,
      venuePromptSpec: venueObj.promptSpec,
      lightingLabel: getById(LIGHTING_CATALOG, lightingId).label,
      shotLightingAndOptics,
      vocalLabel: getById(VOCALS_CATALOG, vocalId).label,
      castCount: activePersonasList.length,
      shotsCount: shots.length,
      isLyriaMode: audioEngineId === "omni_lyria3",
      isRendering,
      renderProgress,
      sourceType: creativeElevation.sourceType,
      youtubeReferenceTitle: creativeElevation.youtubeMetadata?.title,
      youtubeReferenceChannel: creativeElevation.youtubeMetadata?.channelName,
      youtubeReferenceUrl: creativeElevation.youtubeMetadata?.url,
      deconstructedCore: creativeElevation.deconstructedCore,
      identifiedLimitations: creativeElevation.identifiedLimitations,
      surpassStrategy: creativeElevation.surpassStrategy,
      act1ToAct2Twist: creativeElevation.act1ToAct2Twist,
      sonicInnovation: creativeElevation.sonicInnovation,
      choreographyAndCameraUpgrade: creativeElevation.choreographyAndCameraUpgrade,
      castDetails: activePersonasList.map((p) => ({
        role: p.roleTitle,
        name: p.name,
        ethnicity: p.ethnicity,
        facialSpec: p.facialSpec,
        photoUrl: p.photoUrl,
      })),
      act1FemaleWardrobe: `${wFem1Obj.label} (${wFem1Obj.promptSpec})`,
      act2FemaleWardrobe: `${wFem2Obj.label} (${wFem2Obj.promptSpec})`,
      act1MaleWardrobe: `${wMale1Obj.label} (${wMale1Obj.promptSpec})`,
      act2MaleWardrobe: `${wMale2Obj.label} (${wMale2Obj.promptSpec})`,
      supportingWardrobe: `${wSupObj.label} (${wSupObj.promptSpec})`,
      backgroundWardrobe: `${wBgObj.label} (${wBgObj.promptSpec})`,
      audienceWardrobe: `${wAudObj.label} (${wAudObj.promptSpec})`,
      figureGroundContrastSpec,
      accessoryLabel: accObj.label,
      accessoryPromptSpec: accObj.promptSpec,
      instrumentAndStagePropsSpec,
      backgroundEnvironment,
      choreographyGlobal: choreography,
      shotChoreography,
      humanEmotionsGlobal: humanEmotions,
      shotEmotions,
      voiceType,
      lyrics,
      judgeReceipt: creativeElevation.judgeReceipt,
    });
  }, [
    title,
    storyline,
    compiledConceptDirective,
    countryId,
    genreId,
    languageId,
    bpm,
    musicalKey,
    venuesCatalog,
    venueId,
    lightingId,
    shotLightingAndOptics,
    vocalId,
    accessoriesCatalog,
    accessoryId,
    wardrobeCatalog,
    womenAct1Id,
    womenAct2Id,
    menAct1Id,
    menAct2Id,
    supportingWardrobeId,
    backgroundWardrobeId,
    audienceWardrobeId,
    figureGroundContrastSpec,
    instrumentAndStagePropsSpec,
    activePersonasList,
    shots.length,
    audioEngineId,
    isRendering,
    renderProgress,
    creativeElevation,
    backgroundEnvironment,
    choreography,
    shotChoreography,
    humanEmotions,
    shotEmotions,
    voiceType,
    lyrics,
  ]);

  const inputCls =
    "w-full rounded-lg bg-[#121217] border border-white/[0.08] focus:border-white/40 px-3 py-2 text-xs text-white font-medium outline-none transition-colors";
  const labelCls =
    "block text-[11px] font-medium text-zinc-400 mb-1 tracking-tight";

  // Compute Contextual Next Step Guidance so User Always Knows What to Do Next
  const getNextActionGuide = (): {
    currentLabel: string;
    nextText: string;
    actionLabel: string;
    onAction: () => void;
  } => {
    if (workflow === "create") {
      if (createStep === 1) {
        return {
          currentLabel: "4-Step Studio • Step 01 of 04 (Story & Audio)",
          nextText:
            "Enter any prompt or YouTube URL below — clicking Next deconstructs, elevates & synthesizes all 8 dimensions.",
          actionLabel: isSynthesizingPrompt
            ? "Synthesizing from Prompt..."
            : "Synthesize Cast, Wardrobe & Lyrics (Go to Step 02) →",
          onAction: () => synthesizeFromNewPrompt(storyline, true),
        };
      }
      if (createStep === 2) {
        return {
          currentLabel: "4-Step Studio • Step 02 of 04 (Cast & Wardrobe)",
          nextText:
            `Review prompt-generated personas & outfits (or add custom personas in /personas), then compile ${shots.length} shots.`,
          actionLabel: `Next: 03. Storyboard (${shots.length} Shots) →`,
          onAction: () => {
            customShotsRef.current = null;
            setShots(compileStructuredShots());
            setCreateStep(3);
            setCanvasTab("shots");
          },
        };
      }
      if (createStep === 3) {
        return {
          currentLabel: "4-Step Studio • Step 03 of 04 (Storyboard)",
          nextText:
            "Customize any shot's camera rig, action prompt, or lyric line, then proceed to Master Render.",
          actionLabel: "Next: 04. Render & Export →",
          onAction: () => {
            setCreateStep(4);
            setCanvasTab("video");
          },
        };
      }
      return {
        currentLabel: "4-Step Studio • Step 04 of 04 (Render Master)",
        nextText:
          `Click Render to synthesize your ${getById(DURATIONS_CATALOG, durationId).seconds}.0s 9:16 MP4 Master Reel via Gemini Omni 1.1 Flash + Lyria 3 Pro.`,
        actionLabel: "Open Published Reels Library →",
        onAction: () => switchWorkflow("published"),
      };
    }
    if (workflow === "published") {
      return {
        currentLabel: "Published Reels Library",
        nextText:
          "Play any completed 9:16 master reel or load its blueprint back into the 4-Step Studio to remix or re-render.",
        actionLabel: "Open 4-Step Studio →",
        onAction: () => {
          switchWorkflow("create");
          setCreateStep(1);
        },
      };
    }
    return {
      currentLabel: "Drafts & Render Jobs",
      nextText:
        "Resume any saved draft into the 4-Step Studio or retry any failed render job.",
      actionLabel: "View Published Reels →",
      onAction: () => switchWorkflow("published"),
    };
  };

  const nextGuide = getNextActionGuide();

  return (
    <div className="w-full max-w-none min-h-screen bg-[#09090b] text-zinc-100">
      {/* ====================================================================
          TOP WORKFLOW BAR + "WHAT TO DO NEXT" GUIDANCE BAR
         ==================================================================== */}
      <div className="sticky top-0 z-40 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-4 py-2 space-y-2">
        {/* Top Row: Core Studio Views + /personas Link */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 bg-[#121217] p-1 rounded-lg border border-white/[0.06]">
            {[
              { id: "create", label: "4-Step Studio (Create & Edit)", icon: Sparkles },
              {
                id: "published",
                label: `Published Reels (${reels.filter((r) => r.status === "published").length})`,
                icon: CheckCircle2,
              },
              {
                id: "wip",
                label: `Drafts & Render Jobs (${reels.filter((r) => r.status !== "published").length})`,
                icon: Clock,
              },
            ].map((w) => {
              const Icon = w.icon;
              const active = workflow === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => switchWorkflow(w.id as StudioWorkflowMode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{w.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/personas")}
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Personas &amp; Wardrobe Library ({activePersonasList.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {/* Second Row: Unambiguous "What to Do Next" Bar */}
        <div className="w-full rounded-lg bg-[#121217] border border-white/[0.08] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-white text-zinc-950 font-semibold text-[11px]">
              {nextGuide.currentLabel}
            </span>
            <span className="text-zinc-300">{nextGuide.nextText}</span>
          </div>

          <button
            type="button"
            onClick={nextGuide.onAction}
            className="px-3 py-1 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>{nextGuide.actionLabel}</span>
          </button>
        </div>

        {statusBanner && (
          <div className="w-full rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300 flex items-center justify-between">
            <span>{statusBanner}</span>
            <button
              type="button"
              onClick={() => setStatusBanner("")}
              className="text-emerald-200 hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ====================================================================
          MAIN EDGE-TO-EDGE 2-COLUMN WORKSPACE
         ==================================================================== */}
      <div className="w-full max-w-none grid grid-cols-1 lg:grid-cols-12">
        {/* ==================================================================
            LEFT COLUMN (lg:col-span-7): ACTIVE WORKFLOW CONTROLS
           ================================================================== */}
        <div className="lg:col-span-7 p-4 sm:p-5 space-y-4 border-r border-white/[0.07]">
          {/* ================================================================
              WORKFLOW 1: CREATE REEL (Steps 01 -> 02 -> 03 -> 04)
             ================================================================ */}
          {workflow === "create" && (
            <div className="space-y-4">
              {/* Step Switcher for Create Reel */}
              <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-lg border border-white/[0.06] w-fit">
                {[
                  { s: 1, label: "01. Story & Audio" },
                  { s: 2, label: "02. Cast & Wardrobe" },
                  { s: 3, label: `03. Storyboard (${shots.length})` },
                  { s: 4, label: "04. Render & Export" },
                ].map((item) => (
                  <button
                    key={item.s}
                    type="button"
                    onClick={() => setCreateStep(item.s as 1 | 2 | 3 | 4)}
                    className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      createStep === item.s
                        ? "bg-white text-zinc-950 font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* CREATE STEP 01: STORY & AUDIO */}
              {createStep === 1 && (
                <div className="rounded-xl bg-[#0e0e12] border border-white/[0.07] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-sm font-semibold text-white">
                      01. Story Prompt, YouTube Deconstruction &amp; 8-Dimension AI Synthesis
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Models: Gemini 2.5 Flash + Omni 1.1 Flash + Lyria 3 Pro
                    </span>
                  </div>

                  {/* Primary Prompt Box + Dynamic AI Synthesizer Button */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>
                        New Reel Prompt or YouTube Link (Deconstructs &amp; Elevates into an Original Masterpiece)
                      </label>
                      <button
                        type="button"
                        disabled={isSynthesizingPrompt}
                        onClick={() => {
                          lastSynthesizedPromptKeyRef.current = "";
                          synthesizeFromNewPrompt(storyline, false);
                        }}
                        className="px-2.5 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>
                          {isSynthesizingPrompt
                            ? "Deconstructing & Elevating..."
                            : "✨ Deconstruct, Elevate & Synthesize All 8 Dimensions"}
                        </span>
                      </button>
                    </div>
                    {(referenceYouTubeUrl || creativeElevation.youtubeMetadata?.url) && (
                      <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/40 text-[11px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-semibold shrink-0">
                            Active YouTube Reference Locked
                          </span>
                          <span className="text-indigo-100 font-mono truncate">
                            {referenceYouTubeUrl || creativeElevation.youtubeMetadata?.url}
                          </span>
                          {creativeElevation.youtubeMetadata?.videoId && (
                            <span className="text-emerald-300 font-semibold shrink-0">
                              (v={creativeElevation.youtubeMetadata.videoId})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            referenceYouTubeUrlRef.current = "";
                            setReferenceYouTubeUrl("");
                            lastSynthesizedPromptKeyRef.current = "";
                          }}
                          className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.06] shrink-0 cursor-pointer"
                        >
                          ✕ Clear Reference
                        </button>
                      </div>
                    )}
                    <textarea
                      rows={2}
                      value={storyline}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setStoryline(nextVal);
                        const detectedYt = extractYouTubeUrlFromText(nextVal);
                        if (detectedYt) {
                          referenceYouTubeUrlRef.current = detectedYt;
                          setReferenceYouTubeUrl(detectedYt);
                        }
                        if (promptDebounceRef.current) {
                          clearTimeout(promptDebounceRef.current);
                        }
                        if (nextVal.trim().length >= 8) {
                          promptDebounceRef.current = setTimeout(() => {
                            synthesizeFromNewPrompt(nextVal, false);
                          }, 1400);
                        }
                      }}
                      placeholder="Type any random creative idea OR paste any YouTube link — Zyvoriq deconstructs the core hook & builds a 10x more innovative 2-Act masterpiece..."
                      className={inputCls}
                    />
                  </div>

                  {/* 3-STAGE CREATIVE SURPASS & ELEVATION BLUEPRINT (DECONSTRUCT -> ELEVATE -> SURPASS) */}
                  <div className="rounded-xl bg-[#121217] border border-indigo-500/30 p-3.5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-[10px] font-semibold uppercase tracking-wide">
                          {creativeElevation.sourceType === "youtube_reference"
                            ? "🎥 Live YouTube Deconstruction + Surpass Mode"
                            : "✨ 3-Stage Creative Surpass Compiler"}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          Deconstruct → Elevate → Surpass (Zero Imitation)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                        {creativeElevation.innovationScore}
                      </span>
                    </div>

                    {creativeElevation.youtubeMetadata && (
                      <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.08] flex items-center gap-3">
                        <img
                          src={creativeElevation.youtubeMetadata.thumbnailUrl}
                          alt={creativeElevation.youtubeMetadata.title}
                          className="w-20 h-12 rounded object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-white truncate">
                            Reference Deconstructed: {creativeElevation.youtubeMetadata.title}
                          </div>
                          <div className="text-[10px] text-indigo-300 truncate">
                            Channel: {creativeElevation.youtubeMetadata.channelName} • ID: {creativeElevation.youtubeMetadata.videoId}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">
                            {creativeElevation.youtubeMetadata.descriptionSnippet}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-[#09090b] border border-white/[0.06] space-y-1">
                        <div className="text-[10px] font-semibold text-indigo-300 uppercase">
                          1. Deconstructed Core &amp; Limitations Overcome
                        </div>
                        <p className="text-zinc-200 leading-snug">
                          {creativeElevation.deconstructedCore}
                        </p>
                        <ul className="text-[10px] text-zinc-400 list-disc list-inside space-y-0.5 pt-0.5">
                          {creativeElevation.identifiedLimitations.slice(0, 3).map((lim, i) => (
                            <li key={i} className="truncate">
                              {lim}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#09090b] border border-white/[0.06] space-y-1">
                        <div className="text-[10px] font-semibold text-emerald-300 uppercase">
                          2. How This Blueprint Surpasses Existing Content
                        </div>
                        <p className="text-zinc-200 leading-snug">
                          {creativeElevation.surpassStrategy}
                        </p>
                        <div className="text-[10px] text-amber-300/90 pt-0.5">
                          <span className="font-semibold">00:30 Act I→II Twist:</span>{" "}
                          {creativeElevation.act1ToAct2Twist}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div className="px-2.5 py-1.5 rounded bg-[#09090b] border border-white/[0.05] text-zinc-300">
                        <span className="font-semibold text-indigo-300">48kHz Sonic Upgrade:</span>{" "}
                        {creativeElevation.sonicInnovation}
                      </div>
                      <div className="px-2.5 py-1.5 rounded bg-[#09090b] border border-white/[0.05] text-zinc-300">
                        <span className="font-semibold text-emerald-300">{shots.length}-Shot Kinetic &amp; Camera Upgrade:</span>{" "}
                        {creativeElevation.choreographyAndCameraUpgrade}
                      </div>
                    </div>

                    {creativeElevation.judgeReceipt && (
                      <div className="px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[10px] space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-emerald-300">
                            ⚖️ Cross-Model Independent LLM-as-a-Judge Certified (Zero Self-Preference Bias)
                          </span>
                          <span className="text-zinc-300 font-mono text-[9.5px]">
                            Generator: <strong className="text-indigo-300">{creativeElevation.judgeReceipt.generatorModel}</strong> ({creativeElevation.judgeReceipt.generatorLatencyMs}ms) → Judge: <strong className="text-emerald-300">{creativeElevation.judgeReceipt.judgeModel}</strong> ({creativeElevation.judgeReceipt.judgeLatencyMs}ms)
                          </span>
                        </div>
                        <div className="text-zinc-300 leading-snug">
                          {creativeElevation.judgeReceipt.verdictSummary}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Title (Auto-Updates from Prompt)</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Duration</label>
                      <select
                        value={durationId}
                        onChange={(e) => {
                          const nextDur = e.target.value;
                          customShotsRef.current = null;
                          setDurationId(nextDur);
                          synthesizeFromNewPrompt(storyline, false, {
                            durationId: nextDur,
                          });
                        }}
                        className={inputCls}
                      >
                        {DURATIONS_CATALOG.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Genre &amp; BPM</label>
                      <select
                        value={genreId}
                        onChange={(e) => {
                          const nextGenre = e.target.value;
                          customShotsRef.current = null;
                          setGenreId(nextGenre);
                          synthesizeFromNewPrompt(storyline, false, {
                            genreId: nextGenre,
                          });
                        }}
                        className={inputCls}
                      >
                        {GENRES_CATALOG.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Language</label>
                      <select
                        value={languageId}
                        onChange={(e) => {
                          const nextLang = e.target.value;
                          customShotsRef.current = null;
                          setLanguageId(nextLang);
                          synthesizeFromNewPrompt(storyline, false, {
                            languageId: nextLang,
                          });
                        }}
                        className={inputCls}
                      >
                        {LANGUAGES_CATALOG.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Content Format &amp; Production Type</label>
                      <select
                        value={contentTypeId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setContentTypeId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {CONTENT_TYPES_CATALOG.map((ct) => (
                          <option key={ct.id} value={ct.id}>
                            {ct.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Target Platform &amp; Aspect Ratio</label>
                      <select
                        value={platformId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setPlatformId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {PLATFORMS_CATALOG.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Cultural Region &amp; Market</label>
                      <select
                        value={regionId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setRegionId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {REGIONS_CATALOG.map((rg) => (
                          <option key={rg.id} value={rg.id}>
                            {rg.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Target Audience Demography</label>
                      <select
                        value={demographyId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setDemographyId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {DEMOGRAPHIES_CATALOG.map((dm) => (
                          <option key={dm.id} value={dm.id}>
                            {dm.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Vocal Arrangement</label>
                        <select
                          value={vocalId}
                          onChange={(e) => {
                            const nextVocal = e.target.value;
                            customShotsRef.current = null;
                            setVocalId(nextVocal);
                            synthesizeFromNewPrompt(storyline, false, {
                              vocalId: nextVocal,
                            });
                          }}
                          className={inputCls}
                        >
                          {VOCALS_CATALOG.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>
                          Audio &amp; Music Engine (Omni 1.1 vs Omni 1.1 + Lyria-3-pro-preview)
                        </label>
                        <select
                          value={audioEngineId}
                          onChange={(e) =>
                            setAudioEngineId(e.target.value as "omni_lyria3" | "omni_native")
                          }
                          className={inputCls}
                        >
                          {AUDIO_ENGINES_CATALOG.map((eng) => (
                            <option key={eng.id} value={eng.id}>
                              {eng.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Lyrics (Dynamically Generated from Prompt)
                      </label>
                      <textarea
                        rows={5}
                        value={lyrics}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setLyrics(e.target.value);
                        }}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/25 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-indigo-200">
                      <span className="font-semibold text-white">Live Prompt Compiler:</span>{" "}
                      AI-recommended Lyrics, Cast &amp; Wardrobes automatically compile with your selections into the final master prompt.
                    </div>
                    <button
                      type="button"
                      onClick={() => setCanvasTab("prompt")}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Inspect Compiled Master Prompt →
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSynthesizingPrompt}
                      onClick={() => synthesizeFromNewPrompt(storyline, true)}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isSynthesizingPrompt
                          ? "Synthesizing New Cast & Wardrobe..."
                          : "Synthesize Cast & Wardrobe from Prompt (Go to Step 02) →"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* CREATE STEP 02: CAST, PERSONAS & EXHAUSTIVE WARDROBE */}
              {createStep === 2 && (
                <div className="rounded-xl bg-[#0e0e12] border border-white/[0.07] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        02. AI-Recommended Cast, Personas &amp; Wardrobe (Select or Customize)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Pre-selected items below are AI recommendations from your Step 01 prompt — change any dropdown to override the final compiled prompt.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/personas")}
                      className="px-3 py-1 rounded-md bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Users className="w-3 h-3" />
                      <span>Open Full Personas &amp; Wardrobe Page (/personas) →</span>
                    </button>
                  </div>

                  {/* Active 5-Tier Persona Strip (Reads from dynamic personasCatalog) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { id: "female_lead", label: "Female Lead" },
                        { id: "male_lead", label: "Male Lead" },
                        { id: "supporting", label: "Supporting" },
                        { id: "background", label: "Background" },
                        { id: "audience", label: "Audience" },
                      ] as { id: PersonaCategory; label: string }[]
                    ).map((tier) => {
                      const tierPersonas = dedupeById(
                        personasCatalog.filter((p) => p.category === tier.id)
                      );
                      const tierIds = selectedPersonaIds[tier.id] || [];
                      const currentId = tierIds[0] || tierPersonas[0]?.id;
                      const currentObj = getById(tierPersonas, currentId);
                      const extraCoLeadsCount = Math.max(0, tierIds.length - 1);

                      return (
                        <div
                          key={tier.id}
                          className="p-2 rounded-lg bg-[#121217] border border-white/[0.07] space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase truncate">
                              {tier.label}
                            </span>
                            {extraCoLeadsCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-semibold shrink-0">
                                +{extraCoLeadsCount} Co-Lead{extraCoLeadsCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <img
                            src={currentObj.photoUrl}
                            alt={currentObj.name}
                            className="w-full h-20 rounded object-cover object-[center_22%]"
                          />
                          <select
                            value={currentId}
                            onChange={(e) => {
                              const nextId = e.target.value;
                              customShotsRef.current = null;
                              const chosenPersona = tierPersonas.find((p) => p.id === nextId);
                              setSelectedPersonaIds((prev) => {
                                const existingCoLeads = (prev[tier.id] || [])
                                  .slice(1)
                                  .filter((id) => id !== nextId);
                                return {
                                  ...prev,
                                  [tier.id]: [nextId, ...existingCoLeads],
                                };
                              });
                              if (chosenPersona) {
                                if (tier.id === "female_lead") {
                                  if (chosenPersona.defaultAct1WardrobeId)
                                    setWomenAct1Id(chosenPersona.defaultAct1WardrobeId);
                                  if (chosenPersona.defaultAct2WardrobeId)
                                    setWomenAct2Id(chosenPersona.defaultAct2WardrobeId);
                                } else if (tier.id === "male_lead") {
                                  if (chosenPersona.defaultAct1WardrobeId)
                                    setMenAct1Id(chosenPersona.defaultAct1WardrobeId);
                                  if (chosenPersona.defaultAct2WardrobeId)
                                    setMenAct2Id(chosenPersona.defaultAct2WardrobeId);
                                } else if (
                                  tier.id === "supporting" &&
                                  chosenPersona.defaultAct1WardrobeId
                                ) {
                                  setSupportingWardrobeId(chosenPersona.defaultAct1WardrobeId);
                                } else if (
                                  tier.id === "background" &&
                                  chosenPersona.defaultAct1WardrobeId
                                ) {
                                  setBackgroundWardrobeId(chosenPersona.defaultAct1WardrobeId);
                                } else if (
                                  tier.id === "audience" &&
                                  chosenPersona.defaultAct1WardrobeId
                                ) {
                                  setAudienceWardrobeId(chosenPersona.defaultAct1WardrobeId);
                                }
                              }
                            }}
                            className="w-full rounded bg-zinc-900 border border-white/[0.08] px-1.5 py-1 text-[11px] text-white outline-none"
                          >
                            {tierPersonas.map((tp) => (
                              <option key={tp.id} value={tp.id}>
                                {tp.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  {/* Exhaustive Wardrobe Dropdowns Across All Character Tiers (Reads from dynamic wardrobeCatalog) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Female Lead — Act I Wardrobe</label>
                      <select
                        value={womenAct1Id}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setWomenAct1Id(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {getDynamicWardrobeForCategory("female_lead", 1).map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Female Lead — Act II Finale Wardrobe</label>
                      <select
                        value={womenAct2Id}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setWomenAct2Id(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {getDynamicWardrobeForCategory("female_lead", 2).map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Male Lead — Act I Wardrobe</label>
                      <select
                        value={menAct1Id}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setMenAct1Id(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {getDynamicWardrobeForCategory("male_lead", 1).map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Male Lead — Act II Finale Wardrobe</label>
                      <select
                        value={menAct2Id}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setMenAct2Id(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {getDynamicWardrobeForCategory("male_lead", 2).map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Supporting Cast Wardrobe</label>
                      <select
                        value={supportingWardrobeId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setSupportingWardrobeId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {getDynamicWardrobeForCategory("supporting").map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Background Performers Uniform</label>
                      <select
                        value={backgroundWardrobeId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setBackgroundWardrobeId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {getDynamicWardrobeForCategory("background").map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Audience &amp; Crowd Dress Code</label>
                      <select
                        value={audienceWardrobeId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setAudienceWardrobeId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {getDynamicWardrobeForCategory("audience").map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Footwear, Hair &amp; Accessories</label>
                      <select
                        value={accessoryId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setAccessoryId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {dedupeById(accessoriesCatalog).map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Country &amp; Destination</label>
                      <select
                        value={countryId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setCountryId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {COUNTRIES_CATALOG.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Venue Architecture (Locations)</label>
                      <select
                        value={venueId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setVenueId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {dedupeById(venuesCatalog).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Lighting &amp; Color Grade (Cinematography)</label>
                      <select
                        value={lightingId}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setLightingId(e.target.value);
                        }}
                        className={inputCls}
                      >
                        {LIGHTING_CATALOG.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Voice Type &amp; Vocal Timbre (Auto-Synthesized)</label>
                      <input
                        type="text"
                        value={voiceType}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setVoiceType(e.target.value);
                        }}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Human Emotions &amp; Expression Arc (Auto-Synthesized)</label>
                      <input
                        type="text"
                        value={humanEmotions}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setHumanEmotions(e.target.value);
                        }}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Choreography &amp; Dance Formation (Auto-Synthesized)</label>
                      <input
                        type="text"
                        value={choreography}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setChoreography(e.target.value);
                        }}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Background Scenery &amp; Atmospheric FX (Auto-Synthesized)</label>
                      <input
                        type="text"
                        value={backgroundEnvironment}
                        onChange={(e) => {
                          customShotsRef.current = null;
                          setBackgroundEnvironment(e.target.value);
                        }}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/25 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-indigo-200">
                      All 8 dimensions above (Personas, Locations, Wardrobe, Background, Emotions, Voice Type, Choreography &amp; Lyrics) live-sync to your Final Compiled Prompt.
                    </span>
                    <button
                      type="button"
                      onClick={() => setCanvasTab("prompt")}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Inspect Compiled Master Prompt →
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      className="px-3 py-2 rounded-lg bg-zinc-900 text-zinc-300 text-xs font-medium cursor-pointer"
                    >
                      ← Back to Step 01
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        customShotsRef.current = null;
                        setShots(compileStructuredShots());
                        setCreateStep(3);
                        setCanvasTab("shots");
                      }}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next: 03. Compile Storyboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CREATE STEP 03: STORYBOARD */}
              {createStep === 3 && (
                <div className="rounded-xl bg-[#0e0e12] border border-white/[0.07] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        03. Storyboard ({shots.length} Multi-Turn Shots)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Each shot combines your selected Camera Rig, Persona Biometrics, Act I/II Wardrobe &amp; 48kHz Lyric Line.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          customShotsRef.current = null;
                          const recompiled = compileStructuredShots();
                          setShots(recompiled);
                          setStatusBanner(`✓ Re-compiled all ${recompiled.length} storyboard shots from current Cast & Wardrobe.`);
                        }}
                        className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-Compile Shots</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanvasTab("prompt")}
                        className="px-2.5 py-1 rounded bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-semibold cursor-pointer"
                      >
                        View Full Compiled Prompt →
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="text-xs text-emerald-400 font-medium cursor-pointer"
                      >
                        Save Draft
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {shots.map((s, idx) => (
                      <div
                        key={s.shotId}
                        className="p-3 rounded-lg bg-[#121217] border border-white/[0.06] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            Shot {String(s.shotNumber).padStart(2, "0")} ({s.timecode}) • Act {s.act}
                          </span>
                          <select
                            value={s.cameraMoveId}
                            onChange={(e) => {
                              const next = [...shots];
                              next[idx] = { ...next[idx], cameraMoveId: e.target.value };
                              customShotsRef.current = next;
                              setShots(next);
                            }}
                            className="rounded bg-zinc-900 border border-white/[0.08] px-2 py-1 text-[11px] text-white outline-none"
                          >
                            {CAMERA_MOVES_CATALOG.map((cm) => (
                              <option key={cm.id} value={cm.id}>
                                {cm.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={s.actionPrompt}
                            onChange={(e) => {
                              const next = [...shots];
                              next[idx] = { ...next[idx], actionPrompt: e.target.value };
                              customShotsRef.current = next;
                              setShots(next);
                            }}
                            className={inputCls}
                          />
                          <input
                            type="text"
                            value={s.lyricLine}
                            onChange={(e) => {
                              const next = [...shots];
                              next[idx] = { ...next[idx], lyricLine: e.target.value };
                              customShotsRef.current = next;
                              setShots(next);
                            }}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCreateStep(2)}
                      className="px-3 py-2 rounded-lg bg-zinc-900 text-zinc-300 text-xs font-medium cursor-pointer"
                    >
                      ← Back to Step 02
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateStep(4);
                        setCanvasTab("prompt");
                      }}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next: 04. Review Compiled Prompt &amp; Render</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CREATE STEP 04: FINAL COMPILED DETAILED PROMPT, RENDER & EXPORT */}
              {createStep === 4 && (
                <div className="rounded-xl bg-[#0e0e12] border border-white/[0.07] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        04. Final Compiled Detailed Master Prompt &amp; Render
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {audioEngineId === "omni_lyria3"
                          ? "Hybrid Studio Pipeline: models/gemini-omni-1.1-flash (24/1 CFR Video) + models/lyria-3-pro-preview (Continuous 48,000 Hz Studio Song)"
                          : "Single-Model Pipeline: models/gemini-omni-1.1-flash (24/1 CFR Video + Native 48,000 Hz Stereo Vocal/Music Score)"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreateStep(3)}
                      className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      ← Back to Storyboard
                    </button>
                  </div>

                  {/* Dual Engine Toggle Bar: Omni 1.1 + Lyria-3-pro-preview vs Omni 1.1 Only */}
                  <div className="p-3 rounded-lg bg-[#121217] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Audio &amp; Music Synthesis Engine
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Choose between continuous Lyria 3 Pro studio song + Omni 1.1 video, or single-model Omni 1.1 native audio
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {AUDIO_ENGINES_CATALOG.map((eng) => {
                        const active = audioEngineId === eng.id;
                        return (
                          <button
                            key={eng.id}
                            type="button"
                            onClick={() =>
                              setAudioEngineId(eng.id as "omni_lyria3" | "omni_native")
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              active
                                ? "bg-indigo-500 text-white border-indigo-400 shadow-sm"
                                : "bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/25"
                            }`}
                          >
                            {eng.id === "omni_lyria3"
                              ? "🎵 Omni 1.1 + Lyria-3-pro-preview"
                              : "🎬 Omni 1.1 Only (Native Audio)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final Compiled Detailed Prompt Inspector & Editor */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className={labelCls}>
                        Final Compiled Production Prompt (Auto-Synthesized from Steps 01–03 • Editable Before Render)
                      </label>
                      <div className="flex items-center gap-2">
                        {customMasterPromptOverride.trim() !== "" && (
                          <button
                            type="button"
                            onClick={() => setCustomMasterPromptOverride("")}
                            className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] font-medium cursor-pointer"
                          >
                            Reset to Auto-Compiled
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(effectiveMasterPrompt);
                            setCopiedPrompt(true);
                            setTimeout(() => setCopiedPrompt(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          {copiedPrompt ? "✓ Copied Full Prompt!" : "Copy Full Prompt"}
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={14}
                      value={effectiveMasterPrompt}
                      onChange={(e) => setCustomMasterPromptOverride(e.target.value)}
                      className="w-full rounded-lg bg-[#09090b] border border-white/[0.1] focus:border-indigo-400/60 p-3 text-[11px] font-mono text-zinc-200 leading-relaxed outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isRendering}
                      onClick={() =>
                        executeEndToEndRender(
                          `${getById(DURATIONS_CATALOG, durationId).seconds}s Master`
                        )
                      }
                      className="flex-1 py-3 px-5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-zinc-950" />
                      <span>
                        {isRendering
                          ? `Rendering ${getById(DURATIONS_CATALOG, durationId).seconds}s Master (${renderProgress}%)...`
                          : audioEngineId === "omni_lyria3"
                          ? `Render ${getById(DURATIONS_CATALOG, durationId).seconds}s Master Video Now (Omni 1.1 + Lyria-3-pro-preview)`
                          : `Render ${getById(DURATIONS_CATALOG, durationId).seconds}s Master Video Now (Omni 1.1 Only)`}
                      </span>
                    </button>

                    {activeVideoUrl && (
                      <a
                        href={activeVideoUrl}
                        download
                        className="py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export MP4</span>
                      </a>
                    )}
                  </div>

                  {/* Clear Post-Render Next Workflow Actions */}
                  <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400">
                      Save your blueprint as a persistent draft or inspect completed masters in Published Reels:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium cursor-pointer"
                      >
                        Save Blueprint Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => switchWorkflow("published")}
                        className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold cursor-pointer"
                      >
                        Open Published Reels Library →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              WORKFLOW 2: PUBLISHED REELS LIBRARY
             ================================================================ */}
          {workflow === "published" && (
            <div className="rounded-xl bg-[#0e0e12] border border-white/[0.07] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-sm font-semibold text-white">
                  Published Reels ({reels.filter((r) => r.status === "published").length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    switchWorkflow("create");
                    setCreateStep(1);
                  }}
                  className="px-3 py-1 rounded-md bg-white text-zinc-950 text-xs font-semibold cursor-pointer"
                >
                  + Create New Reel
                </button>
              </div>

              <div className="space-y-2.5">
                {reels
                  .filter((r) => r.status === "published")
                  .map((reel) => (
                    <div
                      key={reel.id}
                      className="p-3.5 rounded-lg bg-[#121217] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                            Published
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {reel.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {getById(COUNTRIES_CATALOG, reel.countryId).label} •{" "}
                          {getById(LANGUAGES_CATALOG, reel.languageId).label} •{" "}
                          {reel.updatedAt}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVideoUrl(reel.videoUrl);
                            setCanvasTab("video");
                          }}
                          className="px-2.5 py-1.5 rounded bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium cursor-pointer"
                        >
                          Play in Monitor
                        </button>
                        <button
                          type="button"
                          onClick={() => loadReelIntoWorkflow(reel, 3)}
                          className="px-2.5 py-1.5 rounded bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium cursor-pointer"
                        >
                          Load &amp; Edit Shots
                        </button>
                        <a
                          href={reel.videoUrl}
                          download
                          className="px-2.5 py-1.5 rounded bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export MP4</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================================================================
              WORKFLOW 3: DRAFTS & RENDER JOBS (PERSISTENT)
             ================================================================ */}
          {workflow === "wip" && (
            <div className="rounded-xl bg-[#0e0e12] border border-white/[0.07] p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <span className="text-sm font-semibold text-white">
                  Persistent Saved Drafts &amp; Active Render Jobs
                </span>
                <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-lg border border-white/[0.06]">
                  {[
                    { id: "all", label: "All" },
                    { id: "wip", label: "In Progress" },
                    { id: "draft", label: "Drafts" },
                    { id: "failed", label: "Failed" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setWipFilter(f.id as "all" | "wip" | "draft" | "failed")
                      }
                      className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                        wipFilter === f.id
                          ? "bg-white text-zinc-950 font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {reels.filter(
                (r) =>
                  r.status !== "published" &&
                  (wipFilter === "all" || r.status === wipFilter)
              ).length === 0 ? (
                <div className="p-6 rounded-lg bg-[#121217] border border-white/[0.06] text-center space-y-2">
                  <div className="text-xs font-semibold text-zinc-200">
                    No saved drafts or failed jobs in this filter
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Click &ldquo;Save Draft&rdquo; in the top bar at any time to persist your current 8-dimension studio blueprint here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reels
                    .filter(
                      (r) =>
                        r.status !== "published" &&
                        (wipFilter === "all" || r.status === wipFilter)
                    )
                    .map((reel) => (
                      <div
                        key={reel.id}
                        className="p-3.5 rounded-lg bg-[#121217] border border-white/[0.08] space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                reel.status === "failed"
                                  ? "bg-red-500/20 text-red-300"
                                  : reel.status === "wip"
                                  ? "bg-indigo-500/20 text-indigo-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {reel.status}
                            </span>
                            <span className="text-xs font-semibold text-white">
                              {reel.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            {reel.updatedAt}
                          </span>
                        </div>

                        {reel.errorReason && (
                          <div className="p-2.5 rounded bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{reel.errorReason}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="w-40 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              style={{ width: `${reel.progress}%` }}
                              className={`h-full ${
                                reel.status === "failed"
                                  ? "bg-red-400"
                                  : "bg-white"
                              }`}
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteReel(reel.id)}
                              title="Delete Draft or Job"
                              className="px-2.5 py-1.5 rounded bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => loadReelIntoWorkflow(reel, 3)}
                              className="px-3 py-1.5 rounded bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium cursor-pointer"
                            >
                              Resume in 4-Step Studio
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRetryFailedReel(reel)}
                              className="px-3 py-1.5 rounded bg-white text-zinc-950 text-xs font-semibold cursor-pointer"
                            >
                              {reel.status === "failed"
                                ? "Retry Render Now →"
                                : "Render Master Now →"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================
            RIGHT MONITOR PANE (lg:col-span-5): LIVE STUDIO PREVIEW
           ================================================================== */}
        <div className="lg:col-span-5 p-4 sm:p-5 lg:sticky lg:top-24 space-y-3">
          <div className="flex items-center justify-between bg-[#121217] p-1 rounded-lg border border-white/[0.06]">
            {[
              { id: "ensemble", label: `Cast (${activePersonasList.length})` },
              { id: "shots", label: `Storyboard (${shots.length})` },
              { id: "agents", label: `Crew (${danceMvAgents.length})` },
              { id: "prompt", label: "Prompt" },
              { id: "video", label: "Player" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setCanvasTab(
                    t.id as "ensemble" | "shots" | "prompt" | "agents" | "video"
                  )
                }
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  canvasTab === t.id
                    ? "bg-white text-zinc-950 font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* MONITOR 1: MULTI-TIER CAST & WARDROBE PREVIEW */}
          {canvasTab === "ensemble" && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0e0e12]">
                <div className="px-3.5 py-2 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Ensemble Stage ({activePersonasList.length} Active Cast — Lead, Supporting, Background &amp; Audience)
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/personas")}
                    className="text-[11px] text-zinc-300 hover:text-white underline cursor-pointer"
                  >
                    Customize in /personas →
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-2 bg-zinc-950 max-h-[380px] overflow-y-auto">
                  {activePersonasList.map((p) => (
                    <div
                      key={p.id}
                      className="relative rounded-lg overflow-hidden aspect-[3/4] bg-zinc-900 border border-white/[0.06]"
                    >
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-full h-full object-cover object-[center_22%]"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5">
                        <div className="text-[11px] font-semibold text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[9px] text-zinc-300 uppercase truncate">
                          {p.roleTitle || p.category.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Act I & Act II Wardrobe Summary Cards (Aligned to Vocal Arrangement) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0e0e12] p-3 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                    Act I Opening Wardrobe (0:00–0:30)
                  </span>
                  <p className="text-xs text-white font-medium truncate">
                    {vocalId === "voc_male_solo" || vocalId === "voc_boy_band"
                      ? getById(wardrobeCatalog, menAct1Id).label
                      : getById(wardrobeCatalog, womenAct1Id).label}
                  </p>
                  <p className="text-xs text-zinc-300 truncate">
                    {vocalId === "voc_duet"
                      ? getById(wardrobeCatalog, menAct1Id).label
                      : getById(wardrobeCatalog, backgroundWardrobeId).label}
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0e0e12] p-3 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                    Act II+ Finale Wardrobe (0:30–{getById(DURATIONS_CATALOG, durationId).seconds >= 120 ? "2:00" : getById(DURATIONS_CATALOG, durationId).seconds === 90 ? "1:30" : "1:00"})
                  </span>
                  <p className="text-xs text-white font-medium truncate">
                    {vocalId === "voc_male_solo" || vocalId === "voc_boy_band"
                      ? getById(wardrobeCatalog, menAct2Id).label
                      : getById(wardrobeCatalog, womenAct2Id).label}
                  </p>
                  <p className="text-xs text-zinc-300 truncate">
                    {vocalId === "voc_duet"
                      ? getById(wardrobeCatalog, menAct2Id).label
                      : getById(wardrobeCatalog, supportingWardrobeId).label}
                  </p>
                </div>
              </div>

              {/* 12-Agent Dance Music Video Autonomous Crew Quick Status Bar */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0e0e12] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white">
                    12-Agent Dance Music Video Autonomous Crew (100% Ready)
                  </span>
                  <button
                    type="button"
                    onClick={() => setCanvasTab("agents")}
                    className="text-[11px] text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                  >
                    Inspect All 12 Agents →
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {danceMvAgents.map((ag) => (
                    <span
                      key={ag.id}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.07] text-[10px] text-zinc-200 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{ag.name.replace(" Agent", "")}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MONITOR 2: MULTI-SHOT VISUAL GRID (6, 9, OR 12 SHOTS) */}
          {canvasTab === "shots" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[620px] overflow-y-auto pr-1">
              {shots.map((s) => (
                <div
                  key={s.shotId}
                  className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0e0e12]"
                >
                  <div className="relative h-36 w-full bg-zinc-900">
                    <img
                      src={s.previewPhotoUrl}
                      alt={`Shot ${s.shotNumber}`}
                      className="w-full h-full object-cover object-[center_22%]"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-white">
                      {String(s.shotNumber).padStart(2, "0")} • {s.timecode}
                    </span>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <div className="text-[11px] font-semibold text-white truncate">
                      {getById(CAMERA_MOVES_CATALOG, s.cameraMoveId).label}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {s.lyricLine}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MONITOR 2A: 12-AGENT DANCE MUSIC VIDEO AUTONOMOUS CREW INSPECTOR */}
          {canvasTab === "agents" && (
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0e0e12] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div>
                  <div className="text-xs font-semibold text-white">
                    12-Agent Dance Music Video Autonomous Crew
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Script • Casting • Wardrobe • Location • Props • Choreography • Lip-Sync • Cinematography • Vocal • Lyria • Assembly • QA Judge
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                  12 / 12 LOCKED
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[620px] overflow-y-auto pr-1">
                {danceMvAgents.map((agent, idx) => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-lg bg-[#121217] border border-white/[0.08] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-semibold text-white">
                        {String(idx + 1).padStart(2, "0")}. {agent.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {agent.qualityScore && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-semibold">
                            {agent.qualityScore}
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                            agent.status === "PRE_FLIGHT_LOCKED"
                              ? "bg-amber-500/15 text-amber-300"
                              : agent.status === "ACTIVE"
                              ? "bg-indigo-500/20 text-indigo-300"
                              : "bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-indigo-300 font-medium">
                      {agent.roleTitle} • <span className="text-emerald-300 font-mono">{agent.stackModel}</span>
                    </div>
                    <p className="text-[10px] text-zinc-200 leading-snug font-medium">
                      {agent.deliverableSummary}
                    </p>
                    {Array.isArray(agent.dynamicOutput) && agent.dynamicOutput.length > 0 && (
                      <ul className="space-y-1 pt-1 border-t border-white/[0.06]">
                        {agent.dynamicOutput.map((line, lIdx) => (
                          <li key={lIdx} className="text-[10px] text-zinc-400 leading-snug flex items-start gap-1.5">
                            <span className="text-indigo-400 shrink-0">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="text-[9px] font-mono text-zinc-500 truncate pt-0.5">
                      Artifact: {agent.technicalArtifact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MONITOR 2B: FINAL COMPILED DETAILED MASTER PROMPT (LIVE SYNCED) */}
          {canvasTab === "prompt" && (
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0e0e12] p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Final Compiled Detailed Master Prompt (Live-Synced)
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Combines AI Recommendations + Your Selections for Gemini Omni 1.1 Flash (Video + 48kHz Vocal/Music)
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {customMasterPromptOverride.trim() !== "" && (
                    <button
                      type="button"
                      onClick={() => setCustomMasterPromptOverride("")}
                      className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(effectiveMasterPrompt);
                      setCopiedPrompt(true);
                      setTimeout(() => setCopiedPrompt(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-white text-zinc-950 text-[10px] font-semibold cursor-pointer"
                  >
                    {copiedPrompt ? "✓ Copied!" : "Copy Prompt"}
                  </button>
                </div>
              </div>

              <textarea
                rows={18}
                value={effectiveMasterPrompt}
                onChange={(e) => setCustomMasterPromptOverride(e.target.value)}
                className="w-full rounded-lg bg-[#09090b] border border-white/[0.08] focus:border-indigo-400/60 p-2.5 text-[11px] font-mono text-zinc-200 leading-relaxed outline-none"
              />
            </div>
          )}

          {/* MONITOR 3: 9:16 MASTER VIDEO PLAYER */}
          {canvasTab === "video" && (
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black flex flex-col items-center p-3 space-y-3">
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-white truncate">
                  {title}
                </span>
                <span className="text-[10px] text-emerald-300 font-medium">
                  Lead Anchor: {activePersonasList[0]?.name || "Lead Cast"}
                </span>
              </div>

              {isRendering && (
                <div className="w-full rounded-lg bg-indigo-950/50 border border-indigo-500/30 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-indigo-200 font-semibold">
                      {renderStageLabel || "Rendering via models/gemini-omni-1.1-flash..."}
                    </span>
                    <span className="text-emerald-300 font-mono font-bold">
                      {renderProgress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.max(5, renderProgress)}%` }}
                    />
                  </div>
                  {renderLogs.length > 0 && (
                    <div className="max-h-20 overflow-y-auto text-[10px] font-mono text-zinc-400 space-y-0.5 bg-black/50 rounded p-1.5">
                      {renderLogs.slice(-4).map((l, idx) => (
                        <div key={idx}>{l}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeVideoUrl ? (
                <video
                  key={activeVideoUrl}
                  src={activeVideoUrl}
                  poster={
                    activePersonasList[0]?.photoUrl ||
                    "/assets/characters/nagin_rajni_heroine.jpg"
                  }
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[520px] w-auto aspect-[9/16] object-contain rounded-lg"
                />
              ) : (
                <div className="w-full flex flex-col items-center space-y-3 py-2">
                  <div className="relative max-h-[380px] aspect-[9/16] rounded-xl overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl">
                    <img
                      src={
                        activePersonasList[0]?.photoUrl ||
                        "/assets/characters/nagin_rajni_heroine.jpg"
                      }
                      alt={activePersonasList[0]?.name || "Lead Cast"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-end p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] font-semibold mx-auto mb-1.5">
                        {isRendering
                          ? "Generating Turn 1A (00:00–00:10)..."
                          : "Blueprint Synthesized • Video Not Rendered Yet"}
                      </span>
                      <p className="text-xs font-bold text-white leading-snug">
                        {title}
                      </p>
                      <p className="text-[10px] text-zinc-300 mt-0.5 line-clamp-2">
                        {activePersonasList.map((p) => p.name.split("(")[0].trim()).join(" • ")}
                      </p>
                    </div>
                  </div>

                  {/* Multi-Shot Storyboard Preview Strip */}
                  <div className="w-full grid grid-cols-6 gap-1.5 px-1">
                    {shots.map((s) => (
                      <div
                        key={s.shotNumber}
                        className="rounded overflow-hidden border border-white/10 bg-zinc-900 flex flex-col"
                      >
                        <img
                          src={s.previewPhotoUrl}
                          alt={`Shot ${s.shotNumber}`}
                          className="w-full h-12 object-cover"
                        />
                        <span className="text-[9px] text-center text-zinc-300 py-0.5 font-mono">
                          S{String(s.shotNumber).padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={isRendering}
                    onClick={() => {
                      setCreateStep(4);
                      executeEndToEndRender(`${getById(DURATIONS_CATALOG, durationId).seconds}s Master`);
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-zinc-950" />
                    <span>
                      {isRendering
                        ? `Rendering New Video (${renderProgress}%)...`
                        : `Render New ${getById(DURATIONS_CATALOG, durationId).seconds}s Master Video Now (Gemini Omni 1.1 Flash)`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
