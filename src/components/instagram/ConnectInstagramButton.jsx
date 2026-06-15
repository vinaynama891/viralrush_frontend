import React, { useState } from "react";
import api from "@/lib/api";

export default function ConnectInstagramButton({ onLoadingStateChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/instagram/auth");
      if (response.data?.url) {
        // Redirect user to Meta authorization page
        window.location.href = response.data.url;
      } else {
        throw new Error("Meta OAuth URL not returned from backend");
      }
    } catch (err) {
      console.error("Failed to connect Instagram:", err);
      setError(err.response?.data?.message || "Failed to initiate Instagram login. Please try again.");
      if (onLoadingStateChange) onLoadingStateChange(false);
      setLoading(false);
    }
  };

  return (
    <div className="instagram-connect-container">
      <style>{`
        .instagram-connect-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          backdrop-filter: blur(16px);
          max-width: 480px;
          margin: 0 auto;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ig-badge-logo {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: white;
          margin-bottom: 24px;
          box-shadow: 0 10px 25px rgba(220, 39, 67, 0.4);
          transition: all 0.5s ease;
        }

        .instagram-connect-container:hover .ig-badge-logo {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 15px 35px rgba(220, 39, 67, 0.6);
        }

        .ig-title {
          font-family: var(--font-primary, sans-serif);
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .ig-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
          margin-bottom: 32px;
        }

        .ig-connect-btn {
          width: 100%;
          padding: 16px 28px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          color: white;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 6px 20px rgba(220, 39, 67, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .ig-connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(220, 39, 67, 0.45);
          filter: brightness(1.05);
        }

        .ig-connect-btn:active {
          transform: translateY(1px);
        }

        .ig-connect-btn:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .ig-error-msg {
          margin-top: 16px;
          font-size: 13px;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px 14px;
          border-radius: 10px;
          width: 100%;
        }

        .spinner-mini {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: ig-spin 0.6s linear infinite;
        }

        @keyframes ig-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="ig-badge-logo">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </div>

      <h3 className="ig-title">Connect Instagram</h3>
      <p className="ig-subtitle">
        Link your Instagram Creator or Business Account to VIRALRUSH to enable AI auto-replies, track live analytics, and manage DMs and comments directly.
      </p>

      <button className="ig-connect-btn" onClick={handleConnect} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-mini" />
            <span>Connecting to Meta...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            <span>Connect Instagram</span>
          </>
        )}
      </button>

      {error && <div className="ig-error-msg">{error}</div>}
    </div>
  );
}
