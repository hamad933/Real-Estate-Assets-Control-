# RP04 — Real Estate & Assets Control

Private repository for `RP04 — Real Estate & Assets`, a reference product for long-term residential leasing and asset lifecycle management.

## Authority boundaries

- **Google Drive** is the canonical source for current governed project-control state, approved decisions, gates, accepted evidence, accepted releases, recovery, and continuity.
- **GitHub** is the canonical source for repository-native governance, branches, commits, pull requests, checks, technical artifacts, and implementation history.
- **Project Sources** provide static portfolio policy and stable RP04 product/domain truth.
- **Chat history** is supporting context only and is not a canonical authority.

A repository file or pull request does not by itself approve a product decision, gate transition, implementation, merge, release, or deployment.

## Product boundary

RP04 preserves distinct lifecycle concepts including:

`Property` → `Unit` → `Listing` → `Application` → `Contract` → `Occupancy`

with related but separately governed `Payment`, `Maintenance`, `Renewal`, and `Exit` lifecycles.

Default non-goals include property sales, brokerage marketplaces, short-term rentals, public listing aggregation, assumed government integrations, BIM, full facility management, legal-advice automation, and provider-specific accounting or payment choices without an approved decision.

## Repository baseline

The repository was initialized through bounded governance workstream `RP04-GOV-INIT-001`. This baseline establishes repository-native execution governance only; it does not itself authorize product implementation.

The effective repository-governance version is the accepted commit on `main`, interpreted together with the current canonical RP04 Drive control state.

No item below may begin solely because this governance baseline exists; each requires separate bounded authority:

- application code;
- database schemas or migrations;
- UI implementation;
- prototypes;
- infrastructure, deployment, or releases;
- product feature work;
- jurisdiction-specific legal policy.

Proposed governance changes become effective only after the applicable review, acceptance, and merge authority are complete.

## Repository governance map

Read in this order before an authorized change:

1. [`AGENTS.md`](AGENTS.md)
2. [`CONTRIBUTING.md`](CONTRIBUTING.md)
3. [`docs/EXECUTION_AND_SAFETY.md`](docs/EXECUTION_AND_SAFETY.md)
4. [`docs/EVIDENCE_AND_HANDOFF.md`](docs/EVIDENCE_AND_HANDOFF.md)
5. [`docs/architecture/README.md`](docs/architecture/README.md)
6. [`docs/decisions/README.md`](docs/decisions/README.md)
7. The exact bounded Workstream Contract

## Branch and review model

- `main` is the governed baseline branch.
- Changes use a bounded workstream branch and pull request.
- Repository text does not prove that GitHub branch-protection settings are configured; verify platform enforcement directly when required.
- Executors do not self-approve, merge, release, deploy, or update canonical Drive state.
- Required evidence is referenced from the PR and authoritative artifact location.
- The Central Controller performs primary review and records accepted control events in Drive.

## Legal and sensitive-data caution

Use synthetic data unless explicit authority permits controlled data handling. Do not commit secrets or real tenant, applicant, contract, identity, payment, maintenance, or legal evidence. Jurisdiction-sensitive matters remain `PENDING_SPECIALIST_LOCAL_REVIEW` until accepted specialist evidence is available.
