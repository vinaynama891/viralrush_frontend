import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket]                 = useState(null);
  const [communityToast, setCommunityToast] = useState(null);
  const onlineUsersRef                      = useRef(new Set());

  // Stable isOnline — never causes re-renders in consumers
  const isOnline = useCallback(
    (uid) => onlineUsersRef.current.has(uid?.toString?.() ?? uid),
    []
  );

  useEffect(() => {
    if (!user) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }
    const token = localStorage.getItem("viralrush_token");
    const base  = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
    const s     = io(base, { auth: { token } });

    s.on("online_users", (users) => {
      onlineUsersRef.current = new Set(users.map(String));
    });
    s.on("community_created", ({ community, message }) => {
      setCommunityToast({ text: message, communityId: community._id });
      setTimeout(() => setCommunityToast(null), 5000);
    });
    s.on("request_rejected", ({ message }) => {
      setCommunityToast({ text: message, type: "error" });
      setTimeout(() => setCommunityToast(null), 5000);
    });

    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isOnline, communityToast, setCommunityToast }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext) ?? { socket: null, isOnline: () => false, communityToast: null, setCommunityToast: () => {} };
}
