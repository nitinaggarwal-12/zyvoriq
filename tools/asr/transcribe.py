#!/usr/bin/env python3
"""
Word-level vocal transcription for the YT pipeline (the "Lyria clock").

WHY THIS EXISTS
---------------
The clock was previously produced by asking gemini-2.5-pro to listen to the
song and emit timestamps as JSON. That failed twice in one evening:

  1. The prompt asked only for {has_sung_vocals, first_vocal_onset_sec} while
     the shot grid read timeline.transcription - a field never requested. It
     worked once because the model volunteered it, then stopped.
  2. On the next run the same prompt returned a bare array, which got spread
     into an object as {"0":...,"1":...}. The pipeline read that as "no
     vocals", declared the song instrumental, and began paying Veo for shots
     that could never lip-sync.

An LLM asked for timestamps is guessing. WhisperX does forced alignment with
wav2vec2 and returns word-level times deterministically. Same job, no guessing,
no schema drift, no per-run cost.

OUTPUT (stdout, JSON) - matches what scripts/yt_pipeline.mjs consumes:
  {
    "has_sung_vocals": bool,
    "first_vocal_onset_sec": float | null,   # first WORD, not first segment
    "transcription": [{"start": s, "end": s, "text": str}],
    "words":         [{"start": s, "end": s, "word": str}],
    "language": str,
    "engine": "whisperx/<model>"             # honest provenance, never a
                                             # model that did not run
  }
"""
import argparse, json, os, sys


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--out", default=None, help="also write JSON here")
    ap.add_argument("--model", default=os.environ.get("ASR_MODEL", "large-v2"))
    # ctranslate2 (the whisper backend) has no Metal build, so transcription is
    # CPU regardless. Alignment is torch and could use MPS, but MPS coverage of
    # wav2vec2 ops is uneven; CPU is the predictable default on a 40-core M5.
    ap.add_argument("--device", default=os.environ.get("ASR_DEVICE", "cpu"))
    ap.add_argument("--compute-type", default=os.environ.get("ASR_COMPUTE", "int8"))
    ap.add_argument("--language", default=os.environ.get("ASR_LANGUAGE", "en"))
    ap.add_argument("--batch-size", type=int, default=16)
    ap.add_argument("--no-demucs", action="store_true", help="skip vocal stem isolation")
    ap.add_argument("--demucs-model", default="htdemucs")
    ap.add_argument("--line-gap", type=float, default=0.35)
    ap.add_argument("--max-line", type=float, default=4.0)
    args = ap.parse_args()

    if not os.path.exists(args.audio):
        print(json.dumps({"error": f"audio not found: {args.audio}"}), file=sys.stderr)
        return 2

    import whisperx

    log = lambda m: print(m, file=sys.stderr)

    source_audio = args.audio
    stem_used = None
    if not args.no_demucs:
        import subprocess, glob, tempfile
        stem_dir = os.path.join(os.path.dirname(os.path.abspath(args.audio)) or ".", "stems")
        base = os.path.splitext(os.path.basename(args.audio))[0]
        cached = os.path.join(stem_dir, args.demucs_model, base, "vocals.wav")
        if os.path.exists(cached):
            source_audio, stem_used = cached, "cached"
            log(f"[asr] using cached vocal stem {cached}")
        else:
            log(f"[asr] demucs: isolating vocal stem with {args.demucs_model}")
            try:
                subprocess.run([sys.executable, "-m", "demucs", "--two-stems=vocals",
                                "-n", args.demucs_model, "-o", stem_dir, args.audio],
                               check=True, capture_output=True)
                if os.path.exists(cached):
                    source_audio, stem_used = cached, args.demucs_model
                    log(f"[asr] vocal stem ready: {cached}")
                else:
                    log("[asr] demucs produced no vocals.wav; using the full mix")
            except Exception as exc:
                log(f"[asr] demucs failed ({exc}); using the full mix")

    log(f"[asr] loading {args.model} on {args.device} ({args.compute_type})")
    model = whisperx.load_model(args.model, args.device, compute_type=args.compute_type,
                                language=args.language)
    audio = whisperx.load_audio(source_audio)
    log(f"[asr] transcribing {len(audio) / 16000:.2f}s of audio")
    result = model.transcribe(audio, batch_size=args.batch_size)
    language = result.get("language", args.language or "en")

    segments = result.get("segments", []) or []
    words = []
    if segments:
        log(f"[asr] aligning {len(segments)} segment(s) with wav2vec2 forced alignment (lang={language})")
        aligned_ok = False
        for try_lang in ([language, "hi", "en"] if language not in ("hi", "en") else [language, "en"]):
            try:
                align_model, metadata = whisperx.load_align_model(language_code=try_lang, device=args.device)
                aligned = whisperx.align(segments, align_model, metadata, audio, args.device,
                                         return_char_alignments=False)
                segments = aligned.get("segments", segments) or segments
                aligned_ok = True
                break
            except Exception as align_err:
                log(f"[asr] align model for lang={try_lang} failed ({align_err}), trying next...")
        for seg in segments:
            seg_words = seg.get("words") or []
            if seg_words:
                for w in seg_words:
                    if w.get("start") is None or w.get("end") is None:
                        continue
                    words.append({"start": round(float(w["start"]), 3),
                                  "end": round(float(w["end"]), 3),
                                  "word": str(w.get("word", "")).strip()})
            elif seg.get("start") is not None and seg.get("end") is not None:
                # Fallback proportional word interpolation within segment
                toks = [t for t in str(seg.get("text", "")).strip().split() if t]
                if toks:
                    s0, s1 = float(seg["start"]), float(seg["end"])
                    dur = max(0.1, s1 - s0)
                    step = dur / len(toks)
                    for idx, tok in enumerate(toks):
                        words.append({
                            "start": round(s0 + idx * step, 3),
                            "end": round(s0 + (idx + 1) * step, 3),
                            "word": tok
                        })

    transcription = []
    for seg in segments:
        if seg.get("start") is None or seg.get("end") is None:
            continue
        text = str(seg.get("text", "")).strip()
        if not text:
            continue
        transcription.append({"start": round(float(seg["start"]), 3),
                              "end": round(float(seg["end"]), 3),
                              "text": text})

    # The first sung WORD is the number the shot grid aligns to. A segment start
    # can precede its first word by a noticeable margin, and that margin is
    # exactly the dead zone the user saw at the head of the reel.
    onset = None
    if words:
        onset = min(w["start"] for w in words)
    elif transcription:
        onset = min(s["start"] for s in transcription)

    # PHRASE LINES FROM WORD TIMINGS.
    # These, not the raw segments, are what the shot grid cuts on.
    def group_by_gap(ws, gap):
        out, cur = [], None
        for w in ws:
            if cur is None or (w["start"] - cur[-1]["end"]) > gap:
                if cur:
                    out.append(cur)
                cur = [w]
            else:
                cur.append(w)
        if cur:
            out.append(cur)
        return out

    def split_long(group, max_len):
        """Split a word group until every piece is <= max_len, always cutting at
        the widest internal silence so the boundary is a real word boundary."""
        dur = group[-1]["end"] - group[0]["start"]
        if dur <= max_len or len(group) < 2:
            return [group]
        best_i, best_gap = None, -1.0
        for i in range(len(group) - 1):
            # Bias toward the middle so one 0.2s outlier near an edge does not
            # produce a 0.3s sliver plus another over-long run.
            g = group[i + 1]["start"] - group[i]["end"]
            centre_bias = 1.0 - abs((i + 1) / len(group) - 0.5)
            score = g + 0.05 * centre_bias
            if score > best_gap:
                best_gap, best_i = score, i
        left, right = group[: best_i + 1], group[best_i + 1 :]
        if not left or not right:
            return [group]
        return split_long(left, max_len) + split_long(right, max_len)

    phrase_lines = []
    if words:
        for group in group_by_gap(words, args.line_gap):
            for piece in split_long(group, args.max_line):
                phrase_lines.append({
                    "start": piece[0]["start"],
                    "end": piece[-1]["end"],
                    "text": " ".join(w["word"] for w in piece).strip(),
                })
    lines_out = phrase_lines if phrase_lines else transcription

    out = {
        "has_sung_vocals": len(lines_out) > 0,
        "first_vocal_onset_sec": onset,
        "transcription": lines_out,
        "raw_segments": transcription,
        "words": words,
        "language": language,
        "stem": stem_used,
        "line_gap_sec": args.line_gap,
        "max_line_sec": args.max_line,
        "engine": f"whisperx/{args.model}" + (f"+demucs/{stem_used}" if stem_used and stem_used != "cached" else ("+demucs/cached" if stem_used else "")),
    }
    blob = json.dumps(out, indent=2)
    if args.out:
        with open(args.out, "w") as fh:
            fh.write(blob)
        log(f"[asr] wrote {args.out}")
    log(f"[asr] {len(lines_out)} phrase line(s) from {len(words)} word(s) ({len(transcription)} raw segment(s)), onset={onset}")
    print(blob)
    return 0


if __name__ == "__main__":
    sys.exit(main())
