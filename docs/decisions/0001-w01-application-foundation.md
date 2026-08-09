# ADR 0001 — W01 application foundation

Status: `PROPOSED`  
Date: 2026-08-10  
Decision authority: `NOT YET — Owner / Controller review required`  
Workstream / PR: `RP04-IMP-W01 / stacked implementation PR`

## Context

W01 requires one executable Arabic-first application foundation with representative Public, Operations, Tenant, Contractor, and Admin shells; explicit profile-and-scope authorization; a shared sign-in and simulated session model; deterministic synthetic fixtures; responsive behavior; and browser-flow evidence.

The Workstream Contract authorizes application/UI code and representative behavior while explicitly deferring production authentication, persistence, providers, deployment, and full S01–S13 functionality.

## Decision

Use one Next.js App Router application written in TypeScript.

Use React through Next.js, normal CSS with CSS custom properties, and no styling framework or global state library.

Use a small server-readable simulated-session cookie containing only a fixture identifier. The identifier resolves to a deterministic in-memory synthetic session fixture containing global access state, profile, and scope. The only user-visible demo credential is the Owner-approved `admin / admin`; TENANT, CONTRACTOR, and OPERATIONS sessions are programmatic test fixtures only.

Authorize access through explicit TypeScript policy functions for workspace, resource, and action checks. Server-rendered protected routes invoke reusable guards before rendering content.

Use Playwright as the only test framework for W01. GitHub Actions runs installation, lint, typecheck, production build, authorization flows, responsive flows, and screenshot evidence.

## Alternatives considered

- Separate frontend/backend applications: rejected because W01 has no independent backend requirement.
- External authentication provider: rejected because production authentication is explicitly out of scope.
- Database/ORM: rejected because persistence architecture is deferred.
- RBAC/ACL policy library: rejected because explicit TypeScript policy functions satisfy current requirements.
- Tailwind or component-framework layer: rejected because normal CSS is sufficient for the frozen RP04 visual language.
- Additional unit-test runner: rejected because current policy and route behavior can be proven directly through Playwright without adding overlapping test tooling.

## Consequences

- Later workstreams can reuse one route/session/policy foundation.
- Current sessions are deliberately non-production and must not be described as secure production authentication.
- Scope checks are inspectable and deterministic.
- Full persistence, production identity, audit lineage, integrations, and legal policy remain deferred.
- Any accepted future production-auth decision will supersede the simulated-session mechanism without requiring a second application architecture.

## Security, privacy, data, legal, and operational impact

- Synthetic data only.
- No real tenant, contractor, payment, contract, identity, or vendor data.
- No secrets or production credentials.
- Direct-object scope checks are represented for Tenant, Contractor, and Operations.
- Contractor final completion/cost self-approval is denied explicitly.
- Jurisdiction-sensitive legal policy remains out of scope and `PENDING_SPECIALIST_LOCAL_REVIEW`.

## Validation and evidence

Validation is performed through the PR workflow and Playwright evidence artifacts for the exact PR head.

## Supersedes / Superseded by

Supersedes: none.  
Superseded by: `NOT YET`.
