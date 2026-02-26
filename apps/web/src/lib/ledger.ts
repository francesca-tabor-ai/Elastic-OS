import { prisma } from "@elastic-os/db";
import type { AffiliationRecordType } from "@elastic-os/shared";
import { MIN_ENGAGEMENT_INTENSITY, MAX_ENGAGEMENT_INTENSITY } from "@elastic-os/shared";
import { Decimal } from "@prisma/client/runtime/library";
import {
  calculateCompensation,
  getBenefitsStatus,
} from "./compensation";

function toDecimal(n: number): Decimal {
  return new Decimal(n);
}

function validIntensity(n: number): boolean {
  return n >= MIN_ENGAGEMENT_INTENSITY && n <= MAX_ENGAGEMENT_INTENSITY;
}

/** Get base salary for worker-employer from roster or salary band midpoint */
async function getBaseSalary(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  workerId: string,
  employerId: string
): Promise<number | null> {
  const roster = await tx.workforceRoster.findUnique({
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

/** Simple continuity score: min(1, months since first record / 12) */
async function calculateContinuityScore(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  workerId: string,
  employerId: string
): Promise<number> {
  const first = await tx.affiliationRecord.findFirst({
    where: { workerId, employerId },
    orderBy: { effectiveFrom: "asc" },
  });
  if (!first) return 0;
  const months = (Date.now() - first.effectiveFrom.getTime()) / (30 * 24 * 60 * 60 * 1000);
  return Math.min(1, months / 12);
}

export async function createOrAdjustAffiliation(params: {
  workerId: string;
  employerId: string;
  engagementIntensity: number;
  recordType: AffiliationRecordType;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}) {
  const { workerId, employerId, engagementIntensity, recordType, createdBy, metadata } = params;

  if (!validIntensity(engagementIntensity)) {
    throw new Error(`Engagement intensity must be between ${MIN_ENGAGEMENT_INTENSITY} and ${MAX_ENGAGEMENT_INTENSITY}`);
  }

  return prisma.$transaction(async (tx) => {
    const now = new Date();

    const existingSnapshot = await tx.affiliationSnapshot.findUnique({
      where: { workerId_employerId: { workerId, employerId } },
    });

    if (existingSnapshot) {
      await tx.affiliationRecord.updateMany({
        where: {
          workerId,
          employerId,
          effectiveTo: null,
        },
        data: { effectiveTo: now },
      });
    }

    const record = await tx.affiliationRecord.create({
      data: {
        workerId,
        employerId,
        engagementIntensity: toDecimal(engagementIntensity),
        effectiveFrom: now,
        effectiveTo: recordType === "TERMINATED" ? now : null,
        recordType,
        createdBy,
        metadata: (metadata ?? undefined) as object | undefined,
      },
    });

    if (recordType !== "TERMINATED") {
      const baseSalary = await getBaseSalary(tx, workerId, employerId);
      const adjustedSalary = baseSalary != null
        ? calculateCompensation(baseSalary, engagementIntensity)
        : null;
      const benefitsStatus = getBenefitsStatus(engagementIntensity);
      const affiliationContinuityScore = await calculateContinuityScore(tx, workerId, employerId);

      await tx.affiliationSnapshot.upsert({
        where: { workerId_employerId: { workerId, employerId } },
        create: {
          workerId,
          employerId,
          engagementIntensity: toDecimal(engagementIntensity),
          adjustedSalary: adjustedSalary != null ? toDecimal(adjustedSalary) : undefined,
          benefitsStatus,
          affiliationContinuityScore: toDecimal(affiliationContinuityScore),
        },
        update: {
          engagementIntensity: toDecimal(engagementIntensity),
          adjustedSalary: adjustedSalary != null ? toDecimal(adjustedSalary) : undefined,
          benefitsStatus,
          affiliationContinuityScore: toDecimal(affiliationContinuityScore),
        },
      });
    } else {
      await tx.affiliationSnapshot.deleteMany({
        where: { workerId, employerId },
      });
    }

    return record;
  });
}

/** Get base salary for worker-employer (for preview API, outside transaction) */
export async function getBaseSalaryForPair(
  workerId: string,
  employerId: string
): Promise<number | null> {
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

export async function getWorkerAffiliationHistory(workerId: string) {
  return prisma.affiliationRecord.findMany({
    where: { workerId },
    orderBy: { createdAt: "desc" },
    include: {
      employer: { include: { employerProfile: true } },
    },
  });
}

export async function getEmployerAffiliationHistory(employerId: string) {
  return prisma.affiliationRecord.findMany({
    where: { employerId },
    orderBy: { createdAt: "desc" },
    include: {
      worker: { include: { user: true, workerProfile: true } },
    },
  });
}

export async function getWorkerEmployerAffiliation(workerId: string, employerId: string) {
  const [snapshot, history] = await Promise.all([
    prisma.affiliationSnapshot.findUnique({
      where: { workerId_employerId: { workerId, employerId } },
      include: { employer: { include: { employerProfile: true } } },
    }),
    prisma.affiliationRecord.findMany({
      where: { workerId, employerId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { current: snapshot, history };
}
