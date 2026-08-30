import re, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = sorted((ROOT / '.github' / 'workflows').glob('rp04-automation-*.yml'))
APPROVED = {
    'actions/checkout': '3d3c42e5aac5ba805825da76410c181273ba90b1',
    'actions/setup-python': '5fda3b95a4ea91299a34e894583c3862153e4b97',
    'actions/upload-artifact': '043fb46d1a93c77aae656e7c1c64a875d1fc6a0a',
}

class WorkflowSupplyChainTests(unittest.TestCase):
    def test_external_actions_are_full_sha_pinned(self):
        self.assertTrue(WORKFLOWS)
        for path in WORKFLOWS:
            text = path.read_text(encoding='utf-8')
            for action, ref in re.findall(r'uses:\s+(actions/[A-Za-z0-9_.-]+)@([^\s#]+)', text):
                self.assertRegex(ref, r'^[0-9a-f]{40}$', f'{path}: {action} must use a full commit SHA')

    def test_external_action_pins_match_reviewed_release_commits(self):
        for path in WORKFLOWS:
            text = path.read_text(encoding='utf-8')
            for action, ref in re.findall(r'uses:\s+(actions/[A-Za-z0-9_.-]+)@([^\s#]+)', text):
                self.assertIn(action, APPROVED, f'{path}: unreviewed external action {action}')
                self.assertEqual(ref, APPROVED[action], f'{path}: {action} pin drifted from reviewed commit')

if __name__ == '__main__':
    unittest.main()
