/**
 * FilmModal.jsx
 * -------------------
 * Cinematic Experience Modal
 * Styled with Tailwind CSS
 */

import React, { useEffect, useRef } from 'react';

const filmUrl = '/videos/hero.mp4';

export default function FilmModal({ isOpen, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      videoRef.current?.play().catch((err) => {
        console.warn("Autoplay blocked by browser policy. User must hit play manually.", err);
      });
    } else {
      videoRef.current?.pause();
    }
  }, [isOpen]);

  useEffect(() => {
    function closeWithEscape(event) {
      if (event.key === 'Escape' && isOpen) {
        if (typeof onClose === 'function') {
          onClose();
        }
      }
    }

    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="film-modal open fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 md:p-12 animate-[fadeIn_0.25s_ease-out]" 
      aria-label="Aurel in motion" 
      role="dialog" 
      aria-modal="true" 
      onClick={onClose}
    >
      <button 
        className="film-close absolute top-5 right-5 sm:top-7 sm:right-7 w-10 h-10 border border-white/25 text-white rounded-full flex items-center justify-center text-xl hover:border-[#c5a77a] hover:text-[#c5a77a] hover:bg-white/5 transition-all cursor-pointer z-20" 
        type="button" 
        aria-label="Close film" 
        onClick={onClose}
      >
        ×
      </button>
      
      <div 
        className="relative max-w-5xl w-full max-h-[85vh] rounded-md overflow-hidden shadow-2xl bg-black"
        onClick={(event) => event.stopPropagation()}
      >
        <video 
          ref={videoRef} 
          controls 
          playsInline 
          className="w-full h-full object-contain aspect-video"
        >
          <source src={filmUrl} type="video/mp4" />
          <p className="p-4 text-center text-white/70">Your browser does not support HTML5 video.</p>
        </video>
      </div>
    </div>
  );
}
