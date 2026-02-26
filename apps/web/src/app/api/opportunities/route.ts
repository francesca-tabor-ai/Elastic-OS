import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get("employerId");
  const status = searchParams.get("status");
  const skills = searchParams.get("skills")?.split(",").filter(Boolean);

  const where: Record<string, unknown> = {};
  if (employerId) where.employerId = employerId;
  if (status) where.status = status;
  if (skills?.length) {
    where.requiredSkills = { hasSome: skills };
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      employer: { include: { employerProfile: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    opportunities: opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      engagementIntensity: Number(o.engagementIntensity),
      durationMonths: o.durationMonths,
      requiredSkills: o.requiredSkills,
      status: o.status,
      employerId: o.employerId,
      employerName: o.employer?.employerProfile?.companyName ?? o.employerId,
      applicationCount: o._count.applications,
      createdAt: o.createdAt,
    })),
  });
}
