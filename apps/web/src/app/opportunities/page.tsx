import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@elastic-os/db";
import { OpportunitiesClient } from "./OpportunitiesClient";

export default async function OpportunitiesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { status: "OPEN" },
    include: {
      employer: { include: { employerProfile: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Elastic Talent Marketplace</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <OpportunitiesClient
          opportunities={opportunities.map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            engagementIntensity: Number(o.engagementIntensity),
            durationMonths: o.durationMonths,
            requiredSkills: o.requiredSkills,
            employerName: o.employer?.employerProfile?.companyName ?? o.employerId,
            applicationCount: o._count.applications,
            createdAt: o.createdAt.toISOString(),
          }))}
          workerId={session.user.workerId ?? undefined}
          employerId={session.user.employerId ?? undefined}
          role={session.user.role ?? ""}
        />
      </div>
    </main>
  );
}
