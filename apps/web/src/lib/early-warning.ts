/**
 * Phase 4: Labour Stability Early Warning System (MVP rule-based)
 */

import { prisma } from "@elastic-os/db";

export interface EarlyWarningSignal {
  type: string;
  severity: string;
  summary: string;
  payload: Record<string, unknown>;
}

export async function computeEarlyWarningSignals(): Promise<
  EarlyWarningSignal[]
> {
  const signals: EarlyWarningSignal[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Termination spike (week-over-week)
  const [termsThisWeek, termsLastWeek] = await Promise.all([
    prisma.affiliationRecord.count({
      where: {
        recordType: "TERMINATED",
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.affiliationRecord.count({
      where: {
        recordType: "TERMINATED",
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo,
        },
      },
    }),
  ]);

  const termSpike = termsLastWeek > 0 ? termsThisWeek / termsLastWeek : 0;
  if (termSpike > 1.5 && termsThisWeek >= 3) {
    signals.push({
      type: "INSTABILITY",
      severity: termSpike > 2 ? "HIGH" : "MEDIUM",
      summary: `Termination spike: ${termsThisWeek} this week vs ${termsLastWeek} last week (${(termSpike * 100).toFixed(0)}%)`,
      payload: { termsThisWeek, termsLastWeek, ratio: termSpike },
    });
  }

  // Mass layoff risk: employers with >30% workforce reduced in 30 days
  const employerSnapshots = await prisma.affiliationSnapshot.groupBy({
    by: ["employerId"],
    _count: { workerId: true },
  });

  const employerReductions = await prisma.affiliationRecord.groupBy({
    by: ["employerId"],
    where: {
      recordType: { in: ["TERMINATED", "ADJUSTED"] },
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
  });

  for (const emp of employerSnapshots) {
    const currentCount = emp._count.workerId;
    const reductions = employerReductions.find((r) => r.employerId === emp.employerId)?._count.id ?? 0;
    const reductionRate = currentCount > 0 ? reductions / currentCount : 0;
    if (reductionRate >= 0.3 && currentCount >= 5) {
      signals.push({
        type: "MASS_LAYOFF_RISK",
        severity: reductionRate >= 0.5 ? "HIGH" : "MEDIUM",
        summary: `Employer ${emp.employerId.slice(0, 8)}... has ${(reductionRate * 100).toFixed(0)}% workforce reduction in 30 days`,
        payload: { employerId: emp.employerId, currentCount, reductions, reductionRate },
      });
    }
  }

  // Skill loss risk: workers with low decay score
  const [skillDecay, decayGroups] = await Promise.all([
    prisma.workerSkillDecay.findMany({
      where: { decayScore: { lt: 0.7 } },
    }),
    prisma.workerSkillDecay.groupBy({ by: ["workerId"] }),
  ]);
  const lowDecayWorkers = new Set(skillDecay.map((s) => s.workerId)).size;
  const totalWorkersWithDecay = decayGroups.length;
  const skillLossRate = totalWorkersWithDecay > 0 ? lowDecayWorkers / totalWorkersWithDecay : 0;
  if (skillLossRate > 0.2 && lowDecayWorkers >= 5) {
    signals.push({
      type: "SKILL_LOSS_RISK",
      severity: skillLossRate > 0.4 ? "MEDIUM" : "LOW",
      summary: `${lowDecayWorkers} workers with skill decay score < 0.7 (${(skillLossRate * 100).toFixed(0)}% of assessed)`,
      payload: { lowDecayWorkers, totalAssessed: totalWorkersWithDecay, rate: skillLossRate },
    });
  }

  return signals;
}

export async function createAlertsFromSignals(): Promise<number> {
  const signals = await computeEarlyWarningSignals();
  let created = 0;

  for (const sig of signals) {
    const existing = await prisma.earlyWarningAlert.findFirst({
      where: {
        alertType: sig.type,
        acknowledgedAt: null,
        triggeredAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (existing) continue;

    await prisma.earlyWarningAlert.create({
      data: {
        alertType: sig.type,
        severity: sig.severity,
        summary: sig.summary,
        payload: sig.payload as object,
      },
    });
    created++;
  }

  return created;
}
