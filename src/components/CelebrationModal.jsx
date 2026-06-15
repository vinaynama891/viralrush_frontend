import React, { useEffect, useState } from 'react';

export default function CelebrationModal({ isOpen, onClose }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti pieces
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6ab04c', '#c7ecee'];
      const newConfetti = [];
      
      for (let i = 0; i < 30; i++) {
        newConfetti.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 1,
          animationDuration: 2 + Math.random() * 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 8,
          type: Math.random() > 0.5 ? 'square' : 'circle'
        });
      }
      
      setConfetti(newConfetti);
      
      // Auto-close after 2 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(0, 0, 0, 0.6)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .confetti-piece {
          position: absolute;
          animation: confettiFall linear forwards;
        }
      `}</style>

      {/* Confetti Only */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.type === 'circle' ? '50%' : '2px',
            animationDelay: `${piece.animationDelay}s`,
            animationDuration: `${piece.animationDuration}s`,
            top: '-20px',
            zIndex: 1
          }}
        />
      ))}
    </div>
  );
}
