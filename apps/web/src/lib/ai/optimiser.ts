/**
 * Phase 2 Feature 7: Elasticity Optimisation AI (MVP greedy heuristic)
 * Given budget constraint, recommend engagement allocation to maximise retention
 */

import { prisma } from "@elastic-os/db";
import { computeHumanCapitalScore } from "./human-capital";
import { computeReactivationProbability } from "./reactivation";

export interface OptimisationInput {
  targetPayrollReductionPercent?: number;
  targetHeadcountReduction?: number;
  minEngagement?: number;
}

export interface Recommendation {
  workerId: string;
  email: string;
  currentIntensity: number;
  suggestedIntensity: number;
  rationale: string;
  humanCapitalScore: number;
  reactivation90: number;
}

export interface OptimisationResult {
  recommendations: Recommendation[];
  summary: {
    workersAffected: number;
    currentPayroll: number;
    projectedPayroll: number;
    savings: number;
  };
}

export async function runOptimisation(
  employerId: string,
  input: OptimisationInput
): Promise<OptimisationResult> {
  const minEngagement = input.minEngagement ?? 0.3;

  const roster = await prisma.workforceRoster.findMany({
    where: { employerId },
    include: {
      worker: { include: { user: true } },
      salaryBand: true,
    },
  });

  const snapshots = await prisma.affiliationSnapshot.findMany({
    where: { employerId },
  });

  const snapshotByWorker = Object.fromEntries(
    snapshots.map((s) => [s.workerId, s])
  );

  let currentPayroll = 0;
  const workerData: Array<{
    workerId: string;
    email: string;
    baseSalary: number;
    currentIntensity: number;
  }> = [];

  for (const r of roster) {
    const baseSalary = r.baseSalary
      ? Number(r.baseSalary)
      : r.salaryBand
        ? (Number(r.salaryBand.minAmount) + Number(r.salaryBand.maxAmount)) / 2
        : 0;
    const snapshot = snapshotByWorker[r.workerId];
    const intensity = snapshot ? Number(snapshot.engagementIntensity) : 1;
    currentPayroll += baseSalary * intensity;
    workerData.push({
      workerId: r.workerId,
      email: r.worker?.user?.email ?? "",
      baseSalary,
      currentIntensity: intensity,
    });
  }

  const targetReduction = input.targetPayrollReductionPercent ?? 0;
  const targetPayroll = currentPayroll * (1 - targetReduction / 100);

  // Score each worker: human capital + reactivation (prefer retaining high-value, high-reactivation)
  const scored: Array<{
    workerId: string;
    email: string;
    baseSalary: number;
    currentIntensity: number;
    hcScore: number;
    react90: number;
    retainScore: number;
  }> = [];

  for (const w of workerData) {
    const snapshot = snapshotByWorker[w.workerId];
    const intensity = snapshot ? Number(snapshot.engagementIntensity) : 1;

    const [hc, react] = await Promise.all([
      computeHumanCapitalScore(w.workerId, employerId),
      computeReactivationProbability(w.workerId, employerId, intensity),
    ]);

    // Retain score: higher HC and reactivation = more valuable to keep at higher engagement
    const retainScore = hc.score * 0.6 + react.probFullProd90Days * 0.4;

    scored.push({
      workerId: w.workerId,
      email: w.email,
      baseSalary: w.baseSalary,
      currentIntensity: intensity,
      hcScore: hc.score,
      react90: react.probFullProd90Days,
      retainScore,
    });
  }

  // Sort by retain score ascending — reduce engagement for lowest-value first to hit budget
  scored.sort((a, b) => a.retainScore - b.retainScore);

  const recommendations: Recommendation[] = [];
  let projectedPayroll = currentPayroll;
  const savingsNeeded = currentPayroll - targetPayroll;

  if (savingsNeeded <= 0) {
    return {
      recommendations: [],
      summary: {
        workersAffected: 0,
        currentPayroll: Math.round(currentPayroll * 100) / 100,
        projectedPayroll: Math.round(currentPayroll * 100) / 100,
        savings: 0,
      },
    };
  }

  let savingsSoFar = 0;

  for (const w of scored) {
    if (savingsSoFar >= savingsNeeded) break;
    if (w.currentIntensity <= minEngagement) continue;

    const reduction = Math.min(
      w.currentIntensity - minEngagement,
      (savingsNeeded - savingsSoFar) / w.baseSalary
    );
    if (reduction <= 0) continue;

    const suggested = Math.max(minEngagement, w.currentIntensity - reduction);
    recommendations.push({
      workerId: w.workerId,
      email: w.email,
      currentIntensity: w.currentIntensity,
      suggestedIntensity: suggested,
      rationale: `Human capital ${(w.hcScore * 100).toFixed(0)}%, reactivation ${(w.react90 * 100).toFixed(0)}%`,
      humanCapitalScore: w.hcScore,
      reactivation90: w.react90,
    });

    savingsSoFar += w.baseSalary * (w.currentIntensity - suggested);
  }

  projectedPayroll = currentPayroll - savingsSoFar;

  return {
    recommendations,
    summary: {
      workersAffected: recommendations.length,
      currentPayroll: Math.round(currentPayroll * 100) / 100,
      projectedPayroll: Math.round(projectedPayroll * 100) / 100,
      savings: Math.round((currentPayroll - projectedPayroll) * 100) / 100,
    },
  };
}
