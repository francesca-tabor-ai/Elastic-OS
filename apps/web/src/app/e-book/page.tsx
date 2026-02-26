import type { Metadata } from "next";
import Link from "next/link";
import { readdirSync } from "fs";
import { join } from "path";

export const metadata: Metadata = {
  title: "E-Book — ElasticOS",
  description: "Research and documentation on elastic employment and the continuum labour market",
};

function getChapters() {
  const ebookPath = join(process.cwd(), "..", "..", "e-book");
  try {
    const files = readdirSync(ebookPath).filter((f) => f.endsWith(".md"));
    return files
      .map((f) => ({
        name: f.replace(/\.md$/, "").replace(/_/g, " "),
        slug: encodeURIComponent(f.replace(/\.md$/, "")),
        file: f,
      }))
      .sort((a, b) => {
        const numA = parseInt(a.file.match(/\d+/)?.[0] ?? "0", 10);
        const numB = parseInt(b.file.match(/\d+/)?.[0] ?? "0", 10);
        return numA - numB;
      });
  } catch {
    return [];
  }
}

export default function EbookPage() {
  const chapters = getChapters();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          E-Book
        </h1>
        <p className="text-[var(--muted)] mb-12">
          Research on employment elasticity, the continuum labour market, and
          elastic affiliation architecture.
        </p>

        <nav>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Chapters
          </h2>
          <ul className="space-y-2">
            {chapters.map((ch) => (
              <li key={ch.slug}>
                <Link
                  href={`/e-book/${ch.slug}`}
                  className="text-[var(--accent)] hover:text-[var(--accent-dark)] hover:underline transition-colors"
                >
                  {ch.name}
                </Link>
              </li>
            ))}
          </ul>
          {chapters.length === 0 && (
            <p className="text-[var(--muted)]">No chapters found.</p>
          )}
        </nav>
      </main>
    </div>
  );
}
