import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  computeHumanCapitalScore,
  upsertHumanCapitalScore,
} from "@/lib/ai/human-capital";

export async function GET(
  _req: Request,
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

  const result = await computeHumanCapitalScore(workerId, employerId);
  return NextResponse.json(result);
}

export async function POST(
  _req: Request,
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

  await upsertHumanCapitalScore(workerId, employerId);
  const result = await computeHumanCapitalScore(workerId, employerId);
  return NextResponse.json(result);
}
