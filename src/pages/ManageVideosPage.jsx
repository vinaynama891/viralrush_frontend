import { useState, useEffect } from "react";
import api from "@/lib/api";

const fmt = (n) => {
  const num = parseInt(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
};

const TYPE_ICON = { IMAGE: "🖼️", VIDEO: "🎬", CAROUSEL_ALBUM: "📑" };
const TYPE_LABEL = { IMAGE: "Photo", VIDEO: "Reel", CAROUSEL_ALBUM: "Album" };

export default function ManageVideosPage() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [media, setMedia] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null); // lightbox

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get("/instagram/profile");
        if (!profileRes.data?.isConnected) {
          setNotConnected(true);
          setLoading(false);
          setMediaLoading(false);
          return;
        }
        setProfile(profileRes.data.profile);
        setLoading(false);

        // Load media + scheduled posts in parallel
        const [mediaRes, schedRes] = await Promise.allSettled([
          api.get("/instagram/media"),
          api.get("/instagram/scheduled")
        ]);
        if (mediaRes.status === "fulfilled") setMedia(mediaRes.value.data.media || []);
        else setError("Could not load posts.");
        if (schedRes.status === "fulfilled") setScheduledPosts(schedRes.value.data.scheduledPosts || []);
        setMediaLoading(false);
      } catch {
        setNotConnected(true);
        setLoading(false);
        setMediaLoading(false);
      }
    };
    loadAll();
  }, []);

  const filtered = media.filter((m) => {
    const matchType = filter === "ALL" || m.media_type === filter;
    const matchSearch = !search || (m.caption || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const typeCount = (type) => media.filter((m) => m.media_type === type).length;

  if (loading) return <LoadingScreen />;

  if (notConnected) return <NotConnectedScreen />;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff", fontFamily: "var(--font-ui)", display: "flex" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{background-position:200% 0} 50%{background-position:-200% 0} }
        .ig-skel { background:linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%); background-size:400% 100%; animation:shimmer 1.4s ease infinite; border-radius:8px; }
        .ig-media-card { position:relative; aspect-ratio:1/1; overflow:hidden; cursor:pointer; border-radius:12px; background:#1a1a1a; }
        .ig-media-card img { width:100%; height:100%; object-fit:cover; transition:transform 0.35s ease; display:block; }
        .ig-media-card:hover img { transform:scale(1.08); }
        .ig-media-overlay { position:absolute; inset:0; background:linear-gradient(0deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.1) 60%); opacity:0; transition:opacity 0.25s ease; display:flex; flex-direction:column; justify-content:flex-end; padding:12px; }
        .ig-media-card:hover .ig-media-overlay { opacity:1; }
        .ig-media-type-badge { position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.65); backdrop-filter:blur(6px); border-radius:6px; padding:3px 7px; font-size:10px; font-weight:700; color:#fff; }
        .ig-stat-pill { background:#1a1a1a; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px 22px; flex:1; min-width:100px; transition:all 0.25s; }
        .ig-stat-pill:hover { border-color:rgba(236,72,153,0.35); background:#1f1f1f; transform:translateY(-2px); }
        .ig-filter-btn { background:none; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:rgba(255,255,255,0.5); padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .ig-filter-btn.active { background:rgba(236,72,153,0.12); border-color:rgba(236,72,153,0.4); color:#f472b6; }
        .ig-filter-btn:hover:not(.active) { background:rgba(255,255,255,0.05); color:#fff; }
        .ig-search { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:9px 14px 9px 36px; color:#fff; font-size:12.5px; outline:none; font-family:inherit; width:200px; transition:border-color 0.2s; }
        .ig-search:focus { border-color:rgba(236,72,153,0.45); }
        .ig-search::placeholder { color:rgba(255,255,255,0.28); }
        /* Lightbox */
        .ig-lightbox { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.88); backdrop-filter:blur(14px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeUp 0.2s ease; }
        .ig-lb-inner { background:#141414; border:1px solid rgba(255,255,255,0.08); border-radius:20px; max-width:900px; width:100%; display:flex; overflow:hidden; max-height:90vh; }
        @media(max-width:700px) { .ig-lb-inner{flex-direction:column} }
        .ig-profile-side { width:240px; flex-shrink:0; padding:28px 20px; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; gap:20px; }
        .ig-main { flex:1; padding:28px 32px 40px; overflow-y:auto; }
        @media(max-width:960px) { .ig-profile-side{width:200px} .ig-main{padding:20px} }
        @media(max-width:700px) { .ig-profile-side{width:100%;border-right:none;border-bottom:1px solid rgba(255,255,255,0.06);padding:20px;flex-direction:row;flex-wrap:wrap;align-items:center} .ig-main{padding:16px} }
        .ig-media-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        @media(max-width:800px) { .ig-media-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:500px) { .ig-media-grid{grid-template-columns:repeat(2,1fr);gap:6px} }
      `}</style>

      {/* ── LEFT: Profile sidebar ── */}
      <aside className="ig-profile-side">
        {/* Avatar */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <div style={{ position:"relative" }}>
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.username}
                style={{ width:88, height:88, borderRadius:"50%", objectFit:"cover", border:"2.5px solid #ec4899", boxShadow:"0 0 0 4px rgba(236,72,153,0.15)" }}
              />
            ) : (
              <div style={{ width:88, height:88, borderRadius:"50%", background:"linear-gradient(135deg,#ec4899,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:900, border:"2.5px solid #ec4899", boxShadow:"0 0 0 4px rgba(236,72,153,0.15)" }}>
                {(profile?.username || "I")[0].toUpperCase()}
              </div>
            )}
            {/* Live green dot */}
            <span style={{ position:"absolute", bottom:4, right:4, width:16, height:16, borderRadius:"50%", background:"#25d366", border:"2.5px solid #0d0d0d" }} />
          </div>

          <div style={{ textAlign:"center" }}>
            <div style={{ fontWeight:800, fontSize:15, color:"#fff", fontFamily:"var(--font-primary)" }}>@{profile?.username}</div>
            <div style={{ display:"flex", alignItems:"center", gap:5, justifyContent:"center", marginTop:5 }}>
              <span style={{ background:"linear-gradient(135deg,rgba(236,72,153,0.2),rgba(139,92,246,0.2))", border:"1px solid rgba(236,72,153,0.35)", borderRadius:100, padding:"2px 10px", fontSize:10, fontWeight:700, color:"#f472b6" }}>
                Instagram
              </span>
              <span style={{ background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:100, padding:"2px 10px", fontSize:10, fontWeight:700, color:"#34d399" }}>
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Profile stats */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <ProfileStat label="Posts" value={fmt(profile?.mediaCount)} icon="🖼️" color="#ec4899" />
          <ProfileStat label="Followers" value={fmt(profile?.followersCount)} icon="👥" color="#8b5cf6" />
          <ProfileStat label="Following" value={fmt(profile?.followsCount)} icon="🔗" color="#3b82f6" />
        </div>

        {/* Connected since */}
        {profile?.connectedAt && (
          <div style={{ marginTop:"auto", fontSize:10.5, color:"rgba(255,255,255,0.3)", textAlign:"center", lineHeight:1.6 }}>
            Connected {timeAgo(profile.connectedAt)}
          </div>
        )}

        {/* + Create Post button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("viralrush_navigate", { detail: "create_post" }))}
          style={{ width:"100%", background:"linear-gradient(135deg,#ec4899,#8b5cf6)", border:"none", borderRadius:12, padding:"11px 12px", color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit", transition:"all 0.25s", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 20px rgba(236,72,153,0.35)" }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(236,72,153,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(236,72,153,0.35)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Post
        </button>

        {/* Manage channels link */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("viralrush_navigate", { detail: "connect" }))}
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"9px 12px", color:"rgba(255,255,255,0.45)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="rgba(255,255,255,0.45)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Manage Channels
        </button>
      </aside>

      {/* ── RIGHT: Main Content ── */}
      <main className="ig-main">
        {/* Top header */}
        <div style={{ marginBottom:24, display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>INSTAGRAM</div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#fff", fontFamily:"var(--font-primary)" }}>
              Manage Posts
            </h1>
          </div>
          {/* Search */}
          <div style={{ position:"relative" }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="ig-search" placeholder="Search captions..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* ── Top Stats Bar ── */}
        <div style={{ display:"flex", gap:12, marginBottom:28, flexWrap:"wrap" }}>
          <StatPill icon="🖼️" label="Total Posts" value={fmt(profile?.mediaCount)} color="#ec4899" />
          <StatPill icon="👥" label="Followers" value={fmt(profile?.followersCount)} color="#8b5cf6" />
          <StatPill icon="🔗" label="Following" value={fmt(profile?.followsCount)} color="#3b82f6" />
          <StatPill icon="🎬" label="Reels" value={typeCount("VIDEO")} color="#f59e0b" />
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
          {[
            { key:"ALL", label:"All Posts" },
            { key:"IMAGE", label:"🖼️ Photos" },
            { key:"VIDEO", label:"🎬 Reels" },
            { key:"CAROUSEL_ALBUM", label:"📑 Albums" },
            { key:"SCHEDULED", label:`🗓️ Scheduled${scheduledPosts.filter(p=>p.status==="pending").length > 0 ? ` (${scheduledPosts.filter(p=>p.status==="pending").length})` : ""}` },
          ].map(f => (
            <button key={f.key} className={`ig-filter-btn${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
          {filter !== "SCHEDULED" && (
            <span style={{ marginLeft:"auto", fontSize:12, color:"rgba(255,255,255,0.3)", alignSelf:"center" }}>
              {filtered.length} post{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Media grid OR Scheduled Queue */}
        {filter === "SCHEDULED" ? (
          <ScheduledQueue
            posts={scheduledPosts}
            onCancel={async (id) => {
              try {
                await api.delete(`/instagram/scheduled/${id}`);
                setScheduledPosts(prev => prev.filter(p => p._id !== id));
              } catch (e) {
                alert(e?.response?.data?.message || "Could not cancel post.");
              }
            }}
          />
        ) : mediaLoading ? (
          <div className="ig-media-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="ig-skel" style={{ aspectRatio:"1/1", borderRadius:12 }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign:"center", padding:60, color:"rgba(255,255,255,0.35)", fontSize:14 }}>⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} filter={filter} />
        ) : (
          <div className="ig-media-grid">
            {filtered.map((item, idx) => (
              <MediaCard key={item.id} item={item} idx={idx} onClick={() => setSelected(item)} />
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}

      {/* Create Post Modal */}
      {showPostModal && (
        <CreatePostModal
          onClose={() => setShowPostModal(false)}
          onSuccess={(newPost) => {
            setShowPostModal(false);
            // Refresh media list
            api.get("/instagram/media").then(r => setMedia(r.data.media || [])).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function ProfileStat({ label, value, icon, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"10px 14px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
        <span style={{ fontSize:13 }}>{icon}</span>
        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>{label}</span>
      </div>
      <span style={{ fontSize:14, fontWeight:800, color, fontFamily:"var(--font-primary)" }}>{value}</span>
    </div>
  );
}

function StatPill({ icon, label, value, color }) {
  return (
    <div className="ig-stat-pill" style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontSize:14 }}>{icon}</span>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:500 }}>{label}</span>
      </div>
      <div style={{ fontSize:22, fontWeight:900, color, fontFamily:"var(--font-primary)", lineHeight:1 }}>{value}</div>
    </div>
  );
}

function MediaCard({ item, idx, onClick }) {
  const thumb = item.thumbnail_url || item.media_url;
  return (
    <div
      className="ig-media-card"
      style={{ animationDelay:`${idx * 0.04}s`, animation:"fadeUp 0.4s ease both" }}
      onClick={onClick}
    >
      {thumb ? (
        <img src={thumb} alt={item.caption?.slice(0, 60) || "Post"} loading="lazy" />
      ) : (
        <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#1e1e1e", fontSize:32 }}>
          {TYPE_ICON[item.media_type] || "🖼️"}
        </div>
      )}

      {/* Type badge */}
      <div className="ig-media-type-badge">{TYPE_LABEL[item.media_type] || "Post"}</div>

      {/* Hover overlay */}
      <div className="ig-media-overlay">
        <div style={{ display:"flex", gap:14, marginBottom:4 }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
            ❤️ {fmt(item.like_count || 0)}
          </span>
          <span style={{ fontSize:12, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
            💬 {fmt(item.comments_count || 0)}
          </span>
        </div>
        {item.caption && (
          <p style={{ margin:0, fontSize:10.5, color:"rgba(255,255,255,0.75)", lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {item.caption}
          </p>
        )}
      </div>
    </div>
  );
}

function Lightbox({ item, onClose }) {
  const mediaSrc = item.media_url;
  const isVideo = item.media_type === "VIDEO";
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // "info" | "comments"

  const loadComments = async () => {
    if (commentsLoading || comments.length > 0) return;
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const res = await api.get(`/instagram/media/${item.id}/comments`);
      setComments(res.data.comments || []);
    } catch (err) {
      setCommentsError(err?.response?.data?.message || "Could not load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "comments") loadComments();
  };

  const tabBtn = (key, label, count) => ({
    flex: 1, padding: "9px 0", borderRadius: 9, fontWeight: 700, fontSize: 12,
    fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
    background: activeTab === key ? "rgba(236,72,153,0.12)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${activeTab === key ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`,
    color: activeTab === key ? "#f472b6" : "rgba(255,255,255,0.4)",
  });

  return (
    <div className="ig-lightbox" onClick={onClose}>
      <div className="ig-lb-inner" onClick={e => e.stopPropagation()} style={{ maxWidth: 960 }}>
        {/* Media side */}
        <div style={{ flex:"0 0 auto", width:400, maxWidth:"100%", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", minHeight:300 }}>
          {isVideo ? (
            <video src={mediaSrc} controls autoPlay muted style={{ width:"100%", maxHeight:540, objectFit:"contain" }} />
          ) : mediaSrc ? (
            <img src={mediaSrc} alt="Post" style={{ width:"100%", maxHeight:540, objectFit:"contain" }} />
          ) : (
            <div style={{ fontSize:48 }}>{TYPE_ICON[item.media_type]}</div>
          )}
        </div>

        {/* Info + Comments side */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"20px 22px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
            <span style={{ background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.3)", borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:700, color:"#f472b6" }}>
              {TYPE_LABEL[item.media_type] || "Post"}
            </span>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.5)", width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:8, padding:"12px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
            <button style={tabBtn("info")} onClick={() => handleTabChange("info")}>📋 Post Info</button>
            <button style={tabBtn("comments")} onClick={() => handleTabChange("comments")}>
              💬 Comments {item.comments_count > 0 ? `(${fmt(item.comments_count)})` : ""}
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>

            {/* ── INFO TAB ── */}
            {activeTab === "info" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Stats */}
                <div style={{ display:"flex", gap:16 }}>
                  <div style={{ flex:1, background:"rgba(236,72,153,0.06)", border:"1px solid rgba(236,72,153,0.15)", borderRadius:12, padding:"12px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:900, color:"#ec4899", fontFamily:"var(--font-primary)" }}>{fmt(item.like_count || 0)}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>❤️ Likes</div>
                  </div>
                  <div style={{ flex:1, background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:12, padding:"12px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:900, color:"#8b5cf6", fontFamily:"var(--font-primary)" }}>{fmt(item.comments_count || 0)}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>💬 Comments</div>
                  </div>
                </div>

                {/* Caption */}
                {item.caption && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Caption</div>
                    <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.65, whiteSpace:"pre-wrap" }}>{item.caption}</p>
                  </div>
                )}

                {/* Posted time */}
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>
                  📅 Posted {timeAgo(item.timestamp)}
                </div>

                {/* Open on Instagram */}
                <a
                  href={item.permalink} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,#ec4899,#8b5cf6)", borderRadius:10, padding:"11px 20px", color:"#fff", fontSize:13, fontWeight:700, textDecoration:"none", justifyContent:"center", transition:"opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity="1"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  View on Instagram
                </a>
              </div>
            )}

            {/* ── COMMENTS TAB ── */}
            {activeTab === "comments" && (
              <div>
                {commentsLoading && (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                        <div className="ig-skel" style={{ width:36, height:36, borderRadius:"50%", flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div className="ig-skel" style={{ height:12, width:"40%", marginBottom:8, borderRadius:6 }} />
                          <div className="ig-skel" style={{ height:10, width:"80%", borderRadius:6 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {commentsError && (
                  <div style={{ textAlign:"center", padding:"30px 0", color:"#f87171", fontSize:12 }}>
                    ⚠️ {commentsError}
                    <br />
                    <button onClick={loadComments} style={{ marginTop:10, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:8, color:"#f87171", padding:"6px 14px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                      Retry
                    </button>
                  </div>
                )}

                {!commentsLoading && !commentsError && comments.length === 0 && (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(255,255,255,0.3)", fontSize:13 }}>
                    <div style={{ fontSize:36, marginBottom:10 }}>💬</div>
                    No comments yet on this post.
                  </div>
                )}

                {!commentsLoading && comments.map((c, i) => (
                  <div key={c.id || i} style={{ marginBottom:16 }}>
                    {/* Main comment */}
                    <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#ec4899,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0, textTransform:"uppercase" }}>
                        {(c.username || "?")[0]}
                      </div>
                      <div style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"10px 14px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"#f472b6" }}>@{c.username}</span>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{timeAgo(c.timestamp)}</span>
                        </div>
                        <p style={{ margin:0, fontSize:12.5, color:"rgba(255,255,255,0.8)", lineHeight:1.55 }}>{c.text}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    {c.replies?.data?.length > 0 && (
                      <div style={{ marginLeft:46, marginTop:8, display:"flex", flexDirection:"column", gap:8 }}>
                        {c.replies.data.map((r, j) => (
                          <div key={r.id || j} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                            <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(139,92,246,0.3)", border:"1px solid rgba(139,92,246,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#a78bfa", flexShrink:0, textTransform:"uppercase" }}>
                              {(r.username || "?")[0]}
                            </div>
                            <div style={{ flex:1, background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:10, padding:"8px 12px" }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                                <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa" }}>@{r.username}</span>
                                <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{timeAgo(r.timestamp)}</span>
                              </div>
                              <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>↩️ {r.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ search, filter }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:14, textAlign:"center" }}>
      <div style={{ fontSize:48 }}>📷</div>
      <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>
        {search ? "No posts match your search" : filter !== "ALL" ? `No ${TYPE_LABEL[filter] || "posts"} found` : "No posts yet"}
      </div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", maxWidth:280, lineHeight:1.7 }}>
        {search ? "Try a different caption keyword." : "Posts from your Instagram account will appear here."}
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  pending:    { color:"#a78bfa", bg:"rgba(139,92,246,0.1)",  border:"rgba(139,92,246,0.25)",  icon:"⏳", label:"Pending"    },
  processing: { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.25)",  icon:"⚙️", label:"Processing" },
  published:  { color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)",  icon:"✅", label:"Published"  },
  failed:     { color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.25)", icon:"❌", label:"Failed"     },
};
function ScheduledQueue({ posts, onCancel }) {
  const [cancelling, setCancelling] = useState(null);
  if (posts.length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:14, textAlign:"center" }}>
        <div style={{ fontSize:52 }}>🗓️</div>
        <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>No scheduled posts yet</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", maxWidth:320, lineHeight:1.7 }}>Use the Schedule for Later toggle when creating a post or reel to queue it here.</div>
        <button onClick={() => window.dispatchEvent(new CustomEvent("viralrush_navigate",{detail:"create_post"}))} style={{ marginTop:8, background:"linear-gradient(135deg,#7c3aed,#5b2eff)", border:"none", borderRadius:12, padding:"12px 28px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Create and Schedule Post</button>
      </div>
    );
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginBottom:4 }}>{posts.length} scheduled item{posts.length!==1?"s":""} — auto-publishes at scheduled time</div>
      {posts.map(post => {
        const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.pending;
        const schedDate = new Date(post.scheduledAt);
        const isPast = schedDate < new Date();
        return (
          <div key={post._id} style={{ background:"#141414", border:"1px solid "+cfg.border, borderRadius:16, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:cfg.bg, border:"1px solid "+cfg.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{post.mediaType==="REEL"?"🎬":"🖼️"}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:700, background:cfg.bg, color:cfg.color, border:"1px solid "+cfg.border, borderRadius:20, padding:"2px 10px" }}>{cfg.icon} {cfg.label}</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{post.mediaType==="REEL"?"Reel":"Photo"}</span>
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:4 }}>{post.caption || "No caption"}</div>
              <div style={{ fontSize:11, color:isPast&&post.status==="pending"?"#fbbf24":"rgba(255,255,255,0.35)" }}>{post.status==="published"?"Published "+timeAgo(post.publishedAt):"Scheduled: "+schedDate.toLocaleString()}{isPast&&post.status==="pending"?" — publishing soon...":""}</div>
              {post.status==="failed"&&post.errorMessage&&(<div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>Error: {post.errorMessage}</div>)}
            </div>
            {post.status==="pending"&&(
              <button onClick={async()=>{setCancelling(post._id);await onCancel(post._id);setCancelling(null);}} disabled={cancelling===post._id} style={{ flexShrink:0, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, color:"#f87171", padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", opacity:cancelling===post._id?0.5:1 }}>{cancelling===post._id?"Cancelling...":"Cancel"}</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid rgba(236,72,153,0.2)", borderTopColor:"#ec4899", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function NotConnectedScreen() {
  return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20, textAlign:"center", padding:40 }}>
      <div style={{ width:80, height:80, borderRadius:20, background:"linear-gradient(135deg,rgba(236,72,153,0.15),rgba(139,92,246,0.15))", border:"1px solid rgba(236,72,153,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>
        📸
      </div>
      <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:"#fff" }}>Instagram Not Connected</h2>
      <p style={{ margin:0, fontSize:14, color:"rgba(255,255,255,0.45)", maxWidth:360, lineHeight:1.7 }}>
        Connect your Instagram Business account to manage and view all your posts here.
      </p>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("viralrush_navigate", { detail: "connect" }))}
        style={{ background:"linear-gradient(135deg,#ec4899,#8b5cf6)", border:"none", borderRadius:12, padding:"13px 30px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 6px 24px rgba(236,72,153,0.35)", transition:"all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
      >
        Connect Instagram â†’
      </button>
    </div>
  );
}

// Helper function to crop image to specific aspect ratio (center-cropped)
const cropImageToAspectRatio = (img, targetRatio) => {
  const canvas = document.createElement("canvas");
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  const imgRatio = imgWidth / imgHeight;

  let drawWidth, drawHeight, cropX, cropY;

  if (imgRatio > targetRatio) {
    drawHeight = imgHeight;
    drawWidth = imgHeight * targetRatio;
    cropX = (imgWidth - drawWidth) / 2;
    cropY = 0;
  } else {
    drawWidth = imgWidth;
    drawHeight = imgWidth / targetRatio;
    cropX = 0;
    cropY = (imgHeight - drawHeight) / 2;
  }

  const targetWidth = Math.min(1200, drawWidth);
  const targetHeight = targetWidth / targetRatio;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, cropX, cropY, drawWidth, drawHeight, 0, 0, targetWidth, targetHeight);
  return canvas;
};

function CreatePostModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("IMAGE");
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // POV Aspect Ratio state variables
  const [povOptions, setPovOptions] = useState([]);
  const [selectedPov, setSelectedPov] = useState("");

  const handleFile = (f) => {
    if (!f) return;
    const isVideo = f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name);
    setMediaType(isVideo ? "REEL" : "IMAGE");
    setFile(f);
    
    const objectUrl = URL.createObjectURL(f);
    setPreview(objectUrl);
    setErrorMsg("");

    if (!isVideo) {
      // Process image to generate 3 POVs: 1:1, 9:16, and Free Size
      const img = new Image();
      img.onload = () => {
        const sqCanvas = cropImageToAspectRatio(img, 1);
        const vertCanvas = cropImageToAspectRatio(img, 9 / 16);
        const freeCanvas = cropImageToAspectRatio(img, img.naturalWidth / img.naturalHeight);

        const sqUrl = sqCanvas.toDataURL("image/jpeg", 0.95);
        const vertUrl = vertCanvas.toDataURL("image/jpeg", 0.95);
        const freeUrl = freeCanvas.toDataURL("image/jpeg", 0.95);

        const povs = [
          {
            id: "square",
            label: "Square (1:1)",
            ratio: "1:1",
            resolution: "1080 x 1080",
            dataUrl: sqUrl,
            canvas: sqCanvas
          },
          {
            id: "vertical",
            label: "Vertical (9:16)",
            ratio: "9:16",
            resolution: "1080 x 1920",
            dataUrl: vertUrl,
            canvas: vertCanvas
          },
          {
            id: "free",
            label: "Free Size",
            ratio: "Original",
            resolution: `${img.naturalWidth} x ${img.naturalHeight}`,
            dataUrl: freeUrl,
            canvas: freeCanvas
          }
        ];

        setPovOptions(povs);
        setSelectedPov("square");
        setPreview(sqUrl);
      };
      img.src = objectUrl;
    } else {
      setPovOptions([]);
      setSelectedPov("");
    }
  };

  const selectPovOption = (povId) => {
    setSelectedPov(povId);
    const opt = povOptions.find(p => p.id === povId);
    if (opt) {
      setPreview(opt.dataUrl);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPreview(null);
    setPovOptions([]);
    setSelectedPov("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setErrorMsg("Please select an image or video first."); return; }
    
    let progressInterval = null;

    try {
      setStatus("uploading");
      setErrorMsg("");
      setUploadProgress(0);

      // Start dynamic incremental progress simulation (UX-proven pattern for async processing)
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        // Slowly increment, decaying as it approaches 96%
        currentProgress += (96 - currentProgress) * 0.12;
        setUploadProgress(Math.round(currentProgress));
      }, 400);

      // Convert selected POV canvas to blob file before uploading
      let fileToUpload = file;
      if (mediaType === "IMAGE" && selectedPov && povOptions.length > 0) {
        const activePov = povOptions.find(p => p.id === selectedPov);
        if (activePov) {
          fileToUpload = await new Promise((resolve, reject) => {
            activePov.canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error("Failed to process cropped POV image."));
                return;
              }
              const extension = file.type === "image/png" ? ".png" : ".jpg";
              const name = file.name.replace(/\.[^/.]+$/, "") + `_${selectedPov}${extension}`;
              const type = file.type || "image/jpeg";
              const croppedFile = new File([blob], name, { type });
              resolve(croppedFile);
            }, file.type || "image/jpeg", 0.95);
          });
        }
      }

      const form = new FormData();
      form.append("file", fileToUpload);
      form.append("caption", caption);
      form.append("media_type", mediaType);
      const res = await api.post("/instagram/publish", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Clear simulation and jump to 100% on success!
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      setStatus("success");
      setTimeout(() => onSuccess(res.data), 1200);
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(0);
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || err.message || "Failed to publish. Please try again.");
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeUp 0.25s ease" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.08)", borderRadius:22, width:"100%", maxWidth:520, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.7)" }}
      >
        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#ec4899,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span style={{ fontWeight:800, fontSize:15, color:"#fff", fontFamily:"var(--font-primary)" }}>Create New Post</span>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.5)", width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}>âœ•</button>
        </div>

        <div style={{ padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* Media type toggle */}
          <div style={{ display:"flex", gap:8 }}>
            {[{ key:"IMAGE", label:"🖼️ Photo" }, { key:"REEL", label:"🎬 Reel" }].map(t => (
              <button
                key={t.key}
                onClick={() => setMediaType(t.key)}
                style={{ flex:1, padding:"9px 0", borderRadius:10, border:`1px solid ${mediaType===t.key?"rgba(236,72,153,0.5)":"rgba(255,255,255,0.08)"}`, background: mediaType===t.key?"rgba(236,72,153,0.12)":"rgba(255,255,255,0.03)", color: mediaType===t.key?"#f472b6":"rgba(255,255,255,0.4)", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
              >{t.label}</button>
            ))}
          </div>

          {/* Drop zone / preview */}
          {preview ? (
            <div style={{ position:"relative", borderRadius:14, overflow:"hidden", background:"#000", maxHeight:240, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {mediaType === "REEL" ? (
                <video src={preview} controls muted style={{ width:"100%", maxHeight:240, objectFit:"contain" }} />
              ) : (
                <img src={preview} alt="Preview" style={{ width:"100%", maxHeight:240, objectFit:"contain" }} />
              )}
              <button
                onClick={handleClearFile}
                style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.7)", border:"none", borderRadius:6, color:"#fff", width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}
              >âœ•</button>
            </div>
          ) : (
            <label
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, borderRadius:14, border:`2px dashed ${dragOver?"#ec4899":"rgba(255,255,255,0.12)"}`, background: dragOver?"rgba(236,72,153,0.06)":"rgba(255,255,255,0.02)", padding:"36px 20px", cursor:"pointer", transition:"all 0.2s" }}
            >
              <div style={{ width:48, height:48, borderRadius:14, background:"rgba(236,72,153,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                {mediaType === "REEL" ? "🎬" : "🖼️"}
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:4 }}>
                  Drop your {mediaType === "REEL" ? "video" : "image"} here
                </div>
                <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.35)" }}>
                  or click to browse · {mediaType === "REEL" ? "MP4, MOV up to 100MB" : "JPG, PNG up to 100MB"}
                </div>
              </div>
              <input
                type="file"
                accept={mediaType === "REEL" ? "video/*" : "image/*"}
                style={{ display:"none" }}
                onChange={e => handleFile(e.target.files[0])}
              />
            </label>
          )}

          {/* Select Instagram POV Aspect Grid */}
          {mediaType === "IMAGE" && povOptions.length > 0 && (
            <div style={{ animation: "fadeUp 0.3s ease", width: "100%" }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>
                Select Instagram POV (Aspect Ratio)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {povOptions.map(p => {
                  const active = selectedPov === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectPovOption(p.id)}
                      style={{
                        background: "#1c1c1c",
                        border: `2px solid ${active ? "#ec4899" : "rgba(255,255,255,0.05)"}`,
                        borderRadius: 14,
                        padding: 10,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: active ? "0 0 15px rgba(236,72,153,0.2)" : "none",
                        transform: active ? "translateY(-2px)" : "none",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                        }
                      }}
                    >
                      {/* Aspect container */}
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: p.id === "square" ? "1/1" : p.id === "vertical" ? "9/16" : `${p.canvas.width}/${p.canvas.height}`,
                          maxHeight: 80,
                          borderRadius: 8,
                          overflow: "hidden",
                          background: "#0c0c0c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <img
                          src={p.dataUrl}
                          alt={p.label}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      </div>

                      {/* Labels */}
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: active ? "#f472b6" : "#fff", marginBottom: 2, whiteSpace: "nowrap" }}>
                          {p.label.split(" ")[0]} {p.ratio}
                        </div>
                        <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                          {p.resolution}
                        </div>
                      </div>

                      {/* Selection indicator pill */}
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: active ? "#ec4899" : "rgba(0,0,0,0.6)",
                          borderRadius: "50%",
                          width: 14,
                          height: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8,
                          color: "#fff",
                          border: active ? "none" : "1px solid rgba(255,255,255,0.15)",
                          transition: "all 0.2s"
                        }}
                      >
                        {active ? "âœ“" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:7 }}>
              Caption
            </label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write a caption… #hashtags @mentions"
              maxLength={2200}
              rows={4}
              style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, padding:"12px 14px", color:"#fff", fontSize:13, fontFamily:"inherit", resize:"vertical", outline:"none", transition:"border-color 0.2s", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="rgba(236,72,153,0.4)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.09)"}
            />
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", textAlign:"right", marginTop:4 }}>{caption.length}/2200</div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:10, padding:"10px 14px", fontSize:12.5, color:"#f87171" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:10, padding:"10px 14px", fontSize:12.5, color:"#34d399", display:"flex", alignItems:"center", gap:8 }}>
              ✅ Posted successfully! Refreshing your feed…
            </div>
          )}

          {/* Upload Progress Bar */}
          {status === "uploading" && (
            <div style={{ animation: "fadeUp 0.3s ease", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f472b6" }}>Uploading to server...</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{uploadProgress}%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
                    borderRadius: 10,
                    boxShadow: "0 0 8px rgba(236,72,153,0.4)",
                    transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={status === "uploading" || status === "success"}
            style={{ width:"100%", background: status==="uploading"?"rgba(236,72,153,0.4)":"linear-gradient(135deg,#ec4899,#8b5cf6)", border:"none", borderRadius:12, padding:"13px 0", color:"#fff", fontSize:14, fontWeight:800, cursor: status==="uploading"?"not-allowed":"pointer", fontFamily:"inherit", boxShadow:"0 4px 20px rgba(236,72,153,0.3)", transition:"all 0.25s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            onMouseEnter={e => { if(status==="idle") { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(236,72,153,0.45)"; }}}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(236,72,153,0.3)"; }}
          >
            {status === "uploading" ? (
              <>
                <div style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                Publishing…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Post to Instagram
              </>
            )}
          </button>

          <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.25)", textAlign:"center", lineHeight:1.6 }}>
            Your file is uploaded to our server and sent to Instagram via the official Meta Graph API. IG requires a publicly accessible URL.
          </p>
        </div>
      </div>
    </div>
  );
}
