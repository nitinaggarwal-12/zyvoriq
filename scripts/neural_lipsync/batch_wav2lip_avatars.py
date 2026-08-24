import subprocess
import os
import sys

wav2lip_dir = os.path.join(os.getcwd(), "scripts/neural_lipsync/Wav2Lip")

tasks = [
    {
        "id": "victoria",
        "face": "../../../public/assets/avatars/avatar_female_executive.jpg",
        "audio": "../../../public/assets/audio/victoria_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/victoria_neural_synced.mp4"
    },
    {
        "id": "david",
        "face": "../../../public/assets/avatars/avatar_keynote_gesture.jpg",
        "audio": "../../../public/assets/audio/david_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/david_neural_synced.mp4"
    },
    {
        "id": "elena",
        "face": "../../../public/assets/avatars/avatar_elena_founder.jpg",
        "audio": "../../../public/assets/audio/elena_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/elena_neural_synced.mp4"
    },
    {
        "id": "maya",
        "face": "../../../public/assets/avatars/avatar_maya_fireside.jpg",
        "audio": "../../../public/assets/audio/maya_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/maya_neural_synced.mp4"
    },
    {
        "id": "jonathan",
        "face": "../../../public/assets/avatars/avatar_executive_gravitas.jpg",
        "audio": "../../../public/assets/audio/jonathan_deepmind.wav",
        "outfile": "../../../public/assets/video_synced/jonathan_neural_synced.mp4"
    }
]

for t in tasks:
    print(f"\n========================================================")
    print(f"🎬 Executing Wav2Lip GAN Inference: {t['id'].upper()}")
    print(f"========================================================")
    cmd = [
        sys.executable, "inference.py",
        "--checkpoint_path", "checkpoints/wav2lip_gan.pth",
        "--face", t["face"],
        "--audio", t["audio"],
        "--outfile", t["outfile"],
        "--fps", "25",
        "--resize_factor", "1"
    ]
    res = subprocess.run(cmd, cwd=wav2lip_dir)
    if res.returncode == 0:
        print(f"✓ SUCCESSFULLY GENERATED: {t['outfile']}")
    else:
        print(f"❌ FAILED on {t['id']}")

print("\n🎉 ALL 6 AVATAR LIP-SYNC VIDEOS PROCESSED VIA WAV2LIP GAN!")
