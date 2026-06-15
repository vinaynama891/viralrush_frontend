import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n && n !== 0) return "—";
  const num = parseInt(n, 10);
  if (isNaN(num)) return "—";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
};

const fmtFull = (n) => {
  if (!n && n !== 0) return "—";
  const num = parseInt(n, 10);
  if (isNaN(num)) return "—";
  return num.toLocaleString();
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, color, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f0f0f",
      border: `1px solid ${color}33`,
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 20px ${color}18`,
    }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color }}>
        {fmt(payload[0].value)} {unit}
      </div>
    </div>
  );
};

// ── Platform Card ─────────────────────────────────────────────────────────────
function PlatformCard({ icon, label, children, accentColor, connected, onConnectClick }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: `1px solid ${connected ? accentColor + "30" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 20,
      padding: "24px 24px 20px",
      backdropFilter: "blur(16px)",
      boxShadow: connected ? `0 4px 40px ${accentColor}0d` : "none",
      transition: "all 0.3s",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* accent bar */}
      {connected && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }} />
      )}

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.75)", letterSpacing: "0.03em" }}>
            {label}
          </span>
        </div>
        {connected ? (
          <span style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700,
            color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 100, padding: "3px 9px", letterSpacing: "0.08em",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            LIVE
          </span>
        ) : (
          <span style={{
            fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 100, padding: "3px 9px",
          }}>
            NOT CONNECTED
          </span>
        )}
      </div>

      {connected ? children : (
        <div style={{ textAlign: "center", padding: "28px 0" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
            Connect to see real-time analytics
          </div>
          <button
            onClick={onConnectClick}
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
              border: "none", borderRadius: 10, color: "#fff",
              padding: "10px 22px", fontSize: 12.5, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.04em",
              boxShadow: `0 4px 18px ${accentColor}40`,
            }}
          >
            Connect Channel →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value, color, sub }) {
  return (
    <div style={{
      background: `${color}0a`,
      border: `1px solid ${color}20`,
      borderRadius: 14,
      padding: "14px 16px",
      textAlign: "center",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage({ analytics, chartData }) {
  const [activeTab, setActiveTab] = useState("youtube");

  // YouTube state
  const [ytData, setYtData] = useState(null);
  const [ytLoading, setYtLoading] = useState(true);
  const [ytConnected, setYtConnected] = useState(false);
  const [ytMetric, setYtMetric] = useState("views"); // "views" | "subscribers"

  // Instagram state
  const [igData, setIgData] = useState(null);
  const [igLoading, setIgLoading] = useState(true);
  const [igConnected, setIgConnected] = useState(false);
  const [igMetric, setIgMetric] = useState("reach"); // "reach" | "followers" | "engagement"

  const navigate = (key) =>
    window.dispatchEvent(new CustomEvent("viralrush_navigate", { detail: key }));

  // Load YouTube analytics
  useEffect(() => {
    const load = async () => {
      try {
        setYtLoading(true);
        const res = await api.get("/youtube/analytics");
        if (res.data?.channel) {
          setYtData(res.data);
          setYtConnected(true);
        }
      } catch {
        setYtConnected(false);
      } finally {
        setYtLoading(false);
      }
    };
    load();
  }, []);

  // Load Instagram analytics
  useEffect(() => {
    const load = async () => {
      try {
        setIgLoading(true);
        const res = await api.get("/instagram/analytics");
        if (res.data?.summary) {
          setIgData(res.data);
          setIgConnected(true);
        }
      } catch {
        setIgConnected(false);
      } finally {
        setIgLoading(false);
      }
    };
    load();
  }, []);

  // Build chart data
  const ytChartData = (() => {
    if (!ytData?.analytics) return [];
    const views = ytData.analytics.viewsHistory || [];
    const subs = ytData.analytics.subHistory || [];
    return views.map((item, i) => ({
      date: item.date?.slice(5) || "", // MM-DD
      views: item.value || 0,
      subscribers: subs[i]?.value || 0,
    }));
  })();

  const igChartData = (() => {
    if (!igData?.charts) return [];
    const { labels, reachHistory, followersHistory, engagementHistory } = igData.charts;
    return (labels || []).map((label, i) => ({
      name: label,
      reach: reachHistory?.[i] || 0,
      followers: followersHistory?.[i] || 0,
      engagement: engagementHistory?.[i] || 0,
    }));
  })();

  // Colors
  const YT_COLOR = "#ff0000";
  const IG_COLORS = { reach: "#dc2743", followers: "#bc1888", engagement: "#f09433" };

  const tabs = [
    { id: "youtube", label: "YouTube", color: YT_COLOR },
    { id: "instagram", label: "Instagram", color: "#dc2743" },
  ];

  const Spinner = ({ color }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
      <div style={{
        width: 28, height: 28,
        border: `3px solid ${color}25`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      padding: "56px 36px 80px",
      color: "white",
      fontFamily: "var(--font-ui)",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .anal-fade { animation: fadeUp 0.35s ease; }
        .anal-metric-btn:hover { opacity: 1 !important; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 100, padding: "5px 16px", marginBottom: 20,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Platform Analytics
          </span>
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-primary)", lineHeight: 1.15 }}>
          Growth & Engagement Insights
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
          Track your YouTube views, subscribers, Instagram reach, and follower growth all in one dashboard.
        </p>
      </div>

      {/* Platform Tab Selector */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <div style={{
          display: "inline-flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: 4,
          gap: 4,
        }}>
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 26px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "var(--font-primary)",
                  cursor: "pointer",
                  border: isActive ? `1px solid ${t.color}40` : "1px solid transparent",
                  background: isActive ? `${t.color}18` : "transparent",
                  color: isActive ? t.color : "rgba(255,255,255,0.4)",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── YOUTUBE TAB ── */}
      {activeTab === "youtube" && (
        <div className="anal-fade" style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <PlatformCard
            label="YouTube Analytics"
            accentColor={YT_COLOR}
            connected={!ytLoading && ytConnected}
            onConnectClick={() => navigate("youtube")}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            }
          >
            {ytLoading ? (
              <Spinner color={YT_COLOR} />
            ) : (
              <>
                {/* Channel info row */}
                {ytData?.channel && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, padding: "0 0 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {ytData.channel.thumbnail && (
                      <div style={{ padding: 2, borderRadius: "50%", background: "linear-gradient(45deg,#ff0000,#990000)" }}>
                        <img src={ytData.channel.thumbnail} alt={ytData.channel.title} style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #141414", objectFit: "cover" }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{ytData.channel.title}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>YouTube Channel</div>
                    </div>
                  </div>
                )}

                {/* Stat chips */}
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                  <StatChip
                    label="Total Views"
                    value={fmt(ytData?.channel?.viewCount)}
                    sub={fmtFull(ytData?.channel?.viewCount) + " views"}
                    color={YT_COLOR}
                  />
                  <StatChip
                    label="Subscribers"
                    value={fmt(ytData?.channel?.subscriberCount)}
                    sub={fmtFull(ytData?.channel?.subscriberCount) + " subs"}
                    color="#ff6666"
                  />
                  <StatChip
                    label="Videos"
                    value={fmt(ytData?.channel?.videoCount)}
                    sub="uploaded"
                    color="#cc0000"
                  />
                </div>

                {/* Metric toggle */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {[{ id: "views", label: "Views", color: YT_COLOR }, { id: "subscribers", label: "Subscribers", color: "#ff6666" }].map(m => (
                    <button
                      key={m.id}
                      className="anal-metric-btn"
                      onClick={() => setYtMetric(m.id)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                        border: ytMetric === m.id ? `1px solid ${m.color}50` : "1px solid rgba(255,255,255,0.08)",
                        background: ytMetric === m.id ? `${m.color}15` : "rgba(255,255,255,0.03)",
                        color: ytMetric === m.id ? m.color : "rgba(255,255,255,0.4)",
                        opacity: ytMetric === m.id ? 1 : 0.7,
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <div style={{ height: 220 }}>
                  {ytChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ytChartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ytMetric === "views" ? YT_COLOR : "#ff6666"} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={ytMetric === "views" ? YT_COLOR : "#ff6666"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} />
                        <Tooltip content={<CustomTooltip color={ytMetric === "views" ? YT_COLOR : "#ff6666"} />} />
                        <Area
                          type="monotone"
                          dataKey={ytMetric}
                          stroke={ytMetric === "views" ? YT_COLOR : "#ff6666"}
                          strokeWidth={2.5}
                          fill="url(#ytGrad)"
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                      No chart data available
                    </div>
                  )}
                </div>
              </>
            )}
          </PlatformCard>
        </div>
      )}

      {/* ── INSTAGRAM TAB ── */}
      {activeTab === "instagram" && (
        <div className="anal-fade" style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <PlatformCard
            label="Instagram Analytics"
            accentColor="#dc2743"
            connected={!igLoading && igConnected}
            onConnectClick={() => navigate("connect")}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#igGradStroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="igGradStroke" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#f09433" /><stop offset="0.25" stopColor="#e6683c" /><stop offset="0.5" stopColor="#dc2743" /><stop offset="0.75" stopColor="#cc2366" /><stop offset="1" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            }
          >
            {igLoading ? (
              <Spinner color="#dc2743" />
            ) : (
              <>
                {/* Stat chips */}
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                  <StatChip
                    label="Weekly Reach"
                    value={igData?.summary?.weeklyReach || "—"}
                    color="#dc2743"
                  />
                  <StatChip
                    label="Followers"
                    value={fmt(igData?.summary?.followers)}
                    sub={fmtFull(igData?.summary?.followers)}
                    color="#bc1888"
                  />
                  <StatChip
                    label="Engagement"
                    value={igData?.summary?.engagementRate || "—"}
                    sub="avg rate"
                    color="#f09433"
                  />
                </div>

                {/* Metric toggle */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {[
                    { id: "reach", label: "Reach", color: "#dc2743" },
                    { id: "followers", label: "Followers", color: "#bc1888" },
                    { id: "engagement", label: "Engagement", color: "#f09433" },
                  ].map(m => (
                    <button
                      key={m.id}
                      className="anal-metric-btn"
                      onClick={() => setIgMetric(m.id)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                        border: igMetric === m.id ? `1px solid ${m.color}50` : "1px solid rgba(255,255,255,0.08)",
                        background: igMetric === m.id ? `${m.color}15` : "rgba(255,255,255,0.03)",
                        color: igMetric === m.id ? m.color : "rgba(255,255,255,0.4)",
                        opacity: igMetric === m.id ? 1 : 0.7,
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <div style={{ height: 220 }}>
                  {igChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={igChartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={IG_COLORS[igMetric]} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={IG_COLORS[igMetric]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} />
                        <Tooltip content={<CustomTooltip color={IG_COLORS[igMetric]} />} />
                        <Area
                          type="monotone"
                          dataKey={igMetric}
                          stroke={IG_COLORS[igMetric]}
                          strokeWidth={2.5}
                          fill="url(#igGrad)"
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                      No chart data available
                    </div>
                  )}
                </div>
              </>
            )}
          </PlatformCard>
        </div>
      )}

      {/* ── General AI suggestions (from App.jsx state) ── */}
      {analytics?.suggestions && (
        <div style={{
          maxWidth: 860, margin: "20px auto 0",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: "20px 24px",
        }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Creator Growth Recommendations
          </h4>
          {analytics.suggestions.map((s, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              <span style={{ color: "#a78bfa", fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
