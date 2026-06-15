import React, { useState } from "react";
import api from "@/lib/api";

export default function InstagramProfileCard({ profile, onDisconnectSuccess }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await api.post("/instagram/disconnect");
      if (onDisconnectSuccess) {
        onDisconnectSuccess();
      }
    } catch (err) {
      console.error("Failed to disconnect Instagram:", err);
      alert("Failed to disconnect account. Please try again.");
    } finally {
      setDisconnecting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="instagram-profile-card">
      <style>{`
        .instagram-profile-card {
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

        .instagram-profile-card:hover {
          transform: translateY(-2px);
          border-color: rgba(220, 39, 67, 0.25);
          box-shadow: 0 15px 40px rgba(220, 39, 67, 0.08);
        }

        .instagram-profile-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #dc2743, #bc1888);
        }

        .ig-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .ig-card-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ig-status-badge {
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

        .ig-status-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
          animation: ig-pulse 2s infinite;
        }

        @keyframes ig-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .ig-user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .ig-avatar-ring {
          padding: 3px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);
          display: inline-block;
          box-shadow: 0 8px 20px rgba(220, 39, 67, 0.15);
        }

        .ig-avatar-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #141414;
          object-fit: cover;
          background: #222;
        }

        .ig-user-info {
          display: flex;
          flex-direction: column;
        }

        .ig-username {
          font-family: var(--font-primary, sans-serif);
          font-size: 18px;
          font-weight: 800;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ig-handle-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 2px;
        }

        .ig-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 18px;
        }

        .ig-stat-box {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .ig-stat-val {
          font-family: var(--font-primary, sans-serif);
          font-size: 20px;
          font-weight: 850;
          color: white;
        }

        .ig-stat-lbl {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ig-action-bar {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }

        .ig-btn-danger-outline {
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

        .ig-btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.16);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }

        .ig-btn-manage {
          padding: 8px 16px;
          background: rgba(236, 72, 153, 0.08);
          border: 1px solid rgba(236, 72, 153, 0.25);
          border-radius: 10px;
          color: #f472b6;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ig-btn-manage:hover {
          background: rgba(236, 72, 153, 0.16);
          border-color: rgba(236, 72, 153, 0.45);
          color: #f9a8d4;
        }

        .ig-confirm-overlay {
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

        .ig-confirm-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .ig-confirm-actions {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .ig-confirm-btn-yes {
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

        .ig-confirm-btn-yes:hover {
          background: #dc2626;
        }

        .ig-confirm-btn-no {
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

        .ig-confirm-btn-no:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>

      {showConfirm && (
        <div className="ig-confirm-overlay">
          <p className="ig-confirm-text">
            Are you sure you want to disconnect @{profile.username}? This will delete access tokens and disable DM auto-replies.
          </p>
          <div className="ig-confirm-actions">
            <button className="ig-confirm-btn-no" onClick={() => setShowConfirm(false)} disabled={disconnecting}>
              Cancel
            </button>
            <button className="ig-confirm-btn-yes" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? "Disconnecting..." : "Yes, Disconnect"}
            </button>
          </div>
        </div>
      )}

      <div className="ig-card-header">
        <div className="ig-card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          Instagram Account
        </div>
        <div className="ig-status-badge">
          <span className="ig-status-dot" />
          CONNECTED
        </div>
      </div>

      <div className="ig-user-profile">
        <div className="ig-avatar-ring">
          <img
            src={profile.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150"}
            alt={profile.username}
            className="ig-avatar-img"
          />
        </div>
        <div className="ig-user-info">
          <h4 className="ig-username">
            {profile.username}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#3897f0" stroke="#3897f0" strokeWidth="0">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </h4>
          <span className="ig-handle-sub">Instagram Professional</span>
        </div>
      </div>

      <div className="ig-stats-row">
        <div className="ig-stat-box">
          <div className="ig-stat-val">{(profile.followersCount || 0).toLocaleString()}</div>
          <div className="ig-stat-lbl">Followers</div>
        </div>
        <div className="ig-stat-box">
          <div className="ig-stat-val">{(profile.mediaCount || 0).toLocaleString()}</div>
          <div className="ig-stat-lbl">Total Posts</div>
        </div>
      </div>

      <div className="ig-action-bar">
        <button
          className="ig-btn-manage"
          onClick={() => window.dispatchEvent(new CustomEvent("viralrush_navigate", { detail: "managevideos" }))}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Manage
        </button>
        <button className="ig-btn-danger-outline" onClick={() => setShowConfirm(true)}>
          Disconnect
        </button>
      </div>
    </div>
  );
}
