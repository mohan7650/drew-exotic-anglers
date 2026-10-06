import Icon from './Icon.jsx';
import { hero, callout, stats } from '../data/content.js';
import './Hero.css';

export default function Hero() {
  const { art } = hero;

  return (
    <section className="eco-hero">
      <div
        className="eco-hero__stage"
        style={{ '--hero-bg': `url(${art.background})`, '--hero-bg-top': `url(${art.backgroundTop})` }}
      >
        {/* Layered exactly like the Figma frame: sunset blob, anglers masked to the
            blob, and the un-masked top half so heads/rod break out of the shape. */}
        <div className="eco-hero__art">
          <span className="eco-hero__target" aria-hidden="true" />
          <span className="eco-hero__shade" aria-hidden="true" style={{ '--blob': `url(${art.blob})` }} />
          <img className="eco-hero__blob" src={art.blob} alt="" aria-hidden="true" fetchpriority="high" />
          <img
            className="eco-hero__anglers"
            src={art.anglers}
            alt=""
            aria-hidden="true"
            style={{ '--blob': `url(${art.blob})` }}
          />
          <img className="eco-hero__anglers-top" src={art.anglersTop} alt={art.alt} fetchpriority="high" />
        </div>
        <span className="eco-hero__fish" aria-hidden="true">
          <img src={art.fish} alt="" width="431" height="111" />
        </span>

        <div className="eco-container eco-hero__content">
          <p className="eco-hero__eyebrow">{hero.eyebrow}</p>
          <h1 className="eco-hero__title">
            {hero.title} <span>{hero.titleSuffix}</span>
          </h1>
          <p className="eco-hero__tagline">{hero.tagline}</p>
          <p className="eco-hero__body">{hero.body}</p>
          <a href={hero.cta.href} className="eco-btn eco-btn--olive eco-hero__cta">
            {hero.cta.label}
          </a>
        </div>
      </div>

      <div className="eco-hero__band">
        <div className="eco-container">
          <div className="eco-hero__callout">
            <Icon name="playSolid" size={38} className="eco-hero__play" />
            <span className="eco-hero__callout-label">{callout.label}</span>
            <a
              href={callout.link.href}
              className="eco-hero__callout-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {callout.link.label}
            </a>
          </div>

          <ul className="eco-stats">
            {stats.map((s) => (
              <li key={s.label} className="eco-stats__item">
                <div className="eco-stats__top">
                  <img className="eco-stats__icon" src={s.icon} alt="" aria-hidden="true" width="60" height="60" />
                  <span className="eco-stats__value">{s.value}</span>
                </div>
                <span className="eco-stats__label">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
