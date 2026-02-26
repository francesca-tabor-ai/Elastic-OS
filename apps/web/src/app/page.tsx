import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero — white-dominant, gradient accent on headline only */}
        <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="absolute inset-0 bg-gradient-accent opacity-[0.03]" aria-hidden />
          <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-headline">
              Employment that bends.
              <br />
              <span className="gradient-accent-text">Not breaks.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-muted leading-relaxed">
              The infrastructure for the modern workforce. Verify identities, track engagement, and build trust—at scale.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-ui bg-accent px-6 py-3 text-base font-medium text-white transition hover:bg-accent-dark shadow-subtle"
              >
                View Pricing
              </Link>
              <Link
                href="/case-studies"
                className="rounded-ui border border-border px-6 py-3 text-base font-medium text-foreground transition hover:border-foreground-subtle hover:bg-surface"
              >
                See Case Studies
              </Link>
            </div>
          </div>
        </section>

        {/* Who it's for — cool greys, lots of white space */}
        <section className="border-b border-border bg-background-alt px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-center text-3xl font-bold text-foreground sm:text-4xl leading-headline">
              Built for who work actually works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-foreground-muted leading-relaxed">
              Your workforce isn&apos;t binary. Neither should your infrastructure.
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-ui-lg border border-border bg-white p-8 shadow-subtle">
                <div className="flex h-12 w-12 items-center justify-center rounded-ui bg-accent/10 text-accent font-semibold">Employers</div>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground leading-tight">
                  Employers with flexible talent
                </h3>
                <p className="mt-2 text-foreground-muted leading-relaxed">
                  Seasonal demand, project-based work, gig workers, part-time and contract staff. You need one system of record that reflects reality—not just employed or not.
                </p>
              </div>
              <div className="rounded-ui-lg border border-border bg-white p-8 shadow-subtle">
                <div className="flex h-12 w-12 items-center justify-center rounded-ui bg-accent/10 text-accent font-semibold">Workers</div>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground leading-tight">
                  Workers with portfolio careers
                </h3>
                <p className="mt-2 text-foreground-muted leading-relaxed">
                  Multiple engagements, variable hours, side projects. You need a trusted, portable record of work history and verified skills that travels with you.
                </p>
              </div>
              <div className="rounded-ui-lg border border-border bg-white p-8 shadow-subtle sm:col-span-2 lg:col-span-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-ui bg-accent/10 text-accent font-semibold">Gov</div>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground leading-tight">
                  Compliance & regulators
                </h3>
                <p className="mt-2 text-foreground-muted leading-relaxed">
                  Audit trails, verification, and alignment with evolving employment models—without fragmented, paper-based processes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pain points */}
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-center text-3xl font-bold text-foreground sm:text-4xl leading-headline">
              Sound familiar?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-foreground-muted leading-relaxed">
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
                <div key={item.title} className="rounded-ui-lg border border-border bg-white p-6 shadow-subtle">
                  <p className="text-sm font-medium text-accent">Pain point</p>
                  <h3 className="mt-2 font-display text-lg font-bold text-foreground leading-tight">{item.title}</h3>
                  <p className="mt-2 text-foreground-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How we solve it */}
        <section className="border-b border-border bg-surface px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-center text-3xl font-bold text-foreground sm:text-4xl leading-headline">
              How ElasticOS solves it
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-foreground-muted leading-relaxed">
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-ui-lg bg-accent text-white font-display text-xl font-bold tabular-nums">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground leading-tight">{item.title}</h3>
                    <p className="mt-2 text-foreground-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-ui-lg border border-border bg-background-alt px-8 py-16 text-center shadow-soft">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl leading-headline">
              Ready to build elastic employment infrastructure?
            </h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              Join employers and workers who&apos;ve moved beyond binary.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-ui bg-accent px-6 py-3 text-base font-medium text-white transition hover:bg-accent-dark shadow-subtle"
              >
                See plans & pricing
              </Link>
              <Link
                href="/case-studies"
                className="rounded-ui border border-border px-6 py-3 text-base font-medium text-foreground transition hover:border-foreground-subtle hover:bg-surface"
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
