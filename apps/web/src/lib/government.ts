/**
 * Phase 4: Government analytics engine
 * Aggregated national elastic labour index
 */

import { prisma } from "@elastic-os/db";

export interface ElasticIndexResult {
  engagementDistribution: {
    fullCount: number;
    partialCount: number;
    elasticCount: number;
    minimalCount: number;
  };
  elasticityRate: number;
  meanContinuity: number;
  multiEmployerRate: number;
  totalWorkers: number;
  totalEmployers: number;
  opportunityPipeline: {
    openOpportunities: number;
    totalApplications: number;
  };
}

export async function computeNationalElasticIndex(): Promise<ElasticIndexResult> {
  const [snapshots, workersWithSnapshots, opportunities, applications] =
    await Promise.all([
      prisma.affiliationSnapshot.findMany({ select: { workerId: true, employerId: true, engagementIntensity: true, affiliationContinuityScore: true } }),
      prisma.affiliationSnapshot.groupBy({
        by: ["workerId"],
        _count: { workerId: true },
      }),
      prisma.opportunity.count({ where: { status: "OPEN" } }),
      prisma.opportunityApplication.count(),
    ]);

  let fullCount = 0;
  let partialCount = 0;
  let elasticCount = 0;
  let minimalCount = 0;
  let elasticWorkers = 0;
  let continuitySum = 0;
  let continuityCount = 0;

  for (const s of snapshots) {
    const intensity = Number(s.engagementIntensity);
    if (intensity >= 0.8) fullCount++;
    else if (intensity >= 0.5) partialCount++;
    else if (intensity >= 0.3) elasticCount++;
    else minimalCount++;

    if (intensity < 1) elasticWorkers++;

    if (s.affiliationContinuityScore != null) {
      continuitySum += Number(s.affiliationContinuityScore);
      continuityCount++;
    }
  }

  const totalSnapshotCount = snapshots.length;
  const elasticityRate =
    totalSnapshotCount > 0 ? elasticWorkers / totalSnapshotCount : 0;
  const meanContinuity =
    continuityCount > 0 ? continuitySum / continuityCount : 0;
  const multiEmployerWorkers = workersWithSnapshots.filter(
    (g) => g._count.workerId > 1
  ).length;
  const totalWorkers = workersWithSnapshots.length;
  const multiEmployerRate =
    totalWorkers > 0 ? multiEmployerWorkers / totalWorkers : 0;
  const totalEmployers = new Set(snapshots.map((s) => s.employerId)).size;

  return {
    engagementDistribution: { fullCount, partialCount, elasticCount, minimalCount },
    elasticityRate,
    meanContinuity,
    multiEmployerRate,
    totalWorkers,
    totalEmployers,
    opportunityPipeline: { openOpportunities: opportunities, totalApplications: applications },
  };
}

export async function computeElasticIndexByIndustry(): Promise<
  Array<{ industry: string | null; count: number; elasticityRate: number }>
> {
  const snapshots = await prisma.affiliationSnapshot.findMany({
    include: {
      employer: { include: { employerProfile: true } },
    },
  });

  const byIndustry = new Map<
    string,
    { total: number; elastic: number }
  >();

  for (const s of snapshots) {
    const industry =
      s.employer?.employerProfile?.industry ?? "Unknown";
    const entry = byIndustry.get(industry) ?? { total: 0, elastic: 0 };
    entry.total++;
    if (Number(s.engagementIntensity) < 1) entry.elastic++;
    byIndustry.set(industry, entry);
  }

  return Array.from(byIndustry.entries()).map(([industry, data]) => ({
    industry: industry === "Unknown" ? null : industry,
    count: data.total,
    elasticityRate: data.total > 0 ? data.elastic / data.total : 0,
  }));
}
