# Threat Model

## Project Overview

This repository contains a small project-management application with a React/Vite frontend (`artifacts/pm-app`), an Express 5 API server (`artifacts/api-server`), PostgreSQL accessed through Drizzle ORM (`lib/db`), and a generated OpenAPI client (`lib/api-client-react`). The production-facing surfaces are the browser app and the `/api` HTTP interface. Under current scan assumptions, `artifacts/mockup-sandbox` is development-only and should be ignored unless production reachability is demonstrated.

## Assets

- **Project workspace data** — project names, descriptions, statuses, due dates, progress metrics, and recent activity. Unauthorized access exposes business planning information and lets attackers tamper with operational data.
- **Task data** — titles, descriptions, assignees, priorities, due dates, and completion state. Unauthorized modification can disrupt operations and destroy integrity of the workspace.
- **Member directory data** — names, email addresses, roles, and avatar URLs stored in `members`. This is personal/contact information and enables targeted phishing if exposed.
- **Application secrets and infrastructure access** — `DATABASE_URL` and any future auth/session secrets held in environment variables. Compromise would expose or alter the entire database.

## Trust Boundaries

- **Browser to API** — all client requests to `/api/*` cross from an untrusted client into trusted server logic. Every non-public operation must be authenticated and authorized server-side.
- **API to PostgreSQL** — the API server has direct read/write access to all tables. Any broken access control or injection at the API layer translates into database compromise.
- **Public internet to deployment** — the API is network reachable in production. Because TLS is handled by the platform, transport encryption is assumed; application-layer access control remains the primary concern.
- **Production vs dev-only artifacts** — `artifacts/mockup-sandbox` is considered dev-only per scan assumptions and is out of scope unless separately exposed in production.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/pm-app/src/main.tsx`
- **Highest-risk production code:** `artifacts/api-server/src/routes/*.ts`, `lib/db/src/schema/*.ts`, `lib/api-spec/openapi.yaml`
- **Public vs authenticated vs admin surfaces:** the current API exposes health, members, projects, tasks, and dashboard routes; no authenticated or admin-only boundary is implemented today.
- **Usually dev-only:** `artifacts/mockup-sandbox/**`, Vite dev plugins, workflow log artifacts.

## Threat Categories

### Spoofing

This project currently has no authentication layer in front of the production API. The application must establish a trustworthy caller identity before allowing access to workspace data or mutation endpoints. Any future bearer-token or session-cookie mechanism must be enforced centrally before route handlers run.

### Tampering

Projects, tasks, members, and activity are created and updated through direct API writes into PostgreSQL. The server must ensure that only authorized users can create, edit, or delete these records. Client-side form validation is not a security boundary.

### Information Disclosure

The API returns member directory data, project/task details, dashboard aggregates, and activity history. These responses must be scoped to authorized users and workspaces; otherwise any internet user can enumerate internal business data and team contact information.

### Denial of Service

The API exposes unauthenticated read and write operations backed by the database. The service must ensure public endpoints cannot be abused for unbounded scraping, destructive bulk writes, or operational disruption.

### Elevation of Privilege

The most important guarantee for this codebase is server-side access control. Every route that reads or mutates project-management data must require a valid authenticated principal and must enforce per-resource authorization before touching the database. Without that guarantee, attackers can escalate from anonymous internet access to full control over all stored data.
