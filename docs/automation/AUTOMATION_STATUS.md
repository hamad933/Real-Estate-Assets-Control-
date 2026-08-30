# RP04 Automation Gateway — Status

Stage: `1 — FOUNDATION HARDENING CANDIDATE`.

Implemented in the candidate:
- project-local Python standard-library gateway core;
- strict action-aware envelope validation with unknown-key rejection and exact schema-version enforcement;
- boolean type enforcement for plan-approval policy and mandatory explicit plan approval for API-created sessions;
- stable request identity, intent identity, and write-domain effect identity;
- deterministic request-level and effect/write-domain concurrency groups;
- cross-run request-ID collision detection through bounded GitHub Actions artifact inventory;
- Provider-side effect-existence precheck before every mutation so artifact expiry alone cannot authorize replay;
- machine-readable evidence and secret redaction;
- read-only Jules adapter with bounded retries for reads only and complete bounded pagination;
- exact GitHub branch-SHA precondition for session creation;
- exact Jules session state/update-time preconditions for existing-session mutation;
- exact reviewed-plan ID/digest/activity preconditions for plan approval;
- durable WRITE_INTENT artifact before the Provider write step;
- exactly one Provider mutation attempt per execution;
- action-specific postcondition proof for session creation, user message, and plan approval;
- deterministic correlation identity for create-session and send-message reconciliation;
- read-only reconciliation that can prove APPLIED when the matching effect exists, detect duplicate matching effects, and otherwise preserves UNKNOWN_PRIOR_WRITE_OUTCOME;
- no conversion of negative readback into NOT_APPLIED;
- separate shadow-read workflow;
- mutation workflow guarded by Owner/default-ref transport gates and a default-off kill switch;
- deterministic non-destructive Jules setup script;
- automated foundation tests and first-class architecture/security/operator/Jules/Drive/recovery/test/lessons documentation.

Not yet accepted or claimed:
- independent acceptance of this exact automation candidate;
- live Jules shadow-read canary;
- mutation canary;
- live unknown-outcome reconciliation canary;
- permanent authority/idempotency ledger independent of both GitHub artifacts and Provider-observable history;
- trusted publication implementation/canary;
- direct Drive credential integration;
- production activation;
- hourly Central-Controller automation.

Safety rule: `RP04_AUTOMATION_MUTATION_ENABLED` must remain unset/false until the Controller has independent acceptance plus live reconciliation and mutation safety evidence. Reconciliation remains read-only.
