'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function CheckoutPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/nowpayments/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { invoice_url?: string; error?: string };
      if (!res.ok || !data.invoice_url) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      // Redirect to NOWPayments hosted checkout.
      window.location.href = data.invoice_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-semibold tracking-tighter text-white">
          Buy{' '}
          <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
            Pluck Pro
          </span>
        </h1>
        <p className="mt-3 text-neutral-400">
          $29 one-time, paid in crypto (BTC, ETH, USDT, USDC, and more). Your lifetime license is
          emailed to you the second the payment confirms on-chain.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium text-neutral-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              We email the license here. We don&apos;t use it for anything else.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group relative w-full overflow-hidden rounded-md bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Creating invoice…
              </span>
            ) : (
              <>Continue to crypto checkout · $29</>
            )}
          </button>

          <ul className="space-y-1.5 pt-2 text-xs text-neutral-500">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">✓</span>
              <span>Lifetime license. No subscription. No recurring charges.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">✓</span>
              <span>14-day full refund — just reply to the license email.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">✓</span>
              <span>Powered by NOWPayments. Pluck doesn&apos;t touch your card or wallet.</span>
            </li>
          </ul>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Not in crypto?{' '}
          <Link href="/faq" className="text-neutral-300 underline underline-offset-4 hover:text-white">
            See the FAQ
          </Link>{' '}
          for alternatives, or email{' '}
          <a
            href="mailto:ernest2011kostevich@gmail.com"
            className="text-neutral-300 underline underline-offset-4 hover:text-white"
          >
            ernest2011kostevich@gmail.com
          </a>
          .
        </p>
      </motion.div>
    </main>
  );
}
