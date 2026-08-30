from __future__ import annotations
from typing import Any
from .common import (ALLOWED_ACTIONS, BRANCH_RE, DIGEST_RE, DOMAIN_RE, ID_RE, MUTATION_ACTIONS,
    PROJECT_ID, READ_ACTIONS, RECONCILE_ACTIONS, REPOSITORY, SESSION_RE, SHA_RE, ValidationError, digest)

def _require_id(name: str, value: Any) -> str:
    text = str(value or "").strip()
    if not ID_RE.fullmatch(text): raise ValidationError(f"invalid_{name}")
    return text

def _require_domain(value: Any) -> str:
    text = str(value or "").strip()
    if not DOMAIN_RE.fullmatch(text): raise ValidationError("invalid_write_domain")
    return text

def _require_branch(value: Any) -> str:
    text = str(value or "").strip()
    if not BRANCH_RE.fullmatch(text): raise ValidationError("invalid_starting_branch")
    return text

def normalize_request(raw: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(raw, dict): raise ValidationError("request_must_be_object")
    allowed = {"schema_version","request_id","project_id","controller_id","lane","logical_task_id","action","write_domain","repository",
        "starting_branch","expected_sha","session_id","expected_session_state","expected_session_update_time","expected_plan_id","expected_plan_digest",
        "expected_plan_activity","instruction_ref","instruction_digest","authority_ref","authority_event","target_request_id","target_intent_identity",
        "prompt","title","require_plan_approval"}
    unknown = sorted(set(raw) - allowed)
    if unknown: raise ValidationError("unknown_keys:" + ",".join(unknown))
    schema_version = str(raw.get("schema_version") or "1")
    if schema_version != "1": raise ValidationError("unsupported_schema_version")
    action = str(raw.get("action") or "").strip()
    if action not in ALLOWED_ACTIONS: raise ValidationError("unsupported_action")
    out: dict[str, Any] = {
        "schema_version": schema_version,
        "request_id": _require_id("request_id", raw.get("request_id")),
        "project_id": str(raw.get("project_id") or PROJECT_ID),
        "controller_id": _require_id("controller_id", raw.get("controller_id")),
        "lane": _require_id("lane", raw.get("lane") or "AUTOMATION"),
        "logical_task_id": _require_id("logical_task_id", raw.get("logical_task_id")),
        "action": action,
        "write_domain": _require_domain(raw.get("write_domain") or "READ_ONLY"),
        "repository": str(raw.get("repository") or REPOSITORY),
    }
    if out["project_id"] != PROJECT_ID or out["repository"] != REPOSITORY: raise ValidationError("project_or_repository_mismatch")
    if out["controller_id"] != "CENTRAL" or out["lane"] != "AUTOMATION": raise ValidationError("controller_or_lane_not_authorized_by_schema")
    if raw.get("starting_branch") not in (None, ""): out["starting_branch"] = _require_branch(raw["starting_branch"])
    for key in ("expected_session_state","expected_session_update_time","expected_plan_id","expected_plan_activity","instruction_ref","authority_ref","authority_event"):
        if raw.get(key) not in (None, ""): out[key] = str(raw[key]).strip()
    if raw.get("expected_sha") not in (None, ""):
        sha = str(raw["expected_sha"]).strip().lower()
        if not SHA_RE.fullmatch(sha): raise ValidationError("invalid_expected_sha")
        out["expected_sha"] = sha
    if raw.get("session_id") not in (None, ""):
        sid = str(raw["session_id"]).strip()
        if not SESSION_RE.fullmatch(sid): raise ValidationError("invalid_session_id")
        out["session_id"] = sid
    for key in ("expected_plan_digest","instruction_digest","target_intent_identity"):
        if raw.get(key) not in (None, ""):
            val = str(raw[key]).strip().lower()
            if not DIGEST_RE.fullmatch(val): raise ValidationError(f"invalid_{key}")
            out[key] = val
    if raw.get("target_request_id") not in (None, ""): out["target_request_id"] = _require_id("target_request_id", raw["target_request_id"])
    if raw.get("prompt") not in (None, ""):
        prompt = str(raw["prompt"])
        if not prompt or len(prompt) > 20000: raise ValidationError("invalid_prompt")
        out["prompt"] = prompt
    if raw.get("title") not in (None, ""):
        title = str(raw["title"])
        if not title or len(title) > 200: raise ValidationError("invalid_title")
        out["title"] = title
    require_plan_approval = raw.get("require_plan_approval", True)
    if not isinstance(require_plan_approval, bool): raise ValidationError("require_plan_approval_must_be_boolean")
    out["require_plan_approval"] = require_plan_approval
    if action in MUTATION_ACTIONS | RECONCILE_ACTIONS:
        if out["write_domain"] == "READ_ONLY": raise ValidationError("mutation_requires_write_domain")
        if not out.get("authority_event") and not out.get("authority_ref"): raise ValidationError("mutation_requires_authority_reference")
    if action == "create_session":
        for key in ("starting_branch","expected_sha","prompt"):
            if not out.get(key): raise ValidationError(f"create_session_requires_{key}")
        if not out["require_plan_approval"]: raise ValidationError("create_session_requires_plan_approval")
    if action in {"send_message","approve_plan","list_activities","get_session","reconcile_send_message","reconcile_approve_plan"} and not out.get("session_id"):
        raise ValidationError("session_id_required")
    if action == "send_message":
        if not out.get("prompt"): raise ValidationError("send_message_requires_prompt")
        for key in ("expected_session_state","expected_session_update_time"):
            if not out.get(key): raise ValidationError(f"send_message_requires_{key}")
    if action == "approve_plan":
        for key in ("expected_session_state","expected_session_update_time","expected_plan_digest","expected_plan_activity","expected_plan_id"):
            if not out.get(key): raise ValidationError(f"approve_plan_requires_{key}")
    if action.startswith("reconcile_") and (not out.get("target_request_id") or not out.get("target_intent_identity")):
        raise ValidationError("reconciliation_requires_target_identity")
    if action == "reconcile_approve_plan" and not out.get("expected_plan_id"):
        raise ValidationError("reconcile_approve_plan_requires_expected_plan_id")
    out["intent_identity"] = digest({k:v for k,v in out.items() if k != "intent_identity"})
    out["request_key"] = digest({"project":PROJECT_ID,"request_id":out["request_id"]})[:32]
    out["effect_key"] = digest({"project":PROJECT_ID,"repository":REPOSITORY,"write_domain":out["write_domain"]})[:32]
    out["operation_kind"] = "READ" if action in READ_ACTIONS else ("RECONCILIATION" if action in RECONCILE_ACTIONS else "MUTATION")
    return out
