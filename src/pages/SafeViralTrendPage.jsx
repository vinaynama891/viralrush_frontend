import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, TrendingUp, Info, ShieldCheck,
  Calendar, Check, Copy, Flame, MessageSquare, ArrowUpRight,
  TrendingDown, Globe, Sparkles, RefreshCw, Send, AlertCircle,
  HelpCircle, Eye, ShieldAlert, Award, Clock, Hash, Music, Play
} from "lucide-react";
import api from "../lib/api";

const S = {
  glass: {
    background: "rgba(19, 20, 28, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)"
  },
  input: {
    background: "rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    outline: "none",
    borderRadius: "12px",
    transition: "all 0.2s"
  },
  gradientText: {
    background: "linear-gradient(90deg, #a78bfa, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #7c3aed, #db2777)",
    color: "#fff",
    fontWeight: 700,
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
    transition: "all 0.2s ease"
  }
};

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" }
];

const formatPostDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format exact date: e.g., "29 Jun 2026"
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-IN', options);
  
  let timeAgo = "";
  if (diffDays <= 1) timeAgo = "1 day ago";
  else if (diffDays === 2) timeAgo = "2 days ago";
  else timeAgo = `${diffDays} days ago`;
  
  return `${timeAgo} (${formattedDate})`;
};

export default function SafeViralTrendPage() {
  const [niche, setNiche] = useState("fitness");
  const [country, setCountry] = useState("IN");
  const [platforms, setPlatforms] = useState(["reddit", "google"]);
  
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState([]);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [instagramWarning, setInstagramWarning] = useState("");
  
  // Instagram connection state
  const [igConnected, setIgConnected] = useState(false);
  const [igProfile, setIgProfile] = useState(null);
  const [connectingIg, setConnectingIg] = useState(false);
  
  // AI generation states
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [targetPlatform, setTargetPlatform] = useState("instagram");
  const [calendarSaved, setCalendarSaved] = useState(false);
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [toast, setToast] = useState("");

  // Preset Niches / Insights categories matching original finder
  const [insights, setInsights] = useState({
    niches: [
      { name: "Fitness & Gym", growth: "+45%" },
      { name: "Weight Loss Progress", growth: "+32%" },
      { name: "AI Automation", growth: "+21%" },
      { name: "Short Form Video Editing", growth: "+18%" }
    ],
    hashtags: [
      { name: "#loseweight", count: "2.4M" },
      { name: "#fitnesstips", count: "1.2M" },
      { name: "#chatgpt", count: "800K" },
      { name: "#startuptips", count: "500K" }
    ],
    audio: [
      { name: "Fitness reels growth", growth: "+200%" },
      { name: "Gym motivation background", growth: "+150%" },
      { name: "Weightloss transformation views", growth: "+85%" },
      { name: "AI tips voiceovers", growth: "+60%" }
    ]
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt || "");
    showToast("Copied to clipboard!");
  };

  // Load initial settings and history
  const loadInitialData = async () => {
    try {
      const historyRes = await api.get("/trends/history");
      if (historyRes.data?.success) {
        setHistory(historyRes.data.history || []);
      }
      
      const igRes = await api.get("/instagram/safe-signals");
      if (igRes.data?.isConnected) {
        setIgConnected(true);
        setIgProfile(igRes.data.profile);
      } else {
        setIgConnected(false);
        setIgProfile(null);
      }
    } catch (err) {
      console.log("Error loading initial data:", err.message);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handlePlatformToggle = (plat) => {
    if (platforms.includes(plat)) {
      setPlatforms(platforms.filter(p => p !== plat));
    } else {
      setPlatforms([...platforms, plat]);
    }
  };

  // Search Safe Trend Pipeline
  const handleSearch = async (searchNiche = niche) => {
    const isOnlyInstagram = platforms.length === 1 && platforms.includes("instagram");
    const finalNiche = isOnlyInstagram ? (searchNiche.trim() || "instagram") : searchNiche.trim();
    
    if (!finalNiche) {
      showToast("Please enter a niche or keyword!");
      return;
    }
    
    if (platforms.length === 0) {
      showToast("Please select at least one platform!");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");
    setInstagramWarning("");
    setTrends([]);
    
    try {
      const response = await api.post("/trends/safe-search", {
        niche: finalNiche,
        platforms,
        country
      });
      
      if (response.data?.success) {
        let sorted;
        if (isOnlyInstagram) {
          sorted = (response.data.trends || []).sort((a, b) => {
            const aEng = (a.metrics?.likes || 0) + (a.metrics?.comments || 0);
            const bEng = (b.metrics?.likes || 0) + (b.metrics?.comments || 0);
            return bEng - aEng;
          }).slice(0, 15);
        } else {
          sorted = (response.data.trends || []).sort((a, b) => b.viralScore - a.viralScore).slice(0, 15);
        }
        setTrends(sorted);
        if (response.data.instagramWarning) {
          setInstagramWarning(response.data.instagramWarning);
        }
        loadInitialData();
      } else {
        setErrorMsg("Failed to retrieve trends. Please try again.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setErrorMsg(error.response?.data?.message || "Search failed. Check your network or API keys.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Official Instagram OAuth
  const handleConnectInstagram = async () => {
    setConnectingIg(true);
    try {
      const { data } = await api.post("/instagram/connect");
      if (data?.url) {
        window.location.href = data.url;
      } else {
        showToast("Failed to initiate OAuth.");
      }
    } catch (error) {
      console.error("Connect Instagram error:", error);
      showToast("Meta API configuration missing in .env");
    } finally {
      setConnectingIg(false);
    }
  };

  // Generate Content Idea via Gemini
  const handleGenerateIdea = async (trend) => {
    setSelectedTrend(trend);
    setGeneratingIdea(true);
    setGeneratedIdea(null);
    setCalendarSaved(false);
    setShowAiModal(true);
    
    try {
      const response = await api.post("/trends/generate-idea", {
        trendItemId: trend._id,
        targetPlatform
      });
      
      if (response.data?.success && response.data.idea) {
        setGeneratedIdea(response.data.idea);
        showToast("Gemini content idea generated!");
      } else {
        throw new Error("API responded without success");
      }
    } catch (error) {
      console.error("AI Generation error, using premium fallback:", error);
      
      // Construct highly relevant fallback template based on trend info
      const cleanTitle = trend.title || "Viral Content";
      const cleanNiche = trend.niche || "fitness";
      
      const fallbackIdea = {
        viralReelIdea: `Viral ${cleanNiche.toUpperCase()}: ${cleanTitle.substring(0, 50)}...`,
        hook: `Stop making this huge mistake with ${cleanNiche}! Do this instead.`,
        script: `[Visual: Text overlay 'Avoid this ${cleanNiche} mistake']\nDid you know that 90% of people fail at ${cleanNiche} because they ignore this one simple trick?\n\n[Visual: B-Roll transitions to key tip text]\nInstead of doing what everyone else does, focus on consistency and correct form.\n\n[Visual: Quick tutorial overlay]\nThis shifts your progress instantly. Try this today and save this video for later!\n\n[Sound: Energetic uplifting beat transition]`,
        caption: `Here is the ultimate blueprint to master ${cleanNiche} and level up your results. Save this reel for your next session!`,
        hashtags: [cleanNiche.toLowerCase(), "viral", "reels", "shorts", "trending", "creators"],
        contentAngle: "Contrarian / Debunking",
        videoFormat: "Aesthetic B-Roll + Bold Text Overlay",
        viralReason: "Hooks the viewer with a common mistake and resolves it with a quick loop."
      };
      
      setGeneratedIdea(fallbackIdea);
      showToast("Generated with fallback template!");
    } finally {
      setGeneratingIdea(false);
    }
  };

  // Save Generated Idea to Content Calendar
  const handleSaveToCalendar = async () => {
    if (!generatedIdea) return;
    try {
      const payload = {
        title: `AI: ${generatedIdea.viralReelIdea || "Viral Idea"}`,
        platform: targetPlatform.toLowerCase() === "instagram" ? "Instagram" : "YouTube",
        contentType: targetPlatform.toLowerCase() === "instagram" ? "Reel" : "Short",
        scheduledAt: new Date().toISOString(),
        status: "Pending"
      };
      
      await api.post("/features/calendar", payload);
      setCalendarSaved(true);
      showToast("Added to Content Calendar!");
    } catch (error) {
      console.error("Calendar save error:", error);
      showToast("Failed to save to calendar.");
    }
  };

  return (
    <div className="viral-page-container pl-16 md:pl-20" style={{ fontFamily: "var(--font-ui)", color: "#F8F5F0" }}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 99999, ...S.glass, padding: "12px 24px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontWeight: 600, fontSize: "14px" }}
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION - Matching original styling */}
      <div className="viral-header">
        <div className="viral-header-text">
          <h1 className="viral-title">
            Discover <span style={S.gradientText}>Safe Trends</span>
          </h1>
          <p className="viral-subtitle">Identify hot compliant signals from Reddit, Google News, and allowed Instagram Graph API nodes.</p>
        </div>

        {/* IG Connection button styled as "Advanced Filters" */}
        <button
          className="viral-filter-toggle-btn"
          onClick={handleConnectInstagram}
          disabled={connectingIg}
          style={{ ...S.glass, padding: "10px 20px", borderRadius: "12px", color: "#fff", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}
        >
          <ShieldCheck size={16} color={igConnected ? "#34d399" : "#a78bfa"} />
          {igConnected ? `Connected: @${igProfile?.username || "Business"}` : "Connect Profile"}
        </button>
      </div>

      {/* STICKY SEARCH BAR - Matching original styling */}
      <div className="viral-search-bar" style={{ ...S.glass, position: "sticky", zIndex: 100, borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        <div className="viral-search-input-wrapper">
          <Search size={18} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            value={platforms.includes("instagram") && platforms.length === 1 ? "Connected Instagram Account (No search query required)" : niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !platforms.includes("instagram") && handleSearch()}
            placeholder="Search keywords, creators, or niches..."
            disabled={platforms.includes("instagram") && platforms.length === 1}
            style={{ 
              ...S.input, 
              background: "transparent", 
              border: "none", 
              padding: "14px 0", 
              width: "100%", 
              fontSize: "15px", 
              color: (platforms.includes("instagram") && platforms.length === 1) ? "var(--muted-color)" : "#fff",
              cursor: (platforms.includes("instagram") && platforms.length === 1) ? "not-allowed" : "text"
            }}
          />
        </div>

        <div className="viral-search-actions">
          <div className="viral-search-selects-group">
            {/* Country Selector */}
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ ...S.input, padding: "0 16px", height: "48px", appearance: "none", paddingRight: "40px", background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center`, cursor: "pointer" }}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code} className="bg-zinc-950 text-white font-sans text-xs">
                  {c.name}
                </option>
              ))}
            </select>

            {/* Scope selector */}
            <select
              value={platforms.join("+")}
              onChange={(e) => setPlatforms(e.target.value.split("+"))}
              style={{ ...S.input, padding: "0 16px", height: "48px", appearance: "none", paddingRight: "40px", background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center`, cursor: "pointer" }}
            >
              <option value="reddit+google">Reddit + Google</option>
              <option value="reddit">Reddit Feeds Only</option>
              <option value="google">Google Trends Only</option>
              <option value="instagram">Instagram Graph Signals</option>
            </select>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            style={{ ...S.btnPrimary, height: "48px" }}
            className="viral-search-submit-btn"
          >
            {loading 
              ? "Fetching..." 
              : (platforms.includes("instagram") && platforms.length === 1 ? "Fetch IG Media" : "Search")
            } <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="viral-main-grid">
        
        {/* MAIN WORKING PANELS */}
        <div style={{ minWidth: 0 }}>
          
          {/* TRENDING INSIGHTS CARDS ROW - Exact replica of original */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            <TrendCard title="Trending Reddit Niches" icon={<TrendingUp size={20} color="#a78bfa" />} items={insights.niches} dataKey="name" valueKey="growth" />
            <TrendCard title="Google Search Topics" icon={<Hash size={20} color="#34d399" />} items={insights.hashtags} dataKey="name" valueKey="count" />
            <TrendCard title="Instagram Brand Insights" icon={<Music size={20} color="#f472b6" />} items={insights.audio} dataKey="name" valueKey="growth" />
          </div>

          {/* RESULTS HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
              <Flame size={20} className="text-orange-500" /> Discovered Trends
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", background: "rgba(167, 139, 250, 0.15)", padding: "2px 10px", borderRadius: "100px", marginLeft: "8px" }}>
                Top {trends.length} listed
              </span>
            </h3>
          </div>

          {/* Instagram API Warning Banner */}
          {instagramWarning && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-xl flex gap-3 text-xs leading-relaxed mb-6">
              <ShieldAlert size={16} className="shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Instagram Safe Discovery Alert:</strong> {instagramWarning}
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
              {errorMsg}
            </div>
          )}

          {trends.length === 0 && !loading && !errorMsg && (
            <div style={{ ...S.glass, padding: "64px 32px", borderRadius: "16px", textAlign: "center", spaceY: "16px" }}>
              <TrendingUp size={44} className="mx-auto text-gray-700 mb-4" />
              <h4 className="text-gray-300 font-bold text-sm mb-2">No trends crawled</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Submit a search query above to fetch safe compliant signals from active platform endpoints.
              </p>
            </div>
          )}

          {/* TRENDS LISTING GRID - Matching original card styles exactly */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {trends.map((item, idx) => {
              const isReddit = item.platform === "reddit";
              const isGoogle = item.platform === "google";
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              
              let highlightStyle = {};
              let badgeText = `#${rank} RANK`;
              let badgeBg = "rgba(255, 255, 255, 0.08)";
              let badgeColor = "#94a3b8";

              if (isTop3) {
                if (rank === 1) {
                  highlightStyle = { border: "2px solid #fbbf24", boxShadow: "0 0 25px rgba(251, 191, 36, 0.25)", background: "linear-gradient(180deg, rgba(251, 191, 36, 0.08) 0%, rgba(19, 20, 28, 0.8) 100%)" };
                  badgeText = "👑 #1 VIRAL";
                  badgeBg = "linear-gradient(135deg, #fbbf24, #d97706)";
                  badgeColor = "#000";
                } else if (rank === 2) {
                  highlightStyle = { border: "2px solid #cbd5e1", boxShadow: "0 0 22px rgba(203, 213, 225, 0.2)", background: "linear-gradient(180deg, rgba(203, 213, 225, 0.06) 0%, rgba(19, 20, 28, 0.8) 100%)" };
                  badgeText = "🥈 #2 VIRAL";
                  badgeBg = "linear-gradient(135deg, #e2e8f0, #94a3b8)";
                  badgeColor = "#000";
                } else if (rank === 3) {
                  highlightStyle = { border: "2px solid #cd7f32", boxShadow: "0 0 22px rgba(205, 127, 50, 0.18)", background: "linear-gradient(180deg, rgba(205, 127, 50, 0.06) 0%, rgba(19, 20, 28, 0.8) 100%)" };
                  badgeText = "🥉 #3 VIRAL";
                  badgeBg = "linear-gradient(135deg, #b45309, #78350f)";
                  badgeColor = "#fff";
                }
              }

              return (
                <motion.div
                  key={item._id || item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: isTop3 ? 1.025 : 1.012 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    ...S.glass,
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    ...highlightStyle
                  }}
                >
                  {/* Thumbnail Row */}
                  <div style={{ position: "relative", height: "200px", background: "#000" }}>
                    <img
                      src={item.thumbnail}
                      alt="Thumbnail"
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }}
                      onError={e => e.target.src="/viralrush_logo_placeholder.png"}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(13,14,20,1) 100%)" }} />
                    
                    {/* Absolute Badges */}
                    <div style={{ position: "absolute", top: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ background: badgeBg, color: badgeColor, padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", border: isTop3 ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
                          {badgeText}
                        </span>
                        <span style={{ background: isReddit ? "rgba(249,87,0,0.85)" : isGoogle ? "rgba(66,133,244,0.85)" : "linear-gradient(135deg, #f09433, #e6683c, #dc2743)", padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>
                          {item.platform}
                        </span>
                      </div>
                      <span style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                        Score: {item.viralScore}%
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Channel / Source Details */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isReddit ? "rgba(249,87,0,0.2)" : (item.platform === "instagram" ? "rgba(219,39,119,0.2)" : "rgba(255,255,255,0.08)"), border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: isReddit ? "#f95700" : (item.platform === "instagram" ? "#db2777" : "#a78bfa") }}>
                        {isReddit ? "R" : (item.platform === "instagram" ? "I" : "G")}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700 }}>
                          {item.sourceName || "Platform Feed"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", gap: "6px", alignItems: "center" }}>
                          <span>{isReddit ? "Subreddit Community" : (item.platform === "instagram" ? "Instagram Signals" : "Search Signals")}</span>
                          <span>•</span>
                          <span style={{ color: "#38bdf8", fontWeight: 700 }}>{formatPostDate(item.publishedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 10px 0", lineHeight: 1.4, color: "#fff" }}>
                      {item.title}
                    </h4>

                    {/* Badges/Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                      {isReddit && (
                        <>
                          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px" }}>👍 {item.metrics?.upvotes?.toLocaleString()} upvotes</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px" }}>💬 {item.metrics?.comments?.toLocaleString()} comments</span>
                        </>
                      )}
                      {isGoogle && (
                        <>
                          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px" }}>👀 {item.metrics?.reach?.toLocaleString()} search volume</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px" }}>📰 Google News</span>
                        </>
                      )}
                      {item.platform === "instagram" && (
                        <>
                          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px" }}>❤️ {item.metrics?.likes?.toLocaleString()} likes</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px" }}>💬 {item.metrics?.comments?.toLocaleString()} comments</span>
                        </>
                      )}
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Card Actions */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ flex: 1, ...S.btnPrimary, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", fontWeight: 700, padding: "10px 0", textDecoration: "none", borderRadius: "12px" }}
                        >
                          <Play size={14} fill="#cbd5e1" color="#cbd5e1" /> View
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleGenerateIdea(item)}
                        style={{ ...S.glass, padding: "0 16px", borderRadius: "12px", color: "#a78bfa", border: "1px solid rgba(167, 139, 250, 0.3)", background: "rgba(167, 139, 250, 0.08)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700 }}
                      >
                        <Sparkles size={14} /> AI Script
                      </button>

                      <button
                        onClick={() => copyText(item.title)}
                        style={{ ...S.glass, padding: "0 14px", borderRadius: "12px", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Copy Topic Title"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI CREATOR MODAL / SLIDE-OVER DRAWER - Consistent with original analysis drawer */}
      <AnimatePresence>
        {showAiModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", justifyContent: "flex-end", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} onClick={() => setShowAiModal(false)}>
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="viral-analysis-drawer"
              style={{ width: "100%", maxWidth: "560px", background: "#0d0f17", borderLeft: "1px solid rgba(255,255,255,0.08)", height: "100%", overflowY: "auto", position: "relative" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAiModal(false)}
                style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                ✕
              </button>

              <div style={{ padding: "40px 24px" }} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-pink-500 animate-pulse" />
                    <span className="text-[10px] text-pink-500 font-extrabold uppercase tracking-wider">Gemini AI Studio</span>
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", margin: 0 }}>AI Trend-to-Script Generator</h2>
                </div>

                {generatingIdea && (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <RefreshCw className="animate-spin text-pink-500" size={32} />
                    <p className="text-sm font-semibold text-white">Gemini is structuring your script idea...</p>
                    <p className="text-xs text-gray-500 max-w-[240px]">
                      Parsing Reddit & Google Trends search data into a high-engagement 30-sec script hook.
                    </p>
                  </div>
                )}

                {!generatingIdea && !generatedIdea && (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <AlertCircle size={40} className="text-rose-500" />
                    <h4 className="text-white font-bold text-sm">AI Generation Failed</h4>
                    <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
                      Your Gemini API key has exhausted its free-tier quota (<code>QUOTA_EXHAUSTED</code>).
                      Please wait a moment for the limits to reset, or configure a new key in your backend <code>.env</code> file.
                    </p>
                    <button
                      onClick={() => handleGenerateIdea(selectedTrend)}
                      style={{ ...S.btnPrimary, height: "36px", padding: "0 20px", fontSize: "12px", marginTop: "12px" }}
                    >
                      Retry Generation
                    </button>
                  </div>
                )}

                {generatedIdea && !generatingIdea && (
                  <div className="space-y-6 text-sm">
                    {/* Generated Concept */}
                    <div style={{ ...S.glass, padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-[9px] text-pink-400 font-black uppercase tracking-widest block mb-1">Generated Concept</span>
                      <h4 style={{ fontSize: "14px", fontWeight: 800, margin: 0, color: "#fff" }}>{generatedIdea.viralReelIdea}</h4>
                    </div>

                    {/* Hook Section */}
                    <div style={{ position: "relative" }}>
                      <div style={{ ...S.glass, padding: "16px", borderRadius: "16px", background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.2)" }}>
                        <span className="text-[9px] text-violet-400 font-black uppercase tracking-widest block mb-1">Scroll-Stopping Hook</span>
                        <p style={{ fontSize: "13px", color: "#fff", fontStyle: "italic", margin: 0, paddingRight: "28px" }}>"{generatedIdea.hook}"</p>
                        <button
                          onClick={() => handleCopy(generatedIdea.hook, "hook", "Hook copied!")}
                          style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                          title="Copy Hook"
                        >
                          {copiedHook ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Script Section */}
                    <div style={{ position: "relative" }}>
                      <div style={{ ...S.glass, padding: "20px", borderRadius: "16px", background: "rgba(0,0,0,0.3)" }}>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-2">30-Second Script (Teleprompter Feed)</span>
                        <div style={{ fontSize: "13px", lineHeight: 1.6, maxHeight: "220px", overflowY: "auto", paddingRight: "10px" }} className="custom-scrollbar">
                          {formatScript(generatedIdea.script)}
                        </div>
                        <button
                          onClick={() => handleCopy(generatedIdea.script, "script", "Script copied!")}
                          style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                          title="Copy Script"
                        >
                          {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Caption & Tags */}
                    <div style={{ position: "relative" }}>
                      <div style={{ ...S.glass, padding: "16px", borderRadius: "16px", background: "rgba(0,0,0,0.3)" }}>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">Optimized Caption</span>
                        <p style={{ fontSize: "13px", color: "#cbd5e1", margin: "0 0 12px 0" }}>{generatedIdea.caption}</p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {generatedIdea.hashtags?.map((tag) => (
                            <span key={tag} style={{ fontSize: "10px", background: "rgba(255,255,255,0.05)", color: "#94a3b8", padding: "4px 8px", borderRadius: "6px", fontWeight: 700 }}>
                              #{tag.replace("#", "")}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            const fullCap = `${generatedIdea.caption}\n\n${generatedIdea.hashtags?.map(h => `#${h.replace("#", "")}`).join(" ")}`;
                            handleCopy(fullCap, "caption", "Caption & Hashtags copied!");
                          }}
                          style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                          title="Copy Caption"
                        >
                          {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Viral Factor */}
                    <div style={{ ...S.glass, padding: "16px", borderRadius: "16px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest block mb-1">Viral Psychology Reason</span>
                      <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>{generatedIdea.viralReason}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div style={{ ...S.glass, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 800 }}>Content Angle</span>
                        <div style={{ fontSize: "12px", color: "#fff", fontWeight: 700, marginTop: "2px" }}>{generatedIdea.contentAngle || "Curiosity Loop"}</div>
                      </div>
                      <div style={{ ...S.glass, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 800 }}>Video Format</span>
                        <div style={{ fontSize: "12px", color: "#fff", fontWeight: 700, marginTop: "2px" }} className="truncate">{generatedIdea.videoFormat || "B-Roll + Text"}</div>
                      </div>
                    </div>

                    {/* Planner Save Action */}
                    <div className="pt-2 flex gap-3">
                      <button
                        onClick={() => {
                          const fullCopy = `CONCEPT: ${generatedIdea.viralReelIdea}\nHook: ${generatedIdea.hook}\n\nSCRIPT:\n${generatedIdea.script}\n\nCAPTION: ${generatedIdea.caption}\n\nTAGS: ${generatedIdea.hashtags?.map(t => `#${t.replace("#", "")}`).join(" ")}`;
                          handleCopy(fullCopy, "all", "Copied entire package!");
                        }}
                        style={{ flex: 1, ...S.btnPrimary, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "13px", height: "48px" }}
                      >
                        {copiedAll ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />} Copy Package
                      </button>

                      <button
                        onClick={handleSaveToCalendar}
                        disabled={calendarSaved}
                        style={{
                          flex: 1,
                          ...S.btnPrimary,
                          background: calendarSaved ? "#10b981" : "linear-gradient(135deg, #7c3aed, #db2777)",
                          fontSize: "13px",
                          height: "48px"
                        }}
                      >
                        {calendarSaved ? <><Check size={16} /> Added</> : <><Calendar size={16} /> Save to Planner</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.2; } }
        
        .viral-page-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 32px 24px;
          position: relative;
          z-index: 1;
        }
        
        .viral-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          gap: 16px;
        }
        .viral-title {
          font-size: 36px;
          font-weight: 900;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }
        .viral-subtitle {
          color: #94a3b8;
          font-size: 15px;
          margin: 0;
        }
        .viral-filter-toggle-btn {
          flex-shrink: 0;
        }
        
        .viral-search-bar {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 16px 24px;
          margin-bottom: 40px;
          top: 20px;
        }
        .viral-search-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0,0,0,0.4);
          border-radius: 12px;
          padding: 0 16px;
        }
        .viral-search-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .viral-search-selects-group {
          display: flex;
          gap: 12px;
        }
        .viral-search-submit-btn {
          padding: 0 32px;
          flex-shrink: 0;
        }
        
        .viral-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          transition: all 0.3s;
        }
        
        .viral-analysis-drawer {
          padding: 32px;
        }
        
        @media (max-width: 1024px) {
          .viral-search-bar {
            top: 76px;
          }
        }
        
        @media (max-width: 768px) {
          .viral-page-container {
            padding: 16px 12px;
          }
          .viral-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            margin-top: 12px;
          }
          .viral-title {
            font-size: 28px;
          }
          .viral-filter-toggle-btn {
            width: 100%;
            justify-content: center;
          }
          
          .viral-search-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 16px;
          }
          .viral-search-input-wrapper {
            width: 100%;
          }
          .viral-search-actions {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }
          .viral-search-selects-group {
            width: 100%;
          }
          .viral-search-selects-group select {
            flex: 1;
          }
          .viral-search-submit-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

// Subcomponents matching original Finder code structure

function TrendCard({ title, icon, items, dataKey, valueKey }) {
  return (
    <div style={{ ...S.glass, borderRadius: "16px", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px", borderRadius: "10px" }}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>{title}</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {(items || []).slice(0, 4).map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 500 }}>{item[dataKey]}</span>
            <span style={{ fontSize: "12px", color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: "100px", fontWeight: 700 }}>{item[valueKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
