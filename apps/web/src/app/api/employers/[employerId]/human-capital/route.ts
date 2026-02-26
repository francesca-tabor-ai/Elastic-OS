import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { computeHumanCapitalScore } from "@/lib/ai/human-capital";

export async function GET(
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

  const roster = await prisma.workforceRoster.findMany({
    where: { employerId },
    include: { worker: { include: { user: true } } },
  });

  const scores = await Promise.all(
    roster.map(async (r) => {
      const result = await computeHumanCapitalScore(r.workerId, employerId);
      return {
        workerId: r.workerId,
        email: r.worker?.user?.email ?? "",
        ...result,
      };
    })
  );

  return NextResponse.json({ scores });
}
