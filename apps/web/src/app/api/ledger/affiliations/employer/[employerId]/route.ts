import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEmployerAffiliationHistory } from "@/lib/ledger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (!employerId) {
    return NextResponse.json({ error: "employerId required" }, { status: 400 });
  }

  if (session.user.role === "EMPLOYER" && session.user.employerId !== employerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const history = await getEmployerAffiliationHistory(employerId);
  return NextResponse.json(history);
}
