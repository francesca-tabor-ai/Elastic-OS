/**
 * Phase 2 Feature 9: Reactivation Probability Predictor (MVP rule-based)
 * Predicts probability of full productivity within 30/60/90 days
 */

import { prisma } from "@elastic-os/db";
import { Decimal } from "@prisma/client/runtime/library";

function toDecimal(n: number): Decimal {
  return new Decimal(n);
}

/** Tenure in months for worker-employer */
async function getTenureMonths(workerId: string, employerId: string): Promise<number> {
  const first = await prisma.affiliationRecord.findFirst({
    where: { workerId, employerId },
    orderBy: { effectiveFrom: "asc" },
  });
  if (!first) return 0;
  return (Date.now() - first.effectiveFrom.getTime()) / (30 * 24 * 60 * 60 * 1000);
}

/** Certifications count (proxy for up-to-date skills) */
async function getCertificationCount(workerId: string): Promise<number> {
  return prisma.certification.count({
    where: { workerId, expiryAt: { gte: new Date() } },
  });
}

export interface ReactivationResult {
  probFullProd30Days: number;
  probFullProd60Days: number;
  probFullProd90Days: number;
}

export async function computeReactivationProbability(
  workerId: string,
  employerId: string,
  currentIntensity: number
): Promise<ReactivationResult> {
  const [tenureMonths, certCount] = await Promise.all([
    getTenureMonths(workerId, employerId),
    getCertificationCount(workerId),
  ]);

  // MVP rules:
  // - Tenure > 12 months: high base (0.8)
  // - Tenure 6–12: medium (0.65)
  // - Tenure 3–6: lower (0.5)
  // - Tenure < 3: lowest (0.35)
  let baseProb = 0.35;
  if (tenureMonths >= 12) baseProb = 0.85;
  else if (tenureMonths >= 6) baseProb = 0.7;
  else if (tenureMonths >= 3) baseProb = 0.55;

  // Certifications boost (up to +0.1)
  const certBoost = Math.min(0.1, certCount * 0.05);

  // Current intensity: if already high, easier to reach full (up to +0.05)
  const intensityBoost = currentIntensity >= 0.5 ? 0.05 : 0;

  const prob30 = Math.min(1, baseProb * 0.7 + certBoost + intensityBoost);
  const prob60 = Math.min(1, baseProb * 0.9 + certBoost + intensityBoost);
  const prob90 = Math.min(1, baseProb + certBoost + intensityBoost);

  return {
    probFullProd30Days: prob30,
    probFullProd60Days: prob60,
    probFullProd90Days: prob90,
  };
}

export async function upsertReactivationPrediction(
  workerId: string,
  employerId: string,
  currentIntensity: number
): Promise<void> {
  const result = await computeReactivationProbability(workerId, employerId, currentIntensity);

  await prisma.reactivationPrediction.upsert({
    where: { workerId_employerId: { workerId, employerId } },
    create: {
      workerId,
      employerId,
      currentIntensity: toDecimal(currentIntensity),
      probFullProd30Days: toDecimal(result.probFullProd30Days),
      probFullProd60Days: toDecimal(result.probFullProd60Days),
      probFullProd90Days: toDecimal(result.probFullProd90Days),
    },
    update: {
      currentIntensity: toDecimal(currentIntensity),
      probFullProd30Days: toDecimal(result.probFullProd30Days),
      probFullProd60Days: toDecimal(result.probFullProd60Days),
      probFullProd90Days: toDecimal(result.probFullProd90Days),
    },
  });
}
