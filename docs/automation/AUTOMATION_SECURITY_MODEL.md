# RP04 Automation Gateway — Security Model

Threats include Jules API-key leakage, token misuse, forged Controller identity, replayed request IDs, stale SHA/session races, false-positive postcondition claims, duplicate provider effects, path-scope escape, malicious repository/issue content, artifact tampering, unsafe shell interpolation, excessive workflow permissions, third-party Action supply-chain drift, and confused-deputy behavior.

Controls: `JULES_API_KEY` only from GitHub Secrets; no secret in envelopes or artifacts; read-only workflow permissions; owner + governed-default-ref gates; strict JSON allowlists and unknown-key rejection; exact schema version; SHA/ID validation; no arbitrary shell command field; plan approval cannot be disabled for API-created sessions; mutation kill switch defaults OFF; one provider write attempt; safe evidence redaction; no `pull_request_target`; no secret-bearing fork execution; no generic issue-command bridge.

All external `actions/*` dependencies in RP04 automation workflows are pinned to reviewed full 40-hex commit SHAs rather than mutable major tags. Current reviewed release commits are `actions/checkout` v7.0.1 at `3d3c42e5aac5ba805825da76410c181273ba90b1`, `actions/setup-python` v7.0.0 at `5fda3b95a4ea91299a34e894583c3862153e4b97`, and `actions/upload-artifact` v7.0.1 at `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`. Automated tests reject mutable or unreviewed external Action references.

Postcondition safety is action-specific. A generic session snapshot is not accepted as mutation proof. Create-session must correlate the retrieved session; send-message must correlate a `userMessaged` Activity; approve-plan must observe the exact `planApproved.planId`. Missing proof after a write attempt becomes reconciliation-required rather than PASS.

Unknown-outcome reconciliation is read-only and fail-closed. Matching effects resolve APPLIED; duplicate matches raise an explicit duplicate-effect stop gate; absence remains UNKNOWN and cannot authorize retry. `NOT_APPLIED` is intentionally not inferred from absence because the provider's consistency guarantee is not treated as stronger than its documented API contract.

Replay defense combines bounded artifact markers with a Provider-side effect-existence precheck immediately before mutation. This prevents artifact expiry alone from authorizing a duplicate effect while the authoritative Provider effect remains observable.

Residual risks: GitHub variables are not an authority database; branch protection is not presently platform-enforced; GitHub concurrency is not a durable authority ledger; Provider-observable history is bounded by API availability/pagination and is not a permanent authority store; live canary evidence and trusted publication are not yet accepted. These block production mutation readiness.

Publication threat controls: publication verification rejects binary patches, symlink/submodule mode changes, path traversal/unsafe paths, disallowed changed paths, stale or non-full base SHAs, patch-digest mismatch, moved remote base, and unexpected target-branch prestate. The verifier is read-only and performs local `git apply --check`; it has no GitHub contents-write permission.
