# RP04 Automation Gateway — Architecture

Status: FOUNDATION CANDIDATE. This is project-local infrastructure; UES and CEP are reference systems only.

Flow: governed RP04 authority → strict request envelope → read or mutation gate → Jules adapter → machine-readable evidence → Controller review → optional trusted publication → governed Control Event.

Invariants: capability is not authority; request identity and effect/write-domain identity are separate; exact replay must be idempotent; conflicting effects serialize while independent domains may run in parallel; every mutation emits WRITE_INTENT before the provider call; a lost response becomes UNKNOWN_PRIOR_WRITE_OUTCOME and requires reconciliation; no blind retry; mutation defaults OFF; push/publication/acceptance/merge/release/deploy remain distinct.

Stage 1 implements strict schemas, identities, redaction, evidence, a read-only shadow workflow, a disabled mutation gate, and tests. Trusted publication and live reconciliation proof are later gated stages. Cross-run request-ID collision detection is implemented in the candidate but remains unaccepted until remote CI/canary evidence; no production-readiness claim is made from local tests.

## Concurrency and durable mutation sequence
The router derives `request_key` from stable request identity. A reusable worker then derives its conflict lock from `effect_key`, whose identity is the repository plus `write_domain`; it deliberately excludes `logical_task_id` so distinct tasks cannot write the same domain concurrently.

Mutation sequence is fail-closed: transport gate → normalize → request lock → effect lock → bounded cross-run idempotency inventory → authoritative pre-read → durable `WRITE_INTENT` artifact → final authoritative pre-read → exactly one Provider write → post-write readback → terminal marker. A lost Provider response is classified `UNKNOWN_PRIOR_WRITE_OUTCOME`; the mutation path never retries it.
