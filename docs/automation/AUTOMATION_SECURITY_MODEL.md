# RP04 Automation Gateway — Security Model

Threats include Jules API-key leakage, token misuse, forged Controller identity, replayed request IDs, stale SHA/session races, false-positive postcondition claims, duplicate provider effects, path-scope escape, malicious repository/issue content, artifact tampering, unsafe shell interpolation, excessive workflow permissions, and confused-deputy behavior.

Controls: `JULES_API_KEY` only from GitHub Secrets; no secret in envelopes or artifacts; read-only workflow permissions; owner + governed-default-ref gates; strict JSON allowlists and unknown-key rejection; exact schema version; SHA/ID validation; no arbitrary shell command field; plan approval cannot be disabled for API-created sessions; mutation kill switch defaults OFF; one provider write attempt; safe evidence redaction; no `pull_request_target`; no secret-bearing fork execution; no generic issue-command bridge.

Postcondition safety is action-specific. A generic session snapshot is not accepted as mutation proof. Create-session must correlate the retrieved session; send-message must correlate a `userMessaged` Activity; approve-plan must observe the exact `planApproved.planId`. Missing proof after a write attempt becomes reconciliation-required rather than PASS.

Unknown-outcome reconciliation is read-only and fail-closed. Matching effects resolve APPLIED; duplicate matches raise an explicit duplicate-effect stop gate; absence remains UNKNOWN and cannot authorize retry. `NOT_APPLIED` is intentionally not inferred from absence because the provider's consistency guarantee is not treated as stronger than its documented API contract.

Replay defense combines bounded artifact markers with a Provider-side effect-existence precheck immediately before mutation. This prevents artifact expiry alone from authorizing a duplicate effect while the authoritative Provider effect remains observable.

Residual risks: GitHub variables are not an authority database; branch protection is not presently platform-enforced; GitHub concurrency is not a durable authority ledger; Provider-observable history is bounded by API availability/pagination and is not a permanent authority store; live canary evidence and trusted publication are not yet accepted. These block production mutation readiness.
