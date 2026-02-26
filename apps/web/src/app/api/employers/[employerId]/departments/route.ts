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

  const departments = await prisma.department.findMany({
    where: { employerId },
    include: {
      parentDepartment: true,
      childDepartments: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(departments);
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
  const { name, parentDepartmentId } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const dept = await prisma.department.create({
    data: {
      employerId,
      name,
      parentDepartmentId: parentDepartmentId ?? undefined,
    },
  });

  return NextResponse.json(dept);
}
