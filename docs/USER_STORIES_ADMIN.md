# User Stories: Admin

**Test account:** `admin@demo.elasticos.com` / `Demo123!`

> **Note:** Admin accounts cannot self-register. They are created by seed script or by other admins.

---

## Authentication & Access

- **US-A01** — As an Admin, I want to log in with my email and password so that I can access the Admin Dashboard.
- **US-A02** — As an Admin, I want to sign out so that my session is securely ended.
- **US-A03** — As an Admin, I want to see my role (Admin) and an Admin Dashboard link on my dashboard so that I can access platform administration.
- **US-A04** — As an Admin, I want to be redirected to the dashboard if I am not an admin when accessing `/admin` so that non-admins cannot access admin features.

---

## Overview & Navigation

- **US-A05** — As an Admin, I want to view an overview dashboard with entity counts (Users, Workers, Employers, Departments, Job Roles, Affiliations, Apps, App Developer Applications) so that I can see platform activity at a glance.
- **US-A06** — As an Admin, I want to navigate between all admin sections via a sidebar so that I can manage any entity quickly.

---

## User Management

- **US-A07** — As an Admin, I want to create users (email, name, password, role) so that I can onboard new platform users.
- **US-A08** — As an Admin, I want to edit users (email, name, password, role) so that I can correct or update accounts.
- **US-A09** — As an Admin, I want to delete users so that I can remove accounts when needed.
- **US-A10** — As an Admin, I want to create users with any role (WORKER, EMPLOYER, GOVERNMENT, ADMIN) so that I can provision admin accounts and fix role assignments.

---

## Worker Management

- **US-A11** — As an Admin, I want to create Worker profiles by linking a user so that users can have worker capabilities.
- **US-A12** — As an Admin, I want to edit Worker profiles (MFA status, Govt ID verified) so that I can support verification workflows.
- **US-A13** — As an Admin, I want to delete Worker profiles so that I can remove invalid or duplicate profiles.

---

## Employer Management

- **US-A14** — As an Admin, I want to create Employer profiles by linking a user so that users can have employer capabilities.
- **US-A15** — As an Admin, I want to edit Employer profiles (Companies House number, legal entity verified) so that I can support verification workflows.
- **US-A16** — As an Admin, I want to delete Employer profiles so that I can remove invalid or duplicate profiles.

---

## Organisation Structure

- **US-A17** — As an Admin, I want to create, edit, and delete Departments so that I can manage organisation structures across employers.
- **US-A18** — As an Admin, I want to create, edit, and delete Job Roles so that I can manage role definitions across employers.

---

## Affiliation Records

- **US-A19** — As an Admin, I want to create affiliation records for any worker–employer pair so that I can fix or populate ledger data.
- **US-A20** — As an Admin, I want to delete affiliation records so that I can remove erroneous ledger entries.
- **US-A21** — As an Admin, I want to set engagement intensity and record type when creating affiliations so that I can configure engagement correctly.

---

## Apps & Marketplace

- **US-A22** — As an Admin, I want to create, edit, and delete Apps so that I can manage the App Marketplace catalogue.
- **US-A23** — As an Admin, I want to manage App Developer Applications (create, edit, delete, update status) so that I can process partner applications.

---

## Audit & Verification

- **US-A24** — As an Admin, I want to view Verification Logs so that I can audit identity and entity verification attempts.
- **US-A25** — As an Admin, I want Verification Logs to be read-only so that the audit trail cannot be tampered with.
