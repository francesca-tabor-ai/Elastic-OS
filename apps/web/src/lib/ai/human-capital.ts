/**
 * Phase 2 Feature 6: Human Capital Value Model (MVP rule-based)
 * Score = f(skill rarity, tenure, replacement cost, time-to-replacement)
 */

import { prisma } from "@elastic-os/db";
import { Decimal } from "@prisma/client/runtime/library";

function toDecimal(n: number): Decimal {
  return new Decimal(n);
}

/** Skill rarity: inverse of workers with this skill. Rarer = higher value. */
async function getSkillRarityScore(workerId: string): Promise<number> {
  const skills = await prisma.workerSkill.findMany({
    where: { workerId },
    select: { skillName: true },
  });
  if (skills.length === 0) return 0.5; // default

  let raritySum = 0;
  for (const s of skills) {
    const count = await prisma.workerSkill.count({
      where: { skillName: s.skillName },
    });
    // Rarity: 1 / (1 + count) — fewer workers = higher rarity
    raritySum += 1 / (1 + count);
  }
  const avg = raritySum / skills.length;
  // Normalize: cap at ~1 for very rare skills
  return Math.min(1, avg * 2);
}

/** Tenure score: months since first affiliation / 24, capped at 1 */
async function getTenureScore(workerId: string, employerId: string): Promise<number> {
  const first = await prisma.affiliationRecord.findFirst({
    where: { workerId, employerId },
    orderBy: { effectiveFrom: "asc" },
  });
  if (!first) return 0;
  const months = (Date.now() - first.effectiveFrom.getTime()) / (30 * 24 * 60 * 60 * 1000);
  return Math.min(1, months / 24);
}

/** Base salary for worker-employer (from roster/salary band) */
async function getBaseSalary(workerId: string, employerId: string): Promise<number | null> {
  const roster = await prisma.workforceRoster.findUnique({
    where: { employerId_workerId: { employerId, workerId } },
    include: { salaryBand: true },
  });
  if (!roster) return null;
  if (roster.baseSalary) return Number(roster.baseSalary);
  if (roster.salaryBand) {
    const min = Number(roster.salaryBand.minAmount);
    const max = Number(roster.salaryBand.maxAmount);
    return (min + max) / 2;
  }
  return null;
}

/** Replacement cost estimate: ~1.5x annual salary (hiring + onboarding + ramp) */
function estimateReplacementCost(baseSalary: number): number {
  return Math.round(baseSalary * 1.5);
}

/** Time to replace (days): heuristic by salary band (higher salary = longer search) */
function estimateTimeToReplace(baseSalary: number): number {
  if (baseSalary >= 80_000) return 120;
  if (baseSalary >= 50_000) return 90;
  if (baseSalary >= 30_000) return 60;
  return 45;
}

export interface HumanCapitalResult {
  score: number;
  skillRarityScore: number;
  replacementCost: number | null;
  timeToReplace: number | null;
}

export async function computeHumanCapitalScore(
  workerId: string,
  employerId: string
): Promise<HumanCapitalResult> {
  const [skillRarity, tenure, baseSalary] = await Promise.all([
    getSkillRarityScore(workerId),
    getTenureScore(workerId, employerId),
    getBaseSalary(workerId, employerId),
  ]);

  const replacementCost = baseSalary != null ? estimateReplacementCost(baseSalary) : null;
  const timeToReplace = baseSalary != null ? estimateTimeToReplace(baseSalary) : null;

  // MVP: weighted score — skill rarity 40%, tenure 40%, salary weight 20%
  const salaryWeight = baseSalary != null ? Math.min(1, baseSalary / 100_000) : 0.5;
  const rawScore = skillRarity * 0.4 + tenure * 0.4 + salaryWeight * 0.2;
  const score = Math.max(0, Math.min(1, rawScore));

  return {
    score,
    skillRarityScore: skillRarity,
    replacementCost,
    timeToReplace,
  };
}

export async function upsertHumanCapitalScore(
  workerId: string,
  employerId: string
): Promise<void> {
  const result = await computeHumanCapitalScore(workerId, employerId);

  await prisma.humanCapitalScore.upsert({
    where: { workerId_employerId: { workerId, employerId } },
    create: {
      workerId,
      employerId,
      score: toDecimal(result.score),
      skillRarityScore: toDecimal(result.skillRarityScore),
      replacementCost: result.replacementCost != null ? toDecimal(result.replacementCost) : null,
      timeToReplace: result.timeToReplace ?? null,
    },
    update: {
      score: toDecimal(result.score),
      skillRarityScore: toDecimal(result.skillRarityScore),
      replacementCost: result.replacementCost != null ? toDecimal(result.replacementCost) : null,
      timeToReplace: result.timeToReplace ?? null,
    },
  });
}
