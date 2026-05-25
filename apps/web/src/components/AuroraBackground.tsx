'use client';

import { motion, useReducedMotion } from 'motion/react';

/**
 * Soft, slowly-shifting aurora gradient background. Sits in -z-10 behind
 * the hero. Uses two large blurred radial gradients animating their position.
 */
export function AuroraBackground() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -left-32 -top-32 size-[600px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(99,102,241,0.55), transparent 70%)',
        }}
        animate={
          prefersReducedMotion
            ? {}
            : { x: [0, 40, 0], y: [0, 30, 0] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute right-0 top-64 size-[500px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(16,185,129,0.45), transparent 70%)',
        }}
        animate={
          prefersReducedMotion
            ? {}
            : { x: [0, -40, 0], y: [0, 50, 0] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute left-1/3 top-1/2 size-[400px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(168,85,247,0.4), transparent 70%)',
        }}
        animate={
          prefersReducedMotion
            ? {}
            : { x: [0, 30, -20, 0], y: [0, -20, 30, 0] }
        }
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Subtle grain texture using SVG noise for premium feel */}
      <svg
        aria-hidden
        className="absolute inset-0 size-full opacity-[0.025] mix-blend-overlay"
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
