import React, { useState } from "react";

export default function FacebookProfileCard({ onDisconnect }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDisconnect = () => {
    setDisconnecting(true);
    setTimeout(() => {
      setDisconnecting(false);
      setShowConfirm(false);
      if (onDisconnect) {
        onDisconnect();
      }
    }, 600);
  };

  return (
    <div className="facebook-profile-card">
      <style>{`
        .facebook-profile-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .facebook-profile-card:hover {
          transform: translateY(-2px);
          border-color: rgba(24, 119, 242, 0.25);
          box-shadow: 0 15px 40px rgba(24, 119, 242, 0.08);
        }

        .facebook-profile-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #1877f2, #0a5bc4);
        }

        .fb-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .fb-card-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .fb-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 4px 10px;
          border-radius: 50px;
        }

        .fb-status-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
          animation: fb-pulse 2s infinite;
        }

        @keyframes fb-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .fb-user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .fb-avatar-ring {
          padding: 3px;
          border-radius: 50%;
          background: linear-gradient(45deg, #1877f2, #0a5bc4, #084391);
          display: inline-block;
          box-shadow: 0 8px 20px rgba(24, 119, 242, 0.15);
        }

        .fb-avatar-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #141414;
          object-fit: cover;
          background: #222;
        }

        .fb-user-info {
          display: flex;
          flex-direction: column;
        }

        .fb-username {
          font-family: var(--font-primary, sans-serif);
          font-size: 18px;
          font-weight: 800;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .fb-handle-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 2px;
        }

        .fb-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 18px;
        }

        .fb-stat-box {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .fb-stat-val {
          font-family: var(--font-primary, sans-serif);
          font-size: 20px;
          font-weight: 850;
          color: white;
        }

        .fb-stat-lbl {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .fb-action-bar {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }

        .fb-btn-danger-outline {
          padding: 8px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #f87171;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fb-btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.16);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }

        .fb-btn-manage {
          padding: 8px 16px;
          background: rgba(24, 119, 242, 0.08);
          border: 1px solid rgba(24, 119, 242, 0.25);
          border-radius: 10px;
          color: #4c94ff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .fb-btn-manage:hover {
          background: rgba(24, 119, 242, 0.16);
          border-color: rgba(24, 119, 242, 0.45);
          color: #70aaff;
        }

        .fb-confirm-overlay {
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 16px;
          position: absolute;
          inset: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          z-index: 10;
          animation: confirmFade 0.2s ease;
        }

        @keyframes confirmFade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .fb-confirm-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .fb-confirm-actions {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .fb-confirm-btn-yes {
          flex: 1;
          padding: 10px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .fb-confirm-btn-yes:hover {
          background: #dc2626;
        }

        .fb-confirm-btn-no {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .fb-confirm-btn-no:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>

      {showConfirm && (
        <div className="fb-confirm-overlay">
          <p className="fb-confirm-text">
            Are you sure you want to disconnect Facebook Page "ViralRush Creator Page"? This will disable auto-replies.
          </p>
          <div className="fb-confirm-actions">
            <button className="fb-confirm-btn-no" onClick={() => setShowConfirm(false)} disabled={disconnecting}>
              Cancel
            </button>
            <button className="fb-confirm-btn-yes" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? "Disconnecting..." : "Yes, Disconnect"}
            </button>
          </div>
        </div>
      )}

      <div className="fb-card-header">
        <div className="fb-card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#1877f2" }}>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook Page
        </div>
        <div className="fb-status-badge">
          <span className="fb-status-dot" />
          CONNECTED
        </div>
      </div>

      <div className="fb-user-profile">
        <div className="fb-avatar-ring">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop"
            alt="ViralRush Creator Page"
            className="fb-avatar-img"
          />
        </div>
        <div className="fb-user-info">
          <h4 className="fb-username">
            ViralRush Creator Page
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#3897f0" stroke="#3897f0" strokeWidth="0">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </h4>
          <span className="fb-handle-sub">Facebook Creator Page</span>
        </div>
      </div>

      <div className="fb-stats-row">
        <div className="fb-stat-box">
          <div className="fb-stat-val">14,820</div>
          <div className="fb-stat-lbl">Likes</div>
        </div>
        <div className="fb-stat-box">
          <div className="fb-stat-val">84,300</div>
          <div className="fb-stat-lbl">Weekly Reach</div>
        </div>
      </div>

      <div className="fb-action-bar">
        <button
          className="fb-btn-manage"
          onClick={() => alert("Facebook Page management is active. Automations running.")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Manage
        </button>
        <button className="fb-btn-danger-outline" onClick={() => setShowConfirm(true)}>
          Disconnect
        </button>
      </div>
    </div>
  );
}
