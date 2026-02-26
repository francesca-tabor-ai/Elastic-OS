import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@elastic-os/db";
import { EmployerOpportunitiesClient } from "./EmployerOpportunitiesClient";

export default async function EmployerOpportunitiesPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    session.user.role !== "EMPLOYER" ||
    !session.user.employerId
  ) {
    redirect("/login");
  }

  const employerId = session.user.employerId;

  const opportunities = await prisma.opportunity.findMany({
    where: { employerId },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Elastic Opportunities</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <EmployerOpportunitiesClient
          employerId={employerId}
          opportunities={opportunities.map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            engagementIntensity: Number(o.engagementIntensity),
            durationMonths: o.durationMonths,
            requiredSkills: o.requiredSkills,
            status: o.status,
            applicationCount: o._count.applications,
            createdAt: o.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
