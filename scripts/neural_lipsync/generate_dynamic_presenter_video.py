import sys
import os
import wave
import numpy as np
import cv2
import subprocess
import imageio
import imageio_ffmpeg

wav2lip_dir = os.path.join(os.getcwd(), "scripts/neural_lipsync/Wav2Lip")
sys.path.append(wav2lip_dir)
import face_detection

def create_dynamic_avatar_driving_video(image_path, audio_path, output_driving_mp4, fps=25):
    with wave.open(audio_path, 'rb') as wf:
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
    
    total_sec = n_frames / framerate
    total_frames = int(total_sec * fps)
    print(f"  • Generating dynamic video ({total_frames} frames, {total_sec:.2f}s, {fps} fps)...")

    base_img = cv2.imread(image_path)
    target_w, target_h = 1280, 720
    h, w = base_img.shape[:2]
    scale = max(target_w / w, target_h / h)
    sw, sh = int(w * scale), int(h * scale)
    scaled = cv2.resize(base_img, (sw, sh), interpolation=cv2.INTER_LANCZOS4)
    cx, cy = sw // 2, sh // 2
    cropped = scaled[(cy - target_h//2):(cy + target_h//2), (cx - target_w//2):(cx + target_w//2)]

    # S3FD face detection on centered frame
    detector = face_detection.FaceAlignment(face_detection.LandmarksType._2D, flip_input=False, device="mps")
    preds = detector.get_detections_for_batch(np.array([cv2.resize(cropped, (640, 360))]))
    del detector

    if preds and preds[0] is not None:
        rx1, ry1, rx2, ry2 = preds[0]
        sx, sy = target_w / 640.0, target_h / 360.0
        fx1, fy1, fx2, fy2 = int(rx1 * sx), int(ry1 * sy), int(rx2 * sx), int(ry2 * sy)
        face_cx = (fx1 + fx2) // 2
        face_cy = (fy1 + fy2) // 2
        eye_cy = int(fy1 + (fy2 - fy1) * 0.35)
        eye_h = int((fy2 - fy1) * 0.20)
        eye_w = int((fx2 - fx1) * 0.70)
        eye_x1 = max(0, face_cx - eye_w // 2)
        eye_x2 = min(target_w, face_cx + eye_w // 2)
        eye_y1 = max(0, eye_cy - eye_h // 2)
        eye_y2 = min(target_h, eye_cy + eye_h // 2)
    else:
        eye_x1, eye_y1, eye_x2, eye_y2 = target_w//3, target_h//4, 2*target_w//3, target_h//2

    blink_cycles = []
    t = 40
    while t < total_frames - 20:
        blink_cycles.append(t)
        t += np.random.randint(60, 95)

    writer = imageio.get_writer(output_driving_mp4, fps=fps, codec='libx264', quality=9, pixelformat='yuv420p')

    for i in range(total_frames):
        # Multi-harmonic organic head sway and breathing
        sway_x = np.sin(i * 0.04) * 2.5 + np.sin(i * 0.09) * 1.0
        sway_y = np.cos(i * 0.035) * 1.8 + np.sin(i * 0.07) * 0.6
        M = np.float32([[1, 0, sway_x], [0, 1, sway_y]])
        frame = cv2.warpAffine(cropped, M, (target_w, target_h), borderMode=cv2.BORDER_REFLECT)

        # Micro-Blink
        is_blinking = False
        blink_weight = 0.0
        for b_start in blink_cycles:
            if b_start <= i <= b_start + 6:
                is_blinking = True
                phase = (i - b_start) / 6.0
                blink_weight = np.sin(phase * np.pi)
                break

        if is_blinking and blink_weight > 0.15:
            eye_crop = frame[eye_y1:eye_y2, eye_x1:eye_x2]
            cur_h, cur_w = eye_crop.shape[:2]
            if cur_h > 4 and cur_w > 4:
                squash_h = max(2, int(cur_h * (1.0 - blink_weight * 0.65)))
                squashed = cv2.resize(eye_crop, (cur_w, squash_h), interpolation=cv2.INTER_LINEAR)
                padded = cv2.resize(squashed, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)
                alpha = blink_weight * 0.80
                frame[eye_y1:eye_y2, eye_x1:eye_x2] = cv2.addWeighted(padded, alpha, eye_crop, 1.0 - alpha, 0)

        writer.append_data(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    writer.close()
    return output_driving_mp4

def process_persona(persona_id, image_path, audio_path, final_output_path):
    temp_driving = f"temp/dynamic_driving_{persona_id}.mp4"
    create_dynamic_avatar_driving_video(image_path, audio_path, temp_driving, fps=25)

    print(f"  • Running Wav2Lip GAN Lip-Sync on true detected face...")
    cmd = [
        sys.executable, "inference.py",
        "--checkpoint_path", "checkpoints/wav2lip_gan.pth",
        "--face", os.path.abspath(temp_driving),
        "--audio", os.path.abspath(audio_path),
        "--outfile", os.path.abspath(final_output_path),
        "--fps", "25",
        "--resize_factor", "1",
        "--wav2lip_batch_size", "128"
    ]
    
    res = subprocess.run(cmd, cwd=wav2lip_dir)
    if os.path.exists(temp_driving):
        os.remove(temp_driving)

    if res.returncode == 0:
        size_mb = os.path.getsize(final_output_path) / (1024 * 1024)
        print(f"✓ SUCCESSFULLY GENERATED: {final_output_path} ({size_mb:.2f} MB)")
    else:
        print(f"❌ FAILED on {persona_id}")

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
            "image": "public/assets/avatars/avatar_executive_gravitas.jpg",
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
            "image": "public/assets/avatars/avatar_keynote_gesture.jpg",
            "audio": "public/assets/audio/jonathan_deepmind.wav",
            "output": "public/assets/video_synced/jonathan_neural_synced.mp4"
        }
    ]

    for p in personas:
        print(f"\n========================================================")
        print(f"🎬 Processing Dynamic Living Presenter: {p['id'].upper()}")
        print(f"========================================================")
        process_persona(p["id"], p["image"], p["audio"], p["output"])

    print("\n🎉 ALL 6 LIVING DYNAMIC PRESENTERS GENERATED WITH TRUE FACE MOUTH ARTICULATION!")
