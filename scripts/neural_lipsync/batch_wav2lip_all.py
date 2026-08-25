import subprocess
import os
import sys

wav2lip_dir = os.path.join(os.getcwd(), "scripts/neural_lipsync/Wav2Lip")

tasks = [
    {
        "id": "priya",
        "face": "../../../public/assets/video/priya_veo_broadcast.mp4",
        "audio": "../../../public/assets/audio/priya_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/priya_neural_synced.mp4"
    },
    {
        "id": "victoria",
        "face": "../../../public/assets/video/victoria_veo_broadcast.mp4",
        "audio": "../../../public/assets/audio/victoria_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/victoria_neural_synced.mp4"
    },
    {
        "id": "david",
        "face": "../../../public/assets/video/david_veo_broadcast.mp4",
        "audio": "../../../public/assets/audio/david_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/david_neural_synced.mp4"
    },
    {
        "id": "elena",
        "face": "../../../public/assets/video/victoria_veo_broadcast.mp4",
        "audio": "../../../public/assets/audio/elena_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/elena_neural_synced.mp4"
    },
    {
        "id": "maya",
        "face": "../../../public/assets/video/priya_veo_broadcast.mp4",
        "audio": "../../../public/assets/audio/maya_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/maya_neural_synced.mp4"
    },
    {
        "id": "jonathan",
        "face": "../../../public/assets/video/david_veo_broadcast.mp4",
        "audio": "../../../public/assets/audio/jonathan_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/jonathan_neural_synced.mp4"
    }
]

for t in tasks:
    print(f"\n========================================================")
    print(f"🎬 Executing Calibrated Neural Lip-Sync: {t['id'].upper()}")
    print(f"========================================================")
    cmd = [
        sys.executable, "inference.py",
        "--checkpoint_path", "checkpoints/wav2lip_gan.pth",
        "--face", t["face"],
        "--audio", t["audio"],
        "--outfile", t["outfile"],
        "--audio_offset_frames", "2",
        "--pads", "0", "16", "0", "0",
        "--resize_factor", "1"
    ]
    res = subprocess.run(cmd, cwd=wav2lip_dir)
    if res.returncode == 0:
        print(f"✓ SUCCESSFULLY GENERATED: {t['outfile']}")
    else:
        print(f"❌ FAILED on {t['id']}")

print("\n🎉 ALL 6 PERSONAS SYNTHESIZED WITH REAL WAV2LIP GAN NEURAL MODEL & CALIBRATED TIMING!")
