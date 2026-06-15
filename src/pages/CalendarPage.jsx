import { useState, useMemo } from "react";

// Platform icons as custom SVG React components
const instagramIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const youtubeIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const tiktokIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const globalIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const checkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const trashIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const plusIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function CalendarPage({
  editingCalendarId,
  calendarForm,
  setCalendarForm,
  calendarError,
  saveCalendar,
  showCalendarBox = true, // We will enforce the gorgeous calendar grid as always visible
  setShowCalendarBox,
  monthLabel,
  setCalendarMonth,
  calendarMatrix,
  tasksByDay,
  startEditCalendar,
  deleteCalendar,
  calendarItems = [],
  setEditingCalendarId,
  setCalendarError,
}) {
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Format date helper
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Helper to resolve platform background styling
  const getPlatformStyle = (platform = "") => {
    const p = platform.toLowerCase();
    if (p.includes("instagram")) return { icon: instagramIcon, color: "#E1306C", bg: "rgba(225,48,108,0.12)", border: "rgba(225,48,108,0.35)" };
    if (p.includes("youtube")) return { icon: youtubeIcon, color: "#FF0000", bg: "rgba(255,0,0,0.12)", border: "rgba(255,0,0,0.35)" };
    if (p.includes("tiktok")) return { icon: tiktokIcon, color: "#00f2fe", bg: "rgba(0,242,254,0.12)", border: "rgba(0,242,254,0.35)" };
    return { icon: globalIcon, color: "#5b2eff", bg: "rgba(91,46,255,0.12)", border: "rgba(91,46,255,0.35)" };
  };

  // Helper to resolve status badge styling
  const getStatusStyle = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("complete")) return { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" };
    if (s.includes("active")) return { color: "#0a84ff", bg: "rgba(10,132,255,0.12)", border: "rgba(10,132,255,0.3)" };
    return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" };
  };

  // Filtered task items for list view
  const filteredTasks = useMemo(() => {
    return (calendarItems || []).filter((item) => {
      const matchPlatform = filterPlatform === "All" || item.platform?.toLowerCase().includes(filterPlatform.toLowerCase());
      const matchStatus = filterStatus === "All" || item.status === filterStatus;
      return matchPlatform && matchStatus;
    });
  }, [calendarItems, filterPlatform, filterStatus]);

  // Calendar Completion Stats
  const completionRate = useMemo(() => {
    if (!calendarItems || calendarItems.length === 0) return 0;
    const completed = calendarItems.filter(item => item.status === "Complete").length;
    return Math.round((completed / calendarItems.length) * 100);
  }, [calendarItems]);

  return (
    <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto", animation: "slideUp 0.4s ease both" }}>
      
      {/* Styles */}
      <style>{`
        .calendar-grid-cell {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, box-shadow 0.2s;
        }
        .calendar-grid-cell:hover {
          transform: translateY(-2px);
          border-color: rgba(91,46,255,0.6) !important;
          box-shadow: 0 6px 20px rgba(91,46,255,0.15);
        }
        .input-glow:focus {
          outline: none;
          border-color: #5b2eff !important;
          box-shadow: 0 0 0 3px rgba(91,46,255,0.18);
        }
        .card-anim {
          animation: slideUp 0.5s ease both;
        }
      `}</style>

      {/* Page Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.03em", fontFamily: "var(--font-primary)", color: "#fff", margin: 0 }}>
            📅 Content Planner
          </h2>
          <p style={{ fontSize: 13, color: "#BDBDBD", marginTop: 4, fontFamily: "var(--font-ui)", fontWeight: 300 }}>
            Schedule and synchronize your brand automation, reels, and video deliverables
          </p>
        </div>

        {/* Dynamic Completion Stat Banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(91,46,255,0.15), rgba(124,58,237,0.05))",
          border: "1px solid rgba(91,46,255,0.3)",
          borderRadius: 16,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 4px 20px rgba(91,46,255,0.08)"
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Monthly Success</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#a78bfa", marginTop: 2 }}>{completionRate}% Complete</div>
          </div>
          {/* Circular progress track */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `conic-gradient(#5b2eff 0% ${completionRate}%, rgba(255,255,255,0.08) ${completionRate}% 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>
              ⚡
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", lgGridTemplateColumns: "350px 1fr", gap: 28 }} className="grid lg:grid-cols-[350px_1fr]">
        
        {/* Left Column: Form & Controller */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Floating futuristic Control Card */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 24,
            padding: 24,
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)", display: "flex", alignItems: "center", gap: 8, margin: "0 0 20px" }}>
              <span style={{ display: "flex", width: 8, height: 8, borderRadius: "50%", background: "#5b2eff", boxShadow: "0 0 10px #5b2eff" }} />
              {editingCalendarId ? "⚡ Edit Plan" : "✨ Create New Plan"}
            </h3>

            {/* Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Plan Title *</label>
                <input
                  className="input-glow"
                  type="text"
                  placeholder="e.g. Instagram Reels Strategy"
                  value={calendarForm.title}
                  onChange={(e) => setCalendarForm((s) => ({ ...s, title: e.target.value }))}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "11px 14px",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13.5
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Scheduled Date *</label>
                <input
                  className="input-glow"
                  type="date"
                  value={calendarForm.scheduledAt}
                  onChange={(e) => setCalendarForm((s) => ({ ...s, scheduledAt: e.target.value }))}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "11px 14px",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13.5
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Platform</label>
                  <select
                    className="input-glow"
                    value={calendarForm.platform}
                    onChange={(e) => setCalendarForm((s) => ({ ...s, platform: e.target.value }))}
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "11px 14px",
                      borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(17,17,17,0.9)", color: "#fff", fontSize: 13
                    }}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Content Type</label>
                  <select
                    className="input-glow"
                    value={calendarForm.contentType}
                    onChange={(e) => setCalendarForm((s) => ({ ...s, contentType: e.target.value }))}
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "11px 14px",
                      borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(17,17,17,0.9)", color: "#fff", fontSize: 13
                    }}
                  >
                    <option value="Reel">Reel</option>
                    <option value="Short">Short</option>
                    <option value="Post">Post</option>
                    <option value="Video">Video</option>
                    <option value="Story">Story</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Status</label>
                <select
                  className="input-glow"
                  value={calendarForm.status}
                  onChange={(e) => setCalendarForm((s) => ({ ...s, status: e.target.value }))}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "11px 14px",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(17,17,17,0.9)", color: "#fff", fontSize: 13.5
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            </div>

            {calendarError && (
              <p style={{ margin: "14px 0 0", fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                ⚠️ {calendarError}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
              <button
                onClick={saveCalendar}
                style={{
                  flex: 1, minWidth: 120,
                  background: "linear-gradient(135deg, #5b2eff, #7c3aed)",
                  border: "none", color: "#fff", padding: "12px 18px",
                  borderRadius: 12, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  boxShadow: "0 4px 16px rgba(91,46,255,0.3)", transition: "opacity 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                {plusIcon}
                {editingCalendarId ? "Update Plan" : "Add Plan"}
              </button>

              {editingCalendarId && (
                <button
                  onClick={() => {
                    setEditingCalendarId(null);
                    setCalendarForm({ title: "", platform: "Instagram", contentType: "Reel", scheduledAt: "", status: "Pending" });
                    setCalendarError("");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)", padding: "12px 18px",
                    borderRadius: 12, fontSize: 13, fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Month Calendar View + Active Plans List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Master Month Grid View */}
          {showCalendarBox && (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
            }}>
              {/* Header: Prev, Month, Next */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "rgba(255,255,255,0.7)", padding: "6px 12px",
                    fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                  }}
                >
                  ◀ Prev
                </button>
                
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "0.04em", fontFamily: "var(--font-primary)" }}>
                  {monthLabel}
                </p>

                <button
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "rgba(255,255,255,0.7)", padding: "6px 12px",
                    fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                  }}
                >
                  Next ▶
                </button>
              </div>

              {/* Day Labels */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <p key={day} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: 0 }}>
                    {day}
                  </p>
                ))}
              </div>

              {/* Grid cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                {calendarMatrix.map((dateCell, idx) => {
                  if (!dateCell) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        style={{
                          minHeight: 85, borderRadius: 16,
                          background: "rgba(255,255,255,0.01)",
                          border: "1px dashed rgba(255,255,255,0.02)"
                        }}
                      />
                    );
                  }

                  const dateKey = `${dateCell.getFullYear()}-${String(dateCell.getMonth() + 1).padStart(2, "0")}-${String(dateCell.getDate()).padStart(2, "0")}`;
                  const tasks = tasksByDay[dateKey] || [];
                  const isToday = new Date().toDateString() === dateCell.toDateString();

                  return (
                    <div
                      key={dateKey}
                      className="calendar-grid-cell"
                      onClick={() => {
                        // Pre-fill the date field with clicked cell date!
                        setCalendarForm((s) => ({ ...s, scheduledAt: dateKey }));
                      }}
                      style={{
                        minHeight: 85, borderRadius: 16, cursor: "pointer",
                        border: `1.5px solid ${isToday ? "rgba(91,46,255,0.4)" : "rgba(255,255,255,0.05)"}`,
                        background: isToday ? "rgba(91,46,255,0.06)" : "rgba(255,255,255,0.02)",
                        padding: 8, boxSizing: "border-box", display: "flex", flexDirection: "column",
                        justifyContent: "space-between", position: "relative",
                      }}
                    >
                      {/* Date Bubble */}
                      <span style={{
                        fontSize: 12, fontWeight: 800,
                        color: isToday ? "#a78bfa" : "rgba(255,255,255,0.7)",
                        width: 20, height: 20, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isToday ? "rgba(91,46,255,0.25)" : "transparent"
                      }}>
                        {dateCell.getDate()}
                      </span>

                      {/* Task bubble stack */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, flex: 1, justifyContent: "flex-end" }}>
                        {tasks.slice(0, 2).map((task) => {
                          const pStyle = getPlatformStyle(task.platform);
                          const sStyle = getStatusStyle(task.status);
                          return (
                            <div
                              key={task._id}
                              style={{
                                fontSize: 9, fontWeight: 700, padding: "2px 6px",
                                borderRadius: 6, background: pStyle.bg, color: pStyle.color,
                                border: `1px solid ${pStyle.border}`,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                display: "flex", alignItems: "center", gap: 3
                              }}
                              title={`${task.title} (${task.status})`}
                            >
                              {pStyle.icon}
                              {task.title}
                            </div>
                          );
                        })}
                        {tasks.length > 2 && (
                          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.3)", paddingLeft: 4 }}>
                            +{tasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom List Header & Filters */}
          <div style={{
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 24,
            padding: "20px 24px",
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "space-between", gap: 16
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "var(--font-primary)" }}>
              📝 Scheduled Content ({filteredTasks.length})
            </h4>

            {/* Platform & Status Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, color: "rgba(255,255,255,0.7)", padding: "6px 10px", fontSize: 11.5,
                  cursor: "pointer", outline: "none"
                }}
              >
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, color: "rgba(255,255,255,0.7)", padding: "6px 10px", fontSize: 11.5,
                  cursor: "pointer", outline: "none"
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>

          {/* Active Plans List cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredTasks.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px", borderRadius: 20,
                background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.05)"
              }}>
                <span style={{ fontSize: 24 }}>🍃</span>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8, margin: 0 }}>No plans matches the active filters.</p>
              </div>
            ) : (
              filteredTasks.map((c, index) => {
                const pStyle = getPlatformStyle(c.platform);
                const sStyle = getStatusStyle(c.status);
                return (
                  <div
                    key={c._id}
                    className="card-anim"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 18, padding: "16px 20px",
                      display: "flex", flexWrap: "wrap",
                      alignItems: "center", justifyContent: "space-between", gap: 16,
                      animationDelay: `${index * 0.08}s`
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Platform Icon Badge */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        background: pStyle.bg, color: pStyle.color,
                        border: `1px solid ${pStyle.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, flexShrink: 0
                      }}>
                        {pStyle.icon}
                      </div>

                      {/* Details */}
                      <div>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", margin: 0 }}>{c.title}</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                            {formatDate(c.scheduledAt)}
                          </span>
                          <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                          <span style={{ fontSize: 11, color: pStyle.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {c.contentType || "Post"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Status pill */}
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 12px",
                        borderRadius: 100, background: sStyle.bg, color: sStyle.color,
                        border: `1px solid ${sStyle.border}`, textTransform: "uppercase", letterSpacing: "0.04em"
                      }}>
                        {c.status || "Pending"}
                      </span>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => startEditCalendar(c)}
                          title="Edit Plan"
                          style={{
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                            width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                            color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#0a84ff"; e.currentTarget.style.borderColor = "rgba(10,132,255,0.3)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                        >
                          ✏️
                        </button>
                        
                        <button
                          onClick={() => deleteCalendar(c._id)}
                          title="Delete Plan"
                          style={{
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                            width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                            color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                        >
                          {trashIcon}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
