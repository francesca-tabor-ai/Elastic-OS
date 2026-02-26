import type { Metadata } from "next";
import Link from "next/link";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import ReactMarkdown from "react-markdown";

export async function generateStaticParams() {
  const ebookPath = join(process.cwd(), "..", "..", "e-book");
  try {
    const files = readdirSync(ebookPath).filter((f) => f.endsWith(".md"));
    return files.map((f) => ({
      slug: encodeURIComponent(f.replace(/\.md$/, "")),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const title = decodeURIComponent(params.slug).replace(/_/g, " ");
  return { title: `${title} — ElasticOS E-Book` };
}

function getChapterContent(slug: string) {
  const filename = `${decodeURIComponent(slug)}.md`;
  const ebookPath = join(process.cwd(), "..", "..", "e-book");
  try {
    return readFileSync(join(ebookPath, filename), "utf-8");
  } catch {
    return null;
  }
}

export default function ChapterPage({
  params,
}: {
  params: { slug: string };
}) {
  const content = getChapterContent(params.slug);

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
          <p className="text-[var(--muted)]">Chapter not found.</p>
          <Link
            href="/e-book"
            className="inline-block mt-4 text-[var(--accent)] hover:underline"
          >
            ← Back to E-Book
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/e-book"
          className="inline-block mb-8 text-sm text-[var(--accent)] hover:text-[var(--accent-dark)] hover:underline transition-colors"
        >
          ← Back to E-Book
        </Link>
        <article className="prose prose-slate dark:prose-invert max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:mb-4 [&_ul]:my-4 [&_li]:my-1">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
