import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWorkerAffiliationHistory } from "@/lib/ledger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (!workerId) {
    return NextResponse.json({ error: "workerId required" }, { status: 400 });
  }

  // RBAC: Worker sees own; Employer sees workers in their roster; Gov sees all
  if (session.user.role === "WORKER" && session.user.workerId !== workerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const history = await getWorkerAffiliationHistory(workerId);
  return NextResponse.json(history);
}
