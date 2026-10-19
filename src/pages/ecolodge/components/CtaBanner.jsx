import { useReveal } from '../hooks/useScroller.js';
import { ctaBanner } from '../data/content.js';
import './CtaBanner.css';

export default function CtaBanner() {
  const ref = useReveal();

  return (
    <section className="eco-cta" style={{ '--cta-bg': `url(${ctaBanner.image})` }}>
      <div ref={ref} className="eco-container eco-cta__inner eco-reveal">
        <p className="eco-cta__eyebrow">{ctaBanner.eyebrow}</p>
        <h2 className="eco-cta__title">
          {ctaBanner.title}
          <span>{ctaBanner.titleAccent}</span>
        </h2>
        <p className="eco-cta__body">{ctaBanner.body}</p>
        <a href={ctaBanner.cta.href} className="eco-btn eco-btn--olive eco-cta__btn">
          {ctaBanner.cta.label}
        </a>
      </div>
    </section>
  );
}
