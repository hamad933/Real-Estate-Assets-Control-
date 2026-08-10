# Execution and Safety Rules

## Purpose

This document defines stable repository safety boundaries. It does not authorize a workstream. Authorization comes from the current owner-approved control state and the exact Workstream Contract.

## Required operating behavior

- Verify the repository, baseline, branch, scope, and Stop Gate before editing.
- Use the minimum required context and files.
- Treat all real property, tenant, applicant, vendor, staff, contract, payment, maintenance, identity, and legal information as sensitive.
- Use synthetic examples and fixtures unless a higher authority explicitly approves controlled data handling.
- Keep secrets out of source, commits, PR descriptions, logs, screenshots, fixtures, and artifacts.
- Redact sensitive identifiers and values in all evidence.
- Preserve traceability between the change, commit, validation, and evidence.

## Prohibited by default

Without explicit bounded authorization, do not:

- create or modify application code, database schemas, migrations, infrastructure, deployment, releases, prototypes, or product features;
- connect to production or client environments;
- access, copy, export, transform, or publish real personal, financial, contract, payment, maintenance, or identity data;
- add credentials, tokens, private keys, connection strings, secrets, or provider configuration;
- execute destructive data or repository operations;
- force-push reviewed history, bypass branch/PR controls, self-approve, merge, tag, release, or deploy;
- introduce a third-party provider, hosted service, payment provider, accounting provider, government integration, or telemetry service;
- state or encode jurisdiction-specific legal requirements as approved policy;
- copy legal text, access models, data models, integrations, or visual identity from another project without an approved mapping and review;
- weaken tenant isolation, object authorization, audit history, evidence integrity, or approval separation.

## RP04-sensitive boundaries

Later authorized implementation must treat these as high-risk areas:

- contract versions and legal notice lineage;
- payment proof, verification, allocation, settlement, reversal, and arrears;
- deposit, exit inspection, deductions, and dispute evidence;
- maintenance triage, assignment, cost approval, execution verification, and closure;
- owner, manager, tenant, vendor, and admin authorization;
- cross-property and cross-tenant isolation;
- secure document storage, retention, export, and deletion;
- timezone and effective-date correctness;
- concurrency, migration, backup, recovery, and rollback.

Any legal-sensitive conclusion remains `PENDING_SPECIALIST_LOCAL_REVIEW` until supported by accepted specialist evidence.

## Secrets and sensitive-data response

When a secret or sensitive real record is encountered:

1. stop the affected operation;
2. do not copy the value into chat, issues, PRs, or evidence;
3. preserve only the minimum non-sensitive diagnostic context;
4. report the affected path or system without reproducing the secret;
5. request the appropriate owner/security response;
6. rotate or remediate only with explicit authority.

## Destructive and irreversible operations

A destructive action requires all of the following:

- explicit authority;
- exact target and impact analysis;
- backup or recovery plan;
- bounded validation and rollback conditions;
- independent review when required;
- recorded Stop Gate.

Absence of any item is a blocker.

## Stop conditions

Stop and report `BLOCKED` when authority, privacy, legal status, data safety, repository baseline, required evidence, or rollback capability is unresolved.
