#!/usr/bin/env python3
"""
VLM Semantic Relevance & Historical Authenticity Quality Gate
Prevents cross-project asset pollution and hallucinated footage:
- Strictly verifies that every sequence depicts authentic 18th/19th century Napoleonic history.
- Runs adversarial 4-way zero-shot classification using Google DeepMind Gemini Vision.
- Rejects sci-fi singularities, Tibetan monasteries, modern artifacts, or cartoon graphics.
"""

import os
import sys
import json
import base64
import subprocess
import shutil
import tempfile
import urllib.request

def load_api_key():
    env_paths = [".env.local", "../.env.local", os.path.expanduser("~/.env.local")]
    for p in env_paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    if "GEMINI_API_KEY=" in line or "GOOGLE_API_KEY=" in line:
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

API_KEY = load_api_key()

EXPECTED_THEMES = {
    "SQ01": {
        "title": "Siege of Toulon (1793)",
        "keywords": ["artillery", "cannons", "ships", "sea", "smoke", "uniform", "battle", "soldier", "napoleon", "rain", "mud"],
        "disallowed": ["sci-fi", "singularity", "black hole", "space", "modern car", "monastery", "buddhist", "cyberpunk"]
    },
    "SQ02": {
        "title": "Tuileries Palace (1804)",
        "keywords": ["palace", "study", "interior", "napoleon", "uniform", "council", "candles", "desk", "paper", "law"],
        "disallowed": ["sci-fi", "singularity", "black hole", "space", "modern car", "monastery", "buddhist", "cyberpunk"]
    },
    "SQ03": {
        "title": "Coronation at Notre-Dame (1804)",
        "keywords": ["coronation", "cathedral", "church", "robes", "velvet", "gold", "crown", "emperor", "pope", "candles"],
        "disallowed": ["sci-fi", "singularity", "black hole", "space", "modern car", "monastery", "buddhist", "cyberpunk"]
    },
    "SQ04": {
        "title": "Battle of Austerlitz (1805)",
        "keywords": ["austerlitz", "battlefield", "winter", "mist", "horse", "infantry", "smoke", "fog", "sun", "napoleon"],
        "disallowed": ["sci-fi", "singularity", "black hole", "space", "event horizon", "star", "spaceship", "monastery"]
    },
    "SQ05": {
        "title": "Saint Helena Exile (1821)",
        "keywords": ["cliffs", "ocean", "sea", "rocks", "island", "exile", "coat", "bicorne", "contemplation", "napoleon", "water"],
        "disallowed": ["sci-fi", "singularity", "black hole", "space", "modern car", "monastery", "buddhist", "cyberpunk"]
    }
}

def extract_keyframe(video_path, timestamp_sec=2.0):
    ffmpeg_bin = shutil.which("ffmpeg") or "/usr/bin/ffmpeg"
    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    tmp.close()
    cmd = [
        ffmpeg_bin, "-y", "-ss", str(timestamp_sec), "-i", video_path,
        "-vframes", "1", "-q:v", "2", tmp.name
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode == 0 and os.path.getsize(tmp.name) > 5000:
        return tmp.name
    if os.path.exists(tmp.name):
        os.remove(tmp.name)
    return None

def analyze_keyframe_with_gemini(image_path, seq_id):
    if not API_KEY:
        return {"passed": False, "error": "No GEMINI_API_KEY found"}

    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    theme = EXPECTED_THEMES.get(seq_id, {})
    prompt = f"""You are a film archivist and historical visual quality inspector certifying shots for a cinematic film on Napoleon Bonaparte.
Analyze this video keyframe for Sequence '{seq_id}' ({theme.get('title', 'Historical Scene')}).

Perform this strict zero-shot evaluation:
1. Classify the scene into EXACTLY ONE category:
   [A] 18th/19th-century Napoleonic historical setting (French soldiers, officers, cannons, 1800s palace, cathedral coronation, or rocky Atlantic island exile)
   [B] Sci-fi / Space / Abstract (black holes, space singularities, cosmic nebulae, futuristic technology)
   [C] Asian religious / Buddhist monastery / ancient East Asian temple
   [D] Modern 20th/21st century (modern vehicles, asphalt roads, electric lines)
   [E] Other / Unrelated

2. Check for the presence of disallowed elements: {', '.join(theme.get('disallowed', []))}
3. Provide a historical semantic relevance score from 1.0 to 5.0 (compressed toward 2.5 - 3.8 scale).

Return STRICT JSON only:
{{
  "classification": "A" | "B" | "C" | "D" | "E",
  "historical_relevance_score": 3.4,
  "detected_subjects": ["list", "of", "elements"],
  "disallowed_elements_found": ["any", "found"] or [],
  "scene_description": "Brief description of the image",
  "is_napoleon_historically_valid": true | false
}}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}}
            ]
        }],
        "generationConfig": {"response_mime_type": "application/json", "temperature": 0.1}
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            text = res_data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
    except Exception as e:
        return {"passed": False, "error": str(e)}

def audit_all_sequences():
    shots_dir = "scratch/productions/napoleon/shots"
    stills_dir = "scratch/productions/napoleon/stills"
    sequences = ["SQ01", "SQ02", "SQ03", "SQ04", "SQ05"]
    
    overall_passed = True
    report = {"sequences": {}, "overall_passed": True}

    print("================================================================================")
    print("🔍 AUDITING VLM HISTORICAL SEMANTIC RELEVANCE ACROSS ALL SEQUENCES")
    print("================================================================================\n")

    for seq_id in sequences:
        video_path = os.path.join(shots_dir, f"{seq_id}_cinematic_reel.mp4")
        keyframe_path = None
        
        if os.path.exists(video_path):
            keyframe_path = extract_keyframe(video_path, 3.0)
        
        if not keyframe_path:
            alt_still = os.path.join(stills_dir, f"{seq_id}_4k_keyframe.png")
            if os.path.exists(alt_still):
                keyframe_path = alt_still

        if not keyframe_path or not os.path.exists(keyframe_path):
            print(f"❌ [{seq_id}] Missing video or keyframe for analysis.")
            report["sequences"][seq_id] = {"passed": False, "error": "Missing media file"}
            overall_passed = False
            continue

        print(f"📡 [{seq_id}] Analyzing keyframe with Gemini Vision VLM...")
        eval_result = analyze_keyframe_with_gemini(keyframe_path, seq_id)
        
        # Clean up temporary extracted frame if created
        if keyframe_path.startswith(tempfile.gettempdir()) and os.path.exists(keyframe_path):
            os.remove(keyframe_path)

        classification = eval_result.get("classification", "E")
        is_valid = eval_result.get("is_napoleon_historically_valid", False)
        disallowed = eval_result.get("disallowed_elements_found", [])
        score = eval_result.get("historical_relevance_score", 1.0)
        desc = eval_result.get("scene_description", "N/A")

        passed = (classification == "A") and is_valid and (len(disallowed) == 0)
        report["sequences"][seq_id] = {
            "passed": passed,
            "classification": classification,
            "historical_relevance_score": score,
            "disallowed_elements": disallowed,
            "description": desc
        }

        if passed:
            print(f"  ✅ [{seq_id}] PASS (Category: {classification}, Score: {score}/5.0)")
            print(f"     Description: {desc}\n")
        else:
            print(f"  ❌ [{seq_id}] FAILED: Classification='{classification}' (Expected 'A'), Disallowed={disallowed}")
            print(f"     Description: {desc}")
            print(f"     Reason: Non-Napoleonic or foreign content detected.\n")
            overall_passed = False

    report["overall_passed"] = overall_passed
    qc_out = "scratch/productions/napoleon/qc/vlm_semantic_relevance_report.json"
    os.makedirs(os.path.dirname(qc_out), exist_ok=True)
    with open(qc_out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("================================================================================")
    if overall_passed:
        print("🎉 VLM SEMANTIC RELEVANCE AUDIT: 100% PASS (Zero foreign artifacts detected)")
        print("================================================================================\n")
        return 0
    else:
        print("❌ VLM SEMANTIC RELEVANCE AUDIT: FAILED (Foreign or invalid footage present)")
        print("================================================================================\n")
        return 1

if __name__ == "__main__":
    sys.exit(audit_all_sequences())
