import { useState } from 'react';
import './Photo.css';

/**
 * Food photo on a flat paper placeholder (shown while loading and if the image
 * fails), with a faint edge so white-background photos still read as a square.
 * Size, shape, and radius come from `className`; it's a <span> so it can sit
 * inside a button. Photos load lazily; `eager` loads one right away at high
 * priority (the recipe page's main photo).
 *
 *   <Photo src={recipe.image} className="tile-photo" />
 *   <Photo src={recipe.image} className="recipe-photo" eager />
 *
 * @param {{ src?: string, className?: string, eager?: boolean }} props
 */
export function Photo({ src, className = '', eager = false }) {
  // The src that failed, so a new src (same Photo, another recipe) gets its
  // own chance to load.
  const [failedSrc, setFailedSrc] = useState(
    /** @type {string | undefined} */ (undefined),
  );
  return (
    <span className={`photo ${className}`}>
      {src && src !== failedSrc && (
        <img
          src={src}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          draggable={false}
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  );
}
