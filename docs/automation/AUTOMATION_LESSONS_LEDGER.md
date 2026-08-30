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
MECHANISM: API-key auth, Sources/Sessions/Activities, explicit plan approval, repo setup/snapshots.
RISK: API is alpha/experimental; provider contracts and quotas are volatile.
RECOMMENDED_ADOPTION: adapter boundary, source discovery, explicit plan approval, no hard-coded quota assumptions.

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
