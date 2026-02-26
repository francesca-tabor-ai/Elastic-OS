import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "WORKER" || session.user.workerId !== (await params).workerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workerId } = await params;
  const body = await req.json();
  const { title, description, url, fileUrl } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const item = await prisma.portfolioItem.create({
    data: {
      workerId,
      title,
      description: description ?? undefined,
      url: url ?? undefined,
      fileUrl: fileUrl ?? undefined,
    },
  });

  return NextResponse.json(item);
}
