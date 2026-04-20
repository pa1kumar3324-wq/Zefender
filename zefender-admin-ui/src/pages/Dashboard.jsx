import { useState } from "react"
import Ads from "./Ads"
import Playlists from "./Playlists"
import Monitor from "./Monitor"

const NAV = [
  { id: "ads", label: "ADS", icon: "▦" },
  { id: "playlists", label: "PLAYLISTS", icon: "≡" },
  { id: "monitor", label: "MONITOR & LIVE FEED", icon: "🖥️" },
]

export default function Dashboard() {
  const [page, setPage] = useState("ads")
  const [theme, setTheme] = useState("dark")

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

  return (
    <div className={`dash-root ${theme === "light" ? "light-theme" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        
        :root {
          --bg: #050507;
          --panel: #0a0a12;
          --border: rgba(99,102,241,0.15);
          --text: #e2e8f0;
          --text-muted: #4f4f7a;
          --accent: #6366f1;
          --accent-glow: rgba(99,102,241,0.4);
          --grid: rgba(99,102,241,0.02);
          --card: #0d0d18;
          --field: #13131f;
        }

        .light-theme {
          --bg: #f8fafc;
          --panel: #ffffff;
          --border: rgba(99,102,241,0.1);
          --text: #1e293b;
          --text-muted: #64748b;
          --accent: #4f46e5;
          --accent-glow: rgba(79,70,229,0.2);
          --grid: rgba(79,70,229,0.03);
          --card: #ffffff;
          --field: #f1f5f9;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Space Mono', monospace;
          color: var(--text);
          transition: background 0.3s, color 0.3s;
        }

        /* Sidebar */
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          transition: background 0.3s, border-color 0.3s;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px 24px;
          border-bottom: 1px solid rgba(99,102,241,0.1);
          margin-bottom: 20px;
        }

        .logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 800; color: white;
          box-shadow: 0 0 14px rgba(99,102,241,0.4);
          flex-shrink: 0;
        }

        .logo-text { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: 0.1em; }
        .logo-sub { font-size: 8px; color: var(--accent); letter-spacing: 0.18em; margin-top: 1px; }

        .nav-section {
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.2em;
          padding: 0 20px;
          margin-bottom: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 20px;
          cursor: pointer;
          transition: all 0.15s;
          border-left: 2px solid transparent;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }

        .nav-item:hover { color: var(--accent); background: rgba(99,102,241,0.05); }

        .nav-item.active {
          color: var(--accent);
          background: rgba(99,102,241,0.08);
          border-left-color: var(--accent);
        }

        .nav-icon { font-size: 14px; width: 20px; text-align: center; }

        .sidebar-bottom {
          margin-top: auto;
          padding: 16px 20px;
          border-top: 1px solid rgba(99,102,241,0.1);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          background: none;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 7px;
          padding: 9px 12px;
          color: #f87171;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.15s;
        }

        .logout-btn:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.4); }

        /* Main */
        .main {
          margin-left: 220px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .topbar {
          height: 56px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 10;
          transition: background 0.3s, border-color 0.3s;
        }

        .topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: 0.06em;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .theme-toggle {
          background: none;
          border: 1px solid var(--border);
          border-radius: 8px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--text);
          font-size: 14px;
          transition: all 0.2s;
        }

        .theme-toggle:hover {
          background: rgba(99,102,241,0.1);
          border-color: var(--accent);
        }

        .online-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 20px;
          padding: 4px 10px;
          color: #10b981;
          font-size: 10px;
        }

        .online-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 5px #10b981;
          animation: blink 2s infinite;
        }

        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.4} }

        .page-body {
          flex: 1;
          padding: 28px;
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">Z</div>
          <div>
            <div className="logo-text">ZEFENDER</div>
            <div className="logo-sub">CONTROL CENTER</div>
          </div>
        </div>

        <div className="nav-section">NAVIGATION</div>
        {NAV.map(n => (
          <div
            key={n.id}
            className={`nav-item ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </div>
        ))}

        <div className="sidebar-bottom">
          {/* Logout removed — auth pending founder discussion */}
        </div>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">
            {NAV.find(n => n.id === page)?.icon} &nbsp;
            {NAV.find(n => n.id === page)?.label}
          </div>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Switch Theme">
              {theme === "dark" ? "☀" : "🌙"}
            </button>
            <div className="online-badge">
              <div className="online-dot" />
              BACKEND ONLINE
            </div>
            <span>PORT 5000</span>
          </div>
        </div>

        <div className="page-body">
          {page === "ads" && <Ads />}
          {page === "playlists" && <Playlists />}
          {page === "monitor" && <Monitor />}
        </div>
      </div>
    </div>
  )
}
