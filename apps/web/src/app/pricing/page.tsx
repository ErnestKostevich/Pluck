import Link from 'next/link';

export const metadata = {
  title: 'Pricing — Pluck',
  description:
    'Pluck is free for individuals (unlimited rows). Pro is $29 one-time, lifetime — no subscriptions, ever.',
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-semibold tracking-tight">Pay once. Use forever.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
          We don&apos;t hold an AI key on a server, so there&apos;s nothing to charge you monthly for.
          Pluck Pro is a one-time license — buy it, paste the key, done.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
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
              className="block rounded-md border border-neutral-200 px-5 py-2.5 text-center text-sm font-semibold hover:border-neutral-400 dark:border-neutral-800"
            >
              Add to Chrome
            </a>
          }
        />
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
              className="block rounded-md bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Buy Pro · $29
            </a>
          }
        />
      </div>

      <section className="mt-16 rounded-xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-xl font-semibold">Caveats, stated up front</h2>
        <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
          <li>
            <strong className="text-neutral-900 dark:text-neutral-100">
              Scheduled runs need Chrome open.
            </strong>{' '}
            Pluck uses the browser&apos;s built-in alarms. If Chrome isn&apos;t running, the alarm
            doesn&apos;t fire. A real cloud-worker option lands in a future paid Business tier — we
            don&apos;t bill you for capacity that doesn&apos;t exist yet.
          </li>
          <li>
            <strong className="text-neutral-900 dark:text-neutral-100">No refunds after 14 days.</strong>{' '}
            Buy with confidence: if Pluck doesn&apos;t work for you in the first two weeks, full
            refund, no questions. After that, the license is yours.
          </li>
          <li>
            <strong className="text-neutral-900 dark:text-neutral-100">Future updates free.</strong>{' '}
            Pro is lifetime — every feature we add on top of Pro is included.
          </li>
        </ul>
      </section>

      <div className="mt-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Questions? See the{' '}
        <Link href="/faq" className="underline underline-offset-4">
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
      className={`rounded-2xl border p-8 ${
        highlighted
          ? 'border-indigo-300 bg-indigo-50/30 dark:border-indigo-900 dark:bg-indigo-950/20'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight">{price}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tagline}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {features.map((f, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 ${
              f.highlight ? 'font-medium text-neutral-900 dark:text-neutral-100' : ''
            }`}
          >
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </div>
  );
}
