import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SocketProvider, useSocket } from "@/context/SocketContext";
import ThemeToggle from "@/components/ThemeToggle";
import LandingPage from "@/pages/LandingPage";
import LoginRegisterModal from "@/components/LoginRegisterModal";
import CelebrationModal from "@/components/CelebrationModal";
import DashboardPage from "@/pages/DashboardPage";
import ViralPage from "@/pages/ViralPage";
import ScriptPage from "@/pages/ScriptPage";
import CaptionPage from "@/pages/CaptionPage";
import AutomationPage from "@/pages/AutomationPage";
import DMAutomationPage from "@/pages/DMAutomationPage";
import CommunityPage from "@/pages/CommunityPage";
import CalendarPage from "@/pages/CalendarPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AcademyPage from "@/pages/AcademyPage";
import ReportsPage from "@/pages/ReportsPage";
import ToolsPage from "@/pages/ToolsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ConnectChannelPage from "@/pages/ConnectChannelPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import YoutubeDashboardPage from "@/pages/YoutubeDashboardPage";
import ManageVideosPage from "@/pages/ManageVideosPage";
import CreatePostPage from "@/pages/CreatePostPage";
import AnalyzeCompetitorPage from "@/pages/AnalyzeCompetitorPage";

const sections = [
  { key: "dashboard", label: "Dashboard" },
  { key: "create_post", label: "Create Post" },
  { key: "youtube", label: "YouTube Studio" },
  { key: "viral", label: "Viral Content Finder" },
  { key: "analyze_competitor", label: "Analyze Competitor" },
  { key: "script", label: "AI Script Generator" },
  { key: "caption", label: "Caption + Hashtags" },
  { key: "calendar", label: "Content Calendar" },
  { key: "analytics", label: "Analytics" },
  { key: "academy", label: "Creator Academy" },
  { key: "tools", label: "Tools Marketplace" },
  { key: "notifications", label: "Notifications" },
];

function AppInner() {
  const { user, loading, login, signup, logout } = useAuth();
  const { communityToast, setCommunityToast } = useSocket();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [view, setView] = useState("landing"); // "landing" | "app"
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("login");
  const [showCelebration, setShowCelebration] = useState(false);
  const [comingSoonKey, setComingSoonKey] = useState(null); // key of coming-soon feature
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar drawer
  const [state, setState] = useState({});
  const [calendarForm, setCalendarForm] = useState({
    title: "",
    platform: "Instagram",
    contentType: "Reel",
    scheduledAt: "",
    status: "Pending",
  });
  const [editingCalendarId, setEditingCalendarId] = useState(null);
  const [showCalendarBox, setShowCalendarBox] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarError, setCalendarError] = useState("");
  const [dealSearchNiche, setDealSearchNiche] = useState("");
  const [dealSuggestLoading, setDealSuggestLoading] = useState(false);
  const [dealSuggestLabel, setDealSuggestLabel] = useState("");

  const formatCount = (value) => {
    if (value === null || value === undefined) return "N/A";
    return Number(value).toLocaleString();
  };

  const load = async () => {
    try {
      const calls = [
        api.get("/features/dashboard/stats"),
        api.get("/features/viral-content"),
        api.get("/features/automation"),
        api.get("/features/brand-deals"),
        api.get("/features/community/posts"),
        api.get("/features/calendar"),
        api.get("/features/analytics"),
        api.get("/features/academy"),
        api.get("/features/reports"),
        api.get("/features/tools-marketplace"),
        api.get("/features/notifications"),
        api.get("/features/faceless-ideas"),
        api.get("/features/platform-metrics"),
      ];
      const results = await Promise.allSettled(calls);
      const get = (r) => (r.status === "fulfilled" ? r.value.data : null);
      const [dashboard, viral, automation, deals, posts, calendar, analytics, academy, reports, tools, notifications, faceless, platformMetrics] = results;
      setState({
        dashboard: get(dashboard),
        viral: get(viral),
        automation: get(automation),
        deals: get(deals),
        posts: get(posts),
        calendar: get(calendar),
        analytics: get(analytics),
        academy: get(academy),
        reports: get(reports),
        tools: get(tools),
        notifications: get(notifications),
        faceless: get(faceless),
        platformMetrics: get(platformMetrics),
      });
    } catch (err) {
      console.error("load() error:", err);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const chartData = useMemo(() => {
    if (!state.analytics) return [];
    return state.analytics.charts.labels.map((l, i) => ({
      day: l,
      views: state.analytics.charts.views[i],
      likes: state.analytics.charts.likes[i],
    }));
  }, [state.analytics]);

  const monthLabel = useMemo(
    () => calendarMonth.toLocaleString("default", { month: "long", year: "numeric" }),
    [calendarMonth]
  );

  const calendarMatrix = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, idx) => {
      const dayNum = idx - startOffset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return null;
      return new Date(year, month, dayNum);
    });
  }, [calendarMonth]);

  const tasksByDay = useMemo(() => {
    const grouped = {};
    (state.calendar || []).forEach((item) => {
      const date = new Date(item.scheduledAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [state.calendar]);

  const openModal = (mode) => {
    // accept "register" or "signup" → open on register tab; anything else → login tab
    const normalised = (mode === "register" || mode === "signup") ? "register" : "login";
    setModalMode(normalised);
    setShowModal(true);
  };

  const handleAuthSuccess = (authUser, isSignup = false) => {
    setShowModal(false);
    if (authUser?.role === "admin" || authUser?.email === "dkbharke99@gmail.com") {
      setView("admin");
    } else {
      setView("landing");
      setShowCelebration(true);
    }
  };

  const goToApp = (section = "dashboard") => {
    setActiveSection(section);
    setView("app");
  };

  const createScript = async ({ topic, niche, answers } = {}) => {
    const res = await api.post("/features/ai/script", {
      topic: topic || "content growth",
      niche: niche || user?.niche || "general",
      answers: answers || [],
    });
    setState((s) => ({ ...s, generatedScript: res.data }));
    return res.data;
  };

  const fetchScriptQuestions = async ({ topic, niche } = {}) => {
    const res = await api.post("/features/ai/script/questions", {
      topic: topic || "content growth",
      niche: niche || user?.niche || "general",
    });
    return res.data; // { questions: [{question, options}] }
  };

  const analyzeVideoScript = async (file) => {
    const formData = new FormData();
    formData.append("video", file);
    const res = await api.post("/features/ai/script/analyze-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setState((s) => ({ ...s, generatedScript: res.data }));
  };

  const enhancePrompt = async (prompt) => {
    const res = await api.post("/features/ai/prompt/enhance", { prompt });
    return res.data;
  };

  const enhanceScript = async ({ hook, body, cta }) => {
    const res = await api.post("/features/ai/script/enhance", { hook, body, cta });
    return res.data; // { variations: [{label, style, hook, body, cta}] }
  };

  const createCaption = async ({ topic, script, keywords, niche, media } = {}) => {
    let res;
    if (media) {
      const formData = new FormData();
      if (topic) formData.append("topic", topic);
      if (script) formData.append("script", script);
      if (keywords) formData.append("keywords", keywords);
      if (niche) formData.append("niche", niche);
      formData.append("media", media);
      
      res = await api.post("/features/ai/caption/analyze-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      res = await api.post("/features/ai/caption", { 
        topic: topic || "creator growth",
        script: script || "",
        keywords: keywords || "",
        niche: niche || ""
      });
    }
    setState((s) => ({ ...s, generatedCaption: res.data }));
  };

  const addRule = async () => {
    await api.post("/features/automation", { trigger: "Comment contains 'price'", reply: "Check your DM for details.", channel: "Comment" });
    await load();
  };

  const addPost = async () => {
    await api.post("/features/community/posts", { author: user.name, niche: user.niche, content: "Sharing my new short-form framework for faster ideation." });
    await load();
  };

  const saveCalendar = async () => {
    if (!calendarForm.scheduledAt) {
      setCalendarError("Please select a date for this task.");
      return;
    }
    try {
      setCalendarError("");
      const payload = {
        title: calendarForm.title || "Untitled Plan",
        platform: calendarForm.platform,
        contentType: calendarForm.contentType,
        scheduledAt: new Date(`${calendarForm.scheduledAt}T00:00:00`).toISOString(),
        status: calendarForm.status,
      };

      if (editingCalendarId) {
        await api.put(`/features/calendar/${editingCalendarId}`, payload);
      } else {
        await api.post("/features/calendar", payload);
      }

      setCalendarForm({
        title: "",
        platform: "Instagram",
        contentType: "Reel",
        scheduledAt: "",
        status: "Pending",
      });
      setEditingCalendarId(null);
      await load();
    } catch (error) {
      setCalendarError(error?.response?.data?.message || "Unable to save plan. Please try again.");
    }
  };

  const startEditCalendar = (item) => {
    setEditingCalendarId(item._id);
    setCalendarForm({
      title: item.title || "",
      platform: item.platform || "Instagram",
      contentType: item.contentType || "Reel",
      scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 10) : "",
      status: item.status || "Pending",
    });
    setCalendarError("");
  };

  const deleteCalendar = async (id) => {
    await api.delete(`/features/calendar/${id}`);
    if (editingCalendarId === id) {
      setEditingCalendarId(null);
      setCalendarForm({
        title: "",
        platform: "Instagram",
        contentType: "Reel",
        scheduledAt: "",
        status: "Pending",
      });
    }
    setCalendarError("");
    await load();
  };

  const applyDeal = async (deal) => {
    await api.post("/features/brand-deals/apply", {
      dealId: deal.id,
      brandName: deal.brandName,
      offerTitle: deal.offerTitle,
      pitch: "I can deliver 3 high-retention reels.",
    });
    if (deal.careerUrl && typeof window !== "undefined") {
      window.open(deal.careerUrl, "_blank", "noopener,noreferrer");
    }
    await load();
  };

  const suggestDealsByNiche = async () => {
    if (!dealSearchNiche.trim()) {
      setDealSuggestLabel("Please enter a niche to get AI suggestions.");
      return;
    }
    try {
      setDealSuggestLoading(true);
      setDealSuggestLabel("");
      const res = await api.get(`/features/brand-deals/suggest?niche=${encodeURIComponent(dealSearchNiche)}`);
      setState((prev) => ({ ...prev, deals: res.data.suggestions }));
      setDealSuggestLabel(`AI suggestions for "${res.data.niche}" (${res.data.source}) - ${res.data.note}`);
    } catch (error) {
      setDealSuggestLabel(error?.response?.data?.message || "Could not fetch AI suggestions right now.");
    } finally {
      setDealSuggestLoading(false);
    }
  };

  const createNotification = async () => {
    await api.post("/features/notifications", { message: "Schedule tomorrow's content batch.", remindAt: new Date() });
    await load();
  };

  const generateAgreement = async () => {
    const res = await api.post("/features/collab-agreement", {
      creatorName: user?.name || "Creator",
      brandName: "Brand X",
      deliverables: "2 reels + 1 story set",
      payment: "$1,000",
    });
    const doc = new jsPDF();
    doc.text(res.data.agreementText, 10, 10);
    doc.save("viralrush-collab-agreement.pdf");
  };

  const sectionPages = {
    dashboard: <DashboardPage onNavigate={setActiveSection} user={user} />,
    create_post: <CreatePostPage onBack={() => setActiveSection("dashboard")} />,
    youtube: <YoutubeDashboardPage />,
    managevideos: <ManageVideosPage onBack={() => setActiveSection("dashboard")} />,
    viral: <ViralPage />,
    analyze_competitor: <AnalyzeCompetitorPage />,
    connect: <ConnectChannelPage />,
    script: <ScriptPage generatedScript={state.generatedScript} onGenerate={createScript} onAnalyzeVideo={analyzeVideoScript} onEnhancePrompt={enhancePrompt} onFetchQuestions={fetchScriptQuestions} onEnhanceScript={enhanceScript} />,
    caption: <CaptionPage generatedCaption={state.generatedCaption} onGenerate={createCaption} />,
    automation: <DMAutomationPage />,
    community: <CommunityPage posts={state.posts} onCreatePost={addPost} />,
    calendar: (
      <CalendarPage
        editingCalendarId={editingCalendarId}
        calendarForm={calendarForm}
        setCalendarForm={setCalendarForm}
        calendarError={calendarError}
        saveCalendar={saveCalendar}
        showCalendarBox={showCalendarBox}
        setShowCalendarBox={setShowCalendarBox}
        monthLabel={monthLabel}
        setCalendarMonth={setCalendarMonth}
        calendarMatrix={calendarMatrix}
        tasksByDay={tasksByDay}
        startEditCalendar={startEditCalendar}
        deleteCalendar={deleteCalendar}
        calendarItems={state.calendar}
        setEditingCalendarId={setEditingCalendarId}
        setCalendarError={setCalendarError}
      />
    ),
    analytics: <AnalyticsPage analytics={state.analytics} chartData={chartData} />,
    academy: <AcademyPage academy={state.academy} />,
    reports: <ReportsPage reports={state.reports} />,
    tools: <ToolsPage tools={state.tools} />,
    notifications: <NotificationsPage notifications={state.notifications} onAddReminder={createNotification} onNavigate={setActiveSection} />,
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // Global community toast
  const globalToast = communityToast && (
    <div style={{
      position:"fixed",top:24,right:24,zIndex:99999,
      background: communityToast.type==="error"?"#ef4444":"#10b981",
      color:"#fff",borderRadius:12,padding:"14px 22px",
      fontWeight:600,fontSize:14,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
      cursor:"pointer",animation:"slideIn 0.3s ease"
    }} onClick={()=>{setCommunityToast(null);setActiveSection("chat");}}>
      {communityToast.text} {communityToast.communityId && "— Click to open chat"}
    </div>
  );

  // Show landing page immediately while auth initialises — avoids blank screen
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0A",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg,#D4AF37,#F0D060)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          boxShadow: "0 6px 24px rgba(212,175,55,0.4)",
        }}>⚡</div>
        <div style={{
          width: 28, height: 28,
          border: "3px solid rgba(212,175,55,0.25)",
          borderTopColor: "#D4AF37", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Admin user — show admin dashboard
  if (user && (user.role === "admin" || view === "admin")) {
    return <AdminDashboardPage user={user} onLogout={logout} />;
  }

  if (!user) {
    return (
      <>
        <LandingPage
          user={user}
          onLoginOpen={openModal}
          onGoToApp={goToApp}
          onLogout={logout}
        />
        {showModal && (
          <LoginRegisterModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            initialMode={modalMode}
            onSuccess={handleAuthSuccess}
          />
        )}
        {showCelebration && (
          <CelebrationModal
            isOpen={showCelebration}
            onClose={() => setShowCelebration(false)}
                      />
        )}
      </>
    );
  }

  // Logged in + landing view: show landing page with logged-in navbar
  if (view === "landing") {
    return (
      <>
        <LandingPage
          user={user}
          onLoginOpen={openModal}
          onGoToApp={goToApp}
          onLogout={logout}
        />
        {showModal && (
          <LoginRegisterModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            initialMode={modalMode}
            onSuccess={handleAuthSuccess}
          />
        )}
        {showCelebration && (
          <CelebrationModal
            isOpen={showCelebration}
            onClose={() => setShowCelebration(false)}
                      />
        )}
      </>
    );
  }

  // Logged in + app view
  const currentSection = sections.find(s => s.key === activeSection);

  const I = (d) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
  const NAV_ITEMS = [
    { key: "dashboard",     label: "Dashboard",     svgIcon: I(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>) },
    { key: "viral",         label: "Viral Finder",  svgIcon: I(<><path d="M13 10V3L4 14h7v7l9-11h-7z"/></>) },
    { key: "analyze_competitor", label: "Analyze Competitor", svgIcon: I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>) },
    { key: "script",        label: "AI Script",     svgIcon: I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>) },
    { key: "caption",       label: "Captions",      svgIcon: I(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>) },
    { key: "calendar",      label: "Calendar",      svgIcon: I(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>) },
    { key: "analytics",     label: "Analytics",     svgIcon: I(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>) },
  ];

  const LIVE_KEYS = new Set(["dashboard", "connect", "script", "calendar", "notifications", "youtube", "caption", "managevideos", "create_post", "viral", "analytics", "analyze_competitor"]);
  const handleNavClick = (key) => {
    if (LIVE_KEYS.has(key)) {
      setActiveSection(key);
    } else {
      setComingSoonKey(key);
    }
    setSidebarOpen(false); // close drawer on mobile after navigation
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#F8F5F0", fontFamily: "var(--font-ui)", display: "flex", overflow: "hidden" }}>

      {/* Mobile sidebar overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>
      {globalToast}

      {/* Coming Soon Modal */}
      {comingSoonKey && (() => {
        const item = NAV_ITEMS.find(n => n.key === comingSoonKey);
        return (
          <div
            onClick={() => setComingSoonKey(null)}
            style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background:"linear-gradient(145deg,#111111,#0A0A0A)",
                border:"1px solid rgba(91,46,255,0.25)",
                borderRadius:24,padding:"44px 40px 36px",
                maxWidth:400,width:"100%",textAlign:"center",
                position:"relative",
                boxShadow:"0 30px 80px rgba(0,0,0,0.7),0 0 60px rgba(91,46,255,0.08)",
                animation:"csModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <style>{`@keyframes csModalIn{from{opacity:0;transform:scale(0.88) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
              <div style={{ position:"absolute",top:0,left:32,right:32,height:2,background:"linear-gradient(90deg,transparent,#5b2eff,transparent)",borderRadius:1 }} />
              <button onClick={() => setComingSoonKey(null)} style={{ position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(91,46,255,0.2)",color:"#BDBDBD",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
              <div style={{ fontSize:48,marginBottom:14 }}>{item?.icon || "🚀"}</div>
              <div style={{ display:"inline-block",background:"rgba(91,46,255,0.1)",border:"1px solid rgba(91,46,255,0.35)",borderRadius:100,padding:"4px 14px",fontSize:10,fontWeight:700,color:"#7c3aed",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"var(--font-primary)",marginBottom:14 }}>Coming Soon</div>
              <h2 style={{ margin:"0 0 10px",fontSize:22,fontWeight:400,fontFamily:"var(--font-primary)",color:"#F8F5F0",letterSpacing:"0.04em" }}>{item?.label?.toUpperCase()}</h2>
              <p style={{ margin:"0 0 28px",fontSize:13,color:"#BDBDBD",fontFamily:"var(--font-ui)",fontWeight:300 }}>This feature is under development and will be available very soon.</p>
              <button
                onClick={() => setComingSoonKey(null)}
                style={{ background:"linear-gradient(135deg,#5b2eff,#7c3aed)",border:"none",color:"#fff",padding:"12px 32px",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"var(--font-primary)",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:"0 4px 20px rgba(91,46,255,0.4)" }}
              >Got it →</button>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .snav-btn { transition: all 0.18s !important; }
        .snav-btn:hover { background: rgba(91,46,255,0.1) !important; color: #a78bfa !important; }
        .snav-search::placeholder { color: rgba(255,255,255,0.28); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(91,46,255,0.3); border-radius: 4px; }
      `}</style>

      {/* ── LEFT SIDEBAR ── */}
      <aside
        className={`app-sidebar${sidebarOpen ? " open" : ""}`}
        style={{
          width: 220, flexShrink: 0,
          background: "#111",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column",
          height: "100vh", overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setView("landing")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#5b2eff,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
              boxShadow: "0 4px 16px rgba(91,46,255,0.4)",
            }}>⚡</div>
            <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "0.06em", color: "#fff", fontFamily: "var(--font-primary)" }}>VIRALRUSH</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 12px 6px" }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="snav-search"
              placeholder="Search..."
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 9, padding: "8px 10px 8px 30px",
                color: "#fff", fontSize: 12, outline: "none",
                fontFamily: "var(--font-ui)", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(91,46,255,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                className="snav-btn"
                onClick={() => handleNavClick(item.key)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 11,
                  padding: "9px 12px", borderRadius: 9,
                  background: isActive ? "rgba(91,46,255,0.14)" : "transparent",
                  border: isActive ? "1px solid rgba(91,46,255,0.3)" : "1px solid transparent",
                  color: isActive ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  cursor: "pointer", fontSize: 12.5,
                  fontWeight: isActive ? 700 : 400,
                  fontFamily: "var(--font-ui)", textAlign: "left",
                  boxShadow: isActive ? "0 2px 10px rgba(91,46,255,0.12)" : "none",
                  transition: "all 0.18s",
                }}
              >
                <span style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: isActive ? 1 : 0.65 }}>
                  {item.svgIcon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user email + sign out */}
        <div style={{ padding: "10px 12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email || user.username || user.name}
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "8px 12px", borderRadius: 9,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "rgba(255,255,255,0.4)", fontSize: 12,
              fontFamily: "var(--font-ui)", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "transparent"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="app-main" style={{ flex: 1, minWidth: 0, overflowY: "auto", minHeight: "100vh", position: "relative" }}>

        {/* ── Back button — shown on every page except dashboard ── */}
        {activeSection !== "dashboard" && (
          <button
            className="back-btn-fixed"
            onClick={() => setActiveSection("dashboard")}
            title="Back to Dashboard"
            style={{
              position: "fixed",
              top: 20,
              left: 232,          /* just outside the 220px sidebar */
              zIndex: 300,
              width: 40, height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(91,46,255,0.2)";
              e.currentTarget.style.borderColor = "rgba(91,46,255,0.5)";
              e.currentTarget.style.color = "#a78bfa";
              e.currentTarget.style.transform = "scale(1.12)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(91,46,255,0.35)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        {sectionPages[activeSection]}
      </main>
    </div>
  );
}


export default function App() {
  return (
    <SocketProvider>
      <AppInner />
    </SocketProvider>
  );
}




