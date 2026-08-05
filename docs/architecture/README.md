# RP04 Architecture Contracts

This directory is the canonical repository location for stable RP04 technical architecture contracts after they are authorized and accepted.

## Purpose

Architecture contracts describe durable technical boundaries that multiple workstreams must follow, such as:

- system and module boundaries;
- domain ownership and entity separation;
- authorization and tenant-isolation boundaries;
- data classification and sensitive-document handling;
- integration boundaries;
- persistence, audit, concurrency, migration, recovery, retention, and export contracts;
- stable interface or event contracts;
- test and verification architecture.

## Current state

No product architecture has been authorized or accepted yet. This directory currently establishes location and governance only.

Do not infer a framework, programming language, database, cloud provider, deployment model, payment provider, accounting provider, government integration, or legal policy from the repository name or static product domain.

## Rules

- Add or change an architecture contract only through an authorized workstream and pull request.
- Link the governing ADR when a material decision selects among alternatives.
- Separate approved contracts from proposals and experiments.
- Do not duplicate current project-control decisions from Google Drive.
- Keep task-specific design notes in the workstream or PR until they become accepted stable repository truth.
- Record jurisdiction-sensitive legal assumptions as unresolved and `PENDING_SPECIALIST_LOCAL_REVIEW`.

## Suggested future structure

Create subdirectories only when real authorized content requires them, for example:

```text
docs/architecture/
├── domain/
├── security/
├── data/
├── integrations/
├── operations/
└── testing/
```

Do not create empty ceremonial directories.
