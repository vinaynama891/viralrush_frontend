import React, { useState } from "react";

export default function ConnectFacebookButton({ onConnect }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onConnect) {
        onConnect();
      }
    }, 850);
  };

  return (
    <div className="fb-connect-container">
      <style>{`
        .fb-connect-container {
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
          animation: fbFloatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fbFloatIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fb-badge-logo {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #1877f2 0%, #0a5bc4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: white;
          margin-bottom: 24px;
          box-shadow: 0 10px 25px rgba(24, 119, 242, 0.4);
          transition: all 0.5s ease;
        }

        .fb-connect-container:hover .fb-badge-logo {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 15px 35px rgba(24, 119, 242, 0.6);
        }

        .fb-title {
          font-family: var(--font-primary, sans-serif);
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .fb-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
          margin-bottom: 32px;
          min-height: 63px;
        }

        .fb-connect-btn {
          width: 100%;
          padding: 16px 28px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #1877f2 0%, #0a5bc4 100%);
          color: white;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 6px 20px rgba(24, 119, 242, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .fb-connect-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(24, 119, 242, 0.45);
          filter: brightness(1.05);
        }

        .fb-connect-btn:active:not(:disabled) {
          transform: translateY(1px);
        }

        .fb-connect-btn:disabled {
          background: rgba(255, 255, 255, 0.04) !important;
          color: rgba(255, 255, 255, 0.2) !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .spinner-mini {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: fb-spin 0.6s linear infinite;
        }

        @keyframes fb-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="fb-badge-logo">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>

      <h3 className="fb-title">Connect Facebook</h3>
      <p className="fb-subtitle">
        Link your Facebook Page to VIRALRUSH to power your AI chatbot, automate messenger sequences, and manage interactions.
      </p>

      <button className="fb-connect-btn" disabled={true} style={{ cursor: "not-allowed" }}>
        {loading ? (
          <>
            <span className="spinner-mini" />
            <span>Connecting to Facebook...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            <span>Connect Facebook</span>
          </>
        )}
      </button>
    </div>
  );
}
