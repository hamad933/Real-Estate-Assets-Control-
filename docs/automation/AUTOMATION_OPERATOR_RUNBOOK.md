# RP04 Automation Gateway — Operator Runbook

1. Reconstruct RP04 Drive authority and exact GitHub main SHA.
2. Keep mutation disabled unless the current authority event explicitly covers the logical task and write domain.
3. Ensure `JULES_API_KEY` is provisioned as a repository secret and Jules GitHub App access covers this repository.
4. Run `RP04 Automation Shadow Inspect` first with `list_sources`; verify the RP04 source resolves without mutation.
5. Inspect only. Review the uploaded JSON evidence.
6. Mutation remains disabled until the Controller has verified the mutation/reconciliation canary gate. If enabled later, use a unique request ID, exact authority reference, exact SHA/session preconditions, and one write domain.
7. Any lost/ambiguous mutation response is UNKNOWN; do not rerun. Use reconciliation.
8. Disable mutations by clearing or setting `RP04_AUTOMATION_MUTATION_ENABLED` to a value other than `true`.
