# RP04 Automation Gateway — Architecture

Status: FOUNDATION HARDENING CANDIDATE. This is project-local infrastructure; UES and CEP are reference systems only.

Flow: governed RP04 authority → strict request envelope → read or mutation gate → Jules adapter → machine-readable evidence → Controller review → optional trusted publication → governed Control Event.

Invariants: capability is not authority; request identity and effect/write-domain identity are separate; exact replay must be idempotent; conflicting effects serialize while independent domains may run in parallel; every mutation emits WRITE_INTENT before the provider call; a lost response becomes UNKNOWN_PRIOR_WRITE_OUTCOME and requires reconciliation; no blind retry; mutation defaults OFF; push/publication/acceptance/merge/release/deploy remain distinct.

## Concurrency and durable mutation sequence
The router derives `request_key` from stable request identity. The reusable worker derives its conflict lock from `effect_key`, whose identity is repository plus `write_domain`; it excludes `logical_task_id` so distinct tasks cannot write the same domain concurrently.

Mutation sequence is fail-closed: transport gate → normalize → request lock → effect lock → bounded cross-run idempotency inventory → authoritative pre-read → durable WRITE_INTENT artifact → final authoritative pre-read → exactly one Provider write → action-specific authoritative effect readback → terminal marker.

## Action-specific postcondition proof
- `create_session`: the session title carries a deterministic, public-safe correlation identity derived from request identity. Readback must retrieve the created session and match that correlation identity.
- `send_message`: the dispatched message carries the same deterministic correlation identity. Readback must find a matching `userMessaged.userMessage` Activity.
- `approve_plan`: readback must find a `planApproved.planId` Activity for the exact reviewed plan ID.

A successful HTTP response without action-specific effect proof does not become PASS. It is persisted as a reconciliation-required outcome.

## Unknown-outcome reconciliation
Reconciliation is read-only. From `target_request_id + target_intent_identity` the gateway can deterministically reconstruct the correlation identity for create-session and send-message effects. It resolves to `APPLIED` only when an authoritative matching effect exists, detects duplicate matching effects explicitly, and otherwise remains `UNKNOWN_PRIOR_WRITE_OUTCOME`. Absence is not promoted to `NOT_APPLIED`; therefore the gateway never authorizes a blind retry from a merely negative observation.

Idempotency uses two independent signals: bounded GitHub artifact markers for fast cross-run request collision detection, plus an authoritative Provider-side correlation precheck immediately before mutation. Expired artifacts therefore do not silently authorize replay when the Provider still exposes the prior effect. This is still not a permanent authority ledger; if Provider history cannot be observed completely, the bounded pagination layer fails closed. Trusted publication and live Provider canaries remain separately gated.

## Trusted publication dry-run foundation
A separate read-only publication verifier consumes the exact Jules ChangeSet artifact from an exact immutable Activity. It verifies session state/update time, Provider source, full base SHA, live starting-branch SHA, unidiff digest, normalized allowed-paths digest, safe changed paths, target-branch prestate, and local `git apply --check` against the exact reviewed base. No publication mutation exists in this stage. A later publication writer must repeat all preconditions immediately before one non-force external write and perform exact remote SHA/tree readback.
