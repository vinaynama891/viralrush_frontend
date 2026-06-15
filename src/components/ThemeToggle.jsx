import { useEffect } from "react";

// Light-mode-only: always remove the .dark class and clear any saved preference.
export default function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("viralrush_theme");
  }, []);

  // No visible button — light mode is locked.
  return null;
}
