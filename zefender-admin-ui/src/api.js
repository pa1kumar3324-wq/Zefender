import axios from "axios"

const BASE = "/api"

export const api = (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return {
    // Ads
    getAds: () => axios.get(`${BASE}/ads`, { headers }),
    uploadAd: (formData) => axios.post(`${BASE}/ads`, formData, {
      headers: { ...headers }
    }),
    deleteAd: (id) => axios.delete(`${BASE}/ads/${id}`, { headers }),
    toggleAd: (id) => axios.patch(`${BASE}/ads/${id}/toggle`, {}, { headers }),

    // Playlists
    createPlaylist: (data) => axios.post(`${BASE}/playlists`, data, { headers }),
    getPlaylist: (deviceId) => axios.get(`${BASE}/playlists/${deviceId}`, {
  headers: { "x-device-token": "zefender_device_secret_123" }
}),
    setPriority: (data) => axios.put(`${BASE}/playlists/priority`, data, { headers }),
    clearPriority: (data) => axios.delete(`${BASE}/playlists/priority`, { headers, data }),

    // Events
    triggerEvent: (deviceId) => axios.post(`${BASE}/events`, { device_id: deviceId }, {
      headers: { "x-device-token": import.meta.env.VITE_DEVICE_SECRET || "zefender_device_secret_123" }
    }),
  }
}
