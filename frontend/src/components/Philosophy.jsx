import React from 'react';

export default function Philosophy() {
  return (
    <section className="intro section-pad" id="philosophy">
      <div className="section-label">
        <span>01 / A BETTER STARTING POINT</span>
        <span>THE DETAILS, MADE CLEAR</span>
      </div>
      <div className="intro-grid">
        <p className="intro-kicker">Good decisions<br />start with <em>clarity.</em></p>
        <div className="intro-copy">
          <p>Buying a car means balancing a lot: space, running costs, safety, and the price you will actually pay.</p>
          <p>We bring the useful details together so you can compare at your own pace, then speak with a dealer when you are ready.</p>
          <a className="text-link" href="#experience">See how we can help <span>↗</span></a>
        </div>
      </div>
      <div className="intro-stat-row">
        <div><b>01</b><span>COMPARE MODELS</span></div>
        <div><b>02</b><span>CHECK THE DETAILS</span></div>
        <div><b>03</b><span>CONTACT A DEALER</span></div>
        <div className="stat-quote">“A little more clarity makes<br />the choice feel like yours.”</div>
      </div>
    </section>
  );
}
