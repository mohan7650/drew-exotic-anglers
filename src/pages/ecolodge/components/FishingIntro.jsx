import { useReveal } from '../hooks/useScroller.js';
import { fishingIntro } from '../data/content.js';
import './FishingIntro.css';

export default function FishingIntro() {
  const ref = useReveal();

  return (
    <section className="eco-intro" id="fishing">
      <img
        className="eco-intro__vine"
        src={fishingIntro.vine}
        alt=""
        aria-hidden="true"
        width="606"
        height="191"
      />
      <div ref={ref} className="eco-container eco-intro__grid eco-reveal">
        <div className="eco-intro__text">
          <p className="eco-eyebrow eco-intro__eyebrow">{fishingIntro.eyebrow}</p>
          <h2 className="eco-section-title">
            {fishingIntro.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <div className="eco-intro__paras">
            {fishingIntro.paragraphs.map((p) => (
              <p key={p.slice(0, 20)} className="eco-body-copy">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Circle photos are exported from Figma with their -6px 6px olive shadow baked in */}
        <div className="eco-intro__media">
          {fishingIntro.images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              aria-hidden={img.alt ? undefined : 'true'}
              loading="lazy"
              decoding="async"
              className={`eco-intro__circle ${i === 0 ? 'eco-intro__circle--lg' : 'eco-intro__circle--sm'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
