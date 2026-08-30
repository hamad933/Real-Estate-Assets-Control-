# RP04 Automation Gateway — Status

Stage: `1 — FOUNDATION CANDIDATE`.

Implemented in the candidate:
- project-local Python standard-library gateway core;
- strict action-aware envelope validation with unknown-key rejection;
- stable request identity, intent identity, and write-domain effect identity;
- deterministic request-level and effect/write-domain concurrency groups;
- cross-run request-ID collision detection through bounded GitHub Actions artifact inventory;
- machine-readable evidence and secret redaction;
- read-only Jules adapter with bounded retries for reads only;
- exact GitHub branch-SHA precondition for session creation;
- exact Jules session state/update-time preconditions for existing-session mutation;
- exact reviewed-plan digest/activity preconditions for plan approval;
- durable `WRITE_INTENT` artifact before the Provider write step;
- exactly one Provider mutation attempt per execution;
- `UNKNOWN_PRIOR_WRITE_OUTCOME` terminal marker instead of blind retry;
- final pre-read immediately before mutation plus post-write readback capture;
- separate reconciliation entry path;
- separate shadow-read workflow;
- mutation workflow guarded by Owner/default-ref transport gates and a default-off kill switch;
- deterministic non-destructive Jules setup script;
- automated foundation tests and first-class architecture/security/operator/Jules/Drive/recovery/test/lessons documentation.

Not yet accepted or claimed:
- live Jules shadow-read canary;
- mutation canary;
- authoritative `APPLIED` / `NOT_APPLIED` reconciliation for every unknown Provider outcome;
- trusted publication implementation/canary;
- direct Drive credential integration;
- production activation;
- hourly Central-Controller automation.

Safety rule: `RP04_AUTOMATION_MUTATION_ENABLED` must remain unset/false until the Controller has accepted the foundation and reconciliation safety gate. Reconciliation remains read-only.

Stage-1 Stop Gate: frozen remote candidate plus exact CI evidence. Live Provider stages require the accepted gateway on the governed default branch, an accessible `JULES_API_KEY`, current Jules repository authorization, and separate direct canary evidence.
