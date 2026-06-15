import React, { useState } from "react";
import api from "@/lib/api";

export default function ConnectYoutubeButton({ onLoadingStateChange, onConnectSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    if (onLoadingStateChange) onLoadingStateChange(true);

    try {
      const response = await api.get("/youtube/auth-url");
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Google OAuth URL not returned from backend");
      }
    } catch (err) {
      console.error("Failed to fetch Google OAuth URL:", err);
      setError(
        err.response?.data?.message ||
        "Failed to initialize YouTube connection. Please try again."
      );
      if (onLoadingStateChange) onLoadingStateChange(false);
      setLoading(false);
    }
  };

  // ── Setup Guide Modal ──────────────────────────────────────────
  if (showSetupGuide) {
    return (
      <div className="yt-setup-guide">
        <style>{`
          .yt-setup-guide {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 0, 0, 0.12);
            border-radius: 24px;
            backdrop-filter: blur(16px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            animation: floatInYt 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }

          @keyframes floatInYt {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .yt-guide-header {
            background: linear-gradient(135deg, rgba(255,0,0,0.08), rgba(255,0,0,0.03));
            border-bottom: 1px solid rgba(255,0,0,0.08);
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .yt-guide-header-icon {
            width: 40px; height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, #ff0000, #cc0000);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(255,0,0,0.3);
            flex-shrink: 0;
          }

          .yt-guide-header h3 {
            margin: 0; font-size: 16px; font-weight: 800;
            color: #fff; font-family: var(--font-primary, sans-serif);
          }
          .yt-guide-header p {
            margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.45);
          }

          .yt-guide-body {
            padding: 20px 24px;
            display: flex; flex-direction: column; gap: 14px;
          }

          .yt-step {
            display: flex; gap: 12px; align-items: flex-start;
            padding: 14px 16px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 14px;
            transition: border-color 0.2s, background 0.2s;
          }
          .yt-step:hover {
            border-color: rgba(255,0,0,0.15);
            background: rgba(255,0,0,0.03);
          }

          .yt-step-num {
            width: 28px; height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff0000, #cc0000);
            color: #fff; font-size: 12px; font-weight: 800;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(255,0,0,0.25);
          }

          .yt-step-content h4 {
            margin: 0 0 3px; font-size: 13px; font-weight: 700; color: #fff;
          }
          .yt-step-content p {
            margin: 0; font-size: 11.5px; color: rgba(255,255,255,0.45); line-height: 1.55;
          }
          .yt-step-content code {
            background: rgba(255,0,0,0.08);
            border: 1px solid rgba(255,0,0,0.15);
            border-radius: 6px;
            padding: 2px 8px;
            font-size: 11px;
            color: #ff6666;
            font-family: 'Courier New', monospace;
            user-select: all;
          }

          .yt-guide-footer {
            padding: 16px 24px 20px;
            display: flex; flex-direction: column; gap: 10px;
            border-top: 1px solid rgba(255,255,255,0.04);
          }

          .yt-btn-cloud {
            width: 100%; padding: 14px 20px;
            border: 1.5px solid rgba(255,0,0,0.25); border-radius: 14px;
            background: rgba(255,0,0,0.06);
            color: #ff4444; font-weight: 700; font-size: 14px;
            font-family: var(--font-ui, sans-serif);
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; gap: 10px;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          }
          .yt-btn-cloud:hover {
            background: rgba(255,0,0,0.12);
            border-color: rgba(255,0,0,0.45);
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(255,0,0,0.15);
          }

          .yt-btn-connect {
            width: 100%; padding: 14px 28px;
            border: none; border-radius: 14px;
            background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
            color: white; font-weight: 700; font-size: 15px;
            font-family: var(--font-ui, sans-serif);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            box-shadow: 0 6px 20px rgba(255, 0, 0, 0.25);
            display: flex; align-items: center; justify-content: center; gap: 10px;
          }
          .yt-btn-connect:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(255, 0, 0, 0.45);
          }
          .yt-btn-connect:disabled {
            background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3);
            cursor: not-allowed; box-shadow: none;
          }

          .yt-btn-back {
            width: 100%; padding: 10px;
            border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
            background: transparent;
            color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 600;
            cursor: pointer; transition: all 0.2s;
          }
          .yt-btn-back:hover {
            color: rgba(255,255,255,0.7);
            border-color: rgba(255,255,255,0.15);
          }

          .yt-divider-line {
            display: flex; align-items: center; gap: 10px;
            color: rgba(255,255,255,0.15); font-size: 10px;
            text-transform: uppercase; letter-spacing: 0.12em;
          }
          .yt-divider-line::before, .yt-divider-line::after {
            content: ""; flex: 1; height: 1px; background: rgba(255,255,255,0.06);
          }

          .yt-error {
            margin: 0 24px 16px; font-size: 13px; color: #f87171;
            background: rgba(239, 68, 68, 0.06);
            border: 1px solid rgba(239, 68, 68, 0.15);
            padding: 10px 14px; border-radius: 10px; text-align: left;
          }

          .yt-spinner {
            width: 18px; height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white; border-radius: 50%;
            animation: yt-spin 0.6s linear infinite; flex-shrink: 0;
          }
          @keyframes yt-spin { to { transform: rotate(360deg); } }

          .yt-note-box {
            display: flex; align-items: flex-start; gap: 8px;
            padding: 10px 14px;
            background: rgba(250,204,21,0.05);
            border: 1px solid rgba(250,204,21,0.12);
            border-radius: 10px;
            font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.5;
          }
          .yt-note-box svg { flex-shrink: 0; margin-top: 1px; }
        `}</style>

        {/* Header */}
        <div className="yt-guide-header">
          <div className="yt-guide-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <h3>YouTube Setup Guide</h3>
            <p>Complete these one-time steps before connecting</p>
          </div>
        </div>

        {/* Steps */}
        <div className="yt-guide-body">
          <div className="yt-step">
            <div className="yt-step-num">1</div>
            <div className="yt-step-content">
              <h4>Open Google Cloud Console</h4>
              <p>Click the <strong>"Go to Google Cloud Console"</strong> button below to open the OAuth consent screen settings.</p>
            </div>
          </div>

          <div className="yt-step">
            <div className="yt-step-num">2</div>
            <div className="yt-step-content">
              <h4>Add Yourself as a Test User</h4>
              <p>Go to <strong>Audience → Test Users</strong> section and click <strong>"+ ADD USERS"</strong>. Enter your Gmail address that's linked to your YouTube channel.</p>
            </div>
          </div>

          <div className="yt-step">
            <div className="yt-step-num">3</div>
            <div className="yt-step-content">
              <h4>Verify Redirect URI</h4>
              <p>In <strong>Credentials → OAuth Client ID</strong>, make sure this redirect URI is added:</p>
              <div style={{ marginTop: 6 }}>
                <code>http://localhost:5000/api/youtube/callback</code>
              </div>
            </div>
          </div>

          <div className="yt-step">
            <div className="yt-step-num">4</div>
            <div className="yt-step-content">
              <h4>Come Back & Connect</h4>
              <p>After saving, come back here and click <strong>"Sign in with Google"</strong>. Select your Google account and allow access. Done! 🎉</p>
            </div>
          </div>

          <div className="yt-note-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>This is a <strong>one-time setup</strong>. Once configured, you can connect/disconnect anytime without repeating these steps. When a warning appears on Google's page, click <strong>"Continue"</strong> — it's safe for testing.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="yt-guide-footer">
          <button
            className="yt-btn-cloud"
            onClick={() => window.open("https://console.cloud.google.com/apis/credentials/consent", "_blank")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Go to Google Cloud Console
          </button>

          <div className="yt-divider-line">setup complete? connect below</div>

          <button
            className="yt-btn-connect"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="yt-spinner" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <button className="yt-btn-back" onClick={() => setShowSetupGuide(false)}>
            ← Back
          </button>
        </div>

        {error && <div className="yt-error">⚠ {error}</div>}
      </div>
    );
  }

  // ── Default View: Connect Button ────────────────────────────────
  return (
    <div className="yt-connect-wrapper">
      <style>{`
        .yt-connect-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 36px 28px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 0, 0, 0.08);
          border-radius: 24px;
          backdrop-filter: blur(16px);
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          animation: floatInYt 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes floatInYt {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .yt-logo-ring {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 25px rgba(255, 0, 0, 0.35);
          margin-bottom: 24px;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .yt-connect-wrapper:hover .yt-logo-ring {
          transform: scale(1.1) rotate(4deg);
          box-shadow: 0 15px 35px rgba(255, 0, 0, 0.55);
        }

        .yt-connect-title {
          font-family: var(--font-primary, sans-serif);
          font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 8px;
        }
        .yt-connect-sub {
          font-size: 14px; color: rgba(255,255,255,0.6);
          line-height: 1.55; margin: 0 0 28px;
        }

        .yt-btn-primary {
          width: 100%; padding: 16px 28px;
          border: none; border-radius: 14px;
          background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
          color: white; font-weight: 700; font-size: 15px;
          font-family: var(--font-ui, sans-serif);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 6px 20px rgba(255, 0, 0, 0.25);
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .yt-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(255, 0, 0, 0.45);
        }

        .yt-secure-note {
          display: flex; align-items: center; gap: 6px;
          margin-top: 18px; font-size: 11.5px;
          color: rgba(255,255,255,0.35); line-height: 1.5;
        }
      `}</style>

      {/* YouTube Logo */}
      <div className="yt-logo-ring">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>

      <h3 className="yt-connect-title">Connect YouTube</h3>
      <p className="yt-connect-sub">
        Sign in with Google to securely connect your own YouTube channel. Only you can link your account.
      </p>

      <button className="yt-btn-primary" onClick={() => setShowSetupGuide(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Connect YouTube Channel</span>
      </button>

      <div className="yt-secure-note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Secured by Google OAuth 2.0 — we never see your password</span>
      </div>
    </div>
  );
}
