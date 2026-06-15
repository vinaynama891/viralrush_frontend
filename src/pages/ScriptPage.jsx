import { useState, useRef, useEffect } from "react";

// ── History helpers ──────────────────────────────────────────────────────────
const HISTORY_KEY = "viralrush_script_history";
const MAX_HISTORY = 30;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

function saveToHistory(entry) {
  const prev = loadHistory();
  const next = [{ ...entry, id: Date.now(), timestamp: new Date().toISOString() }, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

const sparkleIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const copyIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const checkIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const speakerIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 010 7.07" />
    <path d="M19.07 4.93a10 10 0 010 14.14" />
  </svg>
);

const speakerOffIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

function speak(text, onStart, onEnd) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 1;
  utter.lang = "en-US";
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

function ScriptCard({ type, icon, gradient, accentColor, badge, data, index }) {
  const [copiedSection, setCopiedSection] = useState(null);
  const [speakingSection, setSpeakingSection] = useState(null); // null | "hook" | "body" | "cta" | "all"

  const copyText = (text, section) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const copyAll = () => {
    const full = `HOOK:\n${data.hook}\n\nBODY:\n${data.body}\n\nCTA:\n${data.cta}`;
    copyText(full, "all");
  };

  const handleSpeak = (text, key) => {
    if (speakingSection === key) {
      window.speechSynthesis?.cancel();
      setSpeakingSection(null);
      return;
    }
    speak(text, () => setSpeakingSection(key), () => setSpeakingSection(null));
  };

  const handleReadAll = () => {
    if (speakingSection === "all") {
      window.speechSynthesis?.cancel();
      setSpeakingSection(null);
      return;
    }
    const full = `Hook. ${data.hook}. Body. ${data.body}. Call to action. ${data.cta}`;
    speak(full, () => setSpeakingSection("all"), () => setSpeakingSection(null));
  };

  const SpeakBtn = ({ text, sectionKey, color }) => {
    const active = speakingSection === sectionKey;
    return (
      <button
        onClick={() => handleSpeak(text, sectionKey)}
        title={active ? "Stop speaking" : "Read aloud"}
        style={{
          background: active ? `${color}22` : "none",
          border: active ? `1px solid ${color}55` : "1px solid transparent",
          cursor: "pointer",
          color: active ? color : "var(--muted-color)",
          padding: "2px 6px",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 3,
          fontSize: 11,
          fontWeight: active ? 700 : 400,
          transition: "all 0.2s",
          animation: active ? "tts-pulse 1s ease-in-out infinite" : "none",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.color = color; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--muted-color)"; }}
      >
        {active ? speakerOffIcon : speakerIcon}
        {active ? "Stop" : "Speak"}
      </button>
    );
  };

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${speakingSection === "all" ? accentColor + "66" : "var(--card-border)"}`,
        borderRadius: 20,
        overflow: "hidden",
        animation: `slideUp 0.5s ease ${index * 0.15}s both`,
        boxShadow: speakingSection === "all"
          ? `0 4px 28px ${accentColor}33`
          : "0 4px 24px rgba(0,0,0,0.08)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Card Header */}
      <div style={{
        background: gradient,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{type}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{badge}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Read All button */}
          <button
            onClick={handleReadAll}
            title={speakingSection === "all" ? "Stop reading" : "Read entire script aloud"}
            style={{
              background: speakingSection === "all" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              color: "#fff",
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "background 0.2s",
              animation: speakingSection === "all" ? "tts-pulse 1s ease-in-out infinite" : "none",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = speakingSection === "all" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}
          >
            {speakingSection === "all" ? speakerOffIcon : speakerIcon}
            {speakingSection === "all" ? "Stop" : "Read All"}
          </button>
          {/* Copy All button */}
          <button
            onClick={copyAll}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              color: "#fff",
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            {copiedSection === "all" ? checkIcon : copyIcon}
            {copiedSection === "all" ? "Copied!" : "Copy All"}
          </button>
        </div>
      </div>

      {/* Script Sections */}
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { label: "🎣 Hook", text: data.hook, sectionKey: "hook" },
          { label: "📝 Body", text: data.body, sectionKey: "body" },
          { label: "📢 CTA",  text: data.cta,  sectionKey: "cta"  },
        ].map(({ label, text, sectionKey }) => {
          const isActive = speakingSection === sectionKey;
          return (
            <div key={sectionKey} style={{
              background: "var(--section-bg)",
              border: `1px solid ${isActive ? accentColor + "88" : "var(--section-border)"}`,
              borderRadius: 12,
              padding: "14px 16px",
              position: "relative",
              transition: "border-color 0.25s, box-shadow 0.25s",
              boxShadow: isActive ? `0 0 0 3px ${accentColor}22` : "none",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: accentColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}>{label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* Speaker button */}
                  <SpeakBtn text={text} sectionKey={sectionKey} color={accentColor} />
                  {/* Copy button */}
                  <button
                    onClick={() => copyText(text, sectionKey)}
                    title="Copy this section"
                    style={{
                      background: "none",
                      border: "1px solid transparent",
                      cursor: "pointer",
                      color: "var(--muted-color)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 11,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = accentColor}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--muted-color)"}
                  >
                    {copiedSection === sectionKey ? checkIcon : copyIcon}
                    {copiedSection === sectionKey ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <p style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.65,
                color: "var(--text-color)",
              }}>{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ScriptPage({ generatedScript, onGenerate, onAnalyzeVideo, onEnhancePrompt, onFetchQuestions, onEnhanceScript }) {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [duration, setDuration] = useState("30-60s");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);


  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const videoInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // + dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // History panel
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const [historySearch, setHistorySearch] = useState("");

  // Enhance Prompt modal
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const [rawPrompt, setRawPrompt] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState(null);
  const [enhanceError, setEnhanceError] = useState("");
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);

  // Enhance Script modal
  const [showESModal, setShowESModal] = useState(false);
  const [esHook, setEsHook] = useState("");
  const [esBody, setEsBody] = useState("");
  const [esCta, setEsCta] = useState("");
  const [esLoading, setEsLoading] = useState(false);
  const [esError, setEsError] = useState("");
  const [esVariations, setEsVariations] = useState(null); // [{label,style,hook,body,cta}]
  const [esActiveCard, setEsActiveCard] = useState(0);
  const [esCopied, setEsCopied] = useState(null); // "hook"|"body"|"cta"|"all"
  const [esAnimDir, setEsAnimDir] = useState(null); // "next"|"prev"
  const esScrollCooldown = useRef(false);

  // Quiz flow states
  const [quizPhase, setQuizPhase] = useState("idle"); // idle | fetching | quiz | generating
  const [questions, setQuestions] = useState([]);       // [{question, options}]
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);   // [{question, answer}]
  const [customInput, setCustomInput] = useState("");   // for "Other" option
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [selectedOption, setSelectedOption] = useState(null); // tracks clicked option for visual feedback

  // Rating modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // keep history in sync if another tab writes to localStorage
  useEffect(() => {
    const sync = () => setHistory(loadHistory());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const openEnhanceScriptModal = () => {
    setDropdownOpen(false);
    setEsHook(""); setEsBody(""); setEsCta("");
    setEsError(""); setEsVariations(null); setEsActiveCard(0);
    setShowESModal(true);
  };

  const handleEnhanceScript = async () => {
    if (!esHook.trim() && !esBody.trim() && !esCta.trim()) {
      setEsError("Please fill in at least one section."); return;
    }
    setEsError(""); setEsLoading(true); setEsVariations(null); setEsActiveCard(0);
    try {
      const data = await onEnhanceScript({ hook: esHook, body: esBody, cta: esCta });
      setEsVariations(data.variations);
    } catch (err) {
      setEsError(err?.response?.data?.message || "Failed to enhance. Please try again.");
    } finally {
      setEsLoading(false);
    }
  };

  const esGoTo = (idx) => {
    if (idx < 0 || idx > 2 || idx === esActiveCard) return;
    setEsAnimDir(idx > esActiveCard ? "next" : "prev");
    setEsActiveCard(idx);
  };

  const handleEsScroll = (e) => {
    if (!esVariations || esScrollCooldown.current) return;
    esScrollCooldown.current = true;
    setTimeout(() => { esScrollCooldown.current = false; }, 600);
    if (e.deltaY > 0) esGoTo(esActiveCard + 1);
    else esGoTo(esActiveCard - 1);
  };

  const copyEsSection = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setEsCopied(key);
      setTimeout(() => setEsCopied(null), 2000);
    });
  };

  const copyEsAll = (v, i) => {
    copyEsSection(`HOOK:\n${v.hook}\n\nBODY:\n${v.body}\n\nCTA:\n${v.cta}`, `all-${i}`);
  };

  // ── handleGenerate: fetch questions first ──────────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for your script.");
      return;
    }
    setError("");
    setQuizPhase("fetching");
    setQuestions([]);
    setCurrentQIndex(0);
    setQuizAnswers([]);
    setCustomInput("");
    setShowCustomInput(false);
    setQuizError("");
    try {
      const data = await onFetchQuestions({ topic: topic.trim(), niche: niche.trim() || undefined });
      if (data?.questions?.length) {
        setQuestions(data.questions);
        setQuizPhase("quiz");
      } else {
        // Fallback: no questions returned, generate directly
        setQuizPhase("generating");
        await submitScript([]);
      }
    } catch (err) {
      setQuizPhase("idle");
      setError(err?.response?.data?.message || "Failed to start quiz. Please try again.");
    }
  };

  // ── submitScript: called after all answers collected ──────────────────────
  const submitScript = async (answers) => {
    setLoading(true);
    try {
      const result = await onGenerate({ topic: topic.trim(), niche: niche.trim() || undefined, answers, duration });
      // Save to history
      const updated = saveToHistory({
        type: "script",
        prompt: topic.trim(),
        niche: niche.trim() || null,
        result,
      });
      setHistory(updated);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      const status = err?.response?.status;
      if (status === 429 || (backendMsg && backendMsg.includes("quota"))) {
        setError("⏳ Gemini API quota exceeded. Please wait a few minutes and try again.");
      } else if (backendMsg) {
        setError(backendMsg);
      } else {
        setError("Failed to generate script. Please try again.");
      }
    } finally {
      setLoading(false);
      setQuizPhase("idle");
    }
  };

  // ── Rating handlers ────────────────────────────────────────────────────────
  const handleRating = (rating) => {
    setUserRating(rating);
  };

  const handleGenerateAnother = () => {
    setShowRatingModal(false);
    setUserRating(0);
    // Clear current result and trigger new generation
    setTimeout(() => {
      handleGenerate();
    }, 300);
  };

  const handleContinueWithSame = () => {
    setShowRatingModal(false);
    setUserRating(0);
  };

  // ── Quiz answer handlers ───────────────────────────────────────────────────
  const handleOptionSelect = (option) => {
    setQuizError("");
    if (option === "Other") {
      setSelectedOption(null);
      setShowCustomInput(true);
      setCustomInput("");
    } else {
      // Just highlight — user must click Next to advance
      setSelectedOption(option);
    }
  };

  const handleNextQuestion = () => {
    if (!selectedOption) return;
    const answer = selectedOption;
    setSelectedOption(null);
    commitAnswer(answer);
  };

  const handleCustomSubmit = () => {
    if (!customInput.trim()) { setQuizError("Please type your answer."); return; }
    commitAnswer(customInput.trim());
  };

  const commitAnswer = (answer) => {
    const q = questions[currentQIndex];
    const newAnswers = [...quizAnswers, { question: q.question, answer }];
    setQuizAnswers(newAnswers);
    setCustomInput("");
    setShowCustomInput(false);
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(i => i + 1);
    } else {
      // All 5 answered — generate
      setQuizPhase("generating");
      submitScript(newAnswers);
    }
  };

  const handleQuizBack = () => {
    if (currentQIndex === 0) {
      setQuizPhase("idle");
      setSelectedOption(null);
      return;
    }
    // quizAnswers[currentQIndex - 1] holds the answer for the question we're going back to
    const prevAnswer = quizAnswers[currentQIndex - 1]?.answer || null;
    setCurrentQIndex(i => i - 1);
    setQuizAnswers(prev => prev.slice(0, -1));
    setSelectedOption(prevAnswer); // highlight their previous answer
    setShowCustomInput(false);
    setCustomInput("");
    setQuizError("");
  };

  const handleSkipQuiz = () => {
    setQuizPhase("generating");
    submitScript([]);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Video must be under 100 MB.");
      return;
    }
    setError("");
    setUploading(true);
    setUploadedFileName(file.name);
    try {
      const result = await onAnalyzeVideo(file);
      // Save video analysis to history
      const updated = saveToHistory({
        type: "video",
        prompt: file.name,
        niche: null,
        result,
      });
      setHistory(updated);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      setError(backendMsg || "Failed to analyze video. Please try again.");
      setUploadedFileName("");
    } finally {
      setUploading(false);
      // reset so same file can be re-uploaded
      e.target.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleGenerate();
  };

  const openEnhanceModal = () => {
    setDropdownOpen(false);
    setRawPrompt(topic);
    setEnhanceResult(null);
    setEnhanceError("");
    setShowEnhanceModal(true);
  };

  const handleEnhance = async () => {
    if (!rawPrompt.trim()) { setEnhanceError("Please enter a prompt to enhance."); return; }
    setEnhanceError("");
    setEnhancing(true);
    setEnhanceResult(null);
    try {
      const result = await onEnhancePrompt(rawPrompt.trim());
      setEnhanceResult(result);
    } catch (err) {
      setEnhanceError(err?.response?.data?.message || "Failed to enhance. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const useEnhancedPrompt = (text) => {
    setTopic(text);
    setShowEnhanceModal(false);
    setEnhanceResult(null);
    setRawPrompt("");
  };

  const copyEnhanced = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEnhanced(true);
      setTimeout(() => setCopiedEnhanced(false), 2000);
    });
  };

  return (
    <>
      <style>{`
        :root {
          --accent:       #0a84ff;
          --accent-light: #5ac8fa;
          --card-bg:      rgba(255,255,255,0.04);
          --card-border:   rgba(10,132,255,0.2);
          --section-bg:    rgba(255,255,255,0.03);
          --section-border:rgba(10,132,255,0.12);
          --text-color:    #F8F5F0;
          --muted-color:   #BDBDBD;
          --input-bg:      rgba(255,255,255,0.05);
          --input-border:  rgba(10,132,255,0.25);
          --input-focus:   #0a84ff;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tts-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(10,132,255,0.3); }
          50%     { box-shadow: 0 0 0 8px rgba(10,132,255,0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .generate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(10,132,255,0.5) !important;
        }
        .generate-btn:active:not(:disabled) { transform: translateY(0); }
        .generate-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .plus-btn:hover:not(:disabled) {
          background: linear-gradient(135deg,#0870d8,#0a84ff) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(10,132,255,0.55) !important;
        }
        .plus-btn:active:not(:disabled) { transform: translateY(0); }
        .plus-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .script-input:focus {
          outline: none;
          border-color: var(--input-focus) !important;
          box-shadow: 0 0 0 3px rgba(10,132,255,0.15);
        }
        .dropdown-item:hover { background: rgba(10,132,255,0.08) !important; color: #0a84ff !important; }
        @keyframes dropDown {
          from { opacity:0; transform:translateY(-6px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.95) translateY(16px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginTop: 45, marginBottom: 28, animation: "slideUp 0.4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ marginLeft: 50, fontSize: 22, fontWeight: 400, letterSpacing: "0.04em", fontFamily: "var(--font-primary)", color: "#F8F5F0", marginTop: 15 }}>
                AI Script Generator
              </h2>
              <p style={{ marginLeft: 50, fontSize: 13, color: "var(--muted-color)", marginTop: 2, fontFamily: "var(--font-ui)" }}>
                Generate viral-ready short &amp; long form scripts with AI
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, marginRight: 20 }}>
            {/* History Button */}
            <button
              id="history-btn"
              onClick={() => setShowHistory(true)}
              title="View generation history"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px",
                borderRadius: 12,
                border: "1.5px solid rgba(10,132,255,0.3)",
                background: "rgba(10,132,255,0.08)",
                color: "#0a84ff",
                fontSize: 13, fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-primary)",
                letterSpacing: "0.04em",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,132,255,0.16)"; e.currentTarget.style.borderColor = "rgba(10,132,255,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(10,132,255,0.08)"; e.currentTarget.style.borderColor = "rgba(10,132,255,0.3)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              History
              {history.length > 0 && (
                <span style={{ background: "#0a84ff", color: "#0A0A0A", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div style={{
        // background: "var(--card-bg)",
        // border: "1px solid var(--card-border)",
        borderRadius: 20,
        padding: "24px 24px 20px",
        marginBottom: 28,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        animation: "slideUp 0.45s ease 0.05s both",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Topic Input */}
          <div>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--muted-color)", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.08em",
              fontFamily: "var(--font-primary)",
            }}>
              📌 Script Topic *
            </label>
            <textarea
              id="script-topic-input"
              className="script-input"
              rows={3}
              placeholder="e.g. How to grow on Instagram from 0 to 10k followers in 30 days..."
              value={topic}
              onChange={(e) => { setTopic(e.target.value); if (error) setError(""); }}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1.5px solid ${error ? "#ef4444" : "var(--input-border)"}`,
                background: "var(--input-bg)",
                color: "var(--text-color)",
                fontSize: 14,
                lineHeight: 1.6,
                resize: "vertical",
                fontFamily: "inherit",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            {error && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Niche Input */}
          <div>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--muted-color)", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.08em",
              fontFamily: "var(--font-primary)",
            }}>
              🎯 Your Niche <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              id="script-niche-input"
              className="script-input"
              type="text"
              placeholder="e.g. fitness, tech, personal finance, beauty..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--input-border)",
                background: "var(--input-bg)",
                color: "var(--text-color)",
                fontSize: 14,
                fontFamily: "inherit",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--muted-color)", marginBottom: 10,
              textTransform: "uppercase", letterSpacing: "0.08em",
              fontFamily: "var(--font-primary)",
            }}>
              ⏱️ Script Duration
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                {
                  value: "15-30s",
                  icon: "⚡",
                  label: "15–30 sec",
                  sub: "TikTok / Reels",
                  activeGrad: "linear-gradient(135deg,#f97316,#ef4444)",
                  activeColor: "#f97316",
                  activeShadow: "0 0 0 3px rgba(249,115,22,0.2), 0 8px 24px rgba(249,115,22,0.35)",
                },
                {
                  value: "30-60s",
                  icon: "🔥",
                  label: "30–60 sec",
                  sub: "Shorts / Reels",
                  activeGrad: "linear-gradient(135deg,#0a84ff,#5ac8fa)",
                  activeColor: "#0a84ff",
                  activeShadow: "0 0 0 3px rgba(10,132,255,0.2), 0 8px 24px rgba(10,132,255,0.35)",
                },
                {
                  value: "3-5min",
                  icon: "🎬",
                  label: "3–5 min",
                  sub: "YouTube / Long",
                  activeGrad: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                  activeColor: "#0ea5e9",
                  activeShadow: "0 0 0 3px rgba(14,165,233,0.2), 0 8px 24px rgba(14,165,233,0.35)",
                },
              ].map(opt => {
                const active = duration === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    style={{
                      padding: "14px 8px",
                      borderRadius: 14,
                      border: active ? "2px solid transparent" : "1.5px solid var(--input-border)",
                      background: active ? opt.activeGrad : "var(--input-bg)",
                      color: active ? "#fff" : "var(--muted-color)",
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow: active ? opt.activeShadow : "none",
                      transform: active ? "scale(1.06)" : "scale(1)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Active glow shimmer */}
                    {active && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(135deg,rgba(255,255,255,0.15),transparent)",
                        pointerEvents: "none",
                      }} />
                    )}
                    {/* Checkmark badge */}
                    {active && (
                      <div style={{
                        position: "absolute", top: 6, right: 6,
                        width: 16, height: 16,
                        background: "rgba(255,255,255,0.3)",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 900, color: "#fff",
                      }}>✓</div>
                    )}
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{opt.icon}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 800,
                      fontFamily: "var(--font-primary)",
                      letterSpacing: "0.02em",
                      color: active ? "#fff" : "var(--text-color)",
                    }}>{opt.label}</span>
                    <span style={{
                      fontSize: 10,
                      color: active ? "rgba(255,255,255,0.75)" : "var(--muted-color)",
                      fontFamily: "var(--font-ui)",
                    }}>{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Action Buttons Row */}
          <div style={{ display: "flex", gap: 12 }}>
            {/* Generate Script Button */}
            <button
              id="script-generate-btn"
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || uploading}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: loading
                  ? "linear-gradient(135deg,#0870d8,#0a84ff)"
                  : "linear-gradient(135deg,#0a84ff,#5ac8fa)",
                color: "#0A0A0A",
                fontSize: 15,
                fontWeight: 700,
                cursor: (loading || uploading) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "var(--font-primary)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                boxShadow: "0 4px 18px rgba(212,175,55,0.35)",
                transition: "all 0.2s ease",
                animation: loading ? "pulse-glow 1.5s infinite" : "none",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                  Generating with AI...
                </>
              ) : (
                <>
                  {sparkleIcon}
                  Generate Script
                </>
              )}
            </button>

            {/* Hidden video file input */}
            <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoUpload} />

            {/* + Dropdown */}
            <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                id="script-plus-btn"
                className="plus-btn"
                onClick={() => setDropdownOpen(o => !o)}
                disabled={loading || uploading}
                title="More options"
                style={{
                  width: 52, height: 52,
                  borderRadius: 12,
                  border: "none",
                  background: dropdownOpen
                    ? "linear-gradient(135deg,#0870d8,#0a84ff)"
                    : "linear-gradient(135deg,#0a84ff,#5ac8fa)",
                  color: "#0A0A0A",
                  cursor: (loading || uploading) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 18px rgba(10,132,255,0.4)",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {uploading ? (
                  <span style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }} />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>

              {/* Dropdown menu — opens above the button */}
              {dropdownOpen && (
                <div style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  right: 0,
                  minWidth: 195,
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 14,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                  overflow: "hidden",
                  zIndex: 999,
                  animation: "dropDown 0.18s ease both",
                }}>
                  <button
                    className="dropdown-item"
                    onClick={() => { setDropdownOpen(false); videoInputRef.current?.click(); }}
                    style={{ width:"100%",padding:"13px 16px",background:"none",border:"none",borderBottom:"1px solid var(--card-border)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--text-color)",transition:"all 0.15s",textAlign:"left" }}
                  >
                    <span style={{ fontSize:18 }}>🎬</span> Upload Video
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => { setDropdownOpen(false); openEnhanceScriptModal(); }}
                    style={{ width:"100%",padding:"13px 16px",background:"none",border:"none",borderBottom:"1px solid var(--card-border)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--text-color)",transition:"all 0.15s",textAlign:"left" }}
                  >
                    <span style={{ fontSize:18 }}>🚀</span> Enhance Script
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => { setDropdownOpen(false); setShowHistory(true); }}
                    style={{ width:"100%",padding:"13px 16px",background:"none",border:"none",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--text-color)",transition:"all 0.15s",textAlign:"left" }}
                  >
                    <span style={{ fontSize:18 }}>📜</span> View History
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hint */}
          {!uploading && (
            <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-color)", textAlign: "center" }}>
              Click <strong>+</strong> to upload a video or enhance your prompt with AI
            </p>
          )}
          {uploading && uploadedFileName && (
            <p style={{ margin: 0, fontSize: 12, color: "#10b981", textAlign: "center", fontWeight: 600 }}>
              🎬 Analyzing "{uploadedFileName}" with AI — this may take a moment...
            </p>
          )}
        </div>
      </div>


      {/* ── Enhance Script Modal ────────────────────────────────────────── */}
      {showESModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setShowESModal(false); setEsVariations(null); } }}
          style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
        >
          <style>{`
            @keyframes esCardIn  { from { opacity:0; transform:perspective(900px) translateZ(60px) scale(1.04); } to { opacity:1; transform:perspective(900px) translateZ(0) scale(1); } }
            @keyframes esSlideNext { from { opacity:0; transform:perspective(900px) translateY(28px) scale(0.97); } to { opacity:1; transform:perspective(900px) translateY(0) scale(1); } }
            @keyframes esSlidePrev { from { opacity:0; transform:perspective(900px) translateY(-28px) scale(0.97); } to { opacity:1; transform:perspective(900px) translateY(0) scale(1); } }
            @keyframes flyFromLeft  { from { opacity:0; transform:translateX(-120px) rotate(-8deg) scale(0.85); } to { opacity:1; transform:translateX(0) rotate(0deg) scale(1); } }
            @keyframes flyFromBottom { from { opacity:0; transform:translateY(100px) scale(0.8); } to { opacity:1; transform:translateY(0) scale(1); } }
            @keyframes flyFromRight { from { opacity:0; transform:translateX(120px) rotate(8deg) scale(0.85); } to { opacity:1; transform:translateX(0) rotate(0deg) scale(1); } }
            @keyframes glowPulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.03); } }
            @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
            @keyframes badgeBounce { 0%,100% { transform:scale(1); } 40% { transform:scale(1.18); } 70% { transform:scale(0.94); } }
            .es-dot { width:8px;height:8px;border-radius:50%;cursor:pointer;transition:all 0.25s; }
            .es-copy-btn { opacity:0.8; transition:opacity 0.2s; }
            .es-copy-btn:hover { opacity:1 !important; }
            .es-var-card-new {
              position: relative;
              border-radius: 24px;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .es-var-card-new:hover {
              transform: translateY(-4px);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
          `}</style>

          <div style={{ background:"rgba(12,12,28,0.98)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:28,width:"100%",maxWidth:600,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 40px 120px rgba(0,0,0,0.7)",animation:"modalIn 0.28s ease both",overflow:"hidden" }}>

            {/* Header */}
            <div style={{ padding:"22px 26px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 4px 14px rgba(99,102,241,0.45)" }}>🚀</div>
                <div>
                  <div style={{ fontWeight:800,fontSize:16,color:"#fff" }}>Enhance Script</div>
                  <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>AI rewrites your script into 3 powerful variations</div>
                </div>
              </div>
              <button
                onClick={() => { setShowESModal(false); setEsVariations(null); }}
                style={{ background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,color:"rgba(255,255,255,0.55)",width:34,height:34,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.13)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}
              >×</button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY:"auto",flex:1 }}>

              {/* Input Phase */}
              {!esVariations && (
                <div style={{ padding:"24px 26px 26px",display:"flex",flexDirection:"column",gap:18 }}>

                  {/* Hook */}
                  <div>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>
                      🎣 Hook <span style={{ fontWeight:400,textTransform:"none",letterSpacing:0,color:"rgba(255,255,255,0.25)" }}>— the opening line that grabs attention</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Nobody talks about this, but it changed everything for me..."
                      value={esHook}
                      onChange={e=>{ setEsHook(e.target.value); setEsError(""); }}
                      style={{ width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:12,border:"1.5px solid rgba(99,102,241,0.3)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:13.5,lineHeight:1.6,resize:"vertical",fontFamily:"inherit",outline:"none",transition:"border-color 0.2s, box-shadow 0.2s" }}
                      onFocus={e=>{ e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.2)"; }}
                      onBlur={e=>{ e.target.style.borderColor="rgba(99,102,241,0.3)"; e.target.style.boxShadow="none"; }}
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>
                      📝 Body <span style={{ fontWeight:400,textTransform:"none",letterSpacing:0,color:"rgba(255,255,255,0.25)" }}>— the core value and key points</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. Here's the 3-step framework I used to grow my account from 0 to 10k..."
                      value={esBody}
                      onChange={e=>{ setEsBody(e.target.value); setEsError(""); }}
                      style={{ width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:12,border:"1.5px solid rgba(99,102,241,0.3)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:13.5,lineHeight:1.6,resize:"vertical",fontFamily:"inherit",outline:"none",transition:"border-color 0.2s, box-shadow 0.2s" }}
                      onFocus={e=>{ e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.2)"; }}
                      onBlur={e=>{ e.target.style.borderColor="rgba(99,102,241,0.3)"; e.target.style.boxShadow="none"; }}
                    />
                  </div>

                  {/* CTA */}
                  <div>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>
                      📢 CTA <span style={{ fontWeight:400,textTransform:"none",letterSpacing:0,color:"rgba(255,255,255,0.25)" }}>— the call to action that converts</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Follow for more growth tips every single week..."
                      value={esCta}
                      onChange={e=>{ setEsCta(e.target.value); setEsError(""); }}
                      style={{ width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:12,border:"1.5px solid rgba(99,102,241,0.3)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:13.5,lineHeight:1.6,resize:"vertical",fontFamily:"inherit",outline:"none",transition:"border-color 0.2s, box-shadow 0.2s" }}
                      onFocus={e=>{ e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.2)"; }}
                      onBlur={e=>{ e.target.style.borderColor="rgba(99,102,241,0.3)"; e.target.style.boxShadow="none"; }}
                    />
                  </div>

                  {esError && <p style={{ margin:0,fontSize:12,color:"#f87171",display:"flex",alignItems:"center",gap:5 }}>⚠️ {esError}</p>}

                  {/* Generate button */}
                  <button
                    onClick={handleEnhanceScript}
                    disabled={esLoading}
                    style={{ width:"100%",padding:"15px",borderRadius:14,border:"none",background:esLoading?"linear-gradient(135deg,#818cf8,#a78bfa)":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:15,fontWeight:700,cursor:esLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:9,boxShadow:"0 6px 20px rgba(99,102,241,0.4)",transition:"all 0.2s",animation:esLoading?"pulse-glow 1.5s infinite":"none" }}
                    onMouseEnter={e=>{ if(!esLoading){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(99,102,241,0.5)"; }}}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(99,102,241,0.4)"; }}
                  >
                    {esLoading ? (
                      <><span style={{ width:17,height:17,border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }} /> Generating 3 variations with AI...</>
                    ) : (
                      <>{sparkleIcon} Generate 3 Script Variations</>
                    )}
                  </button>
                </div>
              )}

              {/* Results Phase — wild staggered animations, spaced vertical layout */}
              {esVariations && (
                <div style={{ padding:"24px 26px 36px" }}>

                  {/* Toolbar row */}
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
                    <div style={{
                      fontSize:14, fontWeight:800, color:"#fff",
                      display:"flex", alignItems:"center", gap:8,
                      background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899)",
                      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                    }}>
                      ✨ 3 Script Variations Ready!
                    </div>
                    <button
                      onClick={() => { setEsVariations(null); setEsActiveCard(0); setEsAnimDir(null); }}
                      style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:10,color:"rgba(255,255,255,0.55)",padding:"7px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",display:"flex",alignItems:"center",gap:6, letterSpacing:"0.02em" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.13)"; e.currentTarget.style.color="#fff"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}
                    >← Edit inputs</button>
                  </div>

                  {/* Vertical stacked cards with gap */}
                  <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
                    {esVariations.map((v, i) => {
                      const configs = [
                        {
                          grad:     "linear-gradient(135deg,#f97316 0%,#ef4444 100%)",
                          accent:   "#f97316",
                          glow:     "rgba(249,115,22,0.35)",
                          ringClr:  "rgba(249,115,22,0.22)",
                          anim:     "flyFromLeft 0.7s cubic-bezier(0.22,1,0.36,1) both",
                          delay:    "0s",
                          shimmer:  "linear-gradient(90deg,transparent,rgba(249,115,22,0.15),transparent)",
                          number:   "01",
                        },
                        {
                          grad:     "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)",
                          accent:   "#0ea5e9",
                          glow:     "rgba(14,165,233,0.35)",
                          ringClr:  "rgba(14,165,233,0.22)",
                          anim:     "flyFromBottom 0.75s cubic-bezier(0.22,1,0.36,1) both",
                          delay:    "0.18s",
                          shimmer:  "linear-gradient(90deg,transparent,rgba(14,165,233,0.15),transparent)",
                          number:   "02",
                        },
                        {
                          grad:     "linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)",
                          accent:   "#a855f7",
                          glow:     "rgba(168,85,247,0.35)",
                          ringClr:  "rgba(168,85,247,0.22)",
                          anim:     "flyFromRight 0.7s cubic-bezier(0.22,1,0.36,1) both",
                          delay:    "0.34s",
                          shimmer:  "linear-gradient(90deg,transparent,rgba(168,85,247,0.15),transparent)",
                          number:   "03",
                        },
                      ];
                      const cfg = configs[i] || configs[0];
                      const label = v.label || ["🔥 High Energy","💡 Educational","🎭 Storytelling"][i];

                      return (
                        <div
                          key={i}
                          className="es-var-card-new"
                          style={{
                            animation: cfg.anim,
                            animationDelay: cfg.delay,
                            background: "rgba(12,12,28,0.95)",
                            border: `1.5px solid ${cfg.ringClr}`,
                            boxShadow: `0 0 0 1px ${cfg.ringClr}, 0 20px 60px ${cfg.glow}, 0 4px 16px rgba(0,0,0,0.5)`,
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-6px)";
                            e.currentTarget.style.boxShadow = `0 0 0 2px ${cfg.accent}55, 0 28px 80px ${cfg.glow}, 0 8px 24px rgba(0,0,0,0.55)`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = `0 0 0 1px ${cfg.ringClr}, 0 20px 60px ${cfg.glow}, 0 4px 16px rgba(0,0,0,0.5)`;
                          }}
                        >
                          {/* Shimmer bar at top */}
                          <div style={{
                            height: 4,
                            background: cfg.grad,
                            position: "relative",
                            overflow: "hidden",
                          }}>
                            <div style={{
                              position: "absolute", inset: 0,
                              background: cfg.shimmer,
                              backgroundSize: "400px 100%",
                              animation: "shimmer 2.5s linear infinite",
                              animationDelay: cfg.delay,
                            }} />
                          </div>

                          {/* Card header */}
                          <div style={{
                            background: `${cfg.grad}`,
                            padding: "18px 22px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "relative",
                            overflow: "hidden",
                          }}>
                            {/* bg number watermark */}
                            <div style={{
                              position: "absolute", right: 16, top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: 72, fontWeight: 900,
                              color: "rgba(255,255,255,0.08)",
                              lineHeight: 1, userSelect: "none",
                              pointerEvents: "none",
                            }}>{cfg.number}</div>

                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                              <div style={{
                                width: 44, height: 44, borderRadius: 14,
                                background: "rgba(255,255,255,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 22,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                animation: `badgeBounce 1.2s ease ${cfg.delay} both`,
                              }}>
                                {["🔥","💡","🎭"][i]}
                              </div>
                              <div>
                                <div style={{ fontWeight:800, fontSize:17, color:"#fff", letterSpacing:"-0.01em" }}>{label}</div>
                                <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.72)", marginTop:3 }}>{v.style}</div>
                              </div>
                            </div>

                            <div style={{
                              background: "rgba(255,255,255,0.25)",
                              backdropFilter: "blur(6px)",
                              borderRadius: 20, padding: "5px 14px",
                              fontSize: 12, fontWeight: 800, color: "#fff",
                              border: "1px solid rgba(255,255,255,0.3)",
                            }}>
                              Variation {i + 1}
                            </div>
                          </div>

                          {/* Body sections */}
                          <div style={{ padding:"20px 22px 18px", display:"flex", flexDirection:"column", gap:14 }}>
                            {[
                              { label:"🎣 Hook", text:v.hook, key:"hook" },
                              { label:"📝 Body", text:v.body, key:"body" },
                              { label:"📢 CTA",  text:v.cta,  key:"cta"  },
                            ].map(({ label: secLabel, text, key }) => (
                              <div key={key} style={{
                                background: `${cfg.accent}0c`,
                                border: `1px solid ${cfg.accent}28`,
                                borderRadius: 14,
                                padding: "14px 16px",
                                transition: "border-color 0.2s, background 0.2s",
                              }}
                              onMouseEnter={e=>{ e.currentTarget.style.background=`${cfg.accent}18`; e.currentTarget.style.borderColor=`${cfg.accent}50`; }}
                              onMouseLeave={e=>{ e.currentTarget.style.background=`${cfg.accent}0c`; e.currentTarget.style.borderColor=`${cfg.accent}28`; }}
                              >
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                                  <span style={{
                                    fontSize: 10.5, fontWeight: 800,
                                    color: cfg.accent,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    background: `${cfg.accent}20`,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    border: `1px solid ${cfg.accent}40`,
                                  }}>{secLabel}</span>
                                  <button
                                    className="es-copy-btn"
                                    onClick={() => copyEsSection(text, `${i}-${key}`)}
                                    style={{
                                      background: esCopied===`${i}-${key}` ? `rgba(16,185,129,0.15)` : `${cfg.accent}15`,
                                      border: `1px solid ${esCopied===`${i}-${key}` ? "rgba(16,185,129,0.5)" : cfg.accent+"40"}`,
                                      borderRadius: 8, color: esCopied===`${i}-${key}` ? "#10b981" : cfg.accent,
                                      padding: "3px 10px", fontSize: 11, fontWeight: 700,
                                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                      flexShrink: 0, transition: "all 0.2s",
                                    }}
                                  >
                                    {esCopied===`${i}-${key}` ? checkIcon : copyIcon}
                                    {esCopied===`${i}-${key}` ? "Copied!" : "Copy"}
                                  </button>
                                </div>
                                <p style={{ margin:0, fontSize:13.5, lineHeight:1.7, color:"rgba(255,255,255,0.88)" }}>{text}</p>
                              </div>
                            ))}

                            {/* Copy full script button */}
                            <button
                              onClick={() => copyEsAll(v, i)}
                              style={{
                                width: "100%", marginTop: 6,
                                padding: "13px",
                                borderRadius: 14,
                                border: `1.5px solid ${cfg.accent}55`,
                                background: `${cfg.grad}`,
                                color: "#fff",
                                fontSize: 13.5, fontWeight: 800,
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.25s",
                                boxShadow: `0 4px 20px ${cfg.glow}`,
                                letterSpacing: "0.02em",
                              }}
                              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 30px ${cfg.glow}`; }}
                              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 4px 20px ${cfg.glow}`; }}
                            >
                              {esCopied===`all-${i}` ? checkIcon : copyIcon}
                              {esCopied===`all-${i}` ? "✅ Copied!" : "Copy Full Script"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Quiz / Generating Overlay ─────────────────────────────────────── */}
      {(quizPhase === "fetching" || quizPhase === "quiz" || quizPhase === "generating") && (

        <div style={{ position:"fixed",inset:0,zIndex:9998,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"rgba(18,18,36,0.98)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:28,padding:"36px 32px 32px",width:"100%",maxWidth:520,boxShadow:"0 32px 100px rgba(0,0,0,0.6)",animation:"modalIn 0.3s ease both",position:"relative" }}>

            {/* Fetching questions spinner */}
            {quizPhase === "fetching" && (
              <div style={{ textAlign:"center",padding:"16px 0" }}>
                <div style={{ width:52,height:52,border:"3px solid rgba(99,102,241,0.2)",borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 20px" }} />
                <div style={{ fontWeight:800,fontSize:17,marginBottom:8 }}>Personalising your quiz…</div>
                <div style={{ fontSize:13,color:"rgba(255,255,255,0.45)" }}>AI is crafting 5 questions based on your topic</div>
              </div>
            )}

            {/* Generating script spinner */}
            {quizPhase === "generating" && (
              <div style={{ textAlign:"center",padding:"16px 0" }}>
                <div style={{ width:52,height:52,border:"3px solid rgba(99,102,241,0.2)",borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 20px" }} />
                <div style={{ fontWeight:800,fontSize:17,marginBottom:8 }}>✨ Generating your script…</div>
                <div style={{ fontSize:13,color:"rgba(255,255,255,0.45)" }}>AI is writing a personalised script based on your answers</div>
              </div>
            )}

            {/* Active Quiz */}
            {quizPhase === "quiz" && questions[currentQIndex] && (() => {
              const q = questions[currentQIndex];
              const progress = ((currentQIndex) / questions.length) * 100;
              return (
                <>
                  {/* Header */}
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:"0 4px 12px rgba(99,102,241,0.4)" }}>🎯</div>
                      <div>
                        <div style={{ fontWeight:800,fontSize:15,color:"#fff" }}>Personalise Your Script</div>
                        <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>Question {currentQIndex + 1} of {questions.length}</div>
                      </div>
                    </div>
                    <button onClick={handleSkipQuiz} style={{ background:"none",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.4)",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.2s" }}>Skip →</button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height:4,borderRadius:4,background:"rgba(255,255,255,0.08)",marginBottom:24,overflow:"hidden" }}>
                    <div style={{ height:"100%",borderRadius:4,background:"linear-gradient(90deg,#6366f1,#8b5cf6)",width:`${progress}%`,transition:"width 0.4s ease" }} />
                  </div>

                  {/* Question */}
                  <div style={{ fontSize:18,fontWeight:800,color:"#fff",lineHeight:1.4,marginBottom:20,animation:"slideIn 0.25s ease both" }}>
                    {q.question}
                  </div>

                  {/* Options */}
                  {!showCustomInput && (
                    <div style={{ display:"flex",flexDirection:"column",gap:10,animation:"slideIn 0.3s ease both" }}>
                      {q.options.map((opt, oi) => {
                        const isSelected = selectedOption === opt;
                        const isOther = opt === "Other";
                        // Unique color per letter position
                        const optColors = [
                          { bg:"rgba(99,102,241,0.28)",  border:"rgba(99,102,241,0.8)",  badge:"#6366f1",  text:"#c7d2fe", glow:"rgba(99,102,241,0.4)"  }, // A – violet
                          { bg:"rgba(14,165,233,0.28)",  border:"rgba(14,165,233,0.8)",  badge:"#0ea5e9",  text:"#bae6fd", glow:"rgba(14,165,233,0.4)"  }, // B – cyan
                          { bg:"rgba(16,185,129,0.28)",  border:"rgba(16,185,129,0.8)",  badge:"#10b981",  text:"#a7f3d0", glow:"rgba(16,185,129,0.4)"  }, // C – green
                          { bg:"rgba(245,158,11,0.28)",  border:"rgba(245,158,11,0.8)",  badge:"#f59e0b",  text:"#fde68a", glow:"rgba(245,158,11,0.4)"  }, // D – amber
                        ];
                        const clr = isOther ? null : optColors[oi] || optColors[0];
                        return (
                          <button
                            key={oi}
                            onClick={() => handleOptionSelect(opt)}
                            disabled={!!selectedOption}
                            style={{
                              width:"100%", padding:"13px 16px",
                              borderRadius:12,
                              border: isSelected
                                ? `2px solid ${clr.border}`
                                : isOther
                                ? "1px solid rgba(255,255,255,0.12)"
                                : "1px solid rgba(99,102,241,0.25)",
                              background: isSelected
                                ? clr.bg
                                : isOther
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(99,102,241,0.1)",
                              color: isSelected ? clr.text : isOther ? "rgba(255,255,255,0.55)" : "#e0e0ff",
                              fontSize:14, fontWeight: isSelected ? 700 : 600,
                              cursor: selectedOption ? "default" : "pointer",
                              textAlign:"left", fontFamily:"inherit",
                              transition:"all 0.18s",
                              display:"flex", alignItems:"center", gap:10,
                              transform: isSelected ? "translateX(6px) scale(1.01)" : "translateX(0) scale(1)",
                              boxShadow: isSelected ? `0 0 0 3px ${clr.glow}, 0 4px 20px ${clr.glow}` : "none",
                            }}
                            onMouseEnter={e => {
                              if (selectedOption) return;
                              e.currentTarget.style.background = isOther ? "rgba(255,255,255,0.08)" : (clr?.bg || "rgba(99,102,241,0.18)");
                              e.currentTarget.style.borderColor = isOther ? "rgba(255,255,255,0.2)" : (clr?.border || "rgba(99,102,241,0.55)");
                              e.currentTarget.style.transform = "translateX(4px)";
                            }}
                            onMouseLeave={e => {
                              if (selectedOption) return;
                              e.currentTarget.style.background = isOther ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.1)";
                              e.currentTarget.style.borderColor = isOther ? "rgba(255,255,255,0.12)" : "rgba(99,102,241,0.25)";
                              e.currentTarget.style.transform = "translateX(0)";
                            }}
                          >
                            <span style={{
                              width:24, height:24, borderRadius:6,
                              border: `1.5px solid ${isSelected ? clr.border : isOther ? "rgba(255,255,255,0.18)" : "rgba(99,102,241,0.45)"}`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:11, fontWeight:800,
                              color: isSelected ? "#fff" : isOther ? "rgba(255,255,255,0.3)" : "#818cf8",
                              flexShrink:0,
                              background: isSelected ? clr.badge : "transparent",
                              transition:"all 0.18s",
                            }}>
                              {isSelected ? "✓" : ["A","B","C","D"][oi]}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom "Other" input */}
                  {showCustomInput && (
                    <div style={{ animation:"slideIn 0.25s ease both" }}>
                      <div style={{ fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:10 }}>Type your own answer:</div>
                      <input
                        className="script-input"
                        autoFocus
                        type="text"
                        placeholder="Type your answer here…"
                        value={customInput}
                        onChange={e => { setCustomInput(e.target.value); setQuizError(""); }}
                        onKeyDown={e => { if (e.key === "Enter") handleCustomSubmit(); }}
                        style={{ width:"100%",boxSizing:"border-box",padding:"13px 14px",borderRadius:12,border:`1.5px solid ${quizError ? "#ef4444" : "rgba(99,102,241,0.35)"}`,background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:14,fontFamily:"inherit",outline:"none",transition:"border-color 0.2s" }}
                      />
                      {quizError && <p style={{ margin:"6px 0 0",fontSize:12,color:"#f87171" }}>⚠️ {quizError}</p>}
                      <div style={{ display:"flex",gap:10,marginTop:12 }}>
                        <button onClick={() => { setShowCustomInput(false); setCustomInput(""); setQuizError(""); }} style={{ flex:1,padding:"11px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>← Back to options</button>
                        <button onClick={handleCustomSubmit} style={{ flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Confirm →</button>
                      </div>
                    </div>
                  )}

                  {/* Back + Next row */}
                  {!showCustomInput && (
                    <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <button
                        onClick={handleQuizBack}
                        style={{ background:"none",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:13,fontFamily:"inherit",padding:0,transition:"color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
                      >
                        ← {currentQIndex === 0 ? "Cancel" : "Previous"}
                      </button>

                      {selectedOption && (
                        <button
                          onClick={handleNextQuestion}
                          style={{
                            padding: "11px 24px",
                            borderRadius: 10,
                            border: "none",
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
                            transition: "all 0.2s",
                            animation: "slideUp 0.2s ease both",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.55)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.45)"; }}
                        >
                          {currentQIndex + 1 === questions.length ? "Generate Script ✨" : "Next Question →"}
                        </button>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Enhance Prompt Modal ────────────────────────────────────────── */}
      {showEnhanceModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowEnhanceModal(false); }}
          style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
        >
          <div style={{ background:"var(--card-bg)",border:"1px solid var(--card-border)",borderRadius:24,padding:"28px 28px 24px",width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.35)",animation:"modalIn 0.25s ease both" }}>

            {/* Header */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 4px 12px rgba(99,102,241,0.35)" }}>✨</div>
                <div>
                  <div style={{ fontWeight:800,fontSize:16 }}>Enhance Prompt</div>
                  <div style={{ fontSize:12,color:"var(--muted-color)" }}>AI rewrites your idea into a powerful script prompt</div>
                </div>
              </div>
              <button onClick={() => setShowEnhanceModal(false)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:22,color:"var(--muted-color)",lineHeight:1,padding:"2px 6px",borderRadius:6 }}>×</button>
            </div>

            {/* Input */}
            <label style={{ display:"block",fontSize:11,fontWeight:700,color:"var(--muted-color)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8 }}>Your rough idea or prompt</label>
            <textarea
              className="script-input"
              rows={3}
              placeholder="e.g. talk about how to get more followers on Instagram..."
              value={rawPrompt}
              onChange={e => { setRawPrompt(e.target.value); setEnhanceError(""); }}
              style={{ width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${enhanceError?"#ef4444":"var(--input-border)"}`,background:"var(--input-bg)",color:"var(--text-color)",fontSize:14,lineHeight:1.6,resize:"vertical",fontFamily:"inherit",transition:"border-color 0.2s, box-shadow 0.2s" }}
            />
            {enhanceError && <p style={{ margin:"6px 0 0",fontSize:12,color:"#ef4444" }}>⚠️ {enhanceError}</p>}

            {/* Enhance button */}
            <button
              onClick={handleEnhance}
              disabled={enhancing}
              style={{ width:"100%",marginTop:14,padding:"13px",borderRadius:12,border:"none",background:enhancing?"linear-gradient(135deg,#818cf8,#a78bfa)":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:14,fontWeight:700,cursor:enhancing?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 14px rgba(99,102,241,0.3)",transition:"all 0.2s",animation:enhancing?"pulse-glow 1.5s infinite":"none" }}
            >
              {enhancing ? (
                <><span style={{ width:15,height:15,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }} /> Enhancing with AI...</>
              ) : (
                <>{sparkleIcon} Enhance Prompt</>
              )}
            </button>

            {/* Result */}
            {enhanceResult && (
              <div style={{ marginTop:22,display:"flex",flexDirection:"column",gap:16 }}>

                {/* Enhanced prompt */}
                <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))",border:"1px solid rgba(99,102,241,0.25)",borderRadius:16,padding:"18px 20px" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                    <span style={{ fontSize:11,fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.07em" }}>✨ Enhanced Prompt</span>
                    <div style={{ display:"flex",gap:8 }}>
                      <button
                        onClick={() => copyEnhanced(enhanceResult.enhancedPrompt)}
                        style={{ background:copiedEnhanced?"rgba(16,185,129,0.12)":"rgba(99,102,241,0.12)",border:`1px solid ${copiedEnhanced?"rgba(16,185,129,0.4)":"rgba(99,102,241,0.3)"}`,borderRadius:8,color:copiedEnhanced?"#10b981":"#6366f1",padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,transition:"all 0.2s" }}
                      >
                        {copiedEnhanced ? checkIcon : copyIcon}{copiedEnhanced ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => useEnhancedPrompt(enhanceResult.enhancedPrompt)}
                        style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:8,color:"#fff",padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer" }}
                      >
                        Use this ↗
                      </button>
                    </div>
                  </div>
                  <p style={{ margin:0,fontSize:13.5,lineHeight:1.7,color:"var(--text-color)",fontStyle:"italic" }}>"{enhanceResult.enhancedPrompt}"</p>
                </div>

                {/* Improvements */}
                {enhanceResult.improvements?.length > 0 && (
                  <div style={{ background:"var(--section-bg)",border:"1px solid var(--section-border)",borderRadius:12,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"var(--muted-color)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10 }}>🔧 What AI improved</div>
                    <ul style={{ margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:5 }}>
                      {enhanceResult.improvements.map((imp, i) => (
                        <li key={i} style={{ fontSize:12.5,color:"var(--text-color)",lineHeight:1.5 }}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alternative angles */}
                {enhanceResult.alternativeAngles?.length > 0 && (
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,color:"var(--muted-color)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10 }}>🎯 Alternative Angles</div>
                    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                      {enhanceResult.alternativeAngles.map((angle, i) => (
                        <div key={i} style={{ background:"var(--section-bg)",border:"1px solid var(--section-border)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12 }}>
                          <p style={{ margin:0,fontSize:12.5,lineHeight:1.6,color:"var(--text-color)",flex:1 }}>{angle}</p>
                          <button onClick={() => useEnhancedPrompt(angle)} style={{ background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:8,color:"#6366f1",padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>Use ↗</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* Results */}
      {generatedScript && !loading && !uploading && (
        <div>
          {/* Video summary banner */}
          {generatedScript.fromVideo && generatedScript.videoSummary && (
            <div style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 16,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              animation: "slideUp 0.4s ease both",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🎬</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Video Analysis</div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-color)" }}>{generatedScript.videoSummary}</p>
              </div>
            </div>
          )}

          {/* Header row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            animation: "slideUp 0.4s ease both",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>✨ Your Generated Script</h3>
              {generatedScript.durationLabel && (
                <div style={{ fontSize: 11, color: "var(--muted-color)", marginTop: 3 }}>
                  {generatedScript.platform && `📱 ${generatedScript.platform}`}
                </div>
              )}
            </div>
            {generatedScript.aiGenerated && (
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                letterSpacing: "0.04em",
              }}>
                AI · {generatedScript.model || "Gemini"}
              </span>
            )}
            {!generatedScript.aiGenerated && (
              <span style={{
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
              }}>
                Template Mode
              </span>
            )}
          </div>

          {/* Single script card */}
          {generatedScript.script && (
            <ScriptCard
              type={generatedScript.durationLabel || "Generated Script"}
              icon={generatedScript.durationLabel?.includes("15") ? "⚡" : generatedScript.durationLabel?.includes("3–5") ? "🎬" : "🔥"}
              gradient={
                generatedScript.durationLabel?.includes("15")
                  ? "linear-gradient(135deg,#f97316 0%,#ef4444 100%)"
                  : generatedScript.durationLabel?.includes("3–5")
                  ? "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)"
                  : "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)"
              }
              accentColor={
                generatedScript.durationLabel?.includes("15") ? "#f97316"
                  : generatedScript.durationLabel?.includes("3–5") ? "#0ea5e9"
                  : "#6366f1"
              }
              badge={generatedScript.platform ? `📱 ${generatedScript.platform}` : ""}
              data={generatedScript.script}
              index={0}
            />
          )}
          {/* Legacy support — old shortForm/longForm responses */}
          {!generatedScript.script && generatedScript.shortForm && (
            <ScriptCard
              type="Short Form Script" icon="⚡"
              gradient="linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)"
              accentColor="#6366f1" badge="Reels, Shorts & TikTok"
              data={generatedScript.shortForm} index={0}
            />
          )}
          {!generatedScript.script && generatedScript.longForm && (
            <ScriptCard
              type="Long Form Script" icon="🎬"
              gradient="linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)"
              accentColor="#0ea5e9" badge="YouTube & Podcasts"
              data={generatedScript.longForm} index={1}
            />
          )}

          {/* 5 Star Rating */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
            marginBottom: 28,
            animation: "slideUp 0.4s ease 0.2s both"
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 28,
                  padding: "4px 6px",
                  transition: "transform 0.2s",
                  transform: hoveredRating >= star || userRating >= star ? "scale(1.15)" : "scale(1)"
                }}
              >
                <span style={{
                  color: hoveredRating >= star || userRating >= star ? "#ff9f0a" : "rgba(255,255,255,0.3)",
                  transition: "color 0.2s"
                }}>
                  ★
                </span>
              </button>
            ))}
          </div>

          {/* Rating-based CTA Options */}
          {userRating > 0 && userRating <= 3 && (
            <div style={{
              textAlign: "center",
              marginTop: 20,
              marginBottom: 28,
              animation: "slideUp 0.3s ease both"
            }}>
              <p style={{ 
                margin: "0 0 16px", 
                fontSize: 14, 
                color: "rgba(255,255,255,0.6)" 
              }}>
                Would you like to generate another script?
              </p>
              <div style={{ 
                display: "flex", 
                gap: 12, 
                justifyContent: "center" 
              }}>
                <button
                  onClick={handleGenerateAnother}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 10,
                    border: "1px solid rgba(10,132,255,0.3)",
                    background: "rgba(10,132,255,0.1)",
                    color: "#0a84ff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-primary)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(10,132,255,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(10,132,255,0.1)"}
                >
                  🔄 Generate Another Script
                </button>
                <button
                  onClick={handleContinueWithSame}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 10,
                    border: "1px solid rgba(16,185,129,0.3)",
                    background: "rgba(16,185,129,0.1)",
                    color: "#10b981",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-primary)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  ✅ Continue with This
                </button>
              </div>
            </div>
          )}

          {/* High Rating Message */}
          {userRating >= 4 && (
            <div style={{
              textAlign: "center",
              marginTop: 20,
              marginBottom: 28,
              animation: "slideUp 0.3s ease both"
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: 16, 
                color: "#10b981", 
                fontWeight: 600 
              }}>
                🎉 Great! You liked this script!
              </p>
            </div>
          )}

        </div>
      )}

      {/* Empty state when nothing generated yet */}
      {!generatedScript && !loading && (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "var(--muted-color)",
          animation: "slideUp 0.5s ease 0.1s both",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Enter a topic above and click Generate</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>AI will craft you a short form &amp; long form script instantly</p>
        </div>
      )}

      {/* ── History Panel ─────────────────────────────────────────────────── */}
      {showHistory && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}
        >
          <style>{`
            @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
            .hist-item:hover { background:rgba(212,175,55,0.07) !important; border-color:rgba(212,175,55,0.28) !important; }
            .hist-restore:hover { background:rgba(212,175,55,0.2) !important; color:#F0D060 !important; }
            .hist-del:hover { color:#ef4444 !important; border-color:rgba(239,68,68,0.45) !important; background:rgba(239,68,68,0.08) !important; }
          `}</style>

          <div style={{ width: "min(480px,100vw)", height: "100%", background: "rgba(8,8,20,0.98)", borderLeft: "1px solid rgba(212,175,55,0.18)", display: "flex", flexDirection: "column", animation: "slideInRight 0.28s cubic-bezier(0.22,1,0.36,1) both", boxShadow: "-20px 0 60px rgba(0,0,0,0.55)" }}>

            {/* Header */}
            <div style={{ padding: "22px 20px 14px", borderBottom: "1px solid rgba(212,175,55,0.1)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0a84ff,#5ac8fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🕐</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#F8F5F0", fontFamily: "var(--font-primary)", letterSpacing: "0.04em" }}>Generation History</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>{history.length} item{history.length !== 1 ? "s" : ""} saved locally</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {history.length > 0 && (
                    <button
                      onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }}
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, color: "#f87171", padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                    >Clear All</button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.55)", width: 32, height: 32, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                  >×</button>
                </div>
              </div>

              {/* Search */}
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search prompts…"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 34px", borderRadius: 10, border: "1.5px solid rgba(212,175,55,0.18)", background: "rgba(255,255,255,0.04)", color: "#F8F5F0", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.18)"}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {(() => {
                const filtered = history.filter(h =>
                  !historySearch.trim() || h.prompt.toLowerCase().includes(historySearch.toLowerCase())
                );
                if (filtered.length === 0) return (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.28)" }}>
                    <div style={{ fontSize: 42, marginBottom: 12 }}>{history.length === 0 ? "🗒️" : "🔍"}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{history.length === 0 ? "No history yet" : "No results found"}</div>
                    <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>{history.length === 0 ? "Generate a script or upload a video\nto see it here" : "Try a different search term"}</div>
                  </div>
                );
                return filtered.map(item => {
                  const isVideo = item.type === "video";
                  const d = new Date(item.timestamp);
                  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={item.id} className="hist-item" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 14, padding: "14px 15px", transition: "all 0.2s" }}>

                      {/* Row 1 — badge + time + delete */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 9.5, fontWeight: 800, padding: "3px 8px", borderRadius: 99, letterSpacing: "0.08em", textTransform: "uppercase", background: isVideo ? "rgba(16,185,129,0.15)" : "rgba(10,132,255,0.15)", color: isVideo ? "#10b981" : "#0a84ff", border: isVideo ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(10,132,255,0.3)" }}>
                            {isVideo ? "🎬 Video" : "✍️ Script"}
                          </span>
                          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.33)" }}>{dateStr} · {timeStr}</span>
                        </div>
                        <button
                          className="hist-del"
                          onClick={() => {
                            const updated = history.filter(h => h.id !== item.id);
                            setHistory(updated);
                            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
                          }}
                          title="Remove"
                          style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.28)", padding: "3px 8px", fontSize: 11, cursor: "pointer", transition: "all 0.2s" }}
                        >✕</button>
                      </div>

                      {/* Prompt */}
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F8F5F0", lineHeight: 1.5, marginBottom: item.niche ? 5 : 10, wordBreak: "break-word" }}>
                        {item.prompt}
                      </div>
                      {item.niche && (
                        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.38)", marginBottom: 10 }}>
                          🎯 {item.niche}
                        </div>
                      )}

                      {/* Restore button (scripts only) */}
                      {!isVideo && (
                        <button
                          className="hist-restore"
                          onClick={() => {
                            setTopic(item.prompt);
                            if (item.niche) setNiche(item.niche);
                            setShowHistory(false);
                          }}
                          style={{ width: "100%", padding: "9px", borderRadius: 9, border: "1px solid rgba(10,132,255,0.3)", background: "rgba(10,132,255,0.08)", color: "#0a84ff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, letterSpacing: "0.03em" }}
                        >
                          ↩ Restore Prompt
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
