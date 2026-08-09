import React, { useState } from "react";
import api from "@/lib/api";

export default function ConnectInstagramButton({ onLoadingStateChange, onConnectSuccess }) {
  const [activeTab, setActiveTab] = useState("username"); // "username" | "oauth"
  const [error, setError] = useState("");

  // Step 1: Username input
  const [usernameInput, setUsernameInput] = useState("");
  const [fetchingProfile, setFetchingProfile] = useState(false);

  // Step 2: Real profile preview
  const [fetchedProfile, setFetchedProfile] = useState(null); // { username, name, avatar, followersCount, postsCount, bio }

  // Step 3: Password
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  // Meta OAuth
  const [loading, setLoading] = useState(false);

  // Step 1: Fetch real profile from Apify via backend
  const handleFetchProfile = async (e) => {
    e.preventDefault();
    const handle = usernameInput.trim().replace(/^@/, "");
    if (!handle) {
      setError("Please enter your Instagram username.");
      return;
    }
    setFetchingProfile(true);
    setError("");
    setFetchedProfile(null);

    try {
      const res = await api.post("/instagram/find-accounts", { identifier: handle });
      if (res.data?.success && res.data?.accounts?.length > 0) {
        setFetchedProfile(res.data.accounts[0]);
      } else {
        setError("Could not find this Instagram account. Please check the username and try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch Instagram profile. Please try again.");
    } finally {
      setFetchingProfile(false);
    }
  };

  // Step 2: Authenticate & Connect with password
  const handleAuthenticate = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError("Please enter your Instagram password.");
      return;
    }
    setAuthenticating(true);
    setError("");

    try {
      const res = await api.post("/instagram/connect-credentials", {
        username: fetchedProfile.username,
        password: passwordInput,
        identifier: fetchedProfile.username,
        // Send already-fetched real profile data so backend skips Apify call
        profileData: {
          name: fetchedProfile.name,
          avatar: fetchedProfile.avatar,
          followersCount: fetchedProfile.followersCount,
          postsCount: fetchedProfile.postsCount,
          bio: fetchedProfile.bio || "",
        },
      });
      if (res.data?.success && res.data?.isConnected) {
        if (onConnectSuccess) onConnectSuccess(res.data.profile);
        window.location.reload();
      } else {
        setError(res.data?.message || "Incorrect password. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please check your password.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleConnectOAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/instagram/auth");
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Meta OAuth URL not returned from backend");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate Instagram login.");
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
          padding: 36px 32px;
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
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 10px 25px rgba(220, 39, 67, 0.4);
          transition: all 0.5s ease;
        }

        .instagram-connect-container:hover .ig-badge-logo {
          transform: scale(1.08) rotate(4deg);
          box-shadow: 0 15px 35px rgba(220, 39, 67, 0.6);
        }

        .ig-title {
          font-family: var(--font-primary, sans-serif);
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .ig-subtitle {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .ig-tabs {
          display: flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 4px;
          width: 100%;
          margin-bottom: 20px;
          box-sizing: border-box;
        }

        .ig-tab-btn {
          flex: 1;
          padding: 9px 14px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .ig-tab-btn.active {
          background: linear-gradient(135deg, #dc2743, #bc1888);
          color: #fff;
          box-shadow: 0 4px 14px rgba(220, 39, 67, 0.3);
        }

        .ig-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ig-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .ig-input:focus {
          border-color: #dc2743;
          background: rgba(255, 255, 255, 0.09);
        }

        .ig-input::placeholder {
          color: rgba(255,255,255,0.35);
        }

        .ig-connect-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          color: white;
          font-size: 15px;
          font-weight: 700;
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

        .ig-connect-btn:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
          filter: none;
        }

        /* Real Profile Card */
        .ig-profile-card {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
          animation: fadeSlideIn 0.4s ease;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ig-profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #dc2743;
          flex-shrink: 0;
        }

        .ig-profile-info {
          flex: 1;
          overflow: hidden;
        }

        .ig-profile-name {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ig-profile-handle {
          font-size: 12.5px;
          color: #a78bfa;
          margin-top: 2px;
        }

        .ig-profile-stats {
          display: flex;
          gap: 12px;
          margin-top: 5px;
        }

        .ig-profile-stat {
          font-size: 11.5px;
          color: rgba(255,255,255,0.55);
        }

        .ig-profile-stat strong {
          color: rgba(255,255,255,0.9);
          font-weight: 700;
        }

        .ig-verified-badge {
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #dc2743, #bc1888);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
        }

        .ig-section-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          text-align: left;
          width: 100%;
          margin-bottom: -6px;
        }

        .ig-back-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          margin-top: 2px;
        }

        .ig-back-btn:hover {
          color: rgba(255,255,255,0.65);
        }

        .ig-error-msg {
          margin-top: 4px;
          font-size: 13px;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px 14px;
          border-radius: 10px;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
        }

        .spinner-mini {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: ig-spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        @keyframes ig-spin {
          to { transform: rotate(360deg); }
        }

        .ig-loading-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 0;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
        }

        .ig-loading-profile .spinner-large {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(220, 39, 67, 0.2);
          border-top-color: #dc2743;
          border-radius: 50%;
          animation: ig-spin 0.8s linear infinite;
        }
      `}</style>

      {/* Logo */}
      <div className="ig-badge-logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </div>

      <h3 className="ig-title">Connect Instagram</h3>
      <p className="ig-subtitle">Enter your Instagram username to find and connect your account.</p>

      {/* Tabs */}
      <div className="ig-tabs">
        <button
          type="button"
          className={`ig-tab-btn ${activeTab === "username" ? "active" : ""}`}
          onClick={() => { setActiveTab("username"); setError(""); setFetchedProfile(null); }}
        >
          📱 Instagram Login
        </button>
        <button
          type="button"
          className={`ig-tab-btn ${activeTab === "oauth" ? "active" : ""}`}
          onClick={() => { setActiveTab("oauth"); setError(""); setFetchedProfile(null); }}
        >
          🔑 Meta OAuth
        </button>
      </div>

      {/* TAB 1: Username → Real Profile → Password */}
      {activeTab === "username" && (
        <div className="ig-form">
          {/* Loading state */}
          {fetchingProfile && (
            <div className="ig-loading-profile">
              <div className="spinner-large" />
              <span>Fetching real Instagram profile...</span>
            </div>
          )}

          {/* Step 1: Username input — shown only when no profile fetched yet */}
          {!fetchingProfile && !fetchedProfile && (
            <form onSubmit={handleFetchProfile} className="ig-form">
              <input
                type="text"
                className="ig-input"
                placeholder="Enter Instagram username (e.g. cristiano)"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                autoComplete="username"
                autoFocus
              />
              <button type="submit" className="ig-connect-btn" disabled={!usernameInput.trim()}>
                <span>Search Profile →</span>
              </button>
            </form>
          )}

          {/* Step 2 & 3: Real profile card + password */}
          {!fetchingProfile && fetchedProfile && (
            <form onSubmit={handleAuthenticate} className="ig-form">
              {/* Real profile preview card */}
              <div className="ig-profile-card">
                <img
                  src={fetchedProfile.avatar}
                  alt={fetchedProfile.username}
                  className="ig-profile-avatar"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fetchedProfile.username)}&background=bc1888&color=fff`; }}
                />
                <div className="ig-profile-info">
                  <div className="ig-profile-name">{fetchedProfile.name || fetchedProfile.username}</div>
                  <div className="ig-profile-handle">@{fetchedProfile.username}</div>
                  <div className="ig-profile-stats">
                    <span className="ig-profile-stat">
                      <strong>{(fetchedProfile.followersCount || 0).toLocaleString()}</strong> followers
                    </span>
                    <span className="ig-profile-stat">
                      <strong>{(fetchedProfile.postsCount || 0).toLocaleString()}</strong> posts
                    </span>
                  </div>
                </div>
                <div className="ig-verified-badge">✓</div>
              </div>

              {/* Password field */}
              <div className="ig-section-label">Enter Instagram Password to connect this account:</div>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="ig-input"
                  placeholder="Instagram Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={authenticating}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 0,
                    lineHeight: 1,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>

              <button type="submit" className="ig-connect-btn" disabled={authenticating || !passwordInput.trim()}>
                {authenticating ? (
                  <>
                    <span className="spinner-mini" />
                    <span>Connecting @{fetchedProfile.username}...</span>
                  </>
                ) : (
                  <span>Connect @{fetchedProfile.username}</span>
                )}
              </button>

              <button
                type="button"
                className="ig-back-btn"
                onClick={() => { setFetchedProfile(null); setPasswordInput(""); setError(""); }}
              >
                ← Use a different username
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: Meta OAuth */}
      {activeTab === "oauth" && (
        <button className="ig-connect-btn" onClick={handleConnectOAuth} disabled={loading}>
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
              <span>Connect with Meta Facebook</span>
            </>
          )}
        </button>
      )}

      {error && <div className="ig-error-msg">⚠️ {error}</div>}
    </div>
  );
}
