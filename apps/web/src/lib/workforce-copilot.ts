/**
 * Phase 5 Feature 18: AI Workforce Planning Copilot
 * Unifies HC, reactivation, skill decay, optimiser into recommendations
 */

import { prisma } from "@elastic-os/db";
import { computeHumanCapitalScore } from "./ai/human-capital";
import { computeReactivationProbability } from "./ai/reactivation";
import { runOptimisation } from "./ai/optimiser";

export interface HiringRecommendation {
  type: "HIRE" | "REACTIVATE";
  workerId?: string;
  rationale: string;
  priority: number;
}

export interface ElasticityRecommendation {
  workerId: string;
  currentIntensity: number;
  suggestedIntensity: number;
  rationale: string;
}

export interface UpskillingPlan {
  workerId: string;
  skillName: string;
  decayScore: number;
  suggestedSkills: string[];
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface WorkforcePlanResult {
  hiringRecommendations: HiringRecommendation[];
  elasticityRecommendations: ElasticityRecommendation[];
  upskillingPlans: UpskillingPlan[];
  summary: {
    suggestHire: number;
    suggestReactivate: number;
    suggestReduce: number;
    suggestUpskill: number;
  };
}

export async function getWorkforcePlanRecommendations(
  employerId: string,
  options?: { targetPayrollReductionPercent?: number }
): Promise<WorkforcePlanResult> {
  const hiringRecommendations: HiringRecommendation[] = [];
  const elasticityRecommendations: ElasticityRecommendation[] = [];
  const upskillingPlans: UpskillingPlan[] = [];

  const roster = await prisma.workforceRoster.findMany({
    where: { employerId },
    include: { worker: true, salaryBand: true },
  });

  const snapshots = await prisma.affiliationSnapshot.findMany({
    where: { employerId },
  });
  const snapshotByWorker = Object.fromEntries(snapshots.map((s) => [s.workerId, s]));

  for (const r of roster) {
    const snapshot = snapshotByWorker[r.workerId];
    const intensity = snapshot ? Number(snapshot.engagementIntensity) : 1;

    if (intensity < 1) {
      const [hc, react] = await Promise.all([
        computeHumanCapitalScore(r.workerId, employerId),
        computeReactivationProbability(r.workerId, employerId, intensity),
      ]);
      if (hc.score > 0.6 && react.probFullProd90Days > 0.7) {
        hiringRecommendations.push({
          type: "REACTIVATE",
          workerId: r.workerId,
          rationale: `High HC (${(hc.score * 100).toFixed(0)}%), reactivation readiness ${(react.probFullProd90Days * 100).toFixed(0)}%`,
          priority: hc.score * react.probFullProd90Days,
        });
      }
    }
  }

  const optResult = await runOptimisation(employerId, {
    targetPayrollReductionPercent: options?.targetPayrollReductionPercent ?? 0,
    minEngagement: 0.3,
  });

  for (const rec of optResult.recommendations) {
    elasticityRecommendations.push({
      workerId: rec.workerId,
      currentIntensity: rec.currentIntensity,
      suggestedIntensity: rec.suggestedIntensity,
      rationale: rec.rationale,
    });
  }

  const decayRecords = await prisma.workerSkillDecay.findMany({
    where: {
      workerId: { in: roster.map((r) => r.workerId) },
      decayScore: { lt: 0.85 },
    },
    include: { worker: true },
  });

  const workerEmployers = new Set(
    (await prisma.affiliationSnapshot.findMany({ where: { employerId } })).map((s) => s.workerId)
  );

  for (const d of decayRecords) {
    if (!workerEmployers.has(d.workerId)) continue;
    const suggestions = (d.upskillSuggestions as string[]) ?? [];
    const score = Number(d.decayScore);
    const priority = score < 0.6 ? "HIGH" : score < 0.75 ? "MEDIUM" : "LOW";
    upskillingPlans.push({
      workerId: d.workerId,
      skillName: d.skillName,
      decayScore: Number(d.decayScore),
      suggestedSkills: suggestions.slice(0, 5),
      priority,
    });
  }

  hiringRecommendations.sort((a, b) => b.priority - a.priority);

  return {
    hiringRecommendations,
    elasticityRecommendations,
    upskillingPlans,
    summary: {
      suggestHire: 0,
      suggestReactivate: hiringRecommendations.filter((h) => h.type === "REACTIVATE").length,
      suggestReduce: elasticityRecommendations.length,
      suggestUpskill: upskillingPlans.length,
    },
  };
}
