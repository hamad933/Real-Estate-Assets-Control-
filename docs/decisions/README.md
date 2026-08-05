# Architecture Decision Records

This directory is the canonical repository location for accepted technical Architecture Decision Records (ADRs).

## When an ADR is required

Create an ADR for a material technical decision that has lasting consequences, meaningful alternatives, or cross-workstream impact, including:

- architecture or module boundaries;
- persistence and data ownership;
- authorization and tenant isolation;
- contract, financial, audit, evidence, or document integrity;
- concurrency, migration, recovery, retention, or export;
- provider or integration selection;
- security controls;
- stable interface or event contracts;
- major testing or deployment architecture.

Do not use an ADR to record owner product approval, current lifecycle gates, acceptance verdicts, or canonical project-control state; those belong in Google Drive.

## Status model

Use one status:

- `PROPOSED`
- `ACCEPTED`
- `REJECTED`
- `SUPERSEDED`

An ADR is not `ACCEPTED` merely because it is committed. Acceptance requires the authority and review defined by the Workstream Contract.

## File naming

Use:

```text
NNNN-short-kebab-case-title.md
```

Example:

```text
0001-contract-version-lineage.md
```

## Minimum ADR structure

```text
# ADR NNNN — Title

Status:
Date:
Decision authority:
Workstream / PR:

## Context
## Decision
## Alternatives considered
## Consequences
## Security, privacy, data, legal, and operational impact
## Validation and evidence
## Supersedes / Superseded by
```

## Rules

- Use direct evidence and explicit assumptions.
- Keep legal-sensitive conclusions `PENDING_SPECIALIST_LOCAL_REVIEW` unless accepted specialist evidence exists.
- Do not include secrets or sensitive real data.
- Link stable architecture contracts affected by the decision.
- Supersede rather than silently rewrite accepted historical decisions.
- Do not create speculative ADRs before a real authorized decision exists.

## Current state

No technical ADR has been accepted for RP04. This file establishes the location and process only.
