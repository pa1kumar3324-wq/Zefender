export default function RoleSelect({ onSuperAdmin, onAdmin, loading, error }) {
  return (
    <div className="rs-root">
      <div className="rs-bg">
        <div className="rs-grid" />
        <div className="rs-orb orb1" />
        <div className="rs-orb orb2" />
      </div>

      <div className="rs-center">
        <div className="rs-logo">
          <div className="rs-logo-icon">Z</div>
          <div>
            <div className="rs-logo-name">ZEFENDER</div>
            <div className="rs-logo-sub">AD CONTROL SYSTEM</div>
          </div>
        </div>

        <div className="rs-divider" />

        <div className="rs-title">SELECT YOUR ROLE</div>
        <div className="rs-subtitle">Choose how you want to access the system</div>

        <div className="rs-grid-cards">
          <button className="rs-card sa-card" onClick={onSuperAdmin} disabled={loading}>
            <div className="rs-card-icon">👑</div>
            <div className="rs-card-label">SUPER ADMIN</div>
            <div className="rs-card-desc">Full system access — manage ads, devices, admins and playlists</div>
            {error
              ? <div style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>{error}</div>
              : <div className="rs-card-arrow">{loading ? "..." : "→"}</div>}
          </button>

          <button className="rs-card admin-card" onClick={onAdmin} disabled={loading}>
            <div className="rs-card-icon">🛡</div>
            <div className="rs-card-label">ADMIN</div>
            <div className="rs-card-desc">Access your assigned machines and manage their playlists</div>
            <div className="rs-card-arrow">→</div>
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .rs-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #050507; font-family: 'Space Mono', monospace;
          position: relative; overflow: hidden;
        }

        .rs-bg { position: fixed; inset: 0; pointer-events: none; }
        .rs-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .rs-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
        .orb1 { width: 600px; height: 600px; background: #6366f1; top: -150px; left: -150px; animation: f1 8s ease-in-out infinite; }
        .orb2 { width: 500px; height: 500px; background: #8b5cf6; bottom: -150px; right: -150px; animation: f2 10s ease-in-out infinite; }
        @keyframes f1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,30px)} }
        @keyframes f2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-40px)} }

        .rs-center {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 680px; padding: 40px 20px;
        }

        .rs-logo { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .rs-logo-icon {
          width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: white;
          box-shadow: 0 0 24px rgba(99,102,241,0.4);
        }
        .rs-logo-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: 0.1em; }
        .rs-logo-sub  { font-size: 10px; color: #6366f1; letter-spacing: 0.2em; margin-top: 3px; }

        .rs-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent); margin-bottom: 32px; }

        .rs-title    { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 8px; letter-spacing: 0.05em; }
        .rs-subtitle { font-size: 12px; color: #4f4f7a; margin-bottom: 36px; letter-spacing: 0.1em; }

        .rs-grid-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; }

        .rs-card {
          display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
          padding: 28px 24px; border-radius: 16px; cursor: pointer;
          transition: all 0.2s; text-align: left;
          background: #0d0d18; border: 1px solid rgba(99,102,241,0.15);
          position: relative; overflow: hidden;
        }
        .rs-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.06), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .rs-card:hover::before { opacity: 1; }
        .rs-card:hover { transform: translateY(-4px); }

        .sa-card:hover    { border-color: #f59e0b; box-shadow: 0 8px 32px rgba(245,158,11,0.15); }
        .admin-card:hover { border-color: #6366f1; box-shadow: 0 8px 32px rgba(99,102,241,0.15); }

        .rs-card-icon  { font-size: 36px; }
        .rs-card-label { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; color: #e2e8f0; letter-spacing: 0.08em; }
        .rs-card-desc  { font-size: 11px; color: #4f4f7a; line-height: 1.6; flex: 1; }
        .rs-card-arrow { font-size: 18px; color: rgba(99,102,241,0.4); margin-top: 4px; transition: all 0.2s; }
        .rs-card:hover .rs-card-arrow { color: var(--accent, #6366f1); transform: translateX(4px); }
      `}</style>
    </div>
  )
}
