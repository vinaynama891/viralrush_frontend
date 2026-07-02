import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 600000, // 10 minutes — supports large Reel CDN uploads + Meta transcoding time
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("viralrush_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getProxiedImage = (url) => {
  if (!url || url.includes("1611162617474")) {
    return "/viralrush_logo_placeholder.png";
  }
  // If it's an Instagram cdn or facebook cdn URL, proxy it to bypass CORS/hotlinking
  if (url.includes("cdninstagram.com") || url.includes("fbcdn.net")) {
    const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
    return `${baseURL}/instagram/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export default api;
