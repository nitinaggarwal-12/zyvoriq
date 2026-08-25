import cv2, wave, os, subprocess, librosa, imageio_ffmpeg
import numpy as np

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def render_priya_variant(name, video_src, audio_src, output_mp4, start_frame=22, lead_ms=0, amp_mult=1.0, fps=24.0):
    print(f"\n🎬 Rendering Priya Variant [{name}] -> {output_mp4}")
    
    # 1. Load Audio
    y, sr = librosa.load(audio_src, sr=24000)
    audio_dur = len(y) / sr
    total_frames = int(round(audio_dur * fps))
    hop_length = int(sr / fps)
    
    rms = librosa.feature.rms(y=y, frame_length=hop_length*2, hop_length=hop_length)[0]
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop_length)[0]
    
    def pad_trim(arr):
        if len(arr) < total_frames:
            return np.pad(arr, (0, total_frames - len(arr)), mode="edge")
        return arr[:total_frames]
        
    rms = pad_trim(rms)
    centroid = pad_trim(centroid)
    
    p95 = np.percentile(rms, 95)
    norm_energy = np.clip(rms / (p95 if p95 > 0 else 1.0), 0.0, 1.2)
    norm_energy = np.convolve(norm_energy, [0.15, 0.70, 0.15], mode="same")
    norm_openness = np.clip((centroid - 500) / 3000.0, 0.0, 1.0)
    
    # Apply visual lead shift if requested
    lead_frames = int(round((lead_ms / 1000.0) * fps))
    if lead_frames > 0:
        norm_energy = np.roll(norm_energy, -lead_frames)
        norm_openness = np.roll(norm_openness, -lead_frames)
    
    # 2. Video Source
    cap = cv2.VideoCapture(video_src)
    raw_frames = []
    while True:
        ret, frame = cap.read()
        if not ret: break
        raw_frames.append(frame)
    cap.release()
    
    speech_frames = raw_frames[start_frame:] if start_frame < len(raw_frames) else raw_frames
    n_src = len(speech_frames)
    h, w = speech_frames[0].shape[:2]
    
    # Geometry for Priya
    mouth_cx = int(w * 0.69)
    mouth_cy = int(h * 0.78)
    sigma_x = 42.0
    sigma_y = 30.0
    
    grid_y, grid_x = np.meshgrid(np.arange(h, dtype=np.float32), np.arange(w, dtype=np.float32), indexing="ij")
    gauss_2d = np.exp(-(((grid_x - mouth_cx)**2) / (2 * sigma_x**2) + ((grid_y - mouth_cy)**2) / (2 * sigma_y**2)))
    
    processed_frames = []
    for i in range(total_frames):
        src_idx = i % n_src
        base_frame = speech_frames[src_idx]
        
        e = norm_energy[i]
        o = norm_openness[i]
        
        if e > 0.03:
            jaw_drop = e * (6.0 + 5.0 * o) * amp_mult
            map_x = grid_x
            map_y = grid_y - (jaw_drop * gauss_2d)
            
            warped = cv2.remap(base_frame, map_x.astype(np.float32), map_y.astype(np.float32),
                               interpolation=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
            alpha = np.clip(gauss_2d * 0.95, 0.0, 1.0)[:, :, np.newaxis]
            blended = (warped * alpha + base_frame * (1.0 - alpha)).astype(np.uint8)
            processed_frames.append(blended)
        else:
            processed_frames.append(base_frame)
            
    temp_mp4 = output_mp4.replace(".mp4", "_temp.mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(temp_mp4, fourcc, fps, (w, h))
    for f in processed_frames:
        writer.write(f)
    writer.release()
    
    cmd = [
        ffmpeg_exe, "-y",
        "-i", temp_mp4,
        "-i", audio_src,
        "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k",
        "-shortest",
        output_mp4
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    if os.path.exists(temp_mp4): os.remove(temp_mp4)
    print(f"  ✓ Produced {output_mp4} ({total_frames} frames, {audio_dur:.2f}s)")

# Render Priya Variants
variants = [
    ("Default True-Lock", "public/assets/video/priya_veo_broadcast.mp4", "public/assets/audio/priya_deepmind.wav", "public/assets/video_synced/priya_neural_synced.mp4", 22, 0, 1.0),
    ("Anticipation Lead +120ms", "public/assets/video/priya_veo_broadcast.mp4", "public/assets/audio/priya_deepmind.wav", "public/assets/video_synced/priya_lead_120ms.mp4", 22, 120, 1.15),
    ("Expressive Stage 1.4x", "public/assets/video/priya_veo_broadcast.mp4", "public/assets/audio/priya_deepmind.wav", "public/assets/video_synced/priya_expressive.mp4", 22, 80, 1.4),
]

for name, vid, aud, out, sf, lead, amp in variants:
    render_priya_variant(name, vid, aud, out, sf, lead, amp)

print("\n🎉 ALL PRIYA VARIANTS RENDERED!")
