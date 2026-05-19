import React from 'react';
import './Species.css';

const species = [

  {
    name: 'Payara',
    latin: 'Hydrolycus scomberoides',
    img: '/images/species/payara.webp',

    desc:
      "Known as the Vampire Fish of the Amazon, Payara are famous for their massive fangs, explosive strikes, and aggressive fights in fast-moving river systems.",

    stars: 5,
    diff: 'Advanced',
  },

  {
    name: 'Red Tail Catfish',
    latin: 'Phractocephalus hemioliopterus',
    img: '/images/species/Red Tail Catfish.webp',

    desc:
      "One of the Amazon’s most powerful freshwater predators. Heavy runs, deep battles, and massive size make Red Tail Catfish an unforgettable catch.",

    stars: 4,
    diff: 'Intermediate',
  },

  {
    name: 'Shovel Nose Catfish',
    latin: 'Sorubim lima',
    img: '/images/species/Shovel Nose Catfish.webp',

    desc:
      "Fast-moving and highly active catfish species known for their long bodies and unique shovel-shaped snouts. Excellent action on live bait setups.",

    stars: 3,
    diff: 'All Levels',
  },

  {
    name: 'Golden Dorado',
    latin: 'Salminus brasiliensis',
    img: '/images/species/Golden Dorado.webp',

    desc:
      "An aggressive South American predator famous for explosive topwater attacks, aerial jumps, and stunning golden coloration.",

    stars: 5,
    diff: 'Advanced',
  },

  {
    name: 'Hoplias Aimara',
    latin: 'Hoplias aimara',
    img: '/images/species/Hoplias Aimara.webp',

    desc:
      "Also called the Wolf Fish, this brutal apex predator is feared for its raw power, sharp teeth, and relentless fight in remote jungle waters.",

    stars: 5,
    diff: 'Expert',
  },

  {
    name: 'Piranha',
    latin: 'Pygocentrus nattereri',
    img: '/images/species/Piranha.webp',

    desc:
      "The legendary razor-toothed predator of the Amazon. Aggressive strikes and nonstop action make Piranha fishing exciting for every angler.",

    stars: 2,
    diff: 'Beginner',
  },

  {
    name: 'Atlantic Salmon',
    latin: 'Salmo salar',
    img: '/images/species/Atlantic Salmon.webp',

    desc:
      "One of the world’s most respected sport fish, Atlantic Salmon are known for their strength, endurance, and spectacular river runs.",

    stars: 4,
    diff: 'Intermediate',
  },

];

export default function Species() {

  return (

    <section id="species" className="species">

      <div className="species-header">

        <div>

          <div className="section-tag-line">
            Target Species
          </div>

          <h2 className="section-title">
            The Fish You'll <em>Chase</em>
          </h2>

        </div>

        <a
          href="#contact"
          className="btn-gold-sm"
        >
          Plan Your Trip
        </a>

      </div>

      <div className="species-grid">

        {species.map(s => (

          <div
            className="species-card"
            key={s.name}
          >

            {/* PHOTO */}

            <div className="species-img-wrap">

              <img
                src={s.img}
                alt={s.name}
                className="species-img"
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentNode.style.background = '#0F6E56';
                }}
              />

              <div className="species-img-overlay" />

            </div>

            {/* INFO */}

            <div className="species-info">

              <div className="species-name">
                {s.name}
              </div>

              <div className="species-latin">
                {s.latin}
              </div>

              <div className="species-desc">
                {s.desc}
              </div>

              <div className="species-rating">

                <span className="stars">

                  {'★'.repeat(s.stars)}
                  {'☆'.repeat(5 - s.stars)}

                </span>

                <span className="diff">
                  Difficulty: {s.diff}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}