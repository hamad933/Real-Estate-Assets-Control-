# RP04 Automation Gateway — Lessons Ledger

## CEP Gateway v2.3
SOURCE_REF: `hamad933/Cybersecurity-Education-Platform@4d6b61d6b59635c50af976d4ea4a3b9969914bd2`.
PROBLEM_SOLVED: safe Jules inspection/mutation/publication.
MECHANISM: owner/default-ref gates, separate inspection/mutation worker, request vs effect concurrency, durable intent/terminal artifacts, reconciliation, public-safe envelopes, secret isolation.
PORTABLE: invariants and mechanism classes.
PROJECT_SPECIFIC: CEP controllers/lanes/source names/workflow names are rejected for RP04.
RECOMMENDED_ADOPTION: strict schemas, separate read/write paths, no blind retry, effect serialization, evidence-first publication.

## UES
SOURCE_REF: `hamad933/universal-execution-system@2c20f9d36b685dbb3a5f3ba2860f2108074960e4`.
PROBLEM_SOLVED: recurring portfolio orchestration and recovery.
MECHANISM: authoritative reconstruction, bounded parallelism, durable receipts, provider observation/fallback, completed-result consumption, lane-local failure isolation.
PORTABLE: `BLOCKED LANE != BLOCKED PROJECT`, consume completed results, bounded shared-provider budgets.
PROJECT_SPECIFIC: portfolio routing/adapters/state store remain external references and are not RP04 runtime dependencies.

## Jules official API
SOURCE_REF: Jules API/docs checked 2026-08-30.
MECHANISM: API-key auth, Sources/Sessions/Activities, explicit plan approval, repo setup/snapshots and ChangeSet patch artifacts.
RISK: API is alpha/experimental; provider contracts and quotas are volatile.
RECOMMENDED_ADOPTION: adapter boundary, source discovery, explicit plan approval, no hard-coded quota assumptions, effect-specific readback from immutable Activities.

## RP04 live control-cycle lesson — external write errors still require readback
SOURCE_SYSTEM: GitHub Pull Request metadata API.
SOURCE_REF: RP04 PR #16 update attempt on 2026-08-30; response `422`, followed by direct PR readback.
PROBLEM_SOLVED: preventing an erroneous retry after a mixed/partial external write outcome.
FAILURE_MODE: an update request containing a valid title/body plus an invalid same-repo `maintainer_can_modify` option returned HTTP 422, while direct post-state readback showed that title/body had in fact changed.
MECHANISM: never classify an external mutation as NOT_APPLIED from transport/status text alone; inspect authoritative post-state before retry.
WHY_IT_WORKS: the post-state, not the client response prose, owns whether the requested effect occurred.
PORTABLE_TO_THIS_PROJECT: yes; applies to GitHub metadata writes and reinforces the no-blind-retry invariant.
PROJECT_SPECIFIC_PARTS: PR #16 and the rejected option are RP04-specific evidence only.
SECURITY_IMPLICATION: prevents duplicate or conflicting writes caused by assuming an error response means zero effect.
RECOMMENDED_ADOPTION: mandatory postcondition readback after all externally mutating operations, including apparent 4xx failures when partial application is possible.
REJECTED_ALTERNATIVES: automatic retry based only on HTTP status.

## RP04 supply-chain lesson — external GitHub Actions must use reviewed immutable refs
SOURCE_SYSTEM: GitHub Actions official action releases and RP04 CI runtime logs.
SOURCE_REF: `actions/checkout` v7.0.1 commit `3d3c42e5aac5ba805825da76410c181273ba90b1`; `actions/setup-python` v7.0.0 commit `5fda3b95a4ea91299a34e894583c3862153e4b97`; `actions/upload-artifact` v7.0.1 commit `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`, verified 2026-08-30.
PROBLEM_SOLVED: mutable Action tags and obsolete embedded Node runtime targets create avoidable supply-chain/runtime drift.
FAILURE_MODE: the prior candidate used `checkout@v4`, `setup-python@v5`, and `upload-artifact@v4`; CI succeeded but emitted Node-runtime deprecation warnings for the first two, while all three references remained mutable tags.
MECHANISM: verify current upstream releases directly, pin each external Action to the exact reviewed 40-hex release commit, preserve a human-readable version comment, and enforce pins with tests.
WHY_IT_WORKS: workflow execution becomes tied to reviewed immutable source identities rather than mutable tags.
PORTABLE_TO_THIS_PROJECT: yes, and generally reusable for governed GitHub Actions control planes.
SECURITY_IMPLICATION: reduces tag-move/dependency-drift risk and makes workflow provenance auditable.
RECOMMENDED_ADOPTION: full-SHA pinning plus periodic explicit reviewed upgrades; never auto-follow a moving major tag in high-trust automation.
REJECTED_ALTERNATIVES: leaving moving tags because CI currently passes; pinning obsolete action majors indefinitely.
