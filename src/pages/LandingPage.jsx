import { useState, useEffect, useRef } from "react";
import LoadingScreen from "../components/LoadingScreen";

export default function LandingPage({ user, onLoginOpen, onGoToApp }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 → 1 through the omnichannel section
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const omnichannelWrapperRef = useRef(null);
  const marqueeRef            = useRef(null);

  // Nav scroll-state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track mobile breakpoint
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scroll-driven progress: reads actual scroll position — no wheel-jacking
  // Only active on desktop; on mobile we skip the sticky animation
  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      if (!omnichannelWrapperRef.current) return;
      const rect      = omnichannelWrapperRef.current.getBoundingClientRect();
      const wrapperH  = omnichannelWrapperRef.current.offsetHeight;
      const scrollRange = wrapperH - window.innerHeight;
      const scrolled  = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / scrollRange));
      setScrollProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <>
      <div className={`landing-container ${isLoading ? 'loading-transition' : ''}`}>
      
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center">
          <h1 className="landing-logo">VIRALRUSH</h1>
        </div>

        <div className="landing-nav-links" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#pricing">Pricing</a>
        </div>

        {/* Logged-in welcome chip */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: '9999px',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 10, color: '#fff', flexShrink: 0
            }}>
              {(user.username || user.name || 'U')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
              Welcome, <span style={{ fontWeight: 800 }}>{user.username || user.name}</span> 👋
            </span>
          </div>
        )}

        <button 
          className="landing-mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer Overlay Backdrop */}
      <div 
        className={`landing-mobile-drawer-backdrop ${isMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Side Drawer Menu */}
      <div className={`landing-mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="landing-drawer-header">
          <span className="landing-logo">VIRALRUSH</span>
          <button 
            className="landing-drawer-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="landing-drawer-content">
          <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it Works</a>
          <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
        </div>
      </div>


      <div className="landing-main-content">
        <div className="landing-content-wrapper">

          {/* ── Huge headline ── */}
          <div className="landing-headline-vertical">
            <div className="landing-word-automate">
              <span className="landing-outlined-text">AUTOMATE</span>
            </div>
            <div className="landing-word-your">
              <span className="hero-word-solid">YOUR</span>
            </div>
            <div className="landing-word-growth">
              <span className="landing-outlined-text">GROWTH</span>
            </div>
          </div>

          {/* ── Single badge + CTA ── */}
          <div className="hero-bottom-row" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <span style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9999px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.875rem',
              color: 'white',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontWeight: 800 }}>+45%</span> Conversions 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </span>

            <button
              style={{
                background: '#2d2542',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px',
                padding: '0.6rem 1.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => {
                if (user) {
                  onGoToApp && onGoToApp('dashboard');
                } else {
                  onLoginOpen && onLoginOpen('register');
                }
              }}
            >
              {user ? 'Go to Dashboard' : 'Get Started'} &rarr;
            </button>
          </div>

        </div>
      </div>


      <div className="landing-decorative-elements">
        <div className="landing-float-circle landing-float-circle-1"></div>
        <div className="landing-float-circle landing-float-circle-2"></div>
        <div className="landing-float-circle landing-float-circle-3"></div>
        <div className="landing-float-circle landing-float-circle-4"></div>
        <div className="landing-float-circle landing-float-circle-5"></div>
        <div className="landing-float-circle landing-float-circle-6"></div>
        <div className="landing-float-circle landing-float-circle-7"></div>
      </div>

      </div>{/* end .landing-container */}

      {/* ── Omnichannel section — scroll-driven on desktop, static on mobile ── */}
      {isMobile ? (
        /* ── MOBILE: static stacked layout ── */
        <div className="omni-mobile-section">
          {/* Heading */}
          <div className="omni-mobile-heading">
            <h2 className="omni-mobile-h2-gradient">OMNICHANNEL</h2>
            <h2 className="omni-mobile-h2-white">POWER</h2>
            <p className="omni-mobile-desc">
              Stop losing leads in the DMs. VIRALRUSH instantly replies,
              qualifies, and converts your audience.
            </p>
          </div>

          {/* Cards — vertical stack with horizontal scroll on very small screens */}
          <div className="omni-mobile-cards">
            {/* Instagram */}
            <div className="landing-box landing-box-1 omni-card" data-num="01">
              <div className="box-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="6" stroke="#E4405F" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" stroke="#E4405F" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="#E4405F"/>
                </svg>
              </div>
              <h3 className="box-title">Instagram Funnels</h3>
              <p className="box-desc">Setup keyword-triggered flows that instantly reply to comments and send DMs.</p>
              <ul className="box-features">
                <li><span className="check-icon">✓</span> Auto-Reply to Comments</li>
                <li><span className="check-icon">✓</span> Story Mention Triggers</li>
                <li><span className="check-icon">✓</span> Seamless DM Logic</li>
                <li><span className="check-icon">✓</span> Reel Engagement Flows</li>
              </ul>
              <div className="box-glow" />
            </div>

            {/* Facebook */}
            <div className="landing-box landing-box-2 omni-card" data-num="02">
              <div className="box-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="#4267B2"/>
                  <path d="M13.5 8.5H15V6h-1.5C12.12 6 11 7.12 11 8.5V10H9.5v2.5H11V18h2.5v-5.5H15l.5-2.5h-2V8.5z" fill="#fff"/>
                </svg>
              </div>
              <h3 className="box-title">Facebook Reach Engine</h3>
              <p className="box-desc">Best for Ads, Pages &amp; Communities — grow your audience at scale.</p>
              <ul className="box-features">
                <li><span className="check-icon">✓</span> Ad Copy Generator</li>
                <li><span className="check-icon">✓</span> Viral Post Captions</li>
                <li><span className="check-icon">✓</span> Audience Targeting Ideas</li>
                <li><span className="check-icon">✓</span> Schedule Page Posts</li>
              </ul>
              <div className="box-glow" />
            </div>

            {/* YouTube */}
            <div className="landing-box landing-box-3 omni-card" data-num="03">
              <div className="box-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="4" width="22" height="16" rx="5" stroke="#FF4444" strokeWidth="2"/>
                  <path d="M10 9l5 3-5 3V9z" fill="#FF4444"/>
                </svg>
              </div>
              <h3 className="box-title">YouTube Creator Studio</h3>
              <p className="box-desc">Generate hook-driven scripts, SEO titles, and schedule Shorts with one click.</p>
              <ul className="box-features">
                <li><span className="check-icon">✓</span> Hook-Based Script Gen</li>
                <li><span className="check-icon">✓</span> SEO Optimized Titles</li>
                <li><span className="check-icon">✓</span> Thumbnail Text Ideas</li>
                <li><span className="check-icon">✓</span> Upload &amp; Schedule Videos</li>
              </ul>
              <div className="box-glow" />
            </div>
          </div>
        </div>
      ) : (
        /* ── DESKTOP: scroll-driven cinematic animation ── */
        <div ref={omnichannelWrapperRef} style={{ height: '150vh', position: 'relative' }}>
          <div style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg,#0a0a14 0%,#0d0d1f 100%)',
            zIndex: 10
          }}>
            {/* Text block — slides LEFT as scrollProgress 0→1 */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '0 8vw',
              transform: `translateX(${-115 * scrollProgress}%)`,
              willChange: 'transform'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(3rem, 9vw, 130px)',
                fontWeight: 900,
                fontFamily: "var(--font-primary)",
                letterSpacing: '0.04em',
                lineHeight: 1,
                background: 'linear-gradient(135deg,#00e5ff,#7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>OMNICHANNEL</h2>
              <h2 style={{
                margin: '4px 0 24px',
                fontSize: 'clamp(2.5rem, 8vw, 110px)',
                fontWeight: 900,
                fontFamily: "var(--font-primary)",
                letterSpacing: '0.04em',
                lineHeight: 1,
                color: '#fff'
              }}>POWER</h2>
              <p style={{
                margin: 0,
                fontSize: 'clamp(14px, 1.5vw, 20px)',
                color: 'rgba(255,255,255,0.65)',
                fontFamily: "var(--font-ui)",
                maxWidth: 480,
                lineHeight: 1.7
              }}>
                Stop losing leads in the DMs. VIRALRUSH instantly replies,
                qualifies, and converts your audience.
              </p>
            </div>

            {/* Boxes — slide in from RIGHT as scrollProgress 0→1 */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              padding: '0 5vw',
              transform: `translateX(${115 * (1 - scrollProgress)}%)`,
              willChange: 'transform'
            }}>
              {/* Instagram */}
              <div className="landing-box landing-box-1" data-num="01" style={{ flex: 1, minWidth: 0 }}>
                <div className="box-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="6" stroke="#E4405F" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="#E4405F" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="#E4405F"/>
                  </svg>
                </div>
                <h3 className="box-title">Instagram<br/>Funnels</h3>
                <p className="box-desc">Setup keyword-triggered flows that instantly reply to comments and send DMs.</p>
                <ul className="box-features">
                  <li><span className="check-icon">✓</span> Auto-Reply to Comments</li>
                  <li><span className="check-icon">✓</span> Story Mention Triggers</li>
                  <li><span className="check-icon">✓</span> Seamless DM Logic</li>
                  <li><span className="check-icon">✓</span> Reel Engagement Flows</li>
                </ul>
                <div className="box-glow" />
              </div>

              {/* Facebook */}
              <div className="landing-box landing-box-2" data-num="02" style={{ flex: 1, minWidth: 0 }}>
                <div className="box-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="6" fill="#4267B2"/>
                    <path d="M13.5 8.5H15V6h-1.5C12.12 6 11 7.12 11 8.5V10H9.5v2.5H11V18h2.5v-5.5H15l.5-2.5h-2V8.5z" fill="#fff"/>
                  </svg>
                </div>
                <h3 className="box-title">Facebook<br/>Reach Engine</h3>
                <p className="box-desc">Best for Ads, Pages &amp; Communities — grow your audience at scale.</p>
                <ul className="box-features">
                  <li><span className="check-icon">✓</span> Ad Copy Generator</li>
                  <li><span className="check-icon">✓</span> Viral Post Captions</li>
                  <li><span className="check-icon">✓</span> Audience Targeting Ideas</li>
                  <li><span className="check-icon">✓</span> Schedule Page Posts</li>
                </ul>
                <div className="box-glow" />
              </div>

              {/* YouTube */}
              <div className="landing-box landing-box-3" data-num="03" style={{ flex: 1, minWidth: 0 }}>
                <div className="box-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="4" width="22" height="16" rx="5" stroke="#FF4444" strokeWidth="2"/>
                    <path d="M10 9l5 3-5 3V9z" fill="#FF4444"/>
                  </svg>
                </div>
                <h3 className="box-title">YouTube<br/>Creator Studio</h3>
                <p className="box-desc">Generate hook-driven scripts, SEO titles, and schedule Shorts with one click.</p>
                <ul className="box-features">
                  <li><span className="check-icon">✓</span> Hook-Based Script Gen</li>
                  <li><span className="check-icon">✓</span> SEO Optimized Titles</li>
                  <li><span className="check-icon">✓</span> Thumbnail Text Ideas</li>
                  <li><span className="check-icon">✓</span> Upload &amp; Schedule Videos</li>
                </ul>
                <div className="box-glow" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIRALRUSH Marquee Section ── */}
      <div ref={marqueeRef} className="marquee-section">
        {/* Row 1 — VIRAL scrolls left → right */}
        <div className="marquee-row marquee-row-fwd">
          <div className="marquee-track">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="marquee-word marquee-word-outlined">BUILD.VIRALRUSH</span>
            ))}
            {/* duplicate for seamless loop */}
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`d${i}`} className="marquee-word marquee-word-outlined">BUILD.VIRALRUSH</span>
            ))}
          </div>
        </div>

        {/* Row 2 — RUSH scrolls right → left */}
        <div className="marquee-row marquee-row-rev">
          <div className="marquee-track marquee-track-rev">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="marquee-word marquee-word-filled">BUILD.VIRALRUSH</span>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`d${i}`} className="marquee-word marquee-word-filled">BUILD.VIRALRUSH</span>
            ))}
          </div>
        </div>
      </div>{/* end marquee-section */}

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="hiw-section">
        {/* Section label */}
        <div className="hiw-label-row">
          <span className="hiw-label">HOW IT WORKS</span>
        </div>

        <div className="hiw-inner">
          {/* ── Left: Steps ── */}
          <div className="hiw-steps">

            {/* Step 1 */}
            <div className="hiw-step" id="hiw-step-1">
              <div className="hiw-step-num">1</div>
              <div className="hiw-step-content">
                <h3 className="hiw-step-heading">CONNECT YOUR ACCOUNTS</h3>
                <p className="hiw-step-desc">
                  Link your Meta Business Manager and WhatsApp API securely in
                  one click without touching a single line of code.
                </p>
              </div>
            </div>

            {/* Connector line */}
            <div className="hiw-connector" />

            {/* Step 2 */}
            <div className="hiw-step" id="hiw-step-2">
              <div className="hiw-step-num">2</div>
              <div className="hiw-step-content">
                <h3 className="hiw-step-heading">BUILD YOUR FLOW</h3>
                <p className="hiw-step-desc">
                  Drag, drop, and connect nodes to create custom conversational
                  journeys for any keyword logic you can imagine.
                </p>
              </div>
            </div>

            {/* Connector line */}
            <div className="hiw-connector" />

            {/* Step 3 */}
            <div className="hiw-step" id="hiw-step-3">
              <div className="hiw-step-num">3</div>
              <div className="hiw-step-content">
                <h3 className="hiw-step-heading">WATCH SALES GROW</h3>
                <p className="hiw-step-desc">
                  Launch the automation and convert your organic traffic into
                  revenue directly inside WhatsApp and Instagram DMs.
                </p>
              </div>
            </div>

          </div>

          {/* ── Right: Flow Diagram Box ── */}
          <div className="hiw-flow-card" id="hiw-flow-card">
            {/* Card header */}
            <div className="hiw-flow-header">
              <span className="hiw-flow-title">ABANDONED CART FLOW</span>
              <span className="hiw-flow-status">
                <span className="hiw-flow-dot" />
                Active
              </span>
            </div>

            {/* Trigger node — hover: electric ripple */}
            <div className="hiw-node hiw-node-trigger hiw-node-anim-trigger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Keyword: "CART"
            </div>

            {/* Vertical connector */}
            <div className="hiw-flow-line" />

            {/* Message node — hover: shimmer sweep */}
            <div className="hiw-node hiw-node-message hiw-node-anim-message">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Send Message: "Hi! Did you forget something?"
            </div>

            {/* Vertical connector */}
            <div className="hiw-flow-line" />

            {/* Branch nodes */}
            <div className="hiw-branch-row">
              <div className="hiw-branch-line hiw-branch-left" />
              <div className="hiw-branch-line hiw-branch-right" />
            </div>
            <div className="hiw-node-row">
              {/* Branch 1 — hover: bounce-up + green */}
              <div className="hiw-node hiw-node-branch hiw-node-anim-clicks">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                If: Clicks Link
              </div>
              {/* Branch 2 — hover: shake + red tint */}
              <div className="hiw-node hiw-node-branch hiw-node-anim-noresp">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                If: No Response
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <PricingSection onLoginOpen={onLoginOpen} user={user} onGoToApp={onGoToApp} />

      {/* ── Footer ── */}
      <LandingFooter />

    </>
  );
}

/* ── Footer component ── */
function LandingFooter() {
  const cols = [
    {
      heading: 'Product',
      links: ['Features', 'Integrations', 'Pricing', 'Changelog'],
    },
    {
      heading: 'Company',
      links: ['About Us', 'Careers', 'Blog', 'Contact'],
    },
    {
      heading: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    },
  ];

  const socials = [
    {
      label: 'Twitter',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: 'Instagram',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      ),
    },
    {
      label: 'GitHub',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="lf-footer">
      <div className="lf-inner">

        {/* ── Left brand column ── */}
        <div className="lf-brand">
          <span className="lf-logo">VIRALRUSH</span>
          <p className="lf-tagline">
            We build intelligent software that scales<br />
            your business while you sleep.
          </p>
          <div className="lf-socials">
            {socials.map(s => (
              <a
                key={s.label}
                href="#"
                className="lf-social-icon"
                aria-label={s.label}
                title={s.label}
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>

        {/* ── Right link columns ── */}
        <nav className="lf-nav-cols">
          {cols.map(col => (
            <div key={col.heading} className="lf-col">
              <h4 className="lf-col-heading">{col.heading}</h4>
              <ul className="lf-col-list">
                {col.links.map(link => (
                  <li key={link} className="lf-col-item">
                    <a href="#" className="lf-col-link">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

      </div>

      {/* ── Bottom bar ── */}
      <div className="lf-bottom">
        <span>© 2026 ViralRush Inc. All rights reserved.</span>
      </div>
    </footer>
  );
}

/* ── Pricing sub-component (kept in same file for simplicity) ── */
function PricingSection({ onLoginOpen, user, onGoToApp }) {
  const [yearly, setYearly] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  // Trigger rise-up animation when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Perfect for small stores starting with automation.',
      monthly: 39,
      annualMonthly: 33,
      annualTotal: 396,
      cta: 'Get Started',
      popular: false,
      included: [
        { text: 'Up to 1,000 active contacts',       yes: true  },
        { text: 'Basic Visual Flow Builder',          yes: true  },
        { text: 'Instagram DM Automation',            yes: true  },
        { text: 'Standard Support',                   yes: true  },
        { text: 'Basic Analytics',                    yes: true  },
        { text: 'WhatsApp Campaigns',                 yes: false },
        { text: 'Advanced Audience Segmentation',     yes: false },
        { text: 'Custom Webhooks',                    yes: false },
        { text: 'Dedicated Account Manager',          yes: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Everything you need to scale your omnichannel sales.',
      monthly: 99,
      annualMonthly: 83,
      annualTotal: 996,
      cta: 'Get Started',
      popular: true,
      included: [
        { text: 'Up to 10,000 active contacts',       yes: true  },
        { text: 'Advanced Visual Flow Builder',       yes: true  },
        { text: 'Instagram DM Automation',            yes: true  },
        { text: 'WhatsApp Campaigns',                 yes: true  },
        { text: 'Advanced Audience Segmentation',     yes: true  },
        { text: 'Priority Support',                   yes: true  },
        { text: 'Advanced ROI Analytics',             yes: true  },
        { text: 'Custom Webhooks',                    yes: false },
        { text: 'Dedicated Account Manager',          yes: false },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'Custom limits and dedicated support for large teams.',
      monthly: 299,
      annualMonthly: 249,
      annualTotal: 2988,
      cta: 'Get Started',
      popular: false,
      included: [
        { text: 'Unlimited active contacts',          yes: true  },
        { text: 'Everything in Pro',                  yes: true  },
        { text: 'Custom Webhooks & Integrations',     yes: true  },
        { text: 'Dedicated Account Manager',          yes: true  },
        { text: '24/7 Phone Support',                 yes: true  },
        { text: 'Custom Onboarding',                  yes: true  },
        { text: 'A/B Testing Nodes',                  yes: true  },
      ],
    },
  ];

  const handleCta = () => {
    if (user) onGoToApp && onGoToApp('dashboard');
    else onLoginOpen && onLoginOpen('register');
  };

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className={`pricing-section ${visible ? 'pricing-visible' : ''}`}
    >
      {/* Radial glow backdrop */}
      <div className="pricing-bg-glow" />

      {/* Header */}
      <div className="pricing-header">
        <h2
          className="pricing-title pricing-rise"
          style={{ animationDelay: '0ms' }}
        >
          Simple, Transparent Pricing
        </h2>
        <p
          className="pricing-subtitle pricing-rise"
          style={{ animationDelay: '120ms' }}
        >
          Choose the plan that fits your growth stage.&nbsp;
          <span className="pricing-subtitle-accent">No hidden fees.</span>
        </p>

        {/* Billing toggle */}
        <div
          className="pricing-toggle-row pricing-rise"
          style={{ animationDelay: '220ms' }}
        >
          <span className={`pricing-toggle-label ${!yearly ? 'active' : ''}`}>Monthly billing</span>
          <button
            id="pricing-billing-toggle"
            className={`pricing-toggle-btn ${yearly ? 'yearly' : ''}`}
            onClick={() => setYearly(v => !v)}
            aria-label="Toggle billing period"
          >
            <span className="pricing-toggle-knob" />
          </button>
          <span className={`pricing-toggle-label ${yearly ? 'active' : ''}`}>
            Yearly billing
            <span className="pricing-save-badge">SAVE 20%</span>
          </span>
        </div>
      </div>

      {/* Cards — each rises with a staggered delay */}
      <div className="pricing-cards">
        {plans.map((plan, idx) => (
          <div
            key={plan.id}
            className={`pricing-card pricing-rise ${plan.popular ? 'pricing-card-popular' : ''}`}
            id={`pricing-card-${plan.id}`}
            style={{ animationDelay: `${340 + idx * 130}ms` }}
          >
            {plan.popular && (
              <div className="pricing-popular-badge">MOST POPULAR</div>
            )}

            <h3 className="pricing-plan-name">{plan.name}</h3>
            <p className="pricing-plan-tagline">{plan.tagline}</p>

            <div className="pricing-price-row">
              <span className="pricing-dollar">$</span>
              <span className="pricing-amount">
                {yearly ? plan.annualMonthly : plan.monthly}
              </span>
              <span className="pricing-per">/mo</span>
            </div>

            {yearly && (
              <p className="pricing-billed-note">
                Billed annually at ${plan.annualTotal}
              </p>
            )}

            <button
              className={`pricing-cta-btn ${plan.popular ? 'pricing-cta-popular' : ''}`}
              onClick={handleCta}
              id={`pricing-cta-${plan.id}`}
            >
              {plan.cta}
            </button>

            <div className="pricing-divider" />

            <p className="pricing-whats-included">What's included:</p>
            <ul className="pricing-features">
              {plan.included.map((item, i) => (
                <li key={i} className={`pricing-feature-item ${item.yes ? 'yes' : 'no'}`}>
                  {item.yes ? (
                    <svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="pricing-cross" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  )}
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

