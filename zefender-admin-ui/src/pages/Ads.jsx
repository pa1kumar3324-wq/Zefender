import { useState, useEffect, useRef } from "react"
import { api } from "../api"

export default function Ads() {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [file, setFile] = useState(null)
  const [toast, setToast] = useState(null)
  const fileRef = useRef()

  const client = api()

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadAds = async () => {
    setLoading(true)
    try {
      const res = await client.getAds()
      setAds(res.data)
    } catch { showToast("Failed to load ads", "err") }
    setLoading(false)
  }

  useEffect(() => { loadAds() }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!title || !file) return showToast("Title and file required", "err")
    setUploading(true)
    const fd = new FormData()
    fd.append("title", title)
    fd.append("file", file)
    try {
      await client.uploadAd(fd)
      showToast("Ad uploaded successfully!")
      setTitle("")
      setFile(null)
      fileRef.current.value = ""
      loadAds()
    } catch (err) {
      showToast(err.response?.data?.message || "Upload failed", "err")
    }
    setUploading(false)
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await client.deleteAd(id)
      showToast("Ad deleted")
      loadAds()
    } catch { showToast("Delete failed", "err") }
  }

  const handleToggle = async (id) => {
    try {
      await client.toggleAd(id)
      showToast("Ad status updated")
      loadAds()
    } catch { showToast("Toggle failed", "err") }
  }

  return (
    <div className="ads-root">
      <style>{`
        .ads-root { display: flex; flex-direction: column; gap: 24px; }

        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }

        .section-title {
          font-size: 10px; letter-spacing: 0.2em;
          color: var(--accent); font-family: 'Space Mono', monospace;
        }

        .count-badge {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 10px;
          color: #a5b4fc;
        }

        /* Upload card */
        .upload-card {
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

        .upload-form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .field-wrap { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 180px; }

        .field-label {
          font-size: 9px; letter-spacing: 0.18em;
          color: var(--accent); font-family: 'Space Mono', monospace;
        }

        .field-input {
          background: var(--field);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }

        .field-input:focus { border-color: #6366f1; }
        .field-input::placeholder { color: #3f3f5a; }

        .file-label {
          display: flex; align-items: center; gap: 8px;
          background: var(--field);
          border: 1px dashed var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 11px;
          color: var(--text-muted);
          transition: all 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .file-label:hover { border-color: #6366f1; color: #a5b4fc; }
        .file-label.has-file { border-color: rgba(16,185,129,0.4); color: #10b981; }

        .upload-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-family: 'Space Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          box-shadow: 0 0 16px rgba(99,102,241,0.25);
        }

        .upload-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Ads grid */
        .ads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .ad-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
          transition: border-color 0.2s, transform 0.15s;
          animation: fadeUp 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .ad-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .ad-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
        .ad-card:hover::before { opacity: 1; }
        .ad-card.inactive { opacity: 0.5; }

        .ad-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 10px;
          margin-bottom: 14px;
        }

        .ad-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 800;
          color: var(--text);
          word-break: break-word;
        }

        .ad-status {
          flex-shrink: 0;
          font-size: 9px; letter-spacing: 0.14em;
          padding: 3px 8px; border-radius: 20px;
          font-family: 'Space Mono', monospace;
        }

        .ad-status.active {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          color: #10b981;
        }

        .ad-status.inactive {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
        }

        .ad-url {
          font-size: 10px; color: var(--text-muted);
          font-family: 'Space Mono', monospace;
          overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 14px;
        }

        .ad-actions { display: flex; gap: 8px; }

        .btn-toggle {
          flex: 1;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 7px;
          padding: 7px;
          color: #a5b4fc;
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-toggle:hover { background: rgba(99,102,241,0.15); border-color: #6366f1; }

        .btn-delete {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 7px;
          padding: 7px 12px;
          color: #f87171;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-delete:hover { background: rgba(239,68,68,0.15); border-color: #ef4444; }

        /* Empty */
        .empty-state {
          text-align: center; padding: 60px 20px;
          color: var(--text-muted); font-size: 12px; line-height: 2;
          border: 1px dashed var(--border);
          border-radius: 12px;
        }

        .empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.3; }

        /* Loading */
        .loading-row {
          display: flex; gap: 14px;
        }

        .skeleton {
          background: linear-gradient(90deg, var(--card) 25%, var(--field) 50%, var(--card) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          height: 140px; flex: 1;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Toast */
        .toast {
          position: fixed; bottom: 24px; right: 24px;
          padding: 12px 20px; border-radius: 10px;
          font-family: 'Space Mono', monospace; font-size: 12px;
          animation: toastIn 0.25s ease;
          z-index: 9999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .toast.ok {
          background: #0d1f14;
          border: 1px solid rgba(16,185,129,0.3);
          color: #10b981;
        }

        .toast.err {
          background: #1f0d0d;
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Upload */}
      <div className="upload-card">
        <div className="section-header">
          <div className="section-title">UPLOAD NEW AD</div>
        </div>
        <form className="upload-form" onSubmit={handleUpload}>
          <div className="field-wrap">
            <label className="field-label">AD TITLE</label>
            <input
              className="field-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Summer Promo 2026"
            />
          </div>
          <div className="field-wrap" style={{ maxWidth: 220 }}>
            <label className="field-label">FILE</label>
            <label className={`file-label ${file ? "has-file" : ""}`}>
              {file ? `✓ ${file.name}` : "📎 SELECT FILE"}
              <input
                type="file"
                ref={fileRef}
                style={{ display: "none" }}
                accept="video/*,image/*"
                onChange={e => setFile(e.target.files[0])}
              />
            </label>
          </div>
          <button className="upload-btn" type="submit" disabled={uploading}>
            {uploading ? "UPLOADING..." : "↑ UPLOAD"}
          </button>
        </form>
      </div>

      {/* Ads list */}
      <div>
        <div className="section-header">
          <div className="section-title">ALL ADS</div>
          <div className="count-badge">{ads.length} total</div>
        </div>

        {loading ? (
          <div className="loading-row">
            {[1,2,3].map(i => <div key={i} className="skeleton" />)}
          </div>
        ) : ads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            No ads uploaded yet.<br />Use the form above to upload your first ad!
          </div>
        ) : (
          <div className="ads-grid">
            {ads.map(ad => (
              <div key={ad.id} className={`ad-card ${ad.active ? "" : "inactive"}`}>
                <div className="ad-card-top">
                  <div className="ad-title">{ad.title}</div>
                  <div className={`ad-status ${ad.active ? "active" : "inactive"}`}>
                    {ad.active ? "ACTIVE" : "INACTIVE"}
                  </div>
                </div>
                <div className="ad-url">{ad.file_url}</div>
                <div className="ad-actions">
                  <button className="btn-toggle" onClick={() => handleToggle(ad.id)}>
                    {ad.active ? "DEACTIVATE" : "ACTIVATE"}
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(ad.id, ad.title)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
