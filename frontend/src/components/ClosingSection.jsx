import React from 'react';

export default function ClosingSection({ onOpenModal }) {
  return (
    <section className="closing section-pad" id="contact">
      <div className="section-label">
        <span>07 / YOUR NEXT CHAPTER</span>
        <span>WE’RE HERE WHEN YOU’RE READY</span>
      </div>
      <h2>Shall we take<br />the <em>long way?</em></h2>
      <div className="closing-actions">
        <button
          className="button button-light"
          type="button"
          onClick={() => onOpenModal('inquiry')}
        >
          Start a conversation <span>↗</span>
        </button>
        <button
          className="button button-outline closing-secondary"
          type="button"
          onClick={() => onOpenModal('service')}
        >
          Book Atelier Service <span>↗</span>
        </button>
      </div>
      <div className="closing-mark" aria-hidden="true">A</div>
    </section>
  );
}
