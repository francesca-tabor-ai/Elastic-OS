"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const APP_TYPES = [
  { value: "WORKFLOW", label: "Workflow automation" },
  { value: "INTEGRATION", label: "Third-party integration" },
  { value: "REPORTING", label: "Reporting & analytics" },
  { value: "COMPLIANCE", label: "Compliance & audit" },
  { value: "PRODUCTIVITY", label: "Productivity tools" },
];

const TARGET_AUDIENCE = [
  { value: "WORKER", label: "Workers" },
  { value: "EMPLOYER", label: "Employers" },
  { value: "BOTH", label: "Both workers and employers" },
];

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Ireland",
  "Netherlands",
  "Spain",
  "India",
  "Singapore",
  "Other",
];

export default function ApplyToBuildPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    website: "",
    country: "",
    appType: [] as string[],
    targetAudience: "",
    appConcept: "",
    problemSolved: "",
    hasIntegrationsExperience: false,
    technicalApproach: "",
    marketingOptIn: false,
  });

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toggleAppType = (value: string) => {
    setForm((prev) => ({
      ...prev,
      appType: prev.appType.includes(value)
        ? prev.appType.filter((t) => t !== value)
        : [...prev.appType, value],
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/apps/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <section className="px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                We&apos;ve received your application
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Thank you for your interest in building on ElasticOS. We&apos;ll review your application and be in touch within a few business days with next steps on how to start your developer journey.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/marketplace"
                  className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-dark"
                >
                  Browse marketplace
                </Link>
                <Link
                  href="/api-docs"
                  className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  View API docs
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Apply to build an app
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Join developers building integrations and workflows on ElasticOS. Tell us about your app idea and we&apos;ll get back to you with access, documentation, and support.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Contact */}
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  About you
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  We&apos;ll use this to follow up on your application.
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Company
                </h2>
                <div className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Company or developer name
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Company website <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Country / region
                    </label>
                    <select
                      id="country"
                      required
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* App concept */}
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Your app
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Describe what you want to build and who it&apos;s for.
                </p>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      What type of app are you building?
                    </label>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Select all that apply.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {APP_TYPES.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleAppType(value)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            form.appType.includes(value)
                              ? "bg-accent text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Target audience
                    </label>
                    <div className="mt-2 space-y-2">
                      {TARGET_AUDIENCE.map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="targetAudience"
                            value={value}
                            checked={form.targetAudience === value}
                            onChange={(e) => update("targetAudience", e.target.value)}
                            className="h-4 w-4 border-slate-300 text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="appConcept" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      App concept <span className="text-slate-400">(min. 50 characters)</span>
                    </label>
                    <textarea
                      id="appConcept"
                      required
                      minLength={50}
                      rows={4}
                      value={form.appConcept}
                      onChange={(e) => update("appConcept", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                      placeholder="Describe your app: what it does, key features, and how it integrates with ElasticOS..."
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {form.appConcept.length} / 50 characters
                    </p>
                  </div>
                  <div>
                    <label htmlFor="problemSolved" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      What problem does it solve? <span className="text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      id="problemSolved"
                      rows={3}
                      value={form.problemSolved}
                      onChange={(e) => update("problemSolved", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                      placeholder="Pain points for workers or employers..."
                    />
                  </div>
                </div>
              </div>

              {/* Technical */}
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Technical background
                </h2>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Have you built integrations before?
                    </label>
                    <div className="mt-2 flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasIntegrationsExperience"
                          checked={form.hasIntegrationsExperience === true}
                          onChange={() => update("hasIntegrationsExperience", true)}
                          className="h-4 w-4 border-slate-300 text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasIntegrationsExperience"
                          checked={form.hasIntegrationsExperience === false}
                          onChange={() => update("hasIntegrationsExperience", false)}
                          className="h-4 w-4 border-slate-300 text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="technicalApproach" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Technical approach <span className="text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      id="technicalApproach"
                      rows={2}
                      value={form.technicalApproach}
                      onChange={(e) => update("technicalApproach", e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                      placeholder="OAuth, webhooks, API usage, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.marketingOptIn}
                    onChange={(e) => update("marketingOptIn", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Send me product updates, API news, and events from ElasticOS. I can unsubscribe at any time.
                  </span>
                </label>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="border-t border-slate-200 pt-8 dark:border-slate-800">
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                  By submitting, you consent to ElasticOS processing your data in accordance with our privacy policy. We&apos;ll use it to review your application and contact you.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-accent px-6 py-3 text-base font-medium text-white transition hover:bg-accent-dark disabled:opacity-70 sm:w-auto sm:min-w-[200px]"
                >
                  {loading ? "Submitting…" : "Submit application"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
