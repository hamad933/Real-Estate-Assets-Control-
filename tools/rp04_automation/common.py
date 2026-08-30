from __future__ import annotations

import datetime as dt
import hashlib
import json
import re
from pathlib import Path
from typing import Any

PROJECT_ID = "RP04"
REPOSITORY = "hamad933/Real-Estate-Assets-Control-"
API_BASE = "https://jules.googleapis.com/v1alpha"
GITHUB_API_BASE = "https://api.github.com"
ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$")
DOMAIN_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$")
BRANCH_RE = re.compile(r"^(?!/)(?!.*\.\.)(?!.*//)[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$")
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
SESSION_RE = re.compile(r"^[0-9]+$")
DIGEST_RE = re.compile(r"^[0-9a-f]{64}$")
READ_ACTIONS = {"list_sources", "list_sessions", "get_session", "list_activities"}
MUTATION_ACTIONS = {"create_session", "send_message", "approve_plan"}
RECONCILE_ACTIONS = {"reconcile_create_session", "reconcile_send_message", "reconcile_approve_plan"}
ALLOWED_ACTIONS = READ_ACTIONS | MUTATION_ACTIONS | RECONCILE_ACTIONS
TRANSIENT_HTTP = {429, 500, 502, 503, 504}
SECRET_PATTERNS = (
    re.compile(r"(?i)(x-goog-api-key\s*[:=]\s*)\S+"),
    re.compile(r"(?i)(jules_api_key\s*[:=]\s*)\S+"),
    re.compile(r"(?i)(authorization\s*[:=]\s*bearer\s+)\S+"),
)


class GatewayError(RuntimeError):
    pass


class ValidationError(GatewayError):
    pass


class MutationDisabled(GatewayError):
    pass


class IdempotencyConflict(GatewayError):
    pass


class UnknownWriteOutcome(GatewayError):
    pass


class PreconditionFailed(GatewayError):
    pass


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def digest(value: Any) -> str:
    text = value if isinstance(value, str) else canonical_json(value)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: ("[REDACTED]" if "secret" in k.lower() or "api_key" in k.lower() else redact(v)) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v) for v in value]
    if isinstance(value, str):
        out = value
        for pattern in SECRET_PATTERNS:
            out = pattern.sub(r"\1[REDACTED]", out)
        return out
    return value


class EvidenceWriter:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def write(self, name: str, payload: Any) -> Path:
        target = self.output_dir / name
        temp = target.with_suffix(target.suffix + ".tmp")
        temp.write_text(json.dumps(redact(payload), ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        temp.replace(target)
        return target
