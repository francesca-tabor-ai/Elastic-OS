import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-background-alt">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-foreground-muted leading-relaxed">
          © {new Date().getFullYear()} ElasticOS — Employment Elasticity Infrastructure
        </span>
        <nav className="flex items-center gap-6">
          <Link
            href="/contact"
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/e-book"
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            E-Book
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/marketplace/apply"
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            Build an app
          </Link>
          <Link
            href="/api-docs"
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            API Docs
          </Link>
        </nav>
      </div>
    </footer>
  );
}
