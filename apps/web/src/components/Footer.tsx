import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} ElasticOS — Employment Elasticity Infrastructure
        </span>
        <nav className="flex items-center gap-6">
          <Link
            href="/e-book"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
          >
            E-Book
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/api-docs"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
          >
            API Docs
          </Link>
        </nav>
      </div>
    </footer>
  );
}
