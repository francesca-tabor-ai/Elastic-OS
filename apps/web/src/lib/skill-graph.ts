/**
 * Phase 5 Feature 19: National Skill Graph
 * Aggregated capability distribution across economy (privacy-preserving)
 */

import { prisma } from "@elastic-os/db";

export interface SkillSupplyDemand {
  skillName: string;
  supplyCount: number;
  demandCount: number;
  supplyDemandRatio: number;
  demandTrend: string | null;
}

export interface SkillGraphAggregate {
  skills: Array<{
    skillName: string;
    workerCount: number;
    opportunityCount: number;
    avgProficiency: number;
  }>;
  totalSkills: number;
  totalWorkersWithSkills: number;
}

/** Aggregate skill distribution: workers per skill, opportunities per skill */
export async function getSkillGraphAggregate(): Promise<SkillGraphAggregate> {
  const [workerSkills, opportunitySkills] = await Promise.all([
    prisma.workerSkill.groupBy({
      by: ["skillName"],
      _count: { workerId: true },
      _avg: { proficiency: true },
    }),
    prisma.opportunity.findMany({
      where: { status: "OPEN" },
      select: { requiredSkills: true },
    }),
  ]);

  const demandBySkill = new Map<string, number>();
  for (const opp of opportunitySkills) {
    for (const skill of opp.requiredSkills) {
      const key = skill.toLowerCase();
      demandBySkill.set(key, (demandBySkill.get(key) ?? 0) + 1);
    }
  }

  const skills = workerSkills.map((ws) => ({
    skillName: ws.skillName,
    workerCount: ws._count.workerId,
    avgProficiency: ws._avg.proficiency ?? 0,
    opportunityCount: demandBySkill.get(ws.skillName.toLowerCase()) ?? 0,
  }));

  const totalWorkersWithSkills = await prisma.workerSkill.groupBy({
    by: ["workerId"],
  }).then((g) => g.length);

  return {
    skills: skills.sort((a, b) => b.workerCount - a.workerCount),
    totalSkills: skills.length,
    totalWorkersWithSkills,
  };
}

/** Supply vs demand by skill for economic/education planning */
export async function getSkillSupplyDemand(): Promise<SkillSupplyDemand[]> {
  const [workerSkills, opportunities, metadata] = await Promise.all([
    prisma.workerSkill.groupBy({
      by: ["skillName"],
      _count: { workerId: true },
    }),
    prisma.opportunity.findMany({
      where: { status: "OPEN" },
      select: { requiredSkills: true },
    }),
    prisma.skillMetadata.findMany({
      select: { skillName: true, demandTrend: true },
    }),
  ]);

  const demandBySkill = new Map<string, number>();
  for (const opp of opportunities) {
    for (const skill of opp.requiredSkills) {
      const key = skill.toLowerCase();
      demandBySkill.set(key, (demandBySkill.get(key) ?? 0) + 1);
    }
  }

  const metaBySkill = new Map(metadata.map((m) => [m.skillName.toLowerCase(), m.demandTrend]));

  const result: SkillSupplyDemand[] = workerSkills.map((ws) => {
    const supply = ws._count.workerId;
    const demand = demandBySkill.get(ws.skillName.toLowerCase()) ?? 0;
    const ratio = demand > 0 ? supply / demand : supply;
    return {
      skillName: ws.skillName,
      supplyCount: supply,
      demandCount: demand,
      supplyDemandRatio: Math.round(ratio * 100) / 100,
      demandTrend: metaBySkill.get(ws.skillName.toLowerCase()) ?? null,
    };
  });

  return result.sort((a, b) => b.demandCount - a.demandCount);
}
