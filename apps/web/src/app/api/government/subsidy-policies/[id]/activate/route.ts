import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  const role = session?.user?.role;
  return role === "GOVERNMENT" || role === "ADMIN";
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGovernment(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.subsidyPolicy.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
  return NextResponse.json({ status: "ACTIVE" });
}
