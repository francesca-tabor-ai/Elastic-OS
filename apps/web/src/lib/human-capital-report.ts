/**
 * Phase 5 Feature 16: Human Capital Balance Sheet Integration
 * Aggregate HC asset value for employer accounting export
 */

import { prisma } from "@elastic-os/db";
import { computeHumanCapitalScore } from "./ai/human-capital";

export interface HumanCapitalReportResult {
  reportDate: string;
  totalAssetValue: number;
  workerCount: number;
  breakdown: Array<{
    workerId: string;
    score: number;
    replacementCost: number | null;
    timeToReplace: number | null;
  }>;
}

export async function computeHumanCapitalReport(
  employerId: string,
  _reportDate: Date
): Promise<HumanCapitalReportResult> {
  const roster = await prisma.workforceRoster.findMany({
    where: { employerId },
    select: { workerId: true },
  });

  const breakdown: HumanCapitalReportResult["breakdown"] = [];
  for (const r of roster) {
    const result = await computeHumanCapitalScore(r.workerId, employerId);
    breakdown.push({
      workerId: r.workerId,
      score: result.score,
      replacementCost: result.replacementCost,
      timeToReplace: result.timeToReplace,
    });
  }

  const totalAssetValue = breakdown.reduce(
    (sum, b) => sum + (b.replacementCost ?? 0),
    0
  );

  return {
    reportDate: _reportDate.toISOString().slice(0, 10),
    totalAssetValue,
    workerCount: breakdown.length,
    breakdown,
  };
}
