# Evidence and Execution Handoff

## 1. Purpose

Evidence must prove the exact authorized change, its validation, its authority boundaries, its reviewed identity, and its stop state. An Execution Handoff is a lightweight review index, not a duplicate archive.

## 2. Evidence ownership

- Repository: durable tests, scripts, fixtures, documentation, and accepted technical baselines.
- Pull request: scope, diff, commits, discussion, validation summary, review records, limitations, and direct links.
- GitHub Actions artifacts: temporary logs, reports, traces, screenshots, videos, and other execution evidence.
- Google Drive: accepted control events, acceptance, delegations, exact-head merge authority, and only intentionally preserved long-term evidence.

Do not copy material into multiple authorities when a stable direct reference is sufficient.

## 3. Minimum PR evidence

Every PR must identify:

- project and workstream ID;
- verified base commit or branch;
- head branch and current head commit;
- changed paths and scope mapping;
- validation commands or review methods and results;
- required evidence artifacts and direct references;
- security, privacy, domain, data-safety, migration, visual, or accessibility coverage when applicable;
- limitations, deviations, unresolved questions, and unexpected findings;
- reviewer entry point;
- required reviewer roles and identities;
- the exact head SHA reviewed by each reviewer;
- review verdicts and unresolved disagreement;
- acceptance and merge-authority references when present;
- Stop Gate and final execution stop state.

A new commit makes evidence or review tied only to an older head stale unless it remains directly applicable and the governing authority explicitly records that treatment.

## 4. Evidence quality rules

Evidence must:

- correspond to the same commit or run under review;
- be reproducible or directly inspectable;
- include negative and boundary paths when the Workstream Contract requires them;
- avoid secrets and redact personal, financial, contract, identity, tenant, and legal-sensitive information;
- distinguish a test result from an assumption, screenshot, narrative, or historical reference;
- distinguish technical verdict, acceptance, and merge authority;
- disclose skipped, unavailable, or failed validation honestly.

A screenshot or demonstration does not establish legal authority, data correctness, security, acceptance, or merge authority by itself.

## 5. RP04 implementation evidence profile

When later implementation is authorized, evidence should cover the applicable areas:

- distinct entity identifiers and valid/invalid lifecycle transitions;
- contract and decision lineage;
- payment proof separated from verification and settlement;
- partial payment, reversal, arrears, and approval boundaries;
- maintenance triage, assignment, cost approval, execution verification, rework, and closure;
- renewal, notice, exit, inspection, deposit, and policy version markers;
- owner, manager, tenant, vendor, and admin authorization;
- direct-object authorization and cross-tenant isolation;
- privacy, redaction, retention, export, and evidence access;
- error, empty, accessibility, RTL/LTR, console, page, and network behavior where applicable;
- concurrency, migration, backup, recovery, and rollback where applicable.

Jurisdiction-sensitive conclusions must remain `PENDING_SPECIALIST_LOCAL_REVIEW` until accepted specialist evidence is linked.

## 6. Execution Handoff format

Use this compact index:

```text
Project / Workstream:
Contract and verified baseline:
Repository / branch / current head commit / PR:
Changed paths and implemented scope:
Validation and results:
Evidence references:
Primary reviewer / reviewed head / verdict:
Independent reviewer / reviewed head / verdict:
Unresolved review disagreement:
Acceptance reference:
Merge-authority grantor / Drive reference / authorized head:
Security/privacy/domain coverage:
Data/migration/recovery coverage:
Limitations/deviations/unexpected findings:
Reviewer entry point:
Stop Gate:
Stop state:
```

Do not paste source files, complete logs, screenshots, builds, or reports already available at their authoritative location.

## 7. Preservation classification

Classify each evidence item separately:

| Evidence reference | Authoritative location | Classification | Promotion reason |
|---|---|---|---|
| Example | PR, commit, workflow run, artifact, or Drive record | `REFERENCE_ONLY`, `PROMOTE_TO_GOOGLE_DRIVE`, or `DO_NOT_PRESERVE` | Required only for promotion |

- `REFERENCE_ONLY` — default; retain at the authoritative technical location.
- `PROMOTE_TO_GOOGLE_DRIVE` — only when accepted, frozen, release-critical, recovery-critical, audit-relevant, or needed beyond normal retention.
- `DO_NOT_PRESERVE` — temporary or failed output with no future diagnostic or governance value.

A single PR-level classification may be used only when all evidence items have the same authoritative location and retention treatment.

## 8. Missing evidence

If required evidence is missing, stale, mismatched to the commit, or not directly inspectable, report `BLOCKED_MISSING_EVIDENCE`. Do not substitute confidence, role labels, or narrative for evidence.
