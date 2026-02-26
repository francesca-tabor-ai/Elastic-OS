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

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const forecasts = await prisma.employerForecast.findMany({
    where: { employerId },
    orderBy: { effectiveFrom: "desc" },
  });

  return NextResponse.json({ forecasts });
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

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { forecastType, payload, effectiveFrom, effectiveTo } = body;

  if (!forecastType || !payload || !effectiveFrom) {
    return NextResponse.json(
      { error: "forecastType, payload, effectiveFrom required" },
      { status: 400 }
    );
  }

  const forecast = await prisma.employerForecast.create({
    data: {
      employerId,
      forecastType,
      payload,
      effectiveFrom: new Date(effectiveFrom),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
    },
  });

  return NextResponse.json(forecast);
}
