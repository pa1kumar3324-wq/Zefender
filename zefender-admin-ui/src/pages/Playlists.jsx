import { useState, useEffect, useRef } from "react"
import { api } from "../api"
import { filterDevicesByRole, isSuperAdmin } from "../utils/auth"

export default function Playlists() {
  const [ads, setAds] = useState([])
  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState("")
  const [playlist, setPlaylist] = useState(null)
  const [selectedAds, setSelectedAds] = useState([])
  const [priorityAds, setPriorityAds] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  // custom dropdown
  const [dropOpen, setDropOpen] = useState(false)
  const [showNewDevice, setShowNewDevice] = useState(false)
  const [newId, setNewId] = useState("")
  const [newName, setNewName] = useState("")
  const dropRef = useRef(null)

  const client = api()

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const init = async () => {
      try {
        const [adsRes, devicesRes] = await Promise.all([
          client.getAds(),
          client.getDevices(),
        ])
        setAds(adsRes.data.filter(a => a.active))
        const allDevices = devicesRes.data
        const visible = filterDevicesByRole(allDevices)
        setDevices(visible)
        if (visible.length > 0) setDeviceId(visible[0].id)
      } catch {
        showToast("Failed to load data", "err")
      }
    }
    init()
  }, [])

  // Auto-fetch playlist when device changes
  useEffect(() => {
    if (deviceId) loadPlaylist()
  }, [deviceId])

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleAddDevice = async () => {
    if (!newId.trim() || !newName.trim()) return showToast("ID and name required", "err")
    try {
      await client.registerDevice({ id: newId.trim(), name: newName.trim() })
      const res = await client.getDevices()
      setDevices(res.data)
      setDeviceId(newId.trim())
      setNewId(""); setNewName("")
      setShowNewDevice(false); setDropOpen(false)
      showToast(`Device "${newName.trim()}" added`)
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add device", "err")
    }
  }

  const selectedDeviceName = devices.find(d => d.id === deviceId)?.name || deviceId

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
          position: relative;
        }

        /* Custom dropdown */
        .dev-dropdown { position: relative; flex: 1; }

        .dev-trigger {
          width: 100%;
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          transition: border-color 0.2s;
          text-align: left;
        }
        .dev-trigger:hover, .dev-trigger.open { border-color: var(--accent); }

        .dev-menu {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          animation: fadeUp 0.15s ease;
        }

        .dev-option {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 12px;
          font-family: 'Space Mono', monospace;
          transition: background 0.1s;
          border-bottom: 1px solid rgba(99,102,241,0.05);
        }
        .dev-option:hover { background: rgba(99,102,241,0.08); }
        .dev-option.active { color: var(--accent); background: rgba(99,102,241,0.06); }
        .dev-option-sub { font-size: 9px; color: var(--text-muted); margin-top: 2px; }

        .dev-add-option {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          color: var(--accent);
          display: flex; align-items: center; gap: 8px;
          transition: background 0.1s;
          border-top: 1px solid var(--border);
        }
        .dev-add-option:hover { background: rgba(99,102,241,0.08); }

        .new-device-form {
          padding: 12px 14px;
          display: flex; flex-direction: column; gap: 8px;
          border-top: 1px solid var(--border);
          background: rgba(99,102,241,0.03);
        }

        .nd-input {
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 7px;
          padding: 8px 12px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 11px; outline: none;
          transition: border-color 0.15s;
          width: 100%;
        }
        .nd-input:focus { border-color: var(--accent); }
        .nd-input::placeholder { color: var(--text-muted); }

        .nd-row { display: flex; gap: 6px; }

        .nd-confirm {
          flex: 1;
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          border: none; border-radius: 7px;
          padding: 8px; color: white;
          font-family: 'Space Mono', monospace;
          font-size: 10px; font-weight: 700;
          cursor: pointer; transition: opacity 0.15s;
        }
        .nd-confirm:hover { opacity: 0.85; }

        .nd-cancel {
          background: none;
          border: 1px solid var(--border);
          border-radius: 7px;
          padding: 8px 12px; color: var(--text-muted);
          font-family: 'Space Mono', monospace;
          font-size: 10px; cursor: pointer;
          transition: all 0.15s;
        }
        .nd-cancel:hover { border-color: #f87171; color: #f87171; }

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
          <div className="dev-dropdown" ref={dropRef}>
            <button
              className={`dev-trigger ${dropOpen ? "open" : ""}`}
              onClick={() => { setDropOpen(o => !o); setShowNewDevice(false) }}
            >
              <span>{deviceId ? selectedDeviceName : "Select a device..."}</span>
              <span style={{ fontSize: 10, opacity: 0.5 }}>{dropOpen ? "▲" : "▼"}</span>
            </button>

            {dropOpen && (
              <div className="dev-menu">
                {devices.map(d => (
                  <div
                    key={d.id}
                    className={`dev-option ${d.id === deviceId ? "active" : ""}`}
                    onClick={() => { setDeviceId(d.id); setDropOpen(false); setShowNewDevice(false) }}
                  >
                    <div>{d.name}</div>
                    <div className="dev-option-sub">{d.id}</div>
                  </div>
                ))}

                {!showNewDevice ? (
                  isSuperAdmin() && (
                    <div className="dev-add-option" onClick={() => setShowNewDevice(true)}>
                      ＋ Add New Device
                    </div>
                  )
                ) : (
                  <div className="new-device-form">
                    <input
                      className="nd-input"
                      placeholder="Device ID  (e.g. vm-delhi-001)"
                      value={newId}
                      onChange={e => setNewId(e.target.value)}
                      autoFocus
                    />
                    <input
                      className="nd-input"
                      placeholder="Display name  (e.g. Delhi Mall #1)"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                    />
                    <div className="nd-row">
                      <button className="nd-confirm" onClick={handleAddDevice}>CREATE</button>
                      <button className="nd-cancel" onClick={() => { setShowNewDevice(false); setNewId(""); setNewName("") }}>CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
