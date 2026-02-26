/**
 * Phase 2 Feature 8: Skill Depreciation Predictor (MVP rule-based)
 * Decay score 0-1 (1=no decay), half-life, upskill suggestions
 */

import { prisma } from "@elastic-os/db";
import { Decimal } from "@prisma/client/runtime/library";

const DEFAULT_HALF_LIFE_MONTHS = 36;
const RAPID_DECAY_SKILLS = ["react", "vue", "angular", "aws", "kubernetes"];

function toDecimal(n: number): Decimal {
  return new Decimal(n);
}

async function getSkillMetadata(skillName: string): Promise<{ halfLifeMonths: number; demandTrend: string }> {
  const meta = await prisma.skillMetadata.findUnique({
    where: { skillName: skillName.toLowerCase() },
  });
  const halfLife = meta?.halfLifeMonths ?? DEFAULT_HALF_LIFE_MONTHS;
  const demandTrend = meta?.demandTrend ?? "STABLE";
  return { halfLifeMonths: halfLife, demandTrend };
}

function getRelatedUpskillsFallback(skillName: string): string[] {
  const related: Record<string, string[]> = {
    javascript: ["typescript", "react", "node.js"],
    react: ["next.js", "vue", "typescript"],
    python: ["fastapi", "pytest", "machine learning"],
    sql: ["postgresql", "mongodb", "data modeling"],
  };
  return related[skillName.toLowerCase()] ?? [];
}

export interface SkillDecayResult {
  skillName: string;
  decayScore: number;
  halfLifeMonths: number;
  upskillSuggestions: string[];
}

export async function computeWorkerSkillDecay(
  workerId: string,
  skillName: string
): Promise<SkillDecayResult> {
  const [skill, metadata] = await Promise.all([
    prisma.workerSkill.findUnique({
      where: { workerId_skillName: { workerId, skillName } },
    }),
    getSkillMetadata(skillName),
  ]);

  if (!skill) {
    return {
      skillName,
      decayScore: 0,
      halfLifeMonths: metadata.halfLifeMonths,
      upskillSuggestions: [],
    };
  }

  // Decay: based on demand trend and half-life
  // STABLE: 0.95, GROWING: 1, DECLINING: 0.8
  let decayBase = 1;
  if (metadata.demandTrend === "DECLINING") decayBase = 0.8;
  else if (metadata.demandTrend === "GROWING") decayBase = 1;
  else decayBase = 0.95;

  // Rapid-decay skills get slight penalty
  const rapidPenalty = RAPID_DECAY_SKILLS.some((s) =>
    skillName.toLowerCase().includes(s)
  )
    ? 0.1
    : 0;
  const decayScore = Math.max(0, Math.min(1, decayBase - rapidPenalty));

  const metaRecord = await prisma.skillMetadata.findUnique({
    where: { skillName: skillName.toLowerCase() },
  });
  const related = (metaRecord?.relatedSkills as string[] | null) ?? getRelatedUpskillsFallback(skillName);

  return {
    skillName,
    decayScore,
    halfLifeMonths: metadata.halfLifeMonths,
    upskillSuggestions: related.slice(0, 5),
  };
}

export async function upsertWorkerSkillDecay(
  workerId: string,
  skillName: string
): Promise<void> {
  const result = await computeWorkerSkillDecay(workerId, skillName);

  await prisma.workerSkillDecay.upsert({
    where: { workerId_skillName: { workerId, skillName } },
    create: {
      workerId,
      skillName,
      decayScore: toDecimal(result.decayScore),
      halfLifeMonths: result.halfLifeMonths,
      upskillSuggestions: result.upskillSuggestions,
    },
    update: {
      decayScore: toDecimal(result.decayScore),
      halfLifeMonths: result.halfLifeMonths,
      upskillSuggestions: result.upskillSuggestions,
    },
  });
}
