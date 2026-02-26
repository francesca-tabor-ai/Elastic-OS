import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ skillName: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { skillName } = await params;
  const decoded = decodeURIComponent(skillName).toLowerCase();

  const meta = await prisma.skillMetadata.findUnique({
    where: { skillName: decoded },
  });

  if (!meta) {
    return NextResponse.json({
      skillName: decoded,
      halfLifeMonths: 36,
      demandTrend: "STABLE",
      relatedSkills: [],
    });
  }

  return NextResponse.json({
    skillName: meta.skillName,
    halfLifeMonths: meta.halfLifeMonths,
    demandTrend: meta.demandTrend,
    relatedSkills: (meta.relatedSkills as string[]) ?? [],
  });
}
