/**
 * Phase 5 Feature 17: Elastic Employment Smart Contracts
 * Contractual elasticity bands, reactivation priority
 */

import { prisma } from "@elastic-os/db";

export interface ContractTerms {
  minEngagement: number;
  maxEngagement: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  reactivationPriority: number;
}

export async function createElasticityContract(
  workerId: string,
  employerId: string,
  terms: ContractTerms
): Promise<void> {
  await prisma.elasticityContract.create({
    data: {
      workerId,
      employerId,
      minEngagement: terms.minEngagement,
      maxEngagement: terms.maxEngagement,
      effectiveFrom: terms.effectiveFrom,
      effectiveTo: terms.effectiveTo,
      reactivationPriority: terms.reactivationPriority,
      status: "ACTIVE",
    },
  });
}

/** Get workers ordered by reactivation priority for employer ramp-up */
export async function getReactivationQueue(
  employerId: string
): Promise<Array<{ workerId: string; priority: number; contractId: string }>> {
  const contracts = await prisma.elasticityContract.findMany({
    where: { employerId, status: "ACTIVE" },
    orderBy: { reactivationPriority: "desc" },
  });

  return contracts.map((c) => ({
    workerId: c.workerId,
    priority: c.reactivationPriority,
    contractId: c.id,
  }));
}
