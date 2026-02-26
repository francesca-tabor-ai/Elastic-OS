import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecommendedOpportunities } from "@/lib/ai/matching";

export async function GET(
  req: Request,
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

  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10) || 20);

  const matches = await getRecommendedOpportunities(workerId, limit);
  return NextResponse.json({ opportunities: matches });
}
