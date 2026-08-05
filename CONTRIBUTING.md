# Contributing to RP04

## 1. Authorization first

Every change requires a bounded Workstream Contract or an explicitly approved maintenance action. The contract must identify:

- project and workstream ID;
- verified repository and baseline;
- exact scope and prohibited changes;
- branch and pull request policy;
- required primary or independent review;
- required validation and evidence;
- expected handoff;
- Stop Gate.

Do not begin from chat history or assumptions when the current baseline is not directly verified.

## 2. Branch policy

- `main` is the governed baseline branch and is policy-protected.
- This policy does not assert that GitHub branch-protection settings are configured; verify platform enforcement directly when it is required.
- Do not commit directly to `main` after repository initialization unless an explicit recovery or initialization authority permits it.
- Where GitHub branch protection is configured, it supplements this policy and must not be bypassed.
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
- identify the current head SHA;
- explain in-scope and out-of-scope changes;
- list changed paths;
- identify tests or validation and their outcomes;
- link evidence and the Execution Handoff index;
- disclose limitations, deviations, and unresolved risks;
- record required reviewer roles, identities, reviewed head SHAs, verdicts, and unresolved disagreements;
- record any acceptance or merge-authority grant separately from review verdicts;
- state the Stop Gate and current stop state;
- remain unmerged until all required reviews are acceptable and merge authority for the exact head is explicit.

Use `.github/pull_request_template.md` as the minimum structure.

## 5. Review independence

Possible review verdicts are:

- `PASS`
- `PASS_WITH_NOTES`
- `REVISION_REQUIRED`
- `BLOCKED`

Opening a PR does not make its contents effective.

- A person who materially authored, edited, or pushed a change must not be its sole reviewer or final acceptance authority, regardless of role label.
- An Executor must not approve or merge their own work.
- Independent review is mandatory for changes to the authority model, repository governance, `AGENTS.md`, `CONTRIBUTING.md`, branch/PR policy, execution/safety rules, evidence/handoff policy, review independence, or when the Controller materially contributed to the branch.
- The Independent Reviewer must inspect a frozen base/head, report independently, and must not edit the branch or PR, update Drive, grant merge authority, merge, release, or deploy.
- Any new commit requires review of the new head. A verdict tied to an older head is not current.
- An unresolved disagreement between required reviewers blocks acceptance and merge until revision or an explicit Owner/named-authority resolution is recorded.

## 6. Merge authority

A technical verdict does not authorize merge.

Merge authority may be granted only by the Owner or a named authority explicitly delegated in the canonical RP04 Google Drive control state. The record must include:

- grantor;
- canonical decision or control-event reference;
- date;
- repository and PR;
- exact authorized head SHA;
- conditions or expiry, when applicable.

The Central Controller may coordinate or execute the merge only after verifying the required reviews, the exact authorized head, the absence of unresolved blockers, and the merge-authority record.

## 7. Scope control

Stop and request a new or amended Workstream Contract when the change would introduce:

- new product capability;
- application code or a database outside the authorized scope;
- a provider or infrastructure dependency;
- a destructive migration;
- a legal or jurisdiction-specific policy;
- a privacy, tenant-isolation, financial-authority, settlement, deposit, release, or recovery decision;
- cross-project reusable policy.

## 8. Documentation locations

- stable executor and repository rules: `AGENTS.md`, `CONTRIBUTING.md`, and `docs/`;
- static portfolio policy and stable product/domain truth: exact Controller-routed Project Sources only;
- architecture contracts: `docs/architecture/`;
- architecture decision records: `docs/decisions/`;
- task-specific instructions and approved bounded overrides: the Workstream Contract and PR;
- current accepted project-control state, acceptance, delegation, and merge authority: canonical Google Drive records;
- temporary technical evidence: GitHub Actions artifacts.

## 9. Completion

A workstream is not complete merely because files were committed. Completion requires the specified validation, evidence, handoff, required primary and independent reviews, resolution of disagreements, acceptance, exact-head merge authority when merge is requested, and the Stop Gate outcome.
