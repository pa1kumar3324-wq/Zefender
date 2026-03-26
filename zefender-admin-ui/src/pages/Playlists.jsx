import { useState, useEffect } from "react"
import { api } from "../api"

export default function Playlists({ token }) {
  const [ads, setAds] = useState([])
  const [deviceId, setDeviceId] = useState("machine-bangalore-001")
  const [playlist, setPlaylist] = useState(null)
  const [selectedAds, setSelectedAds] = useState([])
  const [priorityAds, setPriorityAds] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const client = api(token)

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadAds = async () => {
    try {
      const res = await client.getAds()
      setAds(res.data.filter(a => a.active))
    } catch {}
  }

  const loadPlaylist = async () => {
    if (!deviceId) return
    setLoading(true)
    try {
      const res = await client.getPlaylist(deviceId)
      setPlaylist(res.data)
    } catch {
      setPlaylist(null)
    }
    setLoading(false)
  }

  useEffect(() => { loadAds() }, [])

  const toggleAdSelect = (ad) => {
    setSelectedAds(prev =>
      prev.find(a => a.ad_id === ad.id)
        ? prev.filter(a => a.ad_id !== ad.id)
        : [...prev, { ad_id: ad.id, order_index: prev.length + 1, priority: 0 }]
    )
  }

  const handleCreatePlaylist = async () => {
    if (!deviceId || selectedAds.length === 0) return showToast("Select device and at least one ad", "err")
    try {
      await client.createPlaylist({ device_id: deviceId, ads: selectedAds })
      showToast("Playlist saved!")
      loadPlaylist()
      setSelectedAds([])
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "err")
    }
  }

  const togglePriorityAd = (ad) => {
    setPriorityAds(prev =>
      prev.find(a => a.ad_id === ad.id)
        ? prev.filter(a => a.ad_id !== ad.id)
        : [...prev, { ad_id: ad.id, priority: prev.length + 1 }]
    )
  }

  const handleSetPriority = async () => {
    if (!deviceId || priorityAds.length === 0) return showToast("Select ads for priority", "err")
    try {
      await client.setPriority({ device_id: deviceId, priority_ads: priorityAds })
      showToast("Priority set!")
      loadPlaylist()
      setPriorityAds([])
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "err")
    }
  }

  const handleClearPriority = async () => {
    if (!deviceId) return
    if (!confirm("Clear all priorities for this device?")) return
    try {
      await client.clearPriority({ device_id: deviceId })
      showToast("Priorities cleared!")
      loadPlaylist()
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "err")
    }
  }

  return (
    <div className="pl-root">
      <style>{`
        .pl-root { display: flex; flex-direction: column; gap: 22px; }

        .pl-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 22px;
          animation: fadeUp 0.3s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pl-section-title {
          font-size: 10px; letter-spacing: 0.2em;
          color: var(--accent); font-family: 'Space Mono', monospace;
          margin-bottom: 14px;
        }

        .device-row {
          display: flex; gap: 10px; align-items: center;
          margin-bottom: 16px;
        }

        .field-input {
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          outline: none;
          transition: border-color 0.2s;
          flex: 1;
        }

        .field-input:focus { border-color: var(--accent); }
        .field-input::placeholder { color: var(--text-muted); }

        .btn-fetch {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 8px;
          padding: 10px 16px;
          color: var(--accent);
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .btn-fetch:hover { background: rgba(99,102,241,0.18); border-color: var(--accent); }

        /* Ads checkboxes */
        .ads-check-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 8px;
          margin-bottom: 16px;
        }

        .ad-check-item {
          display: flex; align-items: center; gap: 10px;
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 12px;
        }

        .ad-check-item:hover { border-color: rgba(99,102,241,0.3); }
        .ad-check-item.selected { border-color: var(--accent); background: rgba(99,102,241,0.08); }

        .check-box {
          width: 16px; height: 16px;
          border-radius: 4px;
          border: 1.5px solid rgba(99,102,241,0.3);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 10px;
          transition: all 0.15s;
        }

        .check-box.checked {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        .btn-save {
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          border: none; border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-family: 'Space Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 0 16px rgba(99,102,241,0.25);
        }

        .btn-save:hover { opacity: 0.85; transform: translateY(-1px); }

        .btn-danger {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 10px 16px;
          color: #f87171;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-danger:hover { background: rgba(239,68,68,0.15); }

        .btn-row { display: flex; gap: 10px; flex-wrap: wrap; }

        /* Playlist display */
        .playlist-info {
          background: var(--field);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 10px;
          padding: 16px;
        }

        .playlist-version {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 14px;
        }

        .version-badge {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 20px;
          padding: 3px 12px;
          font-size: 11px; color: #10b981;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.1em;
        }

        .playlist-ads-list {
          display: flex; flex-direction: column; gap: 6px;
        }

        .playlist-ad-row {
          display: flex; align-items: center; gap: 10px;
          background: rgba(99,102,241,0.04);
          border: 1px solid rgba(99,102,241,0.08);
          border-radius: 7px;
          padding: 9px 12px;
          font-size: 11px;
        }

        .order-num {
          width: 22px; height: 22px;
          background: rgba(99,102,241,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: var(--accent);
          flex-shrink: 0;
        }

        .priority-badge {
          margin-left: auto;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 20px;
          padding: 2px 8px;
          font-size: 9px; color: #fbbf24;
          letter-spacing: 0.1em;
        }

        .toast {
          position: fixed; bottom: 24px; right: 24px;
          padding: 12px 20px; border-radius: 10px;
          font-family: 'Space Mono', monospace; font-size: 12px;
          animation: toastIn 0.25s ease; z-index: 9999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .toast.ok { background: #0d1f14; border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
        .toast.err { background: #1f0d0d; border: 1px solid rgba(239,68,68,0.3); color: #f87171; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Device selector */}
      <div className="pl-card">
        <div className="pl-section-title">DEVICE</div>
        <div className="device-row">
          <input
            className="field-input"
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            placeholder="e.g. machine-bangalore-001"
          />
          <button className="btn-fetch" onClick={loadPlaylist}>
            FETCH PLAYLIST
          </button>
        </div>

        {loading && <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Loading...</div>}

        {playlist && (
          <div className="playlist-info">
            <div className="playlist-version">
              <span style={{ fontSize: 11, color: "#6b7280" }}>CURRENT PLAYLIST</span>
              <span className="version-badge">VERSION {playlist.version}</span>
            </div>
            <div className="playlist-ads-list">
              {playlist.ads?.map((ad, i) => (
                <div key={ad.id} className="playlist-ad-row">
                  <div className="order-num">{ad.order_index}</div>
                  <span style={{ flex: 1, color: "#e2e8f0" }}>{ad.title}</span>
                  {ad.priority > 0 && (
                    <span className="priority-badge">PRIORITY {ad.priority}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create playlist */}
      <div className="pl-card">
        <div className="pl-section-title">CREATE / UPDATE PLAYLIST</div>
        <div className="ads-check-grid">
          {ads.map(ad => {
            const sel = selectedAds.find(a => a.ad_id === ad.id)
            return (
              <div
                key={ad.id}
                className={`ad-check-item ${sel ? "selected" : ""}`}
                onClick={() => toggleAdSelect(ad)}
              >
                <div className={`check-box ${sel ? "checked" : ""}`}>
                  {sel ? "✓" : ""}
                </div>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e2e8f0" }}>
                  {ad.title}
                </span>
                {sel && (
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--accent)", flexShrink: 0 }}>
                    #{sel.order_index}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <button className="btn-save" onClick={handleCreatePlaylist}>
          SAVE PLAYLIST →
        </button>
      </div>

      {/* Priority */}
      <div className="pl-card">
        <div className="pl-section-title">SET PRIORITY ADS</div>
        <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 14, lineHeight: 1.7 }}>
          Select ads that should play after a payment transaction. First selected = priority 1.
        </p>
        <div className="ads-check-grid">
          {ads.map(ad => {
            const sel = priorityAds.find(a => a.ad_id === ad.id)
            return (
              <div
                key={ad.id}
                className={`ad-check-item ${sel ? "selected" : ""}`}
                onClick={() => togglePriorityAd(ad)}
              >
                <div className={`check-box ${sel ? "checked" : ""}`}>
                  {sel ? sel.priority : ""}
                </div>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e2e8f0" }}>
                  {ad.title}
                </span>
              </div>
            )
          })}
        </div>
        <div className="btn-row" style={{ marginTop: 14 }}>
          <button className="btn-save" onClick={handleSetPriority}>SET PRIORITY →</button>
          <button className="btn-danger" onClick={handleClearPriority}>CLEAR ALL PRIORITIES</button>
        </div>
      </div>
    </div>
  )
}
