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

## 2. Authority, fact ownership, and precedence

Use one authority for each fact category:

1. **Canonical RP04 Google Drive control state** owns current governed state, Owner-approved decisions, gates, accepted control events, accepted releases, recovery, continuity, and any explicit delegation or grant of merge authority.
2. **Project Sources** own static portfolio policy and stable RP04 product/domain truth only. They do not own live repository state, current gates, current decisions, implementation status, or acceptance.
3. **This `AGENTS.md` and the repository-native documents it references** own stable repository execution, safety, evidence, architecture, ADR, branch, and review rules.
4. **The bounded Workstream Contract** owns task-specific scope, exact baseline, approved bounded overrides, required validation/evidence, handoff, and Stop Gate.
5. **The pull request description and discussion** own implementation-specific clarification and direct technical evidence for that PR.

Within the same fact category, a lower-precedence source must not silently override a higher-precedence source. Sources from different fact categories must not be treated as competing authorities. Stop and escalate any conflict, category ambiguity, or stale source.

A Workstream Contract may apply a bounded override to repository defaults in item 3 only when it explicitly identifies the overridden rule, approving authority, reason, scope, and Stop Gate or expiry. It must not override an Owner-approved Drive decision or gate, invent authority, change static product/domain truth, or weaken a legal, privacy, security, destructive-operation, evidence, review-independence, merge, release, or deployment prohibition without the required higher authority.

## 3. Mandatory reading order

Before changing the repository, read only:

1. `AGENTS.md`
2. `CONTRIBUTING.md`
3. `docs/EXECUTION_AND_SAFETY.md`
4. `docs/EVIDENCE_AND_HANDOFF.md`
5. `docs/architecture/README.md`
6. `docs/decisions/README.md`
7. The exact Workstream Contract and approved direct references supplied by the Controller

Read a Project Source only when the Workstream Contract identifies the exact source and the stable product/domain fact it is needed to verify. Stop reading after the listed materials unless the Workstream Contract explicitly requires additional repository paths or direct authoritative sources.

## 4. Role separation and review independence

- The Owner or a named authority approves product decisions, gates, bounded execution authority, and any merge authority or delegation recorded in the canonical Drive control state.
- The Central Controller defines the workstream, verifies repository-governance sufficiency, coordinates evidence, performs primary review, and may recommend a merge decision. The Controller does not gain merge authority merely by issuing a technical verdict.
- The Executor implements only the authorized scope and produces evidence.
- The Executor must not self-approve, merge, release, deploy, update canonical Drive state, or expand scope.
- A person who materially authors, edits, or pushes a change must not be the sole reviewer or final acceptance authority for that change, regardless of the role label used.
- Independent review is mandatory before merge when a change modifies the authority model, `AGENTS.md`, `CONTRIBUTING.md`, branch/PR policy, execution or safety prohibitions, evidence/handoff policy, review independence, reusable repository governance, or when the Controller materially contributed to the branch.
- The Independent Reviewer reviews a frozen base/head and direct evidence only. The reviewer must not edit the branch, change the PR, update canonical Drive state, grant themselves merge authority, merge, release, deploy, or begin product implementation.
- An independent verdict must record reviewer identity, exact reviewed head SHA, findings, missing evidence, verdict, and Stop Gate.
- A new commit invalidates verdicts or merge authority tied to an older head unless the applicable authority explicitly records otherwise after reviewing the new head.
- Unresolved disagreement between primary and independent review is a blocking gate. It requires revision or an explicit Owner/named-authority resolution recorded in Drive; it must not be resolved by silent role switching.

## 5. Review verdict, acceptance, and merge authority

These are separate events:

1. **Review verdict** — technical assessment such as `PASS`, `PASS_WITH_NOTES`, `REVISION_REQUIRED`, or `BLOCKED`.
2. **Acceptance** — a governed decision that the reviewed change may proceed to the next gate.
3. **Merge authority** — permission to merge one exact reviewed head SHA.

Merge authority may be granted only by the Owner or an explicitly delegated named authority recorded in the canonical RP04 Drive control state. The record must identify:

- grantor;
- decision or control-event reference;
- date;
- repository and PR;
- exact authorized head SHA;
- conditions or expiry, when applicable.

The Central Controller may coordinate or execute the merge only after verifying acceptable required reviews, the exact authorized head, the absence of unresolved blockers, and the explicit merge-authority record.

## 6. Default execution constraints

Unless the Workstream Contract explicitly authorizes otherwise:

- no application code;
- no database schema or migration;
- no UI implementation or prototype;
- no deployment, release, infrastructure, or provider integration;
- no production, client, tenant, financial, identity, contract, or legal data;
- no jurisdiction-specific legal conclusion;
- no destructive operation;
- no direct write to the governed baseline branch outside an explicitly authorized initialization or recovery action;
- no merge or release action.

Treat `main` as policy-protected. Repository text does not prove that GitHub branch-protection settings are configured; platform enforcement must be verified directly when it is required.

Use synthetic data only when examples or fixtures are authorized.

## 7. Domain and security invariants

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

## 8. Change discipline

- Work on the exact authorized branch.
- Keep changes minimal and repository-relevant.
- Do not create ceremonial, duplicate, or competing governance files.
- Put stable repository rules in GitHub, task-specific instructions in the Workstream Contract, current accepted control state in Google Drive, and temporary evidence in GitHub/CI.
- Record architecture decisions through `docs/decisions/` only when the decision is within the authorized scope.
- Update durable documentation in the same PR when behavior or a stable contract changes.

## 9. Validation and evidence

Every PR must provide:

- exact workstream ID and baseline;
- changed paths and scope mapping;
- validation performed and results;
- evidence references;
- limitations, deviations, and unexpected findings;
- reviewer entry point;
- required primary and independent-review identities, reviewed head SHAs, verdicts, and unresolved disagreements;
- acceptance and merge-authority references when present;
- explicit stop state.

Follow `docs/EVIDENCE_AND_HANDOFF.md`. Missing required evidence yields `BLOCKED_MISSING_EVIDENCE`.

## 10. Stop conditions

Stop without expanding scope when:

- authority or baseline is unresolved;
- instructions conflict;
- a requested change crosses an out-of-scope boundary;
- secrets or sensitive real data are encountered;
- required reviewer independence is absent;
- reviews disagree and the disagreement is unresolved;
- merge authority is absent, stale, or tied to another head;
- a legal, privacy, financial, destructive, migration, release, or deployment decision lacks authority;
- required validation cannot be completed;
- the Workstream Stop Gate is reached.

Report the exact blocker and preserve the branch/PR for Controller review.
