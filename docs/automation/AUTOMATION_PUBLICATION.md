# RP04 Automation Gateway — Trusted Publication Contract

Status: DRY-RUN FOUNDATION ONLY. No GitHub branch mutation is implemented or authorized by this file.

A publication verification request is strict and public-safe. It binds the Controller-reviewed publication to: exact request and logical-task identity; exact Jules session ID/state/update time; exact immutable Activity carrying the ChangeSet; exact Provider `baseCommitId`; exact SHA of the governed starting branch; exact patch digest; exact normalized allowed-paths digest; isolated target branch; and authority reference.

The verifier reads Jules and GitHub only. It rejects unknown keys, non-COMPLETED sessions, stale session update time, missing/non-unique ChangeSet activity, source mismatch, non-full Provider base SHA, moved remote baseline, patch-digest mismatch, disallowed paths, binary patches, symlink/submodule mode changes, unsafe/traversal paths, and unexpected target-branch prestate.

The GitHub workflow additionally checks `git apply --check` against the exact verified base SHA in a detached local checkout. This is local validation only and does not push, create a branch, commit, merge, release, or deploy.

A future mutation publication worker must remain separate and must re-read every material precondition immediately before its one external write, emit WRITE_INTENT first, use non-force publication, read back the exact remote target SHA/tree, compare the resulting tree/effect to the reviewed patch, and classify ambiguous outcomes through reconciliation. `VERIFY != PUBLISH != ACCEPTANCE != MERGE`.
