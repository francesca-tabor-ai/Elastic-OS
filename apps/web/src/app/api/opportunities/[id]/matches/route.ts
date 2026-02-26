import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpportunityMatches } from "@/lib/ai/matching";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10) || 20);

  const matches = await getOpportunityMatches(id, limit);
  return NextResponse.json({ matches });
}
