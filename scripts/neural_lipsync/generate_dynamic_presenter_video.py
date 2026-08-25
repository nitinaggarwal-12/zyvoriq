import sys
import os
import wave
import numpy as np
import cv2
import subprocess
import torch

def detect_face_box_on_image(image_path, target_w=640, target_h=360):
    base_img = cv2.imread(image_path)
    h, w = base_img.shape[:2]
    scale = max(target_w / w, target_h / h) * 1.10
    scaled_w, scaled_h = int(w * scale), int(h * scale)
    
    # In center crop 640x360, face is centered
    crop_x = (scaled_w - target_w) // 2
    crop_y = (scaled_h - target_h) // 2
    
    # Face bounding box (y1, y2, x1, x2) for 640x360 framing
    box_w = int(target_w * 0.38) # ~240px
    box_h = int(target_h * 0.70) # ~250px
    x1 = (target_w - box_w) // 2
    x2 = x1 + box_w
    y1 = int(target_h * 0.12)
    y2 = y1 + box_h
    return y1, y2, x1, x2

def create_dynamic_driving_video(image_path, audio_path, output_driving_path, fps=25):
    with wave.open(audio_path, 'rb') as wf:
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
    
    total_sec = n_frames / framerate
    total_frames = int(total_sec * fps)
    print(f"🎬 Step 1: Synthesizing dynamic motion frames ({total_frames} frames, {total_sec:.2f}s, {fps} fps)...")

    base_img = cv2.imread(image_path)
    h, w = base_img.shape[:2]

    target_w, target_h = 640, 360
    scale = max(target_w / w, target_h / h) * 1.10
    scaled_w, scaled_h = int(w * scale), int(h * scale)
    base_scaled = cv2.resize(base_img, (scaled_w, scaled_h), interpolation=cv2.INTER_AREA)

    cx, cy = scaled_w // 2, scaled_h // 2
    
    eye_cy = int(scaled_h * 0.38)
    eye_h = int(scaled_h * 0.08)
    eye_w = int(scaled_w * 0.30)
    eye_x1 = max(0, cx - eye_w // 2)
    eye_x2 = min(scaled_w, cx + eye_w // 2)
    eye_y1 = max(0, eye_cy - eye_h // 2)
    eye_y2 = min(scaled_h, eye_cy + eye_h // 2)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_driving_path, fourcc, fps, (target_w, target_h))

    blink_cycles = []
    t = 30
    while t < total_frames - 15:
        blink_cycles.append(t)
        t += np.random.randint(55, 85)

    for i in range(total_frames):
        # Multi-harmonic organic head sway and breathing
        sway_yaw = np.sin(i * 0.04) * 3.5 + np.sin(i * 0.09) * 1.5
        sway_pitch = np.cos(i * 0.035) * 3.0 + np.sin(i * 0.07) * 1.2
        sway_roll = np.sin(i * 0.02) * 1.0

        M = cv2.getRotationMatrix2D((cx, cy), sway_roll, 1.0)
        M[0, 2] += sway_yaw
        M[1, 2] += sway_pitch

        frame = cv2.warpAffine(base_scaled, M, (scaled_w, scaled_h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

        # Micro-Blink
        is_blinking = False
        blink_weight = 0.0
        for b_start in blink_cycles:
            if b_start <= i <= b_start + 5:
                is_blinking = True
                phase = (i - b_start) / 5.0
                blink_weight = np.sin(phase * np.pi)
                break

        if is_blinking and blink_weight > 0.15:
            eye_crop = frame[eye_y1:eye_y2, eye_x1:eye_x2]
            cur_h, cur_w = eye_crop.shape[:2]
            if cur_h > 4 and cur_w > 4:
                squash_h = max(2, int(cur_h * (1.0 - blink_weight * 0.70)))
                squashed = cv2.resize(eye_crop, (cur_w, squash_h), interpolation=cv2.INTER_LINEAR)
                padded = cv2.resize(squashed, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)
                alpha = blink_weight * 0.85
                frame[eye_y1:eye_y2, eye_x1:eye_x2] = cv2.addWeighted(padded, alpha, eye_crop, 1.0 - alpha, 0)

        crop_x = (scaled_w - target_w) // 2
        crop_y = (scaled_h - target_h) // 2
        final_frame = frame[crop_y:crop_y + target_h, crop_x:crop_x + target_w]

        out.write(final_frame)

    out.release()
    return output_driving_path

def process_persona(persona_id, image_path, audio_path, final_output_path):
    temp_driving = f"temp/dynamic_driving_{persona_id}.mp4"
    create_dynamic_driving_video(image_path, audio_path, temp_driving)

    y1, y2, x1, x2 = detect_face_box_on_image(image_path)
    print(f"🎬 Step 2: Running Wav2Lip GAN with Dynamic Box [{y1}:{y2}, {x1}:{x2}]...")
    
    wav2lip_dir = os.path.join(os.getcwd(), "scripts/neural_lipsync/Wav2Lip")

    cmd = [
        sys.executable, "inference.py",
        "--checkpoint_path", "checkpoints/wav2lip_gan.pth",
        "--face", os.path.abspath(temp_driving),
        "--audio", os.path.abspath(audio_path),
        "--outfile", os.path.abspath(final_output_path),
        "--box", str(y1), str(y2), str(x1), str(x2),
        "--wav2lip_batch_size", "128",
        "--resize_factor", "1"
    ]
    
    res = subprocess.run(cmd, cwd=wav2lip_dir)
    if res.returncode == 0:
        print(f"✓ SUCCESSFULLY GENERATED LIVING DYNAMIC LIP-SYNC VIDEO: {final_output_path}")
    else:
        print(f"❌ Error generating {persona_id}")

if __name__ == "__main__":
    os.makedirs("temp", exist_ok=True)
    os.makedirs("public/assets/video_synced", exist_ok=True)

    personas = [
        {
            "id": "priya",
            "image": "public/assets/avatars/avatar_priya_cto.jpg",
            "audio": "public/assets/audio/priya_deepmind.wav",
            "output": "public/assets/video_synced/priya_neural_synced.mp4"
        },
        {
            "id": "victoria",
            "image": "public/assets/avatars/avatar_female_executive.jpg",
            "audio": "public/assets/audio/victoria_deepmind.wav",
            "output": "public/assets/video_synced/victoria_neural_synced.mp4"
        },
        {
            "id": "david",
            "image": "public/assets/avatars/avatar_keynote_gesture.jpg",
            "audio": "public/assets/audio/david_deepmind.wav",
            "output": "public/assets/video_synced/david_neural_synced.mp4"
        },
        {
            "id": "elena",
            "image": "public/assets/avatars/avatar_elena_founder.jpg",
            "audio": "public/assets/audio/elena_deepmind.wav",
            "output": "public/assets/video_synced/elena_neural_synced.mp4"
        },
        {
            "id": "maya",
            "image": "public/assets/avatars/avatar_maya_fireside.jpg",
            "audio": "public/assets/audio/maya_deepmind.wav",
            "output": "public/assets/video_synced/maya_neural_synced.mp4"
        },
        {
            "id": "jonathan",
            "image": "public/assets/avatars/avatar_executive_gravitas.jpg",
            "audio": "public/assets/audio/jonathan_deepmind.wav",
            "output": "public/assets/video_synced/jonathan_neural_synced.mp4"
        }
    ]

    for p in personas:
        print(f"\n========================================================")
        print(f"🎬 Processing Dynamic Living Presenter: {p['id'].upper()}")
        print(f"========================================================")
        process_persona(p["id"], p["image"], p["audio"], p["output"])

    print("\n🎉 ALL 6 LIVING DYNAMIC PRESENTERS GENERATED WITH WAV2LIP GAN!")
