import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-900 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.3),transparent)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Employment that bends.
              <br />
              <span className="text-accent-light">Not breaks.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              The infrastructure for the modern workforce. Verify identities, track engagement, and build trust—at scale.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-lg bg-accent-light px-6 py-3 text-base font-medium text-slate-900 transition hover:bg-teal-300"
              >
                View Pricing
              </Link>
              <Link
                href="/case-studies"
                className="rounded-lg border border-slate-600 px-6 py-3 text-base font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                See Case Studies
              </Link>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-b border-slate-200 bg-white px-4 py-20 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-center text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Built for who work actually works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              Your workforce isn&apos;t binary. Neither should your infrastructure.
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">Employers</div>
                <h3 className="mt-4 font-display text-xl font-semibold text-slate-900 dark:text-white">
                  Employers with flexible talent
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Seasonal demand, project-based work, gig workers, part-time and contract staff. You need one system of record that reflects reality—not just employed or not.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">Workers</div>
                <h3 className="mt-4 font-display text-xl font-semibold text-slate-900 dark:text-white">
                  Workers with portfolio careers
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Multiple engagements, variable hours, side projects. You need a trusted, portable record of work history and verified skills that travels with you.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 dark:border-slate-700 dark:bg-slate-800/30 sm:col-span-2 lg:col-span-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">Gov</div>
                <h3 className="mt-4 font-display text-xl font-semibold text-slate-900 dark:text-white">
                  Compliance & regulators
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Audit trails, verification, and alignment with evolving employment models—without fragmented, paper-based processes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pain points */}
        <section className="border-b border-slate-200 px-4 py-20 dark:border-slate-800 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-center text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Sound familiar?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              The pain points of modern employment infrastructure
            </p>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Fragmented verification", desc: "No single source of truth for who worked where, when, and at what intensity." },
                { title: "Skills that don't travel", desc: "Worker capabilities trapped in employer silos. No portable, verified record." },
                { title: "Manual compliance burden", desc: "HR teams drowning in reconciliation, document chasing, and audit prep." },
                { title: "Poor workforce visibility", desc: "Can't model or plan around real engagement—data is siloed or incomplete." },
                { title: "Trust deficit", desc: "Verifying work history and credentials means costly, slow manual checks." },
                { title: "Binary thinking", desc: "Systems assume full-time vs part-time. Reality is continuous and fluid." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
                  <p className="text-sm font-medium text-accent">Pain point</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How we solve it */}
        <section className="border-b border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-center text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              How ElasticOS solves it
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              Purpose-built for continuous, elastic employment
            </p>
            <div className="mt-16 space-y-12">
              {[
                {
                  title: "Identity-first verification",
                  desc: "Government ID for workers. Legal entity (e.g. Companies House) for employers. Every affiliation anchored to verified identities.",
                  icon: "Shield",
                },
                {
                  title: "Engagement intensity, not binary status",
                  desc: "Model real engagement (0–1) and affiliation states: active, adjusted, terminated, reactivated. Reflect how work actually happens.",
                  icon: "Chart",
                },
                {
                  title: "Single affiliation ledger",
                  desc: "One auditable record of worker–employer relationships. No more stitching HRIS, payroll, and spreadsheets.",
                  icon: "Database",
                },
                {
                  title: "Portable, employer-verified profiles",
                  desc: "Skills, certifications, and references verified by employers—and they travel with the worker. Pre-vetted talent. Portable credibility.",
                  icon: "Badge",
                },
              ].map((item, i) => (
                <div key={item.title} className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-white font-display text-xl font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900 px-8 py-16 text-center">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Ready to build elastic employment infrastructure?
            </h2>
            <p className="mt-4 text-slate-300">
              Join employers and workers who've moved beyond binary.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-lg bg-accent-light px-6 py-3 text-base font-medium text-slate-900 transition hover:bg-teal-300"
              >
                See plans & pricing
              </Link>
              <Link
                href="/case-studies"
                className="rounded-lg border border-slate-600 px-6 py-3 text-base font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                Read case studies
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
