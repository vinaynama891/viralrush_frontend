import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

export default function Sidebar({ sections, active, onChange }) {
  const [pendingCount, setPendingCount] = useState(0);
  const { socket } = useSocket() || {};

  useEffect(() => {
    api.get("/community/notifications")
      .then((r) => {
        const pending = r.data.filter((n) => n.status === "pending").length;
        setPendingCount(pending);
      })
      .catch(() => {});
  }, []);

  // Real-time badge increment
  useEffect(() => {
    if (!socket) return;
    const h = () => setPendingCount((p) => p + 1);
    socket.on("new_community_request", h);
    return () => socket.off("new_community_request", h);
  }, [socket]);

  return (
    <aside className="w-full lg:w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
      <h1 className="text-2xl font-bold text-indigo-600 mb-6">Viralrush</h1>
      <nav className="space-y-2">
        {sections.map((section) => {
          const isActive = active === section.key;
          const showBadge = section.key === "notifications" && pendingCount > 0;
          return (
            <button
              key={section.key}
              id={`sidebar-${section.key}`}
              onClick={() => {
                onChange(section.key);
                if (section.key === "notifications") setPendingCount(0);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span>{section.label}</span>
              {showBadge && (
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.3)" : "#ef4444",
                  color: "#fff", borderRadius: 20,
                  padding: "1px 7px", fontSize: 11, fontWeight: 700, lineHeight: "18px"
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
