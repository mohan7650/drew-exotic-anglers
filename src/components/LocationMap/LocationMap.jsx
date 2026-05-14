import React, { useState, useEffect, useRef } from 'react';
import styles from './LocationMap.module.css';
import { WORLD_PATH } from './worldPath';

/* ==========================================================================
   LUXURY WORLD MAP — Premium fishing expedition destinations
   - Real world geography (simplemaps MIT, viewBox 2000 × 857)
   - Six confirmed destinations
   - Calibrated projection: x = 5.367·lng + 996.9, y = -6.5·lat + 492
   ========================================================================== */

const locations = [
  {
    id: 'urubaxi',
    name: 'Urubaxi River',
    region: 'Amazonas, Brazil',
    flag: '🇧🇷',
    flagship: true,
    tag: 'Flagship',
    cx: 649, cy: 495,
    desc: 'Two hundred and forty miles of private river aboard the Kalua I & II. World-record territory for Giant Peacock Bass — most fish here have never seen a lure.',
    season: 'Sept – Jan',
    species: ['Peacock Bass', 'Payara', 'Arowana'],
    price: 'On Request',
  },
  {
    id: 'eco-lodge',
    name: 'Eco Lodge da Barra',
    region: 'Amazon Basin, Brazil',
    flag: '🇧🇷',
    tag: 'Floating Lodge',
    cx: 670, cy: 510,
    desc: 'A floating lodge experience targeting Peacock Bass and twenty-plus Amazonian species. Comfort-focused, ideal for first journeys into the basin.',
    season: 'Sept – Mar',
    species: ['Peacock Bass', 'Arapaima', 'Catfish'],
    price: 'On Request',
  },
  {
    id: 'xingu',
    name: 'Xingu River',
    region: 'Pará, Brazil',
    flag: '🇧🇷',
    tag: 'Remote',
    cx: 715, cy: 515,
    desc: 'Truly remote expedition fishing on the Xingu — trophy Peacock Bass and Arapaima in waters that see almost no other anglers.',
    season: 'By Request',
    species: ['Peacock Bass', 'Arapaima', 'Payara'],
    price: 'On Request',
  },
  {
    id: 'don-joaquin',
    name: 'Don Joaquin Lodge',
    region: 'Patagonia, Argentina',
    flag: '🇦🇷',
    tag: 'Trophy Waters',
    cx: 613, cy: 758,
    desc: 'World-class lodge fishing in Patagonia — Golden Dorado on the rivers, Brown Trout in the streams. One of the finest lodges in the Southern Hemisphere.',
    season: 'Nov – Mar',
    species: ['Golden Dorado', 'Brown Trout', 'Rainbow'],
    price: 'On Request',
  },
  {
    id: 'st-jean',
    name: 'St Jean Salmon Lodge',
    region: 'Quebec, Canada',
    flag: '🇨🇦',
    tag: 'Northern Trophy',
    cx: 615, cy: 178,
    desc: 'Atlantic Salmon and trophy trout on a remote Quebec river — summer trips when the Amazon is off-season.',
    season: 'Jun – Sep',
    species: ['Atlantic Salmon', 'Brook Trout'],
    price: 'On Request',
  },
  {
    id: 'florida',
    name: 'South Florida',
    region: 'Miami · USA',
    flag: '🇺🇸',
    tag: 'Home Water',
    cx: 566, cy: 324,
    desc: "Drew's home water. Full-day freshwater trips through Miami's canals — Peacock Bass, Largemouth, twenty-plus species. Bookable online.",
    season: 'Year-round',
    species: ['Peacock Bass', 'Largemouth', 'Snakehead'],
    price: '$900 · Day Trip',
  },
];

// Real world geography is loaded from worldPath.js (extracted from simplemaps MIT)
// — a single combined path covering all continents at the same 2000×857 viewBox.

export default function LocationMap() {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef(null);

  const loc = active !== null ? locations.find(l => l.id === active) : null;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Florida is the home base — build great-circle-ish curves to others
  const home = locations.find(l => l.id === 'florida');
  const routes = locations
    .filter(l => l.id !== 'florida')
    .map(l => {
      const dx = l.cx - home.cx;
      const dy = l.cy - home.cy;
      // Curve outward — control point perpendicular to midpoint
      const mx = (home.cx + l.cx) / 2;
      const my = (home.cy + l.cy) / 2;
      const curve = Math.sqrt(dx * dx + dy * dy) * 0.18;
      const cpX = mx + (-dy / Math.sqrt(dx * dx + dy * dy)) * curve;
      const cpY = my + (dx / Math.sqrt(dx * dx + dy * dy)) * curve;
      return { id: l.id, d: `M${home.cx},${home.cy} Q${cpX},${cpY} ${l.cx},${l.cy}` };
    });

  return (
      <section id="locations" ref={sectionRef} className={`${styles.section} ${mounted ? styles.mounted : ''}`}>      {/* Atmospheric overlays */}
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.inner}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.titleBreak}> Global Destinations</span>
          </div>
          <h2 className={styles.title}>
            Choose Your 
            <span className={styles.titleBreak}> Destination.</span>
          </h2>
          <p className={styles.lede}>
            Six waters, three continents, one obsession. Each destination has been fished, tested, and earned its place — Drew personally guides every flagship expedition.
          </p>
        </header>

        {/* MAIN MAP + PANEL */}
        <div className={styles.layout}>
          {/* MAP */}
          <div className={styles.mapFrame}>
            <div className={styles.mapCorners}>
              <span className={`${styles.corner} ${styles.cornerTl}`} />
              <span className={`${styles.corner} ${styles.cornerTr}`} />
              <span className={`${styles.corner} ${styles.cornerBl}`} />
              <span className={`${styles.corner} ${styles.cornerBr}`} />
            </div>

            <div className={styles.mapMeta}>
              <span className={styles.coords}>25°46′N · 80°11′W</span>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaLabel}>HOME PORT · MIAMI</span>
            </div>

            <svg
              viewBox="0 0 2000 857"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.mapSvg}
              role="img"
              aria-label="World map of fishing destinations"
            >
              <defs>
                {/* Glow filter for pins */}
                <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="goldGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Continent fill gradient */}
                <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a2820" />
                  <stop offset="100%" stopColor="#061812" />
                </linearGradient>
                {/* Route gradient */}
                <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d4a017" stopOpacity="0.0" />
                  <stop offset="20%" stopColor="#d4a017" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#5dcaa5" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#5dcaa5" stopOpacity="0.0" />
                </linearGradient>
                {/* Radial glow behind map */}
                <radialGradient id="mapBg" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#0a2c22" />
                  <stop offset="100%" stopColor="#03100b" />
                </radialGradient>
              </defs>

              {/* Background */}
              <rect width="2000" height="857" fill="url(#mapBg)" />

              {/* Latitude/longitude grid */}
              <g className={styles.grid} stroke="#1d9e75" strokeWidth="0.8" fill="none">
                {/* Latitudes */}
                {[107, 214, 321, 428, 535, 642, 749].map(y => (
                  <line key={`lat${y}`} x1="0" y1={y} x2="2000" y2={y} strokeDasharray="2 6" />
                ))}
                {/* Longitudes */}
                {[167, 333, 500, 667, 833, 1000, 1167, 1333, 1500, 1667, 1833].map(x => (
                  <line key={`lng${x}`} x1={x} y1="0" x2={x} y2="857" strokeDasharray="2 6" />
                ))}
                {/* Equator — slightly stronger */}
                <line x1="0" y1="428" x2="2000" y2="428" stroke="#5dcaa5" strokeWidth="0.6" strokeDasharray="6 8" opacity="0.45" />
                {/* Tropics */}
                <line x1="0" y1="319" x2="2000" y2="319" stroke="#5dcaa5" strokeWidth="0.4" strokeDasharray="1 10" opacity="0.3" />
                <line x1="0" y1="537" x2="2000" y2="537" stroke="#5dcaa5" strokeWidth="0.4" strokeDasharray="1 10" opacity="0.3" />
              </g>

              {/* Coordinate marks at edges */}
              <g className={styles.gridLabels} fill="#5dcaa5" fontSize="9" fontFamily="serif" fontStyle="italic" opacity="0.4">
                <text x="10" y="216">60°N</text>
                <text x="10" y="430">0°</text>
                <text x="10" y="644">60°S</text>
                <text x="498" y="850">−60°</text>
                <text x="998" y="850">0°</text>
                <text x="1498" y="850">60°</text>
              </g>

              {/* Continents — real geography */}
              <g className={styles.continents}>
                <path
                  d={WORLD_PATH}
                  fill="url(#landGrad)"
                  stroke="#1d9e75"
                  strokeWidth="0.7"
                  strokeOpacity="0.7"
                  strokeLinejoin="round"
                  fillRule="evenodd"
                />
              </g>

              {/* Outer glow on continent edges */}
              <g className={styles.continentsGlow} opacity="0.3">
                <path
                  d={WORLD_PATH}
                  fill="none"
                  stroke="#5dcaa5"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  filter="url(#pinGlow)"
                />
              </g>

              {/* Routes from Florida */}
              <g className={styles.routes}>
                {routes.map((r, i) => (
                  <g key={r.id}>
                    <path
                      d={r.d}
                      fill="none"
                      stroke="url(#routeGrad)"
                      strokeWidth="1.2"
                      strokeDasharray="3 5"
                      className={styles.routeLine}
                      style={{ animationDelay: `${i * 0.25 + 1.2}s` }}
                    />
                  </g>
                ))}
              </g>

              {/* Pins */}
              <g className={styles.pins}>
                {locations.map((l, i) => {
                  const isActive = active === l.id;
                  const isHover = hovered === l.id;
                  const isDimmed = active && !isActive;
                  return (
                    <g
                      key={l.id}
                      onClick={() => setActive(isActive ? null : l.id)}
                      onMouseEnter={() => setHovered(l.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={`${styles.pin} ${l.flagship ? styles.pinFlagship : ''} ${isActive ? styles.pinActive : ''} ${isDimmed ? styles.pinDimmed : ''}`}
                      style={{ animationDelay: `${i * 0.12 + 0.6}s` }}
                    >
                      {/* Pulsing halo */}
                      {l.flagship && (
                        <>
                          <circle cx={l.cx} cy={l.cy} r="32" fill="#d4a017" opacity="0.06">
                            <animate attributeName="r" values="28;48;28" dur="3.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.18;0.04;0.18" dur="3.2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx={l.cx} cy={l.cy} r="22" fill="#d4a017" opacity="0.12">
                            <animate attributeName="r" values="18;30;18" dur="3.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.3;0.08;0.3" dur="3.2s" repeatCount="indefinite" />
                          </circle>
                        </>
                      )}
                      {!l.flagship && (
                        <circle cx={l.cx} cy={l.cy} r="18" fill="#5dcaa5" opacity="0.08">
                          <animate attributeName="r" values="14;22;14" dur="2.8s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2.8s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Outer ring */}
                      <circle
                        cx={l.cx}
                        cy={l.cy}
                        r={isActive || isHover ? 16 : 13}
                        fill="none"
                        stroke={l.flagship ? '#d4a017' : '#5dcaa5'}
                        strokeWidth="1"
                        opacity="0.55"
                        className={styles.pinRing}
                      />

                      {/* Pin body */}
                      <circle
                        cx={l.cx}
                        cy={l.cy}
                        r={isActive || isHover ? 9 : 7}
                        fill={l.flagship ? '#d4a017' : '#0f6e56'}
                        stroke="#f5ecd6"
                        strokeWidth="1.5"
                        filter={l.flagship ? 'url(#goldGlow)' : 'url(#pinGlow)'}
                        className={styles.pinCore}
                      />

                      {/* Center dot */}
                      <circle
                        cx={l.cx}
                        cy={l.cy}
                        r="2.5"
                        fill={l.flagship ? '#fff5dc' : '#a8e6c8'}
                      />

                      {/* Connecting line to label */}
                      <line
                        x1={l.cx}
                        y1={l.cy + (l.cy > 500 ? 18 : -18)}
                        x2={l.cx}
                        y2={l.cy + (l.cy > 500 ? 32 : -32)}
                        stroke={l.flagship ? '#d4a017' : '#5dcaa5'}
                        strokeWidth="0.8"
                        opacity="0.6"
                      />

                      {/* Label */}
                      <text
                        x={l.cx}
                        y={l.cy + (l.cy > 500 ? 46 : -36)}
                        textAnchor="middle"
                        fontSize="13"
                        fontFamily="'Cormorant Garamond', 'Playfair Display', serif"
                        fontStyle="italic"
                        fontWeight="500"
                        fill={l.flagship ? '#f0c668' : '#a8e6c8'}
                        className={styles.pinLabel}
                      >
                        {l.name}
                      </text>
                      {l.flagship && (
                        <text
                          x={l.cx}
                          y={l.cy + (l.cy > 500 ? 60 : -50)}
                          textAnchor="middle"
                          fontSize="8"
                          fontFamily="serif"
                          fill="#d4a017"
                          letterSpacing="3"
                          opacity="0.7"
                        >
                          FLAGSHIP
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Compass */}
              <g transform="translate(1880, 110)" opacity="0.5" className={styles.compass}>
                <circle r="38" fill="none" stroke="#1d9e75" strokeWidth="0.6" />
                <circle r="32" fill="none" stroke="#1d9e75" strokeWidth="0.4" strokeDasharray="2 4" />
                <text x="0" y="-44" fontSize="10" fontFamily="serif" fontStyle="italic" fill="#5dcaa5" textAnchor="middle">N</text>
                <text x="44" y="3" fontSize="10" fontFamily="serif" fontStyle="italic" fill="#5dcaa5" textAnchor="middle">E</text>
                <text x="0" y="52" fontSize="10" fontFamily="serif" fontStyle="italic" fill="#5dcaa5" textAnchor="middle">S</text>
                <text x="-44" y="3" fontSize="10" fontFamily="serif" fontStyle="italic" fill="#5dcaa5" textAnchor="middle">W</text>
                <polygon points="0,-28 4,0 0,-6 -4,0" fill="#d4a017" opacity="0.85" />
                <polygon points="0,28 4,0 0,6 -4,0" fill="#5dcaa5" opacity="0.5" />
                <circle r="2" fill="#d4a017" />
              </g>

              {/* Decorative scale */}
              <g transform="translate(80, 760)" opacity="0.4" className={styles.scale}>
                <line x1="0" y1="0" x2="120" y2="0" stroke="#5dcaa5" strokeWidth="1" />
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#5dcaa5" strokeWidth="1" />
                <line x1="60" y1="-3" x2="60" y2="3" stroke="#5dcaa5" strokeWidth="0.8" />
                <line x1="120" y1="-4" x2="120" y2="4" stroke="#5dcaa5" strokeWidth="1" />
                <text x="0" y="20" fontSize="9" fontFamily="serif" fontStyle="italic" fill="#5dcaa5">0</text>
                <text x="120" y="20" fontSize="9" fontFamily="serif" fontStyle="italic" fill="#5dcaa5">3000 nm</text>
              </g>
            </svg>

            {/* Bottom hint */}
            <div className={styles.mapFooter}>
              <span className={styles.hintDot} />
              <span className={styles.hintText}>Select a destination to begin</span>
            </div>
          </div>

          {/* INFO PANEL */}
          <aside className={styles.panel}>
            {!loc ? (
              <div className={styles.panelDefault}>
                <div className={styles.panelDefaultTop}>
                  <span className={styles.panelOrnament}>✦</span>
                  <h3 className={styles.panelDefaultTitle}>Six Destinations.</h3>
                  <p className={styles.panelDefaultDesc}>
                    Tap any pin to reveal the season, the species, and the story behind the water.
                  </p>
                </div>

                <div className={styles.panelLegend}>
                  <div className={styles.legendRow}>
                    <span className={`${styles.legendPin} ${styles.legendPinGold}`} />
                    <span className={styles.legendLabel}>Flagship · Urubaxi</span>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={`${styles.legendPin} ${styles.legendPinTeal}`} />
                    <span className={styles.legendLabel}>Standard Destination</span>
                  </div>
                </div>

                <div className={styles.chipsWrap}>
                  <div className={styles.chipsLabel}>Index</div>
                  <div className={styles.chips}>
                    {locations.map(l => (
                      <button
                        key={l.id}
                        className={`${styles.chip} ${l.flagship ? styles.chipFlagship : ''}`}
                        onClick={() => setActive(l.id)}
                        onMouseEnter={() => setHovered(l.id)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <span className={styles.chipFlag}>{l.flag}</span>
                        <span className={styles.chipName}>{l.name}</span>
                        <span className={styles.chipArrow}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.panelDetail} key={loc.id}>
                <button
                  className={styles.panelClose}
                  onClick={() => setActive(null)}
                  aria-label="Close"
                >
                  <span>×</span>
                </button>

                <div className={styles.panelHead}>
                  <div className={styles.panelTagRow}>
                    <span className={styles.panelFlag}>{loc.flag}</span>
                    <span className={`${styles.panelTag} ${loc.flagship ? styles.panelTagGold : ''}`}>
                      {loc.tag}
                    </span>
                  </div>
                  <h3 className={styles.panelName}>
                    {loc.name.split(' ').slice(0, -1).join(' ')}{' '}
                    <em>{loc.name.split(' ').slice(-1)}</em>
                  </h3>
                  <div className={styles.panelRegion}>{loc.region}</div>
                </div>

                <div className={styles.panelDivider}>
                  <span className={styles.dividerOrnament}>✦</span>
                </div>

                <p className={styles.panelDesc}>{loc.desc}</p>

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Season</div>
                    <div className={styles.metaValue}>{loc.season}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Investment</div>
                    <div className={styles.metaValue}>{loc.price}</div>
                  </div>
                </div>

                <div className={styles.speciesWrap}>
                  <div className={styles.speciesLabel}>Target Species</div>
                  <div className={styles.speciesList}>
                    {loc.species.map(s => (
                      <span key={s} className={styles.speciesPill}>{s}</span>
                    ))}
                  </div>
                </div>

                <a href={`#book-${loc.id}`} className={styles.cta}>
                  <span className={styles.ctaText}>Reserve This Water</span>
                  <span className={styles.ctaArrow}>→</span>
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
