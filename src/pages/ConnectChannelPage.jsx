import { useState, useEffect } from "react";
import api from "@/lib/api";
import ConnectInstagramButton from "@/components/instagram/ConnectInstagramButton";
import InstagramProfileCard from "@/components/instagram/InstagramProfileCard";
import YoutubeProfileCard from "@/components/youtube/YoutubeProfileCard";
import ConnectYoutubeButton from "@/components/youtube/ConnectYoutubeButton";


const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    desc: "Send DMs, auto-reply to stories, and manage Instagram conversations",
    pills: ["Direct Messages", "Story Replies", "Comment Automation"],
    btnGradient: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    btnShadow: "rgba(240,100,60,0.45)",
    iconBg: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    desc: "Manage comments, auto-reply to viewers, and grow your channel engagement automatically",
    pills: ["Comment Replies", "Auto Moderation", "Subscriber Alerts"],
    btnGradient: "linear-gradient(135deg, #ff0000, #cc0000)",
    btnShadow: "rgba(255,0,0,0.4)",
    iconBg: "linear-gradient(135deg, #ff0000, #cc0000)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

function InstructionCard() {
  const [selectedMethod, setSelectedMethod] = useState("login"); // "login" or "oauth"

  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "28px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.5)`;
        e.currentTarget.style.borderColor = "rgba(91,46,255,0.25)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      {/* Icon + Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)", marginBottom: 2 }}>
            Connection Guide
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)" }}>
            Select an integration method
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 13, color: "rgba(255,255,255,0.45)",
        lineHeight: 1.6, marginBottom: 20,
        fontFamily: "var(--font-ui)",
      }}>
        Compare connection methods to choose the best option for your Instagram automation setup.
      </p>

      {/* Selector Tabs */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.04)",
        padding: 4,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 20,
      }}>
        <button
          onClick={() => setSelectedMethod("login")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 7,
            background: selectedMethod === "login" ? "rgba(91,46,255,0.18)" : "transparent",
            color: selectedMethod === "login" ? "#a78bfa" : "rgba(255,255,255,0.6)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-ui)",
            transition: "all 0.2s ease",
            border: selectedMethod === "login" ? "1px solid rgba(91,46,255,0.3)" : "1px solid transparent",
          }}
        >
          Instagram Login
        </button>
        <button
          onClick={() => setSelectedMethod("oauth")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 7,
            background: selectedMethod === "oauth" ? "rgba(91,46,255,0.18)" : "transparent",
            color: selectedMethod === "oauth" ? "#a78bfa" : "rgba(255,255,255,0.6)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-ui)",
            transition: "all 0.2s ease",
            border: selectedMethod === "oauth" ? "1px solid rgba(91,46,255,0.3)" : "1px solid transparent",
          }}
        >
          Meta OAuth
        </button>
      </div>

      {/* Dynamic Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {/* Features / Benefits */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>✔</span> Features & Benefits
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {selectedMethod === "login" ? (
              <>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>•</span>
                  <span>Connect directly using username & password</span>
                </li>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>•</span>
                  <span>Works with personal accounts</span>
                </li>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>•</span>
                  <span>Quick setup with no Meta Developer account required</span>
                </li>
              </>
            ) : (
              <>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>•</span>
                  <span>Official Meta API connection (100% safe)</span>
                </li>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>•</span>
                  <span>Very high rate limits & permanent connection</span>
                </li>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>•</span>
                  <span>Highly reliable automation setup</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Drawbacks / Limitations */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>⚠</span> Drawbacks & Risks
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {selectedMethod === "login" ? (
              <>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#f43f5e", flexShrink: 0 }}>•</span>
                  <span>Subject to standard security checks (our built-in smart rate-limiting algorithm keeps you safe)</span>
                </li>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#f43f5e", flexShrink: 0 }}>•</span>
                  <span>Requires session refresh if password changes</span>
                </li>
              </>
            ) : (
              <>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#f43f5e", flexShrink: 0 }}>•</span>
                  <span>Requires Facebook Page linking to Instagram</span>
                </li>
                <li style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#f43f5e", flexShrink: 0 }}>•</span>
                  <span>Does not support Personal accounts (Creator/Business only)</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ConnectChannelPage() {
  const [connected, setConnected] = useState({
    facebook: localStorage.getItem("fb_connected") === "true",
    youtube: false,
    instagram: false
  });
  const [ytLoading, setYtLoading] = useState(true);
  const [ytProfile, setYtProfile] = useState(null);
  const [igProfile, setIgProfile] = useState(null);
  const [igLoading, setIgLoading] = useState(true);

  // ── Handle OAuth callbacks & fetch connection status on mount ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ytConnected = params.get("youtube_connected");
    const success = params.get("success");
    const error = params.get("error");
    const igConnected = params.get("instagram_connected");

    if (ytConnected || success) {
      // YouTube OAuth callback
      window.history.replaceState(null, "", window.location.pathname);
    } else if (error) {
      const isInstagramError = error.startsWith("instagram") || error.includes("instagram") || error === "no_instagram_linked";
      const isYoutubeError = error.startsWith("yt_");
      const platformName = isInstagramError ? "Instagram" : isYoutubeError ? "YouTube" : "Platform";
      alert(`${platformName} connection failed: ${error}`);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (igConnected) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    fetchInstagramStatus();
    fetchYoutubeStatus();
  }, []);

  const fetchYoutubeStatus = async () => {
    try {
      setYtLoading(true);
      const res = await api.get("/youtube/analytics");
      if (res.data?.channel) {
        setConnected((prev) => ({ ...prev, youtube: true }));
        setYtProfile(res.data.channel);
      } else {
        setConnected((prev) => ({ ...prev, youtube: false }));
        setYtProfile(null);
      }
    } catch (err) {
      setConnected((prev) => ({ ...prev, youtube: false }));
      setYtProfile(null);
    } finally {
      setYtLoading(false);
    }
  };

  const fetchInstagramStatus = async () => {
    try {
      setIgLoading(true);
      const res = await api.get("/instagram/profile");
      if (res.data?.isConnected) {
        setConnected((prev) => ({ ...prev, instagram: true }));
        setIgProfile(res.data.profile);
      } else {
        setConnected((prev) => ({ ...prev, instagram: false }));
        setIgProfile(null);
      }
    } catch (err) {
      console.error("Failed to fetch Instagram profile state:", err);
    } finally {
      setIgLoading(false);
    }
  };

  const handleConnect = async (id) => {
    if (id === "youtube") {
      // Handled directly by ConnectYoutubeButton via onConnectSuccess
      return;
    } else if (id === "facebook") {
      setConnected((prev) => {
        const next = !prev.facebook;
        localStorage.setItem("fb_connected", next ? "true" : "false");
        return { ...prev, facebook: next };
      });
    }
  };

  // Called by ConnectYoutubeButton when channel is successfully fetched
  const handleYoutubeConnectSuccess = (channelData) => {
    setConnected((prev) => ({ ...prev, youtube: true }));
    setYtProfile(channelData);
    setYtLoading(false);
  };

  const connectedCount = platforms.filter((p) => connected[p.id]).length;

  const renderPlatformCard = (p) => {
    const isConnected = !!connected[p.id];
    return (
      <div
        key={p.id}
        style={{
          background: "#141414",
          border: `1px solid ${isConnected ? "rgba(37,211,102,0.3)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 18,
          padding: "28px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
          cursor: "default",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.5)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Icon + Name row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: p.iconBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px ${p.btnShadow}`,
          }}>
            {p.icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)", marginBottom: 3 }}>
              {p.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {isConnected ? (
                <>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#25d366", display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "#25d366", fontFamily: "var(--font-ui)" }}>Connected</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)" }}>Not connected</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13, color: "rgba(255,255,255,0.45)",
          lineHeight: 1.65, marginBottom: 16,
          fontFamily: "var(--font-ui)",
        }}>
          {p.desc}
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {p.pills.map((pill) => (
            <span key={pill} style={{
              fontSize: 11, color: "rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, padding: "4px 10px",
              fontFamily: "var(--font-ui)",
            }}>
              {pill}
            </span>
          ))}
        </div>

        {/* CTA button or custom profiles */}
        {p.id === "instagram" ? (
          igLoading ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#dc2743", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
            </div>
          ) : isConnected && igProfile ? (
            <InstagramProfileCard profile={igProfile} onDisconnectSuccess={fetchInstagramStatus} />
          ) : (
            <ConnectInstagramButton onLoadingStateChange={(isLoading) => setIgLoading(isLoading)} />
          )
        ) : p.id === "youtube" ? (
          ytLoading ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#ff0000", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
            </div>
          ) : isConnected && ytProfile ? (
            <YoutubeProfileCard profile={ytProfile} onDisconnectSuccess={fetchYoutubeStatus} />
          ) : (
            <ConnectYoutubeButton
              onLoadingStateChange={(isLoading) => setYtLoading(isLoading)}
              onConnectSuccess={handleYoutubeConnectSuccess}
            />
          )
        ) : null}
      </div>
    );
  };

  return (
    <div 
      className="connect-container"
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        padding: "56px 40px 80px",
        fontFamily: "var(--font-ui)",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>

        {/* INTEGRATIONS badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(91,46,255,0.12)",
          border: "1px solid rgba(91,46,255,0.35)",
          borderRadius: 100, padding: "6px 18px",
          marginBottom: 22,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-primary)" }}>
            Integrations
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          margin: "0 0 16px",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 900,
          color: "#fff",
          fontFamily: "var(--font-primary)",
          lineHeight: 1.15,
        }}>
          Connect Your{" "}
          <span style={{
            background: "linear-gradient(135deg, #a78bfa, #7c3aed, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Social Platforms
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.45)",
          maxWidth: 480, margin: "0 auto 28px",
          lineHeight: 1.7, fontFamily: "var(--font-ui)",
        }}>
          Link your creator or business social accounts to power your automation flows with
          real messaging capabilities
        </p>

        {/* Status pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 100, padding: "6px 18px",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: connectedCount > 0 ? "#25d366" : "rgba(255,255,255,0.3)",
            display: "inline-block",
            boxShadow: connectedCount > 0 ? "0 0 8px #25d366" : "none",
          }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-ui)" }}>
            {connectedCount} / {platforms.length} Connected
          </span>
        </div>
      </div>

      {/* ── Platform Cards ── */}
      <div 
        className="connect-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {renderPlatformCard(platforms[0])}
        <InstructionCard />
        {renderPlatformCard(platforms[1])}
      </div>

      {/* Responsive */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .connect-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            padding: 0 20px;
          }
        }
        @media (max-width: 768px) {
          .connect-container {
            padding: 40px 16px 60px !important;
          }
          .connect-grid {
            grid-template-columns: 1fr !important;
            padding: 0;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
