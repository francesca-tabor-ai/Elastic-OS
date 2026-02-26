"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          Elastic<span className="gradient-accent-text">OS</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-foreground-muted transition hover:text-foreground"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-foreground-muted transition hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/case-studies"
            className="text-sm font-medium text-foreground-muted transition hover:text-foreground"
          >
            Case Studies
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-foreground-muted transition hover:text-foreground"
          >
            Contact
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium text-foreground-muted transition hover:text-foreground"
          >
            Marketplace
          </Link>
          <Link
            href="/login"
            className="rounded-ui bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
