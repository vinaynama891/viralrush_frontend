import { useState, useEffect } from 'react';

const LETTERS = [
  { letter: 'V', word: 'Viral'     },
  { letter: 'I', word: 'Influence' },
  { letter: 'R', word: 'Reach'     },
  { letter: 'A', word: 'Audience'  },
  { letter: 'L', word: 'Launch'    },
  { letter: 'R', word: 'Rush'      },
  { letter: 'U', word: 'Unique'    },
  { letter: 'S', word: 'Success'   },
  { letter: 'H', word: 'Hustle'    },
];

const SENTENCE = 'Helping creators launch unique content that reaches audiences fast and goes viral';
const CSS = `
  @keyframes slideInFromLeft {
    0%   { transform: translate(calc(-50% - 110vw), -50%); }
    100% { transform: translate(-50%, -50%); }
  }
  @keyframes letterExpand {
    0%   { transform: translateY(0) scale(1); }
    50%  { transform: translateY(-6px) scale(1.25); }
    100% { transform: translateY(0) scale(1); }
  }
  @keyframes wordSlideDown {
    0%   { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes wordsMerge {
    0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0px); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); filter: blur(12px); }
  }
  @keyframes sentenceReveal {
    0%   { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) scale(0.9); filter: blur(10px); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0px); }
  }
  @keyframes titleGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(167,139,250,0.5); }
    50%       { text-shadow: 0 0 45px rgba(167,139,250,0.9), 0 0 80px rgba(167,139,250,0.3); }
  }
  @keyframes lineExpand {
    0%   { width: 0; opacity: 0; }
    100% { width: clamp(60px, 15vw, 120px); opacity: 1; }
  }
  @keyframes screenOut {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes progressFill {
    0%   { width: 0%; }
    100% { width: 100%; }
  }
  @keyframes wordSlideLeft {
    0%   { opacity: 0; transform: translateX(-10px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @media (max-width: 600px) {
    .letters-container {
      flex-direction: column !important;
      align-items: center !important;
      gap: 28px !important;
    }
    .letters-row {
      flex-direction: row !important;
      align-items: flex-end !important;
      justify-content: center !important;
      gap: clamp(4px, 2.5vw, 12px) !important;
    }
    .letter-item {
      flex-direction: column !important;
      align-items: center !important;
      gap: 3px !important;
    }
    .letter-word-wrapper {
      min-height: 1.2em !important;
      animation-name: wordSlideDown !important;
    }
    .letter-word-wrapper span {
      font-size: clamp(0.4rem, 1.8vw, 0.6rem) !important;
    }
    .letter-text {
      font-size: clamp(1.6rem, 7vw, 2.6rem) !important;
    }
  }
`;

// Timing plan (ms)
const T_SLIDE_END    = 1600;   // slide completes
const T_LETTER_START = 1700;   // start expanding letters
const T_PER_LETTER   = 260;    // time between each letter reveal
const T_SENTENCE     = T_LETTER_START + T_PER_LETTER * LETTERS.length + 400;
const T_FADEOUT      = T_SENTENCE + 2200;
const T_COMPLETE     = T_FADEOUT + 700;

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase]            = useState('sliding'); // sliding|expanding|sentence|fadeout
  const [visibleCount, setVisible]   = useState(0);

  useEffect(() => {
    const timers = [];

    timers.push(setTimeout(() => setPhase('expanding'), T_SLIDE_END));

    LETTERS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), T_LETTER_START + T_PER_LETTER * i));
    });

    timers.push(setTimeout(() => setPhase('sentence'), T_SENTENCE));
    timers.push(setTimeout(() => setPhase('fadeout'),  T_FADEOUT));
    timers.push(setTimeout(() => onComplete && onComplete(), T_COMPLETE));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const isExpanding = phase === 'expanding';
  const isSentence  = phase === 'sentence' || phase === 'fadeout';
  const isFading    = phase === 'fadeout';

  // Progress: 0→40% during slide, 40→100% during expand, stays at 100
  const progress = phase === 'sliding'
    ? 38
    : isSentence
      ? 100
      : 40 + Math.round((visibleCount / LETTERS.length) * 58);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse 80% 70% at 50% 55%, #0d0721 0%, #000 70%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, overflow: 'hidden',
      animation: isFading ? 'screenOut 0.65s cubic-bezier(0.4,0,1,1) forwards' : 'none',
    }}>
      <style>{CSS}</style>

      {/* ─────── PHASE 1 + 2: Letters ─────── */}
      <div 
        className="letters-container"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: phase === 'sliding' ? 'translate(calc(-50% - 110vw), -50%)' : 'translate(-50%, -50%)',
          animation: phase === 'sliding' 
            ? `slideInFromLeft 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards` 
            : isSentence 
              ? 'wordsMerge 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards' 
              : 'none',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: isExpanding ? 'clamp(4px, 1.8vw, 22px)' : '0px',
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform, opacity, filter',
          pointerEvents: isSentence ? 'none' : 'auto',
        }}
      >
        <div 
          className="letters-row row-viral"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 'inherit',
          }}
        >
          {LETTERS.slice(0, 5).map((item, i) => {
            const revealed = isExpanding && visibleCount > i;
            return (
              <div 
                key={i} 
                className="letter-item"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '4px',
                }}
              >
                {/* Arrow + Word label */}
                <div 
                  className="letter-word-wrapper"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    opacity: revealed ? 1 : 0,
                    animation: revealed ? 'wordSlideDown 0.4s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
                    minHeight: '1.4em',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{
                    fontSize: 'clamp(0.5rem, 1vw, 0.78rem)',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Inter, sans-serif',
                  }}>→</span>
                  <span style={{
                    fontSize: 'clamp(0.52rem, 1.05vw, 0.8rem)',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>{item.word}</span>
                </div>

                {/* The Letter */}
                <span 
                  className="letter-text"
                  style={{
                    fontFamily: "'Satoshi', Inter, sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                    lineHeight: 1,
                    color: '#ffffff',
                    textShadow: revealed ? '0 0 28px rgba(255,255,255,0.4)' : 'none',
                    transition: 'text-shadow 0.45s ease',
                    animation: revealed ? 'letterExpand 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                    display: 'inline-block',
                    willChange: 'transform',
                  }}
                >{item.letter}</span>
              </div>
            );
          })}
        </div>

        <div 
          className="letters-row row-rush"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 'inherit',
          }}
        >
          {LETTERS.slice(5).map((item, idx) => {
            const i = idx + 5;
            const revealed = isExpanding && visibleCount > i;
            return (
              <div 
                key={i} 
                className="letter-item"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '4px',
                }}
              >
                {/* Arrow + Word label */}
                <div 
                  className="letter-word-wrapper"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    opacity: revealed ? 1 : 0,
                    animation: revealed ? 'wordSlideDown 0.4s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
                    minHeight: '1.4em',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{
                    fontSize: 'clamp(0.5rem, 1vw, 0.78rem)',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Inter, sans-serif',
                  }}>→</span>
                  <span style={{
                    fontSize: 'clamp(0.52rem, 1.05vw, 0.8rem)',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>{item.word}</span>
                </div>

                {/* The Letter */}
                <span 
                  className="letter-text"
                  style={{
                    fontFamily: "'Satoshi', Inter, sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                    lineHeight: 1,
                    color: '#ffffff',
                    textShadow: revealed ? '0 0 28px rgba(255,255,255,0.4)' : 'none',
                    transition: 'text-shadow 0.45s ease',
                    animation: revealed ? 'letterExpand 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                    display: 'inline-block',
                    willChange: 'transform',
                  }}
                >{item.letter}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────── PHASE 3: Sentence ─────── */}
      {isSentence && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1.1rem', padding: '0 clamp(1.5rem, 5vw, 4rem)',
          animation: 'sentenceReveal 0.85s cubic-bezier(0.22,1,0.36,1) forwards',
          textAlign: 'center',
          width: '100%',
          maxWidth: 700,
        }}>
          <div style={{
            fontFamily: "'Satoshi', Inter, sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(1.8rem, 5vw, 3.6rem)',
            color: '#fff',
            letterSpacing: '-0.02em',
            animation: 'titleGlow 2.5s ease infinite',
          }}>
            VIRALRUSH
          </div>

          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(0.95rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.68)',
            lineHeight: 1.7,
            letterSpacing: '0.01em',
          }}>
            {SENTENCE}
          </div>

          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, #6F4BFF, #ff006e)',
            borderRadius: 2,
            animation: 'lineExpand 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) both',
          }} />
        </div>
      )}

      {/* ─────── Progress Bar ─────── */}
      {!isFading && (
        <div style={{
          position: 'absolute',
          bottom: 'clamp(32px, 6vh, 75px)',
          left: '50%', transform: 'translateX(-50%)',
          width: 'clamp(180px, 50vw, 300px)',
          height: 3,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 99,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6F4BFF, #ff006e)',
            borderRadius: 99,
            transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
      )}
    </div>
  );
}
