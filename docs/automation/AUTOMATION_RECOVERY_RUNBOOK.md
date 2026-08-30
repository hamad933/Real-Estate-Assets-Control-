# RP04 Automation Gateway — Recovery Runbook

Kill switch: mutation is disabled unless repository variable `RP04_AUTOMATION_MUTATION_ENABLED` equals exact string `true`.

Provider outage: keep read-only diagnostics bounded; do not convert provider failure into replacement session authority. Stale SHA/session: fail closed and reconstruct authoritative state. Lost response after WRITE_INTENT: classify UNKNOWN_PRIOR_WRITE_OUTCOME, preserve evidence, reconcile provider state; retry only after proof of NOT_APPLIED. Malformed artifact: reject it and reacquire direct evidence. Suspected secret exposure: disable mutation, rotate/revoke the Jules key, inspect logs/artifacts for leakage, then re-enable only after review.

Automation failure must not mutate product truth, `main`, release state, or Drive current state implicitly.
