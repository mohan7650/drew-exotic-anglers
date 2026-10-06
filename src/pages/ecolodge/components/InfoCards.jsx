import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { infoCards, photoStrip } from '../data/content.js';
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
            <a href={prepare.cta.href} className="eco-btn eco-btn--olive eco-btn--sm eco-info-card__btn">
              {prepare.cta.label}
              <Icon name="arrowRight" strokeWidth={2.2} />
            </a>
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

      <div className="eco-strip" aria-label="Photo gallery">
        {photoStrip.map((p) => (
          <Img key={p.src} src={p.src} alt={p.alt} className="eco-strip__item" />
        ))}
      </div>
    </>
  );
}
