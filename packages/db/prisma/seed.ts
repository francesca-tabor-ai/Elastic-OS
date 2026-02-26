import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const APPS = [
  {
    slug: "affiliation-export",
    name: "Affiliation Export",
    description: "Export your affiliation history to CSV or PDF for tax, compliance, or job applications.",
    longDescription:
      "One-click export of your complete affiliation ledger. Includes engagement intensity, effective dates, and employer details. Ideal for self-assessment, HMRC reporting, or attaching to job applications.",
    icon: "📤",
    category: "WORKFLOW" as const,
    scope: "WORKER" as const,
    vendor: "ElasticOS",
    isBuiltIn: true,
    scopes: ["read:affiliations"],
  },
  {
    slug: "linkedin-sync",
    name: "LinkedIn Sync",
    description: "Sync verified work history and skills to your LinkedIn profile.",
    longDescription:
      "Automatically update your LinkedIn experience section with employer-verified data. Skills, certifications, and references flow from ElasticOS—no manual copy-paste.",
    icon: "🔗",
    category: "INTEGRATION" as const,
    scope: "WORKER" as const,
    vendor: "ElasticOS",
    isBuiltIn: true,
    scopes: ["read:affiliations", "read:skills", "read:profile"],
    installUrl: "https://linkedin.com/oauth", // placeholder
  },
  {
    slug: "roster-sync-xero",
    name: "Roster Sync for Xero",
    description: "Push workforce roster and engagement data to Xero for payroll.",
    longDescription:
      "Keep payroll in sync with real engagement. Changes to affiliation intensity or roster entries automatically flow to Xero. Reduces manual data entry and reconciliation.",
    icon: "📊",
    category: "INTEGRATION" as const,
    scope: "EMPLOYER" as const,
    vendor: "ElasticOS",
    isBuiltIn: true,
    scopes: ["read:roster", "read:affiliations"],
    installUrl: "https://xero.com/oauth", // placeholder
  },
  {
    slug: "engagement-reports",
    name: "Engagement Reports",
    description: "Generate compliance and planning reports from your affiliation ledger.",
    longDescription:
      "Pre-built report templates: headcount by intensity, FTE equivalents, affiliation continuity scores. Export for board packs, audits, or workforce planning.",
    icon: "📈",
    category: "REPORTING" as const,
    scope: "EMPLOYER" as const,
    vendor: "ElasticOS",
    isBuiltIn: true,
    scopes: ["read:affiliations", "read:roster", "read:snapshots"],
  },
  {
    slug: "slack-notifications",
    name: "Slack Notifications",
    description: "Get real-time notifications when affiliations change or workers are verified.",
    longDescription:
      "New affiliation? Worker verified? Send alerts to Slack channels. Perfect for HR teams who want visibility without refreshing the dashboard.",
    icon: "💬",
    category: "PRODUCTIVITY" as const,
    scope: "EMPLOYER" as const,
    vendor: "ElasticOS",
    isBuiltIn: true,
    scopes: ["read:affiliations"],
  },
  {
    slug: "verification-audit-trail",
    name: "Verification Audit Trail",
    description: "Structured audit log of all verification events for compliance.",
    longDescription:
      "Export a complete audit trail of GOV.UK Verify, Companies House, and MFA verification events. Ready for regulatory audits and internal compliance reviews.",
    icon: "🔒",
    category: "COMPLIANCE" as const,
    scope: "BOTH" as const,
    vendor: "ElasticOS",
    isBuiltIn: true,
    scopes: ["read:verification_logs"],
  },
];

async function main() {
  for (const app of APPS) {
    await prisma.app.upsert({
      where: { slug: app.slug },
      create: app,
      update: app,
    });
  }
  console.log(`Seeded ${APPS.length} marketplace apps`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
