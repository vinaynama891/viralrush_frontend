import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";

const IG_GRAD = "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)";

const fmtTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const diff = (now - dt) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.floor(diff / 86400);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return dt.toLocaleDateString([], { weekday: "short" });
  return dt.toLocaleDateString([], { month: "short", day: "numeric" });
};

const fmtDaySep = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const diff = (now - dt) / 86400000;
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  if (diff < 7) return dt.toLocaleDateString([], { weekday: "long" });
  return dt.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
};

const getInitial = (n = "") => (n[0] || "?").toUpperCase();

const colorFor = (s = "") => {
  const cols = ["#e6683c", "#dc2743", "#cc2366", "#bc1888", "#8b5cf6", "#0ea5e9"];
  return cols[(s.charCodeAt(0) || 0) % cols.length];
};

function groupMessages(msgs) {
  const items = [];
  let lastDay = null;
  const sorted = [...msgs].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  sorted.forEach((msg) => {
    const day = new Date(msg.sentAt).toDateString();
    if (day !== lastDay) {
      items.push({ type: "date", label: fmtDaySep(msg.sentAt), key: `d-${day}` });
      lastDay = day;
    }
    items.push({ type: "msg", msg });
  });
  return items;
}

export default function DMInbox() {
  const [igUserId, setIgUserId]         = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]         = useState(null);
  const [reply, setReply]               = useState("");
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [sendError, setSendError]       = useState("");
  const [syncError, setSyncError]       = useState(null);
  const [tokenDebug, setTokenDebug]     = useState(null);
  const [showDiag, setShowDiag]         = useState(false);
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 640);
  const endRef = useRef(null);

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", r, { passive: true });
    return () => window.removeEventListener("resize", r);
  }, []);

  const loadInbox = async () => {
    setLoading(true);
    setSyncError(null);
    setTokenDebug(null);
    try {
      const res = await api.get("/instagram/dm/inbox");
      setIgUserId(res.data.igUserId);
      
      // Filter out any mock/seeded chats so we ONLY show actual, real messages
      const actualChats = (res.data.conversations || []).filter(
        c => !c.participantIgId.startsWith("mock_")
      );
      
      setConversations(actualChats);
      
      if (res.data.syncError) {
        setSyncError(res.data.syncError);
        setShowDiag(true);
      }
      if (res.data.tokenDebugInfo) {
        setTokenDebug(res.data.tokenDebugInfo);
      }

      if (selected) {
        const fresh = actualChats.find(c => c.participantIgId === selected.participantIgId);
        if (fresh) setSelected(fresh);
      } else if (actualChats.length > 0) {
        setSelected(actualChats[0]);
      }
    } catch (e) {
      console.error("DMInbox load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInbox(); }, []); // eslint-disable-line

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const openConversation = (conv) => {
    setSelected(conv);
    setSendError("");
    setReply("");
    setConversations(prev =>
      prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c)
    );
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected || sending) return;
    setSending(true);
    setSendError("");
    const text = reply.trim();
    setReply("");

    const newMsgId = `m-${Date.now()}`;
    const optimisticMsg = {
      _id: newMsgId,
      text,
      isFromMe: true,
      sentAt: new Date().toISOString(),
      senderId: igUserId
    };

    const updatedSelected = {
      ...selected,
      lastMessageText: text,
      lastMessageAt: new Date().toISOString(),
      messages: [...(selected.messages || []), optimisticMsg]
    };

    setSelected(updatedSelected);
    setConversations(prev => prev.map(c => c._id === selected._id ? updatedSelected : c));

    try {
      const res = await api.post(`/instagram/dm/${selected.participantIgId}/send`, { message: text });
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.map(m => m._id === newMsgId ? { ...res.data.message, _id: res.data.message._id || newMsgId } : m)
      }));
    } catch (e) {
      setSendError(e?.response?.data?.message || "Failed to send live message.");
      setSelected(prev => ({ ...prev, messages: prev.messages.filter(m => m._id !== newMsgId) }));
      setReply(text);
    } finally {
      setSending(false);
    }
  };

  const grouped = selected ? groupMessages(selected.messages || []) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ══ Live Meta Diagnostics Banner ══ */}
      {showDiag && syncError && (
        <div style={{
          background: "rgba(220,39,67,0.06)",
          border: "1px solid rgba(220,39,67,0.2)",
          borderRadius: 14,
          padding: "14px 18px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          animation: "igPop 0.3s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#dc2743", display: "flex", alignItems: "center", gap: 6 }}>
              ⚠️ META INTEGRATION DIAGNOSTICS REPORT
            </span>
            <button onClick={() => setShowDiag(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11 }}>Dismiss</button>
          </div>
          
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, marginTop: 4 }}>
            <strong>API Error Message:</strong> {syncError.message || JSON.stringify(syncError)}<br/>
            <strong>Code:</strong> {syncError.code || "N/A"} · <strong>Subcode:</strong> {syncError.error_subcode || "N/A"}<br/>
            <strong>Type:</strong> {syncError.type || "N/A"}
          </div>

          {tokenDebug && (
            <div style={{ fontSize: 12, color: "#a7f3d0", fontFamily: "monospace", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", padding: 10, borderRadius: 8, marginTop: 4 }}>
              <strong>Access Token Properties:</strong><br/>
              • <strong>Token Type:</strong> <span style={{ color: tokenDebug.type === "PAGE" ? "#34d399" : "#fb7185", fontWeight: 700 }}>{tokenDebug.type || "UNKNOWN"}</span><br/>
              • <strong>Profile Owner:</strong> {tokenDebug.profileName || "N/A"}<br/>
              • <strong>Token Status:</strong> {tokenDebug.isValid ? "✅ Valid" : "❌ Invalid / Expired"}<br/>
              • <strong>Granted Scopes:</strong> {tokenDebug.scopes?.length > 0 ? tokenDebug.scopes.join(", ") : "None"}
            </div>
          )}
        </div>
      )}

      {/* ══ DM Inbox Container ══ */}
      <div style={{
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        height: 620,
        display: "grid",
        gridTemplateColumns: isMobile
          ? (selected ? "0 1fr" : "1fr 0")
          : "280px 1fr",
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
      }}>
        <style>{`
          @keyframes igSpin{to{transform:rotate(360deg)}}
          @keyframes igPop{from{opacity:0;transform:scale(0.92) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
          .ig-thread:hover{background:rgba(255,255,255,0.04)!important;}
          .ig-inp{width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);border-radius:24px;padding:12px 20px;color:#fff;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box;}
          .ig-inp:focus{border-color:rgba(220,39,67,0.6);}
          .ig-inp::placeholder{color:rgba(255,255,255,0.28);}
          .ig-send{width:40px;height:40px;border-radius:50%;border:none;background:${IG_GRAD};cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.15s,box-shadow 0.15s;}
          .ig-send:hover{transform:scale(1.08);box-shadow:0 4px 16px rgba(220,39,67,0.4);}
          .ig-send:disabled{background:rgba(255,255,255,0.08);cursor:not-allowed;transform:none;box-shadow:none;}
          ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px;}
        `}</style>

        {/* ══ LEFT sidebar ══ */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)", background: "#0f0f0f" }}>
          {/* Header */}
          <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: IG_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>Instagram Inbox</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  {conversations.length} Live threads
                </div>
              </div>
              <button onClick={loadInbox} title="Sync/Refresh" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4, display: "flex" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? "igSpin 1s linear infinite" : "none" }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
            </div>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search chats…" className="ig-inp" style={{ padding: "8px 12px 8px 30px", borderRadius: 12 }} />
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && conversations.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 40 }}>
                <div style={{ width: 24, height: 24, border: "3px solid rgba(220,39,67,0.2)", borderTopColor: "#dc2743", borderRadius: "50%", animation: "igSpin 0.8s linear infinite" }} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Syncing live DMs…</div>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "left" }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📲</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Live Instagram Connection Active</div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 14 }}>
                  Your account is securely connected to the Meta Graph API. No active threads exist on this Instagram account yet.
                </p>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#a7f3d0" }}>👉 HOW TO TEST LIVE:</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                    1. Send a DM to your Instagram profile from a different Instagram account.
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                    2. Click the <strong>Refresh Icon 🔄</strong> at the top right of this sidebar to pull it in instantly!
                  </div>
                </div>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = selected?.participantIgId === conv.participantIgId;
                const name = conv.participantName || conv.participantIgId || "User";
                const col = colorFor(name);
                return (
                  <button key={conv._id} className="ig-thread" onClick={() => openConversation(conv)}
                    style={{
                      width: "100%", border: "none", background: isActive ? "rgba(220,39,67,0.1)" : "transparent",
                      borderLeft: `3px solid ${isActive ? "#dc2743" : "transparent"}`,
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                    }}>
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${col},${colorFor(name + "x")})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                        {getInitial(name)}
                      </div>
                      {/* Instagram ring */}
                      <div style={{ position: "absolute", inset: -2, borderRadius: "50%", background: IG_GRAD, zIndex: -1 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: conv.unreadCount > 0 ? 800 : 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {name}
                        </span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0, marginLeft: 6 }}>
                          {fmtTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        <span style={{ fontSize: 12, color: conv.unreadCount > 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.38)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
                          {conv.lastMessageText || "No messages yet"}
                        </span>
                        {conv.unreadCount > 0 && (
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#dc2743", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: "0 0 8px rgba(220,39,67,0.6)" }}>
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══ RIGHT: Thread ══ */}
        {!selected ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#0d0d0d", padding: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: IG_GRAD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 32px rgba(220,39,67,0.3)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Your Live Messages</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Select a live conversation<br/>to see all messages</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", background: "#0d0d0d" }}>
            {/* Thread header */}
            {(() => {
              const name = selected.participantName || selected.participantIgId || "User";
              const col = colorFor(name);
              return (
                <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12, background: "#111", flexShrink: 0 }}>
                  {isMobile && (
                    <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                  )}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${col},${colorFor(name + "x")})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff" }}>
                      {getInitial(name)}
                    </div>
                    <div style={{ position: "absolute", inset: -2, borderRadius: "50%", background: IG_GRAD, zIndex: -1, opacity: 0.5 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      Instagram · {(selected.messages || []).length} messages
                    </div>
                  </div>
                  {/* Info badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 100, padding: "4px 10px" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399" }}>Live Sync</span>
                  </div>
                </div>
              );
            })()}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
              {grouped.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  No messages in this conversation yet.
                </div>
              ) : grouped.map((item) => {
                if (item.type === "date") {
                  return (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0 8px" }}>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, whiteSpace: "nowrap", padding: "3px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 20 }}>{item.label}</span>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                  );
                }
                const msg = item.msg;
                const isMine = msg.isFromMe;
                return (
                  <div key={msg._id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: 4, animation: "igPop 0.2s ease" }}>
                    {!isMine && msg.senderName && (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 3, marginLeft: 4 }}>
                        {msg.senderName}
                      </div>
                    )}
                    <div style={{
                      maxWidth: "70%", padding: "10px 15px", borderRadius: 22,
                      borderBottomRightRadius: isMine ? 4 : 22,
                      borderBottomLeftRadius: isMine ? 22 : 4,
                      background: isMine ? IG_GRAD : "rgba(255,255,255,0.09)",
                      color: "#fff", fontSize: 14, lineHeight: 1.55, wordBreak: "break-word",
                      boxShadow: isMine ? "0 3px 14px rgba(220,39,67,0.25)" : "none",
                    }}>
                      {msg.text || <em style={{ opacity: 0.4 }}>[attachment]</em>}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      {fmtTime(msg.sentAt)}
                      {isMine && <span style={{ color: "#f472b6" }}>✓</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Reply bar */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "#111", flexShrink: 0 }}>
              {sendError && <div style={{ fontSize: 11, color: "#f87171", marginBottom: 8 }}>⚠️ {sendError}</div>}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input className="ig-inp" placeholder="Message…" value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                />
                <button className="ig-send" onClick={sendReply} disabled={!reply.trim() || sending}>
                  {sending ? (
                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "igSpin 0.7s linear infinite" }} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
