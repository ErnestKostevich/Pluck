import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pluck — AI-powered visual web scraper',
  description:
    'Click anything on any page. Pluck turns it into structured data — no selectors, no code. Free with Chrome built-in AI, $29 lifetime for Pro.',
  openGraph: {
    title: 'Pluck — AI-powered visual web scraper',
    description: 'Click anything on any page, get a clean table. No selectors, no code.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050507] text-neutral-100 antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050507]/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-white">
          <span className="inline-block">🍒</span>
          <span>Pluck</span>
        </Link>
        <div className="flex items-center gap-6 text-neutral-400">
          <Link href="/pricing" className="transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/faq" className="transition-colors hover:text-white">
            FAQ
          </Link>
          <a
            href="https://github.com/ErnestKostevich/Project-3"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href="#install"
            className="rounded-md bg-white px-3 py-1.5 font-semibold text-neutral-900 transition-all hover:bg-neutral-100"
          >
            Install
          </a>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10 text-sm text-neutral-500">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-2">
          <span>🍒</span>
          <span>© {new Date().getFullYear()} Pluck</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/faq" className="transition-colors hover:text-white">
            FAQ
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <a
            href="https://github.com/ErnestKostevich/Project-3"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
