import { useState, useEffect } from "react";
import ProfilePage from "./ProfilePage";
import api from "@/lib/api";

export default function DashboardPage({ onNavigate, user }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab]       = useState("profile");
  const [nameVal, setNameVal]           = useState(user?.username || user?.name || "");

  const [connectedPlatforms, setConnectedPlatforms] = useState({
    instagram: null,
    youtube: null,
    facebook: null
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFlows: 0,
    activeFlows: 0,
    contacts: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Instagram profile
        let igProfile = null;
        try {
          const igRes = await api.get("/instagram/profile");
          if (igRes.data?.isConnected) {
            igProfile = igRes.data.profile;
          }
        } catch (err) {
          console.warn("Failed to fetch Instagram profile:", err.message);
        }

        // 2. Fetch YouTube profile
        let ytProfile = null;
        if (localStorage.getItem("yt_connected") === "true") {
          ytProfile = {
            title: "ViralRush YT",
            thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60",
            subscriberCount: 25000,
            videoCount: 142
          };
        } else {
          try {
            const ytRes = await api.get("/youtube/analytics");
            if (ytRes.data?.channel) {
              ytProfile = ytRes.data.channel;
            }
          } catch (err) {
            console.warn("YouTube channel not connected or failed to fetch:", err.message);
          }
        }

        // 3. Check Facebook mock profile from localStorage
        let fbProfile = null;
        if (localStorage.getItem("fb_connected") === "true") {
          fbProfile = {
            username: "ViralRushPage",
            profilePicture: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60",
            followersCount: 1250,
            likesCount: 1100
          };
        }

        setConnectedPlatforms({
          instagram: igProfile,
          youtube: ytProfile,
          facebook: fbProfile
        });

        // Sum followers
        let totalFollowers = 0;
        if (igProfile) totalFollowers += igProfile.followersCount || 0;
        if (ytProfile) totalFollowers += parseInt(ytProfile.subscriberCount) || 0;
        if (fbProfile) totalFollowers += fbProfile.followersCount || 0;

        // 4. Fetch active automation rules
        const autoRes = await api.get("/features/automation");
        if (autoRes.data) {
          const total = autoRes.data.length;
          const active = autoRes.data.filter(r => r.active || r.isActive).length;
          setStats({
            totalFlows: total,
            activeFlows: active,
            contacts: totalFollowers
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const anyConnected = !!(connectedPlatforms.instagram || connectedPlatforms.youtube || connectedPlatforms.facebook);

  return (
    <div className="dashboard-wrapper" style={{ padding: "56px 40px 80px", minHeight: "100vh", background: "#0d0d0d", color: "#fff", fontFamily: "var(--font-ui)" }}>
      <style>{`
        .dashboard-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .dashboard-topbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .dashboard-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }
        .dashboard-nextsteps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }
        @media (max-width: 900px) {
          .dashboard-stat-grid {
            grid-template-columns: 1fr 1fr;
          }
          .dashboard-nextsteps-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .dashboard-stat-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-wrapper {
            padding: 40px 20px 60px !important;
          }
        }
      `}</style>

      {/* ── Top bar: Welcome + CTA ── */}
      <div className="dashboard-topbar">
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            WELCOME BACK
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)" }}>
            {user?.username || user?.name || "Dashboard"}
          </h1>
        </div>
        {/* Right side: profile icon + Notifications bell */}
        <div className="dashboard-topbar-right">
          {/* Notifications bell */}
          <button
            onClick={() => onNavigate && onNavigate("notifications")}
            title="Notifications"
            style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(167,139,250,0.1)",
              border: "1.5px solid rgba(167,139,250,0.25)",
              color: "#a78bfa", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(91,46,255,0.15)",
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              flexShrink: 0,
              position: "relative",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.background = "rgba(167,139,250,0.18)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(91,46,255,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(167,139,250,0.1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,46,255,0.15)"; }}
          >
            <BellIcon />
          </button>

          {/* Profile avatar button */}
          <button
            onClick={() => setShowProfile(true)}
            title="Settings & Profile"
            style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "linear-gradient(135deg, #5b2eff, #7c3aed)",
              border: "2px solid rgba(167,139,250,0.35)",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-primary)", fontWeight: 900, fontSize: 15,
              boxShadow: "0 4px 16px rgba(91,46,255,0.4)",
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(91,46,255,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,46,255,0.4)"; }}
          >
            {(user?.username || user?.name || "U")[0].toUpperCase()}
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dashboard-stat-grid">
        {[
          { icon: <BoltIcon />, color: "#5b2eff", bg: "rgba(91,46,255,0.12)", label: "Total Flows",  value: stats.totalFlows },
          { icon: <PulseIcon />, color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Active Flows", value: stats.activeFlows },
          { icon: <UsersIcon />, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Contacts & Followers", value: stats.contacts?.toLocaleString() },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: "#141414", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: "22px 24px",
              display: "flex", alignItems: "center", gap: 18,
              transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${stat.color}22`; e.currentTarget.style.borderColor = `${stat.color}44`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: stat.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "var(--font-primary)", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recommended Next Steps ── */}
      <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "var(--font-primary)" }}>
        Recommended Next Steps
      </h2>
      <div className="dashboard-nextsteps-grid">
        {/* Card 1 */}
        <NextStepCard
          color="#ec4899"
          icon={<LinkIcon />}
          title="Connect a Social Channel"
          desc="Link your Instagram, Facebook, or YouTube to start automating conversations."
          linkText="Connect Channel"
          onClick={() => onNavigate && onNavigate("connect")}
        />

        {/* Card 2 */}
        <NextStepCard
          color="#5b2eff"
          icon={<BoltIcon />}
          title="Create Your First Automation"
          desc="Build keyword-reply rules to engage your audience automatically and generate sales."
          linkText="Start Building"
          onClick={() => onNavigate && onNavigate("automation")}
          disabled={true}
        />

        {/* Card 3 */}
        <NextStepCard
          color="#a78bfa"
          icon={<SparkIcon />}
          title="Viral Content Finder"
          desc="Discover hyper-viral hooks, perform neural AI diagnostics, and write high-converting scripts."
          linkText="Launch Viral Finder"
          onClick={() => onNavigate && onNavigate("viral")}
        />
      </div>

      {/* ── Connected Channels ── */}
      <div className="dashboard-channels-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "var(--font-primary)" }}>
          Connected Channels
        </h2>
        <button
          onClick={() => onNavigate && onNavigate(anyConnected ? "managevideos" : "connect")}          
          style={{ background: "none", border: "none", color: "#5b2eff", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)" }}
          onMouseEnter={e => e.currentTarget.style.color = "#7c3aed"}
          onMouseLeave={e => e.currentTarget.style.color = "#5b2eff"}
        >
          Manage
        </button>
      </div>

      <div style={{
        background: "#141414", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "24px",
        display: "flex", flexDirection: "column",
        gap: 20,
      }}>
        {anyConnected ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, width: "100%" }}>
            {connectedPlatforms.instagram && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flex: "1 1 280px",
                minWidth: 260
              }}>
                <div style={{ position: "relative" }}>
                  <img 
                    src={connectedPlatforms.instagram.profilePicture || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60"} 
                    alt={connectedPlatforms.instagram.username} 
                    style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #ec4899", objectFit: "cover" }} 
                  />
                  <span style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#25d366", border: "2px solid #141414", display: "inline-block" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "white", fontFamily: "var(--font-primary)" }}>@{connectedPlatforms.instagram.username}</span>
                    <span style={{ display: "inline-block", background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 100, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#f472b6", textTransform: "uppercase" }}>Instagram</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    {connectedPlatforms.instagram.followersCount?.toLocaleString()} followers · {connectedPlatforms.instagram.mediaCount} posts
                  </div>
                </div>
              </div>
            )}

            {connectedPlatforms.youtube && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flex: "1 1 280px",
                minWidth: 260
              }}>
                <div style={{ position: "relative" }}>
                  <img 
                    src={connectedPlatforms.youtube.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60"} 
                    alt={connectedPlatforms.youtube.title} 
                    style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #ff0000", objectFit: "cover" }} 
                  />
                  <span style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#25d366", border: "2px solid #141414", display: "inline-block" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "white", fontFamily: "var(--font-primary)" }}>{connectedPlatforms.youtube.title}</span>
                    <span style={{ display: "inline-block", background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.3)", borderRadius: 100, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#ff4444", textTransform: "uppercase" }}>YouTube</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    {parseInt(connectedPlatforms.youtube.subscriberCount || 0).toLocaleString()} subscribers · {connectedPlatforms.youtube.videoCount} videos
                  </div>
                </div>
              </div>
            )}

            {connectedPlatforms.facebook && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flex: "1 1 280px",
                minWidth: 260
              }}>
                <div style={{ position: "relative" }}>
                  <img 
                    src={connectedPlatforms.facebook.profilePicture || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60"} 
                    alt={connectedPlatforms.facebook.username} 
                    style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #1877f2", objectFit: "cover" }} 
                  />
                  <span style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#25d366", border: "2px solid #141414", display: "inline-block" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "white", fontFamily: "var(--font-primary)" }}>{connectedPlatforms.facebook.username}</span>
                    <span style={{ display: "inline-block", background: "rgba(24,119,242,0.12)", border: "1px solid rgba(24,119,242,0.3)", borderRadius: 100, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#1877f2", textTransform: "uppercase" }}>Facebook</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    {connectedPlatforms.facebook.followersCount?.toLocaleString()} followers · {connectedPlatforms.facebook.likesCount} page likes
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.4)", flexShrink: 0,
            }}>
              <InfoIcon />
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-ui)" }}>
              No social channels connected. Connect Instagram, Facebook, or YouTube to begin.
            </span>
          </div>
        )}
        <button
          onClick={() => onNavigate && onNavigate(anyConnected ? "managevideos" : "connect")}          
          style={{
            background: anyConnected ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#5b2eff,#7c3aed)",
            border: anyConnected ? "1px solid rgba(255,255,255,0.12)" : "none", 
            borderRadius: 10,
            padding: "10px 22px", color: "#fff",
            fontSize: 13, fontWeight: 700,
            fontFamily: "var(--font-ui)",
            cursor: "pointer", flexShrink: 0,
            width: "fit-content",
            boxShadow: anyConnected ? "none" : "0 4px 16px rgba(91,46,255,0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            if (!anyConnected) e.currentTarget.style.boxShadow = "0 8px 24px rgba(91,46,255,0.55)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            if (!anyConnected) e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,46,255,0.35)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {anyConnected ? "Manage" : "Connect"}
        </button>
      </div>

    </div>
  );
}

/* ── Reusable Next Step card ── */
function NextStepCard({ color, icon, title, desc, linkText, onClick, disabled }) {
  return (
    <div
      style={{
        background: "#141414", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "22px 24px",
        display: "flex", gap: 18, alignItems: "flex-start",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        opacity: disabled ? 0.35 : 1,
      }}
      onClick={disabled ? null : onClick}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 16px 40px ${color}22`;
        e.currentTarget.style.borderColor = `${color}44`;
      }}
      onMouseLeave={e => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6, fontFamily: "var(--font-primary)" }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 12, fontFamily: "var(--font-ui)" }}>
          {desc}
        </div>
        <button
          disabled={disabled}
          style={{
            background: "none", border: "none", padding: 0,
            color: disabled ? "rgba(255,255,255,0.3)" : color, fontSize: 12, fontWeight: 700,
            fontFamily: "var(--font-ui)", cursor: disabled ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          {disabled ? "Disabled" : `${linkText} →`}
        </button>
      </div>
    </div>
  );
}

/* ── Inline SVG icons ── */
function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <polygon points="12 8 13.5 10.5 16 12 13.5 13.5 12 16 10.5 13.5 8 12 10.5 10.5" fill="currentColor" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

