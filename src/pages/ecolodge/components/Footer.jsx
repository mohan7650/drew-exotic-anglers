import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { footer } from '../data/content.js';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="eco-footer">
      <div className="eco-container eco-footer__grid">
        <div className="eco-footer__brand">
          <Logo />
          <p>{footer.about}</p>
        </div>

        <nav aria-label="Quick links">
          <h4 className="eco-footer__heading">Quick links</h4>
          <ul className="eco-footer__links">
            {footer.quickLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h4 className="eco-footer__heading">Get in touch</h4>
          <ul className="eco-footer__contact">
            <li>
              <Icon name="mail" size={16} />
              <a href={`mailto:${footer.email}`}>{footer.email}</a>
            </li>
            <li>
              <Icon name="phone" size={16} />
              <a href={footer.phoneHref}>{footer.phone}</a>
            </li>
          </ul>
          <ul className="eco-footer__socials">
            {footer.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  <Icon name={s.icon} size={16} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="eco-container eco-footer__bottom">
        <span>{footer.copyright}</span>
        <a href={footer.creditHref} className="eco-footer__credit">
          {footer.credit}
        </a>
      </div>
    </footer>
  );
}
