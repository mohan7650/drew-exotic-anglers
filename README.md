# Amazon Exotic Anglers — React Website

## 🚀 Quick Start in VS Code

### Step 1 — Copy the video file
Place `hero_bg.mp4` inside:
```
public/videos/hero_bg.mp4
```

### Step 2 — Install dependencies
Open the terminal in VS Code (Ctrl + `) and run:
```bash
npm install
```

### Step 3 — Start the development server
```bash
npm start
```
The site opens automatically at http://localhost:3000

---

## 📁 Folder Structure

```
amazon-exotic-anglers/
│
├── public/
│   ├── index.html          ← Main HTML shell
│   └── videos/
│       └── hero_bg.mp4     ← ⚠️ Copy your video here!
│
├── src/
│   ├── index.js            ← React entry point
│   ├── App.js              ← Main app — imports all sections
│   │
│   ├── styles/
│   │   └── variables.css   ← All colors & fonts (edit here)
│   │
│   ├── components/         ← Reusable pieces
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   ├── WhatsAppButton.js
│   │   └── SectionTag.js
│   │
│   └── sections/           ← Each section of the page
│       ├── Hero.js / .css
│       ├── StatsBar.js / .css
│       ├── SponsorBar.js / .css
│       ├── WhyUs.js / .css
│       ├── About.js / .css
│       ├── Tours.js / .css
│       ├── LocationMap.js / .css
│       ├── Species.js / .css
│       ├── VideoSection.js / .css
│       ├── Testimonials.js / .css
│       ├── Contact.js / .css
│       └── Footer.js / .css
│
└── package.json
```

---

## ✏️ How to Edit

| What to change | Where to go |
|---|---|
| Colors | `src/styles/variables.css` |
| Nav links | `src/components/Navbar.js` |
| Hero text | `src/sections/Hero.js` |
| Stats numbers | `src/sections/StatsBar.js` |
| Tour cards | `src/sections/Tours.js` |
| Map locations | `src/sections/LocationMap.js` |
| Contact details | `src/sections/Contact.js` |
| Footer links | `src/sections/Footer.js` |

---

## 🌐 Deploy to Netlify (Free)

```bash
npm run build
```
Then drag the `build/` folder to netlify.com/drop

