import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

const fmtTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const diff = (now - dt) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return dt.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getInitial = (name = "") => (name[0] || "?").toUpperCase();

const IG_GRAD = "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)";

export default function InstagramInboxPage() {
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notConnected, setNotConnected] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchConversations = async () => {
    try {
      const convRes = await api.get("/instagram/dm/inbox");
      setConversations(convRes.data.conversations || []);
    } catch (e) {
      setError("Failed to load inbox.");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get("/instagram/profile");
        if (!profileRes.data?.isConnected) { setNotConnected(true); setLoading(false); return; }
        setProfile(profileRes.data.profile);
        await fetchConversations();
      } catch { setError("Failed to load inbox."); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      // data: { conversationId, participantIgId, message, unreadCount }
      setConversations(prev => {
        let exists = false;
        const updated = prev.map(c => {
          if (c._id === data.conversationId) {
            exists = true;
            return {
              ...c,
              messages: [...(c.messages || []), data.message],
              lastMessageText: data.message.text,
              lastMessageAt: data.message.sentAt,
              unreadCount: data.unreadCount
            };
          }
          return c;
        });
        if (!exists) {
          fetchConversations();
        }
        return updated;
      });

      // Update current messages if we are viewing this conversation
      if (selected && selected._id === data.conversationId) {
        setMessages(prev => {
          // Guard against duplicates
          if (prev.some(m => m.igMessageId === data.message.igMessageId || m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    };
    socket.on("new_dm", handler);
    return () => socket.off("new_dm", handler);
  }, [socket, selected]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectConversation = (conv) => {
    setSelected(conv);
    setMessages(conv.messages || []);
    setSendError("");
    
    // Clear unread count locally when selected
    if (conv.unreadCount > 0) {
      setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
      // TODO: Tell backend to mark as read
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected || sending) return;
    const participantIgId = selected.participantIgId;
    if (!participantIgId) { setSendError("Cannot determine recipient."); return; }
    
    setSending(true); setSendError("");
    try {
      const res = await api.post(`/instagram/dm/${participantIgId}/send`, { message: reply.trim() });
      const newMsg = res.data.message;
      
      setMessages(prev => [...prev, newMsg]);
      setConversations(prev => prev.map(c => {
        if (c._id === selected._id) {
          return {
            ...c,
            messages: [...(c.messages || []), newMsg],
            lastMessageText: newMsg.text,
            lastMessageAt: newMsg.sentAt
          };
        }
        return c;
      }));
      setReply("");
    } catch (e) { setSendError(e?.response?.data?.message || "Failed to send."); }
    finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(236,72,153,0.2)", borderTopColor: "#ec4899", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notConnected) return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center", padding: 40 }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>📸</div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>Instagram Not Connected</h2>
      <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 360, lineHeight: 1.7 }}>Connect your Instagram Business account to view your DM inbox.</p>
      <button onClick={() => window.dispatchEvent(new CustomEvent("viralrush_navigate", { detail: "connect" }))}
        style={{ background: IG_GRAD, border: "none", borderRadius: 12, padding: "13px 30px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 24px rgba(236,72,153,0.35)" }}>
        Connect Instagram →
      </button>
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 80px)", background: "#0d0d0d", display: "flex", overflow: "hidden", fontFamily: "var(--font-ui)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", margin: "16px" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .conv-item{transition:background 0.15s,border-color 0.15s;}
        .conv-item:hover{background:rgba(255,255,255,0.06)!important;}
        .msg-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:12px 16px;color:#fff;font-size:14px;resize:none;outline:none;width:100%;box-sizing:border-box;font-family:inherit;transition:border-color 0.2s;}
        .msg-input:focus{border-color:rgba(236,72,153,0.5);}
        .msg-input::placeholder{color:rgba(255,255,255,0.3);}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:rgba(236,72,153,0.3);border-radius:4px;}
      `}</style>

      {/* ── LEFT: Conversations Sidebar ── */}
      <div style={{
        width: isMobile ? "100%" : 300, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: isMobile && selected ? "none" : "flex", flexDirection: "column",
        background: "#111"
      }}>
        {/* Header */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: IG_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)" }}>Instagram DMs</div>
              {profile && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>@{profile.username}</div>}
            </div>
          </div>
          {/* Search box */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search conversations…" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "8px 10px 8px 30px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {error && <div style={{ padding: 20, color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center" }}>{error}</div>}
          {!error && conversations.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No conversations yet</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>When your followers DM you, their messages will appear here.</div>
              <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
                Note: Requires <strong style={{ color: "rgba(255,255,255,0.6)" }}>instagram_manage_messages</strong> permission approved in Meta App Review.
              </div>
            </div>
          )}
          {conversations.map((conv) => {
            const isActive = selected?._id === conv._id;
            const participantName = conv.participantName || conv.participantIgId || "Instagram User";
            
            return (
              <div key={conv._id} className="conv-item" onClick={() => selectConversation(conv)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", background: isActive ? "rgba(236,72,153,0.1)" : "transparent", borderLeft: `3px solid ${isActive ? "#ec4899" : "transparent"}` }}>
                {/* Avatar */}
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: IG_GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                  {getInitial(participantName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {participantName}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0, marginLeft: 6 }}>
                      {fmtTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12, color: conv.unreadCount > 0 ? "#fff" : "rgba(255,255,255,0.45)", fontWeight: conv.unreadCount > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.lastMessageText || "Tap to view messages"}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div style={{ background: "#ec4899", color: "#fff", borderRadius: 10, padding: "2px 6px", fontSize: 10, fontWeight: 800 }}>
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Message Thread ── */}
      {!selected ? (
        <div style={{ flex: 1, display: isMobile ? "none" : "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#0d0d0d" }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Select a conversation</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Choose a DM from the list to start chatting</div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d0d0d" }}>
          {/* Thread Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12, background: "#111" }}>
            {isMobile && (
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 0, display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: IG_GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0 }}>
              {getInitial(selected.participantName || selected.participantIgId)}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{selected.participantName || selected.participantIgId || "Instagram User"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Instagram DM</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 100, padding: "4px 12px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899", boxShadow: "0 0 6px #ec4899" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f472b6" }}>Instagram</span>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No messages to show.</div>
            )}
            {messages.map((msg, i) => {
              const isMine = msg.isFromMe;
              return (
                <div key={msg.igMessageId || msg._id || i} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", animation: "fadeUp 0.25s ease" }}>
                  {!isMine && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 3, marginLeft: 4 }}>
                      {msg.senderName || selected.participantName || "User"}
                    </div>
                  )}
                  <div style={{
                    maxWidth: "68%", padding: "10px 15px", borderRadius: 18,
                    borderBottomRightRadius: isMine ? 4 : 18,
                    borderBottomLeftRadius: isMine ? 18 : 4,
                    background: isMine ? IG_GRAD : "rgba(255,255,255,0.08)",
                    color: "#fff", fontSize: 14, lineHeight: 1.55, wordBreak: "break-word",
                    boxShadow: isMine ? "0 4px 16px rgba(220,39,67,0.25)" : "none"
                  }}>
                    {msg.text || <em style={{ opacity: 0.5 }}>[attachment]</em>}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, marginLeft: 4, marginRight: 4 }}>
                    {fmtTime(msg.sentAt)}
                    {isMine && <span style={{ marginLeft: 4, color: "#f472b6" }}>✓</span>}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "#111" }}>
            {sendError && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>⚠️ {sendError}</div>}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                className="msg-input"
                rows={1} placeholder="Reply to this DM…"
                value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              />
              <button onClick={sendReply} disabled={!reply.trim() || sending}
                style={{
                  width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
                  background: reply.trim() && !sending ? IG_GRAD : "rgba(255,255,255,0.08)",
                  cursor: reply.trim() && !sending ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", boxShadow: reply.trim() ? "0 4px 16px rgba(220,39,67,0.3)" : "none"
                }}>
                {sending ? (
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8, textAlign: "center" }}>
              Messages are sent via Meta Graph API · instagram_manage_messages required
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
