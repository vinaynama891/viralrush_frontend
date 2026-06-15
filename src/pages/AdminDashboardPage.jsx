import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function AdminDashboardPage({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/auth/admin/stats"),
        api.get("/auth/admin/users"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.niche || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(91,46,255,0.25)", borderTopColor: "#5b2eff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <style>{`
        @keyframes adminFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .admin-dashboard-wrapper {
          min-height: 100vh; background: #0a0a0a; color: #fff;
          font-family: var(--font-ui);
          display: flex;
        }
        .admin-sidebar {
          width: 240px; flex-shrink: 0; background: #111; border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; overflow-y: auto;
        }
        .admin-main { flex: 1; padding: clamp(1rem,3vw,2.5rem); overflow-y: auto; min-height: 100vh; }
        .admin-card {
          background: #141414; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
          padding: 22px 24px; transition: all 0.3s ease; animation: adminFadeIn 0.5s ease;
        }
        .admin-card:hover { border-color: rgba(91,46,255,0.3); box-shadow: 0 8px 32px rgba(91,46,255,0.08); transform: translateY(-2px); }
        .admin-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .admin-tab { background: none; border: none; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500; padding: 10px 18px; cursor: pointer; border-radius: 10px; transition: all 0.2s; font-family: inherit; }
        .admin-tab:hover { color: #a78bfa; background: rgba(91,46,255,0.08); }
        .admin-tab.active { color: #a78bfa; background: rgba(91,46,255,0.14); border: 1px solid rgba(91,46,255,0.3); font-weight: 700; }
        .admin-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .admin-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .admin-table td { padding: 14px 16px; font-size: 13px; color: rgba(255,255,255,0.75); border-bottom: 1px solid rgba(255,255,255,0.04); }
        .admin-table tr:hover td { background: rgba(91,46,255,0.04); }
        .admin-badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: 11px; font-weight: 600; }
        .admin-search { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px 10px 36px; color: #fff; font-size: 13px; outline: none; font-family: inherit; transition: border-color 0.2s; }
        .admin-search:focus { border-color: rgba(91,46,255,0.5); }
        .admin-search::placeholder { color: rgba(255,255,255,0.3); }
        .admin-sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 998; }
        .admin-sidebar-overlay.active { display: block; }
        .admin-mobile-btn {
          display: none; position: fixed; top: 16px; left: 16px; z-index: 1000; width: 42px; height: 42px;
          border-radius: 12px; background: rgba(239,68,68,0.18); border: 1px solid rgba(239,68,68,0.35);
          color: #f87171; cursor: pointer; align-items: center; justify-content: center; transition: all 0.2s;
        }
        @media (max-width: 1024px) {
          .admin-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-sidebar { position: fixed; left: 0; transform: translateX(-100%); z-index: 999; transition: transform 0.3s ease; }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-mobile-btn { display: flex; }
          .admin-main { padding-top: 70px; }
        }
        @media (max-width: 640px) {
          .admin-stat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Mobile Toggle & Overlay */}
      <div 
        className={`admin-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      <button 
        className="admin-mobile-btn" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#ef4444,#dc2626)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 16px rgba(239,68,68,0.4)" }}>
              🛡️
            </div>
            <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: "0.06em", color: "#fff", fontFamily: "var(--font-primary)" }}>ADMIN PANEL</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { key: "overview", label: "Overview", icon: "📊" },
            { key: "users", label: "All Users", icon: "👥" },
            { key: "platforms", label: "Platforms", icon: "📱" },
            { key: "niches", label: "Niches", icon: "🎯" },
          ].map((item) => (
            <button
              key={item.key}
              className={`admin-tab${activeTab === item.key ? " active" : ""}`}
              onClick={() => { setActiveTab(item.key); setIsSidebarOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: "10px 12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email || "Admin"}
          </div>
          <button
            onClick={onLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
          >
            🚪 Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              ADMIN DASHBOARD
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)" }}>
              Welcome, {user?.username || "Admin"} 🛡️
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "6px 14px", borderRadius: 50, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              ADMIN
            </span>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="admin-stat-grid">
              {[
                { label: "Total Users", value: stats?.totalUsers || 0, color: "#5b2eff", bg: "rgba(91,46,255,0.12)", icon: "👥" },
                { label: "Active Today", value: stats?.activeToday || 0, color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: "✅" },
                { label: "New This Week", value: stats?.newThisWeek || 0, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "📈" },
                { label: "Platforms", value: stats?.platformBreakdown?.length || 0, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "📱" },
              ].map((stat) => (
                <div className="admin-card" key={stat.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "var(--font-primary)", lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Users */}
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "var(--font-primary)" }}>
              Recent Users
            </h2>
            <div className="admin-card" style={{ overflow: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Email</th><th>Platform</th><th>Niche</th><th>Joined</th><th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{u.username || u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="admin-badge" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>{u.platform || "—"}</span></td>
                      <td>{u.niche || "—"}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className="admin-badge" style={{ background: u.role === "admin" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: u.role === "admin" ? "#f87171" : "#34d399" }}>{u.role || "user"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>No users yet.</div>}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "var(--font-primary)" }}>
                All Users ({users.length})
              </h2>
              <div style={{ position: "relative", minWidth: 260 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>🔍</span>
                <input className="admin-search" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="admin-card" style={{ overflow: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Email</th><th>Platform</th><th>Niche</th><th>Followers</th><th>Joined</th><th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{u.username || u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="admin-badge" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>{u.platform || "—"}</span></td>
                      <td>{u.niche || "—"}</td>
                      <td>{(u.followers || 0).toLocaleString()}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className="admin-badge" style={{ background: u.role === "admin" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: u.role === "admin" ? "#f87171" : "#34d399" }}>{u.role || "user"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>No users found.</div>}
            </div>
          </>
        )}

        {/* Platforms Tab */}
        {activeTab === "platforms" && (
          <>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "var(--font-primary)" }}>Platform Breakdown</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {(stats?.platformBreakdown || []).map((p) => (
                <div className="admin-card" key={p._id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📱</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)" }}>{p.count}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{p._id || "Unknown"}</div>
                  </div>
                </div>
              ))}
              {(!stats?.platformBreakdown || stats.platformBreakdown.length === 0) && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>No data yet.</div>}
            </div>
          </>
        )}

        {/* Niches Tab */}
        {activeTab === "niches" && (
          <>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "var(--font-primary)" }}>Niche Breakdown</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {(stats?.nicheBreakdown || []).map((n) => (
                <div className="admin-card" key={n._id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--font-primary)" }}>{n.count}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{n._id || "Unknown"}</div>
                  </div>
                </div>
              ))}
              {(!stats?.nicheBreakdown || stats.nicheBreakdown.length === 0) && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>No data yet.</div>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
