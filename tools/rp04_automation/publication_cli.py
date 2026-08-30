from __future__ import annotations
import argparse, json, os
from pathlib import Path
from .clients import GitHubClient, JulesClient
from .common import EvidenceWriter, utc_now
from .publication import normalize_publication_request, verify_publication


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("request")
    p.add_argument("--output-dir", required=True)
    a = p.parse_args(argv)
    evidence = EvidenceWriter(Path(a.output_dir))
    try:
        raw = json.loads(Path(a.request).read_text(encoding="utf-8"))
        n = normalize_publication_request(raw)
        evidence.write("normalized_publication_request.json", n)
        result = verify_publication(n, JulesClient(os.getenv("JULES_API_KEY", "")), GitHubClient(os.getenv("GITHUB_TOKEN", "")))
        patch = result.pop("patch")
        evidence.write("publication_verification.json", {**result, "timestamp": utc_now()})
        (Path(a.output_dir) / "reviewed.patch").write_text(patch, encoding="utf-8")
        return 0
    except Exception as exc:
        evidence.write("publication_verification.json", {"classification": "FAIL", "error": str(exc), "mutation_performed": False, "timestamp": utc_now()})
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
