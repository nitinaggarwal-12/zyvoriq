import imageio
from PIL import Image
import numpy as np

video_path = "public/assets/video_synced/priya_neural_synced.mp4"
reader = imageio.get_reader(video_path)

# Extract first 90 frames (3.0 seconds: "Hello everyone! I'm Priya, Global Transformation CTO.")
frames = []
for i in range(0, 90, 2): # 15 fps sampling for smooth compact gif
    frame = reader.get_data(i)
    img = Image.fromarray(frame)
    
    # Crop face close-up (400x400)
    w, h = img.size
    cx, cy = w // 2, int(h * 0.45)
    crop_size = 400
    face_crop = img.crop((cx - crop_size//2, cy - crop_size//2, cx + crop_size//2, cy + crop_size//2))
    frames.append(face_crop)

reader.close()

gif_path = "scratch/proof_frames/01_priya_speech_lipsync_animation.gif"
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=66, # ~15 fps
    loop=0
)
print(f"🎉 ANIMATED LIP-SYNC PROOF GIF GENERATED: {gif_path} ({len(frames)} frames)")
