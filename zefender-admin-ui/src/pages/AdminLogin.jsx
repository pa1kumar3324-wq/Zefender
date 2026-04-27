import { useState } from "react"
import axios from "axios"

export default function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim())    return setError("Email is required")
    if (!password.trim()) return setError("Password is required")
    setLoading(true); setError("")
    try {
      const res = await axios.post("/api/auth/login", { email, password, role: "admin" })
      // Fetch assigned devices right after login
      const devRes = await axios.get("/api/auth/me/devices", {
        headers: { Authorization: `Bearer ${res.data.token}` }
      })
      onLogin({
        token: res.data.token,
        email: res.data.email,
        allowed_devices: devRes.data.allowed_devices || [],
      })
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials")
    }
    setLoading(false)
  }

  return (
    <div className="al-root">
      <div className="al-bg">
        <div className="al-grid" />
        <div className="al-orb orb1" />
        <div className="al-orb orb2" />
      </div>

      <div className="al-card">
        <div className="al-logo">
          <div className="al-logo-icon">Z</div>
          <div>
            <div className="al-logo-name">ZEFENDER</div>
            <div className="al-logo-sub">ADMIN ACCESS</div>
          </div>
        </div>
        <div className="al-divider" />

        <form className="al-form" onSubmit={handleSubmit}>
          <div className="al-field">
            <label className="al-label">EMAIL</label>
            <input className="al-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoFocus />
          </div>

          <div className="al-field">
            <label className="al-label">PASSWORD</label>
            <div className="al-pw-wrap">
              <input className="al-input al-pw-input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" />
              <button type="button" className="al-eye" onClick={() => setShowPw(v => !v)}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && <div className="al-error">{error}</div>}

          <button className="al-btn" type="submit" disabled={loading}>
            {loading
              ? <span className="al-loading"><span className="al-dot" />AUTHENTICATING...</span>
              : "SIGN IN →"}
          </button>
        </form>

        <button className="al-back" onClick={onBack}>← BACK</button>

        <div className="al-footer">
          <span className="al-dot-status" />
          <span>SYSTEM ONLINE · PORT 5000</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #050507; font-family: 'Space Mono', monospace;
          position: relative; overflow: hidden;
        }
        .al-bg { position: fixed; inset: 0; pointer-events: none; }
        .al-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .al-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
        .orb1 { width: 500px; height: 500px; background: #6366f1; top: -100px; left: -100px; animation: f1 8s ease-in-out infinite; }
        .orb2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -100px; right: -100px; animation: f2 10s ease-in-out infinite; }
        @keyframes f1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,20px)} }
        @keyframes f2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,-30px)} }

        .al-card {
          position: relative; z-index: 1;
          background: #0d0d14; border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px; padding: 40px; width: 100%; max-width: 420px;
          box-shadow: 0 0 60px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.6);
          animation: cardIn 0.4s ease;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .al-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .al-logo-icon {
          width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: white;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .al-logo-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 0.1em; }
        .al-logo-sub  { font-size: 9px; color: #6366f1; letter-spacing: 0.2em; margin-top: 2px; }
        .al-divider   { height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent); margin-bottom: 28px; }

        .al-form  { display: flex; flex-direction: column; gap: 18px; }
        .al-field { display: flex; flex-direction: column; gap: 6px; }
        .al-label { font-size: 10px; color: #6366f1; letter-spacing: 0.18em; }

        .al-pw-wrap { position: relative; display: flex; align-items: center; }
        .al-pw-input { padding-right: 44px !important; }
        .al-eye {
          position: absolute; right: 12px; background: none; border: none;
          cursor: pointer; font-size: 16px; opacity: 0.6; transition: opacity 0.15s;
        }
        .al-eye:hover { opacity: 1; }

        .al-input {
          background: #13131f; border: 1px solid rgba(99,102,241,0.2);
          border-radius: 8px; padding: 12px 14px; color: #e2e8f0;
          font-family: 'Space Mono', monospace; font-size: 13px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
        }
        .al-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .al-input::placeholder { color: #3f3f5a; }

        .al-error {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px; padding: 10px 14px; color: #f87171; font-size: 12px;
        }

        .al-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 8px; padding: 14px; color: white;
          font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; cursor: pointer; margin-top: 4px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
        }
        .al-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 30px rgba(99,102,241,0.5); }
        .al-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .al-loading { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .al-dot { width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .al-back {
          display: block; width: 100%; margin-top: 14px; background: none; border: none;
          color: #4f4f7a; font-family: 'Space Mono', monospace; font-size: 10px;
          letter-spacing: 0.1em; cursor: pointer; transition: color 0.15s; text-align: center;
        }
        .al-back:hover { color: #a5b4fc; }

        .al-footer { display: flex; align-items: center; gap: 6px; margin-top: 24px; font-size: 10px; color: #3f3f5a; letter-spacing: 0.1em; }
        .al-dot-status { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
