import { useState, useEffect, useRef } from "react"
import { api } from "../api"

export default function Monitor({ token }) {
  const [ads, setAds] = useState([])
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState("machine-bangalore-001")
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [toast, setToast] = useState(null)
  
  // Live Preview State
  const [playlist, setPlaylist] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false)
  
  const videoRef = useRef(null)
  const timerRef = useRef(null)
  const client = api(token)

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [adsRes, devicesRes] = await Promise.all([
        client.getAds(),
        client.getDevices()
      ])
      setAds(adsRes.data)
      setDevices(devicesRes.data)
      if (devicesRes.data.length > 0) {
        const bang = devicesRes.data.find(d => d.id === "machine-bangalore-001")
        if (!selectedDevice || !devicesRes.data.find(d => d.id === selectedDevice)) {
           setSelectedDevice(bang ? bang.id : devicesRes.data[0].id)
        }
      }
    } catch (err) {
      showToast("Backend monitor offline", "err")
    }
    setLoading(false)
  }

  const loadPlaylist = async () => {
    if (!selectedDevice) return
    setPreviewLoading(true)
    try {
      const res = await client.getPlaylist(selectedDevice)
      if (res.data && res.data.ads && res.data.ads.length > 0) {
        setPlaylist(res.data)
        setCurrentIndex(0)
      } else {
        setPlaylist(null)
        showToast("No active ads for this device", "err")
      }
    } catch (err) {
      setPlaylist(null)
      showToast("Could not find device feed", "err")
    }
    setPreviewLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!playlist || playlist.ads.length === 0) return

    const currentAd = playlist.ads[currentIndex]
    const isVideo = currentAd.file_url.match(/\.(mp4|webm|mov|ogg)$/i)

    if (isVideo) {
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
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

  const handleSimulatePayment = async () => {
    setSimulating(true)
    setShowPaymentOverlay(true)
    
    try {
      if (selectedDevice) {
        await client.triggerEvent(selectedDevice)
        showToast("Payment signal sent to device", "ok")
      } else {
        showToast("Demo mode: No device selected", "ok")
      }
    } catch (err) {
      showToast("Backend link offline - Demo only", "err")
    }

    // Overlay stays for 5 seconds for visual demo
    setTimeout(() => {
      setShowPaymentOverlay(false)
      setSimulating(false)
    }, 5000)
  }

  const currentAd = playlist?.ads[currentIndex]
  const isVideo = currentAd?.file_url.match(/\.(mp4|webm|mov|ogg)$/i)
  const adUrl = currentAd ? (currentAd.file_url.startsWith("http") ? currentAd.file_url : `http://localhost:5000${currentAd.file_url}`) : ""

  return (
    <div className="monitor-root">
      <style>{`
        .monitor-root { display: flex; flex-direction: column; gap: 24px; max-width: 1200px; position: relative; }
        
        .monitor-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }

        .card {
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

        .card-title {
          font-size: 10px; letter-spacing: 0.2em;
          color: var(--accent); font-family: 'Space Mono', monospace;
          margin-bottom: 20px; text-transform: uppercase;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* Ad List Table */
        .ad-table { width: 100%; border-collapse: collapse; }
        .ad-table th { text-align: left; padding: 12px; font-size: 10px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        .ad-table td { padding: 12px; font-size: 12px; border-bottom: 1px solid rgba(99,102,241,0.05); }

        .status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;
        }
        .status-active { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-inactive { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

        /* Simulation Form */
        .sim-form { display: flex; flex-direction: column; gap: 16px; }
        .label { font-size: 10px; color: var(--text-muted); margin-bottom: 4px; }

        .field-select {
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 12px; outline: none;
          cursor: pointer; width: 100%;
        }

        .trigger-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none; border-radius: 8px;
          padding: 14px;
          color: white;
          font-family: 'Space Mono', monospace;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3);
          margin-top: 10px;
        }

        .trigger-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
        .trigger-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Live Preview */
        .preview-section { margin-top: 12px; }
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

        .watch-btn {
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 12px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          cursor: pointer;
        }
        .watch-btn:hover { border-color: var(--accent); color: var(--accent); }

        /* Payment Overlay (Demo) */
        .payment-overlay {
          position: absolute;
          top: 30%; left: 50%;
          transform: translate(-50%, -30%);
          width: 420px;
          background: #0a0a12;
          border: 2px solid #10b981;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          z-index: 100;
          box-shadow: 0 0 120px rgba(16,185,129,0.6);
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -30%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -30%) scale(1); }
        }

        .success-icon {
          width: 80px; height: 80px;
          background: rgba(16,185,129,0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          color: #10b981; font-size: 40px;
          box-shadow: 0 0 20px rgba(16,185,129,0.2);
        }

        .payment-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px; letter-spacing: 0.05em; }
        .payment-msg { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
        
        .overlay-close {
          position: absolute; top: 16px; right: 16px;
          background: none; border: none; color: var(--text-muted);
          cursor: pointer; font-size: 18px;
        }

        .toast {
          position: fixed; bottom: 24px; right: 24px;
          padding: 12px 20px; border-radius: 10px;
          font-family: 'Space Mono', monospace; font-size: 12px;
          animation: toastIn 0.25s ease; z-index: 9999;
        }
        .toast.ok { background: #0d1f14; border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
        .toast.err { background: #1f0d0d; border: 1px solid rgba(239,68,68,0.3); color: #f87171; }
      `}</style>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {showPaymentOverlay && (
        <div className="payment-overlay">
          <button className="overlay-close" onClick={() => setShowPaymentOverlay(false)}>✕</button>
          <div className="success-icon">✓</div>
          <div className="payment-title">PAYMENT SUCCESS</div>
          <div className="payment-msg">
            <b>Transaction ID:</b> #ZEF-{Math.floor(Math.random()*999999)}<br/>
            Priority ads are now triggering on terminal:<br/>
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}>{selectedDevice || "NO_DEVICE_CONNECTED"}</span>
          </div>
          <div style={{ marginTop: 24, fontSize: 10, color: '#10b981', letterSpacing: '0.2em', fontWeight: 700 }}>
            ADMIN CONSOLE DEMO VIEW
          </div>
        </div>
      )}

      <div className="monitor-grid">
        <div className="card">
          <div className="card-title">Real-time Ad Status Board</div>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading ads...</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>AD TITLE</th>
                  <th>FILE TYPE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id}>
                    <td>{ad.title}</td>
                    <td style={{ opacity: 0.6 }}>{ad.file_url.split('.').pop().toUpperCase()}</td>
                    <td>
                      <span className={`status-pill ${ad.active ? 'status-active' : 'status-inactive'}`}>
                        {ad.active ? "● ACTIVE" : "○ INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
                {ads.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No live ad data available.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title">Simulation Center</div>
          
          <div className="sim-form">
            <div>
              <div className="label">TARGET DEVICE</div>
              <select 
                className="field-select" 
                value={selectedDevice}
                onChange={e => setSelectedDevice(e.target.value)}
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
                {devices.length === 0 && <option value="">No Active Devices</option>}
              </select>
            </div>

            <button 
              className="trigger-btn"
              disabled={simulating}
              onClick={handleSimulatePayment}
            >
              {simulating ? "SIMULATING..." : "SIMULATE PAYMENT →"}
            </button>
            
            <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(99,102,241,0.05)', padding: 12, borderRadius: 8, lineHeight: 1.4 }}>
              <b>Admin Experience Demo:</b><br/>
              Simulates a terminal payment event. Shows the success state on the admin dashboard for presentation purposes.
            </div>
          </div>
        </div>
      </div>

      <div className="card preview-section">
        <div className="card-title">
          Live Device Preview
          <button className="watch-btn" onClick={loadPlaylist} disabled={previewLoading}>
            {previewLoading ? "CONNECTING..." : "SYNC LIVE FEED"}
          </button>
        </div>

        {playlist ? (
          <div className="player-container">
            {isVideo ? (
              <video
                ref={videoRef}
                className="player-media"
                src={adUrl}
                autoPlay
                muted
                onEnded={handleNext}
                key={adUrl}
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
                {selectedDevice.toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 12 }}>
            Preview inactive. Click Sync Live Feed to link with <b>{selectedDevice || "terminal"}</b>.
          </div>
        )}
      </div>
    </div>
  )
}
