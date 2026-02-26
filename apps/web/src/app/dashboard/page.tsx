import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link
            href="/api/auth/signout"
            className="text-sm text-foreground-muted dark:text-foreground-muted hover:underline"
          >
            Sign out
          </Link>
        </div>

        <div className="space-y-4 p-4 rounded-ui border border-border dark:border-border">
          <p>
            <span className="font-medium">Email:</span> {session.user.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {session.user.role}
          </p>
          {session.user.workerId && (
            <p>
              <span className="font-medium">Worker ID:</span> {session.user.workerId}
            </p>
          )}
          {session.user.employerId && (
            <p>
              <span className="font-medium">Employer ID:</span> {session.user.employerId}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-4">
          <Link
            href="/marketplace"
            className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
          >
            App Marketplace
          </Link>
          {session.user.role === "WORKER" && (
            <>
              <Link
                href="/worker/elastic"
                className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
              >
                Elastic Dashboard
              </Link>
              <Link
                href="/opportunities"
                className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
              >
                Elastic Opportunities
              </Link>
              <Link
                href="/worker/profile"
                className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
              >
                Worker Profile
              </Link>
            </>
          )}
          {session.user.role === "EMPLOYER" && (
            <>
              <Link
                href="/employer/dashboard"
                className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
              >
                Elastic Workforce Dashboard
              </Link>
              <Link
                href="/employer/opportunities"
                className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
              >
                Post Opportunities
              </Link>
              <Link
                href="/employer/roster"
                className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
              >
                Workforce Roster
              </Link>
            </>
          )}
          {(session.user.role === "GOVERNMENT" || session.user.role === "ADMIN") && (
            <Link
              href="/government/dashboard"
              className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
            >
              Government Dashboard
            </Link>
          )}
          {session.user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="p-4 rounded-ui border border-border dark:border-border hover:bg-surface dark:hover:bg-border/50"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
