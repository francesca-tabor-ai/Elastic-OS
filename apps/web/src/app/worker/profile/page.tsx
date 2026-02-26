import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@elastic-os/db";
import { WorkerProfileClient } from "./WorkerProfileClient";

export default async function WorkerProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "WORKER" || !session.user.workerId) {
    redirect("/login");
  }

  const profile = await prisma.worker.findUnique({
    where: { id: session.user.workerId },
    include: {
      workerProfile: true,
      workerSkills: true,
      certifications: true,
      portfolioItems: true,
      employerReferences: { include: { employer: { include: { employerProfile: true } } } },
    },
  });

  if (!profile) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600">Worker not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Worker Profile</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <WorkerProfileClient
          workerId={session.user.workerId}
          initialProfile={JSON.parse(JSON.stringify(profile))}
        />
      </div>
    </main>
  );
}
