import json, os, sys, unittest
from pathlib import Path
from unittest import mock
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.rp04_automation.gateway import (
    IdempotencyConflict, PreconditionFailed, ValidationError, build_write_intent, check_idempotency,
    collect_mutation_preconditions, correlation_marker, correlated_message, correlated_title, digest,
    execute_single_mutation, mutation_enabled, normalize_request, provider_post_readback,
    reconcile_provider_effect, redact, request_marker, target_correlation_marker)

BASE={"schema_version":"1","request_id":"req-1","project_id":"RP04","controller_id":"CENTRAL","lane":"AUTOMATION","logical_task_id":"task-1","action":"list_sessions","write_domain":"READ_ONLY","repository":"hamad933/Real-Estate-Assets-Control-"}
class FakeGitHub:
    def __init__(self,sha="a"*40,names=None): self.sha,self.names=sha,list(names or [])
    def branch_sha(self,branch): return self.sha
    def artifact_names(self,max_pages=5): return list(self.names)
class FakeJules:
    def __init__(self): self.activities=[]; self.sessions=[]; self.last_message=None; self.last_create=None; self.approved=False
    def list_sources(self): return {"sources":[{"name":"sources/github/rp04","githubRepo":{"owner":"hamad933","repo":"Real-Estate-Assets-Control-"}}],"pagination_complete":True}
    def get_session(self,sid):
        for s in self.sessions:
            if str(s.get("id"))==str(sid) or s.get("name")==f"sessions/{sid}": return s
        return {"name":f"sessions/{sid}","id":str(sid),"state":"AWAITING_PLAN_APPROVAL","updateTime":"2026-08-30T18:00:00Z","title":"x"}
    def list_sessions(self): return {"sessions":list(self.sessions),"pagination_complete":True}
    def list_activities(self,sid): return {"activities":list(self.activities),"pagination_complete":True}
    def create_session(self,body):
        self.last_create=body; s={"name":"sessions/99","id":"99","state":"QUEUED","updateTime":"2026-08-30T18:01:00Z","title":body["title"],"sourceContext":body["sourceContext"]}; self.sessions.append(s); return {"name":"sessions/99"}
    def send_message(self,sid,prompt): self.last_message=prompt; self.activities.append({"name":f"sessions/{sid}/activities/m1","userMessaged":{"userMessage":prompt}}); return {}
    def approve_plan(self,sid): self.approved=True; self.activities.append({"name":f"sessions/{sid}/activities/a1","planApproved":{"planId":"plan-1"}}); return {}

class GatewayTests(unittest.TestCase):
    def test_valid_read(self): self.assertEqual(normalize_request(dict(BASE))["operation_kind"],"READ")
    def test_unknown_key_fails(self): raw=dict(BASE,shell="rm -rf /"); self.assertRaises(ValidationError,normalize_request,raw)
    def test_schema_version_fails_closed(self): self.assertRaises(ValidationError,normalize_request,dict(BASE,schema_version="2"))
    def test_require_plan_approval_requires_boolean(self):
        raw=dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="a"*40,prompt="x",authority_event="A1",require_plan_approval="false")
        self.assertRaises(ValidationError,normalize_request,raw)
    def test_create_session_cannot_disable_plan_approval(self):
        raw=dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="a"*40,prompt="x",authority_event="A1",require_plan_approval=False)
        self.assertRaises(ValidationError,normalize_request,raw)
    def test_wrong_repository_fails(self): self.assertRaises(ValidationError,normalize_request,dict(BASE,repository="other/repo"))
    def test_wrong_controller_fails(self): self.assertRaises(ValidationError,normalize_request,dict(BASE,controller_id="OTHER"))
    def test_invalid_sha_fails(self): self.assertRaises(ValidationError,normalize_request,dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="abc",prompt="x",authority_event="A1"))
    def test_mutation_requires_authority(self): self.assertRaises(ValidationError,normalize_request,dict(BASE,action="send_message",write_domain="automation/core",session_id="1",prompt="x",expected_session_state="RUNNING",expected_session_update_time="t"))
    def test_reconcile_requires_target_identity(self): self.assertRaises(ValidationError,normalize_request,dict(BASE,action="reconcile_send_message",write_domain="automation/core",session_id="1",authority_event="A1"))
    def test_reconcile_approve_requires_plan_id(self):
        raw=dict(BASE,action="reconcile_approve_plan",write_domain="automation/core",session_id="1",authority_event="A1",target_request_id="r0",target_intent_identity="f"*64)
        self.assertRaises(ValidationError,normalize_request,raw)
    def test_same_write_domain_same_effect(self):
        a=normalize_request(dict(BASE,write_domain="automation/core")); b=normalize_request(dict(BASE,request_id="req-2",logical_task_id="task-2",write_domain="automation/core")); self.assertEqual(a["effect_key"],b["effect_key"])
    def test_redaction(self): self.assertNotIn("secret123",json.dumps(redact({"JULES_API_KEY":"secret123","x":"authorization: bearer secret123"})))
    def test_mutation_default_off(self):
        with mock.patch.dict(os.environ,{},clear=True): self.assertFalse(mutation_enabled())
    def test_idempotency_changed_intent_fails_closed(self):
        n=normalize_request(dict(BASE)); other=f"rp04-auto-request-{n['request_key']}-"+("f"*64)
        with self.assertRaises(IdempotencyConflict): check_idempotency(n,FakeGitHub(names=[other]))
    def test_create_session_exact_sha_precondition(self):
        n=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="automation/x",expected_sha="a"*40,prompt="do x",authority_event="AUTH1")); self.assertEqual(collect_mutation_preconditions(n,FakeJules(),FakeGitHub())["remote_sha"],"a"*40)
    def test_create_session_stale_sha_fails(self):
        n=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="automation/x",expected_sha="a"*40,prompt="do x",authority_event="AUTH1"))
        with self.assertRaises(PreconditionFailed): collect_mutation_preconditions(n,FakeJules(),FakeGitHub(sha="b"*40))
    def test_correlation_is_stable_and_target_derivable(self):
        n=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="a"*40,prompt="x",authority_event="A1"))
        r=normalize_request(dict(BASE,request_id="recon-1",action="reconcile_create_session",write_domain="automation/core",authority_event="A1",target_request_id=n["request_id"],target_intent_identity=n["intent_identity"]))
        self.assertEqual(correlation_marker(n),target_correlation_marker(r))
    def test_create_session_effect_specific_readback(self):
        n=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="a"*40,prompt="x",authority_event="A1")); j=FakeJules(); pre=collect_mutation_preconditions(n,j,FakeGitHub()); result=execute_single_mutation(n,j,pre); rb=provider_post_readback(n,result,j); self.assertEqual(rb["classification"],"APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED"); self.assertIn(correlation_marker(n),j.last_create["title"])
    def test_send_message_effect_specific_readback(self):
        n=normalize_request(dict(BASE,action="send_message",write_domain="automation/core",session_id="7",prompt="hello",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z")); j=FakeJules(); pre=collect_mutation_preconditions(n,j,FakeGitHub()); result=execute_single_mutation(n,j,pre); rb=provider_post_readback(n,result,j); self.assertEqual(rb["classification"],"APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED"); self.assertIn(correlation_marker(n),j.last_message)
    def test_send_message_without_effect_does_not_pass(self):
        n=normalize_request(dict(BASE,action="send_message",write_domain="automation/core",session_id="7",prompt="hello",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z")); j=FakeJules(); rb=provider_post_readback(n,{},j); self.assertNotEqual(rb["classification"],"APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED"); self.assertTrue(rb["reconciliation_required"])
    def test_approve_plan_effect_specific_readback(self):
        j=FakeJules(); plan={"id":"plan-1","steps":[{"title":"x"}]}; j.activities=[{"name":"sessions/7/activities/p1","planGenerated":{"plan":plan}}]
        n=normalize_request(dict(BASE,action="approve_plan",write_domain="automation/core",session_id="7",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z",expected_plan_activity="sessions/7/activities/p1",expected_plan_id="plan-1",expected_plan_digest=digest(plan))); pre=collect_mutation_preconditions(n,j,FakeGitHub()); result=execute_single_mutation(n,j,pre); rb=provider_post_readback(n,result,j); self.assertEqual(rb["classification"],"APPLIED_RESPONSE_RECEIVED_READBACK_CAPTURED")
    def test_reconcile_create_session_applied(self):
        target=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="a"*40,prompt="x",authority_event="A1")); j=FakeJules(); j.sessions=[{"name":"sessions/99","id":"99","state":"QUEUED","updateTime":"t","title":correlated_title(target)}]
        r=normalize_request(dict(BASE,request_id="recon-1",action="reconcile_create_session",write_domain="automation/core",authority_event="A1",target_request_id=target["request_id"],target_intent_identity=target["intent_identity"])); self.assertEqual(reconcile_provider_effect(r,j)["classification"],"APPLIED")
    def test_reconcile_create_session_absent_stays_unknown(self):
        target=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="a"*40,prompt="x",authority_event="A1")); r=normalize_request(dict(BASE,request_id="recon-1",action="reconcile_create_session",write_domain="automation/core",authority_event="A1",target_request_id=target["request_id"],target_intent_identity=target["intent_identity"])); self.assertEqual(reconcile_provider_effect(r,FakeJules())["classification"],"UNKNOWN_PRIOR_WRITE_OUTCOME")
    def test_reconcile_send_message_applied(self):
        target=normalize_request(dict(BASE,action="send_message",write_domain="automation/core",session_id="7",prompt="hello",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z")); j=FakeJules(); j.activities=[{"name":"sessions/7/activities/m1","userMessaged":{"userMessage":correlated_message(target)}}]
        r=normalize_request(dict(BASE,request_id="recon-1",action="reconcile_send_message",write_domain="automation/core",session_id="7",authority_event="A1",target_request_id=target["request_id"],target_intent_identity=target["intent_identity"])); self.assertEqual(reconcile_provider_effect(r,j)["classification"],"APPLIED")
    def test_reconcile_duplicate_send_detected(self):
        target=normalize_request(dict(BASE,action="send_message",write_domain="automation/core",session_id="7",prompt="hello",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z")); msg=correlated_message(target); j=FakeJules(); j.activities=[{"name":"a","userMessaged":{"userMessage":msg}},{"name":"b","userMessaged":{"userMessage":msg}}]
        r=normalize_request(dict(BASE,request_id="recon-1",action="reconcile_send_message",write_domain="automation/core",session_id="7",authority_event="A1",target_request_id=target["request_id"],target_intent_identity=target["intent_identity"])); self.assertEqual(reconcile_provider_effect(r,j)["classification"],"APPLIED_DUPLICATE_EFFECT_DETECTED")
    def test_create_preflight_rejects_existing_provider_effect_after_artifact_expiry(self):
        n=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="a"*40,prompt="x",authority_event="A1")); j=FakeJules(); j.sessions=[{"name":"sessions/99","id":"99","title":correlated_title(n)}]
        with self.assertRaises(IdempotencyConflict): collect_mutation_preconditions(n,j,FakeGitHub(names=[]))
    def test_send_preflight_rejects_existing_provider_effect_after_artifact_expiry(self):
        n=normalize_request(dict(BASE,action="send_message",write_domain="automation/core",session_id="7",prompt="hello",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z")); j=FakeJules(); j.activities=[{"name":"m","userMessaged":{"userMessage":correlated_message(n)}}]
        with self.assertRaises(IdempotencyConflict): collect_mutation_preconditions(n,j,FakeGitHub(names=[]))
    def test_approve_preflight_rejects_existing_plan_approval_effect(self):
        plan={"id":"plan-1","steps":[{"title":"x"}]}; n=normalize_request(dict(BASE,action="approve_plan",write_domain="automation/core",session_id="7",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z",expected_plan_activity="sessions/7/activities/p1",expected_plan_id="plan-1",expected_plan_digest=digest(plan))); j=FakeJules(); j.activities=[{"name":"a","planApproved":{"planId":"plan-1"}}]
        with self.assertRaises(IdempotencyConflict): collect_mutation_preconditions(n,j,FakeGitHub(names=[]))
    def test_write_intent_has_effect_proof_without_prompt_plaintext(self):
        n=normalize_request(dict(BASE,action="send_message",write_domain="automation/core",session_id="7",prompt="sensitive task text",authority_event="A1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z")); intent=build_write_intent(n,{"x":1}); self.assertNotIn("sensitive task text",json.dumps(intent)); self.assertIn("message_digest",intent["effect_proof"])

if __name__=="__main__": unittest.main()
