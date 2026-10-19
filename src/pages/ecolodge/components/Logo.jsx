const LOGO_SRC = '/images/ecolodge/logo-ecolodge.png';

/** EcoLodge da Barra logo (Figma frame 200 × 52, white on transparent). Used in the navbar and footer. */
export default function Logo({ className = '' }) {
  return (
    <a href="#top" className={`eco-logo ${className}`} aria-label="EcoLodge da Barra — home">
      <img className="eco-logo__img" src={LOGO_SRC} alt="" width="200" height="52" decoding="async" />
    </a>
  );
}
