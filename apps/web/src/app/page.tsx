import Link from "next/link";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center px-6 py-24 sm:py-32">
        <div className="max-w-2xl mx-auto text-center space-y-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-headline">
            Elastic<span className="gradient-accent-text">OS</span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground-muted leading-relaxed max-w-xl mx-auto">
            Transform employment from binary states into continuous, measurable engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/login"
              className="px-6 py-3 rounded-ui bg-foreground text-background font-medium btn-interactive focus-ring hover:opacity-90 transition-opacity"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-ui border border-border font-medium btn-interactive focus-ring hover:bg-surface transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
