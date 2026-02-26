# Demo User Credentials

Use these credentials to test ElasticOS authentication and role-based features.

| Role       | Email                         | Password  |
| ---------- | ----------------------------- | --------- |
| Worker     | `worker@demo.elasticos.com`   | `Demo123!` |
| Employer   | `employer@demo.elasticos.com` | `Demo123!` |
| Government | `government@demo.elasticos.com` | `Demo123!` |
| Admin      | `admin@demo.elasticos.com`    | `Demo123!` |

## Setup

1. Ensure the database is migrated: `npm run db:migrate`
2. Run the seed to create demo users: `npm run db:seed` (from repo root)

## Login

1. Go to `/login`
2. Enter any email and password from the table above

## Testing by Role

- **Worker** – Access worker dashboard, profile, marketplace applications
- **Employer** – Access employer dashboard, roster, job roles, ledger
- **Government** – Access government/audit views
- **Admin** – Platform administration (role cannot self-register)
