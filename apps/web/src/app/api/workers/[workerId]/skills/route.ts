import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { MIN_PROFICIENCY, MAX_PROFICIENCY } from "@elastic-os/shared";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "WORKER" || session.user.workerId !== (await params).workerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workerId } = await params;
  const body = await req.json();
  const { skillName, proficiency } = body;

  if (!skillName || typeof skillName !== "string") {
    return NextResponse.json({ error: "skillName is required" }, { status: 400 });
  }

  const prof = Number(proficiency ?? 3);
  if (prof < MIN_PROFICIENCY || prof > MAX_PROFICIENCY) {
    return NextResponse.json(
      { error: `proficiency must be between ${MIN_PROFICIENCY} and ${MAX_PROFICIENCY}` },
      { status: 400 }
    );
  }

  const skill = await prisma.workerSkill.upsert({
    where: {
      workerId_skillName: { workerId, skillName: skillName.trim() },
    },
    create: { workerId, skillName: skillName.trim(), proficiency: prof },
    update: { proficiency: prof },
  });

  return NextResponse.json(skill);
}
