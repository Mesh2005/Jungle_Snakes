/**
 * Ambient fireflies: small glowing dots that drift upward. Theme-responsive via --theme-accent.
 * Uses the existing .animate-firefly keyframe from index.css.
 */

import React, { useState, useEffect } from 'react';

const FIREFLY_COUNT = 20;

interface FireflyItem {
  id: number;
  left: string;
  bottom: string;
  duration: number;
  delay: number;
  size: number;
}

function makeFireflies(): FireflyItem[] {
  return Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    bottom: `${Math.random() * 25}%`,
    duration: 5 + Math.random() * 8,
    delay: Math.random() * 15,
    size: 4 + Math.random() * 4,
  }));
}

export function Fireflies() {
  const [fireflies, setFireflies] = useState<FireflyItem[]>([]);

  useEffect(() => {
    // Initialize random positions in effect to avoid impure Math.random during render
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time init from impure source
    setFireflies(makeFireflies());
  }, []);

  if (fireflies.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {fireflies.map(({ id, left, bottom, duration, delay, size }) => (
        <div
          key={id}
          className="animate-firefly rounded-full bg-[var(--theme-accent)]"
          style={{
            position: 'absolute',
            left,
            bottom,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `-${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Fireflies;
