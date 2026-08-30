from __future__ import annotations
import argparse, json, os
from pathlib import Path
from .gateway import (EvidenceWriter, GatewayError, GitHubClient, IdempotencyConflict, JulesClient, MutationDisabled, UnknownWriteOutcome,
    build_write_intent, check_idempotency, collect_mutation_preconditions, completed_marker, digest, execute_single_mutation, mutation_enabled,
    normalize_request, provider_post_readback, reconcile_provider_effect, request_marker, unknown_marker, utc_now)

def load_request(path): return json.loads(Path(path).read_text(encoding="utf-8"))
def _normalize(path,evidence):
    n=normalize_request(load_request(path)); evidence.write("normalized_request.json",n); return n

def inspect(path,outdir):
    evidence=EvidenceWriter(Path(outdir))
    try:
        n=_normalize(path,evidence)
        if n["operation_kind"]!="READ": raise GatewayError("inspect_requires_read_action")
        client=JulesClient(os.getenv("JULES_API_KEY","")); action=n["action"]
        result=client.list_sources() if action=="list_sources" else client.list_sessions() if action=="list_sessions" else client.get_session(n["session_id"]) if action=="get_session" else client.list_activities(n["session_id"])
        evidence.write("provider_response.json",result); evidence.write("postcondition.json",{"classification":"PASS","operation_kind":"READ","request_id":n["request_id"],"timestamp":utc_now()}); return 0
    except Exception as exc:
        evidence.write("postcondition.json",{"classification":"FAIL","operation_kind":"READ","error":str(exc),"timestamp":utc_now()}); return 1

def preflight(path,outdir):
    evidence=EvidenceWriter(Path(outdir))
    try:
        n=_normalize(path,evidence)
        if n["operation_kind"]!="MUTATION": raise GatewayError("preflight_requires_mutation_action")
        if not mutation_enabled(): raise MutationDisabled("mutation_kill_switch_active")
        github=GitHubClient(os.getenv("GITHUB_TOKEN","")); jules=JulesClient(os.getenv("JULES_API_KEY","")); idem=check_idempotency(n,github); pre=collect_mutation_preconditions(n,jules,github); intent=build_write_intent(n,pre)
        evidence.write("preflight.json",{"classification":"PASS","idempotency":idem,"preconditions":pre,"precondition_identity":digest(pre),"request_marker":request_marker(n),"completed_marker":completed_marker(n),"unknown_marker":unknown_marker(n),"timestamp":utc_now()}); evidence.write("intent.json",intent); return 0
    except MutationDisabled as exc:
        evidence.write("preflight.json",{"classification":"AUTHORITY_BLOCKED","error":str(exc),"mutation_enabled":False,"timestamp":utc_now()}); return 5
    except IdempotencyConflict as exc:
        evidence.write("preflight.json",{"classification":"RECONCILIATION_REQUIRED","error":str(exc),"blind_retry":False,"timestamp":utc_now()}); return 6
    except Exception as exc:
        evidence.write("preflight.json",{"classification":"FAIL","error":str(exc),"blind_retry":False,"timestamp":utc_now()}); return 1

def execute(path,preflight_file,intent_file,outdir):
    evidence=EvidenceWriter(Path(outdir)); provider_write_started=False
    try:
        n=_normalize(path,evidence)
        if n["operation_kind"]!="MUTATION": raise GatewayError("execute_requires_mutation_action")
        if not mutation_enabled(): raise MutationDisabled("mutation_kill_switch_active")
        preflight_payload=json.loads(Path(preflight_file).read_text(encoding="utf-8")); intent=json.loads(Path(intent_file).read_text(encoding="utf-8"))
        if intent.get("intent_identity")!=n["intent_identity"]: raise GatewayError("intent_identity_mismatch")
        if intent.get("request_key")!=n["request_key"]: raise GatewayError("request_key_mismatch")
        jules=JulesClient(os.getenv("JULES_API_KEY","")); github=GitHubClient(os.getenv("GITHUB_TOKEN","")); current=collect_mutation_preconditions(n,jules,github)
        if digest(current)!=preflight_payload.get("precondition_identity"): raise GatewayError("precondition_changed_after_persisted_intent")
        provider_write_started=True; result=execute_single_mutation(n,jules,current); evidence.write("provider_response.json",result); readback=provider_post_readback(n,result,jules)
        post={**readback,"request_id":n["request_id"],"request_key":n["request_key"],"intent_identity":n["intent_identity"],"completed_marker":completed_marker(n),"blind_retry":False,"timestamp":utc_now()}
        if readback.get("classification")!="APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED": post.update({"reconciliation_required":True,"unknown_marker":unknown_marker(n)})
        evidence.write("postcondition.json",post)
        return 0 if readback.get("classification")=="APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED" else 4
    except UnknownWriteOutcome as exc:
        evidence.write("postcondition.json",{"classification":"UNKNOWN_PRIOR_WRITE_OUTCOME","error":str(exc),"provider_write_started":True,"blind_retry":False,"reconciliation_required":True,"unknown_marker":unknown_marker(n) if "n" in locals() else None,"timestamp":utc_now()}); return 4
    except MutationDisabled as exc:
        evidence.write("postcondition.json",{"classification":"AUTHORITY_BLOCKED","error":str(exc),"mutation_enabled":False,"timestamp":utc_now()}); return 5
    except Exception as exc:
        post={"classification":"FAIL_BEFORE_WRITE" if not provider_write_started else "WRITE_ATTEMPT_RECONCILIATION_REQUIRED","error":str(exc),"provider_write_started":provider_write_started,"blind_retry":False,"timestamp":utc_now()}
        if provider_write_started: post.update({"reconciliation_required":True,"unknown_marker":unknown_marker(n) if "n" in locals() else None})
        evidence.write("postcondition.json",post); return 1

def reconcile(path,outdir):
    evidence=EvidenceWriter(Path(outdir))
    try:
        n=_normalize(path,evidence)
        if n["operation_kind"]!="RECONCILIATION": raise GatewayError("reconcile_requires_reconciliation_action")
        client=JulesClient(os.getenv("JULES_API_KEY","")); result=reconcile_provider_effect(n,client)
        evidence.write("reconciliation.json",{**result,"target_request_id":n["target_request_id"],"target_intent_identity":n["target_intent_identity"],"timestamp":utc_now()}); return 0 if result.get("classification")=="APPLIED" else 3
    except Exception as exc:
        evidence.write("reconciliation.json",{"classification":"FAIL","error":str(exc),"blind_retry":False,"timestamp":utc_now()}); return 1

def main(argv=None):
    p=argparse.ArgumentParser(); sub=p.add_subparsers(dest="command",required=True)
    for name in ("inspect","preflight","reconcile"):
        q=sub.add_parser(name); q.add_argument("request"); q.add_argument("--output-dir",required=True)
    q=sub.add_parser("execute"); q.add_argument("request"); q.add_argument("--preflight-file",required=True); q.add_argument("--intent-file",required=True); q.add_argument("--output-dir",required=True)
    a=p.parse_args(argv)
    if a.command=="inspect": return inspect(a.request,a.output_dir)
    if a.command=="preflight": return preflight(a.request,a.output_dir)
    if a.command=="execute": return execute(a.request,a.preflight_file,a.intent_file,a.output_dir)
    return reconcile(a.request,a.output_dir)
if __name__=="__main__": raise SystemExit(main())
