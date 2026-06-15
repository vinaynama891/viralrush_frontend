import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import AutomationRulesManager from "@/components/instagram/AutomationRulesManager";

export default function AutomationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstagramStatus();
  }, []);

  const fetchInstagramStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/instagram/profile");
      if (res.data?.isConnected) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error("Failed to load Instagram connection status:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ig-auto-loading">
        <style>{`
          .ig-auto-loading {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0d0d0d;
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(220, 39, 67, 0.15);
            border-top-color: #dc2743;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="automation-page-wrapper">
      <style>{`
        .automation-page-wrapper {
          min-height: 100vh;
          background: #0d0d0d;
          padding: 56px 40px 80px;
          color: white;
          font-family: var(--font-ui);
        }

        .auto-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .auto-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(220, 39, 67, 0.12);
          border: 1px solid rgba(220, 39, 67, 0.35);
          border-radius: 100px;
          padding: 6px 18px;
          margin-bottom: 22px;
        }

        .auto-badge-text {
          font-size: 11px;
          font-weight: 700;
          color: #f87171;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: var(--font-primary);
        }

        .auto-title {
          margin: 0 0 16px;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          color: #fff;
          font-family: var(--font-primary);
          line-height: 1.15;
        }

        .auto-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.45);
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .auto-unconnected-splash {
          max-width: 540px;
          margin: 40px auto 0;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 48px 40px;
          text-align: center;
          backdrop-filter: blur(12px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        .auto-splash-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: rgba(255,255,255,0.4);
        }

        .auto-splash-title {
          font-family: var(--font-primary, sans-serif);
          font-size: 20px;
          font-weight: 800;
          color: white;
          margin-bottom: 12px;
        }

        .auto-splash-desc {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .auto-splash-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.25);
        }

        .auto-splash-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(124, 58, 237, 0.45);
        }
      `}</style>

      <div className="auto-header">
        <div className="auto-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="auto-badge-text">Auto-Reply Engine</span>
        </div>
        <h1 className="auto-title">DM & Comment Automation</h1>
        <p className="auto-desc">
          Set up keyword-based replies and harness OpenAI completion tools to build organic engagement with your audience 24/7.
        </p>
      </div>

      {isConnected ? (
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <AutomationRulesManager />
        </div>
      ) : (
        <div className="auto-unconnected-splash">
          <div className="auto-splash-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </div>
          <h3 className="auto-splash-title">Instagram Account Not Connected</h3>
          <p className="auto-splash-desc">
            To unlock keyword-based automation rules and OpenAI auto-replies, you must link your Instagram Creator or Business account first.
          </p>
          <button 
            className="auto-splash-btn"
            onClick={() => {
              // Direct navigation to integrations tab
              window.location.hash = "#connect";
              // Trigger navigation to connect section
              const event = new CustomEvent("viralrush_navigate", { detail: "connect" });
              window.dispatchEvent(event);
            }}
          >
            <span>Go Connect Channel</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
