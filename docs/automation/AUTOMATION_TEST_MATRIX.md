# RP04 Automation Gateway — Test Matrix

Foundation automated tests cover: valid read request; unknown-field rejection; wrong repository/controller rejection; malformed SHA; mutation without authority; reconciliation without target identity; deterministic identity; changed intent divergence; redaction; mutation default-off/explicit-on; canonical digest; same-domain effect locking; independent-domain distinction; cross-run request-ID collision behavior; exact create-session SHA; reviewed-plan identity; workflow sequencing; non-destructive setup contract.

Required later canary evidence: live read source/session/activity; exact duplicate cross-run idempotency; concurrent duplicate request; same-effect serialization; independent-domain parallelism; stale SHA/session/update-time; unknown provider-write outcome reconciliation; plan identity; secret-redaction artifact inspection; publication patch/path/tree readback; kill-switch recovery; clean Jules setup.

A test is PASS only from exact executable evidence. Not-yet-executed rows remain NOT_RUN, never inferred from design.

## Foundation hardening additions
- Same write domain across different logical tasks derives the same effect lock.
- Independent write domains derive different effect locks.
- Changed intent under the same request ID fails closed.
- Existing unresolved request intent requires reconciliation rather than replay.
- Create-session stale remote SHA fails before Provider mutation.
- Existing-session mutation requires exact state and update time.
- Plan approval requires exact reviewed plan digest and activity identity.
- Workflow contract asserts durable intent publication precedes the Provider-write step.
