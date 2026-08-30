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
