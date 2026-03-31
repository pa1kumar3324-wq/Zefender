import axios from "axios"

const BASE = "/api"
const DEVICE_SECRET = import.meta.env.VITE_DEVICE_SECRET || "zefender_device_secret_123"

export const api = (token) => {
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
  const deviceHeaders = { "x-device-token": DEVICE_SECRET }

  return {
    // ── Ads ──────────────────────────────────────────────
    getAds: () =>
      axios.get(`${BASE}/ads`, { headers: authHeaders }),

    uploadAd: (formData) =>
      axios.post(`${BASE}/ads`, formData, { headers: { ...authHeaders } }),

    deleteAd: (id) =>
      axios.delete(`${BASE}/ads/${id}`, { headers: authHeaders }),

    toggleAd: (id) =>
      axios.patch(`${BASE}/ads/${id}/toggle`, {}, { headers: authHeaders }),

    // ── Playlists ─────────────────────────────────────────
    createPlaylist: (data) =>
      axios.post(`${BASE}/playlists`, data, { headers: authHeaders }),

    // getPlaylist is called by both device (Pi) and admin preview
    // Use device token so Pi can also call it; admin uses the same shared secret
    getPlaylist: (deviceId) =>
      axios.get(`${BASE}/playlists/${deviceId}`, { headers: deviceHeaders }),

    setPriority: (data) =>
      axios.put(`${BASE}/playlists/priority`, data, { headers: authHeaders }),

    clearPriority: (data) =>
      axios.delete(`${BASE}/playlists/priority`, { headers: authHeaders, data }),

    // ── Devices ───────────────────────────────────────────
    getDevices: () =>
      axios.get(`${BASE}/devices`, { headers: authHeaders }),

    // ── Events ────────────────────────────────────────────
    // Admin-triggered payment simulation — uses admin JWT so the device secret
    // never needs to be exposed in the browser
    triggerEvent: (deviceId) =>
      axios.post(`${BASE}/events/admin`, { device_id: deviceId }, { headers: authHeaders }),
  }
}
