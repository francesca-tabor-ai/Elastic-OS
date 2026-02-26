import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { runOptimisation } from "@/lib/ai/optimiser";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const targetPayrollReductionPercent = body.targetPayrollReductionPercent ?? 0;
  const targetHeadcountReduction = body.targetHeadcountReduction;
  const minEngagement = body.minEngagement ?? 0.3;

  const result = await runOptimisation(employerId, {
    targetPayrollReductionPercent,
    targetHeadcountReduction,
    minEngagement,
  });

  const run = await prisma.optimisationRun.create({
    data: {
      employerId,
      inputSnapshot: {
        targetPayrollReductionPercent,
        targetHeadcountReduction,
        minEngagement,
      } as object,
      recommendations: result.recommendations as object,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    runId: run.id,
    ...result,
  });
}
