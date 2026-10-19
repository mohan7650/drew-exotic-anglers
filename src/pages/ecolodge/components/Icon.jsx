// Lightweight inline SVG icon set (stroke icons, inherit currentColor).
const paths = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8.5l5.5 3.5-5.5 3.5z" fill="currentColor" />
    </>
  ),
  playSolid: (
    <>
      <circle cx="12" cy="12" r="11" fill="currentColor" stroke="none" />
      <path d="M10 7.8l6 4.2-6 4.2z" fill="#636a04" stroke="none" />
    </>
  ),
  checkSolid: (
    <>
      <circle cx="12" cy="12" r="12" fill="currentColor" stroke="none" />
      <path d="M7.2 12.4l3.2 3.2 6.4-6.6" stroke="var(--eco-check-mark, #feffeb)" strokeWidth="2.6" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path d="M7.5 12.3l3 3 6-6" stroke="#fff" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <circle cx="12" cy="15" r="2.6" />
      <path d="M11.2 14v2l1.6-1z" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18V8M21 18v-5a3 3 0 00-3-3H3" />
      <path d="M3 14h18M3 18h18" />
      <rect x="5.5" y="10.5" width="5" height="3" rx="1" />
    </>
  ),
  fish: (
    <>
      <path d="M3 12c3-4.5 7.5-6 11.5-4.8 2 .6 3.6 2 4.5 4.8-.9 2.8-2.5 4.2-4.5 4.8C10.5 18 6 16.5 3 12z" />
      <path d="M3 12l-1.5-3M3 12l-1.5 3" />
      <circle cx="15.5" cy="11" r=".8" fill="currentColor" />
      <path d="M8 9.5c.8 1.5.8 3.5 0 5M11 9c.8 1.8.8 4.2 0 6" />
    </>
  ),
  angler: (
    <>
      <circle cx="10" cy="5.5" r="2.2" />
      <path d="M6 21v-6.5a4 4 0 018 0V21" />
      <path d="M14 12l6-8.5M20 3.5V12" />
      <path d="M8 15h4" />
    </>
  ),
  door: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <circle cx="15" cy="12" r=".9" fill="currentColor" />
    </>
  ),
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5" />,
  shower: (
    <>
      <path d="M4 20V7a4 4 0 017.5-2" />
      <path d="M9 7.5a4 4 0 017.5 0z" />
      <path d="M10.5 11v1M13 11.5v1M15.5 11v1M11.5 14.5v1M14.5 14.5v1" />
    </>
  ),
  wifi: (
    <>
      <path d="M2.5 9a14 14 0 0119 0M5.5 12.5a9.5 9.5 0 0113 0M8.5 16a5 5 0 017 0" />
      <circle cx="12" cy="19" r=".9" fill="currentColor" />
    </>
  ),
  balcony: (
    <>
      <path d="M3 21h18M4 13h16M6 13v8M10 13v8M14 13v8M18 13v8" />
      <path d="M7 13V4h10v9" />
    </>
  ),
  meal: (
    <>
      <path d="M4 3v7a2 2 0 002 2h0a2 2 0 002-2V3M6 12v9" />
      <path d="M18 3c-2 0-3 2.5-3 6s1 4 3 4v8V3z" />
    </>
  ),
  glass: <path d="M6 3h12l-1 6a5 5 0 01-10 0zM12 14v7M8.5 21h7" />,
  shirt: <path d="M8 3L3 6.5 5.5 10 7 9v12h10V9l1.5 1L21 6.5 16 3a4 4 0 01-8 0z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3.5 6l8.5 7 8.5-7" />
    </>
  ),
  phone: (
    <path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 005.7 5.7L15 13l4 1.5V18a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.6" cy="7.4" r=".7" fill="currentColor" />
    </>
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="M10.5 9.5l4 2.5-4 2.5z" fill="currentColor" />
    </>
  ),
  facebook: <path d="M14.5 8H16V4.5h-2.2C11.4 4.5 10 6 10 8.4V10H8v3.4h2V20h3.4v-6.6h2.3l.4-3.4h-2.7V8.9c0-.6.4-.9 1.1-.9z" />,
  whatsapp: (
    <>
      <path d="M4.5 19.5l1.2-3.9A8 8 0 1 1 8.6 18.4z" />
      <path d="M9.2 8.6c.3-.4.7-.4 1-.1l.8 1.6c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.5-.3.8-.2l1.6.8c.3.2.3.6 0 1-.6.8-1.6 1-2.6.6-1.9-.8-3.4-2.3-4.2-4.2-.3-1-.2-2 .3-2.8z" fill="currentColor" stroke="none" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

export default function Icon({ name, size = 20, strokeWidth = 1.6, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
