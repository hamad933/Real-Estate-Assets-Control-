from __future__ import annotations
import os, re
from typing import Any
from .clients import GitHubClient, JulesClient
from .common import PROJECT_ID, REPOSITORY, IdempotencyConflict, PreconditionFailed, ValidationError, digest, utc_now

def mutation_enabled() -> bool: return os.getenv("RP04_AUTOMATION_MUTATION_ENABLED","").lower()=="true"
def find_rp04_source(payload: dict[str,Any]) -> str|None:
    for source in payload.get("sources") or []:
        repo=source.get("githubRepo") or {}
        if repo.get("owner")=="hamad933" and repo.get("repo")=="Real-Estate-Assets-Control-": return str(source.get("name") or "") or None
    return None

def request_marker(n): return f"rp04-auto-request-{n['request_key']}-{n['intent_identity']}"
def completed_marker(n): return f"rp04-auto-completed-{n['request_key']}-{n['intent_identity']}"
def unknown_marker(n): return f"rp04-auto-unknown-{n['request_key']}-{n['intent_identity']}"
def correlation_marker_from_identity(request_id: str, intent_identity: str) -> str:
    request_key=digest({"project":PROJECT_ID,"request_id":request_id})[:32]
    return f"RP04_AUTOMATION_CORRELATION={request_key}:{intent_identity[:24]}"
def correlation_marker(n): return correlation_marker_from_identity(n["request_id"],n["intent_identity"])
def target_correlation_marker(n): return correlation_marker_from_identity(n["target_request_id"],n["target_intent_identity"])
def correlated_title(n):
    base=n.get("title",n["logical_task_id"])
    return f"[{correlation_marker(n)}] {base}"[:200]
def correlated_message(n): return n["prompt"] + "\n\n[" + correlation_marker(n) + "]"

def check_idempotency(n: dict[str,Any], github: GitHubClient) -> dict[str,Any]:
    names=github.artifact_names(); prefix=f"rp04-auto-request-{n['request_key']}-"; seen=sorted({x for x in names if x.startswith(prefix)}); exact=request_marker(n)
    if any(name!=exact for name in seen): raise IdempotencyConflict("request_id_reused_with_changed_intent")
    if exact in seen:
        if completed_marker(n) in names: raise IdempotencyConflict("duplicate_completed_request")
        if unknown_marker(n) in names: raise IdempotencyConflict("unknown_prior_write_outcome_requires_reconciliation")
        raise IdempotencyConflict("existing_request_intent_requires_reconciliation")
    return {"request_marker":exact,"matching_request_markers":seen}

def _session_snapshot(session):
    return {"name":session.get("name"),"state":session.get("state"),"updateTime":session.get("updateTime"),"title":session.get("title"),"sourceContext":session.get("sourceContext")}
def _latest_plan_snapshot(payload):
    found=None
    for activity in payload.get("activities") or []:
        plan=(activity.get("planGenerated") or {}).get("plan")
        if isinstance(plan,dict): found={"activity":activity.get("name"),"createTime":activity.get("createTime"),"plan_id":plan.get("id") or plan.get("name"),"plan_digest":digest(plan)}
    return found

def _assert_provider_effect_absent(n: dict[str,Any], jules: JulesClient) -> None:
    marker=correlation_marker(n)
    if n["action"]=="create_session":
        matches=[s for s in (jules.list_sessions().get("sessions") or []) if marker in str(s.get("title") or "")]
    else:
        activities=jules.list_activities(n["session_id"]).get("activities") or []
        if n["action"]=="send_message": matches=[a for a in activities if _message_matches(a,marker)]
        elif n["action"]=="approve_plan": matches=[a for a in activities if _approval_matches(a,n["expected_plan_id"])]
        else: matches=[]
    if matches: raise IdempotencyConflict("provider_effect_already_exists_for_request")

def collect_mutation_preconditions(n: dict[str,Any], jules: JulesClient, github: GitHubClient) -> dict[str,Any]:
    action=n["action"]; snapshot={"action":action}
    if action=="create_session":
        remote_sha=github.branch_sha(n["starting_branch"])
        if remote_sha!=n["expected_sha"]: raise PreconditionFailed("stale_remote_sha")
        source=find_rp04_source(jules.list_sources())
        if not source: raise PreconditionFailed("rp04_jules_source_not_connected")
        _assert_provider_effect_absent(n,jules)
        snapshot.update({"starting_branch":n["starting_branch"],"remote_sha":remote_sha,"source":source,"provider_effect_absent":True})
        return snapshot
    session=_session_snapshot(jules.get_session(n["session_id"]))
    if session["state"]!=n.get("expected_session_state"): raise PreconditionFailed("stale_session_state")
    if session["updateTime"]!=n.get("expected_session_update_time"): raise PreconditionFailed("stale_session_update_time")
    snapshot["session"]=session
    _assert_provider_effect_absent(n,jules)
    snapshot["provider_effect_absent"]=True
    if action=="approve_plan":
        plan=_latest_plan_snapshot(jules.list_activities(n["session_id"]))
        if not plan: raise PreconditionFailed("reviewed_plan_not_found")
        if plan["activity"]!=n.get("expected_plan_activity"): raise PreconditionFailed("stale_plan_activity")
        if plan["plan_digest"]!=n.get("expected_plan_digest"): raise PreconditionFailed("stale_plan_digest")
        if plan.get("plan_id")!=n["expected_plan_id"]: raise PreconditionFailed("stale_plan_id")
        snapshot["plan"]=plan
    return snapshot

def build_write_intent(n,preconditions):
    proof={"correlation_marker":correlation_marker(n)}
    if n["action"]=="create_session": proof.update({"starting_branch":n["starting_branch"],"correlated_title":correlated_title(n)})
    elif n["action"]=="send_message": proof.update({"session_id":n["session_id"],"message_digest":digest(correlated_message(n))})
    elif n["action"]=="approve_plan": proof.update({"session_id":n["session_id"],"expected_plan_id":n["expected_plan_id"]})
    return {"kind":"WRITE_INTENT","schema_version":"1","project_id":PROJECT_ID,"repository":REPOSITORY,"request_id":n["request_id"],"request_key":n["request_key"],"intent_identity":n["intent_identity"],"logical_task_id":n["logical_task_id"],"write_domain":n["write_domain"],"effect_key":n["effect_key"],"action":n["action"],"authority_event":n.get("authority_event"),"authority_ref":n.get("authority_ref"),"precondition_identity":digest(preconditions),"effect_proof":proof,"blind_retry":False,"timestamp":utc_now()}
def execute_single_mutation(n,jules: JulesClient,preconditions):
    if n["action"]=="create_session":
        return jules.create_session({"prompt":n["prompt"],"title":correlated_title(n),"sourceContext":{"source":preconditions["source"],"githubRepoContext":{"startingBranch":n["starting_branch"]}},"requirePlanApproval":True})
    if n["action"]=="send_message": return jules.send_message(n["session_id"],correlated_message(n))
    if n["action"]=="approve_plan": return jules.approve_plan(n["session_id"])
    raise ValidationError("execute_requires_mutation_action")
def _message_matches(activity, marker):
    return marker in str((activity.get("userMessaged") or {}).get("userMessage") or "")
def _approval_matches(activity, plan_id):
    return str((activity.get("planApproved") or {}).get("planId") or "")==str(plan_id)
def provider_post_readback(n,result,jules: JulesClient):
    if n["action"]=="create_session":
        name=str(result.get("name") or ""); m=re.fullmatch(r"sessions/([0-9]+)",name)
        if not m: return {"classification":"APPLIED_RESPONSE_RECEIVED_POSTPROOF_INCOMPLETE","provider_name":name,"reconciliation_required":True}
        sid=m.group(1); session=jules.get_session(sid)
        if correlation_marker(n) not in str(session.get("title") or ""):
            return {"classification":"APPLIED_RESPONSE_RECEIVED_POSTPROOF_INCOMPLETE","session_id":sid,"session":_session_snapshot(session),"reconciliation_required":True}
        return {"classification":"APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED","session_id":sid,"session":_session_snapshot(session),"effect_proof":{"correlation_marker":correlation_marker(n)}}
    sid=n["session_id"]
    if n["action"]=="send_message":
        activities=jules.list_activities(sid).get("activities") or []; matches=[a for a in activities if _message_matches(a,correlation_marker(n))]
        if len(matches)==1: return {"classification":"APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED","session_id":sid,"effect_proof":{"activity":matches[0].get("name"),"correlation_marker":correlation_marker(n)}}
        return {"classification":"APPLIED_RESPONSE_RECEIVED_POSTPROOF_INCOMPLETE","session_id":sid,"matching_effect_count":len(matches),"reconciliation_required":True}
    activities=jules.list_activities(sid).get("activities") or []; matches=[a for a in activities if _approval_matches(a,n["expected_plan_id"])]
    if matches: return {"classification":"APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED","session_id":sid,"effect_proof":{"plan_id":n["expected_plan_id"],"activities":[a.get("name") for a in matches]}}
    return {"classification":"APPLIED_RESPONSE_RECEIVED_POSTPROOF_INCOMPLETE","session_id":sid,"reconciliation_required":True}
def reconcile_provider_effect(n,jules: JulesClient):
    marker=target_correlation_marker(n)
    if n["action"]=="reconcile_create_session":
        sessions=jules.list_sessions().get("sessions") or []; matches=[s for s in sessions if marker in str(s.get("title") or "")]
        if len(matches)==1: return {"classification":"APPLIED","effect_proof":{"session":_session_snapshot(matches[0]),"correlation_marker":marker},"blind_retry":False}
        if len(matches)>1: return {"classification":"APPLIED_DUPLICATE_EFFECT_DETECTED","effect_count":len(matches),"blind_retry":False,"stop_gate":"DUPLICATE_EFFECT_REVIEW_REQUIRED"}
        return {"classification":"UNKNOWN_PRIOR_WRITE_OUTCOME","effect_count":0,"blind_retry":False,"reconciliation_required":True}
    activities=jules.list_activities(n["session_id"]).get("activities") or []
    if n["action"]=="reconcile_send_message":
        matches=[a for a in activities if _message_matches(a,marker)]
        if len(matches)==1: return {"classification":"APPLIED","effect_proof":{"activity":matches[0].get("name"),"correlation_marker":marker},"blind_retry":False}
        if len(matches)>1: return {"classification":"APPLIED_DUPLICATE_EFFECT_DETECTED","effect_count":len(matches),"blind_retry":False,"stop_gate":"DUPLICATE_EFFECT_REVIEW_REQUIRED"}
        return {"classification":"UNKNOWN_PRIOR_WRITE_OUTCOME","effect_count":0,"blind_retry":False,"reconciliation_required":True}
    matches=[a for a in activities if _approval_matches(a,n["expected_plan_id"])]
    if matches: return {"classification":"APPLIED","effect_proof":{"plan_id":n["expected_plan_id"],"activities":[a.get("name") for a in matches]},"blind_retry":False}
    return {"classification":"UNKNOWN_PRIOR_WRITE_OUTCOME","effect_count":0,"blind_retry":False,"reconciliation_required":True}
