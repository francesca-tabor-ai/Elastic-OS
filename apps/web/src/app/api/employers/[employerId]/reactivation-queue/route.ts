import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReactivationQueue } from "@/lib/elasticity-contract";

function isEmployerOrAdmin(session: { user?: { role?: string; employerId?: string } } | null, employerId: string): boolean {
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  return session.user.role === "EMPLOYER" && session.user.employerId === employerId;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employerId } = await params;
  if (!isEmployerOrAdmin(session, employerId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const queue = await getReactivationQueue(employerId);
  return NextResponse.json({ queue });
}
