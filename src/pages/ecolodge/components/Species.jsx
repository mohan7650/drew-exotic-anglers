import SliderControls from './SliderControls.jsx';
import { useScroller, useReveal } from '../hooks/useScroller.js';
import { speciesSection as s } from '../data/content.js';
import './Species.css';

export default function Species() {
  const scroller = useScroller();
  const ref = useReveal();

  return (
    <section className="eco-species" aria-labelledby="species-title">
      <img
        className="eco-species__leaves"
        src={s.leaves}
        alt=""
        aria-hidden="true"
        width="351"
        height="994"
      />
      <div ref={ref} className="eco-container eco-species__head eco-reveal">
        <h2 id="species-title" className="eco-section-title eco-species__title">
          {s.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        <p className="eco-species__intro">{s.intro}</p>
      </div>

      <div className="eco-container eco-species__controls">
        <hr className="eco-species__rule" />
        <SliderControls scroller={scroller} tone="dark" />
      </div>

      <ul ref={scroller.ref} className="eco-scroller eco-bleed eco-species__track">
        {s.species.map((f) => (
          <li key={f.name} className="eco-species-card">
            <img src={f.image} alt={f.name} loading="lazy" decoding="async" className="eco-species-card__img" />
            <div className="eco-species-card__body">
              <h3>{f.name}</h3>
              <p className="eco-species-card__latin">{f.latin}</p>
              <p className="eco-species-card__text">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="eco-species__band">
        <div className="eco-container eco-species__list">
          <div className="eco-species__list-head">
            <p className="eco-species__list-label">{s.fullListLabel}</p>
            <h3>{s.fullListTitle}</h3>
          </div>
          <ul className="eco-chips">
            {s.fullList.map((name) => (
              <li key={name} className={`eco-chip ${name === s.fullListHighlight ? 'eco-chip--active' : ''}`}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
