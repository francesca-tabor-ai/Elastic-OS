import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@elastic-os/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/workers", label: "Workers" },
  { href: "/admin/employers", label: "Employers" },
  { href: "/admin/departments", label: "Departments" },
  { href: "/admin/job-roles", label: "Job Roles" },
  { href: "/admin/affiliations", label: "Affiliation Records" },
  { href: "/admin/apps", label: "Apps" },
  { href: "/admin/app-developer-applications", label: "App Developer Applications" },
  { href: "/admin/verification-logs", label: "Verification Logs" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  try {
    requireAdmin(session.user as Parameters<typeof requireAdmin>[0]);
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-border bg-background-alt flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="font-semibold text-foreground">
            Admin Dashboard
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link
            href="/dashboard"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
