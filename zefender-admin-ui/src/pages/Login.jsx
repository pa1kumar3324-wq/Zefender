import { useState } from "react"
import axios from "axios"
import { saveSession } from "../utils/auth"

// Superadmin credentials — user must type these exactly
const SA_EMAIL    = "superadmin@zefender.com"
const SA_PASSWORD = "Zefender@123"

// Client-side password rules shown to admin on register
const PW_RULES = [
  { test: v => v.length >= 8,          label: "At least 8 characters" },
  { test: v => /[A-Z]/.test(v),        label: "One uppercase letter" },
  { test: v => /[a-z]/.test(v),        label: "One lowercase letter" },
  { test: v => /[0-9]/.test(v),        label: "One number" },
  { test: v => /[^A-Za-z0-9]/.test(v), label: "One special character" },
]

export default function Login({ onLogin }) {
  const [step, setStep]   = useState("dialog")  // "dialog" | "form"
  const [role, setRole]   = useState(null)
  const [mode, setMode]   = useState("login")   // "login" | "register"

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [loading, setLoading]   = useState(false)

  const selectRole = (r) => {
    setRole(r); setStep("form"); setMode("login")
    setError(""); setSuccess(""); setEmail(""); setPassword(""); setShowPw(false)
  }

  // ── Superadmin login — validates entered creds against hardcoded values ──
  const handleSuperAdminLogin = async (e) => {
    e.preventDefault()
    if (email !== SA_EMAIL)    return setError(`Email must be ${SA_EMAIL}`)
    if (password !== SA_PASSWORD) return setError("Incorrect password")
    setLoading(true); setError("")
    try {
      const res = await axios.post("/api/auth/login", { email, password, role: "superadmin" })
      saveSession({ token: res.data.token, role: res.data.role })
      onLogin(res.data.role)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
    setLoading(false)
  }

  // ── Admin login ──
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    if (!email.trim())    return setError("Email is required")
    if (!password.trim()) return setError("Password is required")
    setLoading(true); setError("")
    try {
      const res = await axios.post("/api/auth/login", { email, password, role: "admin" })
      saveSession({ token: res.data.token, role: res.data.role })
      onLogin(res.data.role)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
    setLoading(false)
  }

  // ── Admin register ──
  const handleAdminRegister = async (e) => {
    e.preventDefault()
    if (!email.trim())    return setError("Email is required")
    if (!password.trim()) return setError("Password is required")
    const failedRule = PW_RULES.find(r => !r.test(password))
    if (failedRule) return setError(`Password must have: ${failedRule.label.toLowerCase()}`)
    setLoading(true); setError(""); setSuccess("")
    try {
      await axios.post("/api/auth/register", { email, password })
      setSuccess("Account created! You can now sign in.")
      setMode("login"); setPassword("")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    }
    setLoading(false)
  }

  const pwStrength = PW_RULES.filter(r => r.test(password)).length

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="grid-overlay" />
        <div className="glow-orb orb1" />
        <div className="glow-orb orb2" />
      </div>

      {/* ── Role dialog ── */}
      {step === "dialog" && (
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon">Z</div>
            <div>
              <div className="logo-name">ZEFENDER</div>
              <div className="logo-sub">AD CONTROL SYSTEM</div>
            </div>
          </div>
          <div className="login-divider" />
          <div className="dialog-title">WHO ARE YOU?</div>
          <div className="dialog-subtitle">Select your role to continue</div>
          <div className="role-grid">
            <button className="role-btn superadmin-btn" onClick={() => selectRole("superadmin")}>
              <span className="role-icon">👑</span>
              <span className="role-label">SUPER ADMIN</span>
              <span className="role-desc">Full system access</span>
            </button>
            <button className="role-btn admin-btn" onClick={() => selectRole("admin")}>
              <span className="role-icon">🛡</span>
              <span className="role-label">ADMIN</span>
              <span className="role-desc">Assigned machines only</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      {step === "form" && (
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon">Z</div>
            <div>
              <div className="logo-name">ZEFENDER</div>
              <div className="logo-sub">{role === "superadmin" ? "SUPER ADMIN" : "ADMIN"}</div>
            </div>
          </div>
          <div className="login-divider" />

          {/* Admin tabs */}
          {role === "admin" && (
            <div className="tab-row">
              <button className={`tab-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); setSuccess("") }}>SIGN IN</button>
              <button className={`tab-btn ${mode === "register" ? "active" : ""}`}
                onClick={() => { setMode("register"); setError(""); setSuccess("") }}>SIGN UP</button>
            </div>
          )}

          <form className="login-form"
            onSubmit={role === "superadmin" ? handleSuperAdminLogin : mode === "login" ? handleAdminLogin : handleAdminRegister}>

            <div className="field-group">
              <label className="field-label">EMAIL</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === "superadmin" ? SA_EMAIL : "you@example.com"}
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">PASSWORD</label>
              <div className="pw-wrap">
                <input
                  className="field-input pw-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Password strength bar — admin register only */}
            {role === "admin" && mode === "register" && password.length > 0 && (
              <div className="pw-strength">
                <div className="pw-bar">
                  {PW_RULES.map((r, i) => (
                    <div key={i} className={`pw-seg ${r.test(password) ? "filled" : ""}`} />
                  ))}
                </div>
                <div className="pw-hint">
                  {PW_RULES.map((r, i) => (
                    <span key={i} className={`pw-rule ${r.test(password) ? "pass" : "fail"}`}>
                      {r.test(password) ? "✓" : "✗"} {r.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error   && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading
                ? <span className="btn-loading"><span className="dot-pulse" />
                    {mode === "register" ? "CREATING..." : "AUTHENTICATING..."}
                  </span>
                : role === "superadmin" ? "ENTER SYSTEM →"
                : mode === "login"      ? "SIGN IN →"
                :                        "CREATE ACCOUNT →"}
            </button>
          </form>

          <button className="back-btn" onClick={() => setStep("dialog")}>← BACK</button>
          <div className="login-footer">
            <span className="status-dot online" />
            <span>SYSTEM ONLINE · PORT 5000</span>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #050507; font-family: 'Space Mono', monospace; position: relative; overflow: hidden;
        }
        .login-bg { position: fixed; inset: 0; pointer-events: none; }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .glow-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
        .orb1 { width: 500px; height: 500px; background: #6366f1; top: -100px; left: -100px; animation: float1 8s ease-in-out infinite; }
        .orb2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -100px; right: -100px; animation: float2 10s ease-in-out infinite; }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,-30px)} }

        .login-card {
          background: #0d0d14; border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px; padding: 40px; width: 100%; max-width: 420px;
          box-shadow: 0 0 60px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.6);
          animation: cardIn 0.4s ease;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .login-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .logo-icon {
          width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: white;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .logo-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 0.1em; }
        .logo-sub  { font-size: 9px; color: #6366f1; letter-spacing: 0.2em; margin-top: 2px; }
        .login-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent); margin-bottom: 28px; }

        .dialog-title    { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 6px; }
        .dialog-subtitle { font-size: 11px; color: #4f4f7a; margin-bottom: 24px; letter-spacing: 0.1em; }
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .role-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 20px 12px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s; border: 1px solid rgba(99,102,241,0.2); background: #13131f;
        }
        .role-btn:hover { transform: translateY(-2px); }
        .superadmin-btn:hover { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245,158,11,0.15); }
        .admin-btn:hover      { border-color: #6366f1; box-shadow: 0 0 20px rgba(99,102,241,0.15); }
        .role-icon  { font-size: 28px; }
        .role-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 800; color: #e2e8f0; letter-spacing: 0.1em; }
        .role-desc  { font-size: 9px; color: #4f4f7a; letter-spacing: 0.08em; }

        .tab-row { display: flex; margin-bottom: 22px; border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; overflow: hidden; }
        .tab-btn { flex: 1; padding: 9px; background: transparent; border: none; color: #4f4f7a; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.15s; }
        .tab-btn.active { background: rgba(99,102,241,0.12); color: #a5b4fc; }
        .tab-btn:hover:not(.active) { color: #6366f1; }

        .login-form { display: flex; flex-direction: column; gap: 18px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 10px; color: #6366f1; letter-spacing: 0.18em; }

        .pw-wrap { position: relative; display: flex; align-items: center; }
        .pw-input { padding-right: 44px !important; }
        .eye-btn {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          font-size: 16px; line-height: 1; padding: 0; opacity: 0.6;
          transition: opacity 0.15s;
        }
        .eye-btn:hover { opacity: 1; }

        .field-input {
          background: #13131f; border: 1px solid rgba(99,102,241,0.2);
          border-radius: 8px; padding: 12px 14px; color: #e2e8f0;
          font-family: 'Space Mono', monospace; font-size: 13px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
        }
        .field-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .field-input::placeholder { color: #3f3f5a; }

        /* Password strength */
        .pw-strength { display: flex; flex-direction: column; gap: 6px; }
        .pw-bar { display: flex; gap: 4px; }
        .pw-seg { flex: 1; height: 3px; border-radius: 2px; background: #1e1e2e; transition: background 0.2s; }
        .pw-seg.filled { background: #6366f1; }
        .pw-hint { display: flex; flex-direction: column; gap: 3px; }
        .pw-rule { font-size: 9px; letter-spacing: 0.08em; }
        .pw-rule.pass { color: #10b981; }
        .pw-rule.fail { color: #4f4f7a; }

        .login-error   { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 10px 14px; color: #f87171; font-size: 12px; line-height: 1.5; }
        .login-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 10px 14px; color: #10b981; font-size: 12px; }

        .login-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 8px; padding: 14px; color: white;
          font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(99,102,241,0.3); margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 30px rgba(99,102,241,0.5); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .dot-pulse { width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .back-btn {
          display: block; width: 100%; margin-top: 14px; background: none; border: none;
          color: #4f4f7a; font-family: 'Space Mono', monospace; font-size: 10px;
          letter-spacing: 0.1em; cursor: pointer; transition: color 0.15s; text-align: center;
        }
        .back-btn:hover { color: #a5b4fc; }

        .login-footer { display: flex; align-items: center; gap: 6px; margin-top: 24px; font-size: 10px; color: #3f3f5a; letter-spacing: 0.1em; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot.online { background: #10b981; box-shadow: 0 0 6px #10b981; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
