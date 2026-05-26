'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';

export function ThanksContent() {
  const params = useSearchParams();
  const email = params.get('email');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 16 }}
        className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-8 text-emerald-300">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <h1 className="text-4xl font-semibold tracking-tighter text-white">Payment received</h1>
      <p className="mx-auto mt-3 max-w-md text-neutral-400">
        Once the transaction confirms on-chain (usually a few minutes), Pluck Pro&apos;s lifetime
        license lands in{' '}
        {email ? (
          <strong className="text-white">{email}</strong>
        ) : (
          <span>your inbox</span>
        )}
        . Paste it into the extension&apos;s Settings → License panel and you&apos;re Pro.
      </p>
      <p className="mt-4 text-xs text-neutral-500">
        Didn&apos;t arrive within 15 minutes? Email{' '}
        <a href="mailto:ernest2011kostevich@gmail.com" className="text-neutral-300 underline underline-offset-4 hover:text-white">
          ernest2011kostevich@gmail.com
        </a>{' '}
        with your transaction ID — we&apos;ll reissue manually.
      </p>
    </motion.div>
  );
}
