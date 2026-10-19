import { useEffect, useRef } from 'react';

const filmUrl = 'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_25fps.mp4';

export default function FilmModal({ isOpen, onClose }) {
  const videoRef = useRef(null);

  // Start the film when the dialog opens and pause it when the dialog closes.
  useEffect(() => {
    if (isOpen) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [isOpen]);

  // Escape is a familiar keyboard shortcut for closing a dialog.
  useEffect(() => {
    function closeWithEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="film-modal open" aria-label="Aurel in motion" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="film-close" type="button" aria-label="Close film" onClick={onClose}>×</button>
      <video ref={videoRef} controls playsInline onClick={(event) => event.stopPropagation()}>
        <source src={filmUrl} type="video/mp4" />
      </video>
    </div>
  );
}
