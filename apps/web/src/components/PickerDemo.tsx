'use client';

import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

/**
 * Animated mockup of Pluck in action.
 *
 * Cycles through five frames, looping forever:
 *   1. idle   — page visible, cursor offscreen
 *   2. pick1  — cursor clicks first row, green outline appears
 *   3. pick2  — cursor clicks second row
 *   4. infer  — overlay shows "Infer pattern" button being clicked
 *   5. result — every row gets a dashed green outline, extracted table fades in
 *
 * Built with motion/react. Honors prefers-reduced-motion: when set, the mock
 * stays on frame 5 (the most informative) without animating.
 */

type Frame = 'idle' | 'pick1' | 'pick2' | 'infer' | 'result';

const FRAME_SEQUENCE: { frame: Frame; ms: number }[] = [
  { frame: 'idle', ms: 1200 },
  { frame: 'pick1', ms: 1600 },
  { frame: 'pick2', ms: 1600 },
  { frame: 'infer', ms: 1600 },
  { frame: 'result', ms: 4000 },
];

const ROWS = [
  { title: 'AI replaces Octoparse for ops teams', score: '142', source: 'pluck.app' },
  { title: 'How we built a $0/mo SaaS', score: '88', source: 'pluck.app' },
  { title: 'Show HN: AI visual web scraper', score: '294', source: 'pluck.app' },
  { title: 'Inside Pluck\'s zero-cost arch', score: '67', source: 'pluck.app' },
  { title: 'The end of XPath', score: '203', source: 'pluck.app' },
];

export function PickerDemo() {
  const prefersReducedMotion = useReducedMotion();
  const [frame, setFrame] = useState<Frame>(prefersReducedMotion ? 'result' : 'idle');

  useEffect(() => {
    if (prefersReducedMotion) return;
    let cancelled = false;
    let stepIdx = 0;
    function next() {
      if (cancelled) return;
      const step = FRAME_SEQUENCE[stepIdx]!;
      setFrame(step.frame);
      stepIdx = (stepIdx + 1) % FRAME_SEQUENCE.length;
      setTimeout(next, step.ms);
    }
    next();
    return () => {
      cancelled = true;
    };
  }, [prefersReducedMotion]);

  const showOverlay = frame === 'pick1' || frame === 'pick2' || frame === 'infer' || frame === 'result';
  const showResults = frame === 'result';
  const picksOutlined: number[] = (() => {
    if (frame === 'idle') return [];
    if (frame === 'pick1') return [0];
    if (frame === 'pick2') return [0, 2];
    return [0, 2];
  })();
  const allMatched = frame === 'result';

  // Cursor position by frame.
  const cursorPos = (() => {
    switch (frame) {
      case 'idle':
        return { x: -50, y: 250, opacity: 0 };
      case 'pick1':
        return { x: 110, y: 110, opacity: 1 };
      case 'pick2':
        return { x: 140, y: 215, opacity: 1 };
      case 'infer':
        return { x: 425, y: 280, opacity: 1 };
      case 'result':
        return { x: 425, y: 280, opacity: 0 };
    }
  })();

  return (
    <div className="relative w-full max-w-4xl">
      {/* Aurora glow behind the browser */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(99,102,241,0.45), transparent 60%), radial-gradient(ellipse 50% 60% at 70% 70%, rgba(16,185,129,0.35), transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 shadow-2xl backdrop-blur"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-neutral-900/60 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-400/80" />
            <span className="size-3 rounded-full bg-yellow-400/80" />
            <span className="size-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-neutral-800/60 px-3 py-1 text-[11px] text-neutral-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-3 text-emerald-400">
              <path
                fillRule="evenodd"
                d="M10 1a4 4 0 00-4 4v3H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 7V5a2 2 0 10-4 0v3h4z"
                clipRule="evenodd"
              />
            </svg>
            <span>news.example.com</span>
          </div>
        </div>

        {/* Page content */}
        <div className="relative grid grid-cols-1 gap-0 sm:grid-cols-[1fr_280px]">
          <div className="relative p-4 sm:p-6">
            <div className="mb-4 text-xs uppercase tracking-wider text-neutral-500">Top stories</div>
            <ul className="space-y-2">
              {ROWS.map((row, i) => {
                const isOutlined = picksOutlined.includes(i);
                const isMatched = allMatched;
                return (
                  <motion.li
                    key={i}
                    initial={false}
                    animate={{
                      borderColor: isOutlined
                        ? 'rgba(16,185,129,0.9)'
                        : isMatched
                          ? 'rgba(16,185,129,0.7)'
                          : 'rgba(255,255,255,0.06)',
                      borderStyle: isMatched && !isOutlined ? 'dashed' : 'solid',
                      backgroundColor: isOutlined
                        ? 'rgba(16,185,129,0.10)'
                        : 'rgba(255,255,255,0.02)',
                    }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center justify-between rounded-md border bg-white/[0.02] p-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-xs text-neutral-500">{i + 1}.</span>
                      <span className="truncate text-neutral-200">{row.title}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs">
                      <span className="text-neutral-400">{row.score} pts</span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-500">{row.source}</span>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          {/* Pluck overlay */}
          <AnimatePresence>
            {showOverlay && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35 }}
                className="absolute right-4 top-16 z-20 w-[250px] rounded-xl border border-white/10 bg-neutral-900/95 p-3 shadow-2xl backdrop-blur sm:relative sm:right-0 sm:top-0 sm:m-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">🍒 Pluck</span>
                  <span className="text-neutral-500">
                    {showResults
                      ? '5 rows · 98%'
                      : `${picksOutlined.length} picks`}
                  </span>
                </div>

                {!showResults ? (
                  <>
                    <div className="space-y-1.5 text-[11px]">
                      {picksOutlined.map((idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-2 py-1.5"
                        >
                          <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 font-mono text-[10px] text-emerald-200">
                            col_{idx === 0 ? '1' : '2'}
                          </span>
                          <span className="truncate text-neutral-300">
                            {ROWS[idx]!.title.slice(0, 20)}…
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      animate={{
                        scale: frame === 'infer' ? [1, 0.94, 1] : 1,
                        backgroundColor: frame === 'infer' ? '#4f46e5' : '#6366f1',
                      }}
                      transition={{ duration: 0.4 }}
                      className="mt-3 w-full rounded-md py-1.5 text-[11px] font-semibold text-white"
                      style={{ pointerEvents: 'none' }}
                    >
                      {frame === 'infer' ? 'Inferring…' : 'Infer pattern'}
                    </motion.button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-1"
                  >
                    <div className="grid grid-cols-[1fr_50px] gap-1 border-b border-white/10 pb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                      <span>title</span>
                      <span className="text-right">score</span>
                    </div>
                    {ROWS.map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        className="grid grid-cols-[1fr_50px] gap-1 text-[10px]"
                      >
                        <span className="truncate text-neutral-300">{row.title}</span>
                        <span className="text-right font-mono text-emerald-300">
                          {row.score}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cursor */}
          <motion.div
            aria-hidden
            animate={cursorPos}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute left-0 top-0 z-30"
          >
            <svg width="20" height="22" viewBox="0 0 20 22" className="drop-shadow-lg">
              <path
                d="M2 2L18 12L10 13L7 20L2 2Z"
                fill="white"
                stroke="black"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Frame indicator */}
      {!prefersReducedMotion && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {FRAME_SEQUENCE.map(({ frame: f }) => (
            <div
              key={f}
              className={`h-1 rounded-full transition-all duration-300 ${
                frame === f ? 'w-6 bg-indigo-400' : 'w-1.5 bg-neutral-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
