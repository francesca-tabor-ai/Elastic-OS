"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const logos = [
  "Acme Logistics",
  "Bentley & Co",
  "Cascade Health",
  "Delta Industries",
  "Echo Retail",
  "Forte Consulting",
  "Globe Shipping",
  "Horizon Tech",
  "Insight Labs",
  "JetStream Media",
  "Kaleido Finance",
  "Luminous Studios",
];

const caseStudies = [
  {
    company: "Acme Logistics",
    industry: "Logistics & supply chain",
    headline: "Cut verification time by 70% with ElasticOS",
    excerpt: "Seasonal peaks meant onboarding hundreds of temporary drivers in weeks. Manual ID checks and reference calls were killing our timelines. ElasticOS gave us pre-verified workers and a single audit trail.",
    metric: "70%",
    metricLabel: "faster verification",
    quote: "We went from 3-week onboarding to same-day. The affiliation ledger alone saved us countless spreadsheet wars.",
    author: "Sarah Chen",
    role: "Head of People, Acme Logistics",
    logo: "AL",
  },
  {
    company: "Forte Consulting",
    industry: "Professional services",
    headline: "From binary to continuous: how we model our flexible workforce",
    excerpt: "Our consultants work across multiple clients and engagements. Traditional HR systems forced us into full-time or part-time buckets. ElasticOS let us track real engagement intensity.",
    metric: "45%",
    metricLabel: "reduction in admin",
    quote: "Finally, a system that reflects how our people actually work. Planning and compliance became data-driven overnight.",
    author: "James Okonkwo",
    role: "Operations Director, Forte Consulting",
    logo: "FC",
  },
  {
    company: "Cascade Health",
    industry: "Healthcare",
    headline: "Compliance at scale for a growing care workforce",
    excerpt: "Healthcare demands verified credentials and audit trails. ElasticOS gave us identity verification, employer-verified skills, and a single source of truth for regulators.",
    metric: "60%",
    metricLabel: "less audit prep",
    quote: "We used to pull data from four different systems for each audit. Now it's one export, one ledger, one truth.",
    author: "Dr. Emma Walsh",
    role: "Compliance Lead, Cascade Health",
    logo: "CH",
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Scrolling logos */}
        <section className="border-b border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trusted by forward-thinking organisations
            </p>
            <div className="mt-8 overflow-hidden">
              <div className="flex animate-scroll items-center gap-16">
                {[...logos, ...logos].map((name, i) => (
                  <div
                    key={`${name}-${i}`}
                    className="flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Case studies hero */}
        <section className="border-b border-slate-200 px-4 py-16 sm:px-6 lg:px-8 dark:border-slate-800">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Case studies
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              How organisations are transforming employment infrastructure with ElasticOS
            </p>
          </div>
        </section>

        {/* Case study cards */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-16">
            {caseStudies.map((study) => (
              <article
                key={study.company}
                className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900/30 sm:p-12"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                  <div className="lg:max-w-xl">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 font-display text-xl font-bold text-accent">
                      {study.logo}
                    </div>
                    <p className="mt-4 text-sm font-medium text-accent">{study.industry}</p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                      {study.headline}
                    </h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">{study.excerpt}</p>
                    <blockquote className="mt-6 border-l-4 border-accent pl-4">
                      <p className="italic text-slate-700 dark:text-slate-300">"{study.quote}"</p>
                      <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        — {study.author}, {study.role}
                      </footer>
                    </blockquote>
                  </div>
                  <div className="shrink-0 lg:text-right">
                    <p className="font-display text-4xl font-bold text-accent sm:text-5xl">
                      {study.metric}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {study.metricLabel}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900 px-8 py-16 text-center">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Ready to join them?
            </h2>
            <p className="mt-4 text-slate-300">
              See how ElasticOS can transform your employment infrastructure.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-lg bg-accent-light px-6 py-3 text-base font-medium text-slate-900 transition hover:bg-teal-300"
              >
                View pricing
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-slate-600 px-6 py-3 text-base font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                Get started
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
