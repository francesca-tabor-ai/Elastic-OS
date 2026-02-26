/**
 * Phase 3: Elastic Talent Marketplace services
 */

import { prisma } from "@elastic-os/db";
import { createOrAdjustAffiliation } from "./ledger";

/** Get worker's current total engagement across all employers */
export async function getWorkerTotalEngagement(workerId: string): Promise<number> {
  const snapshots = await prisma.affiliationSnapshot.findMany({
    where: { workerId },
  });
  return snapshots.reduce((sum, s) => sum + Number(s.engagementIntensity), 0);
}

/** Get worker's headroom (max - current engagement) */
export async function getWorkerHeadroom(workerId: string): Promise<{
  currentEngagement: number;
  maxEngagement: number;
  headroom: number;
  openToOpportunities: boolean;
}> {
  const [snapshots, availability] = await Promise.all([
    prisma.affiliationSnapshot.findMany({ where: { workerId } }),
    prisma.workerAvailability.findUnique({ where: { workerId } }),
  ]);

  const currentEngagement = snapshots.reduce((sum, s) => sum + Number(s.engagementIntensity), 0);
  const maxEngagement = availability
    ? Number(availability.maxTotalEngagement)
    : 1.0;
  const openToOpportunities = availability?.openToOpportunities ?? true;

  return {
    currentEngagement,
    maxEngagement,
    headroom: Math.max(0, maxEngagement - currentEngagement),
    openToOpportunities,
  };
}

/** Ensure worker has availability record; return or create with defaults */
export async function getOrCreateWorkerAvailability(workerId: string) {
  let availability = await prisma.workerAvailability.findUnique({
    where: { workerId },
  });

  if (!availability) {
    availability = await prisma.workerAvailability.create({
      data: {
        workerId,
        maxTotalEngagement: 1,
        openToOpportunities: true,
      },
    });
  }

  return availability;
}
