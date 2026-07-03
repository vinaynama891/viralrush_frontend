import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, TrendingUp, Info, ShieldCheck,
  Calendar, Check, Copy, Flame, MessageSquare, ArrowUpRight,
  TrendingDown, Globe, Sparkles, RefreshCw, Send, AlertCircle,
  HelpCircle, Eye, ShieldAlert, Award, Clock, Hash, Music, Play
} from "lucide-react";
import api from "../lib/api";

const InstagramIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", padding: "3px", borderRadius: "6px", color: "#fff" }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const RedditIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} fill="#FF4500" style={{ background: "rgba(255, 69, 0, 0.1)", padding: "3px", borderRadius: "6px" }}>
    <path d="M17.15 8.93c-.47 0-.88.2-1.18.52a8.55 8.55 0 00-4.63-1.42l.98-3.08 3.2.68c.03.74.64 1.34 1.4 1.34.77 0 1.4-.63 1.4-1.4a1.4 1.4 0 00-2.22-1.12l-3.52-.75a.47.47 0 00-.54.34l-1.09 3.44a8.6 8.6 0 00-4.7 1.42c-.3-.32-.71-.52-1.18-.52-.92 0-1.67.75-1.67 1.67 0 .64.36 1.2.9 1.48-.04.22-.06.44-.06.67 0 2.8 3.5 5.08 7.82 5.08s7.82-2.28 7.82-5.08c0-.23-.02-.45-.06-.67.54-.28.9-.84.9-1.48 0-.92-.75-1.67-1.67-1.67zm-10 2.5a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zm6.57 3.5a4.7 4.7 0 01-7.44 0 .31.31 0 01.44-.45 4.07 4.07 0 006.56 0 .31.31 0 01.44.45zm-.82-2.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25z"/>
  </svg>
);

const GoogleIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ background: "rgba(255,255,255,0.08)", padding: "3px", borderRadius: "6px" }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AllIcon = ({ size = 20 }) => (
  <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
    <RedditIcon size={size - 2} />
    <GoogleIcon size={size - 2} />
  </div>
);

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
  const [timeLeft, setTimeLeft] = useState("08:29:38");
  

  
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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setHours(24, 0, 0, 0); // target is midnight
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
      } else {
        const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        setTimeLeft(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
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

      {/* HEADER SECTION - Centered like the screenshot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", marginBottom: "32px", width: "100%" }}>
        {/* Connect Profile button positioned at top right */}
        <div className="viral-filter-toggle-btn" style={{ position: "absolute", top: 0, right: 0 }}>
          <button
            onClick={handleConnectInstagram}
            disabled={connectingIg}
            style={{ ...S.glass, padding: "10px 20px", borderRadius: "12px", color: "#fff", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            <ShieldCheck size={16} color={igConnected ? "#34d399" : "#a78bfa"} />
            {igConnected ? `Connected: @${igProfile?.username || "Business"}` : "Connect Profile"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: 900, letterSpacing: "-1.5px", margin: "0 0 12px 0", color: "#fff" }}>
            Discover <span style={{ background: "linear-gradient(90deg, #ec4899, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Viral</span> Content Ideas
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", margin: 0, fontWeight: 500 }}>
            Find scroll-stopping content ideas in seconds
          </p>
        </div>
      </div>

      {/* SAFE TRENDS SEARCH & PLATFORM CONTAINER */}
      <div 
        style={{ 
          ...S.glass, 
          borderRadius: "24px", 
          padding: "32px", 
          marginBottom: "40px", 
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          background: "rgba(10, 11, 18, 0.75)"
        }}
      >
        {/* Platforms Toggle Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[
            {
              id: "reddit+google",
              label: "Reddit + Google",
              icon: <AllIcon size={18} />,
              active: platforms.includes("reddit") && platforms.includes("google") && platforms.length === 2
            },
            {
              id: "reddit",
              label: "Reddit",
              icon: <RedditIcon size={18} />,
              active: platforms.includes("reddit") && platforms.length === 1
            },
            {
              id: "google",
              label: "Google",
              icon: <GoogleIcon size={18} />,
              active: platforms.includes("google") && platforms.length === 1
            },
            {
              id: "instagram",
              label: "Instagram",
              icon: <InstagramIcon size={18} />,
              active: platforms.includes("instagram") && platforms.length === 1
            }
          ].map(p => (
            <div
              key={p.id}
              onClick={() => setPlatforms(p.id.split("+"))}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 20px",
                borderRadius: "16px",
                border: p.active 
                  ? "1.5px solid #ec4899" 
                  : "1px solid rgba(255, 255, 255, 0.08)",
                background: p.active 
                  ? "rgba(236, 72, 153, 0.06)" 
                  : "rgba(255, 255, 255, 0.02)",
                boxShadow: p.active 
                  ? "0 0 15px rgba(236, 72, 153, 0.15)" 
                  : "none",
                cursor: "pointer",
                transition: "all 0.25s ease"
              }}
              className="safe-platform-toggle-btn"
            >
              <div style={{ marginRight: "12px", display: "flex", alignItems: "center" }}>
                {p.icon}
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: p.active ? "#fff" : "#cbd5e1" }}>
                {p.label}
              </span>
              {p.active && (
                <span 
                  style={{ 
                    background: "linear-gradient(135deg, #db2777, #f97316)", 
                    color: "#fff", 
                    fontSize: "9px", 
                    fontWeight: 900, 
                    padding: "3px 8px", 
                    borderRadius: "100px", 
                    marginLeft: "auto",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  Selected
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Search Input Box */}
        <div 
          style={{ 
            background: "rgba(0, 0, 0, 0.45)", 
            borderRadius: "16px", 
            border: "1px solid rgba(255, 255, 255, 0.06)", 
            padding: "8px 16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <Search size={20} color="#64748b" />
            <input
              value={platforms.includes("instagram") && platforms.length === 1 ? "Connected Instagram Account (No search query required)" : niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !platforms.includes("instagram") && handleSearch()}
              placeholder="Search keywords, creators, or niches..."
              disabled={platforms.includes("instagram") && platforms.length === 1}
              style={{ 
                background: "transparent", 
                border: "none", 
                padding: "12px 0", 
                width: "100%", 
                fontSize: "16px", 
                outline: "none",
                color: (platforms.includes("instagram") && platforms.length === 1) ? "#64748b" : "#fff",
                cursor: (platforms.includes("instagram") && platforms.length === 1) ? "not-allowed" : "text"
              }}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            style={{ 
              background: "linear-gradient(135deg, #7c3aed, #db2777)", 
              color: "#fff", 
              fontWeight: 700, 
              borderRadius: "12px", 
              border: "none", 
              cursor: "pointer", 
              padding: "12px 32px", 
              fontSize: "14px", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)"
            }}
          >
            {loading 
              ? "Fetching..." 
              : (platforms.includes("instagram") && platforms.length === 1 ? "Fetch IG Media" : "Search")
            }
          </button>
        </div>


        {/* Footer info: Country select + Countdown */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase" }}>
              TRENDING NOW IN
            </span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ 
                background: "transparent", 
                border: "none", 
                color: "#a78bfa", 
                fontSize: "12px", 
                fontWeight: 800, 
                outline: "none", 
                cursor: "pointer",
                paddingRight: "8px"
              }}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code} style={{ background: "#0d0f17", color: "#fff" }}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
            Refreshes in <span style={{ color: "#ec4899", fontFamily: "monospace", fontWeight: 700 }}>{timeLeft}</span>
          </div>
        </div>
      </div>

      <div className="viral-main-grid">
        
        {/* MAIN WORKING PANELS */}
        <div style={{ minWidth: 0 }}>
          


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

        .safe-platform-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        .safe-suggestion-pill {
          transition: all 0.2s ease;
        }
        .safe-suggestion-pill:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-2px);
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
