'use client';

import { motion, useInView, useMotionValue, useTransform, animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

/**
 * Number that counts up from 0 to `to` when scrolled into view.
 * Supports a string prefix (e.g. "$") and suffix (e.g. "/mo").
 */
export function AnimatedCounter({
  to,
  prefix = '',
  suffix = '',
  duration = 1.4,
  formatter,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  formatter?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();
  const motionValue = useMotionValue(prefersReducedMotion ? to : 0);
  const rounded = useTransform(motionValue, (n) =>
    formatter ? formatter(n) : Math.round(n).toString(),
  );

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    const controls = animate(motionValue, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, motionValue, to, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
