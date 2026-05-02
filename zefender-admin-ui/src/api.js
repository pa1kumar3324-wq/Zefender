import axios from "axios"

const BASE = "/api"
const DEVICE_SECRET = import.meta.env.VITE_DEVICE_SECRET || "zefender_device_secret_123"

// Always reads the latest token from localStorage — no stale closures
const authHeader = () => {
  const token = localStorage.getItem("zef_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = () => {
  return {
    // ── Auth ─────────────────────────────────────────────
    login: (data) =>
      axios.post(`${BASE}/auth/login`, data),

    registerAdmin: (data) =>
      axios.post(`${BASE}/auth/register`, data, { headers: authHeader() }),

    getAdmins: () =>
      axios.get(`${BASE}/auth/admins`, { headers: authHeader() }),

    deleteAdmin: (id) =>
      axios.delete(`${BASE}/auth/admins/${id}`, { headers: authHeader() }),

    assignDevices: (adminId, deviceIds) =>
      axios.put(`${BASE}/auth/admins/${adminId}/devices`, { device_ids: deviceIds }, { headers: authHeader() }),

    getMyDevices: () =>
      axios.get(`${BASE}/auth/me/devices`, { headers: authHeader() }),

    // ── Ads ──────────────────────────────────────────────
    getAds: () =>
      axios.get(`${BASE}/ads`, { headers: authHeader() }),

    uploadAd: (formData) =>
      axios.post(`${BASE}/ads`, formData, { headers: authHeader() }),

    deleteAd: (id) =>
      axios.delete(`${BASE}/ads/${id}`, { headers: authHeader() }),

    toggleAd: (id) =>
      axios.patch(`${BASE}/ads/${id}/toggle`, {}, { headers: authHeader() }),

    // ── Playlists ─────────────────────────────────────────
    createPlaylist: (data) =>
      axios.post(`${BASE}/playlists`, data, { headers: authHeader() }),

    getPlaylist: (deviceId) =>
      axios.get(`${BASE}/playlists/preview/${deviceId}`, { headers: authHeader() }),

    setPriority: (data) =>
      axios.put(`${BASE}/playlists/priority`, data, { headers: authHeader() }),

    clearPriority: (data) =>
      axios.delete(`${BASE}/playlists/priority`, { headers: authHeader(), data }),

    // ── Devices ───────────────────────────────────────────
    getDevices: () =>
      axios.get(`${BASE}/devices`, { headers: authHeader() }),

    registerDevice: (data) =>
      axios.post(`${BASE}/devices/register`, data, { headers: authHeader() }),

    // ── Events ────────────────────────────────────────────
    triggerEvent: (deviceId) =>
      axios.post(`${BASE}/events/admin`, { device_id: deviceId }, { headers: authHeader() }),
  }
}
