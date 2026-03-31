import { useState, useEffect, useRef } from "react"
import { api } from "../api"

export default function Monitor() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [priorityAds, setPriorityAds] = useState([])
  const [playlist, setPlaylist] = useState(null)       // full playlist from backend
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [showPaymentFlash, setShowPaymentFlash] = useState(false)
  const [toast, setToast] = useState(null)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [newDevice, setNewDevice] = useState({ id: "", name: "" })

  // Player state
  const [mode, setMode] = useState("playlist")   // "playlist" | "priority"
  const [queue, setQueue] = useState([])          // current playing list
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playerKey, setPlayerKey] = useState(0)  // force remount when same url plays again

  const timerRef = useRef(null)
  const client = api()

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── On mount: load ads + devices ──────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const devicesRes = await client.getDevices()
        const devList = devicesRes.data
        setDevices(devList)
        if (devList.length > 0) setSelectedDevice(devList[0].id)
      } catch {
        showToast("Could not reach backend", "err")
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // ── When device changes: auto-load playlist + priority ads ────
  useEffect(() => {
    if (!selectedDevice) return
    setPriorityAds([])
    setPlaylist(null)
    setQueue([])
    setCurrentIndex(0)
    setMode("playlist")
    autoLoad(selectedDevice)
  }, [selectedDevice])

  const autoLoad = async (deviceId) => {
    try {
      const [playlistRes, priorityRes] = await Promise.allSettled([
        client.getPlaylist(deviceId),
        client.triggerEvent(deviceId),
      ])

      if (playlistRes.status === "fulfilled" && playlistRes.value.data?.ads?.length > 0) {
        const pl = playlistRes.value.data
        setPlaylist(pl)
        const activeAds = pl.ads.filter(a => a.active)
        setQueue(activeAds)
        setCurrentIndex(0)
        setMode("playlist")
      }

      if (priorityRes.status === "fulfilled") {
        setPriorityAds(priorityRes.value.data.priority_ads || [])
      }
    } catch {}
  }

  // ── Auto-advance images (videos self-advance via onEnded) ─────
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (queue.length === 0) return
    const ad = queue[currentIndex]
    const isVid = /\.(mp4|webm|mov|ogg)$/i.test(ad?.file_url || "")
    if (!isVid) {
      timerRef.current = setTimeout(() => advancePlayer(), 6000)
    }
    return () => clearTimeout(timerRef.current)
  }, [currentIndex, queue])

  const advancePlayer = () => {
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next >= queue.length) {
        if (mode === "priority" && playlist) {
          // priority finished → back to playlist, force remount so same-url ads replay
          setMode("playlist")
          setQueue(playlist.ads.filter(a => a.active))
          setPlayerKey(k => k + 1)
          return 0
        }
        // playlist looped back — also force remount in case first === last
        setPlayerKey(k => k + 1)
        return 0
      }
      return next
    })
  }

  // ── Simulate payment ──────────────────────────────────────────
  const handleSimulatePayment = async () => {
    if (!selectedDevice) return showToast("Select a device first", "err")
    if (simulating) return
    setSimulating(true)

    try {
      const res = await client.triggerEvent(selectedDevice)
      const pAds = res.data.priority_ads || []
      setPriorityAds(pAds)

      if (pAds.length === 0) {
        showToast("No priority ads configured for this device", "err")
        setSimulating(false)
        return
      }

      // Show payment flash for 1.5s then switch player to priority queue
      setShowPaymentFlash(true)
      setTimeout(() => {
        setShowPaymentFlash(false)
        setMode("priority")
        setQueue(pAds)
        setCurrentIndex(0)
        setPlayerKey(k => k + 1)
        setSimulating(false)
      }, 1500)

    } catch (err) {
      showToast(err.response?.data?.message || "No priority ads configured", "err")
      setSimulating(false)
    }
  }

  const handleAddDevice = async () => {
    if (!newDevice.id.trim() || !newDevice.name.trim()) return showToast("ID and name are required", "err")
    try {
      await client.registerDevice({ id: newDevice.id.trim(), name: newDevice.name.trim() })
      showToast(`Device "${newDevice.name}" added`)
      setNewDevice({ id: "", name: "" })
      setShowAddDevice(false)
      const res = await client.getDevices()
      setDevices(res.data)
      setSelectedDevice(newDevice.id.trim())
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add device", "err")
    }
  }

  const currentAd = queue[currentIndex]
  const isVideo = /\.(mp4|webm|mov|ogg)$/i.test(currentAd?.file_url || "")
  const adUrl = currentAd
    ? (currentAd.file_url.startsWith("http") ? currentAd.file_url : `http://localhost:5000${currentAd.file_url}`)
    : ""
  const selectedDeviceObj = devices.find(d => d.id === selectedDevice)

  return (
    <div className="mon-root">
      <style>{`
        .mon-root { display: flex; flex-direction: column; gap: 24px; max-width: 1300px; position: relative; }
        .top-row { display: grid; grid-template-columns: 260px 1fr 340px; gap: 16px; }

        .card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 12px; padding: 20px; animation: fadeUp 0.3s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-title {
          font-size: 9px; letter-spacing: 0.22em; color: var(--accent);
          font-family: 'Space Mono', monospace; margin-bottom: 16px;
          text-transform: uppercase;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* Devices */
        .device-list { display: flex; flex-direction: column; gap: 8px; }
        .device-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border);
          cursor: pointer; transition: all 0.15s; font-size: 11px;
        }
        .device-item:hover { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.05); }
        .device-item.active { border-color: var(--accent); background: rgba(99,102,241,0.1); }
        .device-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981; box-shadow: 0 0 6px #10b981; flex-shrink: 0;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .device-name { color: var(--text); font-weight: 700; font-family: 'Syne', sans-serif; font-size: 12px; }
        .device-id   { color: var(--text-muted); font-size: 9px; font-family: 'Space Mono', monospace; margin-top: 1px; }
        .empty-msg   { color: var(--text-muted); font-size: 11px; text-align: center; padding: 24px 0; }

        .add-device-form { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
        .add-device-input { background: var(--field); border: 1px solid var(--border); border-radius: 7px; padding: 8px 12px; color: var(--text); font-family: 'Space Mono', monospace; font-size: 11px; outline: none; width: 100%; transition: border-color 0.15s; }
        .add-device-input:focus { border-color: var(--accent); }
        .add-device-input::placeholder { color: var(--text-muted); }
        .add-device-row { display: flex; gap: 6px; }
        .btn-confirm { flex: 1; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 7px; padding: 8px; color: white; font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; cursor: pointer; }
        .btn-cancel  { background: none; border: 1px solid var(--border); border-radius: 7px; padding: 8px 12px; color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 10px; cursor: pointer; }
        .btn-cancel:hover { border-color: #f87171; color: #f87171; }
        .btn-add-device { width: 100%; margin-top: 10px; background: none; border: 1px dashed rgba(99,102,241,0.3); border-radius: 7px; padding: 8px; color: var(--accent); font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.15s; }
        .btn-add-device:hover { background: rgba(99,102,241,0.06); border-color: var(--accent); }

        /* Ad table */
        .ad-table { width: 100%; border-collapse: collapse; }
        .ad-table th { text-align: left; padding: 10px 12px; font-size: 9px; color: var(--text-muted); border-bottom: 1px solid var(--border); letter-spacing: 0.1em; }
        .ad-table td { padding: 10px 12px; font-size: 11px; border-bottom: 1px solid rgba(99,102,241,0.04); }
        .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 9px; font-weight: 700; }
        .status-active   { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-inactive { background: rgba(239,68,68,0.1);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

        /* Priority panel */
        .priority-list { display: flex; flex-direction: column; gap: 8px; }
        .priority-item { display: flex; align-items: center; gap: 12px; background: rgba(245,158,11,0.04); border: 1px solid rgba(245,158,11,0.12); border-radius: 8px; padding: 10px 12px; }
        .priority-num { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; box-shadow: 0 0 8px rgba(245,158,11,0.3); }
        .priority-title { font-size: 12px; color: var(--text); font-family: 'Syne', sans-serif; font-weight: 700; }
        .priority-url   { font-size: 9px; color: var(--text-muted); font-family: 'Space Mono', monospace; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .sim-btn {
          width: 100%; background: linear-gradient(135deg, #10b981, #059669);
          border: none; border-radius: 8px; padding: 12px; color: white;
          font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(16,185,129,0.25); margin-top: 8px;
        }
        .sim-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
        .sim-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Player */
        .player-wrap {
          background: #000; border-radius: 10px; aspect-ratio: 16/9;
          overflow: hidden; position: relative;
          border: 1px solid var(--border); box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .player-wrap.priority-mode { border-color: rgba(245,158,11,0.5); box-shadow: 0 0 30px rgba(245,158,11,0.15); }

        .player-media { width: 100%; height: 100%; object-fit: contain; }

        .player-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          padding: 16px 20px;
          display: flex; justify-content: space-between; align-items: flex-end;
          pointer-events: none;
        }
        .now-label { font-size: 9px; color: #a5b4fc; font-family: 'Space Mono', monospace; margin-bottom: 3px; }
        .now-title { font-size: 14px; font-weight: 800; color: #fff; font-family: 'Syne', sans-serif; }

        .mode-badge {
          position: absolute; top: 12px; right: 12px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.15em;
          font-family: 'Space Mono', monospace;
        }
        .mode-badge.playlist { background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); color: #a5b4fc; }
        .mode-badge.priority { background: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.5); color: #fbbf24; animation: pulse-badge 1s infinite; }
        @keyframes pulse-badge { 0%,100%{opacity:1} 50%{opacity:0.6} }

        .playlist-strip { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
        .strip-item {
          padding: 4px 10px; border-radius: 20px; font-size: 9px;
          font-family: 'Space Mono', monospace; border: 1px solid var(--border);
          color: var(--text-muted); cursor: pointer; transition: all 0.15s;
        }
        .strip-item.current { border-color: var(--accent); color: var(--accent); background: rgba(99,102,241,0.1); }
        .strip-item.priority-current { border-color: #f59e0b; color: #fbbf24; background: rgba(245,158,11,0.1); }

        .preview-empty {
          padding: 60px 0; text-align: center;
          color: var(--text-muted); font-size: 12px; line-height: 2;
          border: 1px dashed var(--border); border-radius: 10px;
        }

        /* Payment flash */
        .pay-flash {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.92);
          z-index: 10;
          animation: flashIn 0.3s ease;
        }
        @keyframes flashIn { from { opacity: 0; } to { opacity: 1; } }
        .pay-flash-icon { font-size: 56px; margin-bottom: 12px; animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .pay-flash-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #10b981; letter-spacing: 0.05em; }
        .pay-flash-sub   { font-size: 11px; color: #6b7280; margin-top: 6px; font-family: 'Space Mono', monospace; }

        /* Toast */
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 10px; font-family: 'Space Mono', monospace; font-size: 11px; animation: toastIn 0.25s ease; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .toast.ok  { background: #0d1f14; border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
        .toast.err { background: #1f0d0d; border: 1px solid rgba(239,68,68,0.3);  color: #f87171; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* ── Top row ── */}
      <div className="top-row">

        {/* 1. Devices */}
        <div className="card">
          <div className="card-title">DEVICES</div>
          {loading ? (
            <div className="empty-msg">Loading...</div>
          ) : devices.length === 0 ? (
            <div className="empty-msg">No devices registered</div>
          ) : (
            <div className="device-list">
              {devices.map(d => (
                <div
                  key={d.id}
                  className={`device-item ${selectedDevice === d.id ? "active" : ""}`}
                  onClick={() => setSelectedDevice(d.id)}
                >
                  <div className="device-dot" />
                  <div style={{ minWidth: 0 }}>
                    <div className="device-name">{d.name}</div>
                    <div className="device-id">{d.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddDevice ? (
            <div className="add-device-form">
              <input className="add-device-input" placeholder="Device ID (e.g. vm-delhi-001)" value={newDevice.id} onChange={e => setNewDevice(p => ({ ...p, id: e.target.value }))} />
              <input className="add-device-input" placeholder="Display name (e.g. Delhi Mall #1)" value={newDevice.name} onChange={e => setNewDevice(p => ({ ...p, name: e.target.value }))} />
              <div className="add-device-row">
                <button className="btn-confirm" onClick={handleAddDevice}>+ ADD</button>
                <button className="btn-cancel" onClick={() => { setShowAddDevice(false); setNewDevice({ id: "", name: "" }) }}>CANCEL</button>
              </div>
            </div>
          ) : (
            <button className="btn-add-device" onClick={() => setShowAddDevice(true)}>+ NEW DEVICE</button>
          )}
        </div>

        {/* 2. Ad status board */}
        <div className="card">
          <div className="card-title">
            AD STATUS BOARD
            {selectedDeviceObj && <span style={{ color: "var(--text-muted)", fontSize: 9 }}>{selectedDeviceObj.name}</span>}
          </div>
          {loading ? <div className="empty-msg">Loading ads...</div> : (
            <table className="ad-table">
              <thead><tr><th>TITLE</th><th>TYPE</th><th>STATUS</th></tr></thead>
              <tbody>
                {playlist?.ads?.length > 0 ? playlist.ads.map(ad => (
                  <tr key={ad.id}>
                    <td>{ad.title}</td>
                    <td style={{ opacity: 0.5 }}>{ad.file_url.split(".").pop().toUpperCase()}</td>
                    <td><span className={`status-pill ${ad.active ? "status-active" : "status-inactive"}`}>{ad.active ? "● ACTIVE" : "○ INACTIVE"}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="empty-msg">No playlist for this device</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 3. Priority ads + simulate */}
        <div className="card">
          <div className="card-title">
            PRIORITY ADS
            {selectedDeviceObj && <span style={{ color: "var(--text-muted)", fontSize: 9 }}>{selectedDeviceObj.name}</span>}
          </div>

          {priorityAds.length === 0 ? (
            <div className="empty-msg" style={{ padding: "20px 0" }}>
              No priority ads set<br />
              <span style={{ fontSize: 9 }}>Configure in Playlists tab</span>
            </div>
          ) : (
            <div className="priority-list">
              {priorityAds.map(ad => (
                <div key={ad.id} className="priority-item">
                  <div className="priority-num">{ad.priority}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="priority-title">{ad.title}</div>
                    <div className="priority-url">{ad.file_url}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="sim-btn" disabled={simulating || !selectedDevice} onClick={handleSimulatePayment}>
            {simulating ? "SIMULATING..." : "⚡ SIMULATE PAYMENT"}
          </button>
        </div>
      </div>

      {/* ── Live player ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>
          LIVE DEVICE PREVIEW
          {selectedDeviceObj && <span style={{ color: "var(--text-muted)", fontSize: 9 }}>{selectedDeviceObj.name}</span>}
        </div>

        {queue.length > 0 ? (
          <>
            <div className={`player-wrap ${mode === "priority" ? "priority-mode" : ""}`}>
              {isVideo ? (
                <video
                  className="player-media"
                  src={adUrl}
                  autoPlay muted
                  onEnded={advancePlayer}
                  key={`${playerKey}-${adUrl}`}
                />
              ) : (
                <img className="player-media" src={adUrl} alt={currentAd?.title} key={`${playerKey}-${adUrl}`} />
              )}

              {/* mode badge */}
              <div className={`mode-badge ${mode}`}>
                {mode === "priority" ? "⚡ PRIORITY MODE" : "▶ PLAYLIST"}
              </div>

              {/* payment flash overlay — inside the player */}
              {showPaymentFlash && (
                <div className="pay-flash">
                  <div className="pay-flash-icon">✓</div>
                  <div className="pay-flash-title">PAYMENT SUCCESS</div>
                  <div className="pay-flash-sub">Loading priority ads...</div>
                </div>
              )}

              <div className="player-overlay">
                <div>
                  <div className="now-label">
                    {mode === "priority" ? `⚡ PRIORITY ${currentIndex + 1} OF ${queue.length}` : `NOW SHOWING ${currentIndex + 1} OF ${queue.length}`}
                  </div>
                  <div className="now-title">{currentAd?.title}</div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "Space Mono" }}>
                  {selectedDeviceObj?.name?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* strip */}
            <div className="playlist-strip">
              {queue.map((ad, i) => (
                <div
                  key={`${ad.id}-${i}`}
                  className={`strip-item ${i === currentIndex ? (mode === "priority" ? "priority-current" : "current") : ""}`}
                  onClick={() => setCurrentIndex(i)}
                >
                  {ad.title}
                  {ad.priority > 0 && mode === "priority" && <span style={{ color: "#f59e0b", marginLeft: 4 }}>★</span>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="preview-empty">
            {loading ? "Loading..." : "Select a device to start the live preview"}
          </div>
        )}
      </div>
    </div>
  )
}
