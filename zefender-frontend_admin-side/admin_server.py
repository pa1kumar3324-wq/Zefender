#!/usr/bin/env python3
"""
AdKiosk Central Admin Server
Run this on a always-on machine (NAS, server, or one of the Pis).
All Pi devices register themselves here on boot.

Endpoints:
  GET  /                          -> Admin dashboard
  GET  /api/devices               -> List all registered devices
  POST /api/devices/register      -> Pi calls this on boot
  GET  /api/devices/<id>/ads      -> Proxy: get ad list from Pi
  POST /api/devices/<id>/upload   -> Proxy: upload video to Pi
  POST /api/devices/<id>/delete   -> Proxy: delete video on Pi
  POST /api/devices/<id>/reorder  -> Proxy: reorder playlist on Pi
  POST /api/devices/<id>/ping     -> Check if Pi is online
  POST /api/devices/<id>/rename   -> Rename a device
  POST /api/devices/<id>/remove   -> Remove device from registry
"""

import json
import time
import requests
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

REGISTRY_FILE = Path("devices.json")
app = Flask(__name__, static_folder=None)
CORS(app)


def load_devices():
    if REGISTRY_FILE.exists():
        try:
            return json.loads(REGISTRY_FILE.read_text())
        except Exception:
            pass
    return {}


def save_devices(devices):
    REGISTRY_FILE.write_text(json.dumps(devices, indent=2))


def pi_url(device):
    return f"http://{device['ip']}:{device.get('port', 8080)}"


@app.route("/")
def dashboard():
    return send_file("admin_dashboard.html")


@app.route("/api/devices")
def get_devices():
    devices = load_devices()
    result = []
    for did, d in devices.items():
        result.append({
            "id": did,
            "name": d.get("name", did),
            "ip": d.get("ip"),
            "port": d.get("port", 8080),
            "last_seen": d.get("last_seen"),
        })
    return jsonify(result)


@app.route("/api/devices/register", methods=["POST"])
def register_device():
    data = request.get_json()
    device_id = data.get("id")
    if not device_id:
        return jsonify({"error": "Missing id"}), 400
    devices = load_devices()
    existing = devices.get(device_id, {})
    devices[device_id] = {
        **existing,
        "id": device_id,
        "name": data.get("name", existing.get("name", device_id)),
        "ip": request.remote_addr,
        "port": data.get("port", 8080),
        "last_seen": int(time.time()),
    }
    save_devices(devices)
    return jsonify({"ok": True})


@app.route("/api/devices/<device_id>/ping", methods=["POST"])
def ping_device(device_id):
    devices = load_devices()
    d = devices.get(device_id)
    if not d:
        return jsonify({"online": False}), 404
    try:
        r = requests.get(f"{pi_url(d)}/api/ads", timeout=3)
        return jsonify({"online": r.status_code == 200})
    except Exception:
        return jsonify({"online": False})


@app.route("/api/devices/<device_id>/ads")
def proxy_ads(device_id):
    devices = load_devices()
    d = devices.get(device_id)
    if not d:
        return jsonify({"error": "Device not found"}), 404
    try:
        r = requests.get(f"{pi_url(d)}/api/ads", timeout=5)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e), "files": []}), 502


@app.route("/api/devices/<device_id>/upload", methods=["POST"])
def proxy_upload(device_id):
    devices = load_devices()
    d = devices.get(device_id)
    if not d:
        return jsonify({"error": "Device not found"}), 404
    if "video" not in request.files:
        return jsonify({"error": "No file"}), 400
    f = request.files["video"]
    try:
        r = requests.post(
            f"{pi_url(d)}/api/upload",
            files={"video": (f.filename, f.stream, f.content_type)},
            timeout=120
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/devices/<device_id>/delete", methods=["POST"])
def proxy_delete(device_id):
    devices = load_devices()
    d = devices.get(device_id)
    if not d:
        return jsonify({"error": "Device not found"}), 404
    try:
        r = requests.post(f"{pi_url(d)}/api/delete", json=request.get_json(), timeout=10)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/devices/<device_id>/reorder", methods=["POST"])
def proxy_reorder(device_id):
    devices = load_devices()
    d = devices.get(device_id)
    if not d:
        return jsonify({"error": "Device not found"}), 404
    try:
        r = requests.post(f"{pi_url(d)}/api/reorder", json=request.get_json(), timeout=10)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/devices/<device_id>/rename", methods=["POST"])
def rename_device(device_id):
    devices = load_devices()
    if device_id not in devices:
        return jsonify({"error": "Device not found"}), 404
    data = request.get_json()
    devices[device_id]["name"] = data.get("name", device_id)
    save_devices(devices)
    return jsonify({"ok": True})


@app.route("/api/devices/<device_id>/remove", methods=["POST"])
def remove_device(device_id):
    devices = load_devices()
    devices.pop(device_id, None)
    save_devices(devices)
    return jsonify({"ok": True})


if __name__ == "__main__":
    print("AdKiosk Admin Server → http://0.0.0.0:9090")
    app.run(host="0.0.0.0", port=9090, debug=False)
