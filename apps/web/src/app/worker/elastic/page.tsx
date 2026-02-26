import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@elastic-os/db";
import { getAffiliationStatus } from "@/lib/compensation";
import { WorkerElasticClient } from "./WorkerElasticClient";

export default async function WorkerElasticPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    session.user.role !== "WORKER" ||
    !session.user.workerId
  ) {
    redirect("/login");
  }

  const workerId = session.user.workerId;

  const [snapshots, history] = await Promise.all([
    prisma.affiliationSnapshot.findMany({
      where: { workerId },
      include: {
        employer: { include: { employerProfile: true } },
      },
    }),
    prisma.affiliationRecord.findMany({
      where: { workerId },
      orderBy: { createdAt: "desc" },
      include: {
        employer: { include: { employerProfile: true } },
      },
    }),
  ]);

  const activeAffiliations = snapshots.map((s) => {
    const intensity = Number(s.engagementIntensity);
    return {
      employerId: s.employerId,
      employerName: s.employer?.employerProfile?.companyName ?? s.employerId,
      engagementIntensity: intensity,
      affiliationStatus: getAffiliationStatus(intensity),
      adjustedSalary: s.adjustedSalary
        ? Number(s.adjustedSalary.toString())
        : null,
      benefitsStatus: s.benefitsStatus,
      affiliationContinuityScore: s.affiliationContinuityScore
        ? Number(s.affiliationContinuityScore.toString())
        : null,
    };
  });

  const historyFormatted = history.map((r) => ({
    id: r.id,
    employerId: r.employerId,
    employerName: r.employer?.employerProfile?.companyName ?? r.employerId,
    engagementIntensity: Number(r.engagementIntensity),
    recordType: r.recordType,
    effectiveFrom: r.effectiveFrom.toISOString(),
    effectiveTo: r.effectiveTo?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Elastic Dashboard</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <WorkerElasticClient
          workerId={workerId}
          activeAffiliations={activeAffiliations}
          history={historyFormatted}
        />
      </div>
    </main>
  );
}
