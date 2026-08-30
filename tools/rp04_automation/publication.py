from __future__ import annotations

import re
import shlex
from pathlib import PurePosixPath
from typing import Any

from .common import (
    BRANCH_RE,
    DIGEST_RE,
    ID_RE,
    PROJECT_ID,
    REPOSITORY,
    SESSION_RE,
    SHA_RE,
    PreconditionFailed,
    ValidationError,
    digest,
)
from .safety import find_rp04_source

PUBLICATION_ACTION = "verify_publication"


def _id(name: str, value: Any) -> str:
    text = str(value or "").strip()
    if not ID_RE.fullmatch(text):
        raise ValidationError(f"invalid_{name}")
    return text


def _sha(name: str, value: Any) -> str:
    text = str(value or "").strip().lower()
    if not SHA_RE.fullmatch(text):
        raise ValidationError(f"invalid_{name}")
    return text


def _digest(name: str, value: Any) -> str:
    text = str(value or "").strip().lower()
    if not DIGEST_RE.fullmatch(text):
        raise ValidationError(f"invalid_{name}")
    return text


def _branch(name: str, value: Any) -> str:
    text = str(value or "").strip()
    if not BRANCH_RE.fullmatch(text):
        raise ValidationError(f"invalid_{name}")
    return text


def _clean_path(path: str) -> str:
    text = path.strip()
    if text.startswith("a/") or text.startswith("b/"):
        text = text[2:]
    if not text or text.startswith("/") or "\\" in text or "\x00" in text:
        raise ValidationError("unsafe_patch_path")
    parts = PurePosixPath(text).parts
    if not parts or any(part in {"", ".", ".."} for part in parts):
        raise ValidationError("unsafe_patch_path")
    return "/".join(parts)


def normalize_allowed_rule(rule: str) -> str:
    text = str(rule or "").strip()
    prefix = text.endswith("/**")
    core = text[:-3] if prefix else text
    core = _clean_path(core.rstrip("/"))
    if "*" in core or "?" in core or "[" in core or "]" in core:
        raise ValidationError("unsupported_allowed_path_pattern")
    return core + "/**" if prefix else core


def allowed_paths_digest(rules: list[str]) -> str:
    return digest(sorted(set(normalize_allowed_rule(rule) for rule in rules)))


def _rule_matches(path: str, rule: str) -> bool:
    if rule.endswith("/**"):
        prefix = rule[:-3].rstrip("/")
        return path == prefix or path.startswith(prefix + "/")
    return path == rule


def extract_patch_paths(patch: str) -> list[str]:
    if not isinstance(patch, str) or not patch.strip():
        raise ValidationError("empty_git_patch")
    if "GIT binary patch" in patch or re.search(r"^Binary files .* differ$", patch, flags=re.MULTILINE):
        raise ValidationError("binary_patch_not_allowed")
    if re.search(r"^(?:(?:old|new|deleted) file mode) (?:120000|160000)$", patch, flags=re.MULTILINE):
        raise ValidationError("symlink_or_submodule_patch_not_allowed")
    paths: set[str] = set()
    for line in patch.splitlines():
        if not line.startswith("diff --git "):
            continue
        try:
            tokens = shlex.split(line)
        except ValueError as exc:
            raise ValidationError("malformed_diff_header") from exc
        if len(tokens) != 4 or tokens[:2] != ["diff", "--git"]:
            raise ValidationError("malformed_diff_header")
        left, right = _clean_path(tokens[2]), _clean_path(tokens[3])
        paths.add(left)
        paths.add(right)
    if not paths:
        raise ValidationError("patch_has_no_diff_headers")
    return sorted(paths)


def normalize_publication_request(raw: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise ValidationError("request_must_be_object")
    allowed = {
        "schema_version", "request_id", "project_id", "controller_id", "lane", "logical_task_id",
        "action", "repository", "session_id", "expected_session_state", "expected_session_update_time",
        "expected_change_activity", "starting_branch", "expected_base_sha", "expected_patch_digest",
        "allowed_paths", "expected_allowed_paths_digest", "target_branch", "expected_target_sha",
        "authority_ref", "authority_event",
    }
    unknown = sorted(set(raw) - allowed)
    if unknown:
        raise ValidationError("unknown_keys:" + ",".join(unknown))
    if str(raw.get("schema_version") or "") != "1":
        raise ValidationError("unsupported_schema_version")
    if str(raw.get("action") or "") != PUBLICATION_ACTION:
        raise ValidationError("unsupported_publication_action")
    project_id = str(raw.get("project_id") or "")
    repository = str(raw.get("repository") or "")
    if project_id != PROJECT_ID or repository != REPOSITORY:
        raise ValidationError("project_or_repository_mismatch")
    controller_id = _id("controller_id", raw.get("controller_id"))
    lane = _id("lane", raw.get("lane"))
    if controller_id != "CENTRAL" or lane != "AUTOMATION":
        raise ValidationError("controller_or_lane_not_authorized_by_schema")
    session_id = str(raw.get("session_id") or "").strip()
    if not SESSION_RE.fullmatch(session_id):
        raise ValidationError("invalid_session_id")
    state = str(raw.get("expected_session_state") or "").strip()
    if state != "COMPLETED":
        raise ValidationError("publication_requires_completed_session")
    update_time = str(raw.get("expected_session_update_time") or "").strip()
    activity = str(raw.get("expected_change_activity") or "").strip()
    if not update_time or not activity:
        raise ValidationError("publication_requires_exact_session_and_activity_identity")
    rules_raw = raw.get("allowed_paths")
    if not isinstance(rules_raw, list) or not rules_raw or not all(isinstance(v, str) for v in rules_raw):
        raise ValidationError("allowed_paths_must_be_nonempty_string_list")
    rules = sorted(set(normalize_allowed_rule(v) for v in rules_raw))
    expected_rules_digest = _digest("expected_allowed_paths_digest", raw.get("expected_allowed_paths_digest"))
    if allowed_paths_digest(rules) != expected_rules_digest:
        raise ValidationError("allowed_paths_digest_mismatch")
    starting_branch = _branch("starting_branch", raw.get("starting_branch"))
    target_branch = _branch("target_branch", raw.get("target_branch"))
    if target_branch == "main" or target_branch == starting_branch:
        raise ValidationError("target_branch_must_be_isolated")
    if not (raw.get("authority_ref") or raw.get("authority_event")):
        raise ValidationError("publication_requires_authority_reference")
    out = {
        "schema_version": "1",
        "request_id": _id("request_id", raw.get("request_id")),
        "project_id": PROJECT_ID,
        "controller_id": controller_id,
        "lane": lane,
        "logical_task_id": _id("logical_task_id", raw.get("logical_task_id")),
        "action": PUBLICATION_ACTION,
        "repository": REPOSITORY,
        "session_id": session_id,
        "expected_session_state": state,
        "expected_session_update_time": update_time,
        "expected_change_activity": activity,
        "starting_branch": starting_branch,
        "expected_base_sha": _sha("expected_base_sha", raw.get("expected_base_sha")),
        "expected_patch_digest": _digest("expected_patch_digest", raw.get("expected_patch_digest")),
        "allowed_paths": rules,
        "expected_allowed_paths_digest": expected_rules_digest,
        "target_branch": target_branch,
        "authority_ref": str(raw.get("authority_ref") or "").strip() or None,
        "authority_event": str(raw.get("authority_event") or "").strip() or None,
    }
    if raw.get("expected_target_sha") not in (None, ""):
        out["expected_target_sha"] = _sha("expected_target_sha", raw.get("expected_target_sha"))
    out["publication_identity"] = digest({k: v for k, v in out.items() if k != "publication_identity"})
    return out


def _find_exact_changeset(activities: list[dict[str, Any]], activity_name: str, source: str) -> dict[str, Any]:
    matches = [a for a in activities if str(a.get("name") or "") == activity_name]
    if len(matches) != 1:
        raise PreconditionFailed("exact_change_activity_not_found")
    changes: list[dict[str, Any]] = []
    for artifact in matches[0].get("artifacts") or []:
        change = artifact.get("changeSet")
        if isinstance(change, dict) and str(change.get("source") or "") == source:
            changes.append(change)
    if len(changes) != 1:
        raise PreconditionFailed("exact_changeset_not_unique")
    return changes[0]


def verify_publication(n: dict[str, Any], jules: Any, github: Any) -> dict[str, Any]:
    session = jules.get_session(n["session_id"])
    if str(session.get("state") or "") != n["expected_session_state"]:
        raise PreconditionFailed("stale_session_state")
    if str(session.get("updateTime") or "") != n["expected_session_update_time"]:
        raise PreconditionFailed("stale_session_update_time")
    source = find_rp04_source(jules.list_sources())
    if not source:
        raise PreconditionFailed("rp04_jules_source_not_connected")
    activities = jules.list_activities(n["session_id"]).get("activities") or []
    change = _find_exact_changeset(activities, n["expected_change_activity"], source)
    git_patch = change.get("gitPatch") or {}
    base_sha = str(git_patch.get("baseCommitId") or "").strip().lower()
    if not SHA_RE.fullmatch(base_sha):
        raise PreconditionFailed("provider_base_commit_not_full_sha")
    if base_sha != n["expected_base_sha"]:
        raise PreconditionFailed("provider_base_sha_mismatch")
    remote_base = github.branch_sha(n["starting_branch"])
    if remote_base != n["expected_base_sha"]:
        raise PreconditionFailed("remote_base_sha_moved")
    patch = str(git_patch.get("unidiffPatch") or "")
    patch_digest = digest(patch)
    if patch_digest != n["expected_patch_digest"]:
        raise PreconditionFailed("patch_digest_mismatch")
    paths = extract_patch_paths(patch)
    disallowed = [p for p in paths if not any(_rule_matches(p, rule) for rule in n["allowed_paths"])]
    if disallowed:
        raise PreconditionFailed("disallowed_patch_paths:" + ",".join(disallowed))
    target_sha = github.branch_sha_optional(n["target_branch"])
    expected_target = n.get("expected_target_sha")
    if expected_target is None and target_sha is not None:
        raise PreconditionFailed("target_branch_already_exists")
    if expected_target is not None and target_sha != expected_target:
        raise PreconditionFailed("target_branch_sha_mismatch")
    return {
        "classification": "PASS_DRY_RUN",
        "publication_identity": n["publication_identity"],
        "session_id": n["session_id"],
        "session_state": session.get("state"),
        "session_update_time": session.get("updateTime"),
        "change_activity": n["expected_change_activity"],
        "source": source,
        "base_sha": base_sha,
        "patch_digest": patch_digest,
        "allowed_paths_digest": n["expected_allowed_paths_digest"],
        "changed_paths": paths,
        "target_branch": n["target_branch"],
        "target_prestate_sha": target_sha,
        "mutation_performed": False,
        "patch": patch,
    }
