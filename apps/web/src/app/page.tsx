import Link from "next/link";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <div>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight">
            ElasticOS
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Transform employment from binary states into continuous, measurable engagement.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium btn-interactive focus-ring hover:opacity-90"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium btn-interactive focus-ring hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
