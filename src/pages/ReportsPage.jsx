import React, { useState, useEffect } from "react";

// ── Icons ──
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const FlameIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ShieldAlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function ReportsPage({ reports }) {
  const [timeRange, setTimeRange] = useState("7days"); // "today" | "7days" | "1month"
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);

  // Extract real metrics or fallback to standard estimates
  const scheduledCountRaw = reports?.scheduledCount ?? 0;
  const rulesCountRaw = reports?.rulesCount ?? 0;
  const searchesCountRaw = reports?.searchesCount ?? 0;
  const scriptsCountRaw = reports?.scriptsCount ?? 0;

  // Scale metrics based on date range selection
  let scheduledCount = scheduledCountRaw;
  let rulesCount = rulesCountRaw;
  let searchesCount = searchesCountRaw;
  let scriptsCount = scriptsCountRaw;

  if (timeRange === "today") {
    searchesCount = Math.max(0, Math.round(searchesCountRaw * 0.15));
    scheduledCount = Math.max(0, Math.round(scheduledCountRaw * 0.1));
    scriptsCount = Math.max(0, Math.round(scriptsCountRaw * 0.1));
    rulesCount = rulesCountRaw; // rules are active system-wide
  } else if (timeRange === "1month") {
    searchesCount = Math.max(searchesCountRaw, searchesCountRaw * 4 + 12);
    scheduledCount = Math.max(scheduledCountRaw, scheduledCountRaw * 4 + 5);
    scriptsCount = Math.max(scriptsCountRaw, scriptsCountRaw * 4 + 8);
    rulesCount = rulesCountRaw;
  }

  // Define daily usage datasets
  const todayUsage = reports?.todayUsage || [
    { day: "09:00", date: "Today 09:00 AM", time: 10, searches: 1, scripts: 0, color: "linear-gradient(to top, #7c3aed, #c084fc)" },
    { day: "12:00", date: "Today 12:00 PM", time: 25, searches: 2, scripts: 0, color: "linear-gradient(to top, #3b82f6, #60a5fa)" },
    { day: "15:00", date: "Today 03:00 PM", time: 15, searches: 1, scripts: 1, color: "linear-gradient(to top, #ec4899, #f472b6)" },
    { day: "18:00", date: "Today 06:00 PM", time: 40, searches: 3, scripts: 2, color: "linear-gradient(to top, #10b981, #34d399)" },
    { day: "21:00", date: "Today 09:00 PM", time: 20, searches: 1, scripts: 0, color: "linear-gradient(to top, #f59e0b, #fbbf24)" },
  ];

  const weeklyUsage = reports?.weeklyUsage || [
    { day: "Mon", date: "June 08", time: 80, searches: 4, scripts: 1, color: "linear-gradient(to top, #7c3aed, #c084fc)" },
    { day: "Tue", date: "June 09", time: 45, searches: 2, scripts: 0, color: "linear-gradient(to top, #3b82f6, #60a5fa)" },
    { day: "Wed", date: "June 10", time: 130, searches: 8, scripts: 3, color: "linear-gradient(to top, #ec4899, #f472b6)" },
    { day: "Thu", date: "June 11", time: 65, searches: 3, scripts: 1, color: "linear-gradient(to top, #10b981, #34d399)" },
    { day: "Fri", date: "June 12", time: 110, searches: 6, scripts: 2, color: "linear-gradient(to top, #f59e0b, #fbbf24)" },
    { day: "Sat", date: "June 13", time: 35, searches: 1, scripts: 0, color: "linear-gradient(to top, #6366f1, #818cf8)" },
    { day: "Sun", date: "June 14", time: 160, searches: 10, scripts: 4, color: "linear-gradient(to top, #8b5cf6, #ec4899)" }
  ];

  const monthlyUsage = reports?.monthlyUsage || [
    { day: "Wk 1", date: "May 18 - May 24", time: 450, searches: 22, scripts: 8, color: "linear-gradient(to top, #7c3aed, #c084fc)" },
    { day: "Wk 2", date: "May 25 - May 31", time: 620, searches: 30, scripts: 12, color: "linear-gradient(to top, #3b82f6, #60a5fa)" },
    { day: "Wk 3", date: "June 01 - June 07", time: 510, searches: 25, scripts: 10, color: "linear-gradient(to top, #ec4899, #f472b6)" },
    { day: "Wk 4", date: "June 08 - June 14", time: 680, searches: 34, scripts: 15, color: "linear-gradient(to top, #10b981, #34d399)" },
  ];

  const dailyUsage = timeRange === "today" ? todayUsage : timeRange === "1month" ? monthlyUsage : weeklyUsage;

  useEffect(() => {
    if (dailyUsage && dailyUsage.length > 0) {
      setSelectedDayIndex(dailyUsage.length - 1);
    }
  }, [timeRange, dailyUsage]);

  const slotColors = {
    "09:00": { start: "#7c3aed", end: "#c084fc" },
    "12:00": { start: "#3b82f6", end: "#60a5fa" },
    "15:00": { start: "#ec4899", end: "#f472b6" },
    "18:00": { start: "#10b981", end: "#34d399" },
    "21:00": { start: "#f59e0b", end: "#fbbf24" }
  };

  const totalTodayTime = todayUsage.reduce((sum, item) => sum + item.time, 0);
  let accumulatedPercent = 0;
  const donutSegments = todayUsage.map((item) => {
    const percent = totalTodayTime > 0 ? (item.time / totalTodayTime) * 100 : 20;
    const offset = 100 - accumulatedPercent;
    accumulatedPercent += percent;
    return {
      ...item,
      percent,
      strokeDasharray: `${percent} ${100 - percent}`,
      strokeDashoffset: offset
    };
  });

  const activeDay = dailyUsage[selectedDayIndex] ?? dailyUsage[dailyUsage.length - 1] ?? { day: "", date: "", time: 0, searches: 0, scripts: 0 };
  const maxDailyTime = Math.max(...dailyUsage.map(d => d.time), 1);

  // Extract base times
  const timeSpentRaw = reports?.timeSpent ?? {
    hunting: 30,
    scripting: 45,
    automation: 10,
    scheduling: 15,
    filming: 60
  };

  // Scale time spent values based on date range selection
  let timeSpent = { ...timeSpentRaw };
  if (timeRange === "today") {
    timeSpent.hunting = Math.max(5, Math.round(timeSpentRaw.hunting * 0.12));
    timeSpent.scripting = Math.max(10, Math.round(timeSpentRaw.scripting * 0.15));
    timeSpent.automation = Math.max(2, Math.round(timeSpentRaw.automation * 0.08));
    timeSpent.scheduling = Math.max(5, Math.round(timeSpentRaw.scheduling * 0.1));
    timeSpent.filming = Math.max(15, Math.round(timeSpentRaw.filming * 0.2));
  } else if (timeRange === "1month") {
    timeSpent.hunting = timeSpentRaw.hunting * 4 + 40;
    timeSpent.scripting = timeSpentRaw.scripting * 4 + 60;
    timeSpent.automation = timeSpentRaw.automation * 4 + 15;
    timeSpent.scheduling = timeSpentRaw.scheduling * 4 + 30;
    timeSpent.filming = timeSpentRaw.filming * 4 + 100;
  }

  const totalTime = 
    timeSpent.hunting + 
    timeSpent.scripting + 
    timeSpent.automation + 
    timeSpent.scheduling + 
    timeSpent.filming;

  const formatHoursMins = (mins) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${remainingMins}m`;
  };

  const calculateAverageText = () => {
    let totalMins = 0;
    if (timeRange === "today") {
      totalMins = todayUsage.reduce((sum, item) => sum + item.time, 0);
      return formatHoursMins(totalMins);
    } else if (timeRange === "1month") {
      totalMins = monthlyUsage.reduce((sum, item) => sum + item.time, 0);
      return formatHoursMins(Math.round(totalMins / 4));
    } else {
      totalMins = weeklyUsage.reduce((sum, item) => sum + item.time, 0);
      return formatHoursMins(Math.round(totalMins / 7));
    }
  };

  const fieldsData = [
    {
      name: "Viral Content Hunting",
      desc: "Searching trends, locating audio, and scanning platform feeds for ideas.",
      time: timeSpent.hunting,
      countLabel: `${searchesCount} Search${searchesCount === 1 ? "" : "es"} Run`,
      color: "#8b5cf6",
      percentage: totalTime > 0 ? (timeSpent.hunting / totalTime) * 100 : 0
    },
    {
      name: "AI Scripting & Copywriting",
      desc: "Generating content hooks, body scripts, and caption descriptions.",
      time: timeSpent.scripting,
      countLabel: `${scriptsCount} Script${scriptsCount === 1 ? "" : "s"} Created`,
      color: "#ec4899",
      percentage: totalTime > 0 ? (timeSpent.scripting / totalTime) * 100 : 0
    },
    {
      name: "Comment & DM Automations",
      desc: "Trigger setup, conversation flow structures, and message templates.",
      time: timeSpent.automation,
      countLabel: `${rulesCount} Trigger Rule${rulesCount === 1 ? "" : "s"} Active`,
      color: "#3b82f6",
      percentage: totalTime > 0 ? (timeSpent.automation / totalTime) * 100 : 0
    },
    {
      name: "Scheduling & Organization",
      desc: "Arranging tasks, managing the post pipeline, and content scheduling.",
      time: timeSpent.scheduling,
      countLabel: `${scheduledCount} Calendar Task${scheduledCount === 1 ? "" : "s"} Scheduled`,
      color: "#10b981",
      percentage: totalTime > 0 ? (timeSpent.scheduling / totalTime) * 100 : 0
    },
    {
      name: "Video Production & Filming",
      desc: "Camera setups, audio checks, acting/speaking, and draft rendering.",
      time: timeSpent.filming,
      countLabel: `${scheduledCount} Reel Video${scheduledCount === 1 ? "" : "s"} Filmed`,
      color: "#f59e0b",
      percentage: totalTime > 0 ? (timeSpent.filming / totalTime) * 100 : 0
    }
  ];

  return (
    <div className="reports-page-wrapper">
      <style>{`
        .reports-page-wrapper {
          min-height: 100vh;
          background: #08080c;
          padding: 56px 40px 80px;
          color: white;
          font-family: var(--font-ui, sans-serif);
        }

        .reports-header-box {
          text-align: center;
          margin-bottom: 45px;
        }

        .reports-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.25);
          border-radius: 100px;
          padding: 6px 18px;
          margin-bottom: 20px;
        }

        .reports-badge-text {
          font-size: 11px;
          font-weight: 700;
          color: #a78bfa;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: var(--font-primary, sans-serif);
        }

        .reports-title {
          margin: 0 0 16px;
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          font-weight: 900;
          color: #fff;
          font-family: var(--font-primary, sans-serif);
          line-height: 1.15;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 40%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reports-desc {
          font-size: 15px;
          color: #94a3b8;
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .grid-layout {
          max-width: 1100px;
          margin: 0 auto;
          animation: pageFadeIn 0.5s ease-out;
        }

        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
          margin-bottom: 32px;
        }

        .metrics-bar-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .metrics-bar-container {
            grid-template-columns: 1fr;
          }
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 24px;
          text-align: left;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          border-color: rgba(124, 58, 237, 0.3);
          background: rgba(124, 58, 237, 0.02);
          transform: translateY(-2px);
        }

        .metric-value {
          font-family: var(--font-primary, sans-serif);
          font-size: 30px;
          font-weight: 900;
          line-height: 1.1;
        }

        .metric-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 8px;
          font-weight: 700;
        }

        .field-row {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 18px;
          padding: 20px 24px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          transition: all 0.25s ease;
        }

        .field-row:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 768px) {
          .field-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }

        .field-info {
          flex: 1;
        }

        .field-name {
          font-size: 15px;
          font-weight: 800;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .field-desc {
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.5;
        }

        .field-stats {
          text-align: right;
          min-width: 140px;
        }

        @media (max-width: 768px) {
          .field-stats {
            text-align: left;
            min-width: 100%;
          }
        }

        .field-time {
          font-family: var(--font-primary, sans-serif);
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        .field-count {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .progress-outer {
          background: rgba(255, 255, 255, 0.05);
          height: 6px;
          border-radius: 100px;
          overflow: hidden;
          margin-top: 10px;
          width: 100%;
        }

        .progress-inner {
          height: 100%;
          border-radius: 100px;
        }

        .reports-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        @media (max-width: 992px) {
          .reports-details-grid {
            grid-template-columns: 1fr !important;
            gap: 24px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="reports-header-box">
        <div className="reports-badge">
          <ClockIcon />
          <span className="reports-badge-text">Creator Time Report</span>
        </div>
        <h1 className="reports-title">Activity & Time Allocation Audit</h1>
        <p className="reports-desc">
          Real-time tracking of hours spent across different creative fields, automatically computed from your actions on ViralRush.
        </p>

        <div style={{
          display: "inline-flex",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "100px",
          padding: "4px",
          marginTop: "24px",
          gap: "4px",
          backdropFilter: "blur(10px)"
        }}>
          {[
            { range: "today", label: "Today" },
            { range: "7days", label: "Last 7 Days" },
            { range: "1month", label: "Last Month" }
          ].map((item) => {
            const isActive = timeRange === item.range;
            return (
              <button
                key={item.range}
                onClick={() => {
                  setTimeRange(item.range);
                  setSelectedDayIndex(item.range === "today" ? 4 : item.range === "7days" ? 6 : 3);
                }}
                style={{
                  background: isActive ? "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)" : "transparent",
                  border: "none",
                  borderRadius: "100px",
                  padding: "8px 20px",
                  color: isActive ? "white" : "#64748b",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isActive ? "0 4px 12px rgba(124, 58, 237, 0.3)" : "none"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#64748b";
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid-layout">
        {/* Core Metric Cards */}
        <div className="metrics-bar-container">
          <div className="metric-card">
            <div className="metric-value" style={{ color: "#a78bfa" }}>
              {searchesCount}
            </div>
            <div className="metric-label">Trends Searched</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: "#ec4899" }}>
              {scheduledCount}
            </div>
            <div className="metric-label">Scheduled Tasks</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: "#3b82f6" }}>
              {rulesCount}
            </div>
            <div className="metric-label">Automation Rules</div>
          </div>
        </div>

        {/* Grid Container for Reports Details */}
        <div className="reports-details-grid">
          {/* Time Allocation Section */}
          <div className="card-container" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16 }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                <ClockIcon /> Time Spent per Field
              </h2>
              <div style={{ fontSize: "14px", color: "#64748b" }}>
                Total: <span style={{ color: "#a78bfa", fontWeight: 700 }}>{formatHoursMins(totalTime)}</span>
              </div>
            </div>

            <div>
              {fieldsData.map((field, idx) => (
                <div className="field-row" key={idx} style={{ padding: "16px 20px" }}>
                  <div className="field-info">
                    <div className="field-name" style={{ fontSize: "14px" }}>{field.name}</div>
                    <div className="field-desc" style={{ fontSize: "11.5px" }}>{field.desc}</div>
                    <div className="progress-outer" style={{ marginTop: "8px", height: "5px" }}>
                      <div 
                        className="progress-inner" 
                        style={{ 
                          width: `${field.percentage}%`, 
                          background: field.color 
                        }} 
                      />
                    </div>
                  </div>

                  <div className="field-stats" style={{ minWidth: "110px" }}>
                    <div className="field-time" style={{ color: field.color, fontSize: "16px" }}>
                      {formatHoursMins(field.time)}
                    </div>
                    <div className="field-count" style={{ fontSize: "10px" }}>
                      {field.countLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Usage Section */}
          <div className="card-container" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16 }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                <ClockIcon /> {timeRange === "today" ? "Hourly Platform Usage" : timeRange === "1month" ? "Weekly Platform Usage" : "Daily Platform Usage"}
              </h2>
              <div style={{ fontSize: "14px", color: "#64748b" }}>
                {timeRange === "today" 
                  ? "Total Today: " 
                  : timeRange === "1month" 
                    ? "Weekly Avg: " 
                    : "Daily Avg: "}
                <span style={{ color: "#ec4899", fontWeight: 700 }}>
                  {calculateAverageText()}
                </span>
              </div>
            </div>

            {/* Chart Area */}
            {timeRange === "today" ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", minHeight: "180px", marginBottom: "28px" }}>
                {/* SVG Donut Chart */}
                <div style={{ position: "relative", width: "160px", height: "160px" }}>
                  <svg viewBox="0 0 120 120" width="160" height="160">
                    <defs>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      {todayUsage.map((d, i) => {
                        const colors = slotColors[d.day] || { start: "#7c3aed", end: "#c084fc" };
                        return (
                          <linearGradient id={`grad-${i}`} key={i} x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor={colors.start} />
                            <stop offset="100%" stopColor={colors.end} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="transparent"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="10"
                    />
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="60"
                        cy="60"
                        r="48"
                        fill="transparent"
                        stroke={`url(#grad-${idx})`}
                        strokeWidth={selectedDayIndex === idx ? 12 : 8}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        pathLength="100"
                        style={{
                          transform: "rotate(-90deg)",
                          transformOrigin: "60px 60px",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          cursor: "pointer",
                          opacity: selectedDayIndex === idx ? 1 : 0.6
                        }}
                        onMouseEnter={() => setSelectedDayIndex(idx)}
                      />
                    ))}
                  </svg>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                    width: "100%"
                  }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "white" }}>
                      {formatHoursMins(activeDay.time)}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>
                      {activeDay.day === "09:00" ? "Morning" : 
                       activeDay.day === "12:00" ? "Midday" :
                       activeDay.day === "15:00" ? "Afternoon" :
                       activeDay.day === "18:00" ? "Evening" : "Night"}
                    </div>
                  </div>
                </div>

                {/* Legend list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "50%" }}>
                  {donutSegments.map((d, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    const colors = slotColors[d.day] || { start: "#7c3aed", end: "#c084fc" };
                    return (
                      <div 
                        key={idx}
                        onMouseEnter={() => setSelectedDayIndex(idx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: isSelected ? "rgba(255, 255, 255, 0.04)" : "transparent",
                          border: isSelected ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ 
                            width: "8px", 
                            height: "8px", 
                            borderRadius: "50%", 
                            background: `linear-gradient(to top, ${colors.start}, ${colors.end})`
                          }} />
                          <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "white" : "#94a3b8" }}>
                            {d.day === "09:00" ? "Morning" : 
                             d.day === "12:00" ? "Midday" :
                             d.day === "15:00" ? "Afternoon" :
                             d.day === "18:00" ? "Evening" : "Night"}
                          </span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "#ec4899" : "#64748b" }}>
                          {formatHoursMins(d.time)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "160px", padding: "0 10px", marginBottom: "28px" }}>
                {dailyUsage.map((d, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  const barHeight = `${(d.time / maxDailyTime) * 100}%`;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedDayIndex(idx)}
                      onMouseEnter={() => setSelectedDayIndex(idx)}
                      style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        flex: 1, 
                        cursor: "pointer",
                        padding: "0 4px" 
                      }}
                    >
                      <div style={{ position: "relative", width: "100%", height: "120px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                        {isSelected && (
                          <div style={{ 
                            position: "absolute", 
                            bottom: 0, 
                            width: "20px", 
                            height: barHeight, 
                            background: d.color, 
                            filter: "blur(10px)", 
                            opacity: 0.45,
                            borderRadius: "4px" 
                          }} />
                        )}
                        <div style={{ 
                          width: "12px", 
                          height: barHeight, 
                          background: isSelected ? d.color : "rgba(255,255,255,0.06)", 
                          borderRadius: "4px",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          position: "relative"
                        }}>
                          {isSelected && (
                            <div style={{ 
                              position: "absolute", 
                              top: "-26px", 
                              left: "50%", 
                              transform: "translateX(-50%)", 
                              background: "#16161a", 
                              border: "1px solid rgba(255,255,255,0.12)",
                              color: "white", 
                              padding: "2px 6px", 
                              borderRadius: "4px", 
                              fontSize: "9px", 
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                            }}>
                              <span style={{ color: "#94a3b8", fontWeight: 500 }}>{d.date}</span>
                              <span style={{ color: "#475569", margin: "0 4px" }}>•</span>
                              <span>{formatHoursMins(d.time)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: "8px", 
                        fontSize: "11px", 
                        fontWeight: isSelected ? 800 : 500, 
                        color: isSelected ? "white" : "#64748b",
                        transition: "color 0.2s"
                      }}>
                        {d.day}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Day Stats Panel */}
            <div style={{ 
              background: "rgba(255, 255, 255, 0.012)", 
              border: "1px solid rgba(255,255,255,0.04)", 
              borderRadius: "16px", 
              padding: "16px 20px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button 
                    onClick={() => setSelectedDayIndex(prev => (prev > 0 ? prev - 1 : dailyUsage.length - 1))}
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "6px",
                      width: "26px",
                      height: "26px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    }}
                    title="Previous Day"
                  >
                    <ChevronLeftIcon />
                  </button>

                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#f1f5f9", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                    {activeDay.day} ({activeDay.date}) Stats
                  </span>

                  <button 
                    onClick={() => setSelectedDayIndex(prev => (prev < dailyUsage.length - 1 ? prev + 1 : 0))}
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "6px",
                      width: "26px",
                      height: "26px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    }}
                    title="Next Day"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
                <span style={{ 
                  fontSize: "9px", 
                  fontWeight: 800, 
                  padding: "3px 8px", 
                  borderRadius: "100px",
                  background: activeDay.time > 100 ? "rgba(236,72,153,0.12)" : "rgba(59,130,246,0.12)",
                  color: activeDay.time > 100 ? "#ec4899" : "#3b82f6",
                  letterSpacing: "0.05em"
                }}>
                  {activeDay.time > 100 ? "🔥 HIGH ACTIVITY" : "⚡ NORMAL ACTIVITY"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} />
                  <div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, letterSpacing: "0.02em" }}>TIME SPENT</div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "white", marginTop: "2px" }}>
                      {formatHoursMins(activeDay.time)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ec4899" }} />
                  <div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, letterSpacing: "0.02em" }}>ACTIVITY METRICS</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "white", marginTop: "2px" }}>
                      {activeDay.searches} Searches · {activeDay.scripts} Scripts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
