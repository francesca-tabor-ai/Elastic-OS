import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBaseSalaryForPair } from "@/lib/ledger";
import { calculateCompensation, getBenefitsStatus } from "@/lib/compensation";
import { prisma } from "@elastic-os/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employerId: string; workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId, workerId } = await params;

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const intensityParam = url.searchParams.get("intensity");
  const proposedIntensity =
    intensityParam != null ? parseFloat(intensityParam) : null;

  if (proposedIntensity != null && (proposedIntensity < 0 || proposedIntensity > 1)) {
    return NextResponse.json(
      { error: "intensity must be between 0 and 1" },
      { status: 400 }
    );
  }

  const baseSalary = await getBaseSalaryForPair(workerId, employerId);
  const snapshot = await prisma.affiliationSnapshot.findUnique({
    where: { workerId_employerId: { workerId, employerId } },
  });

  const currentIntensity = snapshot ? Number(snapshot.engagementIntensity) : 1;
  const currentSalary =
    baseSalary != null
      ? calculateCompensation(baseSalary, currentIntensity)
      : null;
  const proposedSalary =
    proposedIntensity != null && baseSalary != null
      ? calculateCompensation(baseSalary, proposedIntensity)
      : null;

  const annualSavings =
    currentSalary != null && proposedSalary != null && proposedIntensity != null
      ? currentSalary - proposedSalary
      : null;

  return NextResponse.json({
    baseSalary,
    currentIntensity,
    proposedIntensity,
    currentSalary,
    proposedSalary,
    annualSavings,
    benefitsStatus:
      proposedIntensity != null
        ? getBenefitsStatus(proposedIntensity)
        : getBenefitsStatus(currentIntensity),
  });
}
