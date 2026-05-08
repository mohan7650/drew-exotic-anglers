import React, { useState } from 'react';
import './LocationMap.css';

/*
  Global Map per brief item #07
  Coordinates are positioned on a stylized world-map SVG (viewBox 0 0 1000 500)
  using a basic equirectangular projection feel.
  All six confirmed destinations from the Global Map Brief on page 3.
*/
const locations = [
  {
    id: 0, cx: 358, cy: 290, gold: true, flag: '🇧🇷',
    tag: '🥇 Flagship Location', name: 'Urubaxi River',
    loc: 'Amazonas, Brazil',
    desc: "Drew's flagship destination. 240 miles of private river aboard the Kalua I & II. World record potential for Giant Peacock Bass — most fish here have never seen a lure.",
    season: 'Sept – Jan', difficulty: 'All levels', access: 'Charter from Manaus → Kalua', remote: '★★★★★',
    species: ['Giant Peacock Bass','Payara','Arowana','Bicuda','Catfish'],
    tours: [
      { name:'Urubaxi Full Week', days:'Fri → Fri · 8 Days', price:'Call for Pricing', badge:'World Record Potential', inc:'Kalua I/II + meals + drinks + tackle + licences + charter flight' },
    ],
    bookingUrl: '#contact',
  },
  {
    id: 1, cx: 365, cy: 305, gold: false, flag: '🇧🇷',
    tag: '🌿 Floating Lodge', name: 'Eco Lodge da Barra',
    loc: 'Amazon Basin, Brazil',
    desc: 'Floating lodge experience targeting Peacock Bass and 20+ Amazon species. Comfort-focused trip ideal for couples and small groups exploring the Amazon for the first time.',
    season: 'Sept – Mar', difficulty: 'All levels', access: 'Fly Manaus → boat transfer', remote: '★★★★☆',
    species: ['Peacock Bass','Payara','Arapaima','Catfish','20+ Species'],
    tours: [
      { name:'Eco Lodge Week', days:'7 Days', price:'On Request', badge:'Multi-Species', inc:'Floating lodge + all meals + guide + tackle' },
    ],
    bookingUrl: '#contact',
  },
  {
    id: 2, cx: 380, cy: 318, gold: false, flag: '🇧🇷',
    tag: '🎣 Remote Expedition', name: 'Xingu River',
    loc: 'Pará, Brazil',
    desc: 'Truly remote expedition fishing on the Xingu. Trophy Peacock Bass and Arapaima in waters that see almost no other anglers. For experienced fishermen seeking an off-the-map adventure.',
    season: 'Season TBC', difficulty: 'Expert', access: 'Charter only', remote: '★★★★★',
    species: ['Peacock Bass','Arapaima','Payara','Catfish'],
    tours: [
      { name:'Xingu Expedition', days:'7–10 Days', price:'On Request', badge:'Coming Soon', inc:'Custom expedition · all-inclusive' },
    ],
    bookingUrl: '#contact',
  },
  {
    id: 3, cx: 350, cy: 410, gold: false, flag: '🇦🇷',
    tag: '⚡ Trophy Waters', name: 'Don Joaquin Lodge',
    loc: 'Patagonia, Argentina',
    desc: 'World-class lodge fishing in Patagonia. Golden Dorado on the rivers and Brown Trout in the streams. Some of the finest lodges in the Southern Hemisphere — guided expertise, premium accommodations.',
    season: 'Nov – Mar', difficulty: 'Intermediate – Expert', access: 'Fly into Buenos Aires → transfer', remote: '★★★★☆',
    species: ['Golden Dorado','Brown Trout','Rainbow Trout'],
    tours: [
      { name:'Patagonia Week', days:'7 Days', price:'On Request', badge:'World-Class Lodge', inc:'Lodge + meals + guides + transfers' },
    ],
    bookingUrl: '#contact',
  },
  {
    id: 4, cx: 280, cy: 130, gold: false, flag: '🇨🇦',
    tag: '🐟 Northern Trophy', name: 'St Jean Salmon Lodge',
    loc: 'Quebec, Canada',
    desc: 'Atlantic Salmon and trophy trout on a remote Quebec river. Drew runs summer trips when the Amazon is off-season — perfect for clients who want world-class fishing in any month.',
    season: 'Jun – Sep', difficulty: 'Intermediate', access: 'Fly Quebec City → lodge transfer', remote: '★★★★☆',
    species: ['Atlantic Salmon','Trophy Trout','Brook Trout'],
    tours: [
      { name:'St Jean Salmon Week', days:'6 Days', price:'On Request', badge:'Summer Season', inc:'Remote lodge + guides + meals + tackle' },
    ],
    bookingUrl: '#contact',
  },
  {
    id: 5, cx: 285, cy: 195, gold: false, flag: '🇺🇸',
    tag: '☀️ Day Trips · Tier 1', name: 'South Florida',
    loc: 'Miami, FL · USA',
    desc: 'Drew\'s home water. Full-day freshwater trips on Miami\'s canals. Peacock Bass, Largemouth, and 20+ species. Bookable online with instant confirmation — perfect intro to fishing with Drew.',
    season: 'Year-round', difficulty: 'All levels · Beginners welcome', access: 'Drive · meet at ramp', remote: '★☆☆☆☆',
    species: ['Peacock Bass','Largemouth Bass','Snakehead','Clown Knifefish'],
    tours: [
      { name:'Full Day Trip · 1–2 Anglers', days:'8 Hours', price:'$900', badge:'Book Online', inc:'Boat + tackle + bait + licence + photography' },
    ],
    bookingUrl: '#florida-day-trips',
  },
];

export default function LocationMap() {
  const [active, setActive] = useState(null);
  const loc = active !== null ? locations[active] : null;

  return (
    <section id="locations" className="location-map">
      <div className="map-header">
        <div className="section-tag-line center">Global Destinations</div>
        {/* Headline updated per brief item #07 */}
        <h2 className="section-title center">Choose Your <em>Destination.</em></h2>
        <p className="section-sub center">From Miami's canals to the Amazon, Patagonia, and Quebec. Click any pin to explore tours, species, and pricing.</p>
      </div>

      <div className="map-layout">
        {/* WORLD MAP SVG */}
        <div className="map-svg-wrap">
          <div className="map-label">From the Canals to the World</div>
          <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" className="map-svg">
            {/* Ocean background */}
            <rect width="1000" height="500" fill="#071c14"/>

            {/* Subtle grid */}
            <g opacity="0.08" stroke="#5DCAA5" strokeWidth="0.5">
              {[100,200,300,400].map(y => <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y}/>)}
              {[200,400,500,600,800].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500"/>)}
            </g>

            {/* Stylized continents — simplified silhouettes */}
            {/* North America */}
            <path d="M150,80 Q180,70 230,75 Q300,70 360,90 L370,140 Q360,180 320,200 L290,210 L270,230 L250,225 L230,200 L200,180 L170,150 L160,120 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.85"/>
            {/* Central America */}
            <path d="M270,230 L290,240 Q300,255 285,265 L275,255 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.85"/>
            {/* South America */}
            <path d="M310,260 Q340,255 370,275 Q390,295 395,330 Q400,370 380,420 Q360,450 340,440 Q325,420 320,390 Q315,360 310,330 Q305,300 308,280 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.9"/>
            {/* Europe */}
            <path d="M480,120 Q510,115 540,125 Q560,135 555,160 Q540,170 510,165 Q485,155 478,140 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.85"/>
            {/* Africa */}
            <path d="M510,180 Q540,175 565,195 Q575,225 570,265 Q565,300 545,330 Q525,335 515,310 Q505,275 505,235 Q505,205 510,180 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.85"/>
            {/* Asia */}
            <path d="M580,110 Q650,100 720,115 Q770,125 780,160 Q770,195 720,205 Q670,200 620,185 Q590,165 580,140 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.85"/>
            {/* India */}
            <path d="M660,200 Q680,205 685,225 Q680,245 670,250 Q655,240 658,220 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.85"/>
            {/* SE Asia */}
            <path d="M740,210 Q770,215 790,235 Q780,255 760,250 Q745,235 740,220 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.8"/>
            {/* Australia */}
            <path d="M780,330 Q830,325 860,345 Q870,365 850,375 Q810,378 785,365 Q775,350 778,335 Z"
                  fill="#0d2a1e" stroke="#1D9E75" strokeWidth="0.8" opacity="0.85"/>

            {/* Connection lines from Florida (home base) to all destinations */}
            <g opacity="0.25" stroke="#5DCAA5" strokeWidth="1" strokeDasharray="3,4" fill="none">
              <path d="M285,195 Q320,240 358,290"/>
              <path d="M285,195 Q320,250 365,305"/>
              <path d="M285,195 Q320,260 380,318"/>
              <path d="M285,195 Q310,300 350,410"/>
              <path d="M285,195 Q280,160 280,130"/>
            </g>

            {/* Region labels */}
            <text x="240" y="155" fontSize="9" fill="#5DCAA5" fontFamily="sans-serif" fontWeight="600" letterSpacing="2" opacity="0.45">NORTH AMERICA</text>
            <text x="335" y="375" fontSize="9" fill="#5DCAA5" fontFamily="sans-serif" fontWeight="600" letterSpacing="2" opacity="0.45">SOUTH AMERICA</text>
            <text x="500" y="100" fontSize="8" fill="#5DCAA5" fontFamily="sans-serif" fontWeight="600" letterSpacing="2" opacity="0.4">EUROPE</text>
            <text x="660" y="160" fontSize="8" fill="#5DCAA5" fontFamily="sans-serif" fontWeight="600" letterSpacing="2" opacity="0.4">ASIA</text>

            {/* Compass */}
            <g transform="translate(940,60)" opacity="0.4">
              <circle cx="0" cy="0" r="20" fill="none" stroke="#1D9E75" strokeWidth="0.5"/>
              <text x="0" y="-25" fontSize="9" fill="#5DCAA5" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">N</text>
              <line x1="0" y1="-16" x2="0" y2="16" stroke="#1D9E75" strokeWidth="0.5"/>
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#1D9E75" strokeWidth="0.5"/>
              <polygon points="0,-16 3,-4 0,-8 -3,-4" fill="#1D9E75"/>
            </g>

            {/* Pins */}
            {locations.map(l => (
              <g key={l.id} onClick={() => setActive(l.id)} style={{ cursor:'pointer' }}
                 opacity={active === null ? 1 : active === l.id ? 1 : 0.5}>
                {/* Pulse halo for flagship */}
                {l.gold && (
                  <circle cx={l.cx} cy={l.cy} r="22"
                    fill="rgba(212,137,26,0.12)" stroke="rgba(212,137,26,0.3)" strokeWidth="1">
                    <animate attributeName="r" values="18;26;18" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                )}
                <circle cx={l.cx} cy={l.cy} r="14"
                  fill={active === l.id ? 'rgba(212,137,26,0.3)' : l.gold ? 'rgba(212,137,26,0.22)' : 'rgba(29,158,117,0.22)'}/>
                <circle cx={l.cx} cy={l.cy} r="8"
                  fill={active === l.id ? '#D4891A' : l.gold ? '#D4891A' : '#0F6E56'}
                  stroke="#FAF6EE" strokeWidth="1.5"/>
                <circle cx={l.cx} cy={l.cy} r="4"
                  fill={active === l.id ? '#EF9F27' : l.gold ? '#EF9F27' : '#1D9E75'}/>
                <text x={l.cx} y={l.cy + 24} fontSize="9" fill={l.gold ? '#EF9F27' : '#5DCAA5'}
                  fontFamily="sans-serif" fontWeight="700" textAnchor="middle" letterSpacing="0.5">
                  {l.name.toUpperCase()}
                </text>
              </g>
            ))}
          </svg>
          <div className="map-hint">Click any pin to explore tours &amp; pricing</div>
        </div>

        {/* INFO PANEL */}
        <div className="map-panel">
          {!loc ? (
            <div className="panel-default">
              <div className="panel-default-icon">📍</div>
              <div className="panel-default-title">Select a Destination</div>
              <p className="panel-default-desc">Click any pin on the map to see available tours, target species, best season, and pricing for that destination.</p>
              <div className="panel-legend">
                <div className="legend-item"><span className="legend-dot gold" />Flagship destination · Urubaxi</div>
                <div className="legend-item"><span className="legend-dot teal" />Standard destination</div>
              </div>
              <div className="panel-destinations-preview">
                {locations.map(l => (
                  <button
                    key={l.id}
                    className="panel-dest-chip"
                    onClick={() => setActive(l.id)}
                  >
                    <span className="dest-chip-flag">{l.flag}</span>
                    <span className="dest-chip-name">{l.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="panel-detail">
              <div className="panel-head">
                <div className="panel-tag">{loc.tag}</div>
                <div className="panel-name">
                  <span className="panel-flag">{loc.flag}</span>
                  {loc.name}
                </div>
                <div className="panel-loc">{loc.loc}</div>
              </div>
              <div className="panel-body">
                <p className="panel-desc">{loc.desc}</p>
                <div className="panel-meta-grid">
                  {[['Best Season',loc.season],['Difficulty',loc.difficulty],['Access',loc.access],['Remoteness',loc.remote]].map(([k,v])=>(
                    <div className="panel-meta-item" key={k}>
                      <div className="meta-label">{k}</div>
                      <div className="meta-val">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel-species-wrap">
                <div className="panel-section-label">Target Species</div>
                <div className="panel-species">
                  {loc.species.map(s => <span className="species-pill" key={s}>{s}</span>)}
                </div>
              </div>
              <div className="panel-tours-wrap">
                <div className="panel-section-label">Tours &amp; Pricing</div>
                {loc.tours.map(t => (
                  <div className="panel-tour" key={t.name}>
                    <div className="panel-tour-top">
                      <div>
                        <div className="panel-tour-name">{t.name}</div>
                        <div className="panel-tour-days">{t.days}</div>
                      </div>
                      <div className="panel-tour-price">{t.price}</div>
                    </div>
                    {t.badge && <span className="tour-pill">{t.badge}</span>}
                    <div className="panel-tour-inc">Includes: {t.inc}</div>
                  </div>
                ))}
              </div>
              <div className="panel-footer">
                <a href={loc.bookingUrl} className="btn-gold-full">
                  {loc.id === 5 ? 'Book Online — Florida →' : 'Book This Location →'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
