# RP04 Automation Gateway — Jules Setup

The Jules REST API is treated as a volatile alpha Provider surface. Authentication uses repository secret `JULES_API_KEY`. The gateway discovers the connected source with `list_sources` rather than hard-coding a Provider source identifier.

## Project setup script
Use `scripts/jules/rp04-jules-setup.sh` as the candidate project setup script. It is intentionally non-destructive: it verifies Node/npm and the lockfile, runs deterministic `npm ci --no-audit --no-fund`, then the repository-native `typecheck` and `lint` commands. It does not initialize/reset/seed the database, install browser binaries, modify governed source, read secrets, release, or deploy.

The repository does not currently pin a Node runtime in the inspected source, so this candidate does not invent a stale provider-specific Node pin. A clean Jules environment must prove that the available runtime satisfies the locked application dependencies before the setup gate can be accepted.

Before enabling live use, execute the setup inside Jules on a clean project environment, inspect the exact output, and snapshot only after success. Any runtime/version mismatch remains `NOT_RUN_ENVIRONMENT_MISMATCH` until resolved from direct evidence.

## Owner-only provisioning
Ensure the Google Labs Jules GitHub App is authorized for `hamad933/Real-Estate-Assets-Control-`, and ensure `JULES_API_KEY` exists as a GitHub repository secret. The available connector cannot enumerate secret values or prove secret presence, so secret provisioning status must not be inferred from repository text. No key value belongs in Drive, issues, logs, setup scripts, or artifacts.
