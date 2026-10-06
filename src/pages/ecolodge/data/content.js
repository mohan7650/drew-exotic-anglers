// All page copy lives here so it can be edited (or moved to Supabase later)
// without touching layout code. Image paths point to /public/images.

export const nav = {
  links: [
    { label: 'The Fishing', href: '#fishing' },
    { label: 'The Lodge', href: '#lodge' },
    { label: 'Itinerary', href: '#itinerary' },
    { label: 'Included', href: '#included' },
    { label: 'Contact', href: '#eco-contact' },
  ],
  cta: { label: 'Dates & Pricing', href: '#eco-contact' },
};

export const hero = {
  eyebrow: 'Mato Grosso, Brazil · Amazônia',
  title: 'Ecolodge',
  titleSuffix: 'da Barra',
  tagline: '“Amazon Fly Fishing Experience”',
  body:
    'At the meeting point of the Juruena and Teles Pires rivers, where they become the Tapajós, EcoLodge da Barra puts you in the heart of one of the world’s most diverse freshwater fisheries — a floating lodge, five full days of guided fly fishing, and the chance to target more than twenty species, including some of the Amazon’s most exciting fish on the fly.',
  cta: { label: 'Explore the Fishing', href: '#fishing' },
  art: {
    blob: '/images/ecolodge/fg-hero-blob.webp',
    anglers: '/images/ecolodge/fg-hero-anglers.webp',
    anglersTop: '/images/ecolodge/fg-hero-anglers-top.webp',
    fish: '/images/ecolodge/fg-hero-fish.webp',
    // jungle background (hero frame without copy/fish) + its top edge, for taller stages
    background: '/images/ecolodge/fg-hero-bg.webp',
    backgroundTop: '/images/ecolodge/fg-hero-bg-top.webp',
    alt: 'Two anglers holding a large payara caught on the fly',
  },
};

export const callout = {
  label: 'The Amazon is calling',
  link: { label: 'Watch the Experience!', href: 'https://www.youtube.com/watch?v=TSkPYETQXLI' },
};

export const stats = [
  // Figma stat icons (60 × 60, #E8D202 on transparent)
  { icon: '/images/ecolodge/fg-stat-calendar.png', value: '5', label: 'Full days fishing' },
  { icon: '/images/ecolodge/fg-stat-bed.png', value: '16', label: 'Private rooms' },
  { icon: '/images/ecolodge/fg-stat-fish.png', value: '20+', label: 'Game species' },
  { icon: '/images/ecolodge/fg-stat-angler.png', value: '2', label: 'Anglers per guide' },
];

export const fishingIntro = {
  eyebrow: 'The fly fishing & the fish',
  vine: '/images/ecolodge/fg-intro-vine.png', // Figma jungle vine, top-left corner
  title: ['Sand beaches in the morning', 'Rock points in the afternoon'],
  paragraphs: [
    'At the meeting point of the Juruena and Teles Pires, EcoLodge da Barra puts you in one of the Amazon’s most remote and untouched fly fishing destinations — surrounded by rivers, lagoons and backwaters that create ideal conditions for targeting multiple species on the fly.',
    'One minute you’re working a white sand beach with surface flies; the next, casting toward a rocky point or quiet backwater in search of peacock bass, payara, arowana and other Amazon species. Every stretch of water calls for a different presentation, making each day on the fly completely different.',
  ],
  images: [
    { src: '/images/ecolodge/fg-intro-1.webp', alt: 'Peacock bass taking a popper fly' },
    // The Figma export of this circle (…tapajs-2.png) is the wrong photo; fg-intro-2 is cut from
    // intro-angler-peacock.webp (wider crop, both anglers) with the olive shadow baked in.
    { src: '/images/ecolodge/fg-intro-2.webp', alt: 'Two anglers holding peacock bass on the boat' },
  ],
};

export const speciesSection = {
  leaves: '/images/ecolodge/fg-species-leaves.png', // Figma jungle leaves, left edge
  title: ['Built around some of the Amazon’s', 'most exciting fly-fishing species.'],
  intro:
    'This is not a one-fish fishery. The confluence stacks blackwater and clearwater species in the same week, which is why nobody here fishes with a single rod.',
  species: [
    {
      name: 'Peacock Bass',
      latin: 'Cichla temensis',
      text: 'The Amazon’s most iconic gamefish. Aggressive, powerful and perfect on fly.',
      image: '/images/ecolodge/fg-species-peacock-bass.webp',
    },
    {
      name: 'Payara',
      latin: 'Hydrolycus scomberoides',
      text: 'The “vampire fish”. Big teeth, explosive strikes, and incredible fights in current.',
      image: '/images/ecolodge/fg-species-payara.webp',
    },
    {
      name: 'Arowana',
      latin: 'Osteoglossum bicirrhosum',
      text: 'One of the Amazon’s most exotic fish and an unforgettable target on fly.',
      image: '/images/ecolodge/fg-species-arowana.webp',
    },
    {
      name: 'Bicuda',
      latin: 'Boulengerella cuvieri',
      text: 'Speed, attitude and sharp teeth. Built to attack and fun to catch.',
      image: '/images/ecolodge/fg-species-bicuda.webp',
    },
    {
      name: 'Piranha',
      latin: 'Pygocentrus nattereri',
      text: 'A legendary part of the Amazon and one of the many species you may encounter.',
      image: '/images/ecolodge/fg-species-piranha.webp',
    },
  ],
  fullListLabel: 'The full list',
  fullListTitle: 'And another fifteen.',
  fullList: [
    'Tambaqui', 'Pirarara', 'Jaú', 'Cachara', 'Caparari', 'Matrinxã', 'Traíra',
    'Trairão', 'Jacundá', 'Corvina', 'Barbado', 'Piranambu', 'Pacu', 'Palmito', 'Piranha',
  ],
  fullListHighlight: 'Jaú',
};

export const lodge = {
  eyebrow: 'The lodge',
  title: ['It floats — so it follows the season,', 'not the other way around.'],
  intro:
    'EcoLodge da Barra is a floating lodge with sixteen air-conditioned private rooms, each with its own bathroom and a river view — the whole structure repositions to stay on top of the fish as water levels change through the season.',
  gallery: [
    { label: 'Floating lodge', image: '/images/ecolodge/fg-lodge-exterior.webp', alt: 'EcoLodge da Barra floating lodge exterior on the Tapajós River' },
    { label: 'Private room', image: '/images/ecolodge/fg-lodge-room.webp', alt: 'Air-conditioned private twin room' },
    { label: 'River-view balcony', image: '/images/ecolodge/fg-lodge-balcony.webp', alt: 'Private balcony overlooking the river' },
    { label: 'Private bathroom', image: '/images/ecolodge/fg-lodge-bathroom.webp', alt: 'Private bathroom with hot pressurised shower' },
    { label: 'Covered veranda', image: '/images/ecolodge/fg-lodge-veranda.webp', alt: 'Covered veranda with tackle room' },
    { label: 'Lounge deck', image: '/images/ecolodge/fg-lodge-lounge.webp', alt: 'Lounge deck opening onto the river' },
    { label: 'Open bar', image: '/images/ecolodge/fg-lodge-bar.webp', alt: 'Open bar aboard the lodge' },
  ],
  amenitiesTitle: 'Everything included in your stay',
  amenitiesNote: { strong: 'All-inclusive', rest: '— nothing extra to arrange' },
  amenities: [
    { icon: 'door', label: '16 private rooms' },
    { icon: 'snow', label: 'Air conditioning' },
    { icon: 'shower', label: 'Hot showers' },
    { icon: 'wifi', label: 'Starlink internet' },
    { icon: 'balcony', label: 'Private balconies' },
    { icon: 'meal', label: 'All-inclusive meals' },
    { icon: 'glass', label: 'Open bar' },
    { icon: 'shirt', label: 'Daily laundry' },
  ],
};

export const itinerary = {
  eyebrow: 'Your Amazon fly fishing adventure',
  title: ['Five full days of', 'guided fly fishing'],
  checklist: [
    { text: '5 full days of guided fly fishing', active: true },
    { text: 'Two anglers per guide/boat', active: true },
    { text: 'Double occupancy', active: true },
    { text: 'Single rooms available (additional)', active: true },
  ],
  cta: { label: 'Plan your fly fishing trip', href: '#eco-contact' },
  steps: [
    { kicker: 'Step 1', title: 'Be in Manaus', text: 'Arrive in Manaus. We’ll handle the rest.' },
    { kicker: 'Step 2', title: 'Manaus to EcoLodge', text: 'Charter flight to the lodge. Settle in and get ready.' },
    {
      kicker: 'Core of the trip',
      title: '5 Full Days',
      text: 'Five full days of guided fly fishing across rivers, lagoons and backwaters, targeting some of the Amazon’s most exciting species.',
      featured: true,
    },
    {
      kicker: 'Step 4',
      title: 'Return to Manaus',
      text: 'After your final day on the water, return to Manaus according to your travel schedule.',
    },
  ],
  note: 'Detailed itinerary and travel information provided after booking.',
};

export const infoCards = {
  included: {
    header: 'Tackle & gear ready to go',
    image: '/images/ecolodge/fg-card-lodge.webp',
    imageAlt: 'EcoLodge da Barra floating lodge on the river',
    eyebrow: 'What’s included',
    items: [
      'Manaus hotel (as scheduled)',
      'All airport & lodge transfers',
      'Round-trip charter flights',
      'Accommodations at EcoLodge',
      'All meals & open bar',
      '5 days guided fishing',
      'Boats, fuel & guides',
      'Starlink internet',
    ],
  },
  prepare: {
    header: 'Tackle & gear ready to go',
    image: '/images/ecolodge/fg-card-reels.webp',
    imageAlt: 'Rod and reel wall at EcoLodge da Barra',
    eyebrow: 'Prepare for your trip',
    intro: 'Every booked guest receives a detailed Trip Planner with everything you need:',
    items: [
      'Packing list',
      'Tackle & fly recommendations',
      'Travel & entry requirements',
      'Baggage & charter info',
      'What to expect at the lodge',
      'And much more',
    ],
    cta: { label: 'View Trip Planner', href: '#' },
  },
  host: {
    image: '/images/ecolodge/fg-host-full.webp', // full uncropped photo (3:4)
    eyebrow: 'Your host & booking contact',
    name: 'Capt. Drew Rodriguez',
    badge: 'Orvis Endorsed Guide',
    text: 'From the first question to the final cast, Drew is your point of contact for dates, reservations, travel, tackle and everything in between.',
    cta: { label: 'Contact Drew', href: 'mailto:drew@drewsguideservice.com' },
  },
};

export const photoStrip = [
  { src: '/images/ecolodge/fg-strip-1.webp', alt: 'Peacock bass on a popper' },
  { src: '/images/ecolodge/fg-strip-2.webp', alt: 'Anglers celebrating a peacock bass catch' },
  { src: '/images/ecolodge/fg-strip-3.webp', alt: 'Two anglers with peacock bass on the boat' },
];

export const ctaBanner = {
  eyebrow: 'Amazon fly fishing season · Late May to September',
  title: 'Clients come fishing',
  titleAccent: 'Friends come back',
  body:
    'You come for the fly fishing. You leave with stories, friendships and an Amazon experience you’ll never forget.',
  cta: { label: 'Explore the Fishing', href: '#fishing' },
  image: '/images/ecolodge/fg-cta-bg.webp',
};

export const footer = {
  about:
    'An extraordinary Amazon fishing adventure at the confluence of the Juruena and Teles Pires rivers, in the heart of the Brazilian Amazon.',
  quickLinks: [
    { label: '← Drew’s Guide Service', href: '/' },
    { label: 'The Fishing', href: '#fishing' },
    { label: 'The Lodge', href: '#lodge' },
    { label: 'Itinerary', href: '#itinerary' },
    { label: 'Included', href: '#included' },
    { label: 'Prepare', href: '#included' },
    { label: 'Dates & Pricing', href: '#eco-contact' },
    { label: 'Contact', href: '#eco-contact' },
  ],
  email: 'drew@drewsguideservice.com',
  phone: '+1 (786) 342-5791',
  phoneHref: 'tel:+17863425791',
  socials: [
    { icon: 'instagram', href: 'https://www.instagram.com/drews_guide_service/', label: 'Instagram' },
    { icon: 'facebook', href: 'https://www.facebook.com/captdrewsguideservice/', label: 'Facebook' },
    { icon: 'youtube', href: 'https://www.youtube.com/@captdrew1986', label: 'YouTube' },
    { icon: 'whatsapp', href: 'https://wa.me/17863425791', label: 'WhatsApp' },
  ],
  copyright: '© 2025 EcoLodge da Barra. All rights reserved.',
  credit: 'Hosted by Drew’s Guide Service · Orvis Endorsed Guide',
  creditHref: '/',
};
