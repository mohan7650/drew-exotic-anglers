import { useState } from 'react';

/**
 * Photo with a tinted fallback frame. Lazy-loads by default (pass
 * priority for above-the-fold images like the hero).
 */
export default function Img({ src, alt = '', className = '', priority = false, ...rest }) {
  const [missing, setMissing] = useState(false);

  return (
    <div className={`eco-img-frame ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : undefined}
        className={missing ? 'is-missing' : undefined}
        onError={() => setMissing(true)}
        {...rest}
      />
    </div>
  );
}
