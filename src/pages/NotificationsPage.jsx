import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#3b82f6"];
const colorFor = (s = "") => COLORS[s.charCodeAt(0) % COLORS.length];
const getInitials = (n = "") => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ── Icons ── */
function BellIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function UsersIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ClockIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function XIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

/* ── Spinner ── */
function Spinner({ color = "#6366f1" }) {
  return (
    <div style={{ width: 22, height: 22, border: `2.5px solid ${color}25`, borderTopColor: color, borderRadius: "50%", animation: "notif-spin 0.7s linear infinite" }} />
  );
}

/* ── Empty state ── */
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "rgba(255,255,255,0.2)" }}>
        {icon}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}

export default function NotificationsPage({ notifications, onAddReminder, onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");
  const { socket } = useSocket();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get("/community/notifications")
      .then(r => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoadingReqs(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      setRequests(prev => [notif, ...prev]);
      showToast(`New request from @${notif.senderId?.username}`);
    };
    socket.on("new_community_request", handler);
    return () => socket.off("new_community_request", handler);
  }, [socket]);

  const handleAccept = async (id) => {
    setActionLoading(a => ({ ...a, [id]: "accept" }));
    try {
      await api.post(`/community/notifications/${id}/accept`);
      showToast("Community created! Redirecting…");
      setRequests(prev => prev.map(n => n._id === id ? { ...n, status: "accepted" } : n));
      setTimeout(() => onNavigate?.("search"), 1500);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to accept", "error");
    } finally {
      setActionLoading(a => ({ ...a, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading(a => ({ ...a, [id]: "reject" }));
    try {
      await api.post(`/community/notifications/${id}/reject`);
      showToast("Request rejected.");
      setRequests(prev => prev.map(n => n._id === id ? { ...n, status: "rejected" } : n));
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to reject", "error");
    } finally {
      setActionLoading(a => ({ ...a, [id]: null }));
    }
  };

  const pendingCount = requests.filter(n => n.status === "pending").length;
  const remindersCount = notifications?.length || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", padding: "56px 36px 80px", fontFamily: "var(--font-ui)", color: "#fff" }}>
      <style>{`
        @keyframes notif-spin { to { transform: rotate(360deg); } }
        @keyframes notif-slide { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes notif-fade { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .notif-card { animation: notif-fade 0.35s ease both; }
        .notif-card:nth-child(1) { animation-delay: 0.04s; }
        .notif-card:nth-child(2) { animation-delay: 0.08s; }
        .notif-card:nth-child(3) { animation-delay: 0.12s; }
        .notif-card:nth-child(4) { animation-delay: 0.16s; }
        .notif-card:nth-child(5) { animation-delay: 0.20s; }
        .notif-accept-btn:hover { background: linear-gradient(135deg,#10b981,#059669) !important; box-shadow: 0 6px 18px rgba(16,185,129,0.4) !important; }
        .notif-reject-btn:hover { background: rgba(239,68,68,0.25) !important; border-color: rgba(239,68,68,0.6) !important; }
        .notif-tab-btn:hover { color: rgba(255,255,255,0.8) !important; }
        .notif-reminder-item:hover { border-color: rgba(245,158,11,0.3) !important; background: rgba(245,158,11,0.06) !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#10b981,#059669)",
          color: "#fff", borderRadius: 14, padding: "14px 22px",
          fontWeight: 700, fontSize: 13.5, boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          animation: "notif-slide 0.3s ease", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>{toast.type === "error" ? "⚠️" : "✓"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 40, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, padding: "5px 14px", marginBottom: 14 }}>
            <BellIcon size={12} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase" }}>Activity Center</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-primary)", lineHeight: 1.15 }}>
            Notifications
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            Community requests, reminders, and activity updates.
          </p>
        </div>

        {/* Add Reminder button */}
        <button
          id="add-reminder-btn"
          onClick={onAddReminder}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            border: "none", borderRadius: 12, padding: "12px 20px",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 6px 20px rgba(245,158,11,0.3)",
            transition: "all 0.25s ease", flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(245,158,11,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,158,11,0.3)"; }}
        >
          <PlusIcon /> Add Reminder
        </button>
      </div>

      {/* Tab selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 4, width: "fit-content" }}>
        {[
          { id: "requests", label: "Community Requests", count: pendingCount, color: "#6366f1" },
          { id: "reminders", label: "Reminders", count: remindersCount, color: "#f59e0b" },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className="notif-tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                fontFamily: "var(--font-primary)", cursor: "pointer",
                border: isActive ? `1px solid ${tab.color}40` : "1px solid transparent",
                background: isActive ? `${tab.color}18` : "transparent",
                color: isActive ? tab.color : "rgba(255,255,255,0.4)",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: isActive ? tab.color : "rgba(255,255,255,0.1)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                  borderRadius: 100, padding: "1px 8px", fontSize: 11, fontWeight: 800,
                  minWidth: 20, textAlign: "center",
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── REQUESTS TAB ── */}
      {activeTab === "requests" && (
        <div>
          {loadingReqs ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Spinner color="#6366f1" />
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<UsersIcon size={28} />}
              title="No community requests yet"
              sub="When someone sends you a connection request, it will appear here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {requests.map((notif, idx) => {
                const sender = notif.senderId || {};
                const isPending = notif.status === "pending";
                const isAccepted = notif.status === "accepted";
                const color = colorFor(sender.username || "");

                return (
                  <div
                    key={notif._id}
                    className="notif-card"
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      background: isPending ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isPending ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 18, padding: "16px 20px",
                      opacity: isPending ? 1 : 0.65,
                      transition: "all 0.25s",
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    {/* left accent bar for pending */}
                    {isPending && (
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#6366f1,#8b5cf6)", borderRadius: "18px 0 0 18px" }} />
                    )}

                    {/* Avatar */}
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg,${color},${color}99)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 16, color: "#fff",
                      boxShadow: `0 4px 16px ${color}40`,
                    }}>
                      {getInitials(sender.name || sender.username || "")}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: "#fff" }}>@{sender.username || "Unknown"}</span>
                        {isPending && (
                          <span style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 100, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Pending
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
                        {sender.niche && <span>{sender.niche}</span>}
                        {sender.niche && sender.platform && <span>·</span>}
                        {sender.platform && <span>{sender.platform}</span>}
                        {(sender.niche || sender.platform) && <span>·</span>}
                        <ClockIcon size={11} />
                        <span>{timeAgo(notif.createdAt)}</span>
                      </div>
                      {!isPending && (
                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: isAccepted ? "#10b981" : "#f87171" }}>
                          {isAccepted ? <><CheckIcon /> Accepted</> : <><XIcon /> Rejected</>}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {isPending && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button
                          id={`accept-${notif._id}`}
                          className="notif-accept-btn"
                          onClick={() => handleAccept(notif._id)}
                          disabled={!!actionLoading[notif._id]}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "9px 16px", borderRadius: 10, border: "none",
                            background: "rgba(16,185,129,0.15)",
                            outline: "1px solid rgba(16,185,129,0.4)",
                            color: "#10b981", fontWeight: 700, fontSize: 12.5,
                            cursor: actionLoading[notif._id] ? "not-allowed" : "pointer",
                            transition: "all 0.2s", minWidth: 90, justifyContent: "center",
                          }}
                        >
                          {actionLoading[notif._id] === "accept" ? <Spinner color="#10b981" /> : <><CheckIcon /> Accept</>}
                        </button>
                        <button
                          id={`reject-${notif._id}`}
                          className="notif-reject-btn"
                          onClick={() => handleReject(notif._id)}
                          disabled={!!actionLoading[notif._id]}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "9px 16px", borderRadius: 10,
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171", fontWeight: 700, fontSize: 12.5,
                            cursor: actionLoading[notif._id] ? "not-allowed" : "pointer",
                            transition: "all 0.2s", minWidth: 90, justifyContent: "center",
                          }}
                        >
                          {actionLoading[notif._id] === "reject" ? <Spinner color="#f87171" /> : <><XIcon /> Reject</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REMINDERS TAB ── */}
      {activeTab === "reminders" && (
        <div>
          {!notifications || notifications.length === 0 ? (
            <EmptyState
              icon={<BellIcon size={28} />}
              title="No reminders yet"
              sub='Click "Add Reminder" to schedule a content reminder for yourself.'
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifications.map((n, i) => (
                <div
                  key={n._id}
                  className={`notif-card notif-reminder-item`}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: "rgba(245,158,11,0.04)",
                    border: "1px solid rgba(245,158,11,0.12)",
                    borderRadius: 16, padding: "16px 20px",
                    transition: "all 0.2s",
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b",
                  }}>
                    <BellIcon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{n.message}</div>
                    {n.remindAt && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 5 }}>
                        <ClockIcon size={11} />
                        {new Date(n.remindAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "#f59e0b",
                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 100, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>
                    Reminder
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
