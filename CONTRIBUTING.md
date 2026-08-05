# Contributing to RP04

## 1. Authorization first

Every change requires a bounded Workstream Contract or an explicitly approved maintenance action. The contract must identify:

- project and workstream ID;
- verified repository and baseline;
- exact scope and prohibited changes;
- branch and pull request policy;
- required validation and evidence;
- expected handoff;
- Stop Gate.

Do not begin from chat history or assumptions when the current baseline is not directly verified.

## 2. Branch policy

- `main` is the protected baseline branch.
- Do not commit directly to `main` after repository initialization.
- Use a short-lived branch named with one of these prefixes:
  - `governance/<workstream-id>`
  - `docs/<workstream-id>`
  - `feature/<workstream-id>`
  - `fix/<workstream-id>`
  - `security/<workstream-id>`
  - `recovery/<workstream-id>`
- One branch should represent one bounded workstream or one tightly related approved wave.
- Rebase or update only when authorized and after checking that the baseline has not changed incompatibly.
- Never force-push a reviewed branch unless the Controller explicitly authorizes it and the reason is recorded.

## 3. Commit policy

- Use clear, imperative commit messages.
- Keep commits scoped and reviewable.
- Do not mix governance, product implementation, migrations, generated artifacts, or unrelated cleanup without explicit authorization.
- Never commit secrets, tokens, credentials, private keys, production data, tenant data, financial evidence, identity documents, signed contracts, or unredacted sensitive logs.
- Large temporary evidence belongs in GitHub Actions artifacts, not Git history.

## 4. Pull request policy

Every change to `main` must use a pull request.

The PR must:

- name the workstream ID;
- target the exact authorized baseline branch;
- explain in-scope and out-of-scope changes;
- list changed paths;
- identify tests or validation and their outcomes;
- link evidence and the Execution Handoff index;
- disclose limitations, deviations, and unresolved risks;
- state the Stop Gate and current stop state;
- remain unmerged until the Central Controller issues the applicable verdict and merge authority is explicit.

Use `.github/pull_request_template.md` as the minimum structure.

## 5. Review and approval

Possible primary review verdicts are:

- `PASS`
- `PASS_WITH_NOTES`
- `REVISION_REQUIRED`
- `BLOCKED`

Opening a PR does not make its contents effective. An Executor must not approve or merge their own work. Independent review may be required for security boundaries, destructive operations, releases, client-sensitive data, major architecture, reusable policy, or disputed evidence.

## 6. Scope control

Stop and request a new or amended Workstream Contract when the change would introduce:

- new product capability;
- application code or a database outside the authorized scope;
- a provider or infrastructure dependency;
- a destructive migration;
- a legal or jurisdiction-specific policy;
- a privacy, tenant-isolation, financial-authority, settlement, deposit, release, or recovery decision;
- cross-project reusable policy.

## 7. Documentation locations

- stable executor and repository rules: `AGENTS.md`, `CONTRIBUTING.md`, and `docs/`;
- architecture contracts: `docs/architecture/`;
- architecture decision records: `docs/decisions/`;
- task-specific instructions: the Workstream Contract and PR;
- current accepted project-control state: canonical Google Drive records;
- temporary technical evidence: GitHub Actions artifacts.

## 8. Completion

A workstream is not complete merely because files were committed. Completion requires the specified validation, evidence, handoff, Controller review, and Stop Gate outcome.
