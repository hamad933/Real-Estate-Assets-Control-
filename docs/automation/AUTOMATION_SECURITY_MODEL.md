# RP04 Automation Gateway — Security Model

Threats include Jules API-key leakage, token misuse, forged Controller identity, replayed request IDs, stale SHA/session races, path-scope escape, malicious repository/issue content, artifact tampering, unsafe shell interpolation, excessive workflow permissions, and confused-deputy behavior.

Controls: `JULES_API_KEY` only from GitHub Secrets; no secret in envelopes or artifacts; read-only workflow permissions; owner + governed-default-ref gates; strict JSON allowlists and unknown-key rejection; SHA/ID validation; no arbitrary shell command field; mutation kill switch defaults OFF; one provider write attempt; safe evidence redaction; no `pull_request_target`; no secret-bearing fork execution; no generic issue-command bridge.

Residual risks: GitHub variables are not an authority database; branch protection is not presently platform-enforced; GitHub concurrency provides active effect serialization but is not a substitute for a durable authority ledger; authoritative unknown-outcome reconciliation and trusted publication are not yet implemented/accepted. These block production mutation readiness.

## Foundation hardening invariants
- A request-ID collision with changed intent is rejected.
- An unresolved prior intent is not replayed; it is routed to reconciliation.
- Effect locking is write-domain scoped, not task scoped.
- Mutation requires exact remote/session/plan preconditions where applicable.
- Durable intent publication happens before the Provider-write step.
- Network ambiguity after a Provider write becomes `UNKNOWN_PRIOR_WRITE_OUTCOME` and never an automatic retry.
- The mutation kill switch is default-off and must remain off until reconciliation and canary gates are accepted.
