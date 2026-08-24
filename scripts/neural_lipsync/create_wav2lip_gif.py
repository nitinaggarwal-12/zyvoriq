import imageio
from PIL import Image

video_path = "public/assets/video_synced/priya_neural_synced.mp4"
reader = imageio.get_reader(video_path)

frames = []
for i in range(0, min(80, len(reader)), 2):
    frame = reader.get_data(i)
    img = Image.fromarray(frame)
    w, h = img.size
    cx, cy = w // 2, int(h * 0.50)
    crop_size = 300
    face_crop = img.crop((cx - crop_size//2, cy - crop_size//2, cx + crop_size//2, cy + crop_size//2))
    frames.append(face_crop)

reader.close()

gif_path = "scratch/proof_frames/01_wav2lip_gan_speech_animation.gif"
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=83, # 12 fps
    loop=0
)
print(f"🎉 WAV2LIP GAN ANIMATED PROOF GIF GENERATED: {gif_path} ({len(frames)} frames)")
