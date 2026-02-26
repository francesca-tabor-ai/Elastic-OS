import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@elastic-os/db";
import { getAffiliationStatus } from "@/lib/compensation";
import { EmployerDashboardClient } from "./EmployerDashboardClient";

export default async function EmployerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    session.user.role !== "EMPLOYER" ||
    !session.user.employerId
  ) {
    redirect("/login");
  }

  const employerId = session.user.employerId;

  const snapshots = await prisma.affiliationSnapshot.findMany({
    where: { employerId },
    include: { worker: { include: { user: true } } },
  });

  const roster = await prisma.workforceRoster.findMany({
    where: { employerId },
    include: { salaryBand: true },
  });

  const rosterByWorker = Object.fromEntries(
    roster.map((r) => [r.workerId, r])
  );

  let fullCount = 0;
  let partialCount = 0;
  let elasticCount = 0;
  let minimalCount = 0;

  let currentPayroll = 0;
  let fullCapacityPayroll = 0;

  for (const s of snapshots) {
    const intensity = Number(s.engagementIntensity);
    const status = getAffiliationStatus(intensity);

    if (intensity >= 0.8) fullCount++;
    else if (intensity >= 0.5) partialCount++;
    else if (intensity >= 0.3) elasticCount++;
    else minimalCount++;

    let baseSalary: number | null = null;
    const rosterEntry = rosterByWorker[s.workerId];
    if (rosterEntry?.baseSalary) {
      baseSalary = Number(rosterEntry.baseSalary.toString());
    } else if (rosterEntry?.salaryBand) {
      const min = Number(rosterEntry.salaryBand.minAmount);
      const max = Number(rosterEntry.salaryBand.maxAmount);
      baseSalary = (min + max) / 2;
    }

    if (baseSalary != null) {
      fullCapacityPayroll += baseSalary;
      currentPayroll +=
        s.adjustedSalary != null
          ? Number(s.adjustedSalary.toString())
          : baseSalary * intensity;
    }
  }

  const savings = fullCapacityPayroll - currentPayroll;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Elastic Workforce Dashboard</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <EmployerDashboardClient
          employerId={employerId}
          engagementDistribution={{
            fullCount,
            partialCount,
            elasticCount,
            minimalCount,
          }}
          currentPayroll={currentPayroll}
          fullCapacityPayroll={fullCapacityPayroll}
          savings={savings}
        />
      </div>
    </main>
  );
}
