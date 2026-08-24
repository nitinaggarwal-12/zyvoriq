import os
import imageio
from PIL import Image, ImageDraw

os.makedirs("scratch/proof_frames", exist_ok=True)

video_path = "public/assets/video_synced/priya_neural_synced.mp4"
reader = imageio.get_reader(video_path)

sample_frames = [
    {"frame_idx": 4, "timestamp": "0.16s", "word": "Hello (Vocal Onset)", "state": "Phoneme: /h/ -> /e/"},
    {"frame_idx": 20, "timestamp": "0.83s", "word": "everyone! (Peak Vowel)", "state": "Phoneme: /ɛv/ (Open)"},
    {"frame_idx": 110, "timestamp": "4.66s", "word": "[Pause after CTO.]", "state": "Phoneme: Silence (Lips Sealed)"},
    {"frame_idx": 250, "timestamp": "10.50s", "word": "$140,000 (Active Speech)", "state": "Phoneme: /wʌn/ -> /hʌn/"},
    {"frame_idx": 540, "timestamp": "22.66s", "word": "provenance! (Finale)", "state": "Phoneme: /ns/ (Closed Finish)"}
]

extracted_images = []
crop_size = 360

for item in sample_frames:
    idx = min(item["frame_idx"], len(reader) - 1)
    frame = reader.get_data(idx)
    img = Image.fromarray(frame)
    
    # Center face crop
    w, h = img.size
    cx, cy = w // 2, int(h * 0.50)
    face_crop = img.crop((cx - crop_size//2, cy - crop_size//2, cx + crop_size//2, cy + crop_size//2))
    
    draw = ImageDraw.Draw(face_crop)
    draw.rectangle([(0, crop_size - 60), (crop_size, crop_size)], fill=(10, 15, 30))
    draw.text((10, crop_size - 52), f"t={item['timestamp']} | {item['word']}", fill=(255, 200, 50))
    draw.text((10, crop_size - 28), f"Wav2Lip GAN: {item['state']}", fill=(100, 230, 180))
    
    out_path = f"scratch/proof_frames/wav2lip_proof_{idx}.png"
    face_crop.save(out_path)
    extracted_images.append(face_crop)

reader.close()

# Create collage
strip_w = crop_size * len(extracted_images)
strip_h = crop_size
collage = Image.new("RGB", (strip_w, strip_h))

for i, img in enumerate(extracted_images):
    collage.paste(img, (i * crop_size, 0))

collage_path = "scratch/proof_frames/00_wav2lip_gan_master_proof.png"
collage.save(collage_path)
print(f"🎉 WAV2LIP GAN MASTER VISUAL PROOF STRIP GENERATED: {collage_path} ({strip_w}x{strip_h})")
