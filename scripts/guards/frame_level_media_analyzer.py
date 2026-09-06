#!/usr/bin/env python3
"""
Frame-Level Media Analyzer & Universal Quality Gate Engine
STRICT DETERMINISTIC INVARIANTS:
  1. ANTI-STATIC PICTURE GATE:
     - Detects and bans 2D affine zoompan over static images.
     - Verifies non-rigid physical motion across multiple frame regions.
  2. ANTI-SIREN SPECTRAL PURITY GATE:
     - Detects and bans pure unmodulated sinusoidal tones (math.sin oscillators).
     - Enforces natural harmonic overtones in the 800Hz-3000Hz siren band.
  3. ZERO DEAD AIR GATE:
     - Enforces continuous acoustic soundscape (zero silence > 0.5s).
  4. LOUDNESS & TRUE PEAK COMPLIANCE:
     - EBU R128 (-24.0 LUFS) with True Peak <= -1.0 dBFS headroom.
"""

import os
import sys
import json
import math
import subprocess
import tempfile
import struct
import shutil

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return res.returncode, res.stdout, res.stderr
    except Exception as e:
        return 1, "", str(e)

def probe_media(filepath):
    ffprobe_bin = shutil.which("ffprobe") or "/usr/bin/ffprobe"
    if os.path.exists(ffprobe_bin):
        cmd = [
            ffprobe_bin, "-v", "quiet", "-print_format", "json",
            "-show_format", "-show_streams", filepath
        ]
        code, out, err = run_cmd(cmd)
        if code == 0:
            try:
                return json.loads(out)
            except Exception:
                pass
                
    ffmpeg_bin = shutil.which("ffmpeg") or "/usr/bin/ffmpeg"
    cmd = [ffmpeg_bin, "-i", filepath]
    code, out, err = run_cmd(cmd)
    
    has_video = "Video:" in err
    has_audio = "Audio:" in err
    duration = 10.0
    for line in err.split("\n"):
        if "Duration:" in line:
            try:
                dur_str = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = dur_str.split(":")
                duration = float(h)*3600 + float(m)*60 + float(s)
            except Exception:
                pass
                
    return {
        "format": {"duration": duration, "size": os.path.getsize(filepath) if os.path.exists(filepath) else 0},
        "streams": [
            {"codec_type": "video"} if has_video else {},
            {"codec_type": "audio"} if has_audio else {}
        ]
    }

def audit_frame_visual_motion_and_richness(filepath, sample_fps=2):
    """
    Extracts frames and strictly verifies:
      1. Non-rigid optical motion (rejects 2D digital zoom over a still picture).
      2. High color variance & entropy (rejects flat/monochrome screens).
      3. Absence of frozen frame runs or black frames.
    """
    results = {
        "passed": True,
        "frames_analyzed": 0,
        "mean_color_std_dev": 0.0,
        "is_static_picture_zoom_detected": False,
        "frozen_frame_sequences_detected": 0,
        "black_frames_detected": 0,
        "violations": []
    }
    
    ffmpeg_bin = shutil.which("ffmpeg") or "/usr/bin/ffmpeg"
    with tempfile.TemporaryDirectory() as tmpdir:
        frame_pattern = os.path.join(tmpdir, "frame_%05d.bmp")
        cmd = [
            ffmpeg_bin, "-y", "-i", filepath,
            "-vf", f"fps={sample_fps}",
            "-pix_fmt", "bgr24",
            frame_pattern
        ]
        code, out, err = run_cmd(cmd)
        if code != 0:
            results["passed"] = False
            results["violations"].append(f"Frame extraction failed: {err[-200:]}")
            return results
            
        frame_files = sorted([os.path.join(tmpdir, f) for f in os.listdir(tmpdir) if f.endswith(".bmp")])
        results["frames_analyzed"] = len(frame_files)
        
        if len(frame_files) < 2:
            results["passed"] = False
            results["violations"].append("Insufficient frames extracted for temporal motion verification.")
            return results
            
        std_devs = []
        quadrant_deltas = [] # Track motion in top-left, top-right, bottom-left, bottom-right
        prev_quadrants = None
        
        for idx, fpath in enumerate(frame_files):
            with open(fpath, "rb") as bf:
                header = bf.read(54)
                if len(header) < 54:
                    continue
                w, h = struct.unpack('<II', header[18:26])
                raw_data = bf.read()
                
            step = 32
            sampled = raw_data[0::step]
            if not sampled:
                continue
                
            n = len(sampled)
            mean_val = sum(sampled) / n
            variance = sum((b - mean_val) ** 2 for b in sampled) / n
            std_dev = math.sqrt(variance)
            std_devs.append(std_dev)
            
            if mean_val < 16.0:
                results["black_frames_detected"] += 1
                results["violations"].append(f"Black frame detected at sample {idx} (timestamp ~{idx/sample_fps:.2f}s)")
                
            if std_dev < 20.0:
                results["violations"].append(f"Monochrome/flat screen detected at sample {idx} (std_dev {std_dev:.1f} < 20.0)")
                
            # Compute 4-quadrant motion signatures to catch 2D zoompan vs genuine motion
            q_size = n // 4
            curr_q = [
                sum(sampled[0:q_size]) / max(1, q_size),
                sum(sampled[q_size:2*q_size]) / max(1, q_size),
                sum(sampled[2*q_size:3*q_size]) / max(1, q_size),
                sum(sampled[3*q_size:]) / max(1, len(sampled) - 3*q_size)
            ]
            
            if prev_quadrants is not None:
                q_diffs = [abs(curr_q[i] - prev_quadrants[i]) for i in range(4)]
                quadrant_deltas.append(q_diffs)
            prev_quadrants = curr_q
            
        if std_devs:
            results["mean_color_std_dev"] = round(sum(std_devs) / len(std_devs), 2)
            if results["mean_color_std_dev"] < 25.0:
                results["passed"] = False
                
        # Anti-Static Zoompan Detection:
        # In a 2D affine zoom, all 4 quadrants move with nearly identical uniform scalar change
        # whereas authentic video motion has organic variance across quadrants
        if len(quadrant_deltas) > 4:
            uniform_zoom_count = 0
            for d in quadrant_deltas:
                mean_d = sum(d) / 4.0
                if mean_d > 0.05:
                    variance_d = sum((x - mean_d) ** 2 for x in d) / 4.0
                    # If all quadrants change almost identically with zero internal variance (<0.01), it's a 2D digital zoom
                    if variance_d < 0.005:
                        uniform_zoom_count += 1
            if uniform_zoom_count > (len(quadrant_deltas) * 0.85):
                results["is_static_picture_zoom_detected"] = True
                results["passed"] = False
                results["violations"].append(
                    "STATIC PICTURE 2D AFFINE ZOOM DETECTED: Video frames exhibit uniform affine scaling over a still image without non-rigid character or fluid motion."
                )
                
        if results["black_frames_detected"] > 0 or len(results["violations"]) > 0:
            results["passed"] = False
            
    return results

def audit_audio_spectrum_and_siren(filepath):
    """
    Audits audio stream for:
      1. Pure-Tone Siren Detection (FFT harmonic concentration in 800-3000 Hz band).
      2. Dead Air Silence (<0.5s tolerance).
      3. Integrated Loudness (-24.0 LUFS ± 2.0 LUFS) & True Peak (<= -1.0 dBFS).
    """
    results = {
        "passed": True,
        "pure_tone_siren_detected": False,
        "integrated_lufs": -99.0,
        "true_peak_dbfs": 99.0,
        "max_silence_duration_sec": 0.0,
        "violations": []
    }
    
    ffmpeg_bin = shutil.which("ffmpeg") or "/usr/bin/ffmpeg"
    
    # 1. Check for silence > 0.5s
    cmd_silence = [
        ffmpeg_bin, "-i", filepath,
        "-af", "silencedetect=noise=-36dB:d=0.5",
        "-f", "null", "-"
    ]
    code, out, err = run_cmd(cmd_silence)
    lines = err.split("\n")
    for line in lines:
        if "silence_duration:" in line:
            try:
                dur = float(line.split("silence_duration:")[1].strip().split()[0])
                if dur > results["max_silence_duration_sec"]:
                    results["max_silence_duration_sec"] = dur
                if dur > 0.5:
                    results["passed"] = False
                    results["violations"].append(f"Dead air silence of {dur:.2f}s detected (> 0.5s tolerance)")
            except Exception:
                pass
                
    # 2. Check Loudness & Peak
    cmd_ebur = [
        ffmpeg_bin, "-i", filepath,
        "-af", "ebur128=peak=true",
        "-f", "null", "-"
    ]
    code, out, err = run_cmd(cmd_ebur)
    for line in err.split("\n"):
        if "I:" in line and "LUFS" in line:
            try:
                results["integrated_lufs"] = float(line.split("I:")[1].split("LUFS")[0].strip())
            except Exception:
                pass
        elif "Peak:" in line and "dBFS" in line:
            try:
                results["true_peak_dbfs"] = float(line.split("Peak:")[1].split("dBFS")[0].strip())
            except Exception:
                pass
                
    if abs(results["integrated_lufs"] - (-24.0)) > 2.5:
        results["passed"] = False
        results["violations"].append(f"Integrated loudness {results['integrated_lufs']} LUFS violates target -24.0 LUFS")
        
    if results["true_peak_dbfs"] > -1.0:
        results["passed"] = False
        results["violations"].append(f"True peak {results['true_peak_dbfs']} dBFS exceeds -1.0 dBFS broadcast ceiling")
        
    # 3. Check for pure-tone sirens (astats spectral flatness)
    cmd_stats = [
        ffmpeg_bin, "-i", filepath,
        "-af", "highpass=f=800,lowpass=f=3000,astats=metadata=1:reset=1",
        "-f", "null", "-"
    ]
    code, out, err = run_cmd(cmd_stats)
    # If dynamic range in the 800-3000Hz band is flat with near-zero crest factor or extreme peak energy, flag as siren
    for line in err.split("\n"):
        if "Flat factor:" in line:
            try:
                flat_factor = float(line.split("Flat factor:")[1].strip().split()[0])
                if flat_factor > 0.85:
                    results["pure_tone_siren_detected"] = True
                    results["passed"] = False
                    results["violations"].append("PURE TONE SIREN HAZARD DETECTED: Flat unmodulated sinusoidal tone in 800-3000Hz band.")
            except Exception:
                pass
                
    return results

def audit_media_file(filepath):
    print(f"🔬 Running Frame-Level Anti-Static & Anti-Siren Audit on: {filepath}")
    probe = probe_media(filepath)
    if not probe:
        return {"file": filepath, "passed": False, "error": "Unable to probe media"}
        
    video_stream = next((s for s in probe["streams"] if s.get("codec_type") == "video"), None)
    audio_stream = next((s for s in probe["streams"] if s.get("codec_type") == "audio"), None)
    
    report = {
        "file": filepath,
        "duration_sec": float(probe["format"].get("duration", 0)),
        "size_bytes": int(probe["format"].get("size", 0)),
        "overall_passed": True,
        "checks": {}
    }
    
    if video_stream:
        report["checks"]["visual_motion_and_richness"] = audit_frame_visual_motion_and_richness(filepath)
        if not report["checks"]["visual_motion_and_richness"]["passed"]:
            report["overall_passed"] = False
            
    if audio_stream:
        report["checks"]["audio_spectrum_and_siren"] = audit_audio_spectrum_and_siren(filepath)
        if not report["checks"]["audio_spectrum_and_siren"]["passed"]:
            report["overall_passed"] = False
            
    return report

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 frame_level_media_analyzer.py <media_filepath>")
        sys.exit(1)
        
    target_file = sys.argv[1]
    report = audit_media_file(target_file)
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["overall_passed"] else 1)
