import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { createOrAdjustAffiliation } from "@/lib/ledger";
import { Decimal } from "@prisma/client/runtime/library";

function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (inQuotes) {
        current += c;
      } else if (c === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  });
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

  if (session.user.role !== "EMPLOYER" || session.user.employerId !== employerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV must have header row and at least one data row" },
      { status: 400 }
    );
  }

  const header = rows[0].map((h) => h.toLowerCase().replace(/\s/g, ""));
  const workerIdIdx = header.findIndex((h) => h === "workerid" || h === "worker_id");
  const engagementIdx = header.findIndex(
    (h) => h === "engagement" || h === "engagementintensity"
  );
  const baseSalaryIdx = header.findIndex(
    (h) => h === "basesalary" || h === "base_salary" || h === "salary"
  );

  if (workerIdIdx === -1) {
    return NextResponse.json(
      { error: "CSV must have workerId or worker_id column" },
      { status: 400 }
    );
  }

  const errors: string[] = [];
  const created: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const workerId = row[workerIdIdx]?.trim();
    const engagement =
      engagementIdx >= 0 ? parseFloat(row[engagementIdx] ?? "1") : 1;
    const baseSalary =
      baseSalaryIdx >= 0 && row[baseSalaryIdx]
        ? parseFloat(row[baseSalaryIdx]?.trim() ?? "")
        : null;

    if (!workerId) {
      errors.push(`Row ${i + 1}: missing workerId`);
      continue;
    }

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      errors.push(`Row ${i + 1}: worker ${workerId} not found`);
      continue;
    }

    try {
      const baseSalaryVal =
        baseSalary != null && !isNaN(baseSalary) ? new Decimal(baseSalary) : null;
      await prisma.workforceRoster.upsert({
        where: {
          employerId_workerId: { employerId, workerId },
        },
        create: {
          employerId,
          workerId,
          ...(baseSalaryVal && { baseSalary: baseSalaryVal }),
        },
        update: baseSalaryVal ? { baseSalary: baseSalaryVal } : {},
      });

      await createOrAdjustAffiliation({
        workerId,
        employerId,
        engagementIntensity: Math.min(1, Math.max(0, engagement)),
        recordType: "ACTIVE",
        createdBy: session.user.id,
        metadata: { source: "csv_import", row: i + 1 },
      });

      created.push(workerId);
    } catch (e) {
      errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  return NextResponse.json({
    created: created.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
