"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const plans = [
  {
    name: "Individual",
    description: "For freelancers and independent workers building their portable profile",
    monthly: 9,
    yearly: 90,
    features: [
      "Verified identity & government ID",
      "Portable work profile",
      "Up to 3 active affiliations",
      "Employer-verified skills",
      "Basic support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Team",
    description: "For growing teams and employers managing flexible workforce",
    monthly: 49,
    yearly: 470,
    features: [
      "Everything in Individual",
      "Up to 25 workers",
      "Affiliation ledger & audit trail",
      "Engagement intensity tracking",
      "Department & role mapping",
      "Email support",
      "Basic analytics",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large organisations with compliance and custom needs",
    monthly: null,
    yearly: null,
    features: [
      "Everything in Team",
      "Unlimited workers",
      "SSO & custom integrations",
      "Dedicated success manager",
      "SLA & compliance reporting",
      "Custom verification workflows",
      "API access",
    ],
    cta: "Contact sales",
    highlighted: false,
    custom: true,
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="border-b border-slate-200 px-4 py-16 sm:px-6 lg:px-8 dark:border-slate-800">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Scale from individual workers to enterprise. Pay for what you need.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  billingPeriod === "monthly"
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  billingPeriod === "yearly"
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                Yearly
              </button>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Save 17%
              </span>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    plan.highlighted
                      ? "border-accent bg-accent/5 shadow-lg shadow-accent/10 dark:border-accent dark:bg-accent/10"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/30"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                      Most popular
                    </div>
                  )}
                  <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>
                  <div className="mt-6">
                    {plan.custom ? (
                      <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                        Custom
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Volume-based. Contact us for a quote.
                      </p>
                    ) : (
                      <>
                        <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                          £{billingPeriod === "monthly" ? plan.monthly : plan.yearly}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          /{billingPeriod === "monthly" ? "mo" : "yr"}
                        </span>
                      </>
                    )}
                  </div>
                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <svg
                          className="h-5 w-5 shrink-0 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.custom ? "#" : "/"}
                    className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-medium transition ${
                      plan.highlighted
                        ? "bg-accent text-white hover:bg-accent-dark"
                        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Scaling / FAQ */}
            <div className="mt-20 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/30 sm:p-12">
              <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                How scaling works
              </h2>
              <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">Individual → Team</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Upgrade anytime. Your profile and verified data carry over. No migration hassle.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">Worker limits</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Team plan includes 25 workers. Need more? Add blocks of 50 workers at £1.50/worker/month.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">Enterprise</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Custom pricing based on headcount, integrations, and compliance requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
