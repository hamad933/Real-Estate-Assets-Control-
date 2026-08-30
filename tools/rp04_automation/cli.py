from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from .gateway import (
    EvidenceWriter,
    GatewayError,
    GitHubClient,
    IdempotencyConflict,
    JulesClient,
    MutationDisabled,
    UnknownWriteOutcome,
    build_write_intent,
    check_idempotency,
    collect_mutation_preconditions,
    completed_marker,
    digest,
    execute_single_mutation,
    mutation_enabled,
    normalize_request,
    provider_post_readback,
    request_marker,
    unknown_marker,
    utc_now,
)


def load_request(path: str) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _normalize(path: str, evidence: EvidenceWriter) -> dict:
    normalized = normalize_request(load_request(path))
    evidence.write("normalized_request.json", normalized)
    return normalized


def inspect(path: str, outdir: str) -> int:
    evidence = EvidenceWriter(Path(outdir))
    try:
        normalized = _normalize(path, evidence)
        if normalized["operation_kind"] != "READ":
            raise GatewayError("inspect_requires_read_action")
        client = JulesClient(os.getenv("JULES_API_KEY", ""))
        action = normalized["action"]
        if action == "list_sources":
            result = client.list_sources()
        elif action == "list_sessions":
            result = client.list_sessions()
        elif action == "get_session":
            result = client.get_session(normalized["session_id"])
        else:
            result = client.list_activities(normalized["session_id"])
        evidence.write("provider_response.json", result)
        evidence.write("postcondition.json", {"classification": "PASS", "operation_kind": "READ", "request_id": normalized["request_id"], "timestamp": utc_now()})
        return 0
    except Exception as exc:
        evidence.write("postcondition.json", {"classification": "FAIL", "operation_kind": "READ", "error": str(exc), "timestamp": utc_now()})
        return 1


def preflight(path: str, outdir: str) -> int:
    evidence = EvidenceWriter(Path(outdir))
    try:
        normalized = _normalize(path, evidence)
        if normalized["operation_kind"] != "MUTATION": raise GatewayError("preflight_requires_mutation_action")
        if not mutation_enabled(): raise MutationDisabled("mutation_kill_switch_active")
        github = GitHubClient(os.getenv("GITHUB_TOKEN", ""))
        jules = JulesClient(os.getenv("JULES_API_KEY", ""))
        idem = check_idempotency(normalized, github)
        preconditions = collect_mutation_preconditions(normalized, jules, github)
        intent = build_write_intent(normalized, preconditions)
        evidence.write("preflight.json", {"classification": "PASS", "idempotency": idem, "preconditions": preconditions, "precondition_identity": digest(preconditions), "request_marker": request_marker(normalized), "completed_marker": completed_marker(normalized), "unknown_marker": unknown_marker(normalized), "timestamp": utc_now()})
        evidence.write("intent.json", intent)
        return 0
    except MutationDisabled as exc:
        evidence.write("preflight.json", {"classification": "AUTHORITY_BLOCKED", "error": str(exc), "mutation_enabled": False, "timestamp": utc_now()})
        return 5
    except IdempotencyConflict as exc:
        evidence.write("preflight.json", {"classification": "RECONCILIATION_REQUIRED", "error": str(exc), "blind_retry": False, "timestamp": utc_now()})
        return 6
    except Exception as exc:
        evidence.write("preflight.json", {"classification": "FAIL", "error": str(exc), "blind_retry": False, "timestamp": utc_now()})
        return 1


def execute(path: str, preflight_file: str, intent_file: str, outdir: str) -> int:
    evidence = EvidenceWriter(Path(outdir))
    provider_write_started = False
    try:
        normalized = _normalize(path, evidence)
        if normalized["operation_kind"] != "MUTATION": raise GatewayError("execute_requires_mutation_action")
        if not mutation_enabled(): raise MutationDisabled("mutation_kill_switch_active")
        preflight_payload = json.loads(Path(preflight_file).read_text(encoding="utf-8"))
        intent = json.loads(Path(intent_file).read_text(encoding="utf-8"))
        if intent.get("intent_identity") != normalized["intent_identity"]: raise GatewayError("intent_identity_mismatch")
        if intent.get("request_key") != normalized["request_key"]: raise GatewayError("request_key_mismatch")
        jules = JulesClient(os.getenv("JULES_API_KEY", ""))
        github = GitHubClient(os.getenv("GITHUB_TOKEN", ""))
        current_preconditions = collect_mutation_preconditions(normalized, jules, github)
        if digest(current_preconditions) != preflight_payload.get("precondition_identity"): raise GatewayError("precondition_changed_after_persisted_intent")
        provider_write_started = True
        result = execute_single_mutation(normalized, jules, current_preconditions)
        evidence.write("provider_response.json", result)
        readback = provider_post_readback(normalized, result, jules)
        evidence.write("postcondition.json", {**readback, "request_id": normalized["request_id"], "request_key": normalized["request_key"], "intent_identity": normalized["intent_identity"], "completed_marker": completed_marker(normalized), "blind_retry": False, "timestamp": utc_now()})
        return 0
    except UnknownWriteOutcome as exc:
        evidence.write("postcondition.json", {"classification": "UNKNOWN_PRIOR_WRITE_OUTCOME", "error": str(exc), "provider_write_started": True, "blind_retry": False, "reconciliation_required": True, "unknown_marker": unknown_marker(normalized) if "normalized" in locals() else None, "timestamp": utc_now()})
        return 4
    except MutationDisabled as exc:
        evidence.write("postcondition.json", {"classification": "AUTHORITY_BLOCKED", "error": str(exc), "mutation_enabled": False, "timestamp": utc_now()})
        return 5
    except Exception as exc:
        evidence.write("postcondition.json", {"classification": "FAIL_BEFORE_WRITE" if not provider_write_started else "WRITE_ATTEMPT_RECONCILIATION_REQUIRED", "error": str(exc), "provider_write_started": provider_write_started, "blind_retry": False, "timestamp": utc_now()})
        return 1


def reconcile(path: str, outdir: str) -> int:
    evidence = EvidenceWriter(Path(outdir))
    try:
        normalized = _normalize(path, evidence)
        if normalized["operation_kind"] != "RECONCILIATION": raise GatewayError("reconcile_requires_reconciliation_action")
        client = JulesClient(os.getenv("JULES_API_KEY", ""))
        snapshot = client.list_sessions() if normalized["action"] == "reconcile_create_session" else {"session": client.get_session(normalized["session_id"]), "activities": client.list_activities(normalized["session_id"])}
        evidence.write("reconciliation.json", {"classification": "RECONCILIATION_REQUIRED", "blind_retry": False, "authoritative_snapshot": snapshot, "target_request_id": normalized["target_request_id"], "target_intent_identity": normalized["target_intent_identity"], "limitation": "provider_correlatable_effect_proof_not_yet_implemented", "timestamp": utc_now()})
        return 3
    except Exception as exc:
        evidence.write("reconciliation.json", {"classification": "FAIL", "error": str(exc), "blind_retry": False, "timestamp": utc_now()})
        return 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("inspect", "preflight", "reconcile"):
        p = sub.add_parser(name); p.add_argument("request"); p.add_argument("--output-dir", required=True)
    p = sub.add_parser("execute"); p.add_argument("request"); p.add_argument("--preflight-file", required=True); p.add_argument("--intent-file", required=True); p.add_argument("--output-dir", required=True)
    args = parser.parse_args(argv)
    if args.command == "inspect": return inspect(args.request, args.output_dir)
    if args.command == "preflight": return preflight(args.request, args.output_dir)
    if args.command == "execute": return execute(args.request, args.preflight_file, args.intent_file, args.output_dir)
    return reconcile(args.request, args.output_dir)


if __name__ == "__main__":
    raise SystemExit(main())
