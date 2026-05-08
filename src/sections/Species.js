import React from 'react';
import './Species.css';

const species = [

  {
    name: 'Giant Peacock Bass',
    latin: 'Cichla temensis',
    img: '/images/species/peacock-bass.jpg',

    desc:
      "The apex predator of the Amazon. Violent topwater explosions, brutal runs, and true trophy-class fish. Capt Drew's personal best on the Urubaxi exceeds 22 lbs.",

    stars: 5,
    diff: 'Advanced',
  },

  {
    name: 'Everglades Largemouth Bass',
    latin: 'Micropterus salmoides floridanus',
    img: '/images/species/Everglades Largemouth Bass.jpg',

    desc:
      "Apex predator of South Florida's canal systems. Famous for explosive surface strikes and heavy structure fights. Drew's personal best exceeds 10 lbs — a true Florida trophy bass.",

    stars: 4,
    diff: 'Intermediate',
  },

  {
    name: 'Butterfly Peacock Bass',
    latin: 'Cichla ocellaris',
    img: '/images/gallery/catch-3.jpg',

    desc:
      "South Florida's most explosive freshwater gamefish. Aggressive, colorful, and perfect for light tackle action year-round in Miami's urban canal systems.",

    stars: 4,
    diff: 'All Levels',
  },

  {
    name: 'Popoca Peacock Bass',
    latin: 'Cichla monoculus',
    img: '/images/species/Popoca.jpg',

    desc:
      "Highly aggressive Amazon peacock bass species known for savage strikes and relentless fights. Frequently caught on surface lures throughout the Urubaxi system.",

    stars: 3,
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

                onError={e => {

                  e.target.style.display = 'none';

                  e.target.parentNode.style.background =
                    '#0F6E56';
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