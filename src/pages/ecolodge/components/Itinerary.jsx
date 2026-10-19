import Icon from './Icon.jsx';
import { useReveal } from '../hooks/useScroller.js';
import { itinerary } from '../data/content.js';
import './Itinerary.css';

export default function Itinerary() {
  const ref = useReveal();

  return (
    <section className="eco-itinerary" id="itinerary" aria-labelledby="itinerary-title">
      <div ref={ref} className="eco-container eco-itinerary__grid eco-reveal">
        <div className="eco-itinerary__text">
          <p className="eco-eyebrow">{itinerary.eyebrow}</p>
          <h2 id="itinerary-title" className="eco-section-title eco-itinerary__title">
            {itinerary.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>

          <ul className="eco-checklist">
            {itinerary.checklist.map((c) => (
              <li key={c.text} className={c.active ? '' : 'is-muted'}>
                <span className="eco-checklist__chk" aria-hidden="true">
                  <Icon name="check" size={11} strokeWidth={3} />
                </span>
                {c.text}
              </li>
            ))}
          </ul>

          <a href={itinerary.cta.href} className="eco-btn eco-btn--dark eco-itinerary__cta">
            {itinerary.cta.label}
            <Icon name="arrowRight" strokeWidth={2.2} />
          </a>
        </div>

        <div className="eco-itinerary__steps">
          <ol className="eco-steps">
            {itinerary.steps.map((s) => (
              <li key={s.title} className={`eco-step ${s.featured ? 'eco-step--featured' : ''}`}>
                <span className="eco-step__kicker">{s.kicker}</span>
                <span className="eco-step__copy">
                  <span className="eco-step__title">{s.title}</span>
                  <span className="eco-step__text">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="eco-itinerary__note">
            <Icon name="info" size={14} strokeWidth={2} />
            {itinerary.note}
          </p>
        </div>
      </div>
    </section>
  );
}
