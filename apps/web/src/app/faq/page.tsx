import Link from 'next/link';
import { AnimatedOnScroll } from '@/components/AnimatedOnScroll';

export const metadata = {
  title: 'FAQ — Pluck',
  description: 'Frequently asked questions about Pluck — pricing, privacy, providers, limits.',
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How is this free? What\'s the catch?',
    a: (
      <>
        Pluck doesn&apos;t run an LLM on a server we pay for. The picker is the product; AI
        inference happens <strong className="text-white">on your machine</strong> (Chrome&apos;s
        built-in Gemini Nano) or <strong className="text-white">via your own API key</strong>{' '}
        (Anthropic, Gemini, OpenAI). Either way, our cost per row is $0 — so there&apos;s nothing to
        charge you for. Pro is one-time, $29, for power features (unlimited jobs, scheduling,
        integrations). That&apos;s it.
      </>
    ),
  },
  {
    q: 'Do I need an API key?',
    a: (
      <>
        No, not if you&apos;re on Chrome 127+ with the Prompt API enabled — Pluck uses Gemini Nano
        locally and you&apos;re done. For higher-quality inference, you can paste an Anthropic /
        Gemini / OpenAI key in Settings. Pluck never sees the key — it lives in your{' '}
        <code className="rounded bg-white/10 px-1 font-mono text-xs">chrome.storage</code>.
      </>
    ),
  },
  {
    q: 'Does my data ever leave my machine?',
    a: (
      <>
        Only if you choose a hosted AI provider (Anthropic, Gemini, OpenAI) — in which case the page
        snippets you scrape are sent to <strong className="text-white">that provider</strong>, not
        us, under your account&apos;s privacy terms. With Chrome built-in AI, nothing leaves your
        device. Pluck has no server in the data path either way.
      </>
    ),
  },
  {
    q: 'Can I scrape any site?',
    a: (
      <>
        Pluck works on any site <em>you can already see in your browser</em>. It doesn&apos;t bypass
        logins, paywalls, or anti-bot systems — those are out of scope. If a site uses Cloudflare or
        similar, Pluck still works as long as you can browse the page normally.
      </>
    ),
  },
  {
    q: 'What about pagination and infinite scroll?',
    a: (
      <>
        Pluck follows &quot;next&quot; links and numbered pagination during scheduled or manual
        re-runs (with safety caps: default 10 pages / 1000 rows, hard cap 50 / 10k). Infinite-scroll
        clickers are on the Phase 2 list.
      </>
    ),
  },
  {
    q: 'Scheduled runs — how reliable?',
    a: (
      <>
        Pluck Pro uses <code className="rounded bg-white/10 px-1 font-mono text-xs">chrome.alarms</code>.
        Alarms fire on whatever interval you set <strong className="text-white">as long as Chrome
        is open</strong>. If you quit Chrome, alarms pause; they resume when you reopen it. For 24/7
        scheduling without your laptop being on, we&apos;ll have a Business tier later — funded by
        revenue, not by you upfront.
      </>
    ),
  },
  {
    q: 'Is there a Firefox / Edge / Safari version?',
    a: (
      <>
        Chrome (and Chromium-based browsers — Edge, Arc, Brave) for now. Firefox support is on the
        roadmap once the MV3 dust settles in Gecko. Safari is unlikely in the near-term.
      </>
    ),
  },
  {
    q: 'Why isn\'t there a subscription tier?',
    a: (
      <>
        Because we don&apos;t have recurring costs to recoup. Hosting the landing page is free. AI
        is paid by you. There&apos;s no inventory of proxies for us to provision. A one-time license
        is the honest pricing for what Pluck actually costs to run.
      </>
    ),
  },
  {
    q: 'What if you go out of business?',
    a: (
      <>
        Pluck Pro&apos;s license is verified offline — no Pluck server has to be alive for your copy
        to keep working. The extension would keep working forever as-is. Source code is on GitHub;
        worst case, it can be forked.
      </>
    ),
  },
  {
    q: 'How do I refund?',
    a: (
      <>
        Email{' '}
        <a href="mailto:support@pluck.app" className="text-indigo-300 underline underline-offset-4 hover:text-indigo-200">
          support@pluck.app
        </a>{' '}
        within 14 days. Full refund (in the crypto you paid in, at the original USD value), no questions.
      </>
    ),
  },
  {
    q: 'Why crypto only? Can I pay with a card?',
    a: (
      <>
        Pluck Pro is sold via{' '}
        <a
          href="https://nowpayments.io"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
        >
          NOWPayments
        </a>
        , which accepts BTC, ETH, USDT, USDC, and 150+ other cryptos. Picking a crypto checkout
        means zero KYC overhead on our side, ~0.5% in fees instead of 5-10%, and a lifetime price
        of $29 instead of $39+. If a card-checkout option is must-have for you, email{' '}
        <a href="mailto:hi@pluck.app" className="text-indigo-300 underline underline-offset-4 hover:text-indigo-200">
          hi@pluck.app
        </a>
        {' '}— if there&apos;s demand we&apos;ll add Lemon Squeezy as a second option.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <AnimatedOnScroll>
        <header className="mb-14">
          <h1 className="text-5xl font-semibold tracking-tighter text-white sm:text-6xl">
            Frequently{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
              asked
            </span>
          </h1>
          <p className="mt-4 text-neutral-400">
            Don&apos;t see your question? Email{' '}
            <a
              href="mailto:hi@pluck.app"
              className="text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
            >
              hi@pluck.app
            </a>
            .
          </p>
        </header>
      </AnimatedOnScroll>

      <ul className="divide-y divide-white/5">
        {FAQS.map((f, i) => (
          <AnimatedOnScroll key={i} delay={i * 0.04}>
            <li className="py-7">
              <h2 className="text-lg font-semibold text-white">{f.q}</h2>
              <div className="mt-2 leading-relaxed text-neutral-400">{f.a}</div>
            </li>
          </AnimatedOnScroll>
        ))}
      </ul>

      <AnimatedOnScroll>
        <div className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 p-8 text-center">
          <p className="text-sm text-neutral-400">Ready to try it?</p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100"
          >
            See pricing →
          </Link>
        </div>
      </AnimatedOnScroll>
    </main>
  );
}
