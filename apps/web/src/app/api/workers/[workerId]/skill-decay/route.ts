import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import {
  computeWorkerSkillDecay,
  upsertWorkerSkillDecay,
} from "@/lib/ai/skill-decay";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (
    session.user.role === "WORKER" &&
    session.user.workerId !== workerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const skills = await prisma.workerSkill.findMany({
    where: { workerId },
    select: { skillName: true },
  });

  if (skills.length === 0) {
    return NextResponse.json({ skills: [] });
  }

  const results = await Promise.all(
    skills.map((s) => computeWorkerSkillDecay(workerId, s.skillName))
  );

  return NextResponse.json({ skills: results });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (
    session.user.role === "WORKER" &&
    session.user.workerId !== workerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const skills = await prisma.workerSkill.findMany({
    where: { workerId },
    select: { skillName: true },
  });

  await Promise.all(
    skills.map((s) => upsertWorkerSkillDecay(workerId, s.skillName))
  );

  const results = await Promise.all(
    skills.map((s) => computeWorkerSkillDecay(workerId, s.skillName))
  );

  return NextResponse.json({ skills: results });
}
