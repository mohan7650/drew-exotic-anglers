import { Link } from 'react-router-dom';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { infoCards, photoStrip, photoStripHeading } from '../data/content.js';
import './InfoCards.css';

function ListCard({ card, children }) {
  return (
    <article className="eco-info-card">
      <h3 className="eco-info-card__header">{card.header}</h3>
      <Img src={card.image} alt={card.imageAlt || ''} className="eco-info-card__img" />
      <div className="eco-info-card__body">
        <p className="eco-info-card__eyebrow">{card.eyebrow}</p>
        {card.intro && <p className="eco-info-card__intro">{card.intro}</p>}
        <ul className="eco-info-card__list">
          {card.items.map((item) => (
            <li key={item}>
              <Icon name="checkSolid" size={17} />
              {item}
            </li>
          ))}
        </ul>
        {children}
      </div>
    </article>
  );
}

export default function InfoCards() {
  const { included, prepare, host } = infoCards;

  return (
    <>
      <section className="eco-info" id="included" aria-label="What's included">
        <div className="eco-info__grid">
          <ListCard card={included} />
          <ListCard card={prepare}>
            <Link to={prepare.cta.to} state={prepare.cta.state} className="eco-btn eco-btn--olive eco-btn--sm eco-info-card__btn">
              {prepare.cta.label}
              <Icon name="arrowRight" strokeWidth={2.2} />
            </Link>
          </ListCard>

          <article className="eco-host" id="contact">
            <Img src={host.image} alt={host.name} className="eco-host__img" />
            <div className="eco-host__body">
              <p className="eco-host__eyebrow">{host.eyebrow}</p>
              <h3 className="eco-host__name">{host.name}</h3>
              <p className="eco-host__badge">{host.badge}</p>
              <p className="eco-host__text">{host.text}</p>
              <a href={host.cta.href} className="eco-btn eco-btn--olive eco-btn--sm eco-host__btn">
                {host.cta.label}
                <Icon name="arrowRight" strokeWidth={2.2} />
              </a>
            </div>
          </article>
        </div>
      </section>

      <header className="eco-strip-heading">
        <p className="eco-strip-heading__tag">{photoStripHeading.eyebrow}</p>
        <h2 className="eco-strip-heading__title">
          {photoStripHeading.title} <em>{photoStripHeading.titleEm}</em>
        </h2>
      </header>
      <div className="eco-strip" aria-label="Photo gallery">
        {photoStrip.map((p) => (
          p.fit === 'contain' ? (
            // whole photo uncropped; a blurred copy of it fills the sides of the tile
            <div key={p.src} className="eco-strip__item eco-strip__item--contain" style={{ '--photo': `url("${p.src}")` }}>
              <Img src={p.src} alt={p.alt} className="eco-strip__contain-img" />
            </div>
          ) : (
            <Img
              key={p.src}
              src={p.src}
              alt={p.alt}
              className="eco-strip__item"
              style={p.position ? { objectPosition: p.position } : undefined}
            />
          )
        ))}
      </div>
    </>
  );
}
