"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Elastic<span className="text-accent">OS</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Pricing
          </Link>
          <Link
            href="/case-studies"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Case Studies
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Marketplace
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
