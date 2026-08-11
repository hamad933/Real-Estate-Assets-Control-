# ADR 0002 — Local SQLite persistence foundation

Status: `PROPOSED`  
Date: 2026-08-11  
Decision authority: `NOT YET — Owner / Controller review required`  
Workstream / PR: `RP04-IMP-W06 / feature/rp04-imp-w06-persistence-foundation`

## Context

The accepted RP04 application has reached the point where a bounded subset of property, tenancy, operational, contractor, portfolio, and inquiry records must survive normal application requests instead of existing only as TypeScript fixtures or browser-local state.

W06 explicitly authorizes a minimum local persistence foundation while deferring production database/provider selection, production authentication, deployment infrastructure, and a separate backend architecture.

## Decision

Use a repository-local SQLite database as the bounded local persistence foundation for W06.

Use direct SQL migrations and deterministic synthetic SQL seed data. Use Node.js 22 built-in `node:sqlite` as the SQLite driver surface, so W06 adds no persistence package dependency and no ORM.

Keep a small server-only data-access boundary in `lib/data/` with explicit functions for the records currently needed by RP04. Do not introduce generic repository/service/use-case layers for every table.

Use `RP04_DB_PATH` to override the database path. The safe local default is `.runtime/rp04.sqlite`, and `.runtime/` is ignored by Git.

The database stores synthetic domain records only. Production database/provider selection is deliberately deferred and is not implied by this ADR.

## Alternatives considered

- `better-sqlite3`: authorized by the W06 contract if a driver dependency is required, but not required because the existing Node.js 22 runtime exposes `node:sqlite`.
- ORM such as Prisma, Drizzle ORM, TypeORM, Sequelize, or MikroORM: rejected because W06 requires direct SQL and the current schema is small enough that an ORM would add unnecessary architecture and dependencies.
- Separate API/backend service: rejected because the accepted Next.js application can perform the bounded server-side data access directly.
- PostgreSQL, MySQL, MongoDB, Supabase, Firebase, or another hosted provider: deferred because W06 is explicitly a local persistence foundation and not a production provider-selection workstream.

## Consequences

- Core accepted RP04 domain records can persist across requests and reloads in local development and CI.
- Migration, deterministic seed, reset, and verification behavior is repository-native and does not need a separate framework.
- The application remains a single Next.js application with the existing session and authorization model.
- SQLite is not declared production-ready or final for RP04.
- UI-only transient state such as public filters and shortlists remains outside the database unless a later authorized requirement needs persistence.

## Security, privacy, data, legal, and operational impact

- Synthetic records only; no real tenant, contractor, identity, payment, financial, contract, vendor, phone, email, or secret data may be stored.
- S07 stores only local inquiry coordination context. Raw name, phone, email, and free-form notes entered in the browser are not passed to the persistence action; fixed synthetic placeholders are stored instead.
- Tenant, Contractor, and Operations database reads remain subject to the existing resource-scope policy and are additionally constrained by the profile ownership represented in the database.
- Contractor status mutation remains subject to the existing `UPDATE_STATUS` action policy and cannot approve final completion or cost.
- Production authentication, provider security, backup/retention policy, deployment durability, and jurisdiction-specific legal policy remain deferred.

## Validation and evidence

Validation for the exact W06 head must prove clean initialization, migration ordering, deterministic seed, reset, foreign-key integrity, database-backed reads, persistence across a new request/reload, a bounded protected write, resource-scope denial, full W01–W05 regression, and dependency review.

Evidence is reference-only at the W06 PR and GitHub Actions unless promoted by the Central Controller.

## Supersedes / Superseded by

Supersedes: none.  
Superseded by: `NOT YET`.
