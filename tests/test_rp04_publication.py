import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tools.rp04_automation.common import PreconditionFailed, ValidationError, digest
from tools.rp04_automation.publication import (
    allowed_paths_digest, extract_patch_paths, normalize_publication_request, verify_publication,
)

PATCH = """diff --git a/tools/example.py b/tools/example.py
index 1111111..2222222 100644
--- a/tools/example.py
+++ b/tools/example.py
@@ -1 +1 @@
-old
+new
"""


def request(**overrides):
    rules = ["tools/**"]
    raw = {
        "schema_version": "1", "request_id": "pub-1", "project_id": "RP04", "controller_id": "CENTRAL",
        "lane": "AUTOMATION", "logical_task_id": "task-1", "action": "verify_publication",
        "repository": "hamad933/Real-Estate-Assets-Control-", "session_id": "7",
        "expected_session_state": "COMPLETED", "expected_session_update_time": "2026-08-30T19:00:00Z",
        "expected_change_activity": "sessions/7/activities/change-1", "starting_branch": "main",
        "expected_base_sha": "a" * 40, "expected_patch_digest": digest(PATCH), "allowed_paths": rules,
        "expected_allowed_paths_digest": allowed_paths_digest(rules), "target_branch": "automation/candidate/task-1",
        "authority_event": "RP04-AUTO-1",
    }
    raw.update(overrides)
    return raw


class FakeJules:
    def __init__(self, patch=PATCH, base="a" * 40, state="COMPLETED"):
        self.patch, self.base, self.state = patch, base, state
    def get_session(self, sid): return {"name": f"sessions/{sid}", "state": self.state, "updateTime": "2026-08-30T19:00:00Z"}
    def list_sources(self): return {"sources": [{"name": "sources/rp04", "githubRepo": {"owner": "hamad933", "repo": "Real-Estate-Assets-Control-"}}]}
    def list_activities(self, sid):
        return {"activities": [{"name": f"sessions/{sid}/activities/change-1", "artifacts": [{"changeSet": {"source": "sources/rp04", "gitPatch": {"baseCommitId": self.base, "unidiffPatch": self.patch, "suggestedCommitMessage": "x"}}}]}]}


class FakeGitHub:
    def __init__(self, base="a" * 40, target=None): self.base, self.target = base, target
    def branch_sha(self, branch): return self.base
    def branch_sha_optional(self, branch): return self.target


class PublicationTests(unittest.TestCase):
    def test_valid_dry_run(self):
        n = normalize_publication_request(request())
        out = verify_publication(n, FakeJules(), FakeGitHub())
        self.assertEqual(out["classification"], "PASS_DRY_RUN")
        self.assertFalse(out["mutation_performed"])
        self.assertEqual(out["changed_paths"], ["tools/example.py"])
    def test_unknown_key_rejected(self):
        with self.assertRaises(ValidationError): normalize_publication_request(request(shell="x"))
    def test_main_target_rejected(self):
        with self.assertRaises(ValidationError): normalize_publication_request(request(target_branch="main"))
    def test_allowed_digest_mismatch_rejected(self):
        with self.assertRaises(ValidationError): normalize_publication_request(request(expected_allowed_paths_digest="f" * 64))
    def test_patch_digest_mismatch_rejected(self):
        n = normalize_publication_request(request(expected_patch_digest="f" * 64))
        with self.assertRaises(PreconditionFailed): verify_publication(n, FakeJules(), FakeGitHub())
    def test_disallowed_path_rejected(self):
        bad = PATCH.replace("tools/example.py", "app/page.tsx")
        n = normalize_publication_request(request(expected_patch_digest=digest(bad)))
        with self.assertRaises(PreconditionFailed): verify_publication(n, FakeJules(patch=bad), FakeGitHub())
    def test_binary_patch_rejected(self):
        bad = "diff --git a/tools/x.bin b/tools/x.bin\nGIT binary patch\n"
        with self.assertRaises(ValidationError): extract_patch_paths(bad)
    def test_symlink_patch_rejected(self):
        bad = "diff --git a/tools/link b/tools/link\nnew file mode 120000\n"
        with self.assertRaises(ValidationError): extract_patch_paths(bad)
    def test_existing_target_requires_expected_sha(self):
        n = normalize_publication_request(request())
        with self.assertRaises(PreconditionFailed): verify_publication(n, FakeJules(), FakeGitHub(target="b" * 40))
    def test_expected_target_sha_must_match(self):
        n = normalize_publication_request(request(expected_target_sha="c" * 40))
        with self.assertRaises(PreconditionFailed): verify_publication(n, FakeJules(), FakeGitHub(target="b" * 40))
    def test_provider_base_must_be_full_sha(self):
        n = normalize_publication_request(request())
        with self.assertRaises(PreconditionFailed): verify_publication(n, FakeJules(base="abc123"), FakeGitHub())

if __name__ == "__main__": unittest.main()
