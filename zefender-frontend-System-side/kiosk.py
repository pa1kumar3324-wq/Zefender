#!/usr/bin/env python3
"""
AdKiosk Kiosk Player — Raspberry Pi
Plays all videos in /home/pi/ads/ fullscreen in a loop using MPV.
No browser. No internet. No UI.

Runs as a systemd service on boot.
Watches the ads folder for changes — new uploads appear automatically.
"""

import os
import json
import time
import subprocess
from pathlib import Path

ADS_DIR    = Path("/home/pi/ads")
ORDER_FILE = ADS_DIR / "order.json"
ALLOWED    = {".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"}

# MPV flags: fullscreen, no OSD, no controls, loop-safe
MPV_ARGS = [
    "mpv",
    "--fullscreen",
    "--no-osd-bar",
    "--no-input-default-bindings",  # disable keyboard shortcuts
    "--no-input-vo-keyboard",
    "--cursor-autohide=always",
    "--really-quiet",
    "--loop=no",                    # we handle looping ourselves
]


def get_playlist():
    """Return ordered list of absolute video paths."""
    all_files = {
        f.name for f in ADS_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in ALLOWED
    }
    if not all_files:
        return []

    ordered = []
    if ORDER_FILE.exists():
        try:
            saved = json.loads(ORDER_FILE.read_text())
            ordered = [f for f in saved if f in all_files]
        except Exception:
            pass

    # Append any files not in the saved order
    ordered += sorted(f for f in all_files if f not in ordered)
    return [str(ADS_DIR / f) for f in ordered]


def play(path):
    """Play a single video fullscreen. Blocks until video ends."""
    proc = subprocess.run(MPV_ARGS + [path])
    return proc.returncode


def main():
    print("[AdKiosk] Kiosk player started")
    ADS_DIR.mkdir(parents=True, exist_ok=True)

    idx = 0
    while True:
        playlist = get_playlist()

        if not playlist:
            print("[AdKiosk] No ads found — waiting 10s")
            # Show a blank black screen while waiting
            subprocess.run([
                "mpv", "--fullscreen", "--really-quiet",
                "--length=10",
                "av://lavfi:color=c=black:s=1920x1080:r=1"
            ], stderr=subprocess.DEVNULL)
            idx = 0
            continue

        # Wrap index if playlist changed length
        idx = idx % len(playlist)
        path = playlist[idx]

        if not os.path.exists(path):
            idx = (idx + 1) % max(len(playlist), 1)
            continue

        print(f"[AdKiosk] Playing ({idx+1}/{len(playlist)}): {Path(path).name}")
        play(path)

        idx = (idx + 1) % len(playlist)


if __name__ == "__main__":
    main()
