import React from 'react';
import './WhyUs.css';

const testimonials = [
  {
    image: '/images/gallery/catch-1.webp',
    review:
      'Capt Drew put us on giants every single day. Best fishing experience of my life.',
    name: 'Michael R.',
    location: 'Texas, USA',
    fish: '22LB PEACOCK BASS',
  },
  {
    image: '/images/gallery/catch-2.webp',
    review:
      'The private river experience was unreal. Already planning our next trip back.',
    name: 'James T.',
    location: 'Florida, USA',
    fish: '20LB PEACOCK BASS',
  },
  {
    image: '/images/gallery/catch-3.webp',
    review:
      'World-class fishing, incredible hospitality, and trophy Peacock Bass every day.',
    name: 'Ryan C.',
    location: 'Arizona, USA',
    fish: '19LB PEACOCK BASS',
  },
  {
    image: '/images/gallery/catch-4.webp',
    review:
      'Hands down the best Peacock Bass fishing experience we have ever had.',
    name: 'Chris M.',
    location: 'Colorado, USA',
    fish: '21LB PEACOCK BASS',
  },
];

export default function WhyUs() {
  return (
    <section id="whyus" className="whyus">

      <div className="whyus-header">
        <div className="section-tag-line center">
          What Anglers Say
        </div>

        <h2 className="section-title center">
          Stories from the <em>River.</em>
        </h2>
      </div>

      {/* AUTO SCROLL */}
      <div className="testimonial-slider">

        <div className="testimonial-track">

          {[...testimonials, ...testimonials].map((t, i) => (
            <div className="testimonial-card" key={i}>

              {/* TOP IMAGE */}
              <div
                className="testimonial-image"
                style={{
                  backgroundImage: `url(${t.image})`,
                }}
              />

              {/* BOTTOM CONTENT */}
              <div className="testimonial-bottom">

                <div className="quote-icon">
                  “
                </div>

                <div className="testimonial-stars">
                  ★★★★★
                </div>

                <p className="testimonial-review">
                  {t.review}
                </p>

                <div className="testimonial-line"></div>

                <div className="testimonial-name">
                  {t.name}
                </div>

                <div className="testimonial-location">
                  {t.location}
                </div>

                

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}