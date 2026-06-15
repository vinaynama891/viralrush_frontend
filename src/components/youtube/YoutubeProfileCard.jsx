import React, { useState } from "react";
import api from "@/lib/api";

export default function YoutubeProfileCard({ profile, onDisconnectSuccess }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      localStorage.removeItem("yt_connected");
      await api.post("/youtube/disconnect");
      if (onDisconnectSuccess) {
        onDisconnectSuccess();
      }
    } catch (err) {
      console.error("Failed to disconnect YouTube:", err);
      if (onDisconnectSuccess) {
        onDisconnectSuccess();
      }
    } finally {
      setDisconnecting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="youtube-profile-card">
      <style>{`
        .youtube-profile-card {
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

        .youtube-profile-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 0, 0, 0.25);
          box-shadow: 0 15px 40px rgba(255, 0, 0, 0.08);
        }

        .youtube-profile-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #ff0000, #cc0000);
        }

        .yt-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .yt-card-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .yt-status-badge {
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

        .yt-status-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
          animation: yt-pulse 2s infinite;
        }

        @keyframes yt-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .yt-user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .yt-avatar-ring {
          padding: 3px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ff0000, #cc0000, #990000);
          display: inline-block;
          box-shadow: 0 8px 20px rgba(255, 0, 0, 0.15);
        }

        .yt-avatar-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #141414;
          object-fit: cover;
          background: #222;
        }

        .yt-user-info {
          display: flex;
          flex-direction: column;
        }

        .yt-username {
          font-family: var(--font-primary, sans-serif);
          font-size: 18px;
          font-weight: 800;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .yt-handle-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 2px;
        }

        .yt-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 18px;
        }

        .yt-stat-box {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .yt-stat-val {
          font-family: var(--font-primary, sans-serif);
          font-size: 20px;
          font-weight: 850;
          color: white;
        }

        .yt-stat-lbl {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .yt-action-bar {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }

        .yt-btn-danger-outline {
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

        .yt-btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.16);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }

        .yt-btn-manage {
          padding: 8px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.25);
          border-radius: 10px;
          color: #ff4d4d;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .yt-btn-manage:hover {
          background: rgba(255, 0, 0, 0.12);
          border-color: rgba(255, 0, 0, 0.45);
          color: #ff6666;
        }

        .yt-confirm-overlay {
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

        .yt-confirm-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .yt-confirm-actions {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .yt-confirm-btn-yes {
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

        .yt-confirm-btn-yes:hover {
          background: #dc2626;
        }

        .yt-confirm-btn-no {
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

        .yt-confirm-btn-no:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>

      {showConfirm && (
        <div className="yt-confirm-overlay">
          <p className="yt-confirm-text">
            Are you sure you want to disconnect YouTube channel "{profile.title}"? This will disable YouTube Studio features.
          </p>
          <div className="yt-confirm-actions">
            <button className="yt-confirm-btn-no" onClick={() => setShowConfirm(false)} disabled={disconnecting}>
              Cancel
            </button>
            <button className="yt-confirm-btn-yes" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? "Disconnecting..." : "Yes, Disconnect"}
            </button>
          </div>
        </div>
      )}

      <div className="yt-card-header">
        <div className="yt-card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#ff0000" }}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93 .502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          YouTube Channel
        </div>
        <div className="yt-status-badge">
          <span className="yt-status-dot" />
          CONNECTED
        </div>
      </div>

      <div className="yt-user-profile">
        <div className="yt-avatar-ring">
          <img
            src={profile.thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop"}
            alt={profile.title}
            className="yt-avatar-img"
          />
        </div>
        <div className="yt-user-info">
          <h4 className="yt-username">
            {profile.title}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#3897f0" stroke="#3897f0" strokeWidth="0">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </h4>
          <span className="yt-handle-sub">YouTube Content Creator</span>
        </div>
      </div>

      <div className="yt-stats-row">
        <div className="yt-stat-box">
          <div className="yt-stat-val">{(parseInt(profile.subscriberCount) || 0).toLocaleString()}</div>
          <div className="yt-stat-lbl">Subscribers</div>
        </div>
        <div className="yt-stat-box">
          <div className="yt-stat-val">{(parseInt(profile.videoCount) || 0).toLocaleString()}</div>
          <div className="yt-stat-lbl">Videos</div>
        </div>
      </div>

      <div className="yt-action-bar">
        <button
          className="yt-btn-manage"
          onClick={() => window.dispatchEvent(new CustomEvent("viralrush_navigate", { detail: "youtube" }))}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Studio
        </button>
        <button className="yt-btn-danger-outline" onClick={() => setShowConfirm(true)}>
          Disconnect
        </button>
      </div>
    </div>
  );
}
