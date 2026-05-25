import Link from 'next/link';
import { Suspense } from 'react';
import { ThanksContent } from './ThanksContent';

export const metadata = {
  title: 'Payment received — Pluck',
};

export default function ThanksPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-6 py-20">
      <Suspense
        fallback={
          <div className="text-center text-neutral-400">Loading…</div>
        }
      >
        <ThanksContent />
      </Suspense>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/"
          className="rounded-md border border-white/15 bg-white/[0.03] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.06]"
        >
          ← Back to home
        </Link>
        <a
          href="https://github.com/ErnestKostevich/Project-3#getting-started"
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100"
        >
          Get Pluck installed →
        </a>
      </div>
    </main>
  );
}
