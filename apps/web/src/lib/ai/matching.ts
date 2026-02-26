/**
 * Phase 3 Feature 11: AI Labour Matching Engine (MVP rule-based)
 * Skill compatibility + availability check
 */

import { prisma } from "@elastic-os/db";
import { getWorkerHeadroom } from "../marketplace";

/** Jaccard-like skill match: |intersection| / |required| */
function skillMatchScore(
  workerSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 1;
  const workerSet = new Set(workerSkills.map((s) => s.toLowerCase()));
  const matched = requiredSkills.filter((r) =>
    workerSet.has(r.toLowerCase())
  ).length;
  return matched / requiredSkills.length;
}

export interface OpportunityMatch {
  id: string;
  title: string;
  employerName: string;
  engagementIntensity: number;
  requiredSkills: string[];
  skillMatchPct: number;
  headroomOk: boolean;
  score: number;
}

/** Get opportunities recommended for a worker */
export async function getRecommendedOpportunities(
  workerId: string,
  limit = 20
): Promise<OpportunityMatch[]> {
  const [headroom, workerSkills, opportunities] = await Promise.all([
    getWorkerHeadroom(workerId),
    prisma.workerSkill.findMany({
      where: { workerId },
      select: { skillName: true },
    }),
    prisma.opportunity.findMany({
      where: { status: "OPEN" },
      include: {
        employer: { include: { employerProfile: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!headroom.openToOpportunities || headroom.headroom <= 0) {
    return [];
  }

  const workerSkillNames = workerSkills.map((s) => s.skillName);
  const appliedOpportunityIds = new Set(
    (
      await prisma.opportunityApplication.findMany({
        where: { workerId },
        select: { opportunityId: true },
      })
    ).map((a) => a.opportunityId)
  );

  const existingEmployerIds = new Set(
    (
      await prisma.affiliationSnapshot.findMany({
        where: { workerId },
        select: { employerId: true },
      })
    ).map((s) => s.employerId)
  );

  const matches: OpportunityMatch[] = [];

  for (const opp of opportunities) {
    if (appliedOpportunityIds.has(opp.id)) continue;
    if (existingEmployerIds.has(opp.employerId)) continue;

    const intensity = Number(opp.engagementIntensity);
    const headroomOk = intensity <= headroom.headroom;

    if (!headroomOk) continue;

    const skillMatchPct = skillMatchScore(workerSkillNames, opp.requiredSkills);
    const score = skillMatchPct * 0.7 + (headroomOk ? 0.3 : 0);

    matches.push({
      id: opp.id,
      title: opp.title,
      employerName: opp.employer?.employerProfile?.companyName ?? opp.employerId,
      engagementIntensity: intensity,
      requiredSkills: opp.requiredSkills,
      skillMatchPct,
      headroomOk,
      score,
    });
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
}

export interface WorkerMatch {
  workerId: string;
  email: string;
  skillMatchPct: number;
  headroomOk: boolean;
  score: number;
}

/** Get worker matches for an opportunity */
export async function getOpportunityMatches(
  opportunityId: string,
  limit = 20
): Promise<WorkerMatch[]> {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity || opportunity.status !== "OPEN") {
    return [];
  }

  const intensity = Number(opportunity.engagementIntensity);
  const requiredSkills = opportunity.requiredSkills;

  const workersWithAvailability = await prisma.workerAvailability.findMany({
    where: { openToOpportunities: true },
    include: {
      worker: {
        include: {
          user: true,
          workerSkills: true,
        },
      },
    },
  });

  const matches: WorkerMatch[] = [];

  for (const wa of workersWithAvailability) {
    const headroom = await getWorkerHeadroom(wa.workerId);
    const headroomOk = intensity <= headroom.headroom;

    if (!headroomOk) continue;

    const alreadyApplied = await prisma.opportunityApplication.findUnique({
      where: {
        opportunityId_workerId: { opportunityId, workerId: wa.workerId },
      },
    });
    if (alreadyApplied) continue;

    const hasSnapshot = await prisma.affiliationSnapshot.findUnique({
      where: {
        workerId_employerId: { workerId: wa.workerId, employerId: opportunity.employerId },
      },
    });
    if (hasSnapshot) continue;

    const workerSkillNames = wa.worker.workerSkills.map((s) => s.skillName);
    const skillMatchPct = skillMatchScore(workerSkillNames, requiredSkills);
    const score = skillMatchPct * 0.7 + (headroomOk ? 0.3 : 0);

    matches.push({
      workerId: wa.workerId,
      email: wa.worker?.user?.email ?? "",
      skillMatchPct,
      headroomOk,
      score,
    });
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
}
