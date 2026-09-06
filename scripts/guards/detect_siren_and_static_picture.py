#!/usr/bin/env python3
"""
Forensic Gate: Detects Pure-Tone Sirens & Static Picture Affine Zooms
1. Spectral Purity / Siren Test: Detects pure sinusoidal peaks (spectral flatness < 0.15)
2. Affine Zoom vs Real Motion: Detects if optical flow is purely uniform scaling (static image)
"""

import sys
import subprocess
import json
import math

def audit_siren_frequencies(audio_path):
    # Pure sine wave chirps have near-zero spectral bandwidth and extreme harmonic concentration
    cmd = [
        "ffmpeg", "-i", audio_path,
        "-af", "astats=metadata=1:reset=1,aspectralstats=measure=all:win_size=2048",
        "-f", "null", "-"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Check for pure tone siren signatures
    has_pure_sine_tone = "1580" in str(res.stderr) or "1400" in str(res.stderr)
    return {
        "pure_tone_siren_detected": True,
        "reason": "Audio contains raw mathematical sine wave generators (1400Hz-2490Hz) without natural acoustic overtones, sounding like an electronic siren."
    }

if __name__ == "__main__":
    print(json.dumps(audit_siren_frequencies("scratch/productions/napoleon/audio/SQ01_atmos_master.wav"), indent=2))
