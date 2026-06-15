import { useState, useEffect } from "react";
import api from "@/lib/api";
import ConnectInstagramButton from "@/components/instagram/ConnectInstagramButton";

// Helper function to crop image to specific aspect ratio (center-cropped)
const cropImageToAspectRatio = (img, targetRatio) => {
  const canvas = document.createElement("canvas");
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  const imgRatio = imgWidth / imgHeight;

  let drawWidth, drawHeight, cropX, cropY;

  if (imgRatio > targetRatio) {
    // Image is wider than target ratio
    drawHeight = imgHeight;
    drawWidth = imgHeight * targetRatio;
    cropX = (imgWidth - drawWidth) / 2;
    cropY = 0;
  } else {
    // Image is taller than target ratio
    drawWidth = imgWidth;
    drawHeight = imgWidth / targetRatio;
    cropX = 0;
    cropY = (imgHeight - drawHeight) / 2;
  }

  // Crisp high-resolution size
  const targetWidth = Math.min(1200, drawWidth);
  const targetHeight = targetWidth / targetRatio;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, cropX, cropY, drawWidth, drawHeight, 0, 0, targetWidth, targetHeight);
  return canvas;
};

export default function CreatePostPage({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Form states
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("IMAGE");
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error | scheduled
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Schedule states
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(""); // datetime-local string

  // Instagram aspect ratio variations (POVs)
  const [povOptions, setPovOptions] = useState([]);
  const [selectedPov, setSelectedPov] = useState("");

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/instagram/profile");
      if (res.data?.isConnected) {
        setIsConnected(true);
        setProfile(res.data.profile);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error("Failed to fetch Instagram profile for posting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    const isVideo = f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name);
    setMediaType(isVideo ? "REEL" : "IMAGE");
    setFile(f);
    
    const objectUrl = URL.createObjectURL(f);
    setPreview(objectUrl);
    setErrorMsg("");

    if (!isVideo) {
      // Process image to generate 3 POVs instantly: 1:1, 9:16, and Free Size
      const img = new Image();
      img.onload = () => {
        const sqCanvas = cropImageToAspectRatio(img, 1);
        const vertCanvas = cropImageToAspectRatio(img, 9 / 16);
        const freeCanvas = cropImageToAspectRatio(img, img.naturalWidth / img.naturalHeight);

        const sqUrl = sqCanvas.toDataURL("image/jpeg", 0.95);
        const vertUrl = vertCanvas.toDataURL("image/jpeg", 0.95);
        const freeUrl = freeCanvas.toDataURL("image/jpeg", 0.95);

        const povs = [
          {
            id: "square",
            label: "Square (1:1)",
            ratio: "1:1",
            resolution: "1080 x 1080",
            dataUrl: sqUrl,
            canvas: sqCanvas
          },
          {
            id: "vertical",
            label: "Vertical (9:16)",
            ratio: "9:16",
            resolution: "1080 x 1920",
            dataUrl: vertUrl,
            canvas: vertCanvas
          },
          {
            id: "free",
            label: "Free Size",
            ratio: "Original",
            resolution: `${img.naturalWidth} x ${img.naturalHeight}`,
            dataUrl: freeUrl,
            canvas: freeCanvas
          }
        ];

        setPovOptions(povs);
        setSelectedPov("square");
        setPreview(sqUrl); // Set the default visual preview to square
      };
      img.src = objectUrl;
    } else {
      setPovOptions([]);
      setSelectedPov("");
    }
  };

  const selectPovOption = (povId) => {
    setSelectedPov(povId);
    const opt = povOptions.find(p => p.id === povId);
    if (opt) {
      setPreview(opt.dataUrl);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPreview(null);
    setPovOptions([]);
    setSelectedPov("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMsg("Please select or drop an image or video first.");
      return;
    }

    if (scheduleEnabled) {
      if (!scheduledAt) {
        setErrorMsg("Please pick a date and time to schedule your post.");
        return;
      }
      const schedDate = new Date(scheduledAt);
      if (schedDate <= new Date()) {
        setErrorMsg("Scheduled time must be in the future.");
        return;
      }
    }

    let progressInterval = null;

    try {
      setStatus("uploading");
      setErrorMsg("");
      setUploadProgress(0);

      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += (96 - currentProgress) * 0.12;
        setUploadProgress(Math.round(currentProgress));
      }, 400);

      // Convert the selected POV canvas to a blob file before uploading
      let fileToUpload = file;
      if (mediaType === "IMAGE" && selectedPov && povOptions.length > 0) {
        const activePov = povOptions.find(p => p.id === selectedPov);
        if (activePov) {
          fileToUpload = await new Promise((resolve, reject) => {
            activePov.canvas.toBlob((blob) => {
              if (!blob) { reject(new Error("Failed to process selected POV cropped image.")); return; }
              const extension = file.type === "image/png" ? ".png" : ".jpg";
              const name = file.name.replace(/\.[^/.]+$/, "") + `_${selectedPov}${extension}`;
              const croppedFile = new File([blob], name, { type: file.type || "image/jpeg" });
              resolve(croppedFile);
            }, file.type || "image/jpeg", 0.95);
          });
        }
      }

      const form = new FormData();
      form.append("file", fileToUpload);
      form.append("caption", caption);
      form.append("media_type", mediaType);

      if (scheduleEnabled) {
        // Schedule mode — upload media to CDN + save to DB, don't publish yet
        form.append("scheduledAt", new Date(scheduledAt).toISOString());
        await api.post("/instagram/schedule", form, { headers: { "Content-Type": "multipart/form-data" } });
        if (progressInterval) clearInterval(progressInterval);
        setUploadProgress(100);
        setStatus("scheduled");
        setTimeout(() => {
          handleClearFile();
          setCaption("");
          setScheduleEnabled(false);
          setScheduledAt("");
          setStatus("idle");
          setUploadProgress(0);
        }, 3000);
      } else {
        // Immediate publish mode
        await api.post("/instagram/publish", form, { headers: { "Content-Type": "multipart/form-data" } });
        if (progressInterval) clearInterval(progressInterval);
        setUploadProgress(100);
        setStatus("success");
        setTimeout(() => {
          handleClearFile();
          setCaption("");
          setStatus("idle");
          setUploadProgress(0);
          if (onBack) onBack();
        }, 2000);
      }
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(0);
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || err.message || "Failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(236,72,153,0.15)", borderTopColor: "#ec4899", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, textAlign: "center", padding: 40 }}>
        <div style={{ width: 90, height: 90, borderRadius: 24, background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(236,72,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: "0 10px 30px rgba(236,72,153,0.1)" }}>
          📸
        </div>
        <div>
          <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "var(--font-primary)" }}>Instagram Connection Required</h2>
          <p style={{ margin: 0, fontSize: 14.5, color: "rgba(255,255,255,0.45)", maxWidth: 420, lineHeight: 1.7, fontFamily: "var(--font-ui)" }}>
            To publish direct posts and reels from ViralRush, you first need to link your Instagram Professional/Business account.
          </p>
        </div>
        <div style={{ marginTop: 8 }}>
          <ConnectInstagramButton onLoadingStateChange={(loadingState) => setLoading(loadingState)} />
        </div>
        <button
          onClick={onBack}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 24px", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff", fontFamily: "var(--font-ui)", padding: "70px 40px 80px" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(236, 72, 153, 0.35); } 50% { box-shadow: 0 0 28px rgba(236, 72, 153, 0.6); } }
        .create-post-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          max-width: 1100px;
          margin: 0 auto;
          animation: fadeUp 0.4s ease;
        }
        @media (max-width: 900px) {
          .create-post-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
        .form-card {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }
        .preview-pane {
          position: sticky;
          top: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .instagram-mockup {
          background: #000;
          border: 1px solid #262626;
          border-radius: 12px;
          width: 100%;
          max-width: 360px;
          overflow: hidden;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6);
        }
        .mock-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-bottom: 1px solid #1a1a1a;
        }
        .mock-media-box {
          background: #121212;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .mock-media-box img, .mock-media-box video {
          width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
        }
        .mock-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px 8px;
        }
        .mock-likes {
          font-weight: 700;
          font-size: 13.5px;
          color: #fff;
          padding: 0 14px;
          margin-bottom: 6px;
        }
        .mock-caption-box {
          padding: 0 14px 16px;
          font-size: 13.5px;
          line-height: 1.5;
          color: #f5f5f5;
        }
      `}</style>

      {/* Header section */}
      <div style={{ maxWidth: 1100, margin: "0 auto 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f472b6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>INSTAGRAM PUBLISHING</div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", fontFamily: "var(--font-primary)" }}>
            Create Instagram Post
          </h1>
        </div>
        <button
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 16px", color: "rgba(255,255,255,0.7)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
      </div>

      <div className="create-post-grid">
        {/* Left Column: Form */}
        <div className="form-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Creator Account Info Banner */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 18px", borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.username} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #ec4899, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                    {profile?.username?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>@{profile?.username}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Professional Account · Connected</div>
                </div>
              </div>
              <span style={{ marginLeft: "auto", background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 9.5, fontWeight: 700, color: "#f472b6", textTransform: "uppercase" }}>Instagram</span>
            </div>

            {/* Media Type Selection */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Media Type</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { key: "IMAGE", label: "🖼️ Standard Photo", desc: "Single photo post" },
                  { key: "REEL", label: "🎬 Instagram Reel", desc: "Short video post" }
                ].map(t => {
                  const active = mediaType === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => {
                        setMediaType(t.key);
                        // If file contradicts selection, clear file to avoid issue
                        if (file) {
                          const isVid = file.type.startsWith("video/");
                          if ((t.key === "IMAGE" && isVid) || (t.key === "REEL" && !isVid)) {
                            setFile(null);
                            setPreview(null);
                          }
                        }
                      }}
                      style={{
                        flex: 1, padding: "12px 16px", borderRadius: 12, textAlign: "left",
                        border: `1.5px solid ${active ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.06)"}`,
                        background: active ? "rgba(236,72,153,0.08)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13, color: active ? "#f472b6" : "#fff", marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Upload File</label>
              {preview ? (
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {mediaType === "REEL" ? (
                    <video src={preview} controls muted style={{ width: "100%", maxHeight: 260, objectFit: "contain" }} />
                  ) : (
                    <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 260, objectFit: "contain" }} />
                  )}
                  <button
                    onClick={handleClearFile}
                    style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.75)", border: "none", borderRadius: 8, color: "#fff", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.75)"}
                  >✕</button>
                </div>
              ) : (
                <label
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                    borderRadius: 14, border: `2.5px dashed ${dragOver ? "#ec4899" : "rgba(255,255,255,0.1)"}`,
                    background: dragOver ? "rgba(236,72,153,0.06)" : "rgba(255,255,255,0.01)",
                    padding: "44px 24px", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = dragOver ? "#ec4899" : "rgba(255,255,255,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = dragOver ? "#ec4899" : "rgba(255,255,255,0.1)"}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(236,72,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#ec4899" }}>
                    {mediaType === "REEL" ? "🎬" : "🖼️"}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                      Select or drop your {mediaType === "REEL" ? "video file" : "image file"} here
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}>
                      Allows {mediaType === "REEL" ? "MP4, MOV (up to 100MB)" : "JPG, PNG (up to 100MB)"}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept={mediaType === "REEL" ? "video/*" : "image/*"}
                    style={{ display: "none" }}
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {/* Select Instagram POV Aspect Grid */}
            {mediaType === "IMAGE" && povOptions.length > 0 && (
              <div style={{ animation: "fadeUp 0.35s ease", width: "100%" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>
                  Select Instagram POV (Aspect Ratio)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {povOptions.map(p => {
                    const active = selectedPov === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => selectPovOption(p.id)}
                        style={{
                          background: "#1c1c1c",
                          border: `2px solid ${active ? "#ec4899" : "rgba(255,255,255,0.05)"}`,
                          borderRadius: 16,
                          padding: 12,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 10,
                          boxShadow: active ? "0 0 20px rgba(236,72,153,0.25)" : "none",
                          transform: active ? "translateY(-4px)" : "none",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          position: "relative",
                          overflow: "hidden"
                        }}
                        onMouseEnter={e => {
                          if (!active) {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                            e.currentTarget.style.transform = "none";
                          }
                        }}
                      >
                        {/* Aspect container */}
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: p.id === "square" ? "1/1" : p.id === "vertical" ? "9/16" : `${p.canvas.width}/${p.canvas.height}`,
                            maxHeight: 100,
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "#0c0c0c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img
                            src={p.dataUrl}
                            alt={p.label}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        </div>

                        {/* Labels */}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 850, color: active ? "#f472b6" : "#fff", marginBottom: 2, whiteSpace: "nowrap" }}>
                            {p.label.split(" ")[0]} {p.ratio}
                          </div>
                          <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                            {p.resolution}
                          </div>
                        </div>

                        {/* Selection indicator pill */}
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: active ? "#ec4899" : "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            width: 18,
                            height: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            color: "#fff",
                            border: active ? "none" : "1px solid rgba(255,255,255,0.15)",
                            transition: "all 0.2s"
                          }}
                        >
                          {active ? "✓" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Caption Textarea */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Caption</label>
                <span style={{ fontSize: 11, color: caption.length > 2000 ? "#ef4444" : "rgba(255,255,255,0.3)" }}>{caption.length}/2200</span>
              </div>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Compose a stunning caption… Use hashtags #viral #trending and tag @accounts"
                maxLength={2200}
                rows={5}
                style={{ width: "100%", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 13.5, fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color 0.25s", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "rgba(236,72,153,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            {/* ── Schedule for Later ─────────────────────────── */}
            <div style={{ background: scheduleEnabled ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.02)", border: `1.5px solid ${scheduleEnabled ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: "16px 18px", transition: "all 0.25s" }}>
              {/* Toggle row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: scheduleEnabled ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "background 0.2s" }}>🗓️</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: scheduleEnabled ? "#c4b5fd" : "#fff" }}>Schedule for Later</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Pick a date &amp; time — we'll auto-publish it</div>
                  </div>
                </div>
                {/* Toggle switch */}
                <div
                  onClick={() => { setScheduleEnabled(s => !s); if (scheduleEnabled) setScheduledAt(""); }}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: scheduleEnabled ? "#7c3aed" : "rgba(255,255,255,0.12)",
                    position: "relative", cursor: "pointer", transition: "background 0.25s",
                    flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3,
                    left: scheduleEnabled ? 22 : 3,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left 0.22s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.4)"
                  }} />
                </div>
              </div>

              {/* Datetime picker — shown when toggle is on */}
              {scheduleEnabled && (
                <div style={{ marginTop: 14, animation: "fadeUp 0.2s ease" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Publish Date &amp; Time</label>
                  <input
                    id="schedule-datetime"
                    type="datetime-local"
                    value={scheduledAt}
                    min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                    onChange={e => setScheduledAt(e.target.value)}
                    style={{
                      width: "100%", background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(139,92,246,0.35)",
                      borderRadius: 10, padding: "11px 14px",
                      color: "#fff", fontSize: 13.5,
                      fontFamily: "inherit", outline: "none",
                      boxSizing: "border-box", colorScheme: "dark"
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.7)"}
                    onBlur={e => e.target.style.borderColor = "rgba(139,92,246,0.35)"}
                  />
                  {scheduledAt && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#a78bfa", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>⏰</span>
                      <span>Will publish on <strong>{new Date(scheduledAt).toLocaleString()}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {status === "success" && (
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#34d399", display: "flex", alignItems: "center", gap: 8 }}>
                <span>✅</span>
                <span>Successfully published to Instagram! Closing page…</span>
              </div>
            )}

            {/* Upload Progress Bar */}
            {status === "uploading" && (
              <div style={{ animation: "fadeUp 0.3s ease", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f472b6" }}>Uploading Media...</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{uploadProgress}%</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
                      borderRadius: 10,
                      boxShadow: "0 0 10px rgba(236,72,153,0.5)",
                      transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={status === "uploading" || status === "success" || status === "scheduled"}
              style={{
                width: "100%",
                background: status === "uploading"
                  ? (scheduleEnabled ? "rgba(139,92,246,0.4)" : "rgba(236,72,153,0.4)")
                  : scheduleEnabled
                    ? "linear-gradient(135deg, #7c3aed, #5b2eff)"
                    : "linear-gradient(135deg, #ec4899, #8b5cf6)",
                border: "none", borderRadius: 12, padding: "15px 0", color: "#fff",
                fontSize: 14, fontWeight: 800,
                cursor: (status === "uploading" || status === "success" || status === "scheduled") ? "not-allowed" : "pointer",
                boxShadow: scheduleEnabled ? "0 8px 30px rgba(124,58,237,0.4)" : "0 8px 30px rgba(236,72,153,0.3)",
                transition: "all 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                animation: status === "uploading" ? "pulseGlow 1.5s infinite" : "none"
              }}
              onMouseEnter={e => { if (status === "idle") { e.currentTarget.style.transform = "translateY(-2px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {status === "uploading" ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span>{scheduleEnabled ? "Scheduling Post…" : "Publishing to Instagram…"}</span>
                </>
              ) : status === "success" ? (
                <span>✅ Published Successfully!</span>
              ) : status === "scheduled" ? (
                <span>🗓️ Post Scheduled!</span>
              ) : scheduleEnabled ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>Schedule Post</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <span>Publish Post Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="preview-pane">
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Live Instagram Mockup</div>
          <div className="instagram-mockup">
            {/* Header of Post */}
            <div className="mock-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt="Mock Avatar" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #ec4899, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>
                    {profile?.username?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>{profile?.username || "creator_name"}</span>
                  <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Sponsored</div>
                </div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, cursor: "pointer", fontWeight: "bold" }}>•••</div>
            </div>

            {/* Media Content Box */}
            <div className="mock-media-box">
              {preview ? (
                mediaType === "REEL" ? (
                  <video src={preview} autoPlay loop muted playsInline />
                ) : (
                  <img src={preview} alt="Mock Content" />
                )
              ) : (
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 28 }}>{mediaType === "REEL" ? "🎬" : "🖼️"}</span>
                  <span>Upload media to preview</span>
                </div>
              )}

              {/* Reels icon indicator */}
              {mediaType === "REEL" && (
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.6)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  🎬
                </div>
              )}
            </div>

            {/* Interaction Bar */}
            <div className="mock-actions">
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{ fontSize: 18, color: "#fff", cursor: "pointer" }}>🤍</span>
                <span style={{ fontSize: 18, color: "#fff", cursor: "pointer" }}>💬</span>
                <span style={{ fontSize: 18, color: "#fff", cursor: "pointer" }}>✈️</span>
              </div>
              <span style={{ fontSize: 18, color: "#fff", cursor: "pointer" }}>📥</span>
            </div>

            {/* Likes */}
            <div className="mock-likes">
              {profile?.followersCount ? (Math.ceil(profile.followersCount * 0.08)).toLocaleString() : "1,248"} likes
            </div>

            {/* Caption & Hashtags */}
            <div className="mock-caption-box">
              <span style={{ fontWeight: 700, marginRight: 6 }}>{profile?.username || "creator_name"}</span>
              <span style={{ whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.9)" }}>
                {caption ? caption : "Your caption will appear here in real-time as you compose it. Adding hashtags like #viralrush will look beautiful! ✨"}
              </span>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                Just now · Translate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
