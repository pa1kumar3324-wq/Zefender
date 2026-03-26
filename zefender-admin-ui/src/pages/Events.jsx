import { useState } from "react"
import { api } from "../api"

export default function Events({ token }) {
  const [deviceId, setDeviceId] = useState("machine-bangalore-001")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const client = api(token)

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleTrigger = async () => {
    if (!deviceId) return showToast("Enter device ID", "err")
    setLoading(true)
    setResult(null)
    try {
      const res = await client.triggerEvent(deviceId)
      setResult(res.data)
      showToast("Event triggered successfully!")
    } catch (err) {
      showToast(err.response?.data?.message || "Trigger failed", "err")
    }
    setLoading(false)
  }

  return (
    <div className="ev-root">
      <style>{`
        .ev-root { display: flex; flex-direction: column; gap: 22px; max-width: 680px; }

        .ev-card {
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

        .ev-title {
          font-size: 10px; letter-spacing: 0.2em;
          color: var(--accent); font-family: 'Space Mono', monospace;
          margin-bottom: 6px;
        }

        .ev-desc {
          font-size: 12px; color: #6b7280; line-height: 1.7;
          margin-bottom: 20px;
        }

        .ev-row { display: flex; gap: 10px; align-items: center; }

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

        .trigger-btn {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          border: none; border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-family: 'Space Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          box-shadow: 0 0 20px rgba(245,158,11,0.25);
          position: relative;
          overflow: hidden;
        }

        .trigger-btn:hover:not(:disabled) {
          opacity: 0.85; transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(245,158,11,0.4);
        }

        .trigger-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .trigger-btn.loading::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%);
          background-size: 200% 100%;
          animation: shimmer 1s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Result */
        .result-card {
          background: var(--field);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 10px;
          padding: 18px;
          animation: fadeUp 0.25s ease;
        }

        .result-header {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 14px;
        }

        .result-badge {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 20px;
          padding: 3px 12px;
          font-size: 10px; color: #fbbf24;
          letter-spacing: 0.12em;
          font-family: 'Space Mono', monospace;
        }

        .priority-list { display: flex; flex-direction: column; gap: 8px; }

        .priority-item {
          display: flex; align-items: center; gap: 12px;
          background: rgba(245,158,11,0.04);
          border: 1px solid rgba(245,158,11,0.1);
          border-radius: 8px;
          padding: 12px 14px;
          animation: fadeUp 0.2s ease;
        }

        .priority-num {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: white;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(245,158,11,0.3);
        }

        .priority-title {
          font-size: 13px; color: #e2e8f0;
          font-family: 'Syne', sans-serif; font-weight: 700;
        }

        .priority-url {
          font-size: 10px; color: #4f4f7a;
          font-family: 'Space Mono', monospace;
          margin-top: 2px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

        /* Info box */
        .info-box {
          background: rgba(99,102,241,0.05);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 10px;
          padding: 16px;
          font-size: 12px; color: #6b7280; line-height: 1.8;
        }

        .info-box strong { color: #a5b4fc; }

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

      <div className="ev-card">
        <div className="ev-title">PAYMENT EVENT TRIGGER</div>
        <p className="ev-desc">
          Simulates a vending machine payment. Returns priority ads for the specified device.
          In production, the payment server calls this automatically.
        </p>
        <div className="ev-row">
          <input
            className="field-input"
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            placeholder="device_id"
          />
          <button
            className={`trigger-btn ${loading ? "loading" : ""}`}
            onClick={handleTrigger}
            disabled={loading}
          >
            {loading ? "TRIGGERING..." : "⚡ TRIGGER EVENT"}
          </button>
        </div>
      </div>

      {result && (
        <div className="result-card">
          <div className="result-header">
            <span style={{ fontSize: 12, color: "#6b7280" }}>PRIORITY ADS TO PLAY</span>
            <span className="result-badge">{result.priority_ads?.length} ADS</span>
          </div>
          <div className="priority-list">
            {result.priority_ads?.map(ad => (
              <div key={ad.id} className="priority-item">
                <div className="priority-num">{ad.priority}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="priority-title">{ad.title}</div>
                  <div className="priority-url">{ad.file_url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-box">
        <strong>HOW THIS WORKS</strong><br />
        When a customer pays at the vending machine, the payment server hits
        <strong> POST /api/events</strong> with the device ID.
        Our backend returns priority ads sorted 1 → 2 → 3.
        The Pi plays them in order then resumes the normal ad loop.
      </div>
    </div>
  )
}
