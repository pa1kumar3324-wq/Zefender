import { useState, useEffect } from "react"
import { api } from "../api"
import { isSuperAdmin } from "../utils/auth"

export default function AdminSettings() {
  const [devices, setDevices]             = useState([])
  const [admins, setAdmins]               = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [assignedIds, setAssignedIds]     = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [loadingAdmins, setLoadingAdmins]   = useState(true)
  const [toast, setToast]                 = useState(null)
  // New admin form
  const [newEmail, setNewEmail]     = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPw, setShowNewPw]   = useState(false)
  const [creating, setCreating]     = useState(false)

  const client = api()

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!isSuperAdmin()) return
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoadingDevices(true); setLoadingAdmins(true)
    try {
      const [devRes, admRes] = await Promise.all([client.getDevices(), client.getAdmins()])
      setDevices(devRes.data)
      setAdmins(admRes.data)
    } catch { showToast("Failed to load data", "err") }
    setLoadingDevices(false); setLoadingAdmins(false)
  }

  // When an admin is selected, pre-tick their current devices
  const selectAdmin = (admin) => {
    setSelectedAdmin(admin)
    setAssignedIds(admin.allowed_devices || [])
  }

  const toggleDevice = (id) => {
    setAssignedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSaveAssignment = async () => {
    if (!selectedAdmin) return
    try {
      await client.assignDevices(selectedAdmin.id, assignedIds)
      showToast(`Devices saved for ${selectedAdmin.email}`)
      // Update local admins list so the UI reflects the change
      setAdmins(prev => prev.map(a =>
        a.id === selectedAdmin.id ? { ...a, allowed_devices: assignedIds } : a
      ))
      setSelectedAdmin(prev => ({ ...prev, allowed_devices: assignedIds }))
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "err")
    }
  }

  const handleDeleteAdmin = async (id, email) => {
    if (!confirm(`Remove admin ${email}?`)) return
    try {
      await client.deleteAdmin(id)
      showToast("Admin removed")
      setAdmins(prev => prev.filter(a => a.id !== id))
      if (selectedAdmin?.id === id) { setSelectedAdmin(null); setAssignedIds([]) }
    } catch { showToast("Failed to remove admin", "err") }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    if (!newEmail.trim() || !newPassword.trim()) return showToast("Email and password required", "err")
    setCreating(true)
    try {
      await client.registerAdmin({ email: newEmail.trim(), password: newPassword })
      showToast(`Admin ${newEmail} created`)
      setNewEmail(""); setNewPassword("")
      loadAll()
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create admin", "err")
    }
    setCreating(false)
  }

  if (!isSuperAdmin()) {
    return <div style={{ padding: 40, color: "var(--text-muted)", fontFamily: "Space Mono, monospace", fontSize: 12 }}>Access denied.</div>
  }

  return (
    <div className="as-root">
      <style>{`
        .as-root { display: flex; flex-direction: column; gap: 22px; max-width: 900px; }

        .as-grid { display: grid; grid-template-columns: 280px 1fr; gap: 16px; }

        .as-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 12px; padding: 22px; animation: fadeUp 0.3s ease;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .as-title { font-size: 10px; letter-spacing: 0.2em; color: var(--accent); font-family: 'Space Mono', monospace; margin-bottom: 14px; }
        .as-desc  { font-size: 11px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }

        /* Admin list */
        .admin-list { display: flex; flex-direction: column; gap: 6px; }
        .admin-item {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--field); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: all 0.15s;
        }
        .admin-item:hover { border-color: rgba(99,102,241,0.3); }
        .admin-item.active { border-color: var(--accent); background: rgba(99,102,241,0.08); }
        .admin-email { font-size: 11px; color: var(--text); font-family: 'Space Mono', monospace; }
        .admin-badge { font-size: 9px; color: var(--text-muted); margin-top: 2px; }
        .btn-del {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 6px; padding: 4px 8px; color: #f87171;
          font-family: 'Space Mono', monospace; font-size: 9px; cursor: pointer;
          flex-shrink: 0; margin-left: 8px;
        }
        .btn-del:hover { background: rgba(239,68,68,0.15); }

        /* Device assignment */
        .device-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .device-item {
          display: flex; align-items: center; gap: 12px;
          background: var(--field); border: 1px solid var(--border);
          border-radius: 8px; padding: 11px 14px; cursor: pointer; transition: all 0.15s;
        }
        .device-item:hover { border-color: rgba(99,102,241,0.3); }
        .device-item.checked { border-color: var(--accent); background: rgba(99,102,241,0.07); }
        .check-box {
          width: 16px; height: 16px; border-radius: 4px;
          border: 1.5px solid rgba(99,102,241,0.3); background: transparent;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 10px; transition: all 0.15s;
        }
        .check-box.checked { background: var(--accent); border-color: var(--accent); color: white; }
        .device-name { font-size: 12px; color: var(--text); font-family: 'Syne', sans-serif; font-weight: 700; }
        .device-id   { font-size: 9px; color: var(--text-muted); font-family: 'Space Mono', monospace; margin-top: 2px; }

        .empty-msg { color: var(--text-muted); font-size: 11px; padding: 20px 0; text-align: center; }
        .select-hint { color: var(--text-muted); font-size: 11px; text-align: center; padding: 40px 0; border: 1px dashed var(--border); border-radius: 8px; }

        .btn-save {
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          border: none; border-radius: 8px; padding: 10px 20px; color: white;
          font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; cursor: pointer; transition: all 0.15s;
          box-shadow: 0 0 16px rgba(99,102,241,0.25);
        }
        .btn-save:hover { opacity: 0.85; transform: translateY(-1px); }

        .toast {
          position: fixed; bottom: 24px; right: 24px; padding: 12px 20px;
          border-radius: 10px; font-family: 'Space Mono', monospace; font-size: 12px;
          animation: toastIn 0.25s ease; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .toast.ok  { background: #0d1f14; border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
        .toast.err { background: #1f0d0d; border: 1px solid rgba(239,68,68,0.3);  color: #f87171; }
        @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="as-grid">
        {/* Left — admin list + create form */}
        <div className="as-card">
          <div className="as-title">ADMIN ACCOUNTS</div>
          {loadingAdmins ? <div className="empty-msg">Loading...</div>
          : admins.length === 0 ? <div className="empty-msg" style={{ marginBottom: 16 }}>No admins yet.</div>
          : (
            <div className="admin-list" style={{ marginBottom: 16 }}>
              {admins.map(a => (
                <div
                  key={a.id}
                  className={`admin-item ${selectedAdmin?.id === a.id ? "active" : ""}`}
                  onClick={() => selectAdmin(a)}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="admin-email" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</div>
                    <div className="admin-badge">{(a.allowed_devices || []).length} device(s) assigned</div>
                  </div>
                  <button className="btn-del" onClick={e => { e.stopPropagation(); handleDeleteAdmin(a.id, a.email) }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Create new admin */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <div className="as-title" style={{ marginBottom: 10 }}>ADD ADMIN</div>
            <form onSubmit={handleCreateAdmin} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input className="as-input" type="email" placeholder="admin@example.com"
                value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input className="as-input" type={showNewPw ? "text" : "password"}
                  placeholder="Password" style={{ paddingRight: 40 }}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <button type="button" onClick={() => setShowNewPw(v => !v)}
                  style={{ position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: 0.6 }}>
                  {showNewPw ? "🙈" : "👁"}
                </button>
              </div>
              <button className="btn-save" type="submit" disabled={creating}>
                {creating ? "CREATING..." : "+ CREATE ADMIN"}
              </button>
            </form>
          </div>
        </div>

        {/* Right — device assignment for selected admin */}
        <div className="as-card">
          <div className="as-title">
            {selectedAdmin ? `ASSIGN DEVICES — ${selectedAdmin.email}` : "DEVICE ASSIGNMENT"}
          </div>

          {!selectedAdmin ? (
            <div className="select-hint">← Select an admin to assign devices</div>
          ) : loadingDevices ? (
            <div className="empty-msg">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="empty-msg">No devices registered yet.</div>
          ) : (
            <>
              <p className="as-desc">
                Tick the vending machines this admin can access, manage playlists for, and set priorities on.
              </p>
              <div className="device-list">
                {devices.map(d => {
                  const isChecked = assignedIds.includes(d.id)
                  return (
                    <div key={d.id} className={`device-item ${isChecked ? "checked" : ""}`} onClick={() => toggleDevice(d.id)}>
                      <div className={`check-box ${isChecked ? "checked" : ""}`}>{isChecked ? "✓" : ""}</div>
                      <div>
                        <div className="device-name">{d.name}</div>
                        <div className="device-id">{d.id}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button className="btn-save" onClick={handleSaveAssignment}>
                SAVE ASSIGNMENT →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
