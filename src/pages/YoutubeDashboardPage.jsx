import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function YoutubeDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchYoutubeData();
  };

  useEffect(() => {
    fetchYoutubeData();
  }, []);

  const fetchYoutubeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, videosRes] = await Promise.all([
        api.get("/youtube/analytics"),
        api.get("/youtube/videos")
      ]);
      setChannelData(analyticsRes.data.channel);
      setAnalytics(analyticsRes.data.analytics);
      setVideos(videosRes.data.videos || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load YouTube data. Make sure you connected your account.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return <DashboardSkeleton />;
  }

  if (error) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 text-white">
         <div className="text-6xl mb-4">📺</div>
         <h2 className="text-2xl font-bold mb-4 font-['Inter']">{error}</h2>
         <p className="text-gray-400 mb-8 max-w-md">Connect your YouTube channel in the Integrations page to view your studio analytics.</p>
       </div>
     );
  }

  // Calculate some stats
  const totalViews = parseInt(channelData.viewCount) || 0;
  const totalSubs = parseInt(channelData.subscriberCount) || 0;
  const totalVideos = parseInt(channelData.videoCount) || 0;

  return (
    <div style={{ padding: "40px 32px", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-ui)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40, flexWrap: "wrap" }}>
        <img src={channelData.thumbnail} alt={channelData.title} style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid #ff0000" }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, fontFamily: "var(--font-primary)" }}>{channelData.title}</h1>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Joined {new Date(channelData.publishedAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <button 
            onClick={() => setShowUploadModal(true)}
            style={{
              padding: "8px 16px", borderRadius: 8,
              background: "linear-gradient(135deg, #ff0000, #cc0000)", border: "none",
              color: "#fff", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255,0,0,0.3)", display: "flex", alignItems: "center", gap: 6,
              fontFamily: "inherit", transition: "transform 0.15s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <span>🎥</span> Upload Video
          </button>
          <button 
            onClick={fetchYoutubeData}
            style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.3)", color: "#ff4444", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Live Sync
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 32 }}>
        {["overview", "videos", "engagement"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0 0 12px", background: "none", border: "none", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 14, fontWeight: activeTab === tab ? 600 : 400, textTransform: "capitalize",
              borderBottom: activeTab === tab ? "2px solid #ff0000" : "2px solid transparent",
              cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>
            <StatCard label="Total Subscribers" value={totalSubs} color="#ff4444" />
            <StatCard label="Total Views" value={totalViews} color="#3b82f6" />
            <StatCard label="Videos Published" value={totalVideos} color="#10b981" />
            <StatCard label="Avg. Views / Video" value={totalVideos ? Math.floor(totalViews / totalVideos) : 0} color="#8b5cf6" />
          </div>

          {/* Charts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24, marginBottom: 40 }}>
            {/* Views Chart */}
            <div style={{ background: "#111", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Views Growth (30 Days)</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.viewsHistory}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split("-").slice(1).join("/")} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => (val > 1000 ? `${(val/1000).toFixed(1)}k` : val)} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Subs Chart */}
            <div style={{ background: "#111", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Subscriber Growth</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.subHistory}>
                    <defs>
                      <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split("-").slice(1).join("/")} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => (val > 1000 ? `${(val/1000).toFixed(1)}k` : val)} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="value" stroke="#ff4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "videos" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {videos.map(video => (
            <div key={video.id} style={{ background: "#111", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <img src={video.thumbnail} alt={video.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {video.title}
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 16 }}>
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: "#3b82f6" }}>👁️</span> {parseInt(video.viewCount).toLocaleString()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: "#10b981" }}>👍</span> {parseInt(video.likeCount).toLocaleString()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: "#f59e0b" }}>💬</span> {parseInt(video.commentCount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
              No videos found on this channel.
            </div>
          )}
        </div>
      )}
      
      {activeTab === "engagement" && (
        <div style={{ background: "#111", padding: 40, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h3 style={{ margin: "0 0 12px", fontSize: 20, color: "#fff", fontWeight: 700 }}>Audience Engagement Matrix</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto 24px" }}>
            The engagement analytics model is processing your comment sentiment and viewer retention data. 
            This feature requires additional API quotas to analyze full audience behavior.
          </p>
        </div>
      )}

      {showUploadModal && (
        <UploadVideoModal 
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (!value || value === 0) return;
    let start = 0;
    const duration = 1000;
    const end = value;
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div style={{ background: "#111", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: color, filter: "blur(50px)", opacity: 0.15, borderRadius: "50%" }} />
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)" }}>{displayValue.toLocaleString()}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: "40px 32px", minHeight: "100vh" }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 40, alignItems: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }} />
        <div>
          <div style={{ width: 200, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 12, animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 120, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 110, background: "rgba(255,255,255,0.05)", borderRadius: 16, animation: "pulse 1.5s infinite" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {[1,2].map(i => <div key={i} style={{ height: 320, background: "rgba(255,255,255,0.05)", borderRadius: 16, animation: "pulse 1.5s infinite" }} />)}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// UploadVideoModal component
// ────────────────────────────────────────────────────────────────────────────
function UploadVideoModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState("public");
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFile = (f) => {
    if (!f) return;
    const isVideo = f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|3gp)$/i.test(f.name);
    if (!isVideo) {
      setErrorMsg("Please select a valid video file.");
      return;
    }
    setFile(f);
    const objectUrl = URL.createObjectURL(f);
    setPreview(objectUrl);
    setErrorMsg("");
    const baseName = f.name.replace(/\.[^/.]+$/, "");
    setTitle(baseName.slice(0, 100));
  };

  const handleClearFile = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setErrorMsg("Please select a video file."); return; }
    if (!title.trim()) { setErrorMsg("Please enter a video title."); return; }
    
    let progressInterval = null;
    try {
      setStatus("uploading");
      setErrorMsg("");
      setUploadProgress(0);

      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += (95 - currentProgress) * 0.1;
        setUploadProgress(Math.round(currentProgress));
      }, 500);

      const form = new FormData();
      form.append("video", file);
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("privacyStatus", privacyStatus);

      await api.post("/youtube/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      setStatus("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(0);
      setStatus("error");
      setErrorMsg(err.response?.data?.message || err.message || "Failed to upload video.");
    }
  };

  return (
    <div 
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.25s ease"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: "#121212", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, width: "100%", maxWidth: 580,
          padding: 32, display: "flex", flexDirection: "column", gap: 20,
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          animation: "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎥</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "var(--font-primary)", color: "#fff" }}>Upload Video to YouTube</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", borderRadius: 10, width: 32, height: 32,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
            }}
          >✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: "65vh", paddingRight: 4 }}>
          {preview ? (
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video src={preview} controls muted style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
              <button
                onClick={handleClearFile}
                disabled={status === "uploading"}
                style={{
                  position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.75)",
                  border: "none", borderRadius: 8, color: "#fff", width: 32, height: 32,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
                }}
              >✕</button>
            </div>
          ) : (
            <label
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                borderRadius: 16, border: `2px dashed ${dragOver ? "#ff0000" : "rgba(255,255,255,0.12)"}`,
                background: dragOver ? "rgba(255,0,0,0.05)" : "rgba(255,255,255,0.02)",
                padding: "36px 20px", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#ff0000" }}>
                📥
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                  Drag and drop your video file here
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  Supports MP4, MOV, AVI, WEBM (up to 250MB)
                </div>
              </div>
              <input
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0])}
              />
            </label>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
              Video Title *
            </label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your video a catchy title..."
              maxLength={100}
              disabled={status === "uploading"}
              style={{
                width: "100%", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13.5, outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
              Video Description
            </label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell viewers what your video is about..."
              rows={4}
              disabled={status === "uploading"}
              style={{
                width: "100%", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13.5, outline: "none", boxSizing: "border-box", resize: "vertical"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
              Privacy Status
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {["public", "unlisted", "private"].map(statusKey => {
                const active = privacyStatus === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setPrivacyStatus(statusKey)}
                    disabled={status === "uploading"}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${active ? "rgba(255,0,0,0.4)" : "rgba(255,255,255,0.06)"}`,
                      background: active ? "rgba(255,0,0,0.08)" : "rgba(255,255,255,0.02)",
                      color: active ? "#ff4444" : "rgba(255,255,255,0.6)",
                      fontSize: 12.5, fontWeight: 700, textTransform: "capitalize", transition: "all 0.2s"
                    }}
                  >
                    {statusKey}
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {status === "success" && (
            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#34d399" }}>
              ✅ Video uploaded successfully!
            </div>
          )}

          {status === "uploading" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#ff4444", fontWeight: 700 }}>Uploading to YouTube...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: `${uploadProgress}%`, height: "100%", background: "#ff0000", borderRadius: 10, transition: "width 0.2s" }} />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={status === "uploading" || status === "success"}
          style={{
            width: "100%", background: "linear-gradient(135deg, #ff0000, #cc0000)", border: "none",
            borderRadius: 12, padding: "14px 0", color: "#fff", fontSize: 14, fontWeight: 800,
            cursor: (status === "uploading" || status === "success") ? "not-allowed" : "pointer",
            boxShadow: "0 6px 20px rgba(255,0,0,0.3)", transition: "all 0.2s"
          }}
        >
          {status === "uploading" ? "Uploading Video..." : status === "success" ? "Done!" : "Publish Video"}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
