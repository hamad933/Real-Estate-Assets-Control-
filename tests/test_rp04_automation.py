import json
import os
import unittest
from unittest import mock

from tools.rp04_automation.gateway import (
    IdempotencyConflict, PreconditionFailed, ValidationError, check_idempotency,
    collect_mutation_preconditions, digest, mutation_enabled, normalize_request,
    redact, request_marker,
)

BASE = {"schema_version":"1","request_id":"req-1","project_id":"RP04","controller_id":"CENTRAL","lane":"AUTOMATION","logical_task_id":"task-1","action":"list_sessions","write_domain":"READ_ONLY","repository":"hamad933/Real-Estate-Assets-Control-"}

class FakeGitHub:
    def __init__(self, sha="a"*40, names=None): self.sha, self.names = sha, list(names or [])
    def branch_sha(self, branch): return self.sha
    def artifact_names(self, max_pages=5): return list(self.names)

class FakeJules:
    def list_sources(self): return {"sources":[{"name":"sources/github/rp04","githubRepo":{"owner":"hamad933","repo":"Real-Estate-Assets-Control-"}}]}
    def get_session(self, sid): return {"name":f"sessions/{sid}","state":"AWAITING_PLAN_APPROVAL","updateTime":"2026-08-30T18:00:00Z"}
    def list_activities(self, sid): return {"activities":[{"name":f"sessions/{sid}/activities/p1","createTime":"2026-08-30T17:59:00Z","planGenerated":{"plan":{"id":"plan-1","steps":[{"title":"x"}]}}}]}

class GatewayTests(unittest.TestCase):
    def test_valid_read(self):
        out=normalize_request(dict(BASE)); self.assertEqual(out["operation_kind"],"READ"); self.assertEqual(len(out["intent_identity"]),64)
    def test_unknown_key_fails(self):
        raw=dict(BASE); raw["shell"]="rm -rf /"; self.assertRaises(ValidationError,normalize_request,raw)
    def test_wrong_repository_fails(self):
        raw=dict(BASE); raw["repository"]="other/repo"; self.assertRaises(ValidationError,normalize_request,raw)
    def test_wrong_controller_fails(self):
        raw=dict(BASE); raw["controller_id"]="OTHER"; self.assertRaises(ValidationError,normalize_request,raw)
    def test_invalid_sha_fails(self):
        raw=dict(BASE,action="create_session",write_domain="automation/core",starting_branch="main",expected_sha="abc",prompt="x",authority_event="A1"); self.assertRaises(ValidationError,normalize_request,raw)
    def test_mutation_requires_authority(self):
        raw=dict(BASE,action="send_message",write_domain="automation/core",session_id="1",prompt="x",expected_session_state="RUNNING",expected_session_update_time="t"); self.assertRaises(ValidationError,normalize_request,raw)
    def test_send_requires_exact_session_preconditions(self):
        raw=dict(BASE,action="send_message",write_domain="automation/core",session_id="1",prompt="x",authority_event="A1"); self.assertRaises(ValidationError,normalize_request,raw)
    def test_reconcile_requires_target_identity(self):
        raw=dict(BASE,action="reconcile_send_message",write_domain="automation/core",session_id="1",authority_event="A1"); self.assertRaises(ValidationError,normalize_request,raw)
    def test_changed_request_changes_identity(self):
        a=normalize_request(dict(BASE)); b=normalize_request(dict(BASE,logical_task_id="task-2")); self.assertNotEqual(a["intent_identity"],b["intent_identity"])
    def test_same_request_same_identity(self): self.assertEqual(normalize_request(dict(BASE))["intent_identity"],normalize_request(dict(BASE))["intent_identity"])
    def test_same_write_domain_same_effect_across_tasks(self):
        a=normalize_request(dict(BASE,write_domain="automation/core")); b=normalize_request(dict(BASE,logical_task_id="task-2",request_id="req-2",write_domain="automation/core")); self.assertEqual(a["effect_key"],b["effect_key"])
    def test_independent_write_domains_have_distinct_effects(self):
        a=normalize_request(dict(BASE,write_domain="automation/core")); b=normalize_request(dict(BASE,write_domain="automation/docs")); self.assertNotEqual(a["effect_key"],b["effect_key"])
    def test_redaction(self): self.assertNotIn("secret123",json.dumps(redact({"JULES_API_KEY":"secret123","x":"authorization: bearer secret123"})))
    def test_mutation_default_off(self):
        with mock.patch.dict(os.environ,{},clear=True): self.assertFalse(mutation_enabled())
    def test_mutation_explicit_on(self):
        with mock.patch.dict(os.environ,{"RP04_AUTOMATION_MUTATION_ENABLED":"true"},clear=True): self.assertTrue(mutation_enabled())
    def test_digest_deterministic(self): self.assertEqual(digest({"b":2,"a":1}),digest({"a":1,"b":2}))
    def test_idempotency_changed_intent_fails_closed(self):
        n=normalize_request(dict(BASE)); other=f"rp04-auto-request-{n['request_key']}-"+("f"*64)
        with self.assertRaises(IdempotencyConflict): check_idempotency(n,FakeGitHub(names=[other]))
    def test_idempotency_exact_existing_requires_reconciliation(self):
        n=normalize_request(dict(BASE))
        with self.assertRaises(IdempotencyConflict): check_idempotency(n,FakeGitHub(names=[request_marker(n)]))
    def test_create_session_exact_sha_precondition(self):
        n=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="automation/x",expected_sha="a"*40,prompt="do x",authority_event="AUTH1")); snap=collect_mutation_preconditions(n,FakeJules(),FakeGitHub(sha="a"*40)); self.assertEqual(snap["remote_sha"],"a"*40)
    def test_create_session_stale_sha_fails(self):
        n=normalize_request(dict(BASE,action="create_session",write_domain="automation/core",starting_branch="automation/x",expected_sha="a"*40,prompt="do x",authority_event="AUTH1"))
        with self.assertRaises(PreconditionFailed): collect_mutation_preconditions(n,FakeJules(),FakeGitHub(sha="b"*40))
    def test_approve_plan_exact_plan_preconditions(self):
        plan={"id":"plan-1","steps":[{"title":"x"}]}; n=normalize_request(dict(BASE,action="approve_plan",write_domain="automation/core",session_id="7",authority_event="AUTH1",expected_session_state="AWAITING_PLAN_APPROVAL",expected_session_update_time="2026-08-30T18:00:00Z",expected_plan_activity="sessions/7/activities/p1",expected_plan_id="plan-1",expected_plan_digest=digest(plan))); snap=collect_mutation_preconditions(n,FakeJules(),FakeGitHub()); self.assertEqual(snap["plan"]["plan_id"],"plan-1")

class WorkflowContractTests(unittest.TestCase):
    def _read(self,name):
        from pathlib import Path
        return Path(".github/workflows",name).read_text(encoding="utf-8")
    def test_request_and_effect_serialization_are_distinct(self):
        r=self._read("rp04-automation-mutation.yml"); w=self._read("rp04-automation-mutation-worker.yml"); self.assertIn("rp04-automation-request-${{ needs.normalize.outputs.request_key }}",r); self.assertIn("rp04-automation-effect-${{ inputs.effect_key }}",w); self.assertNotIn("rp04-automation-request-${{ github.run_id }}",r)
    def test_intent_persisted_before_execute_step(self):
        w=self._read("rp04-automation-mutation-worker.yml"); self.assertLess(w.index("Persist durable request WRITE_INTENT"),w.index("Final exact pre-read then exactly one Provider write"))
    def test_mutation_switch_is_fail_closed(self):
        w=self._read("rp04-automation-mutation-worker.yml"); self.assertIn("RP04_AUTOMATION_MUTATION_ENABLED",w); self.assertIn('test "${RP04_AUTOMATION_MUTATION_ENABLED:-}" = "true"',w)
    def test_setup_script_is_non_destructive(self):
        from pathlib import Path
        s=Path("scripts/jules/rp04-jules-setup.sh").read_text(encoding="utf-8"); self.assertIn("npm ci",s); self.assertIn("npm run typecheck",s); self.assertNotIn("npm run db:",s); self.assertNotIn("vercel",s.lower())

if __name__ == "__main__": unittest.main()
