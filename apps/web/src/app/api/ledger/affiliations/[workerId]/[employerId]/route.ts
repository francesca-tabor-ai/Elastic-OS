import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWorkerEmployerAffiliation } from "@/lib/ledger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string; employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId, employerId } = await params;

  if (!workerId || !employerId) {
    return NextResponse.json({ error: "workerId and employerId required" }, { status: 400 });
  }

  if (session.user.role === "WORKER" && session.user.workerId !== workerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === "EMPLOYER" && session.user.employerId !== employerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await getWorkerEmployerAffiliation(workerId, employerId);
  return NextResponse.json(result);
}
