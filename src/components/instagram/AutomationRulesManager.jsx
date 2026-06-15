import React, { useState, useEffect } from "react";
import api from "@/lib/api";

export default function AutomationRulesManager() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [channel, setChannel] = useState("Any");
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get("/features/automation");
      setRules(res.data);
    } catch (err) {
      console.error("Failed to fetch automation rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !replyMessage.trim()) return;

    setAdding(true);
    try {
      const res = await api.post("/features/automation", {
        keyword: keyword.trim(),
        replyMessage: replyMessage.trim(),
        useAI,
        isActive: true,
        channel
      });
      setRules([res.data, ...rules]);
      setKeyword("");
      setReplyMessage("");
      setUseAI(false);
    } catch (err) {
      console.error("Failed to add automation rule:", err);
      alert("Failed to create rule. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (rule) => {
    const updatedStatus = !(rule.isActive ?? rule.active ?? true);
    try {
      setRules(rules.map((r) => r._id === rule._id ? { ...r, isActive: updatedStatus, active: updatedStatus } : r));
      await api.put(`/features/automation/${rule._id}`, { isActive: updatedStatus, active: updatedStatus });
    } catch (err) {
      setRules(rules.map((r) => r._id === rule._id ? { ...r, isActive: !updatedStatus, active: !updatedStatus } : r));
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      setRules(rules.filter((r) => r._id !== ruleId));
      await api.delete(`/features/automation/${ruleId}`);
    } catch (err) {
      fetchRules();
    }
  };

  const filteredRules = rules.filter(r => {
    if (activeTab === "active") return r.isActive ?? r.active ?? true;
    if (activeTab === "paused") return !(r.isActive ?? r.active ?? true);
    return true;
  });

  return (
    <div className="rules-manager-container">
      <style>{`
        .rules-manager-container {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }

        /* Create Panel */
        .rm-create-panel {
          flex: 1;
          min-width: 320px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .rm-create-panel::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.5), transparent);
        }

        .rm-title {
          font-family: var(--font-primary, sans-serif);
          font-size: 20px;
          font-weight: 800;
          color: white;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rm-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2));
          border: 1px solid rgba(236,72,153,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f472b6;
        }

        .rm-input-group { margin-bottom: 20px; }
        .rm-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .rm-input {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .rm-input:focus {
          border-color: #ec4899;
          box-shadow: 0 0 0 3px rgba(236,72,153,0.15);
        }
        .rm-textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
        }

        .rm-toggle-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(139,92,246,0.05);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .rm-toggle-text h4 { margin: 0 0 4px; font-size: 14px; color: #fff; font-weight: 700; display: flex; alignItems: center; gap: 6px; }
        .rm-toggle-text p { margin: 0; font-size: 12px; color: rgba(255,255,255,0.5); }
        
        .ios-toggle {
          width: 48px; height: 26px;
          border-radius: 50px;
          background: rgba(255,255,255,0.1);
          position: relative;
          cursor: pointer;
          transition: 0.3s;
          border: none;
          flex-shrink: 0;
        }
        .ios-toggle.on { background: #10b981; }
        .ios-toggle::after {
          content: ""; position: absolute;
          top: 3px; left: 3px; width: 20px; height: 20px;
          background: #fff; border-radius: 50%;
          transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .ios-toggle.on::after { transform: translateX(22px); }

        .rm-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(236,72,153,0.3);
        }
        .rm-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(236,72,153,0.4);
        }
        .rm-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        /* List Panel */
        .rm-list-panel {
          flex: 1.5;
          min-width: 320px;
          display: flex;
          flex-direction: column;
        }

        .rm-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .rm-tab {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .rm-tab.active {
          background: rgba(236,72,153,0.1);
          border-color: rgba(236,72,153,0.3);
          color: #f472b6;
        }

        .rm-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rm-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .rm-card:hover {
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .rm-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .rm-keyword-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.08);
          padding: 6px 12px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
        }

        .rm-card-body {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 10px;
          padding: 14px;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .rm-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .rm-status-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .rm-status-label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
        }

        .rm-delete {
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.2);
          color: #ef4444;
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; alignItems: center; justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .rm-delete:hover {
          background: #ef4444;
          color: white;
        }
        
        .ai-badge {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* CREATE PANEL */}
      <div className="rm-create-panel">
        <div className="rm-title">
          <div className="rm-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          New Automation Flow
        </div>

        <form onSubmit={handleAddRule}>
          <div className="rm-input-group">
            <label className="rm-label">Trigger Keyword</label>
            <input 
              type="text" 
              className="rm-input" 
              placeholder="e.g. 'guide', 'price', 'link'"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              required
            />
          </div>

          <div className="rm-input-group">
            <label className="rm-label">Automated Reply Message</label>
            <textarea 
              className="rm-input rm-textarea" 
              placeholder="Hey! Here's the link you requested: https://..."
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              required
            />
          </div>

          <div className="rm-input-group">
            <label className="rm-label">Trigger Location</label>
            <select 
              className="rm-input" 
              value={channel}
              onChange={e => setChannel(e.target.value)}
            >
              <option value="Any">Anywhere (DMs & Comments)</option>
              <option value="DM">Direct Messages Only</option>
              <option value="Comment">Comments Only</option>
            </select>
          </div>

          <div className="rm-toggle-box">
            <div className="rm-toggle-text">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5"><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                AI Personalization
              </h4>
              <p>Tailor the response to context and tone using Gemini AI.</p>
            </div>
            <button type="button" className={`ios-toggle ${useAI ? "on" : ""}`} onClick={() => setUseAI(!useAI)} />
          </div>

          <button type="submit" className="rm-submit" disabled={adding || !keyword.trim() || !replyMessage.trim()}>
            {adding ? "Deploying Flow..." : "Activate Flow"}
          </button>
        </form>
      </div>

      {/* LIST PANEL */}
      <div className="rm-list-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)" }}>Active Flows</h2>
        </div>

        <div className="rm-tabs">
          <button className={`rm-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All ({rules.length})</button>
          <button className={`rm-tab ${activeTab === "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>Active</button>
          <button className={`rm-tab ${activeTab === "paused" ? "active" : ""}`} onClick={() => setActiveTab("paused")}>Paused</button>
        </div>

        <div className="rm-list">
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
               <div style={{ width: 30, height: 30, border: "3px solid rgba(236,72,153,0.2)", borderTopColor: "#ec4899", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            </div>
          ) : filteredRules.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>🤖</div>
              <h3 style={{ color: "white", margin: "0 0 8px" }}>No flows found</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 14 }}>Create your first automation on the left panel.</p>
            </div>
          ) : (
            filteredRules.map(rule => {
              const active = rule.isActive ?? rule.active ?? true;
              const kw = rule.keyword || rule.trigger;
              const rep = rule.replyMessage || rule.reply;
              const ruleChannel = rule.channel || "Any";

              return (
                <div key={rule._id} className="rm-card" style={{ opacity: active ? 1 : 0.6 }}>
                  <div className="rm-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="rm-keyword-tag">
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>IF</span> "{kw}"
                      </div>
                      <span className="ai-badge" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                        {ruleChannel === "Any" ? "DMs & Comments" : ruleChannel}
                      </span>
                      {rule.useAI && <span className="ai-badge">AI Boosted</span>}
                    </div>
                  </div>

                  <div className="rm-card-body">
                    {rep}
                  </div>

                  <div className="rm-card-footer">
                    <div className="rm-status-toggle" onClick={() => handleToggleActive(rule)}>
                      <button className={`ios-toggle ${active ? "on" : ""}`} />
                      <span className="rm-status-label">{active ? "ACTIVE" : "PAUSED"}</span>
                    </div>

                    <button className="rm-delete" onClick={() => handleDeleteRule(rule._id)} title="Delete Flow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
