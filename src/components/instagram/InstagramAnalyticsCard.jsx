import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";

export default function InstagramAnalyticsCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeMetric, setActiveMetric] = useState("reach"); // 'reach' | 'followers' | 'engagement'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/instagram/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch Instagram analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ig-analytics-loading">
        <style>{`
          .ig-analytics-loading {
            height: 380px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
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

  if (!data) {
    return (
      <div className="ig-analytics-empty">
        <style>{`
          .ig-analytics-empty {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.4);
            font-size: 14px;
          }
        `}</style>
        Failed to load analytics data.
      </div>
    );
  }

  // Parse chart data for Recharts
  const chartData = data.charts.labels.map((label, index) => ({
    name: label,
    reach: data.charts.reachHistory[index],
    followers: data.charts.followersHistory[index],
    engagement: data.charts.engagementHistory[index]
  }));

  const metricsInfo = {
    reach: {
      title: "Weekly Reach",
      value: data.summary.weeklyReach,
      color: "#dc2743",
      gradient: "url(#colorReach)"
    },
    followers: {
      title: "Followers Trend",
      value: data.summary.followers.toLocaleString(),
      color: "#bc1888",
      gradient: "url(#colorFollowers)"
    },
    engagement: {
      title: "Avg Engagement",
      value: data.summary.engagementRate,
      color: "#f09433",
      gradient: "url(#colorEngagement)"
    }
  };

  return (
    <div className="ig-analytics-card">
      <style>{`
        .ig-analytics-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .ig-anal-title {
          font-family: var(--font-primary, sans-serif);
          font-size: 16px;
          font-weight: 800;
          color: white;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ig-metric-pills {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .ig-metric-pill {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
        }

        .ig-metric-pill:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .ig-metric-pill.active-reach {
          border-color: rgba(220, 39, 67, 0.4);
          background: rgba(220, 39, 67, 0.05);
          box-shadow: inset 0 0 12px rgba(220, 39, 67, 0.05);
        }

        .ig-metric-pill.active-followers {
          border-color: rgba(188, 24, 136, 0.4);
          background: rgba(188, 24, 136, 0.05);
          box-shadow: inset 0 0 12px rgba(188, 24, 136, 0.05);
        }

        .ig-metric-pill.active-engagement {
          border-color: rgba(240, 148, 51, 0.4);
          background: rgba(240, 148, 51, 0.05);
          box-shadow: inset 0 0 12px rgba(240, 148, 51, 0.05);
        }

        .ig-pill-lbl {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ig-pill-val {
          font-family: var(--font-primary, sans-serif);
          font-size: 22px;
          font-weight: 900;
          color: white;
          margin-top: 6px;
        }

        .ig-chart-container {
          height: 240px;
          width: 100%;
          margin-top: 8px;
        }

        .ig-tooltip {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 8px 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .ig-tooltip-lbl {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
        }

        .ig-tooltip-val {
          font-family: var(--font-primary, sans-serif);
          font-size: 14px;
          font-weight: 750;
          color: white;
          margin-top: 2px;
        }
      `}</style>

      <h3 className="ig-anal-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Live Analytics
      </h3>

      <div className="ig-metric-pills">
        <button 
          className={`ig-metric-pill ${activeMetric === "reach" ? "active-reach" : ""}`}
          onClick={() => setActiveMetric("reach")}
        >
          <div className="ig-pill-lbl">Weekly Reach</div>
          <div className="ig-pill-val">{data.summary.weeklyReach}</div>
        </button>

        <button 
          className={`ig-metric-pill ${activeMetric === "followers" ? "active-followers" : ""}`}
          onClick={() => setActiveMetric("followers")}
        >
          <div className="ig-pill-lbl">Total Followers</div>
          <div className="ig-pill-val">{data.summary.followers.toLocaleString()}</div>
        </button>

        <button 
          className={`ig-metric-pill ${activeMetric === "engagement" ? "active-engagement" : ""}`}
          onClick={() => setActiveMetric("engagement")}
        >
          <div className="ig-pill-lbl">Engagement Rate</div>
          <div className="ig-pill-val">{data.summary.engagementRate}</div>
        </button>
      </div>

      <div className="ig-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2743" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#dc2743" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#bc1888" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#bc1888" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f09433" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f09433" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="ig-tooltip">
                      <div className="ig-tooltip-lbl">{label}</div>
                      <div className="ig-tooltip-val">
                        {activeMetric === "reach" && `${payload[0].payload.reach.toLocaleString()} Reached`}
                        {activeMetric === "followers" && `${payload[0].payload.followers.toLocaleString()} Followers`}
                        {activeMetric === "engagement" && `${payload[0].payload.engagement}% Engagement`}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={metricsInfo[activeMetric].color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={metricsInfo[activeMetric].gradient} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
