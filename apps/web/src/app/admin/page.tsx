import Link from "next/link";
import { prisma } from "@elastic-os/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    usersCount,
    workersCount,
    employersCount,
    departmentsCount,
    jobRolesCount,
    affiliationsCount,
    appsCount,
    appDevAppsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.worker.count(),
    prisma.employer.count(),
    prisma.department.count(),
    prisma.jobRole.count(),
    prisma.affiliationRecord.count(),
    prisma.app.count(),
    prisma.appDeveloperApplication.count(),
  ]);

  const stats = [
    { label: "Users", count: usersCount, href: "/admin/users" },
    { label: "Workers", count: workersCount, href: "/admin/workers" },
    { label: "Employers", count: employersCount, href: "/admin/employers" },
    { label: "Departments", count: departmentsCount, href: "/admin/departments" },
    { label: "Job Roles", count: jobRolesCount, href: "/admin/job-roles" },
    { label: "Affiliation Records", count: affiliationsCount, href: "/admin/affiliations" },
    { label: "Apps", count: appsCount, href: "/admin/apps" },
    { label: "App Developer Applications", count: appDevAppsCount, href: "/admin/app-developer-applications" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, count, href }) => (
          <Link
            key={href}
            href={href}
            className="p-6 rounded-lg border border-border bg-background hover:bg-surface transition-colors"
          >
            <p className="text-sm text-foreground-muted">{label}</p>
            <p className="text-2xl font-bold mt-1">{count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
