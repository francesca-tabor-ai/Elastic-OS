"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type AppCategory = "WORKFLOW" | "INTEGRATION" | "REPORTING" | "COMPLIANCE" | "PRODUCTIVITY";
type AppScope = "WORKER" | "EMPLOYER" | "BOTH";

interface App {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  icon: string | null;
  iconUrl: string | null;
  category: AppCategory;
  scope: AppScope;
  vendor: string;
  isBuiltIn: boolean;
}

interface Installation {
  id: string;
  appId: string;
  entityType: string;
  entityId: string;
  app: App;
  installedAt: string;
}

const CATEGORY_LABELS: Record<AppCategory, string> = {
  WORKFLOW: "Workflow",
  INTEGRATION: "Integration",
  REPORTING: "Reporting",
  COMPLIANCE: "Compliance",
  PRODUCTIVITY: "Productivity",
};

const SCOPE_LABELS: Record<AppScope, string> = {
  WORKER: "Workers",
  EMPLOYER: "Employers",
  BOTH: "All",
};

export default function MarketplacePage() {
  const [apps, setApps] = useState<App[]>([]);
  const [installed, setInstalled] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [uninstalling, setUninstalling] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppCategory | "">("");
  const [signedIn, setSignedIn] = useState(false);
  const [userContext, setUserContext] = useState<{
    hasWorker: boolean;
    hasEmployer: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [appsRes, installedRes, meRes] = await Promise.all([
          fetch("/api/apps"),
          fetch("/api/apps/installed").catch(() => null),
          fetch("/api/auth/me").catch(() => null),
        ]);

        if (appsRes.ok) {
          const data = await appsRes.json();
          setApps(data);
        }

        if (installedRes?.ok) {
          const data = await installedRes.json();
          setInstalled(data);
        }

        if (meRes?.ok) {
          const me = await meRes.json();
          setSignedIn(true);
          setUserContext({
            hasWorker: !!me.workerId,
            hasEmployer: !!me.employerId,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getDefaultEntityType = (app: App): "worker" | "employer" => {
    if (app.scope === "EMPLOYER") return "employer";
    if (app.scope === "WORKER") return "worker";
    if (userContext?.hasEmployer) return "employer";
    return "worker";
  };

  const installApp = async (slug: string, entityType: "worker" | "employer") => {
    setInstalling(slug);
    try {
      const res = await fetch(`/api/apps/${slug}/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType }),
      });
      if (res.ok) {
        const { installation } = await res.json();
        setInstalled((prev) => [...prev, installation]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInstalling(null);
    }
  };

  const uninstallApp = async (slug: string) => {
    setUninstalling(slug);
    try {
      const res = await fetch(`/api/apps/${slug}/install`, { method: "DELETE" });
      if (res.ok) {
        setInstalled((prev) => prev.filter((i) => i.app.slug !== slug));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUninstalling(null);
    }
  };

  const isInstalled = (slug: string) => installed.some((i) => i.app.slug === slug);

  const filteredApps = filter
    ? apps.filter((a) => a.category === filter)
    : apps;

  const categories = [...new Set(apps.map((a) => a.category))] as AppCategory[];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              App Marketplace
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Extend ElasticOS with integrations and workflows. Sync payroll, export data, get notifications, and more.
            </p>
          </div>
        </section>

        {/* My Apps (if signed in) */}
        {signedIn && installed.length > 0 && (
          <section className="border-b border-slate-200 px-4 py-12 dark:border-slate-800 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Installed Apps
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {installed.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/30"
                  >
                    <span className="text-2xl">{i.app.icon || "📦"}</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {i.app.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {CATEGORY_LABELS[i.app.category]} · {SCOPE_LABELS[i.app.scope]}
                      </p>
                    </div>
                    <button
                      onClick={() => uninstallApp(i.app.slug)}
                      disabled={uninstalling === i.app.slug}
                      className="ml-2 rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      {uninstalling === i.app.slug ? "…" : "Uninstall"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="border-b border-slate-200 px-4 py-6 dark:border-slate-800 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !filter
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filter === cat
                      ? "bg-accent text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* App Grid */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50"
                  />
                ))}
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/30">
                <p className="text-slate-600 dark:text-slate-400">
                  No apps found.{" "}
                  <Link href="/" className="text-accent hover:underline">
                    Go home
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredApps.map((app) => {
                  const installedFlag = isInstalled(app.slug);
                  return (
                    <div
                      key={app.id}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-accent/30 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-accent/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                          {app.icon || "📦"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold text-slate-900 dark:text-white">
                            {app.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {CATEGORY_LABELS[app.category]}
                            </span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {SCOPE_LABELS[app.scope]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 flex-1 text-sm text-slate-600 dark:text-slate-400">
                        {app.description}
                      </p>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          by {app.vendor}
                        </span>
                        {signedIn ? (
                          installedFlag ? (
                            <button
                              onClick={() => uninstallApp(app.slug)}
                              disabled={uninstalling === app.slug}
                              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              {uninstalling === app.slug ? "…" : "Uninstall"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                installApp(app.slug, getDefaultEntityType(app))
                              }
                              disabled={installing === app.slug}
                              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-70"
                            >
                              {installing === app.slug ? "Installing…" : "Install"}
                            </button>
                          )
                        ) : (
                          <Link
                            href="/login"
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
                          >
                            Sign in to install
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 px-4 py-16 dark:border-slate-800 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl bg-slate-900 px-8 py-12 text-center">
            <h2 className="font-display text-2xl font-semibold text-white">
              Build your own app
            </h2>
            <p className="mt-3 text-slate-300">
              Use our API to create custom integrations and workflows. See the docs to get started.
            </p>
            <Link
              href="/api-docs"
              className="mt-6 inline-block rounded-lg bg-accent-light px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-teal-300"
            >
              View API Docs
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
