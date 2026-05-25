import Link from 'next/link';

export const metadata = {
  title: 'FAQ — Pluck',
  description: 'Frequently asked questions about Pluck — pricing, privacy, providers, limits.',
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How is this free? What\'s the catch?',
    a: (
      <>
        Pluck doesn&apos;t run an LLM on a server we pay for. The picker is the
        product; AI inference happens <strong>on your machine</strong>{' '}
        (Chrome&apos;s built-in Gemini Nano) or{' '}
        <strong>via your own API key</strong> (Anthropic, Gemini, OpenAI). Either
        way, our cost per row is $0 — so there&apos;s nothing to charge you for.
        Pro is one-time, $29, for power features (unlimited jobs, scheduling,
        integrations). That&apos;s it.
      </>
    ),
  },
  {
    q: 'Do I need an API key?',
    a: (
      <>
        No, not if you&apos;re on Chrome 127+ with the Prompt API enabled —
        Pluck uses Gemini Nano locally and you&apos;re done. For higher-quality
        inference, you can paste an Anthropic / Gemini / OpenAI key in Settings.
        Pluck never sees the key — it lives in your <code>chrome.storage</code>.
      </>
    ),
  },
  {
    q: 'Does my data ever leave my machine?',
    a: (
      <>
        Only if you choose a hosted AI provider (Anthropic, Gemini, OpenAI) —
        in which case the page snippets you scrape are sent to{' '}
        <strong>that provider</strong>, not us, under your account&apos;s privacy
        terms. With Chrome built-in AI, nothing leaves your device. Pluck has no
        server in the data path either way.
      </>
    ),
  },
  {
    q: 'Can I scrape any site?',
    a: (
      <>
        Pluck works on any site <em>you can already see in your browser</em>.
        It doesn&apos;t bypass logins, paywalls, or anti-bot systems — those are
        out of scope. If a site uses Cloudflare or similar, Pluck still works as
        long as you can browse the page normally.
      </>
    ),
  },
  {
    q: 'What about pagination and infinite scroll?',
    a: (
      <>
        The picker detects pagination during inference (&quot;next&quot; links,
        page numbers, infinite-scroll triggers) and shows you the detection in
        the result panel. Following pagination during scheduled runs is on the
        Phase 2 list.
      </>
    ),
  },
  {
    q: 'Scheduled runs — how reliable?',
    a: (
      <>
        Pluck Pro uses <code>chrome.alarms</code>. Alarms fire on whatever
        interval you set <strong>as long as Chrome is open</strong>. If you
        quit Chrome, alarms pause; they resume when you reopen it. For 24/7
        scheduling without your laptop being on, we&apos;ll have a Business
        tier later — funded by revenue, not by you upfront.
      </>
    ),
  },
  {
    q: 'Is there a Firefox / Edge / Safari version?',
    a: (
      <>
        Chrome (and Chromium-based browsers — Edge, Arc, Brave) for now. Firefox
        support is on the roadmap once the MV3 dust settles in Gecko. Safari is
        unlikely in the near-term.
      </>
    ),
  },
  {
    q: 'Why isn\'t there a subscription tier?',
    a: (
      <>
        Because we don&apos;t have recurring costs to recoup. Hosting the
        landing page is free. AI is paid by you. There&apos;s no inventory of
        proxies for us to provision. A one-time license is the honest pricing
        for what Pluck actually costs to run.
      </>
    ),
  },
  {
    q: 'What if you go out of business?',
    a: (
      <>
        Pluck Pro&apos;s license is verified offline — no Pluck server has to
        be alive for your copy to keep working. The extension would keep working
        forever as-is. Source code is on GitHub; worst case, it can be forked.
      </>
    ),
  },
  {
    q: 'How do I refund?',
    a: (
      <>
        Email{' '}
        <a href="mailto:support@pluck.app" className="underline underline-offset-4">
          support@pluck.app
        </a>{' '}
        within 14 days. Full refund, no questions.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-5xl font-semibold tracking-tight">Frequently asked</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Don&apos;t see your question? Email{' '}
          <a href="mailto:hi@pluck.app" className="underline underline-offset-4">
            hi@pluck.app
          </a>
          .
        </p>
      </header>

      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {FAQS.map((f, i) => (
          <li key={i} className="py-6">
            <h2 className="text-lg font-semibold">{f.q}</h2>
            <div className="mt-2 text-neutral-600 dark:text-neutral-400">{f.a}</div>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Ready to try it?
        </p>
        <Link
          href="/pricing"
          className="mt-2 inline-block rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          See pricing
        </Link>
      </div>
    </main>
  );
}
