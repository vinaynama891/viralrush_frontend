import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Hide the native cursor globally
    document.documentElement.style.cursor = "none";

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };

      // Move the small dot instantly
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    const onEnter = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const role = e.target.getAttribute("role");
      const isInteractive =
        tag === "button" ||
        tag === "a" ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "label" ||
        role === "button" ||
        e.target.classList.contains("snav-btn") ||
        e.target.closest("button") ||
        e.target.closest("a") ||
        e.target.style.cursor === "pointer" ||
        window.getComputedStyle(e.target).cursor === "pointer";

      if (isInteractive) setIsHovering(true);
    };

    const onLeave = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const role = e.target.getAttribute("role");
      const isInteractive =
        tag === "button" ||
        tag === "a" ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "label" ||
        role === "button" ||
        e.target.classList.contains("snav-btn") ||
        e.target.closest("button") ||
        e.target.closest("a") ||
        e.target.style.cursor === "pointer" ||
        window.getComputedStyle(e.target).cursor === "pointer";

      if (isInteractive) setIsHovering(false);
    };

    // Smooth-follow animation for the ring
    const animate = () => {
      const speed = 0.12;
      ringPos.current.x += (pos.current.x - ringPos.current.x) * speed;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * speed;

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Small dot — follows instantly */}
      <div
        ref={cursorDotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #5b2eff, #a78bfa)",
          pointerEvents: "none",
          zIndex: 999999,
          transition: "opacity 0.2s",
          boxShadow: "0 0 8px rgba(91,46,255,0.8)",
        }}
      />

      {/* Trailing ring — lags behind smoothly */}
      <div
        ref={cursorRingRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? 52 : 32,
          height: isHovering ? 52 : 32,
          borderRadius: "50%",
          border: `2px solid ${isHovering ? "rgba(167,139,250,0.9)" : "rgba(91,46,255,0.6)"}`,
          background: isHovering ? "rgba(91,46,255,0.08)" : "transparent",
          pointerEvents: "none",
          zIndex: 999998,
          transition: "width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s, background 0.25s",
          boxShadow: isHovering
            ? "0 0 18px rgba(91,46,255,0.35), inset 0 0 12px rgba(91,46,255,0.1)"
            : "0 0 6px rgba(91,46,255,0.2)",
        }}
      />

      <style>{`
        * { cursor: none !important; }
      `}</style>
    </>
  );
}
