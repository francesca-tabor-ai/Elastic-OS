# ElasticOS

Transform employment from binary states into continuous, measurable engagement.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL (or use Docker)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env and set DATABASE_URL and NEXTAUTH_SECRET

# Start PostgreSQL (Docker)
docker-compose up -d postgres

# Run migrations
pnpm db:migrate

# Seed marketplace apps (optional)
pnpm db:seed

# Generate Prisma client
pnpm db:generate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Project Structure

```
elastic-os/
├── apps/
│   └── web/          # Next.js app (frontend + API routes)
├── packages/
│   ├── db/           # Prisma schema & client
│   ├── shared/       # Shared types & constants
│   └── auth/         # Auth helpers & RBAC
├── docs/
└── docker-compose.yml
```

## Phase 0 Features

- **App Marketplace**: Browse and install integrations and workflows at `/marketplace`—affiliation export, LinkedIn sync, Xero roster sync, engagement reports, Slack notifications, verification audit trail.
- **Identity**: Worker, Employer, Government account types; MFA; verification stubs (GOV.UK, Companies House)
- **Employment Affiliation Ledger**: Append-only worker–employer records with engagement intensity
- **Worker Profile**: Skills, certifications, portfolio
- **Employer Workforce Registry**: Departments, roles, CSV roster import

## License

Proprietary
