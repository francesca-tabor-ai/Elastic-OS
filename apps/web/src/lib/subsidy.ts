/**
 * Phase 4: Wage Stabilisation - Subsidy allocation engine
 */

import { prisma } from "@elastic-os/db";

export interface EligibleWorker {
  workerId: string;
  employerId: string;
  engagementIntensity: number;
  subsidyAmount: number;
}

export async function computeEligibleWorkers(
  policyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<EligibleWorker[]> {
  const policy = await prisma.subsidyPolicy.findUnique({
    where: { id: policyId },
  });

  if (!policy || (policy.status !== "ACTIVE" && policy.status !== "DRAFT")) return [];

  const maxThreshold = Number(policy.maxEngagementThreshold);
  const minThreshold = Number(policy.minEngagementThreshold);
  const amountPerWorker = Number(policy.subsidyAmountPerWorker);
  const totalBudget = policy.totalBudget ? Number(policy.totalBudget) : null;

  const snapshots = await prisma.affiliationSnapshot.findMany({
    where: {},
  });

  const eligible: EligibleWorker[] = [];
  let budgetUsed = 0;

  for (const s of snapshots) {
    const intensity = Number(s.engagementIntensity);
    if (intensity > maxThreshold || intensity < minThreshold) continue;

    if (totalBudget != null && budgetUsed + amountPerWorker > totalBudget) break;

    eligible.push({
      workerId: s.workerId,
      employerId: s.employerId,
      engagementIntensity: intensity,
      subsidyAmount: amountPerWorker,
    });
    budgetUsed += amountPerWorker;
  }

  return eligible;
}

export async function runAllocation(
  policyId: string,
  periodStart: Date,
  periodEnd: Date,
  createdBy?: string
): Promise<{ allocated: number }> {
  const eligible = await computeEligibleWorkers(policyId, periodStart, periodEnd);
  if (eligible.length === 0) return { allocated: 0 };

  const existing = await prisma.subsidyAllocation.findMany({
    where: {
      policyId,
      periodStart,
      periodEnd,
    },
    select: { workerId: true, employerId: true },
  });
  const existingSet = new Set(
    existing.map((e) => `${e.workerId}:${e.employerId}`)
  );

  const toCreate = eligible.filter(
    (e) => !existingSet.has(`${e.workerId}:${e.employerId}`)
  );

  await prisma.subsidyAllocation.createMany({
    data: toCreate.map((e) => ({
      policyId,
      workerId: e.workerId,
      employerId: e.employerId,
      engagementIntensity: e.engagementIntensity,
      subsidyAmount: e.subsidyAmount,
      periodStart,
      periodEnd,
      status: "PENDING",
    })),
  });

  return { allocated: toCreate.length };
}
