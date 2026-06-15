import { useState, useEffect } from "react";

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

const HISTORY_KEY = "viralrush_script_history";
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

export default function CaptionPage({ generatedCaption, onGenerate }) {
  const [topic, setTopic] = useState("");
  const [hook, setHook] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [keywords, setKeywords] = useState("");
  const [niche, setNiche] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState(null); // "script" | "media" | null
  const [scriptMode, setScriptMode] = useState(null); // "history" | "manual" | null
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() && !mediaFile) {
      setError("Please enter a topic or upload media for your caption.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const combinedScript = [
        hook.trim() ? `HOOK: ${hook.trim()}` : "",
        body.trim() ? `BODY: ${body.trim()}` : "",
        cta.trim() ? `CTA: ${cta.trim()}` : ""
      ].filter(Boolean).join("\n\n");

      await onGenerate({ 
        topic: topic.trim(),
        script: combinedScript,
        keywords: keywords.trim(),
        niche: niche.trim(),
        media: mediaFile
      });
    } catch (err) {
      setError("Failed to generate caption. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, section) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleGenerate();
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .generate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(10,132,255,0.5) !important;
        }
        .generate-btn:active:not(:disabled) { transform: translateY(0); }
        .generate-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .script-input:focus {
          outline: none;
          border-color: var(--input-focus) !important;
          box-shadow: 0 0 0 3px rgba(10,132,255,0.15);
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginTop: 45, marginBottom: 28, animation: "slideUp 0.4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ marginLeft: 50, fontSize: 22, fontWeight: 400, letterSpacing: "0.04em", fontFamily: "var(--font-primary)", color: "#F8F5F0", marginTop: 15 }}>
                AI Caption + Hashtags
              </h2>
              <p style={{ marginLeft: 50, fontSize: 13, color: "var(--muted-color)", marginTop: 2, fontFamily: "var(--font-ui)" }}>
                Generate engaging captions and optimized hashtags instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div style={{
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
              📌 Caption Topic *
            </label>
            <textarea
              id="caption-topic-input"
              className="script-input"
              rows={3}
              placeholder="e.g. My top 3 productivity tips for content creators..."
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

          {activeInputMode === "script" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "slideUp 0.3s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-color)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-primary)" }}>
                  📜 Script Details
                </label>
                <button
                  onClick={() => { setActiveInputMode(null); setScriptMode(null); setHook(""); setBody(""); setCta(""); }}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, cursor: "pointer" }}
                >
                  ✕ Remove
                </button>
              </div>

              {!scriptMode ? (
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => { setScriptMode("history"); setShowHistoryModal(true); }}
                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--accent)", background: "rgba(10,132,255,0.1)", color: "var(--accent)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    🚀 ViralRush Script (History)
                  </button>
                  <button
                    onClick={() => setScriptMode("manual")}
                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-color)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    ✍️ Other (Manual)
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {scriptMode === "history" && (
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      style={{ alignSelf: "flex-start", fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 4 }}
                    >
                      🔄 Change selected script
                    </button>
                  )}
                  {/* Hook Input */}
                  <div>
                    <label style={{ display: "block", fontSize: 10, color: "var(--muted-color)", marginBottom: 4 }}>Hook</label>
                    <textarea
                      className="script-input" rows={1} value={hook} onChange={(e) => setHook(e.target.value)}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-color)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>
                  {/* Body Input */}
                  <div>
                    <label style={{ display: "block", fontSize: 10, color: "var(--muted-color)", marginBottom: 4 }}>Body</label>
                    <textarea
                      className="script-input" rows={2} value={body} onChange={(e) => setBody(e.target.value)}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-color)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>
                  {/* CTA Input */}
                  <div>
                    <label style={{ display: "block", fontSize: 10, color: "var(--muted-color)", marginBottom: 4 }}>CTA</label>
                    <textarea
                      className="script-input" rows={1} value={cta} onChange={(e) => setCta(e.target.value)}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-color)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>

                  {/* Keywords & Niche row */}
                  <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 10, color: "var(--muted-color)", marginBottom: 4 }}>Keywords</label>
                      <input
                        type="text" className="script-input" placeholder="SEO, marketing..." value={keywords} onChange={(e) => setKeywords(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-color)", fontSize: 13, fontFamily: "inherit" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 10, color: "var(--muted-color)", marginBottom: 4 }}>Niche</label>
                      <input
                        type="text" className="script-input" placeholder="Fitness, Tech..." value={niche} onChange={(e) => setNiche(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-color)", fontSize: 13, fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeInputMode === "media" && mediaFile && (
            <div style={{ animation: "slideUp 0.3s ease both" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted-color)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-primary)" }}>
                🖼️ Attached Media
              </label>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--input-border)",
                background: "var(--input-bg)"
              }}>
                <span style={{ fontSize: 13, color: "var(--text-color)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {mediaFile.name}
                </span>
                <button
                  onClick={() => setMediaFile(null)}
                  style={{
                    background: "rgba(239,68,68,0.2)", border: "none", color: "#ef4444", borderRadius: "50%",
                    width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0
                  }}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 4, position: "relative" }}>
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || (!topic.trim() && !mediaFile)}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #0a84ff, #5ac8fa)",
                color: "#fff",
                border: "none",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(10,132,255,0.3)",
                transition: "all 0.2s",
                fontFamily: "var(--font-primary)",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  Generate Caption
                </>
              )}
            </button>

            <button
              className="plus-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="More options"
              style={{
                width: 50, height: 50, borderRadius: 12,
                background: "var(--input-bg)", border: "1.5px solid var(--input-border)",
                color: "var(--text-color)", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s", flexShrink: 0
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {dropdownOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "#1A1A1A", border: "1px solid var(--card-border)",
                borderRadius: 12, padding: "8px", display: "flex", flexDirection: "column", gap: 4,
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)", zIndex: 100, animation: "dropDown 0.2s ease",
                minWidth: 180
              }}>
                <button
                  className="dropdown-item"
                  onClick={() => { setActiveInputMode("script"); setDropdownOpen(false); }}
                  style={{ background: "transparent", border: "none", color: "var(--text-color)", padding: "10px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
                >
                  📜 From Script
                </button>
                <label
                  className="dropdown-item"
                  style={{ background: "transparent", border: "none", color: "var(--text-color)", padding: "10px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 13, display: "flex", alignItems: "center", gap: 8, margin: 0 }}
                >
                  🖼️ Upload Video / Image
                  <input
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setMediaFile(file); setActiveInputMode("media"); }
                      if (error) setError("");
                      setDropdownOpen(false);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowHistoryModal(false)}>
          <div style={{
            background: "#1A1A1A", border: "1px solid var(--card-border)", borderRadius: 20, width: "100%", maxWidth: 600,
            maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp 0.3s ease"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#fff" }}>Select from History</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: "none", border: "none", color: "var(--muted-color)", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {history.filter(h => h.type === "script").length === 0 ? (
                <p style={{ color: "var(--muted-color)", textAlign: "center", padding: "40px 0" }}>No scripts found in history.</p>
              ) : (
                history.filter(h => h.type === "script").map(item => (
                  <div key={item.id} onClick={() => {
                    setHook(item.result?.script?.hook || "");
                    setBody(item.result?.script?.body || item.prompt || "");
                    setCta(item.result?.script?.cta || "");
                    if (item.niche) setNiche(item.niche);
                    setShowHistoryModal(false);
                  }} style={{
                    padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s"
                  }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(10,132,255,0.05)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{item.prompt}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-color)", display: "flex", gap: 8 }}>
                      <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>{item.result?.durationLabel || "Script"}</span>
                      {item.niche && <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>{item.niche}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {generatedCaption && (
        <div style={{ paddingBottom: 60 }}>
          <div style={{
            marginLeft: 30,display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
            animation: "slideUp 0.4s ease 0.1s both",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 400, fontFamily: "var(--font-primary)", color: "#F8F5F0", letterSpacing: "0.02em" }}>
              Your Generated Caption
            </h3>
          </div>

          <div style={{
            width:"95%",
            marginLeft:"30px",
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 20,
            overflow: "hidden",
            animation: "slideUp 0.5s ease 0.15s both",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}>
            <div style={{
              background: "linear-gradient(90deg, rgba(10,132,255,0.15), transparent)",
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>✍️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Ready to Post</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => copyText(`${generatedCaption.caption}\n\n${(generatedCaption.hashtags || []).join(" ")}`, "all")}
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

            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Caption Body */}
              <div style={{
                background: "var(--section-bg)",
                border: "1px solid var(--section-border)",
                borderRadius: 12,
                padding: "14px 16px",
                position: "relative",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    📝 Caption
                  </span>
                  <button
                    onClick={() => copyText(generatedCaption.caption, "caption")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-color)", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}
                  >
                    {copiedSection === "caption" ? checkIcon : copyIcon}
                    {copiedSection === "caption" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--text-color)", whiteSpace: "pre-wrap" }}>
                  {generatedCaption.caption}
                </p>
              </div>

              {/* Hashtags */}
              {(generatedCaption.hashtags || []).length > 0 && (
                <div style={{
                  background: "var(--section-bg)",
                  border: "1px solid var(--section-border)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  position: "relative",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      #️⃣ Hashtags
                    </span>
                    <button
                      onClick={() => copyText(generatedCaption.hashtags.join(" "), "hashtags")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-color)", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}
                    >
                      {copiedSection === "hashtags" ? checkIcon : copyIcon}
                      {copiedSection === "hashtags" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--text-color)" }}>
                    {generatedCaption.hashtags.join(" ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
