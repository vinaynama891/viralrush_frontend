import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("viralrush_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("viralrush_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const res = await api.post("/auth/login", payload);
    if (res.data.token) {
      localStorage.setItem("viralrush_token", res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const signup = async (payload) => {
    const res = await api.post("/auth/signup", payload);
    if (res.data.token) {
      localStorage.setItem("viralrush_token", res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const verifySignupOTP = async (payload) => {
    const res = await api.post("/auth/verify-signup-otp", payload);
    if (res.data.token) {
      localStorage.setItem("viralrush_token", res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const verifyLoginOTP = async (payload) => {
    const res = await api.post("/auth/verify-login-otp", payload);
    if (res.data.token) {
      localStorage.setItem("viralrush_token", res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("viralrush_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifySignupOTP, verifyLoginOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
