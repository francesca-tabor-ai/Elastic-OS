"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const REQUEST_TYPES = [
  { value: "customer_support", label: "Customer support request" },
  { value: "bug_report", label: "Bug report" },
] as const;

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    requestType: "customer_support" as (typeof REQUEST_TYPES)[number]["value"],
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", requestType: "customer_support", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[80vh] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Customer support, bug reports, or general inquiries. All submissions are sent to{" "}
            <span className="font-medium text-accent">info@francescatabor.com</span>.
          </p>

          {status === "success" && (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              Thank you! Your message has been sent to info@francescatabor.com. We&apos;ll get back to you soon.
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="requestType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Request type
              </label>
              <select
                id="requestType"
                name="requestType"
                value={formData.requestType}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    requestType: e.target.value as (typeof REQUEST_TYPES)[number]["value"],
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                placeholder="Brief summary of your request"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                placeholder="Describe your request or bug in detail..."
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-accent px-6 py-2.5 text-base font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : "Send message"}
              </button>
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Cancel
              </Link>
            </div>
          </form>

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            All submissions are sent to{" "}
            <a
              href="mailto:info@francescatabor.com"
              className="font-medium text-accent hover:underline"
            >
              info@francescatabor.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
