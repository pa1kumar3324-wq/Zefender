import axios from "axios"

const BASE = "/api"

// Auth removed temporarily — pending founder discussion
export const api = (_token) => {
  return {
    // ── Ads ──────────────────────────────────────────────
    getAds: () =>
      axios.get(`${BASE}/ads`),

    uploadAd: (formData) =>
      axios.post(`${BASE}/ads`, formData),

    deleteAd: (id) =>
      axios.delete(`${BASE}/ads/${id}`),

    toggleAd: (id) =>
      axios.patch(`${BASE}/ads/${id}/toggle`, {}),

    // ── Playlists ─────────────────────────────────────────
    createPlaylist: (data) =>
      axios.post(`${BASE}/playlists`, data),

    getPlaylist: (deviceId) =>
      axios.get(`${BASE}/playlists/preview/${deviceId}`),

    setPriority: (data) =>
      axios.put(`${BASE}/playlists/priority`, data),

    clearPriority: (data) =>
      axios.delete(`${BASE}/playlists/priority`, { data }),

    // ── Devices ───────────────────────────────────────────
    getDevices: () =>
      axios.get(`${BASE}/devices`),

    registerDevice: (data) =>
      axios.post(`${BASE}/devices/register`, data),

    // ── Events ────────────────────────────────────────────
    triggerEvent: (deviceId) =>
      axios.post(`${BASE}/events/admin`, { device_id: deviceId }),
  }
}
