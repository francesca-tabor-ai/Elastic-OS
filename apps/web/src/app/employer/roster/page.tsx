import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@elastic-os/db";
import { EmployerRosterClient } from "./EmployerRosterClient";

export default async function EmployerRosterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "EMPLOYER" || !session.user.employerId) {
    redirect("/login");
  }

  const [roster, snapshots, departments] = await Promise.all([
    prisma.workforceRoster.findMany({
      where: { employerId: session.user.employerId },
      include: {
        worker: {
          include: { user: true, workerProfile: true },
        },
        department: true,
        jobRole: true,
        contractType: true,
        salaryBand: true,
      },
    }),
    prisma.affiliationSnapshot.findMany({
      where: { employerId: session.user.employerId },
    }),
    prisma.department.findMany({
      where: { employerId: session.user.employerId },
      orderBy: { name: "asc" },
    }),
  ]);

  const snapshotByWorker = Object.fromEntries(
    snapshots.map((s) => [s.workerId, s])
  );

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Workforce Roster</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <EmployerRosterClient
          employerId={session.user.employerId}
          initialRoster={roster}
          snapshotByWorker={snapshotByWorker}
          departments={departments}
        />
      </div>
    </main>
  );
}
