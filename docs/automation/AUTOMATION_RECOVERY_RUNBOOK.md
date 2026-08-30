# RP04 Automation Gateway — Recovery Runbook

Kill switch: mutation is disabled unless repository variable `RP04_AUTOMATION_MUTATION_ENABLED` equals exact string `true`.

Provider outage: keep read-only diagnostics bounded; do not convert provider failure into replacement-session authority. Stale SHA/session: fail closed and reconstruct authoritative state.

Lost or ambiguous response after WRITE_INTENT:
1. preserve the intent and UNKNOWN marker;
2. do not replay the mutation;
3. run the matching read-only reconciliation action using the original `target_request_id` and `target_intent_identity`;
4. accept `APPLIED` only from the action-specific provider effect proof;
5. treat duplicate matching effects as a stop gate requiring Controller review;
6. if no matching effect is visible, retain `UNKNOWN_PRIOR_WRITE_OUTCOME`; do not call it NOT_APPLIED and do not retry.

Malformed evidence: reject it and reacquire direct evidence. Suspected secret exposure: disable mutation, rotate/revoke the Jules key, inspect logs/artifacts for leakage, then re-enable only after review.

Automation failure must not mutate product truth, `main`, release state, or Drive current state implicitly.
