import os, time
import cv2
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

print("Uploading preflight_long.mp4 for 6-hop cumulative drift evaluation...")
uploaded_long = client.files.upload(file="/Users/nitinagga/Documents/zyvoriq/preflight_long.mp4")
while uploaded_long.state.name == "PROCESSING":
    time.sleep(2)
    uploaded_long = client.files.get(name=uploaded_long.name)

print("Uploaded. Running Gemini 2.5 Pro 6-Hop Audit...")

prompt = """
Forensic analysis of 43-second 6-hop continuous reel (`preflight_long.mp4`):
- Hop 1 (0:00-0:08): "Mars is the fourth planet from the sun, and it is far colder than most people imagine."
- Hop 2 (0:08-0:15): "The average surface temperature is about minus sixty degrees celsius."
- Hop 3 (0:15-0:22): "That is colder than any winter ever recorded on Earth."
- Hop 4 (0:22-0:29): "The thin atmosphere cannot hold on to heat at all."
- Hop 5 (0:29-0:36): "Sunlight arrives, warms the surface, and the heat escapes almost immediately."
- Hop 6 (0:36-0:43): "So Mars is not cold because it is far away. It is cold because it cannot keep what it gets."

Evaluate:
1. Voice Consistency to Hop 6: Does vocal timbre, pitch, accent, and cadence hold across all 6 hops to the final word?
2. Identity Drift by Hop 6: Compare 0:02 (opening) vs 0:42 (closing). Any drift in face, hair bun, navy shirt, lighting?
3. Seams (every ~7s): Any audible/visible pops, freeze frames, or cuts?
4. Lip Sync: Quality on Hop 5 and 6.
"""

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=[uploaded_long, prompt]
)

print("\n--- GEMINI 2.5 PRO 6-HOP AUDIT REPORT ---")
print(response.text)

# Extract keyframe comparison
os.makedirs("/Users/nitinagga/Documents/zyvoriq/scripts/qa/long_keyframes", exist_ok=True)
cap = cv2.VideoCapture("/Users/nitinagga/Documents/zyvoriq/preflight_long.mp4")
fps = cap.get(cv2.CAP_PROP_FPS)

for t, label in [(2.0, "hop1_start"), (7.5, "hop1_seam"), (15.0, "hop2_seam"), (22.0, "hop3_seam"), (29.0, "hop4_seam"), (36.0, "hop5_seam"), (42.0, "hop6_end")]:
    idx = int(t * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(f"/Users/nitinagga/Documents/zyvoriq/scripts/qa/long_keyframes/{label}_{t:.1f}s.jpg", frame)
print("Keyframes saved to scripts/qa/long_keyframes/")
cap.release()
