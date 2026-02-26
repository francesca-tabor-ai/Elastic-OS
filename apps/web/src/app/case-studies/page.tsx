import Link from "next/link";

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Case Studies</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Coming soon.</p>
      <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        Back home
      </Link>
    </main>
  );
}
