import os
import sys
from neural_lipsync_engine import synthesize_lip_sync_video

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
    if not os.path.exists(p["output"]):
        print(f"\nProcessing {p['id']}...")
        synthesize_lip_sync_video(p["image"], p["audio"], p["output"])
    else:
        print(f"✓ Already generated: {p['output']}")

print("\n🎉 ALL 6 NEURAL LIP-SYNCED MP4 VIDEOS GENERATED!")
