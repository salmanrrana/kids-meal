import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useState } from 'react';
import './SwipeCard.css';

export function SwipeCard({ recipe, onSwipeLeft, onSwipeRight, onTap }) {
  const [gone, setGone] = useState(false);
  const [direction, setDirection] = useState(null);

  const [{ x, y, rotate, scale, opacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    config: { friction: 50, tension: 500 },
  }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx], tap }) => {
      if (tap && onTap) {
        onTap(recipe);
        return;
      }

      // Threshold for swipe
      const trigger = vx > 0.2 || Math.abs(mx) > 150;

      if (!active && trigger) {
        // Swipe completed
        const dir = xDir > 0 ? 'right' : 'left';
        setDirection(dir);
        setGone(true);

        api.start({
          x: (200 + window.innerWidth) * (xDir > 0 ? 1 : -1),
          rotate: mx / 10,
          opacity: 0,
          config: { friction: 50, tension: 200 },
          onRest: () => {
            if (dir === 'right') {
              onSwipeRight?.(recipe);
            } else {
              onSwipeLeft?.(recipe);
            }
          },
        });
      } else if (!active) {
        // Return to center
        api.start({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          config: { friction: 50, tension: 500 },
        });
        setDirection(null);
      } else {
        // During drag
        api.start({
          x: mx,
          y: 0,
          rotate: mx / 20,
          scale: active ? 1.02 : 1,
          immediate: name => active && name === 'x',
        });
        setDirection(mx > 50 ? 'right' : mx < -50 ? 'left' : null);
      }
    },
    {
      filterTaps: true,
      rubberband: true,
    }
  );

  if (gone) return null;

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <animated.div
      {...bind()}
      className="swipe-card"
      style={{
        x,
        y,
        rotate: rotate.to(r => `${r}deg`),
        scale,
        opacity,
        touchAction: 'none',
      }}
    >
      {/* Swipe indicators */}
      <div className={`swipe-indicator like ${direction === 'right' ? 'visible' : ''}`}>
        LIKE
      </div>
      <div className={`swipe-indicator nope ${direction === 'left' ? 'visible' : ''}`}>
        NOPE
      </div>

      {/* Card content */}
      <div className="card-image-container">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="card-image"
          draggable={false}
        />
      </div>

      <div className="card-content">
        <h2 className="card-title">{recipe.title}</h2>

        <div className="card-tags">
          {recipe.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          <span className="tag time">{totalTime} min</span>
        </div>
      </div>
    </animated.div>
  );
}
