import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      employer: { include: { employerProfile: true } },
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    engagementIntensity: Number(opportunity.engagementIntensity),
    durationMonths: opportunity.durationMonths,
    requiredSkills: opportunity.requiredSkills,
    status: opportunity.status,
    employerId: opportunity.employerId,
    employerName: opportunity.employer?.employerProfile?.companyName ?? opportunity.employerId,
    createdAt: opportunity.createdAt,
  });
}
