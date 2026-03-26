import { useState, useEffect, useRef } from "react"
import { api } from "../api"

export default function LivePreview({ token }) {
  const [deviceId, setDeviceId] = useState("machine-bangalore-001")
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [toast, setToast] = useState(null)
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  const client = api(token)

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadPlaylist = async () => {
    if (!deviceId) return
    setLoading(true)
    try {
      const res = await client.getPlaylist(deviceId)
      if (res.data && res.data.ads && res.data.ads.length > 0) {
        setPlaylist(res.data)
        setCurrentIndex(0)
      } else {
        setPlaylist(null)
        showToast("No active ads for this device", "err")
      }
    } catch (err) {
      setPlaylist(null)
      showToast("Could not find device or playlist", "err")
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!playlist || playlist.ads.length === 0) return

    const currentAd = playlist.ads[currentIndex]
    const isVideo = currentAd.file_url.match(/\.(mp4|webm|mov|ogg)$/i)

    if (isVideo) {
      // Video handling is done via onEnded event
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      // Image handling: advance after 8 seconds
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        handleNext()
      }, 8000)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, playlist])

  const handleNext = () => {
    if (!playlist) return
    setCurrentIndex(prev => (prev + 1) % playlist.ads.length)
  }

  const currentAd = playlist?.ads[currentIndex]
  const isVideo = currentAd?.file_url.match(/\.(mp4|webm|mov|ogg)$/i)
  const adUrl = currentAd ? (currentAd.file_url.startsWith("http") ? currentAd.file_url : `http://localhost:5000${currentAd.file_url}`) : ""

  return (
    <div className="preview-root">
      <style>{`
        .preview-root { display: flex; flex-direction: column; gap: 24px; max-width: 900px; }

        .preview-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          animation: fadeUp 0.3s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .preview-title {
          font-size: 10px; letter-spacing: 0.2em;
          color: var(--accent); font-family: 'Space Mono', monospace;
          margin-bottom: 14px;
        }

        .device-input-row { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; }

        .field-input {
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 12px; outline: none;
          transition: border-color 0.2s;
          flex: 1;
        }

        .field-input:focus { border-color: var(--accent); }

        .watch-btn {
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          border: none; border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-family: 'Space Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 0 16px rgba(99,102,241,0.2);
        }

        .watch-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .watch-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Player */
        .player-container {
          background: #000;
          border-radius: 12px;
          aspect-ratio: 16/9;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .player-media { width: 100%; height: 100%; object-fit: contain; }

        .player-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 20px;
          display: flex; justify-content: space-between; align-items: flex-end;
          pointer-events: none;
        }

        .now-playing-info { color: #fff; font-family: 'Syne', sans-serif; }
        .ad-name { font-size: 14px; font-weight: 800; margin-bottom: 4px; }
        .ad-index { font-size: 10px; font-family: 'Space Mono', monospace; color: #a5b4fc; }

        /* Playlist Rail */
        .playlist-rail {
          margin-top: 20px;
          display: flex; gap: 10px;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .rail-item {
          flex-shrink: 0;
          width: 140px;
          background: var(--card);
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rail-item.active { border-color: var(--accent); background: rgba(99,102,241,0.1); }
        .rail-item:hover { border-color: rgba(99,102,241,0.3); }

        .rail-title {
          font-size: 10px; font-weight: 700; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .rail-type { font-size: 8px; color: var(--text-muted); font-family: 'Space Mono', monospace; }

        .toast {
          position: fixed; bottom: 24px; right: 24px;
          padding: 12px 20px; border-radius: 10px;
          font-family: 'Space Mono', monospace; font-size: 12px;
          animation: toastIn 0.25s ease; z-index: 9999;
        }
        .toast.ok { background: #0d1f14; border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
        .toast.err { background: #1f0d0d; border: 1px solid rgba(239,68,68,0.3); color: #f87171; }

        @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="preview-card">
        <div className="preview-title">ESTABLISH LIVE LINK</div>
        <div className="device-input-row">
          <input
            className="field-input"
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            placeholder="device_id (e.g. machine-bangalore-001)"
          />
          <button className="watch-btn" onClick={loadPlaylist} disabled={loading}>
            {loading ? "CONNECTING..." : "WATCH LIVE"}
          </button>
        </div>

        {playlist ? (
          <>
            <div className="player-container">
              {isVideo ? (
                <video
                  ref={videoRef}
                  className="player-media"
                  src={adUrl}
                  autoPlay
                  muted
                  onEnded={handleNext}
                  key={adUrl} // Forces re-render on ad change
                />
              ) : (
                <img className="player-media" src={adUrl} alt={currentAd.title} key={adUrl} />
              )}
              
              <div className="player-overlay">
                <div className="now-playing-info">
                  <div className="ad-index">NOW SHOWING #{currentIndex + 1}</div>
                  <div className="ad-name">{currentAd.title}</div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: 'Space Mono' }}>
                  {isVideo ? "VIDEO STREAM" : "IMAGE SLIDE"}
                </div>
              </div>
            </div>

            <div className="playlist-rail">
              {playlist.ads.map((ad, idx) => (
                <div
                  key={ad.id}
                  className={`rail-item ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <div className="rail-title">{ad.title}</div>
                  <div className="rail-type">{ad.file_url.split('.').pop().toUpperCase()}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 12 }}>
            No live preview active. Enter a device ID and click Watch Live.
          </div>
        )}
      </div>
    </div>
  )
}
