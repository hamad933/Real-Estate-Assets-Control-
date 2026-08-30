from __future__ import annotations

import os
import re
from typing import Any

from .clients import GitHubClient, JulesClient
from .common import PROJECT_ID, REPOSITORY, IdempotencyConflict, PreconditionFailed, ValidationError, digest, utc_now


def mutation_enabled() -> bool:
    return os.getenv("RP04_AUTOMATION_MUTATION_ENABLED", "").lower() == "true"


def find_rp04_source(payload: dict[str, Any]) -> str | None:
    for source in payload.get("sources") or []:
        repo = source.get("githubRepo") or {}
        if repo.get("owner") == "hamad933" and repo.get("repo") == "Real-Estate-Assets-Control-":
            return str(source.get("name") or "") or None
    return None


def request_marker(n): return f"rp04-auto-request-{n['request_key']}-{n['intent_identity']}"
def completed_marker(n): return f"rp04-auto-completed-{n['request_key']}-{n['intent_identity']}"
def unknown_marker(n): return f"rp04-auto-unknown-{n['request_key']}-{n['intent_identity']}"


def check_idempotency(n: dict[str, Any], github: GitHubClient) -> dict[str, Any]:
    names = github.artifact_names()
    prefix = f"rp04-auto-request-{n['request_key']}-"
    seen = sorted({name for name in names if name.startswith(prefix)})
    exact = request_marker(n)
    if any(name != exact for name in seen): raise IdempotencyConflict("request_id_reused_with_changed_intent")
    if exact in seen:
        if completed_marker(n) in names: raise IdempotencyConflict("duplicate_completed_request")
        if unknown_marker(n) in names: raise IdempotencyConflict("unknown_prior_write_outcome_requires_reconciliation")
        raise IdempotencyConflict("existing_request_intent_requires_reconciliation")
    return {"request_marker": exact, "matching_request_markers": seen}


def _session_snapshot(session):
    return {"name": session.get("name"), "state": session.get("state"), "updateTime": session.get("updateTime")}


def _latest_plan_snapshot(payload):
    found = None
    for activity in payload.get("activities") or []:
        plan = (activity.get("planGenerated") or {}).get("plan")
        if isinstance(plan, dict):
            found = {"activity": activity.get("name"), "createTime": activity.get("createTime"), "plan_id": plan.get("id") or plan.get("name"), "plan_digest": digest(plan)}
    return found


def collect_mutation_preconditions(n: dict[str, Any], jules: JulesClient, github: GitHubClient) -> dict[str, Any]:
    action = n["action"]
    snapshot: dict[str, Any] = {"action": action}
    if action == "create_session":
        remote_sha = github.branch_sha(n["starting_branch"])
        if remote_sha != n["expected_sha"]: raise PreconditionFailed("stale_remote_sha")
        source = find_rp04_source(jules.list_sources())
        if not source: raise PreconditionFailed("rp04_jules_source_not_connected")
        snapshot.update({"starting_branch": n["starting_branch"], "remote_sha": remote_sha, "source": source})
        return snapshot
    session = _session_snapshot(jules.get_session(n["session_id"]))
    if session["state"] != n.get("expected_session_state"): raise PreconditionFailed("stale_session_state")
    if session["updateTime"] != n.get("expected_session_update_time"): raise PreconditionFailed("stale_session_update_time")
    snapshot["session"] = session
    if action == "approve_plan":
        plan = _latest_plan_snapshot(jules.list_activities(n["session_id"]))
        if not plan: raise PreconditionFailed("reviewed_plan_not_found")
        if plan["activity"] != n.get("expected_plan_activity"): raise PreconditionFailed("stale_plan_activity")
        if plan["plan_digest"] != n.get("expected_plan_digest"): raise PreconditionFailed("stale_plan_digest")
        if n.get("expected_plan_id") and plan.get("plan_id") != n["expected_plan_id"]: raise PreconditionFailed("stale_plan_id")
        snapshot["plan"] = plan
    return snapshot


def build_write_intent(n, preconditions):
    return {"kind": "WRITE_INTENT", "schema_version": "1", "project_id": PROJECT_ID, "repository": REPOSITORY, "request_id": n["request_id"], "request_key": n["request_key"], "intent_identity": n["intent_identity"], "logical_task_id": n["logical_task_id"], "write_domain": n["write_domain"], "effect_key": n["effect_key"], "action": n["action"], "authority_event": n.get("authority_event"), "authority_ref": n.get("authority_ref"), "precondition_identity": digest(preconditions), "blind_retry": False, "timestamp": utc_now()}


def execute_single_mutation(n, jules: JulesClient, preconditions):
    if n["action"] == "create_session":
        return jules.create_session({"prompt": n["prompt"], "title": n.get("title", n["logical_task_id"]), "sourceContext": {"source": preconditions["source"], "githubRepoContext": {"startingBranch": n["starting_branch"]}}, "requirePlanApproval": n.get("require_plan_approval", True)})
    if n["action"] == "send_message": return jules.send_message(n["session_id"], n["prompt"])
    if n["action"] == "approve_plan": return jules.approve_plan(n["session_id"])
    raise ValidationError("execute_requires_mutation_action")


def provider_post_readback(n, result, jules: JulesClient):
    if n["action"] == "create_session":
        name = str(result.get("name") or "")
        match = re.fullmatch(r"sessions/([0-9]+)", name)
        if not match: return {"classification": "APPLIED_RESPONSE_RECEIVED_POSTPROOF_INCOMPLETE", "provider_name": name}
        sid = match.group(1)
    else:
        sid = n["session_id"]
    return {"classification": "APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED", "session_id": sid, "session": _session_snapshot(jules.get_session(sid))}
