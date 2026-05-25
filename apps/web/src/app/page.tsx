import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <Hero />
      <ProofRow />
      <HowItWorks />
      <UseCases />
      <PricingTeaser />
      <CtaInstall />
    </main>
  );
}

function Hero() {
  return (
    <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
      <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-3 py-1 text-xs font-medium text-neutral-700 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Pre-alpha · free path runs on-device with Chrome's built-in AI
      </span>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        Click anything.
        <br />
        Get a clean table.
      </h1>
      <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
        Pluck is an AI-powered visual web scraper for Chrome. Point at the data you want — Pluck
        infers the pattern, validates it on the live page, and ships it to CSV, Google Sheets, or
        your webhook. No selectors, no XPath, no Python.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="#install"
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Add to Chrome — free
        </a>
        <Link
          href="/pricing"
          className="rounded-md border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-300"
        >
          See pricing
        </Link>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-500">
        Free forever for individuals — Pluck never holds an LLM key on our servers.{' '}
        <Link href="/faq" className="underline underline-offset-4">
          How is this free?
        </Link>
      </p>
    </section>
  );
}

function ProofRow() {
  const items = [
    { kpi: '$0/mo', label: 'Founder operating cost' },
    { kpi: '0 servers', label: 'In your scrape pipeline' },
    { kpi: '$29', label: 'One-time Pro license' },
  ];
  return (
    <section className="grid gap-6 border-y border-neutral-200 py-10 sm:grid-cols-3 dark:border-neutral-800">
      {items.map((it) => (
        <div key={it.label} className="text-center">
          <div className="text-3xl font-semibold tracking-tight">{it.kpi}</div>
          <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{it.label}</div>
        </div>
      ))}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: 'Click examples',
      body: 'Open any page. Hit the Pluck icon, then click on a few rows of the data you want — a product name, a price, a "view profile" link, anything.',
    },
    {
      n: 2,
      title: 'Pluck figures out the rest',
      body: "An LLM looks at your picks and proposes selectors for every other row on the page. The proposal is validated against the live DOM and matches are highlighted in green before you save.",
    },
    {
      n: 3,
      title: 'Save, re-run, export',
      body: 'Save the job. Re-run it any time, or schedule it (Pro). Export to CSV, push to Google Sheets, or POST to a webhook.',
    },
  ];
  return (
    <section className="py-16">
      <h2 className="mb-10 text-3xl font-semibold tracking-tight">How it works</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800"
          >
            <div className="mb-3 flex size-8 items-center justify-center rounded-md bg-indigo-50 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {s.n}
            </div>
            <h3 className="mb-2 font-semibold">{s.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    {
      role: 'Recruiter',
      example: 'Build a candidate list from a directory of 600 profiles in two minutes.',
    },
    {
      role: 'Sales / SDR',
      example: 'Pull every company on a "Top 100 SaaS startups" list with their funding stage.',
    },
    {
      role: 'E-commerce operator',
      example: 'Track competitor SKUs and prices nightly. Pipe results to your inventory sheet.',
    },
    {
      role: 'Marketer',
      example: 'Scrape event attendee pages for outreach. Push to your CRM via webhook.',
    },
    {
      role: 'Researcher',
      example: 'Collect structured data from 50 journal pages without writing a parser.',
    },
    {
      role: 'Indie founder',
      example: 'Seed a directory product. Re-scrape weekly to stay fresh.',
    },
  ];
  return (
    <section className="py-16">
      <h2 className="mb-3 text-3xl font-semibold tracking-tight">Who uses Pluck</h2>
      <p className="mb-10 max-w-2xl text-neutral-600 dark:text-neutral-400">
        Built for the operator who needs the data this week, not next sprint.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <div
            key={c.role}
            className="rounded-lg border border-neutral-200 p-5 text-sm dark:border-neutral-800"
          >
            <div className="font-semibold">{c.role}</div>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">{c.example}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="py-16">
      <h2 className="mb-3 text-3xl font-semibold tracking-tight">Pay once. Use forever.</h2>
      <p className="mb-10 max-w-2xl text-neutral-600 dark:text-neutral-400">
        No subscriptions. The free tier is unlimited rows — we don't pay for your AI usage either
        way.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <PriceCard
          title="Free"
          price="$0"
          tagline="For individuals trying it out"
          features={[
            'Unlimited rows (uses your AI provider)',
            'Up to 3 saved jobs',
            'Manual runs',
            'CSV export',
          ]}
          cta={
            <a
              href="#install"
              className="block rounded-md border border-neutral-200 px-4 py-2 text-center text-sm font-semibold hover:border-neutral-400 dark:border-neutral-800"
            >
              Add to Chrome
            </a>
          }
        />
        <PriceCard
          title="Pro"
          price="$29"
          tagline="Lifetime license, one payment"
          highlighted
          features={[
            'Everything in Free',
            'Unlimited saved jobs',
            'Scheduled runs (Chrome alarms)',
            'Google Sheets + webhook export',
            'All AI providers',
            'Priority support',
          ]}
          cta={
            <Link
              href="/pricing"
              className="block rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Get Pro
            </Link>
          }
        />
      </div>
    </section>
  );
}

function PriceCard({
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
  features: string[];
  cta: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        highlighted
          ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-900 dark:bg-indigo-950/20'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-3xl font-bold tracking-tight">{price}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tagline}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </div>
  );
}

function CtaInstall() {
  return (
    <section
      id="install"
      className="my-16 rounded-2xl border border-neutral-200 bg-neutral-50 p-10 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 className="text-3xl font-semibold tracking-tight">Install Pluck</h2>
      <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
        Pluck is in pre-alpha — the Chrome Web Store listing is in review. While we wait, you can
        side-load the unpacked build from the repo.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="https://github.com/ErnestKostevich/Project-3#getting-started"
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Side-load instructions →
        </a>
        <Link
          href="/faq"
          className="rounded-md border border-neutral-200 px-5 py-2.5 text-sm font-semibold hover:border-neutral-400 dark:border-neutral-800"
        >
          Read the FAQ
        </Link>
      </div>
    </section>
  );
}
