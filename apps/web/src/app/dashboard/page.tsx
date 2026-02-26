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
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Sign out
          </Link>
        </div>

        <div className="space-y-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
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
          {session.user.role === "WORKER" && (
            <Link
              href="/worker/profile"
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              Worker Profile
            </Link>
          )}
          {session.user.role === "EMPLOYER" && (
            <Link
              href="/employer/roster"
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              Workforce Roster
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
