import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (session.user.role === "EMPLOYER" && session.user.employerId !== employerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roles = await prisma.jobRole.findMany({
    where: { employerId },
    include: { department: true },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(roles);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (session.user.role !== "EMPLOYER" || session.user.employerId !== employerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, departmentId } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const role = await prisma.jobRole.create({
    data: {
      employerId,
      title,
      departmentId: departmentId ?? undefined,
    },
  });

  return NextResponse.json(role);
}
