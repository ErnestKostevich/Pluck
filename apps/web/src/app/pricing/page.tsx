import Link from 'next/link';
import { AnimatedOnScroll } from '@/components/AnimatedOnScroll';

export const metadata = {
  title: 'Pricing — Pluck',
  description:
    'Pluck is free for individuals (unlimited rows). Pro is $29 one-time, lifetime — no subscriptions, ever.',
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <AnimatedOnScroll>
        <header className="mb-14 text-center">
          <h1 className="text-5xl font-semibold tracking-tighter text-white sm:text-6xl">
            Pay once.{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
              Use forever.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">
            We don&apos;t hold an AI key on a server, so there&apos;s nothing to charge you monthly for.
            Pluck Pro is a one-time license — buy it, paste the key, done.
          </p>
        </header>
      </AnimatedOnScroll>

      <div className="grid gap-6 sm:grid-cols-2">
        <AnimatedOnScroll delay={0.05}>
          <Card
            title="Free"
            price="$0"
            tagline="Forever. Unlimited rows."
            features={[
              { text: 'Unlimited rows (your AI provider, your bill)', highlight: true },
              { text: 'Up to 3 saved jobs' },
              { text: 'Manual runs from the popup' },
              { text: 'CSV download' },
              { text: 'Works with Chrome built-in AI (no key needed)' },
              { text: 'Works with your Anthropic / Gemini / OpenAI key (BYOK)' },
            ]}
            cta={
              <a
                href="https://github.com/ErnestKostevich/Project-3#getting-started"
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-md border border-white/15 bg-white/[0.03] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.06]"
              >
                Add to Chrome
              </a>
            }
          />
        </AnimatedOnScroll>
        <AnimatedOnScroll delay={0.1}>
          <Card
            highlighted
            title="Pro"
            price="$29"
            tagline="One-time. Lifetime license."
            features={[
              { text: 'Everything in Free' },
              { text: 'Unlimited saved jobs', highlight: true },
              { text: 'Scheduled runs (every N minutes via chrome.alarms)', highlight: true },
              { text: 'Google Sheets export', highlight: true },
              { text: 'Webhook delivery (HMAC-signed)', highlight: true },
              { text: 'Multiple AI providers' },
              { text: 'Priority email support' },
            ]}
            cta={
              <a
                href="https://buy.polar.sh/pluck-pro"
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-md bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100"
              >
                Buy Pro · $29
              </a>
            }
          />
        </AnimatedOnScroll>
      </div>

      <AnimatedOnScroll delay={0.15}>
        <section className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="text-xl font-semibold text-white">Caveats, stated up front</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-400">
            <li>
              <strong className="text-white">Scheduled runs need Chrome open.</strong> Pluck uses
              the browser&apos;s built-in alarms. If Chrome isn&apos;t running, the alarm doesn&apos;t
              fire. A real cloud-worker option lands in a future paid Business tier — we don&apos;t
              bill you for capacity that doesn&apos;t exist yet.
            </li>
            <li>
              <strong className="text-white">No refunds after 14 days.</strong> Buy with confidence:
              if Pluck doesn&apos;t work for you in the first two weeks, full refund, no questions.
              After that, the license is yours.
            </li>
            <li>
              <strong className="text-white">Future updates free.</strong> Pro is lifetime — every
              feature we add on top of Pro is included.
            </li>
          </ul>
        </section>
      </AnimatedOnScroll>

      <div className="mt-10 text-center text-sm text-neutral-500">
        Questions? See the{' '}
        <Link href="/faq" className="text-neutral-300 underline underline-offset-4 hover:text-white">
          FAQ
        </Link>
        .
      </div>
    </main>
  );
}

function Card({
  title,
  price,
  tagline,
  features,
  cta,
  highlighted,
}: {
  title: string;
  price: string;
  tagline: string;
  features: { text: string; highlight?: boolean }[];
  cta: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl border p-8 transition-all ${
        highlighted
          ? 'border-indigo-400/30 bg-gradient-to-b from-indigo-500/15 via-transparent to-transparent shadow-xl shadow-indigo-500/10'
          : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      {highlighted && (
        <>
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-64 rounded-full bg-indigo-500/20 blur-3xl"
          />
          <div className="absolute right-6 top-6 rounded-full bg-indigo-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-200 ring-1 ring-indigo-400/30">
            Recommended
          </div>
        </>
      )}
      <h2 className="relative text-xl font-semibold text-white">{title}</h2>
      <div className="relative mt-2 flex items-baseline gap-2">
        <span className="text-6xl font-bold tracking-tight text-white">{price}</span>
        {price !== '$0' && <span className="text-sm text-neutral-500">USD</span>}
      </div>
      <p className="relative mt-1 text-sm text-neutral-400">{tagline}</p>
      <ul className="relative mt-6 space-y-2.5 text-sm">
        {features.map((f, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 ${
              f.highlight ? 'font-medium text-white' : 'text-neutral-300'
            }`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-emerald-400">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      <div className="relative mt-8">{cta}</div>
    </div>
  );
}
