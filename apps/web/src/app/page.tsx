import Link from 'next/link';
import { PickerDemo } from '@/components/PickerDemo';
import { AnimatedOnScroll } from '@/components/AnimatedOnScroll';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AuroraBackground } from '@/components/AuroraBackground';

export default function HomePage() {
  return (
    <main className="relative">
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
    <section className="relative overflow-hidden">
      <AuroraBackground />
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 px-6 pb-20 pt-16 sm:pt-24">
        <AnimatedOnScroll delay={0}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            Pre-alpha · free path runs on-device with Chrome built-in AI
          </span>
        </AnimatedOnScroll>

        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <AnimatedOnScroll delay={0.05}>
              <h1 className="text-5xl font-semibold tracking-tighter text-white sm:text-6xl lg:text-7xl">
                Click anything.
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
                  Get a clean table.
                </span>
              </h1>
            </AnimatedOnScroll>
            <AnimatedOnScroll delay={0.1}>
              <p className="max-w-xl text-lg text-neutral-300">
                Pluck is an AI-powered visual web scraper for Chrome. Point at the data you want — Pluck
                infers the pattern, validates it on the live page, and ships it to CSV, Google Sheets,
                or your webhook. No selectors, no XPath, no Python.
              </p>
            </AnimatedOnScroll>
            <AnimatedOnScroll delay={0.15}>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#install"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow-lg shadow-indigo-500/10 transition-all hover:shadow-indigo-500/30"
                >
                  <span className="relative z-10">Add to Chrome — free</span>
                  <span className="relative z-10 transition-transform group-hover:translate-x-0.5">→</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-0 bg-gradient-to-r from-white via-indigo-50 to-white opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </a>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/30 hover:bg-white/[0.06]"
                >
                  See pricing
                </Link>
              </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll delay={0.2}>
              <p className="text-xs text-neutral-500">
                Free forever for individuals — Pluck never holds an LLM key on our servers.{' '}
                <Link href="/faq" className="text-neutral-300 underline underline-offset-4 hover:text-white">
                  How is this free?
                </Link>
              </p>
            </AnimatedOnScroll>
          </div>

          <AnimatedOnScroll delay={0.25}>
            <PickerDemo />
          </AnimatedOnScroll>
        </div>
      </div>
    </section>
  );
}

function ProofRow() {
  const items = [
    { kpi: '$0', suffix: '/mo', label: 'Founder operating cost', accent: 'emerald' },
    { kpi: '0', suffix: ' servers', label: 'In your scrape pipeline', accent: 'indigo' },
    { kpi: '$29', suffix: '', label: 'One-time Pro license', accent: 'fuchsia' },
  ] as const;
  const accentMap = {
    emerald: 'from-emerald-300 to-emerald-500',
    indigo: 'from-indigo-300 to-indigo-500',
    fuchsia: 'from-fuchsia-300 to-fuchsia-500',
  };
  return (
    <section className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        {items.map((it, i) => (
          <AnimatedOnScroll key={it.label} delay={i * 0.08} className="text-center">
            <div
              className={`bg-gradient-to-br ${accentMap[it.accent]} bg-clip-text text-5xl font-bold tracking-tight text-transparent`}
            >
              {it.kpi.startsWith('$') ? (
                <AnimatedCounter
                  to={Number(it.kpi.replace('$', ''))}
                  prefix="$"
                  suffix={it.suffix}
                />
              ) : (
                <AnimatedCounter to={Number(it.kpi)} suffix={it.suffix} />
              )}
            </div>
            <div className="mt-2 text-sm text-neutral-400">{it.label}</div>
          </AnimatedOnScroll>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: 'Click examples',
      body: 'Open any page. Hit the Pluck icon, then click on a few rows of the data you want — a product name, a price, a "view profile" link.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
          <path d="M9 11l3 3 8-8" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
    {
      n: 2,
      title: 'AI infers the pattern',
      body: 'An LLM looks at your picks and proposes selectors for every other row on the page. The proposal is validated against the live DOM and matches are highlighted in green before you save.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ),
    },
    {
      n: 3,
      title: 'Save, re-run, export',
      body: 'Save the job. Re-run it any time, or schedule it (Pro). Export to CSV, push to Google Sheets, or POST to a webhook.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      ),
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <AnimatedOnScroll>
        <h2 className="mb-3 text-4xl font-semibold tracking-tight text-white">How it works</h2>
        <p className="mb-12 max-w-xl text-neutral-400">
          Three steps from "I need this data" to a CSV. No code, no setup.
        </p>
      </AnimatedOnScroll>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <AnimatedOnScroll key={s.n} delay={i * 0.1}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 transition-colors hover:border-white/20">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                  {s.icon}
                </div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Step {s.n}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{s.body}</p>
              </div>
            </div>
          </AnimatedOnScroll>
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
      tint: 'from-pink-500/10 to-transparent',
    },
    {
      role: 'Sales / SDR',
      example: 'Pull every company on a "Top 100 SaaS startups" list with their funding stage.',
      tint: 'from-indigo-500/10 to-transparent',
    },
    {
      role: 'E-commerce operator',
      example: 'Track competitor SKUs and prices nightly. Pipe results to your inventory sheet.',
      tint: 'from-emerald-500/10 to-transparent',
    },
    {
      role: 'Marketer',
      example: 'Scrape event attendee pages for outreach. Push to your CRM via webhook.',
      tint: 'from-orange-500/10 to-transparent',
    },
    {
      role: 'Researcher',
      example: 'Collect structured data from 50 journal pages without writing a parser.',
      tint: 'from-violet-500/10 to-transparent',
    },
    {
      role: 'Indie founder',
      example: 'Seed a directory product. Re-scrape weekly to stay fresh.',
      tint: 'from-cyan-500/10 to-transparent',
    },
  ];
  return (
    <section className="border-t border-white/5 bg-white/[0.01]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <AnimatedOnScroll>
          <h2 className="mb-3 text-4xl font-semibold tracking-tight text-white">Who uses Pluck</h2>
          <p className="mb-12 max-w-xl text-neutral-400">
            Built for the operator who needs the data this week, not next sprint.
          </p>
        </AnimatedOnScroll>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <AnimatedOnScroll key={c.role} delay={i * 0.05}>
              <div
                className={`group relative h-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${c.tint} p-5 transition-all hover:border-white/20 hover:translate-y-[-2px]`}
              >
                <div className="font-semibold text-white">{c.role}</div>
                <p className="mt-1 text-sm text-neutral-400">{c.example}</p>
              </div>
            </AnimatedOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <AnimatedOnScroll>
        <h2 className="mb-3 text-4xl font-semibold tracking-tight text-white">
          Pay once. Use forever.
        </h2>
        <p className="mb-12 max-w-xl text-neutral-400">
          No subscriptions. The free tier is unlimited rows — we don't pay for your AI usage either way.
        </p>
      </AnimatedOnScroll>
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatedOnScroll delay={0.05}>
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
                className="block w-full rounded-md border border-white/15 bg-white/[0.03] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.06]"
              >
                Add to Chrome
              </a>
            }
          />
        </AnimatedOnScroll>
        <AnimatedOnScroll delay={0.1}>
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
                className="block w-full rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100"
              >
                Get Pro
              </Link>
            }
          />
        </AnimatedOnScroll>
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
      className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition-all hover:translate-y-[-2px] ${
        highlighted
          ? 'border-indigo-400/30 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent'
          : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      {highlighted && (
        <div className="absolute right-4 top-4 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-200 ring-1 ring-indigo-400/30">
          Recommended
        </div>
      )}
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-3xl font-bold tracking-tight text-white">{price}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-400">{tagline}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-neutral-300">
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-emerald-400">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
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
    <section id="install" className="mx-auto max-w-6xl px-6 pb-24">
      <AnimatedOnScroll>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-emerald-500/10 p-10">
          <div className="relative">
            <h2 className="text-4xl font-semibold tracking-tight text-white">Install Pluck</h2>
            <p className="mt-3 max-w-2xl text-neutral-300">
              Pluck is in pre-alpha — the Chrome Web Store listing is in review. While we wait, you can
              side-load the unpacked build from the repo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://github.com/ErnestKostevich/Project-3#getting-started"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100"
              >
                Side-load instructions
                <span>→</span>
              </a>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </AnimatedOnScroll>
    </section>
  );
}
