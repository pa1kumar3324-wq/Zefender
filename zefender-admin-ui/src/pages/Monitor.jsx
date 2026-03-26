import { useState, useEffect } from "react"
import { api } from "../api"

export default function Monitor({ token }) {
  const [ads, setAds] = useState([])
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState("")
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [toast, setToast] = useState(null)

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
      if (devicesRes.data.length > 0 && !selectedDevice) {
        setSelectedDevice(devicesRes.data[0].id)
      }
    } catch (err) {
      showToast("Failed to fetch data", "err")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSimulatePayment = async () => {
    if (!selectedDevice) return
    setSimulating(true)
    try {
      await client.triggerEvent(selectedDevice)
      showToast("Payment simulated! Priority ads triggered.", "ok")
    } catch (err) {
      showToast("Failed to trigger event", "err")
    }
    setSimulating(false)
  }

  return (
    <div className="monitor-root">
      <style>{`
        .monitor-root { display: flex; flex-direction: column; gap: 24px; max-width: 1000px; }
        
        .monitor-grid { display: grid; grid-template-columns: 1fr 350px; gap: 24px; }

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
          cursor: pointer;
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
        .trigger-btn:active { transform: translateY(0); }
        .trigger-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .simulation-info {
          font-size: 11px;
          background: rgba(99,102,241,0.05);
          padding: 12px;
          border-radius: 8px;
          line-height: 1.6;
          color: var(--text-muted);
          border-left: 3px solid var(--accent);
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

      <div className="monitor-grid">
        {/* Left Column: Ad Status Board */}
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
                  <th>DEPLOAYMENT STATUS</th>
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
              </tbody>
            </table>
          )}
        </div>

        {/* Right Column: Simulation & Triggers */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title">Simulation Center</div>
          
          <div className="sim-form">
            <div>
              <div className="label">TARGET DEVICE</div>
              <select 
                className="field-select" 
                style={{ width: '100%' }}
                value={selectedDevice}
                onChange={e => setSelectedDevice(e.target.value)}
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
                {devices.length === 0 && <option value="">No devices found</option>}
              </select>
            </div>

            <div className="simulation-info">
              Triggers a "Payment Confirmed" event. The target device will immediately prioritize chosen ads.
            </div>

            <button 
              className="trigger-btn"
              disabled={simulating || !selectedDevice}
              onClick={handleSimulatePayment}
            >
              {simulating ? "PROCESSING..." : "SIMULATE PAYMENT →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
