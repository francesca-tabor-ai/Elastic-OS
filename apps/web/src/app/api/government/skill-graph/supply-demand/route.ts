import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSkillSupplyDemand } from "@/lib/skill-graph";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  return session?.user?.role === "GOVERNMENT" || session?.user?.role === "ADMIN";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isGovernment(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supplyDemand = await getSkillSupplyDemand();
  return NextResponse.json({ supplyDemand });
}
