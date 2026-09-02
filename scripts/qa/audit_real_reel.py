import os, time
import cv2
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

print("Uploading preflight_real.mp4 for realistic script evaluation...")
uploaded_real = client.files.upload(file="/Users/nitinagga/Documents/zyvoriq/preflight_real.mp4")
while uploaded_real.state.name == "PROCESSING":
    time.sleep(2)
    uploaded_real = client.files.get(name=uploaded_real.name)

print("Uploaded. Running Gemini 2.5 Pro Real-Script Audit...")

prompt = """
Forensic analysis of 43-second 6-hop continuous reel with realistic social script (`preflight_real.mp4`):
- Hop 1 (0:00-0:08): "Okay, so why is the sky blue? Most people get this completely wrong."
- Hop 2 (0:08-0:15): "It is not because the sky is reflecting the ocean. That is a myth."
- Hop 3 (0:15-0:22): "Sunlight looks white, but it is actually every colour mixed together."
- Hop 4 (0:22-0:29): "When it hits our atmosphere, blue light scatters far more than red light."
- Hop 5 (0:29-0:36): "So blue bounces around the whole sky, and that is what reaches your eyes."
- Hop 6 (0:36-0:43): "Follow for more things you were taught wrong at school."

Specifically evaluate:
1. Voice Consistency & Timbre: Does the voice remain identical from Hop 1 to Hop 6?
2. Natural Delivery of Complex Script Elements:
   - The conversational hook and question: "Okay, so why is the sky blue?" (Hop 1)
   - The myth-busting emphasis: "That is a myth." (Hop 2)
   - Scientific explanation: "scatters far more than red light" (Hop 4)
   - The social Call-to-Action (CTA): "Follow for more things you were taught wrong at school." (Hop 6)
   - Does she speak the script word-for-word without hallucination, ad-libbing, or slurring?
3. Identity Drift across 6 Hops: Compare 0:02 against 0:42.
4. Lip Sync on Question & CTA.
"""

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=[uploaded_real, prompt]
)

print("\n--- GEMINI 2.5 PRO REAL SCRIPT AUDIT REPORT ---")
print(response.text)

# Extract keyframe comparison
os.makedirs("/Users/nitinagga/Documents/zyvoriq/scripts/qa/real_keyframes", exist_ok=True)
cap = cv2.VideoCapture("/Users/nitinagga/Documents/zyvoriq/preflight_real.mp4")
fps = cap.get(cv2.CAP_PROP_FPS)

for t, label in [(2.0, "hop1_hook"), (10.0, "hop2_myth"), (17.0, "hop3_science"), (24.0, "hop4_atmosphere"), (31.0, "hop5_eyes"), (40.0, "hop6_cta")]:
    idx = int(t * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(f"/Users/nitinagga/Documents/zyvoriq/scripts/qa/real_keyframes/{label}_{t:.1f}s.jpg", frame)
print("Keyframes saved to scripts/qa/real_keyframes/")
cap.release()
