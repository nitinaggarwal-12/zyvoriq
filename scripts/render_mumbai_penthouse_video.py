import subprocess
import os
import sys

STILL = "public/assets/stills/mumbai_penthouse.jpg"
OUT_30S = "public/assets/video/mumbai_penthouse_30s_cut.mp4"
OUT_180S = "public/assets/video/mumbai_penthouse_180s_master.mp4"

def main():
    if not os.path.exists(STILL):
        print(f"Error: Still not found at {STILL}")
        sys.exit(1)

    os.makedirs("public/assets/video", exist_ok=True)

    audio_filter = (
        "anoisesrc=d=180:c=pink:r=48000:a=0.006,bandpass=f=450:w=350[room];"
        "sine=f=293.66:d=180,volume=0.18[d];"
        "sine=f=369.99:d=180,volume=0.14[fsharp];"
        "sine=f=440.00:d=180,volume=0.14[a];"
        "sine=f=587.33:d=180,volume=0.12[d_hi];"
        "[d][fsharp][a][d_hi][room]amix=inputs=5:duration=longest,"
        "flanger=delay=8:depth=2:regen=20:width=80:speed=0.3,"
        "aecho=0.8:0.7:120:0.35,"
        "lowpass=f=4500,highpass=f=80,"
        "loudnorm=I=-24:LRA=7:TP=-2.0[aout]"
    )

    print("🎬 Rendering 30s cut for Mumbai Penthouse...")
    cmd_30 = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", STILL,
        "-filter_complex", (
            "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
            "zoompan=z='min(zoom+0.0004,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=24*30:s=1920x1080:fps=24[vout];"
            + audio_filter
        ),
        "-map", "[vout]", "-map", "[aout]",
        "-t", "30",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        OUT_30S
    ]
    subprocess.run(cmd_30, check=True)
    print(f"✅ Created {OUT_30S}")

    print("🎬 Rendering 180s master for Mumbai Penthouse...")
    cmd_180 = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", STILL,
        "-filter_complex", (
            "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
            "zoompan=z='min(zoom+0.0001,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=24*180:s=1920x1080:fps=24[vout];"
            + audio_filter
        ),
        "-map", "[vout]", "-map", "[aout]",
        "-t", "180",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        OUT_180S
    ]
    subprocess.run(cmd_180, check=True)
    print(f"✅ Created {OUT_180S}")

if __name__ == "__main__":
    main()
