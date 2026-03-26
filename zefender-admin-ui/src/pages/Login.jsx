import { useState } from "react"
import axios from "axios"

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await axios.post("/api/auth/login", { username, password })
      onLogin(res.data.token)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="grid-overlay" />
        <div className="glow-orb orb1" />
        <div className="glow-orb orb2" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">
            <span>Z</span>
          </div>
          <div>
            <div className="logo-name">ZEFENDER</div>
            <div className="logo-sub">AD CONTROL SYSTEM</div>
          </div>
        </div>

        <div className="login-divider" />

        <form onSubmit={handleLogin} className="login-form">
          <div className="field-group">
            <label className="field-label">USERNAME</label>
            <input
              className="field-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div className="field-group">
            <label className="field-label">PASSWORD</label>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="dot-pulse" />
                AUTHENTICATING
              </span>
            ) : "ENTER SYSTEM →"}
          </button>
        </form>

        <div className="login-footer">
          <span className="status-dot online" />
          <span>SYSTEM ONLINE · PORT 5000</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050507;
          font-family: 'Space Mono', monospace;
          position: relative;
          overflow: hidden;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }

        .orb1 {
          width: 500px; height: 500px;
          background: #6366f1;
          top: -100px; left: -100px;
          animation: float1 8s ease-in-out infinite;
        }

        .orb2 {
          width: 400px; height: 400px;
          background: #8b5cf6;
          bottom: -100px; right: -100px;
          animation: float2 10s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -30px); }
        }

        .login-card {
          background: #0d0d14;
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          position: relative;
          box-shadow: 0 0 60px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.6);
          animation: cardIn 0.4s ease;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }

        .logo-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: white;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }

        .logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.1em;
        }

        .logo-sub {
          font-size: 9px;
          color: #6366f1;
          letter-spacing: 0.2em;
          margin-top: 2px;
        }

        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
          margin-bottom: 28px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 10px;
          color: #6366f1;
          letter-spacing: 0.18em;
        }

        .field-input {
          background: #13131f;
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 8px;
          padding: 12px 14px;
          color: #e2e8f0;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }

        .field-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .field-input::placeholder { color: #3f3f5a; }

        .login-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          color: #f87171;
          font-size: 12px;
        }

        .login-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 8px;
          padding: 14px;
          color: white;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
          margin-top: 4px;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(99,102,241,0.5);
        }

        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .dot-pulse {
          width: 8px; height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .login-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 10px;
          color: #3f3f5a;
          letter-spacing: 0.1em;
        }

        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
