export default function Hero({ onPlayFilm }) {
  return (
    <section className="hero" id="home">
      <div className="hero-backdrop" />
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90"
      >
        <source src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_25fps.mp4" type="video/mp4" />
      </video>
      <div className="hero-scrim" />
      <div className="hero-content">
        <div className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> THE ART OF ARRIVAL <span className="eyebrow-line" /></div>
        <h1>Made for the<br /><em>feeling.</em></h1>
        <p className="hero-copy">A considered collection of exceptional automobiles.<br />Chosen for the way they make you feel.</p>
        <div className="hero-actions">
          <a className="button button-light" href="#collection">Explore the collection <span>↗</span></a>
          <button className="play-film" type="button" onClick={onPlayFilm}>
            <span className="play-icon">▶</span> Aurel in motion <span className="film-time">01:24</span>
          </button>
        </div>
      </div>
      <div className="hero-index"><span>01</span> / 03 <span className="index-rule" /> INDEPENDENT BY NATURE</div>
      <div className="hero-side-note">A MORE PERSONAL KIND OF MOTORING <span>↓</span></div>
      <div className="hero-bottom"><span>EST. MMXVI · LONDON</span><span>51°30'26.4&quot;N &nbsp; 0°07'39.0&quot;W</span></div>
    </section>
  );
}
