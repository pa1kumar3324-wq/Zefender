import json
import socket
import threading
import requests
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, send_file

ADS_DIR     = Path("/home/pi/ads")
ORDER_FILE  = ADS_DIR / "order.json"
PORT        = 8080
ALLOWED_EXT = {".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"}

# ---- EDIT THESE PER DEVICE --------------------------------------------------
ADMIN_SERVER = "http://127.0.0.1:5000"   # IP of the machine running backend server.js
DEVICE_ID    = socket.gethostname()           # unique ID (hostname works fine)
DEVICE_NAME  = "Display " + DEVICE_ID        # friendly label shown in admin panel
# -----------------------------------------------------------------------------

app = Flask(__name__, static_folder=None)
ADS_DIR.mkdir(parents=True, exist_ok=True)


def get_ordered_files():
    all_files = sorted(
        f.name for f in ADS_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in ALLOWED_EXT
    )
    if ORDER_FILE.exists():
        try:
            saved = json.loads(ORDER_FILE.read_text())
            ordered = [f for f in saved if f in all_files]
            ordered += [f for f in all_files if f not in ordered]
            return ordered
        except Exception:
            pass
    return all_files


def save_order(order):
    ORDER_FILE.write_text(json.dumps(order))


def register_with_admin():
    try:
        requests.post(
            f"{ADMIN_SERVER}/api/devices/register",
            json={"id": DEVICE_ID, "name": DEVICE_NAME, "port": PORT},
            timeout=5
        )
        print(f"[AdKiosk] Registered with admin: {ADMIN_SERVER}")
    except Exception as e:
        print(f"[AdKiosk] Admin unreachable ({e}) — running standalone")


@app.route("/")
def kiosk():
    return send_file("kiosk.html")


@app.route("/api/ads")
def api_ads():
    return jsonify({"files": get_ordered_files()})


@app.route("/ads/<filename>")
def serve_ad(filename):
    return send_from_directory(ADS_DIR, filename)


@app.route("/api/upload", methods=["POST"])
def api_upload():
    if "video" not in request.files:
        return jsonify({"error": "No file"}), 400
    f = request.files["video"]
    ext = Path(f.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        return jsonify({"error": "Invalid file type"}), 400
    safe_name = "".join(
        c for c in Path(f.filename).name if c.isalnum() or c in "._- "
    ).strip() or ("ad" + ext)
    dest = ADS_DIR / safe_name
    f.save(dest)
    order = get_ordered_files()
    if safe_name not in order:
        order.append(safe_name)
    save_order(order)
    return jsonify({"ok": True, "filename": safe_name})


@app.route("/api/delete", methods=["POST"])
def api_delete():
    data = request.get_json()
    path = ADS_DIR / Path(data.get("filename", "")).name
    if path.exists() and path.suffix.lower() in ALLOWED_EXT:
        path.unlink()
        order = [f for f in get_ordered_files() if f != path.name]
        save_order(order)
        return jsonify({"ok": True})
    return jsonify({"error": "File not found"}), 404


@app.route("/api/reorder", methods=["POST"])
def api_reorder():
    data = request.get_json()
    order = data.get("order", [])
    existing = set(get_ordered_files())
    save_order([f for f in order if f in existing])
    return jsonify({"ok": True})


if __name__ == "__main__":
    threading.Thread(target=register_with_admin, daemon=True).start()
    print(f"[AdKiosk] Pi server on http://0.0.0.0:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
