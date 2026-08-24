import os
import imageio
from PIL import Image, ImageDraw, ImageFont
import numpy as np

os.makedirs("scratch/proof_frames", exist_ok=True)

video_path = "public/assets/video_synced/priya_neural_synced.mp4"
reader = imageio.get_reader(video_path)

# Extract frames at critical speech milestones
# FPS = 30
# Frame 0: Start / 0.0s ("Hello")
# Frame 15: 0.5s ("everyone!")
# Frame 140: 4.6s (Pause after "CTO." - mouth closed)
# Frame 315: 10.5s ("$140,000" - active vocalization)
# Frame 680: 22.6s ("provenance!" - finale)

sample_frames = [
    {"frame_idx": 5, "timestamp": "0.16s", "word": "Hello (Vocal Onset)", "state": "Mouth Opening"},
    {"frame_idx": 25, "timestamp": "0.83s", "word": "everyone! (Peak Vowel)", "state": "Mouth Wide Open"},
    {"frame_idx": 140, "timestamp": "4.66s", "word": "[Pause after CTO.]", "state": "Mouth Closed (Silence)"},
    {"frame_idx": 315, "timestamp": "10.50s", "word": "$140,000 (Complex Number)", "state": "Dynamic Articulation"},
    {"frame_idx": 680, "timestamp": "22.66s", "word": "provenance! (Finale)", "state": "Active Enunciation"}
]

extracted_images = []

for item in sample_frames:
    idx = item["frame_idx"]
    frame = reader.get_data(idx)
    img = Image.fromarray(frame)
    
    # Crop to face region (center close up 600x600)
    w, h = img.size
    cx, cy = w // 2, int(h * 0.45)
    crop_size = 500
    face_crop = img.crop((cx - crop_size//2, cy - crop_size//2, cx + crop_size//2, cy + crop_size//2))
    
    # Draw metadata banner on the frame
    draw = ImageDraw.Draw(face_crop)
    draw.rectangle([(0, crop_size - 70), (crop_size, crop_size)], fill=(10, 15, 30))
    draw.text((15, crop_size - 60), f"t={item['timestamp']} | Word: {item['word']}", fill=(255, 200, 50))
    draw.text((15, crop_size - 35), f"Viseme State: {item['state']}", fill=(100, 230, 180))
    
    out_path = f"scratch/proof_frames/proof_{idx}_{item['timestamp'].replace('.', '_')}.png"
    face_crop.save(out_path)
    extracted_images.append(face_crop)
    print(f"✓ Saved visual proof frame: {out_path}")

reader.close()

# Create unified 5-frame proof collage strip
strip_w = crop_size * len(extracted_images)
strip_h = crop_size
collage = Image.new("RGB", (strip_w, strip_h))

for i, img in enumerate(extracted_images):
    collage.paste(img, (i * crop_size, 0))

collage_path = "scratch/proof_frames/00_master_lipsync_proof_strip.png"
collage.save(collage_path)
print(f"\n🎉 MASTER LIP-SYNC VISUAL PROOF STRIP GENERATED: {collage_path} ({strip_w}x{strip_h})")
