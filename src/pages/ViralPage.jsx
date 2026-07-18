import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, TrendingUp, Music, Hash,
  Play, Heart, MessageCircle, Share2, Bookmark, Eye,
  CheckCircle, Sparkles, Clock, Users, ArrowUpRight,
  ChevronDown, X, Copy, Zap, Info, ShieldCheck, Video, LayoutGrid,
  Globe, Languages, RefreshCw, ArrowLeft, Check
} from "lucide-react";
import api, { getProxiedImage } from "../lib/api";

const Youtube = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const Instagram = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const S = {
  glass: { background: "rgba(19, 20, 28, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" },
  input: { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", borderRadius: "12px", transition: "all 0.2s" },
  gradientText: { background: "linear-gradient(90deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  btnPrimary: { background: "linear-gradient(135deg, #7c3aed, #db2777)", color: "#fff", fontWeight: 700, borderRadius: "12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)" }
};

// Platform configuration for the selector
const PLATFORMS = [
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    glow: "rgba(239, 68, 68, 0.3)",
    bgTint: "rgba(239, 68, 68, 0.08)",
    borderTint: "rgba(239, 68, 68, 0.25)",
    platformLabel: "YouTube",
    contentLabel: "Shorts & Videos",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "#e1306c",
    gradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
    glow: "rgba(225, 48, 108, 0.3)",
    bgTint: "rgba(225, 48, 108, 0.08)",
    borderTint: "rgba(225, 48, 108, 0.25)",
    platformLabel: "Instagram",
    contentLabel: "Reels & Posts",
  },
];

export default function ViralPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [results, setResults] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [insights, setInsights] = useState({ niches: [], hashtags: [], audio: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [toast, setToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  
  // Instagram transcribing & script generator states
  const [instagramUrl, setInstagramUrl] = useState("");
  const [instagramLanguage, setInstagramLanguage] = useState("auto");
  const [instagramNiche, setInstagramNiche] = useState("");
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramResults, setInstagramResults] = useState(null);
  const [instagramStage, setInstagramStage] = useState("");

  // Refinement states
  const [refineLoading, setRefineLoading] = useState(false);
  const [refinedData, setRefinedData] = useState(null);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [selectedVideoToRefine, setSelectedVideoToRefine] = useState(null);

  const activePlatform = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0];

  // Filters State
  const [filters, setFilters] = useState({
    country: "IN",
    timeRange: "30 Days",
    sortBy: "Most Viral",
    minViews: "100k",
    contentType: "Shorts",
    verifiedOnly: false
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt || "");
    showToast("Copied to clipboard!");
  };

  const fetchInsights = async () => {
    try {
      const [n, h, a] = await Promise.all([
        api.get("/viral/trending"),
        api.get("/viral/hashtags"),
        api.get("/viral/audio")
      ]);
      setInsights({ niches: n.data, hashtags: h.data, audio: a.data });
    } catch (err) {
      console.log("Insights fetch error");
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      showToast("Please enter a keyword to search!");
      return;
    }
    setShowLoader(true);
    setLoading(true);
    setErrorMsg("");
    setResults([]);
    setAiAnalysis(null);
    try {
      const { data } = await api.post("/viral-content/find", {
        keyword: query.trim(),
        regionCode: filters.country === "Global" ? "US" : filters.country,
        maxResults: 10,
        platform: selectedPlatform
      });

      if (!data.success || !data.videos?.length) {
        setErrorMsg(data.message || "No content found. Try a different keyword.");
        return;
      }

      // Sort videos by view count descending (most views first, least views last)
      const sortedVideos = [...data.videos].sort((a, b) => {
        const viewsA = Number(a.viewCount) || 0;
        const viewsB = Number(b.viewCount) || 0;
        return viewsB - viewsA;
      });

      // Map API response → card format (works for all platforms)
      const mapped = sortedVideos.map((v, idx) => ({
        ...v,
        id: v.videoId,
        rank: idx + 1,
        platform: activePlatform.platformLabel,
        views: v.viewCount >= 1000000
          ? `${(v.viewCount / 1000000).toFixed(1)}M`
          : `${Math.round(v.viewCount / 1000)}K`,
        likes: v.likeCount >= 1000000
          ? `${(v.likeCount / 1000000).toFixed(1)}M`
          : `${Math.round(v.likeCount / 1000)}K`,
        comments: v.commentCount >= 1000
          ? `${Math.round(v.commentCount / 1000)}K`
          : `${v.commentCount}`,
        engagementRate: `${v.engagementRate}%`,
        creator: `@${(v.channelTitle || "").replace(/\s+/g, "").toLowerCase()}`,
        hook: v.title,
        audioUsed: selectedPlatform === "youtube" ? "Original Audio" : "Trending Audio",
        reelLength: v.duration || "N/A",
        isVerified: false,
        followersCount: "N/A",
        postedTime: v.publishedAt ? new Date(v.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent",
        caption: v.description,
      }));

      setResults(mapped);
      setAiAnalysis(data.aiAnalysis);
    } catch (err) {
      const msg = err?.response?.data?.message || "Search failed. Check your API keys.";
      setErrorMsg(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const startStageSimulation = () => {
    const stages = [
      { label: "Validating Reel", delay: 0 },
      { label: "Downloading Reel", delay: 1000 },
      { label: "Extracting Audio", delay: 8000 },
      { label: "Generating Subtitles", delay: 13000 },
      { label: "Analysing Content", delay: 18000 },
      { label: "Creating Scripts", delay: 24000 }
    ];

    const timers = stages.map(stage => {
      return setTimeout(() => {
        setInstagramStage(stage.label);
      }, stage.delay);
    });

    return timers;
  };

  const downloadSrtFile = (srtContent) => {
    if (!srtContent) return;
    try {
      const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `subtitles_${Date.now()}.srt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("SRT file download initiated!");
    } catch (err) {
      console.error(err);
      showToast("Failed to download SRT file.");
    }
  };

  const handleInstagramSubmit = async () => {
    if (!instagramUrl.trim()) {
      showToast("Please paste an Instagram Reel URL!");
      return;
    }
    
    // Quick frontend check
    if (!instagramUrl.includes("instagram.com/reel/") && !instagramUrl.includes("instagram.com/p/")) {
      showToast("Invalid Reel URL. Must be a public instagram.com/reel/ link.");
      return;
    }

    setInstagramLoading(true);
    setErrorMsg("");
    setInstagramResults(null);
    const timers = startStageSimulation();

    try {
      const { data } = await api.post("/instagram/analyze", {
        reelUrl: instagramUrl.trim(),
        language: instagramLanguage
      });

      if (data.success && data.data) {
        setInstagramResults(data.data);
        showToast("Instagram Reel analysis completed!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to analyze Reel. Check the URL and try again.";
      setErrorMsg(msg);
      showToast(msg);
    } finally {
      setInstagramLoading(false);
      setInstagramStage("");
      timers.forEach(t => clearTimeout(t));
    }
  };

  const handleRefineClick = (item) => {
    setSelectedVideoToRefine(item);
    setShowRefineModal(true);
    setRefineLoading(false);
    setRefinedData(null);
  };

  const handleRefine = async (item, targetLanguage = "auto") => {
    setRefineLoading(true);
    setRefinedData(null);
    try {
      const { data } = await api.post("/viral-content/refine", {
        videoId: item.id || item.videoId,
        title: item.title,
        description: item.caption || item.description,
        platform: selectedPlatform,
        channelTitle: item.channelTitle || item.creator,
        targetLanguage: targetLanguage
      });
      if (data.success) {
        setRefinedData(data.refined);
      } else {
        showToast("Failed to refine content.");
      }
    } catch (err) {
      console.error("Refine error:", err);
      showToast("Error refining content. Using fallback.");
      
      const cleanTitle = item.title || "Viral Content";
      const cleanTopic = cleanTitle.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
      const words = cleanTopic.split(/\s+/).filter(w => w.length > 3 && !["this", "that", "with", "from", "your", "have", "about", "what", "here", "want", "know"].includes(w.toLowerCase()));
      const keyword1 = words[0] || "this topic";
      const keyword2 = words[1] || "these strategies";
      const keyword3 = words[2] || "essential tips";

      let originalScript = `Hey guys, today we are looking at "${cleanTitle}". Here is exactly how we can break this down: ${item.caption || item.description || "Let's dive into the core strategies used in this post."}`;
      let hook = `Stop scrolling! If you want to know how to actually master "${cleanTopic}", you need to watch this until the end.`;
      let fullScript = `Stop scrolling! If you want to know how to actually master "${cleanTopic}", you need to watch this until the end. Most people struggle with ${keyword1} because they focus on the wrong approach. Here is the exact fix: First, optimize your ${keyword2}. Second, implement ${keyword3} immediately. Do this for 30 days and watch your metrics explode. If you found this helpful, make sure to follow for more tips and share this with a friend!`;
      let caption = `Unpopular opinion: Most people are doing "${cleanTopic}" wrong... 😳\n\nIf you've been struggling to see results with ${keyword1}, here's your sign to change your approach. Save this video so you don't forget it, and let me know your thoughts in the comments! 👇\n\n#viral #${keyword1.toLowerCase().replace(/[^a-z0-9]/g, "")} #success #tips`;

      if (targetLanguage === "hindi") {
        originalScript = `नमस्ते दोस्तों, आज हम देख रहे हैं "${cleanTitle}"। हम इसे इस तरह से समझ सकते हैं...`;
        hook = `रुकिए! अगर आप "${cleanTopic}" में महारत हासिल करना चाहते हैं, तो इस वीडियो को अंत तक जरूर देखें।`;
        fullScript = `रुकिए! अगर आप "${cleanTopic}" में महारत हासिल करना चाहते हैं, तो इस वीडियो को अंत तक जरूर देखें। ज्यादातर लोग ${keyword1} में असफल होते हैं क्योंकि वे गलत तरीका अपनाते हैं। आज से आपको केवल एक चीज बदलनी है: ${keyword2} और ${keyword3} पर ध्यान दें। इसे 30 दिनों तक करें और अपने परिणाम देखें। अगर आपको यह मददगार लगा, तो फॉलो करना न भूलें!`;
        caption = `अलोकप्रिय राय: अधिकांश लोग "${cleanTopic}" को गलत कर रहे हैं... 😳\n\nयदि आप ${keyword1} के साथ परिणाम देखने के लिए संघर्ष कर रहे हैं, तो अपना दृष्टिकोण बदलने का यह सही समय है। इस वीडियो को सेव करें और कमेंट्स में अपने विचार बताएं! 👇\n\n#viral #${keyword1.toLowerCase().replace(/[^a-z0-9]/g, "")} #success #tips`;
      } else if (targetLanguage === "hinglish") {
        originalScript = `Hey dosto, aaj hum dekh rahe hai "${cleanTitle}" ke baare me. Isko hum aise samajh sakte hai...`;
        hook = `Ruko! Agar aap "${cleanTopic}" me master banna chahte ho, to is video ko end tak zaroor dekho.`;
        fullScript = `Ruko! Agar aap "${cleanTopic}" me master banna chahte ho, to is video ko end tak zaroor dekho. Zyada tar log ${keyword1} me fail hote hai kyunki wo galat approach use karte hai. Aaj से aapko bas ek chiz badalni hai: ${keyword2} aur ${keyword3} par focus karo. Ise 30 dino tak karo aur apna growth dekho. Agar video acchi lagi to follow zaroor karna!`;
        caption = `Unpopular opinion: Zyada tar log "${cleanTopic}" ko galat kar rahe hai... 😳\n\nKaise laga aapko ye video? Comment karke zaroor bataye aur aisi videos ke liye follow karein! 👇\n\n#viral #${keyword1.toLowerCase().replace(/[^a-z0-9]/g, "")} #success #tips`;
      }

      setRefinedData({
        originalScript,
        title: `🔥 Unlocking the Secret to ${cleanTopic}`,
        script: {
          hook,
          structure: [
            `1. Hook: Catch attention on "${cleanTopic}"`,
            `2. Problem: Why people fail at ${keyword1}`,
            `3. Solution: Introduce ${keyword2} and ${keyword3}`,
            "4. Call to Action: Follow and save for later"
          ],
          fullScript
        },
        caption,
        hashtags: ["viral", "trending", "growth", "strategy", "marketing", "contentcreator", keyword1.toLowerCase().replace(/[^a-z0-9]/g, ""), "tips"]
      });
    } finally {
      setRefineLoading(false);
    }
  };


  return (
    <div style={{ minHeight: "100vh", background: "#06070B", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", paddingBottom: "100px", overflowX: "hidden", position: "relative" }}>
      
      {/* Background Gradients */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(219,39,119,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, ...S.glass, padding: "12px 24px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontWeight: 600, fontSize: "14px" }}>
            <CheckCircle size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="viral-page-container">
        
        {/* HEADER */}
        <div className="viral-header">
          <div className="viral-header-text">
            <h1 className="viral-title">
              Discover <span style={S.gradientText}>Viral Content</span>
            </h1>
            <p className="viral-subtitle">Analyze top-performing Reels, TikToks, and Shorts to fuel your next viral hit.</p>
          </div>
          <button className="viral-filter-toggle-btn" onClick={() => setShowFilters(!showFilters)} style={{ ...S.glass, padding: "10px 20px", borderRadius: "12px", color: "#fff", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
            <SlidersHorizontal size={16} /> Advanced Filters
          </button>
        </div>

        {/* PLATFORM CARDS/TABS */}
        <div className="viral-platform-selector" style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          {PLATFORMS.map(p => {
            const Icon = p.icon;
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlatform(p.id);
                  setErrorMsg("");
                }}
                style={{
                  ...S.glass,
                  flex: 1,
                  minWidth: "240px",
                  padding: "20px 24px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: isSelected ? `2px solid ${p.color}` : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isSelected ? `0 10px 30px ${p.glow}` : "none",
                  background: isSelected ? p.bgTint : "rgba(19, 20, 28, 0.4)",
                  transform: isSelected ? "scale(1.01)" : "scale(1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: isSelected ? p.gradient : "rgba(255,255,255,0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff"
                  }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#fff" }}>{p.label} Finder</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>{p.contentLabel}</p>
                  </div>
                </div>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isSelected ? p.color : "transparent",
                  boxShadow: isSelected ? `0 0 8px ${p.color}` : "none"
                }} />
              </button>
            );
          })}
        </div>

        {selectedPlatform === "youtube" && (
          <>
            {/* STICKY SEARCH BAR */}
            <div className="viral-search-bar" style={{ ...S.glass, position: "sticky", zIndex: 100, borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
              <div className="viral-search-input-wrapper">
                <Search size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <input 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search keywords, creators, or niches..."
                  style={{ ...S.input, background: "transparent", border: "none", padding: "14px 0", width: "100%", fontSize: "15px" }} 
                />
              </div>

              <div className="viral-search-actions">
                <div className="viral-search-selects-group">
                  {["Country", "TimeRange"].map(field => (
                    <select key={field} value={filters[field.toLowerCase()]} onChange={e => setFilters({...filters, [field.toLowerCase()]: e.target.value})} style={{ ...S.input, padding: "0 16px", height: "48px", appearance: "none", paddingRight: "40px", background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center`, cursor: "pointer", width: "100%" }}>
                      <option value={filters[field.toLowerCase()]}>{filters[field.toLowerCase()] || field}</option>
                      {field === "Country" && <><option>Global</option><option>USA</option><option>India</option></>}
                      {field === "TimeRange" && <><option>7 Days</option><option>30 Days</option><option>24 Hours</option></>}
                    </select>
                  ))}
                </div>
                
                <button onClick={handleSearch} disabled={loading} style={{ ...S.btnPrimary, height: "48px" }} className="viral-search-submit-btn">
                  {loading ? "Searching..." : "Search"} <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            <div className={`viral-main-grid ${showFilters ? "show-sidebar" : ""}`}>
              
              {/* ADVANCED FILTERS SIDEBAR */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    style={{ overflow: "hidden" }}
                    className="viral-filters-sidebar"
                  >
                    <div style={{ ...S.glass, borderRadius: "16px", padding: "24px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <SlidersHorizontal size={14} /> Filter Logic
                      </h3>

                      {[
                        { label: "Sort By", key: "sortBy", opts: ["Most Viral", "Most Viewed", "Highest Engagement", "Fastest Growing"] },
                        { label: "Min Views", key: "minViews", opts: ["10k", "50k", "100k", "1M+"] },
                        { label: "Content Type", key: "contentType", opts: ["Shorts", "Long-form", "All"] }
                      ].map(f => (
                        <div key={f.key} style={{ marginBottom: "20px" }}>
                          <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "8px", fontWeight: 600 }}>{f.label}</label>
                          <select value={filters[f.key]} onChange={e => setFilters({...filters, [f.key]: e.target.value})} style={{ ...S.input, width: "100%", padding: "10px", fontSize: "13px" }}>
                            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#cbd5e1", cursor: "pointer", marginTop: "10px" }}>
                        <input type="checkbox" checked={filters.verifiedOnly} onChange={e => setFilters({...filters, verifiedOnly: e.target.checked})} style={{ width: "16px", height: "16px", accentColor: "#7c3aed" }} />
                        Verified Accounts Only
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MAIN CONTENT AREA */}
              <div style={{ minWidth: 0 }}>
                
                {/* RESULTS HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                    <LayoutGrid size={20} color="#a78bfa" /> Viral Results <span style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", padding: "2px 10px", borderRadius: "100px", fontSize: "12px" }}>Top {results.length} listed</span>
                  </h2>
                </div>

                {loading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
                    {[1,2,3,4,6,8].map(i => <div key={i} style={{ ...S.glass, height: "320px", borderRadius: "20px", animation: "pulse 1.5s infinite" }} />)}
                  </div>
                ) : errorMsg ? (
                  <div style={{ ...S.glass, padding: "60px 20px", textAlign: "center", borderRadius: "20px", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <Video size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
                    <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", color: "#f87171" }}>Search Failed</h3>
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>{errorMsg}</p>
                  </div>
                ) : results.length === 0 ? (
                  <div style={{ ...S.glass, padding: "80px 20px", textAlign: "center", borderRadius: "20px" }}>
                    {React.createElement(activePlatform.icon, { size: 48, color: activePlatform.color, style: { margin: "0 auto 16px" } })}
                    <h3 style={{ fontSize: "18px", margin: "0 0 8px 0" }}>Search {activePlatform.label} Viral Content</h3>
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>Type a topic like "fitness", "tech" or "food" and press Search to find viral {activePlatform.contentLabel} on {activePlatform.label}.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))", gap: "28px" }}>
                    {results.map((item, idx) => (
                      <ResultCard key={idx} item={item} rank={idx + 1}
                        onCopy={copyText}
                        onWatch={() => {
                          window.open(item.videoUrl, "_blank", "noopener,noreferrer");
                        }}
                        selectedPlatform={selectedPlatform}
                        onRefine={handleRefineClick}
                      />
                    ))}
                  </div>
                )}
                
              </div>
            </div>
          </>
        )}

        {/* INSTAGRAM LINK FORM */}
        {selectedPlatform === "instagram" && (
          <div style={{ ...S.glass, borderRadius: "24px", padding: "32px", marginBottom: "40px", border: "1px solid rgba(225,48,108,0.15)" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 8px 0", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
              <Instagram size={24} color="#e1306c" /> Instagram Reel Analyzer
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 24px 0" }}>
              Paste any public Instagram Reel URL. AI will download, extract audio, generate timestamped subtitles, and construct 3 unique viral script variations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#cbd5e1", marginBottom: "8px" }}>
                  Instagram Reel URL
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/C89abcdef/ or https://www.instagram.com/p/C89abcdef/"
                  style={{ ...S.input, width: "100%", padding: "14px 18px", fontSize: "15px", background: "rgba(0,0,0,0.4)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#cbd5e1", marginBottom: "8px" }}>
                  Select Output Script Language
                </label>
                <select
                  value={instagramLanguage}
                  onChange={e => setInstagramLanguage(e.target.value)}
                  style={{ ...S.input, width: "100%", padding: "14px 18px", fontSize: "15px", background: "rgba(0,0,0,0.4)", cursor: "pointer" }}
                >
                  <option value="auto">Auto Detect (Same as Reel)</option>
                  <option value="english">English (US/UK)</option>
                  <option value="hindi">Hindi (हिंदी देवनागरी)</option>
                  <option value="hinglish">Hinglish (Hinglish/Latin)</option>
                </select>
              </div>

              <button
                onClick={handleInstagramSubmit}
                disabled={instagramLoading}
                style={{ ...S.btnPrimary, background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", height: "54px", width: "100%", fontSize: "16px", marginTop: "10px", pointerEvents: instagramLoading ? "none" : "auto", opacity: instagramLoading ? 0.7 : 1 }}
              >
                {instagramLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} /> Generating Subtitles & Scripts...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> Analyze Reel & Generate 3 Scripts
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {selectedPlatform === "instagram" && instagramLoading && (
          <div style={{ ...S.glass, borderRadius: "24px", padding: "60px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <RefreshCw className="animate-spin text-pink-500" size={40} style={{ animationDuration: "1.5s" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "0.5px" }}>
              {instagramStage || "Analyzing Reel"}
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "340px", margin: 0, lineHeight: 1.5 }}>
              Please wait while our engine performs deep analysis, extracts audio, transcribes speech, formats subtitles, and writes viral scripts.
            </p>
          </div>
        )}

        {selectedPlatform === "instagram" && errorMsg && !instagramLoading && (
          <div style={{ ...S.glass, padding: "40px 20px", textAlign: "center", borderRadius: "20px", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "40px" }}>
            <Video size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", color: "#f87171" }}>Generation Failed</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>{errorMsg}</p>
          </div>
        )}

        {selectedPlatform === "instagram" && instagramResults && !instagramLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* 1. OVERALL METRICS & AI ANALYSIS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              
              {/* Virality Audit Card */}
              <div style={{ ...S.glass, borderRadius: "24px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#cbd5e1", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} color="#e1306c" /> Virality Audit
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ background: "rgba(225,48,108,0.06)", border: "1px solid rgba(225,48,108,0.15)", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "4px" }}>VIRAL SCORE</span>
                    <span style={{ fontSize: "36px", fontWeight: 900, color: "#fff", textShadow: "0 0 10px rgba(225,48,108,0.4)" }}>
                      {instagramResults.analysis.viralScore}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}> / 100</span>
                  </div>
                  
                  <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "4px" }}>HOOK SCORE</span>
                    <span style={{ fontSize: "36px", fontWeight: 900, color: "#fff", textShadow: "0 0 10px rgba(124,58,237,0.4)" }}>
                      {instagramResults.analysis.hookScore}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}> / 10</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>Detected Language:</span>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{instagramResults.detectedLanguage}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>Content Type:</span>
                    <span style={{ color: "#e1306c", fontWeight: 700, textTransform: "capitalize" }}>{instagramResults.contentType}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>Duration:</span>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{instagramResults.duration} seconds</span>
                  </div>
                </div>
              </div>

              {/* Video Details Audit Card */}
              <div style={{ ...S.glass, borderRadius: "24px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#cbd5e1", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Info size={18} color="#e1306c" /> Reel Insights
                </h3>
                
                <div style={{ fontSize: "14px", lineHeight: 1.5 }}>
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 700, display: "block" }}>TOPIC</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{instagramResults.analysis.topic}</span>
                  </div>
                  
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 700, display: "block" }}>TONE</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{instagramResults.analysis.tone}</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                    {instagramResults.analysis.targetAudience.map((aud, i) => (
                      <span key={i} style={{ padding: "4px 10px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", color: "#e2e8f0" }}>
                        👤 {aud}
                      </span>
                    ))}
                    {instagramResults.analysis.emotion.map((emo, i) => (
                      <span key={i} style={{ padding: "4px 10px", borderRadius: "100px", background: "rgba(225,48,108,0.1)", border: "1px solid rgba(225,48,108,0.2)", fontSize: "11px", color: "#fca5a5" }}>
                        🎭 {emo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Hook and CTA audit */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              <div style={{ ...S.glass, borderRadius: "20px", padding: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#fd1d1d", display: "block", marginBottom: "4px" }}>ORIGINAL REEL HOOK</span>
                <p style={{ margin: 0, fontSize: "13px", color: "#fff", fontStyle: "italic" }}>"{instagramResults.analysis.hook || "No clear hook detected."}"</p>
              </div>
              <div style={{ ...S.glass, borderRadius: "20px", padding: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#fd1d1d", display: "block", marginBottom: "4px" }}>ORIGINAL REEL CTA</span>
                <p style={{ margin: 0, fontSize: "13px", color: "#fff", fontStyle: "italic" }}>"{instagramResults.analysis.cta || "No clear CTA detected."}"</p>
              </div>
            </div>

            {/* 2. SUBTITLES & TRANSCRIPT VIEWS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              
              {/* Full Transcript */}
              <div style={{ ...S.glass, borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", color: "#cbd5e1", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Languages size={16} color="#e1306c" /> Spoken Transcript
                </h4>
                <div style={{ flex: 1, maxHeight: "250px", overflowY: "auto", background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "16px", fontSize: "13px", lineHeight: 1.6, color: "#fff" }} className="custom-scrollbar">
                  {instagramResults.transcript}
                </div>
                <button
                  onClick={() => copyText(instagramResults.transcript)}
                  style={{ ...S.glass, color: "#fff", padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: "none", alignSelf: "flex-start" }}
                >
                  <Copy size={12} /> Copy Transcript
                </button>
              </div>

              {/* Timestamped Subtitles */}
              <div style={{ ...S.glass, borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", color: "#cbd5e1", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={16} color="#e1306c" /> Subtitle Segments
                </h4>
                <div style={{ flex: 1, maxHeight: "250px", overflowY: "auto", background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "16px", fontSize: "13px", lineHeight: 1.6, color: "#fff", fontFamily: "var(--font-mono, monospace)", whiteSpace: "pre-wrap" }} className="custom-scrollbar">
                  {instagramResults.subtitleText}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => copyText(instagramResults.srtContent)}
                    style={{ ...S.glass, color: "#fff", padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: "none" }}
                  >
                    <Copy size={12} /> Copy SRT Subtitles
                  </button>
                  <button
                    onClick={() => downloadSrtFile(instagramResults.srtContent)}
                    style={{ ...S.btnPrimary, height: "36px", padding: "0 16px", borderRadius: "10px", fontSize: "12px", background: "linear-gradient(135deg, #e1306c, #fd1d1d)" }}
                  >
                    Download SRT file
                  </button>
                </div>
              </div>

            </div>

            {/* 3. THREE GENERATED ORIGINAL SCRIPTS */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={20} color="#e1306c" /> 3 Original Script Variations
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                {instagramResults.scripts.map((script, idx) => {
                  const glowColor = idx === 0 ? "#833ab4" : idx === 1 ? "#fd1d1d" : "#7c3aed";
                  const gradient = idx === 0
                    ? "linear-gradient(135deg, rgba(131,58,180,0.15), rgba(253,29,29,0.05))"
                    : idx === 1
                      ? "linear-gradient(135deg, rgba(253,29,29,0.15), rgba(252,176,69,0.05))"
                      : "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.05))";
                  const border = idx === 0
                    ? "1px solid rgba(131,58,180,0.3)"
                    : idx === 1
                      ? "1px solid rgba(253,29,29,0.3)"
                      : "1px solid rgba(124,58,237,0.3)";

                  const fullScriptText = `Title: ${script.title}\n\nHook: ${script.hook}\n\nBody:\n${script.body}\n\nCTA: ${script.cta}`;

                  return (
                    <div
                      key={idx}
                      style={{
                        ...S.glass,
                        background: gradient,
                        border: border,
                        borderRadius: "24px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: glowColor }}>
                          Script Style: {script.style}
                        </span>
                        <h4 style={{ margin: "6px 0 0 0", fontSize: "16px", fontWeight: 800, color: "#fff" }}>
                          {script.title}
                        </h4>
                      </div>

                      <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "4px" }}>HOOK</span>
                        <p style={{ margin: 0, fontSize: "13px", fontStyle: "italic", color: "#e2e8f0" }}>"{script.hook}"</p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>BODY</span>
                        <div
                          style={{
                            fontSize: "13px",
                            lineHeight: 1.6,
                            color: "#fff",
                            maxHeight: "180px",
                            overflowY: "auto",
                            background: "rgba(0,0,0,0.15)",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.03)",
                            fontFamily: "var(--font-mono, monospace)",
                            whiteSpace: "pre-wrap"
                          }}
                          className="custom-scrollbar"
                        >
                          {script.body}
                        </div>
                      </div>

                      <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "4px" }}>CALL TO ACTION (CTA)</span>
                        <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0" }}>{script.cta}</p>
                      </div>

                      <button
                        onClick={() => copyText(fullScriptText)}
                        style={{
                          ...S.btnPrimary,
                          background: `linear-gradient(135deg, ${glowColor}, #db2777)`,
                          height: "44px",
                          width: "100%",
                          fontSize: "13px",
                          marginTop: "auto"
                        }}
                      >
                        <Copy size={14} /> Copy Full Script
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keyword tags */}
            <div style={{ ...S.glass, borderRadius: "24px", padding: "24px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#cbd5e1", display: "block", marginBottom: "12px" }}>Extracted Keywords</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {instagramResults.analysis.keywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(225,48,108,0.1)",
                      border: "1px solid rgba(225,48,108,0.25)",
                      fontSize: "12px",
                      color: "#fca5a5",
                      fontWeight: 600
                    }}
                  >
                    #{kw.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.2; } }
        
        /* Responsive CSS for Viral Content Finder Page */
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
        
        .viral-platform-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .viral-platform-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
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
        .viral-main-grid.show-sidebar {
          grid-template-columns: 260px 1fr;
        }
        .viral-filters-sidebar {
          width: 100%;
        }
        
        .viral-analysis-drawer {
          padding: 32px;
        }
        
        /* Media Query Overrides */
        @media (max-width: 1024px) {
          .viral-main-grid.show-sidebar {
            grid-template-columns: 1fr;
          }
          .viral-search-bar {
            top: 76px; /* clears fixed mobile navigation elements when sticky */
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
        
        @media (max-width: 600px) {
          .viral-platform-selector {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .viral-platform-btn {
            padding: 10px 16px;
            justify-content: center;
            font-size: 13px;
          }
          .viral-analysis-drawer {
            padding: 24px 16px;
          }
        }

        /* Viral Loader Styles */
        .viral-loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #000000;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .viral-loader-overlay::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.45) 50%);
          background-size: 100% 4px;
          z-index: 10;
          pointer-events: none;
          opacity: 0.8;
        }

        .viral-loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 700px;
          background: transparent;
          position: relative;
          z-index: 20;
          padding: 40px;
          box-sizing: border-box;
        }

        .viral-loader-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 650px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .viral-loader-subtitle {
          font-size: 14px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.6em;
          text-transform: uppercase;
          margin-bottom: 8px;
          text-align: center;
          opacity: 0.8;
        }

        .viral-loader-title {
          font-size: 84px;
          font-weight: 800;
          letter-spacing: -2px;
          text-transform: uppercase;
          margin: 0 0 30px 0;
          line-height: 1;
          text-align: center;
        }

        .viral-loader-bar-row {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 12px;
        }

        .viral-loader-bracket {
          color: rgba(255, 255, 255, 0.2);
          font-size: 32px;
          font-family: system-ui, sans-serif;
          font-weight: 200;
          user-select: none;
          line-height: 1;
        }

        .viral-loader-track-container {
          flex: 1;
          margin: 0 16px;
          display: flex;
          align-items: center;
        }

        .viral-loader-track {
          position: relative;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
        }

        .viral-loader-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #ec4899, #f97316);
          border-radius: 2px;
          transition: width 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
        }

        .viral-loader-glow-dot {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(236, 72, 153, 0.8);
          transition: left 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .viral-loader-meta {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0 18px;
          box-sizing: border-box;
        }

        .viral-loader-status {
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #64748b;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
          font-weight: bold;
        }

        .viral-loader-percentage {
          font-size: 16px;
          font-weight: 700;
          color: #ff8b3d;
          font-family: 'Courier New', Courier, monospace;
        }
      `}</style>

      {/* Refine Content Modal */}
      <AnimatePresence>
        {showRefineModal && (
          <RefineContentModal 
            item={selectedVideoToRefine}
            platform={selectedPlatform}
            onClose={() => setShowRefineModal(false)}
            onCopy={copyText}
          />
        )}
      </AnimatePresence>

      {/* Full-screen Loading Overlay */}
      <AnimatePresence>
        {showLoader && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="viral-loader-overlay"
          >
            <ViralLoader isDone={!loading} onComplete={() => setShowLoader(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents

function ViralLoader({ isDone, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("CALIBRATING VIRALITY ENGINE");

  useEffect(() => {
    const tickTime = isDone ? 50 : 150;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99 && !isDone) {
          return 99; // Hold at 99% until API is done
        }
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 100;
        }
        const increment = isDone 
          ? Math.floor(Math.random() * 12) + 8 // 8% to 20%
          : Math.floor(Math.random() * 2) + 1; // 1% to 2%
        
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, tickTime);

    return () => clearInterval(interval);
  }, [isDone, onComplete]);

  useEffect(() => {
    // Status text cycling
    const statuses = [
      "CALIBRATING VIRALITY ENGINE",
      "SCANNING TRENDING NICHE DATABASES",
      "FETCHING ENGAGEMENT METRICS",
      "EXTRACTING HIGHEST PERFORMING HOOKS",
      "DETERMINING VELOCITY FACTOR",
      "OPTIMIZING RECOMMENDATION SIGNAL",
      "GENERATING COGNITIVE INSIGHTS"
    ];
    let currentIndex = 0;
    const statusInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length;
      setStatusText(statuses[currentIndex]);
    }, 1200);

    return () => clearInterval(statusInterval);
  }, []);

  const getTitleStyle = (pct) => {
    if (pct < 30) {
      return {
        text: "VIRAL",
        gradient: "linear-gradient(90deg, #7c3aed, #ec4899, #f97316)",
        glow: "rgba(236, 72, 153, 0.15)",
        fontSize: "84px"
      };
    }
    if (pct < 60) {
      return {
        text: "CONTENT",
        gradient: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
        glow: "rgba(59, 130, 246, 0.15)",
        fontSize: "84px"
      };
    }
    if (pct < 85) {
      return {
        text: "FINDER",
        gradient: "linear-gradient(90deg, #10b981, #14b8a6, #06b6d4)",
        glow: "rgba(20, 184, 166, 0.15)",
        fontSize: "84px"
      };
    }
    return {
      text: "VIRAL CONTENT FINDER",
      gradient: "linear-gradient(90deg, #7c3aed, #ec4899, #f97316, #06b6d4, #10b981)",
      glow: "rgba(236, 72, 153, 0.25)",
      fontSize: "48px"
    };
  };

  const { text: titleText, gradient: titleGradient, glow: titleGlow, fontSize: titleFontSize } = getTitleStyle(progress);

  return (
    <div className="viral-loader-container">
      <div className="viral-loader-content">
        <div className="viral-loader-subtitle">LET'S GO</div>
        
        <motion.h1 
          key={titleText}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="viral-loader-title"
          style={{
            background: titleGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 30px ${titleGlow})`,
            fontSize: titleFontSize
          }}
        >
          {titleText}
        </motion.h1>
        
        <div className="viral-loader-bar-row">
          <span className="viral-loader-bracket">[</span>
          <div className="viral-loader-track-container">
            <div className="viral-loader-track">
              <div 
                className="viral-loader-fill" 
                style={{ width: `${progress}%` }}
              />
              <div 
                className="viral-loader-glow-dot" 
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
          <span className="viral-loader-bracket">]</span>
        </div>

        <div className="viral-loader-meta">
          <div className="viral-loader-status">{statusText}</div>
          <div className="viral-loader-percentage">{progress}%</div>
        </div>
      </div>
    </div>
  );
}

function TrendCard({ title, icon, items, dataKey, valueKey }) {
  return (
    <div style={{ ...S.glass, borderRadius: "16px", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px", borderRadius: "10px" }}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{title}</h3>
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

function ResultCard({ item, onCopy, rank, onWatch, selectedPlatform, onRefine }) {
  const isTop5 = rank <= 5;
  
  // Custom styles for top 5 ranks
  let highlightStyle = {};
  let badgeText = `#${rank}`;
  let badgeBg = "rgba(0, 0, 0, 0.6)";
  let badgeColor = "#cbd5e1";

  if (isTop5) {
    if (rank === 1) {
      highlightStyle = {
        border: "2px solid #fbbf24",
        boxShadow: "0 0 25px rgba(251, 191, 36, 0.25)",
        background: "linear-gradient(180deg, rgba(251, 191, 36, 0.08) 0%, rgba(19, 20, 28, 0.8) 100%)",
      };
      badgeText = "👑 #1 VIRAL";
      badgeBg = "linear-gradient(135deg, #fbbf24, #d97706)";
      badgeColor = "#000";
    } else if (rank === 2) {
      highlightStyle = {
        border: "2px solid #cbd5e1",
        boxShadow: "0 0 22px rgba(203, 213, 225, 0.2)",
        background: "linear-gradient(180deg, rgba(203, 213, 225, 0.06) 0%, rgba(19, 20, 28, 0.8) 100%)",
      };
      badgeText = "🥈 #2 VIRAL";
      badgeBg = "linear-gradient(135deg, #e2e8f0, #94a3b8)";
      badgeColor = "#000";
    } else if (rank === 3) {
      highlightStyle = {
        border: "2px solid #cd7f32", // Bronze
        boxShadow: "0 0 22px rgba(205, 127, 50, 0.18)",
        background: "linear-gradient(180deg, rgba(205, 127, 50, 0.06) 0%, rgba(19, 20, 28, 0.8) 100%)",
      };
      badgeText = "🥉 #3 VIRAL";
      badgeBg = "linear-gradient(135deg, #b45309, #78350f)";
      badgeColor = "#fff";
    } else if (rank === 4) {
      highlightStyle = {
        border: "2px solid #a78bfa",
        boxShadow: "0 0 22px rgba(167, 139, 250, 0.18)",
        background: "linear-gradient(180deg, rgba(167, 139, 250, 0.05) 0%, rgba(19, 20, 28, 0.8) 100%)",
      };
      badgeText = "🔥 #4 VIRAL";
      badgeBg = "linear-gradient(135deg, #c084fc, #7c3aed)";
      badgeColor = "#fff";
    } else if (rank === 5) {
      highlightStyle = {
        border: "2px solid #f472b6",
        boxShadow: "0 0 22px rgba(244, 114, 182, 0.18)",
        background: "linear-gradient(180deg, rgba(244, 114, 182, 0.05) 0%, rgba(19, 20, 28, 0.8) 100%)",
      };
      badgeText = "🔥 #5 VIRAL";
      badgeBg = "linear-gradient(135deg, #f472b6, #db2777)";
      badgeColor = "#fff";
    }
  } else {
    badgeText = `#${rank} RANK`;
    badgeBg = "rgba(255, 255, 255, 0.08)";
    badgeColor = "#94a3b8";
  }

  // Get hover settings dynamically
  const hoverScale = isTop5 ? 1.03 : 1.01;
  const hoverShadow = isTop5 
    ? (rank === 1 ? "0 0 35px rgba(251, 191, 36, 0.4)" 
       : rank === 2 ? "0 0 30px rgba(203, 213, 225, 0.35)" 
       : rank === 3 ? "0 0 30px rgba(205, 127, 50, 0.32)" 
       : rank === 4 ? "0 0 30px rgba(167, 139, 250, 0.32)" 
       : "0 0 30px rgba(244, 114, 182, 0.32)") 
    : "0 12px 30px rgba(0,0,0,0.5)";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileHover={{ y: -5, scale: hoverScale, boxShadow: hoverShadow }} 
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        e.stopPropagation();
        onWatch();
      }}
      style={{ 
        ...S.glass, 
        borderRadius: "20px", 
        overflow: "hidden", 
        display: "flex", 
        flexDirection: "column",
        cursor: "pointer",
        ...highlightStyle
      }}
    >
      
      {/* Media Header */}
      <div style={{ position: "relative", height: "240px", background: "#000" }}>
        <img 
          src={getProxiedImage(item.thumbnail)} 
          alt="thumbnail" 
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} 
          onError={e => e.target.src="/viralrush_logo_placeholder.png"} 
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(13,14,20,1) 100%)" }} />

        {/* Top Badges */}
        <div style={{ position: "absolute", top: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ background: badgeBg, color: badgeColor, padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px", border: isTop5 ? "none" : "1px solid rgba(255,255,255,0.1)", boxShadow: isTop5 ? "0 4px 12px rgba(0,0,0,0.3)" : "none" }}>
              {badgeText}
            </span>
            <span style={{ background: item.platform === "YouTube" ? "rgba(239,68,68,0.8)" : item.platform === "Instagram" ? "linear-gradient(135deg, #f09433, #e6683c, #dc2743)" : item.platform === "Facebook" ? "rgba(24,119,242,0.8)" : "rgba(124,58,237,0.8)", backdropFilter: "blur(10px)", padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>{item.platform}</span>
          </div>
          <span style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {item.postedTime}</span>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Creator Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px" }}>
            {item.creator.charAt(1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
              {item.creator} {item.isVerified && <ShieldCheck size={14} color="#3b82f6" />}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.followersCount} followers</div>
          </div>
        </div>

        {/* Performance Grid hidden as requested */}

        {/* Hook / Title */}
        <h4 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 10px 0", lineHeight: 1.4 }}>{item.title}</h4>
        
        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "4px" }}><Music size={10} /> {item.audioUsed.substring(0, 15)}...</span>
          <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={10} /> {item.reelLength}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onWatch(); }} 
            style={{ flex: 1, ...S.btnPrimary, background: selectedPlatform === "youtube" ? "rgba(239,68,68,0.15)" : selectedPlatform === "instagram" ? "rgba(225,48,108,0.15)" : "rgba(24,119,242,0.15)", border: `1px solid ${selectedPlatform === "youtube" ? "rgba(239,68,68,0.3)" : selectedPlatform === "instagram" ? "rgba(225,48,108,0.3)" : "rgba(24,119,242,0.3)"}`, color: selectedPlatform === "youtube" ? "#ef4444" : selectedPlatform === "instagram" ? "#e1306c" : "#1877f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", fontWeight: 700, padding: "10px" }} 
            title={selectedPlatform === "youtube" || (item.videoUrl && (item.videoUrl.includes("youtube.com") || item.videoUrl.includes("youtu.be"))) ? "Watch Reel" : `View on ${item.platform}`}
          >
            <Play size={14} fill={selectedPlatform === "youtube" ? "#ef4444" : selectedPlatform === "instagram" ? "#e1306c" : "#1877f2"} color={selectedPlatform === "youtube" ? "#ef4444" : selectedPlatform === "instagram" ? "#e1306c" : "#1877f2"} /> {selectedPlatform === "youtube" || (item.videoUrl && (item.videoUrl.includes("youtube.com") || item.videoUrl.includes("youtu.be"))) ? "Watch" : "View"}
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onRefine(item); }}
            style={{ ...S.glass, padding: "0 16px", borderRadius: "12px", color: "#a78bfa", border: "1px solid rgba(167, 139, 250, 0.3)", background: "rgba(167, 139, 250, 0.08)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700 }}
            title="Refine with AI"
          >
            <Sparkles size={14} /> Refine
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onCopy(item.caption || item.title); }} 
            style={{ ...S.glass, padding: "0 14px", borderRadius: "12px", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} 
            title="Copy Description"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, val, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: 800 }}>{icon} {val}</div>
      <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

// AI Analysis Slide-over — uses real Gemini data from search result
function AIAnalysisModal({ item, aiAnalysis, onClose, onCopy, onWatch, selectedPlatform }) {
  // Find the content idea that best matches this video's keyword from Gemini analysis
  const idea = aiAnalysis?.contentIdeas?.[0] || null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div 
        initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} 
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="viral-analysis-drawer"
        style={{ width: "100%", maxWidth: "560px", background: "#0d0f17", borderLeft: "1px solid rgba(255,255,255,0.08)", height: "100%", overflowY: "auto", position: "relative" }} 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ background: "rgba(124,58,237,0.15)", padding: "12px", borderRadius: "14px" }}><Sparkles size={24} color="#a78bfa" /></div>
          <div>
            <h2 style={{ fontSize: "20px", margin: "0 0 4px 0", fontWeight: 800 }}>AI Viral Analysis</h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>Powered by Gemini AI · {selectedPlatform === "youtube" ? "Real YouTube data" : selectedPlatform === "instagram" ? "Instagram insights" : "Facebook insights"}</p>
          </div>
        </div>

        {/* Video Stats */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div 
            onClick={onWatch}
            title="Click to play video"
            style={{ 
              position: "relative", 
              cursor: "pointer", 
              borderRadius: "10px", 
              overflow: "hidden", 
              marginBottom: "14px", 
              maxHeight: "160px", 
              height: "160px",
              border: "1px solid rgba(255,255,255,0.15)",
              transition: "transform 0.2s ease, border-color 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
          >
            <img 
              src={getProxiedImage(item.thumbnail)} 
              alt="thumb" 
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} 
              onError={e => e.target.src="/viralrush_logo_placeholder.png"} 
            />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
              <div 
                style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "rgba(239, 68, 68, 0.9)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  boxShadow: "0 4px 16px rgba(239, 68, 68, 0.5)",
                  transition: "transform 0.2s ease, background 0.2s ease"
                }}
                onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.background = "#ff4d4d"; }}
                onMouseLeave={e => { e.stopPropagation(); e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.9)"; }}
              >
                <Play size={20} fill="#fff" color="#fff" style={{ marginLeft: "2px" }} />
              </div>
            </div>
          </div>
          <h3 style={{ fontSize: "15px", margin: "0 0 12px 0", lineHeight: 1.4 }}>{item.title}</h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[{label: "Views", val: item.views, color: "#38bdf8"}, {label: "Likes", val: item.likes, color: "#f472b6"}, {label: "Comments", val: item.comments, color: "#34d399"}, {label: "Engagement", val: item.engagementRate, color: "#fbbf24"}].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini trend summary */}
        {aiAnalysis?.trendSummary && (
          <SectionCard icon={<Info size={16} />} title="Why This Niche Is Trending" text={aiAnalysis.trendSummary} />
        )}

        {/* Why viral */}
        {aiAnalysis?.whyTheseVideosAreViral?.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", margin: "16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#fff", fontWeight: 700, fontSize: "14px" }}>
              <TrendingUp size={16} color="#a78bfa" /> Why These Videos Are Viral
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {aiAnalysis.whyTheseVideosAreViral.map((r, i) => <li key={i} style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>{r}</li>)}
            </ul>
          </div>
        )}

        {/* Content idea */}
        {idea && (
          <div style={{ background: "rgba(124,58,237,0.08)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(124,58,237,0.2)", margin: "16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#a78bfa", fontWeight: 700, fontSize: "14px" }}>
              <Sparkles size={16} /> AI Content Idea For You
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{idea.title}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}><b style={{ color: "#cbd5e1" }}>Hook:</b> {idea.hook}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}><b style={{ color: "#cbd5e1" }}>Format:</b> {idea.format}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}><b style={{ color: "#cbd5e1" }}>Potential:</b> <span style={{ color: "#34d399" }}>{idea.estimatedViralPotential}</span></div>
            <button onClick={() => onCopy(idea.title + "\n" + idea.hook)} style={{ ...S.btnPrimary, padding: "10px 16px", fontSize: "13px", width: "100%" }}>
              <Copy size={14} /> Copy Idea
            </button>
          </div>
        )}

        {/* Recommended posting style */}
        {aiAnalysis?.recommendedPostingStyle && (
          <SectionCard icon={<Zap size={16} color="#fbbf24" />} title="Recommended Posting Strategy" text={aiAnalysis.recommendedPostingStyle} />
        )}
      </motion.div>
    </div>
  );
}

// Inline AI Analysis Panel shown below results grid
function AIAnalysisPanel({ analysis }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ marginTop: "40px", ...S.glass, borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(124,58,237,0.25)" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(124,58,237,0.2)", padding: "8px", borderRadius: "10px" }}><Sparkles size={18} color="#a78bfa" /></div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "16px", fontWeight: 800 }}>Gemini AI Analysis</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Trend summary · Content ideas · Hashtags</div>
          </div>
        </div>
        <ChevronDown size={20} color="#94a3b8" style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      </button>

      {open && (
        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {analysis.trendSummary && <SectionCard icon={<TrendingUp size={16} />} title="Trend Summary" text={analysis.trendSummary} />}

          {analysis.contentIdeas?.length > 0 && (
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}><Sparkles size={14} color="#a78bfa" /> Content Ideas</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {analysis.contentIdeas.map((idea, i) => (
                  <div key={i} style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "14px", padding: "16px" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>{i+1}. {idea.title}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}><b style={{color:"#cbd5e1"}}>Hook:</b> {idea.hook}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}><b style={{color:"#cbd5e1"}}>Format:</b> {idea.format}</div>
                    <div style={{ fontSize: "12px", color: "#34d399" }}>{idea.estimatedViralPotential}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.hashtags?.length > 0 && (
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}><Hash size={14} color="#34d399" /> Hashtags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {analysis.hashtags.map((h, i) => <span key={i} style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 600 }}>#{h}</span>)}
              </div>
            </div>
          )}

          {analysis.recommendedPostingStyle && <SectionCard icon={<Zap size={16} color="#fbbf24" />} title="Posting Strategy" text={analysis.recommendedPostingStyle} />}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, val, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: 800, color: color }}>{val}</div>
    </div>
  );
}

function SectionCard({ icon, title, text }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#fff", fontWeight: 700, fontSize: "14px" }}>
        {icon} {title}
      </div>
      <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

// AI Content Refinement Modal
// Helper for client-side fallbacks
function getTopicKeywords(title) {
  const cleanTitle = title || "Viral Content";
  const cleanTopic = cleanTitle.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
  const words = cleanTopic.split(/\s+/).filter(w => w.length > 3 && !["this", "that", "with", "from", "your", "have", "about", "what", "here", "want", "know"].includes(w.toLowerCase()));
  const keyword1 = words[0] || "this topic";
  const keyword2 = words[1] || "these strategies";
  const keyword3 = words[2] || "essential tips";
  return { cleanTopic, keyword1, keyword2, keyword3 };
}

function getHooksFallback(title, lang) {
  const { cleanTopic } = getTopicKeywords(title);
  if (lang === "hindi") {
    return [
      { type: "जिज्ञासा हुक (Curiosity)", text: `रुकिए! अगर आप "${cleanTopic}" में बेहतरीन परिणाम चाहते हैं, तो इस वीडियो को अंत तक जरूर देखें।` },
      { type: "नुकसान का डर (FOMO)", text: `अगर आप "${cleanTopic}" के लिए यह सीक्रेट ट्रिक नहीं जानते, तो आप हर दिन अपने व्यूज खो रहे हैं।` },
      { type: "बड़ा वादा (Bold Promise)", text: `मैं आपको सिर्फ 60 सेकंड में "${cleanTopic}" में महारत हासिल करने का बिल्कुल सही फॉर्मूला दिखाऊंगा।` }
    ];
  } else if (lang === "hinglish") {
    return [
      { type: "Curiosity Hook", text: `Ruko! Agar aap "${cleanTopic}" me best results chahte ho, to is video ko end tak zaroor dekho.` },
      { type: "FOMO Hook", text: `Agar aap "${cleanTopic}" ke liye ye secret trick nahi use kar rahe, to aap daily views miss kar rahe ho.` },
      { type: "Bold Promise Hook", text: `Main aapko dikhaunga ek aisa 3-step formula jisse aap "${cleanTopic}" ko 60 seconds me seekh jaoge.` }
    ];
  } else {
    return [
      { type: "Curiosity/Question Hook", text: `Stop scrolling! If you want to know how to actually master "${cleanTopic}", you need to watch this until the end.` },
      { type: "Controversial/Bold Hook", text: `If you are not using this secret trick for "${cleanTopic}", you are losing views every single day.` },
      { type: "Storytelling/Value-First Hook", text: `I will show you the exact 3-step formula to dominate "${cleanTopic}" in under 60 seconds.` }
    ];
  }
}

function getScriptsFallback(title, hook, lang) {
  const { cleanTopic, keyword1, keyword2, keyword3 } = getTopicKeywords(title);
  if (lang === "hindi") {
    return [
      {
        type: "एक्शन-ओरिएंटेड (Action-oriented)",
        text: `${hook} सबसे पहले, अपनी स्ट्रेटेजी बदलें। दूसरा, कंसिस्टेंसी बनाए रखें। तीसरा, थंबनेल पर ध्यान दें। इन 3 स्टेप्स को आज ही फॉलो करें और देखें कैसे आपके व्यूज बढ़ते हैं।`
      },
      {
        type: "शैक्षणिक (Educational)",
        text: `${hook} आइए समझते हैं ऐसा क्यों होता है। ज़्यादातर क्रिएटर्स कॉन्टेंट की क्वालिटी पर काम करते हैं, लेकिन एल्गोरिथ्म की टाइमिंग और ऑडियंस रिटेंशन को भूल जाते हैं। आपको अपने एनालिटिक्स में जाकर एवरेज व्यू ड्यूरेशन चेक करना चाहिए और पहले 10 सेकंड को और एंगेजिंग बनाना चाहिए।`
      },
      {
        type: "हाई-एनर्जी (High-Energy)",
        text: `${hook} अगर आप अभी भी वही पुरानी घिसी-पिटी ट्रिक्स इस्तेमाल कर रहे हैं, तो रुक जाइए! ये बिल्कुल नया फॉर्मूला है जो बड़े-बड़े क्रिएटर्स छुपा कर रखते हैं। इस वीडियो को सेव कर लीजिए क्योंकि यह जानकारी आपको दोबारा नहीं मिलेगी!`
      }
    ];
  } else if (lang === "hinglish") {
    return [
      {
        type: "Action-oriented Style",
        text: `${hook} Sabse pehle, apni strategy badlein. Doosra, consistency banaye rakhein. Teesra, thumbnail par focus karein. In 3 steps ko aaj hi follow karein aur growth dekhein.`
      },
      {
        type: "Educational Style",
        text: `${hook} Aaiye samajhte hai aisa kyun hota hai. Zyada tar creators content quality par kaam karte hai, par algorithm ki timing aur audience retention ko bhool jaate hai. Aapko apne analytics me Average View Duration dekhna chahiye aur use improve karna chahiye.`
      },
      {
        type: "High-Energy Style",
        text: `${hook} Agar aap abhi bhi wahi purani ghisi-piti tricks use kar rahe ho, to ruko! Ye bilkul naya formula hai jo bade creators chupate hai. Is video ko save kar lo abhi ke abhi!`
      }
    ];
  } else {
    return [
      {
        type: "Action-oriented Style",
        text: `${hook} First, upgrade your content strategy. Second, establish a strict daily schedule. Third, optimize your hooks. Run this for 30 days and see massive improvement.`
      },
      {
        type: "Educational Style",
        text: `${hook} Here is the science behind why this works. Most creators optimize for keywords, but watch time and session duration are what actually trigger the algorithm. Focus on keeping viewers engaged past the 30-second mark by using visual B-roll.`
      },
      {
        type: "High-Energy Style",
        text: `${hook} Stop doing what everyone else is doing! This is the exact secret blueprint that top 1% accounts use to gain millions of views. Save this video right now before it gets taken down!`
      }
    ];
  }
}

function getFinalFallback(title, hook, script, lang) {
  const { cleanTopic, keyword1 } = getTopicKeywords(title);
  let titleIdea = `🔥 Unlocking the Secret to ${cleanTopic}`;
  let caption = `Unpopular opinion: Most people are doing "${cleanTopic}" wrong... 😳\n\nIf you've been struggling to see results, here's your sign to change your approach. Save this video so you don't forget it, and let me know your thoughts in the comments! 👇\n\n#viral #${keyword1.toLowerCase().replace(/[^a-z0-9]/g, "")} #success #tips`;

  if (lang === "hindi") {
    titleIdea = `🔥 ${cleanTopic} का गुप्त रहस्य जानिए`;
    caption = `अलोकप्रिय राय: अधिकांश लोग "${cleanTopic}" को गलत तरीके से कर रहे हैं... 😳\n\nयदि आप इसके साथ परिणाम देखने के लिए संघर्ष कर रहे हैं, तो अपना दृष्टिकोण बदलने का यह सही समय है। इस वीडियो को सेव करें और कमेंट्स में अपने विचार बताएं! 👇\n\n#viral #${keyword1.toLowerCase().replace(/[^a-z0-9]/g, "")} #success #tips`;
  } else if (lang === "hinglish") {
    titleIdea = `🔥 ${cleanTopic} Ka Secret Blueprint`;
    caption = `Unpopular opinion: Zyada tar log "${cleanTopic}" ko galat tarike se kar rahe hai... 😳\n\nKaise laga aapko ye video? Comment karke zaroor bataye aur aisi videos ke liye follow karein! 👇\n\n#viral #${keyword1.toLowerCase().replace(/[^a-z0-9]/g, "")} #success #tips`;
  }

  return {
    title: titleIdea,
    script: {
      hook,
      fullScript: script,
      structure: [
        "1. Selected opening hook",
        "2. Value delivery body",
        "3. Outro & Call to Action"
      ]
    },
    caption,
    hashtags: ["viral", "trending", "growth", "strategy", "marketing", "contentcreator", keyword1.toLowerCase().replace(/[^a-z0-9]/g, ""), "tips"]
  };
}

// AI Content Refinement Modal (Interactive Step-by-Step Wizard)
function RefineContentModal({ item, platform = "youtube", onClose, onCopy }) {
  const [wizardStep, setWizardStep] = useState(0); // 0: Lang, 1: Hooks, 2: Scripts, 3: Final
  const [selectedLang, setSelectedLang] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wizard data states
  const [hooks, setHooks] = useState([]);
  const [selectedHook, setSelectedHook] = useState(null);

  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);

  const [refinedData, setRefinedData] = useState(null);

  if (!item) return null;

  // Step 1: Generate Hooks
  const handleGenerateHooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/viral-content/refine", {
        videoId: item.id || item.videoId,
        title: item.title,
        description: item.caption || item.description,
        platform: platform,
        channelTitle: item.channelTitle || item.creator,
        targetLanguage: selectedLang,
        step: "hooks"
      });

      if (data.success && data.refined && Array.isArray(data.refined.hooks)) {
        setHooks(data.refined.hooks);
        setSelectedHook(data.refined.hooks[0]); // auto-select first one
        setWizardStep(1);
      } else {
        throw new Error("Invalid response format from hooks API");
      }
    } catch (err) {
      console.warn("Hooks API failed, triggering local fallback:", err.message);
      const fallbackHooks = getHooksFallback(item.title, selectedLang);
      setHooks(fallbackHooks);
      setSelectedHook(fallbackHooks[0]);
      setWizardStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate 3 Scripts based on selected Hook
  const handleGenerateScripts = async () => {
    if (!selectedHook) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/viral-content/refine", {
        videoId: item.id || item.videoId,
        title: item.title,
        description: item.caption || item.description,
        platform: platform,
        channelTitle: item.channelTitle || item.creator,
        targetLanguage: selectedLang,
        step: "scripts",
        selectedHook: selectedHook.text,
        videoDuration: item.reelLength || item.duration || "auto"
      });

      if (data.success && data.refined && Array.isArray(data.refined.scripts)) {
        setScripts(data.refined.scripts);
        setSelectedScript(data.refined.scripts[0]); // auto-select first one
        setWizardStep(2);
      } else {
        throw new Error("Invalid response format from scripts API");
      }
    } catch (err) {
      console.warn("Scripts API failed, triggering local fallback:", err.message);
      const fallbackScripts = getScriptsFallback(item.title, selectedHook.text, selectedLang);
      setScripts(fallbackScripts);
      setSelectedScript(fallbackScripts[0]);
      setWizardStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Generate Final Refined Details (title, caption, tags)
  const handleGenerateFinal = async () => {
    if (!selectedHook || !selectedScript) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/viral-content/refine", {
        videoId: item.id || item.videoId,
        title: item.title,
        description: item.caption || item.description,
        platform: platform,
        channelTitle: item.channelTitle || item.creator,
        targetLanguage: selectedLang,
        step: "final",
        selectedHook: selectedHook.text,
        selectedScript: selectedScript.text
      });

      if (data.success && data.refined) {
        setRefinedData(data.refined);
        setWizardStep(3);
      } else {
        throw new Error("Invalid response format from final refinement API");
      }
    } catch (err) {
      console.warn("Final API failed, triggering local fallback:", err.message);
      const fallbackFinal = getFinalFallback(item.title, selectedHook.text, selectedScript.text, selectedLang);
      setRefinedData(fallbackFinal);
      setWizardStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setWizardStep(0);
    setHooks([]);
    setSelectedHook(null);
    setScripts([]);
    setSelectedScript(null);
    setRefinedData(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", padding: "20px" }} onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        transition={{ type: "spring", duration: 0.4 }}
        style={{ 
          width: "100%", 
          maxWidth: "800px", 
          background: "#0d0f17", 
          border: "1px solid rgba(255,255,255,0.08)", 
          borderRadius: "24px",
          maxHeight: "88vh", 
          overflowY: "auto", 
          position: "relative",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          <X size={18} />
        </button>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)", padding: "12px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)" }}>
              <Sparkles size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: "22px", margin: "0 0 4px 0", fontWeight: 800 }}>AI Content Refinement</h2>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>Interactive 4-step wizard to create highly viral hooks, scripts, and captions.</p>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "14px 20px", borderRadius: "16px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.04)", gap: "10px" }}>
            {[
              { label: "Language", stepNum: 0 },
              { label: "Select Hook", stepNum: 1 },
              { label: "Select Script", stepNum: 2 },
              { label: "Final Result", stepNum: 3 }
            ].map((s, idx) => {
              const isActive = wizardStep === s.stepNum;
              const isCompleted = wizardStep > s.stepNum;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                    background: isCompleted ? "#10b981" : isActive ? "linear-gradient(135deg, #7c3aed, #db2777)" : "rgba(255,255,255,0.05)",
                    color: isCompleted || isActive ? "#fff" : "#64748b",
                    boxShadow: isActive ? "0 0 10px rgba(124, 58, 237, 0.3)" : "none",
                    border: isActive ? "none" : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease"
                  }}>
                    {isCompleted ? <Check size={14} color="#fff" /> : s.stepNum + 1}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : isCompleted ? "#cbd5e1" : "#64748b" }}>
                    {s.label}
                  </span>
                  {idx < 3 && (
                    <div style={{ width: "20px", height: "1px", background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Original video info summary */}
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "14px", padding: "16px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "16px", alignItems: "center" }}>
            <img 
              src={getProxiedImage(item.thumbnail)} 
              alt="thumb" 
              style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
              onError={e => e.target.src="/viralrush_logo_placeholder.png"}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#a78bfa", fontWeight: 800 }}>Original Post</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{item.creator} • {item.views} views</div>
            </div>
          </div>

          {/* Wizard Content Switcher */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "16px" }}>
              <div style={{ width: "40px", height: "40px", border: "4px solid rgba(167, 139, 250, 0.2)", borderTop: "4px solid #a78bfa", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                {wizardStep === 0 && "Analyzing original video and generating viral hooks..."}
                {wizardStep === 1 && "Customizing 3 script styles for your selected hook..."}
                {wizardStep === 2 && "Finalizing title, caption and hashtags package..."}
              </div>
            </div>
          ) : wizardStep === 0 ? (
            // STEP 0: Choose Language
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ fontSize: "15px", color: "#cbd5e1", fontWeight: 700 }}>Choose Target Script Language:</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                {[
                  { id: "auto", name: "Auto-Detect", desc: "Same language as original video", icon: <Sparkles size={18} color="#a78bfa" /> },
                  { id: "english", name: "English", desc: "Script entirely in English", icon: <Globe size={18} color="#3b82f6" /> },
                  { id: "hindi", name: "Hindi (हिंदी)", desc: "शुद्ध हिंदी देवनागरी लिपि में", icon: <Languages size={18} color="#ef4444" /> },
                  { id: "hinglish", name: "Hinglish", desc: "Hindi written in English text", icon: <MessageCircle size={18} color="#10b981" /> }
                ].map(lang => {
                  const isSelected = selectedLang === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLang(lang.id)}
                      style={{
                        background: isSelected ? "rgba(124, 58, 237, 0.12)" : "rgba(255,255,255,0.02)",
                        border: isSelected ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "16px",
                        padding: "16px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        outline: "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: isSelected ? "#a78bfa" : "#fff" }}>
                        {lang.icon}
                        {lang.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>
                        {lang.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleGenerateHooks}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #db2777)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
                  transition: "all 0.2s ease",
                  marginTop: "16px"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <Sparkles size={16} /> Generate Hooks
              </button>
            </div>
          ) : wizardStep === 1 ? (
            // STEP 1: Select Hook
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ fontSize: "16px", color: "#fff", fontWeight: 700 }}>Choose your Hook style (Select One):</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {hooks.map((hk, idx) => {
                  const isSelected = selectedHook && selectedHook.text === hk.text;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedHook(hk)}
                      style={{
                        background: isSelected ? "rgba(124, 58, 237, 0.08)" : "rgba(255,255,255,0.02)",
                        border: isSelected ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        boxShadow: isSelected ? "0 0 15px rgba(124,58,237,0.15)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ 
                          fontSize: "10px", 
                          fontWeight: 800, 
                          textTransform: "uppercase", 
                          color: idx === 0 ? "#60a5fa" : idx === 1 ? "#f472b6" : "#34d399",
                          background: idx === 0 ? "rgba(96, 165, 250, 0.1)" : idx === 1 ? "rgba(244, 114, 182, 0.1)" : "rgba(52, 211, 153, 0.1)",
                          padding: "2px 8px",
                          borderRadius: "6px"
                        }}>
                          {hk.type || `Variation ${idx + 1}`}
                        </span>
                        
                        {isSelected && (
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Check size={12} color="#fff" />
                          </div>
                        )}
                      </div>
                      
                      <div style={{ fontSize: "14px", color: isSelected ? "#fff" : "#cbd5e1", fontStyle: "italic", lineHeight: "1.5" }}>
                        "{hk.text}"
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button
                  onClick={() => setWizardStep(0)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    flex: 1
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                
                <button
                  onClick={handleGenerateScripts}
                  disabled={!selectedHook}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #db2777)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: !selectedHook ? "not-allowed" : "pointer",
                    opacity: !selectedHook ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    flex: 2,
                    boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Next: Generate Scripts <Sparkles size={16} />
                </button>
              </div>
            </div>
          ) : wizardStep === 2 ? (
            // STEP 2: Select Script
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "16px", color: "#fff", fontWeight: 700 }}>Choose your Script style (Select One):</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>These scripts are customized to match your selected hook.</div>
              </div>

              {/* Selected Hook review bubble */}
              <div style={{ background: "rgba(124, 58, 237, 0.05)", borderLeft: "3px solid #7c3aed", borderRadius: "0 12px 12px 0", padding: "12px 16px", fontSize: "13px", color: "#cbd5e1" }}>
                <span style={{ fontWeight: 700, color: "#a78bfa" }}>Selected Hook: </span>
                "{selectedHook?.text}"
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {scripts.map((sc, idx) => {
                  const isSelected = selectedScript && selectedScript.text === sc.text;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedScript(sc)}
                      style={{
                        background: isSelected ? "rgba(124, 58, 237, 0.08)" : "rgba(255,255,255,0.02)",
                        border: isSelected ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        boxShadow: isSelected ? "0 0 15px rgba(124,58,237,0.15)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ 
                          fontSize: "10px", 
                          fontWeight: 800, 
                          textTransform: "uppercase", 
                          color: idx === 0 ? "#60a5fa" : idx === 1 ? "#f472b6" : "#34d399",
                          background: idx === 0 ? "rgba(96, 165, 250, 0.1)" : idx === 1 ? "rgba(244, 114, 182, 0.1)" : "rgba(52, 211, 153, 0.1)",
                          padding: "2px 8px",
                          borderRadius: "6px"
                        }}>
                          {sc.type || `Variation ${idx + 1}`}
                        </span>
                        
                        {isSelected && (
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Check size={12} color="#fff" />
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        fontSize: "13px", 
                        color: isSelected ? "#fff" : "#cbd5e1", 
                        lineHeight: "1.6", 
                        maxHeight: "150px", 
                        overflowY: "auto",
                        background: "rgba(0,0,0,0.15)",
                        padding: "12px",
                        borderRadius: "8px",
                        whiteSpace: "pre-wrap"
                      }}>
                        {sc.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button
                  onClick={() => setWizardStep(1)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    flex: 1
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                
                <button
                  onClick={handleGenerateFinal}
                  disabled={!selectedScript}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #db2777)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: !selectedScript ? "not-allowed" : "pointer",
                    opacity: !selectedScript ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    flex: 2,
                    boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Next: Generate Final Pack <Sparkles size={16} />
                </button>
              </div>
            </div>
          ) : refinedData ? (
            // STEP 3: Final package display
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Refined Title */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Zap size={16} color="#fbbf24" /> Refined Title Idea
                  </div>
                  <button onClick={() => onCopy(refinedData.title)} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                    <Copy size={12} /> Copy Title
                  </button>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", lineHeight: 1.4, background: "rgba(251, 191, 36, 0.05)", border: "1px dashed rgba(251, 191, 36, 0.3)", padding: "12px 16px", borderRadius: "10px" }}>
                  {refinedData.title}
                </div>
              </div>

              {/* Refined Script (Selected Hook + Selected Script) */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={16} color="#a78bfa" /> Final Script & Hook
                  </div>
                  <button onClick={() => onCopy(refinedData.script?.fullScript || selectedScript?.text)} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                    <Copy size={12} /> Copy Refined Script
                  </button>
                </div>

                {/* Selected Hook Bubble */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 700, marginBottom: "6px" }}>Selected Hook:</div>
                  <div style={{ fontSize: "13px", color: "#cbd5e1", fontStyle: "italic", background: "rgba(124, 58, 237, 0.05)", borderLeft: "3px solid #7c3aed", padding: "10px 14px", borderRadius: "0 8px 8px 0" }}>
                    "{refinedData.script?.hook || selectedHook?.text}"
                  </div>
                </div>

                {/* Spoken Script */}
                <div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 700, marginBottom: "8px" }}>Full Word-for-Word Script:</div>
                  <div style={{ fontSize: "13px", color: "#cbd5e1", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px", borderRadius: "12px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {refinedData.script?.fullScript || selectedScript?.text}
                  </div>
                </div>
              </div>

              {/* Refined Caption */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Video size={16} color="#db2777" /> Viral Caption & Description
                  </div>
                  <button onClick={() => onCopy(refinedData.caption)} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                    <Copy size={12} /> Copy Caption
                  </button>
                </div>
                <div style={{ fontSize: "13px", color: "#cbd5e1", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px", borderRadius: "12px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {refinedData.caption}
                </div>
              </div>

              {/* Refined Hashtags */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Hash size={16} color="#34d399" /> Best Viral Hashtags
                  </div>
                  <button onClick={() => onCopy(refinedData.hashtags.map(h => `#${h}`).join(" "))} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                    <Copy size={12} /> Copy All
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {refinedData.hashtags.map((tag, i) => (
                    <span 
                      key={i} 
                      onClick={() => onCopy(`#${tag}`)}
                      style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.18)", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      title="Click to copy single hashtag"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions at the end of Wizard */}
              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button
                  onClick={handleStartOver}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    color: "#cbd5e1",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <RefreshCw size={14} /> Refine Again
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    flex: 1,
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  Done
                </button>
              </div>

            </div>
          ) : (
            <div style={{ color: "#f87171", textAlign: "center", padding: "40px 0" }}>
              Something went wrong. Failed to load refined suggestions.
            </div>
          )}

        </div>
      </motion.div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

