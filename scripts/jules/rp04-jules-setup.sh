#!/usr/bin/env bash
set -euo pipefail

printf 'RP04 Jules setup: repository=%s\n' "$(basename "$(pwd)")"
command -v node >/dev/null 2>&1 || { echo 'ERROR: node is required' >&2; exit 20; }
command -v npm >/dev/null 2>&1 || { echo 'ERROR: npm is required' >&2; exit 21; }
[ -f package.json ] || { echo 'ERROR: package.json not found at repository root' >&2; exit 22; }
[ -f package-lock.json ] || { echo 'ERROR: package-lock.json is required for deterministic npm ci' >&2; exit 23; }

printf 'node=%s npm=%s\n' "$(node --version)" "$(npm --version)"
npm ci --no-audit --no-fund
npm run typecheck
npm run lint
printf 'RP04_JULES_SETUP_PASS\n'
