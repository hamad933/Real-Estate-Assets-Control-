# AGENTS.md — RP04 Repository Execution Governance

## 1. Repository identity

This repository is the GitHub technical authority for `RP04 — Real Estate & Assets`.

RP04 concerns long-term residential leasing and asset lifecycle management. Stable domain boundaries distinguish at least:

- `Property`
- `Unit`
- `Listing`
- `Application`
- `Contract`
- `Occupancy`
- `Payment`
- `Maintenance`
- `Renewal`
- `Exit`

Do not collapse these concepts merely to simplify implementation.

## 2. Authority and precedence

Use the following precedence:

1. Owner-approved decisions and current gates recorded in the canonical RP04 Google Drive control state.
2. This `AGENTS.md` for repository-stable execution rules.
3. `CONTRIBUTING.md` and the repository-native safety, evidence, architecture, and ADR documents referenced below.
4. The bounded Workstream Contract for task-specific scope, approved overrides, required tests, evidence, and Stop Gate.
5. The pull request description and discussion for implementation-specific clarification.

A lower-precedence source must not silently override a higher-precedence source. Stop and escalate conflicts.

## 3. Mandatory reading order

Before changing the repository, read only:

1. `AGENTS.md`
2. `CONTRIBUTING.md`
3. `docs/EXECUTION_AND_SAFETY.md`
4. `docs/EVIDENCE_AND_HANDOFF.md`
5. `docs/architecture/README.md`
6. `docs/decisions/README.md`
7. The exact Workstream Contract and approved direct references supplied by the Controller

Stop reading after the listed materials unless the Workstream Contract explicitly requires additional repository paths.

## 4. Role separation

- The Owner or named authority approves product decisions, gates, and bounded execution authority.
- The Central Controller defines the workstream, governs repository sufficiency, and performs primary review.
- The Executor implements only the authorized scope and produces evidence.
- The Executor must not self-approve, merge, release, deploy, update canonical Drive state, or expand scope.
- Independent review is additional assurance only when requested by the Controller.

## 5. Default execution constraints

Unless the Workstream Contract explicitly authorizes otherwise:

- no application code;
- no database schema or migration;
- no UI implementation or prototype;
- no deployment, release, infrastructure, or provider integration;
- no production, client, tenant, financial, identity, contract, or legal data;
- no jurisdiction-specific legal conclusion;
- no destructive operation;
- no direct write to the protected baseline branch;
- no merge or release action.

Use synthetic data only when examples or fixtures are authorized.

## 6. Domain and security invariants

When later implementation is authorized, preserve:

- entity and lifecycle separation;
- explicit authority for sensitive transitions;
- proof separated from verification, approval, and settlement;
- work execution separated from approval and closure;
- immutable or auditable lineage for contracts and sensitive financial decisions;
- property, unit, role, and tenant access boundaries;
- secure document handling and evidence integrity;
- timezone, date, retention, export, concurrency, migration, and recovery safety;
- `PENDING_SPECIALIST_LOCAL_REVIEW` for jurisdiction-sensitive legal policy until accepted specialist evidence exists.

## 7. Change discipline

- Work on the exact authorized branch.
- Keep changes minimal and repository-relevant.
- Do not create ceremonial, duplicate, or competing governance files.
- Put stable repository rules in GitHub, task-specific instructions in the Workstream Contract, current accepted control state in Google Drive, and temporary evidence in GitHub/CI.
- Record architecture decisions through `docs/decisions/` only when the decision is within the authorized scope.
- Update durable documentation in the same PR when behavior or a stable contract changes.

## 8. Validation and evidence

Every PR must provide:

- exact workstream ID and baseline;
- changed paths and scope mapping;
- validation performed and results;
- evidence references;
- limitations, deviations, and unexpected findings;
- reviewer entry point;
- explicit stop state.

Follow `docs/EVIDENCE_AND_HANDOFF.md`. Missing required evidence yields `BLOCKED_MISSING_EVIDENCE`.

## 9. Stop conditions

Stop without expanding scope when:

- authority or baseline is unresolved;
- instructions conflict;
- a requested change crosses an out-of-scope boundary;
- secrets or sensitive real data are encountered;
- a legal, privacy, financial, destructive, migration, release, or deployment decision lacks authority;
- required validation cannot be completed;
- the Workstream Stop Gate is reached.

Report the exact blocker and preserve the branch/PR for Controller review.
