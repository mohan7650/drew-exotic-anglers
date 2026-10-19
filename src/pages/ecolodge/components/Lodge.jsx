import Img from './Img.jsx';
import Icon from './Icon.jsx';
import SliderControls from './SliderControls.jsx';
import { useScroller, useReveal } from '../hooks/useScroller.js';
import { lodge } from '../data/content.js';
import './Lodge.css';

export default function Lodge() {
  const scroller = useScroller();
  const ref = useReveal();

  return (
    <section className="eco-lodge" id="lodge" aria-labelledby="lodge-title">
      <div ref={ref} className="eco-container eco-lodge__head eco-reveal">
        <div>
          <p className="eco-eyebrow">{lodge.eyebrow}</p>
          <h2 id="lodge-title" className="eco-section-title eco-lodge__title">
            {lodge.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </div>
        <p className="eco-lodge__intro">{lodge.intro}</p>
      </div>

      <div className="eco-container eco-lodge__controls">
        <SliderControls scroller={scroller} tone="light" />
      </div>

      <ul ref={scroller.ref} className="eco-scroller eco-bleed eco-lodge__track">
        {lodge.gallery.map((g) => (
          <li key={g.label} className="eco-lodge-photo">
            <Img src={g.image} alt={g.alt || g.label} className="eco-lodge-photo__img" />
            <span className="eco-tag">{g.label}</span>
          </li>
        ))}
      </ul>

      <div className="eco-container eco-lodge__amenities">
        <div className="eco-lodge__amenities-head">
          <h3>{lodge.amenitiesTitle}</h3>
          <p>
            <strong>{lodge.amenitiesNote.strong}</strong> {lodge.amenitiesNote.rest}
          </p>
        </div>
        <ul className="eco-amenities">
          {lodge.amenities.map((a) => (
            <li key={a.label} className="eco-amenity">
              <Icon name={a.icon} size={20} strokeWidth={1.7} />
              {a.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
