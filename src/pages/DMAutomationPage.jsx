import React, { useState, useEffect } from "react";
import api, { getProxiedImage } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

export default function DMAutomationPage() {
  const { socket } = useSocket();
  const [automations, setAutomations] = useState([]);
  const [stats, setStats] = useState({ totalAutomations: 0, activeRules: 0, dmsSentToday: 0, leadsCaptured: 0 });
  const [logs, setLogs] = useState([]);
  
  // Instagram integrations
  const [instagramAccount, setInstagramAccount] = useState(null);
  const [posts, setPosts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("rules"); // "rules" or "logs"
  
  // Selected Rule State
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState("New Automation");
  const [formInstagramAccountId, setFormInstagramAccountId] = useState("");
  const [formPostId, setFormPostId] = useState("all");
  const [formPostTitle, setFormPostTitle] = useState("");
  const [formPostThumbnail, setFormPostThumbnail] = useState("");
  
  const [formTriggerType, setFormTriggerType] = useState("keyword"); // "keyword" or "any_comment"
  const [formKeyword, setFormKeyword] = useState("");
  const [formMatchType, setFormMatchType] = useState("contains");
  
  const [formPublicReplyText, setFormPublicReplyText] = useState("");
  const [formDmReplyMode, setFormDmReplyMode] = useState("template"); // "template" or "ai"
  const [formReplyMessage, setFormReplyMessage] = useState("");
  const [formAiInstruction, setFormAiInstruction] = useState("");
  
  const [formDelay, setFormDelay] = useState(0);
  const [formCreateLead, setFormCreateLead] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
    if (socket) {
      socket.on("new_dm", handleNewDMNotification);
    }
    return () => {
      if (socket) socket.off("new_dm", handleNewDMNotification);
    };
  }, [socket]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await api.get("/dm-automation/stats").catch(() => null);
      if (statsRes) setStats(statsRes.data);

      // Fetch automations
      const autoRes = await api.get("/dm-automation").catch(() => []);
      if (autoRes) setAutomations(autoRes.data);

      // Fetch Instagram profiles
      const igRes = await api.get("/instagram/profile").catch(() => null);
      if (igRes && igRes.data.isConnected) {
        setInstagramAccount(igRes.data.profile);
        setFormInstagramAccountId(igRes.data.profile.instagramUserId);
        
        // Fetch posts
        const mediaRes = await api.get("/instagram/media").catch(() => null);
        if (mediaRes) setPosts(mediaRes.data.media || []);
      }

      // Fetch logs
      const logsRes = await api.get("/dm-automation/logs").catch(() => []);
      if (logsRes) setLogs(logsRes.data);

    } catch (err) {
      console.error("Failed to load initial automation details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewDMNotification = () => {
    // Refresh stats and logs when events arrive
    api.get("/dm-automation/stats").then(res => setStats(res.data)).catch(() => {});
    api.get("/dm-automation/logs").then(res => setLogs(res.data)).catch(() => {});
  };

  const handleCreateNew = () => {
    setSelectedRuleId(null);
    setFormName("New Comment Automation");
    setFormPostId("all");
    setFormPostTitle("");
    setFormPostThumbnail("");
    setFormTriggerType("keyword");
    setFormKeyword("");
    setFormMatchType("contains");
    setFormPublicReplyText("");
    setFormDmReplyMode("template");
    setFormReplyMessage("");
    setFormAiInstruction("");
    setFormDelay(0);
    setFormCreateLead(false);
    setFormIsActive(true);
  };

  const selectRule = (rule) => {
    setSelectedRuleId(rule._id);
    setFormName(rule.name || "Untitled");
    setFormInstagramAccountId(rule.instagramAccountId || (instagramAccount?.instagramUserId || ""));
    setFormPostId(rule.postId || "all");
    setFormPostTitle(rule.postTitle || "");
    setFormPostThumbnail(rule.postThumbnail || "");
    
    // Trigger mapping
    const trType = rule.triggerType === "any_comment" ? "any_comment" : "keyword";
    setFormTriggerType(trType);
    setFormKeyword(rule.keyword || "");
    setFormMatchType(rule.matchType || "contains");
    
    // Replies mapping
    setFormPublicReplyText(rule.publicReplyText || "");
    setFormDmReplyMode(rule.dmReplyMode || "template");
    setFormReplyMessage(rule.replyMessage || "");
    setFormAiInstruction(rule.aiInstruction || "");
    
    setFormDelay(rule.delaySeconds || 0);
    setFormCreateLead(rule.createLead || false);
    setFormIsActive(rule.isActive ?? true);
  };

  const handleSelectPost = (media) => {
    if (media === "all") {
      setFormPostId("all");
      setFormPostTitle("");
      setFormPostThumbnail("");
    } else {
      setFormPostId(media.id);
      setFormPostTitle(media.caption ? media.caption.substring(0, 50) : "Instagram Post");
      setFormPostThumbnail(media.thumbnail_url || media.media_url || "");
    }
  };

  const handleSave = async () => {
    if (formTriggerType === "keyword" && !formKeyword.trim()) {
      alert("Please specify a keyword trigger.");
      return;
    }
    if (formDmReplyMode === "template" && !formReplyMessage.trim()) {
      alert("Please specify a DM reply template.");
      return;
    }
    if (formDmReplyMode === "ai" && !formAiInstruction.trim()) {
      alert("Please provide instructions for the AI reply.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName,
        instagramAccountId: formInstagramAccountId || instagramAccount?.instagramUserId,
        postId: formPostId,
        postTitle: formPostTitle,
        postThumbnail: formPostThumbnail,
        triggerType: formTriggerType,
        keyword: formTriggerType === "keyword" ? formKeyword : "",
        matchType: formMatchType,
        publicReplyText: formPublicReplyText,
        dmReplyMode: formDmReplyMode,
        replyMessage: formReplyMessage,
        aiInstruction: formAiInstruction,
        delaySeconds: formDelay,
        createLead: formCreateLead,
        isActive: formIsActive
      };

      if (selectedRuleId) {
        await api.put(`/dm-automation/${selectedRuleId}`, payload);
      } else {
        const res = await api.post("/dm-automation", payload);
        setSelectedRuleId(res.data._id);
      }
      
      // Refresh list, stats, and logs
      fetchInitialData();
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save automation rules.");
    } finally {
      setSaving(false);
    }
  };

  const toggleRuleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/dm-automation/${id}/toggle`, { isActive: !currentStatus });
      fetchInitialData();
      if (selectedRuleId === id) setFormIsActive(!currentStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRule = async (id) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      await api.delete(`/dm-automation/${id}`);
      if (selectedRuleId === id) handleCreateNew();
      fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAutomations = automations.filter(a => {
    if (search && !(a.name || "").toLowerCase().includes(search.toLowerCase()) && !(a.keyword || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Connect integration flow
  const handleConnectInstagram = async () => {
    try {
      const res = await api.get("/instagram/auth");
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Auth redirect failed", err);
    }
  };

  if (loading) {
    return (
      <div className="dma-loading">
        <div className="spinner" />
        <p>Loading DM Automation Engine...</p>
        <style>{`
          .dma-loading {
            min-height: 100vh;
            background: #09090b;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #a1a1aa;
            font-family: sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(236,72,153,0.1);
            border-top-color: #ec4899;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Not connected visual state
  if (!instagramAccount) {
    return (
      <div className="dma-connect-page">
        <div className="dma-connect-card">
          <div className="dma-connect-icon">💬</div>
          <h1>Connect Instagram Professional</h1>
          <p>
            Automate comments, send instant templates or AI-generated DMs to commenters, and convert posts into viral organic funnels.
          </p>
          <button className="dma-btn-primary" onClick={handleConnectInstagram}>
            Connect Instagram Account
          </button>
        </div>
        <style>{`
          .dma-connect-page {
            min-height: 100vh;
            background: #09090b;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: sans-serif;
          }
          .dma-connect-card {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 24px;
            padding: 48px;
            max-width: 480px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          }
          .dma-connect-icon {
            font-size: 64px;
            margin-bottom: 24px;
          }
          .dma-connect-card h1 {
            color: white;
            font-size: 24px;
            margin: 0 0 12px;
            font-weight: 800;
          }
          .dma-connect-card p {
            color: #a1a1aa;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 32px;
          }
          .dma-btn-primary {
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            width: 100%;
            font-size: 15px;
            transition: 0.2s;
          }
          .dma-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 25px -5px rgba(236,72,153,0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dma-page">
      <style>{`
        .dma-page {
          min-height: 100vh;
          background: #09090b;
          padding: 40px;
          font-family: sans-serif;
          color: #f4f4f5;
        }
        
        .dma-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }
        .dma-title h1 {
          margin: 0 0 8px;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.025em;
          background: linear-gradient(to right, #ffffff, #a1a1aa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .dma-title p {
          margin: 0;
          color: #71717a;
          font-size: 14px;
        }
        
        .dma-create-btn {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .dma-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(236,72,153,0.25);
        }

        .dma-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        .dma-stat-card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 20px 24px;
        }
        .dma-stat-val { font-size: 32px; font-weight: 800; color: white; margin-bottom: 4px; }
        .dma-stat-lbl { font-size: 12px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        .dma-tabs {
          display: flex; gap: 12px; margin-bottom: 24px;
          border-bottom: 1px solid #27272a;
          padding-bottom: 16px;
        }
        .dma-tab {
          padding: 8px 18px; border-radius: 100px;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
          background: transparent; color: #71717a; border: 1px solid transparent;
        }
        .dma-tab.active {
          background: rgba(236,72,153,0.1);
          border-color: rgba(236,72,153,0.2);
          color: #f472b6;
        }

        .dma-main-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }

        .dma-panel {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          display: flex; flex-direction: column; overflow: hidden;
          min-height: 580px;
        }
        .dma-panel-hdr {
          padding: 16px 20px; border-bottom: 1px solid #27272a;
          font-weight: 800; font-size: 15px; display: flex; align-items: center; justify-content: space-between;
        }
        .dma-search {
          width: 100%; background: transparent; border: none; color: white; outline: none; font-size: 13px;
        }
        .dma-list { overflow-y: auto; flex: 1; padding: 12px; }
        .dma-list-item {
          background: #09090b; border: 1px solid #27272a;
          border-radius: 12px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.2s;
        }
        .dma-list-item:hover, .dma-list-item.active {
          border-color: #ec4899; background: rgba(236,72,153,0.02);
        }
        .dma-item-name { font-weight: 700; font-size: 14px; margin-bottom: 6px; color: white; }
        .dma-item-kw { font-size: 11px; color: #a1a1aa; font-family: monospace; background: #27272a; padding: 2px 6px; border-radius: 4px; display: inline-block;}
        .dma-item-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        
        /* Toggle Switch */
        .dma-toggle {
          width: 36px; height: 20px; border-radius: 50px; background: #27272a;
          position: relative; cursor: pointer; transition: 0.3s; border: none;
        }
        .dma-toggle.on { background: #10b981; }
        .dma-toggle::after {
          content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
          background: #fff; border-radius: 50%; transition: 0.3s;
        }
        .dma-toggle.on::after { transform: translateX(16px); }

        /* Form Details */
        .dma-form-body {
          padding: 24px; display: flex; flex-direction: column; gap: 20px;
        }
        .dma-form-grp { display: flex; flex-direction: column; gap: 8px; }
        .dma-form-lbl { font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .dma-input, .dma-select, .dma-textarea {
          background: #09090b; border: 1px solid #27272a; border-radius: 8px;
          padding: 12px; color: white; font-size: 14px; outline: none; font-family: inherit;
        }
        .dma-input:focus, .dma-select:focus, .dma-textarea:focus { border-color: #ec4899; }
        .dma-textarea { height: 90px; resize: none; }

        /* Media Selector Cards */
        .post-selector-grid {
          display: flex; gap: 12px; overflow-x: auto; padding: 4px 0 12px; scrollbar-width: thin;
        }
        .post-selector-card {
          width: 100px; height: 100px; border-radius: 8px; background: #09090b; border: 1px solid #27272a;
          flex-shrink: 0; cursor: pointer; overflow: hidden; position: relative; transition: 0.2s;
        }
        .post-selector-card:hover, .post-selector-card.active { border-color: #ec4899; transform: scale(1.02); }
        .post-selector-card img { width: 100%; height: 100%; object-fit: cover; }
        .post-selector-all {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-size: 10px; color: #a1a1aa; font-weight: 800; text-transform: uppercase; text-align: center;
          padding: 8px;
        }

        /* Reply Mode Selector */
        .reply-mode-tabs { display: flex; gap: 10px; }
        .reply-mode-btn {
          flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #27272a; background: #09090b;
          color: #71717a; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s;
        }
        .reply-mode-btn.active {
          border-color: #ec4899; color: white; background: rgba(236,72,153,0.05);
        }

        .dma-btn-save {
          background: linear-gradient(135deg, #ec4899, #8b5cf6); border: none; padding: 14px;
          border-radius: 8px; color: white; font-weight: 700; font-size: 14px; cursor: pointer;
          transition: 0.2s;
        }
        .dma-btn-save:hover { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(236,72,153,0.2); }
        .dma-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Logs Table */
        .logs-table-container {
          background: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;
        }
        .logs-table { width: 100%; border-collapse: collapse; text-align: left; }
        .logs-table th { background: #09090b; padding: 16px 20px; font-size: 12px; color: #a1a1aa; text-transform: uppercase; font-weight: 800; }
        .logs-table td { padding: 16px 20px; border-bottom: 1px solid #27272a; font-size: 13px; color: #f4f4f5; }
        .logs-table tr:last-child td { border-bottom: none; }
        .status-badge {
          display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;
        }
        .status-badge.success { background: rgba(16,185,129,0.1); color: #10b981; }
        .status-badge.failed { background: rgba(239,68,68,0.1); color: #ef4444; }
      `}</style>

      <div className="dma-header">
        <div className="dma-title">
          <h1>Instagram DM Automation</h1>
          <p>Instantly reply to comments, send AI DMs, and convert audience comments into conversions.</p>
        </div>
        <button className="dma-create-btn" onClick={handleCreateNew}>+ Create Automation</button>
      </div>

      {/* Stats Cards */}
      <div className="dma-stats">
        <div className="dma-stat-card">
          <div className="dma-stat-val">{stats.totalAutomations}</div>
          <div className="dma-stat-lbl">Active Rules</div>
        </div>
        <div className="dma-stat-card">
          <div className="dma-stat-val">@{instagramAccount.username}</div>
          <div className="dma-stat-lbl">Connected Account</div>
        </div>
        <div className="dma-stat-card">
          <div className="dma-stat-val">{stats.dmsSentToday}</div>
          <div className="dma-stat-lbl">DMs Sent Today</div>
        </div>
        <div className="dma-stat-card">
          <div className="dma-stat-val">{stats.leadsCaptured}</div>
          <div className="dma-stat-lbl">Total Leads</div>
        </div>
      </div>

      <div className="dma-tabs">
        <button className={`dma-tab ${activeTab === "rules" ? "active" : ""}`} onClick={() => setActiveTab("rules")}>Rules Engine</button>
        <button className={`dma-tab ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>Execution Logs ({logs.length})</button>
      </div>

      {activeTab === "rules" ? (
        <div className="dma-main-layout">
          
          {/* Rules List (Left Sidebar) */}
          <div className="dma-panel">
            <div className="dma-panel-hdr">
              <input type="text" className="dma-search" placeholder="Search rules..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div className="dma-list">
              {filteredAutomations.map(a => {
                const active = a.isActive ?? true;
                return (
                  <div key={a._id} className={`dma-list-item ${selectedRuleId === a._id ? "active" : ""}`} onClick={() => selectRule(a)}>
                    <div className="dma-item-name">{a.name || "Untitled"}</div>
                    <div className="dma-item-kw">
                      {a.postId === "all" ? "Any Post" : "Specific Post"} ➔ {a.triggerType === "any_comment" ? "Any Comment" : `"${a.keyword}"`}
                    </div>
                    <div className="dma-item-actions">
                      <button className={`dma-toggle ${active ? "on" : ""}`} onClick={(e) => { e.stopPropagation(); toggleRuleStatus(a._id, active); }} />
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteRule(a._id); }} 
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredAutomations.length === 0 && (
                <div style={{ textAlign: "center", padding: 24, color: "#71717a", fontSize: 13 }}>
                  No rules found.
                </div>
              )}
            </div>
          </div>

          {/* Settings Form */}
          <div className="dma-panel" style={{ flex: 1 }}>
            <div className="dma-panel-hdr">
              <span>{selectedRuleId ? "Edit Rule" : "Create New Rule"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "#71717a" }}>{formIsActive ? "ACTIVE" : "DISABLED"}</span>
                <button className={`dma-toggle ${formIsActive ? "on" : ""}`} onClick={() => setFormIsActive(!formIsActive)} />
              </div>
            </div>

            <div className="dma-form-body">
              <div className="dma-form-grp">
                <label className="dma-form-lbl">Automation Rule Name</label>
                <input className="dma-input" type="text" placeholder="e.g. Price Funnel" value={formName} onChange={e=>setFormName(e.target.value)} />
              </div>

              {/* Account selection */}
              <div className="dma-form-grp">
                <label className="dma-form-lbl">Instagram Account</label>
                <select className="dma-select" value={formInstagramAccountId} onChange={e=>setFormInstagramAccountId(e.target.value)}>
                  <option value={instagramAccount.instagramUserId}>@{instagramAccount.username} ({instagramAccount.followersCount} Followers)</option>
                </select>
              </div>

              {/* Select Reel/Post */}
              <div className="dma-form-grp">
                <label className="dma-form-lbl">Select Reel / Post</label>
                <div className="post-selector-grid">
                  <div className={`post-selector-card post-selector-all ${formPostId === "all" ? "active" : ""}`} onClick={() => handleSelectPost("all")}>
                    💬 All Posts & Reels
                  </div>
                  {posts.map(post => (
                    <div key={post.id} className={`post-selector-card ${formPostId === post.id ? "active" : ""}`} onClick={() => handleSelectPost(post)}>
                      <img src={getProxiedImage(post.thumbnail_url || post.media_url)} alt="Instagram Media" />
                    </div>
                  ))}
                </div>
                {formPostId !== "all" && (
                  <span style={{ fontSize: 12, color: "#ec4899" }}>
                    Selected Post: {formPostTitle}
                  </span>
                )}
              </div>

              {/* Trigger Type Toggle */}
              <div style={{ display: "flex", gap: 16 }}>
                <div className="dma-form-grp" style={{ flex: 1 }}>
                  <label className="dma-form-lbl">Trigger Comment Type</label>
                  <select className="dma-select" value={formTriggerType} onChange={e=>setFormTriggerType(e.target.value)}>
                    <option value="keyword">Specific Keyword</option>
                    <option value="any_comment">Any Comment</option>
                  </select>
                </div>

                {formTriggerType === "keyword" && (
                  <div className="dma-form-grp" style={{ flex: 1 }}>
                    <label className="dma-form-lbl">Match Type</label>
                    <select className="dma-select" value={formMatchType} onChange={e=>setFormMatchType(e.target.value)}>
                      <option value="contains">Contains Keyword</option>
                      <option value="exact">Exact Match</option>
                      <option value="startsWith">Starts With</option>
                    </select>
                  </div>
                )}
              </div>

              {formTriggerType === "keyword" && (
                <div className="dma-form-grp">
                  <label className="dma-form-lbl">Keyword Trigger</label>
                  <input className="dma-input" type="text" placeholder="e.g. PRICE, LINK, INFO" value={formKeyword} onChange={e=>setFormKeyword(e.target.value)} />
                </div>
              )}

              {/* Public reply input */}
              <div className="dma-form-grp">
                <label className="dma-form-lbl">Public Comment Reply (Optional)</label>
                <input className="dma-input" type="text" placeholder="e.g. Check your DMs, I've sent it over! 🚀" value={formPublicReplyText} onChange={e=>setFormPublicReplyText(e.target.value)} />
              </div>

              {/* DM reply mode */}
              <div className="dma-form-grp">
                <label className="dma-form-lbl">DM Reply Mode</label>
                <div className="reply-mode-tabs">
                  <button className={`reply-mode-btn ${formDmReplyMode === "template" ? "active" : ""}`} onClick={() => setFormDmReplyMode("template")}>Static Template</button>
                  <button className={`reply-mode-btn ${formDmReplyMode === "ai" ? "active" : ""}`} onClick={() => setFormDmReplyMode("ai")}>AI Personalization</button>
                </div>
              </div>

              {formDmReplyMode === "template" ? (
                <div className="dma-form-grp">
                  <label className="dma-form-lbl">DM Template Reply</label>
                  <textarea className="dma-textarea" placeholder="Write the DM reply body..." value={formReplyMessage} onChange={e=>setFormReplyMessage(e.target.value)} />
                </div>
              ) : (
                <>
                  <div className="dma-form-grp">
                    <label className="dma-form-lbl">AI Instruction Prompt</label>
                    <textarea className="dma-textarea" placeholder="e.g. Act as a fitness coach. Suggest booking a free call via this link: calendly.com/fit." value={formAiInstruction} onChange={e=>setFormAiInstruction(e.target.value)} />
                  </div>
                  <div className="dma-form-grp">
                    <label className="dma-form-lbl">Fallback Template Reply</label>
                    <textarea className="dma-textarea" placeholder="Used if AI generation fails or key limits are exceeded..." value={formReplyMessage} onChange={e=>setFormReplyMessage(e.target.value)} />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 16 }}>
                <div className="dma-form-grp" style={{ flex: 1 }}>
                  <label className="dma-form-lbl">Delay</label>
                  <select className="dma-select" value={formDelay} onChange={e=>setFormDelay(Number(e.target.value))}>
                    <option value={0}>No Delay</option>
                    <option value={3}>3 Seconds</option>
                    <option value={5}>5 Seconds</option>
                    <option value={10}>10 Seconds</option>
                  </select>
                </div>
                
                <div className="dma-form-grp" style={{ flex: 1, justifyContent: "center" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Create Lead profile</span>
                    <button className={`dma-toggle ${formCreateLead ? "on" : ""}`} onClick={() => setFormCreateLead(!formCreateLead)} />
                  </div>
                </div>
              </div>

              <button className="dma-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving Rule..." : "Save Automation Rule"}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Logs view */
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Comment</th>
                <th>Public Reply</th>
                <th>Private DM Sent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>@{log.commenterUsername}</td>
                  <td>"{log.commentText}"</td>
                  <td>{log.publicReplySent ? `✅ "${log.publicReplyText}"` : "❌ None"}</td>
                  <td>{log.privateReplySent ? `📩 "${log.privateReplyText.substring(0, 50)}..."` : "❌ None"}</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 32, color: "#71717a" }}>
                    No automated reply executions logged yet. Try triggering rules on your posts!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
