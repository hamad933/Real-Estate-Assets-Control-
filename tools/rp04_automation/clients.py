from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Callable

from .common import API_BASE, GITHUB_API_BASE, REPOSITORY, SHA_RE, TRANSIENT_HTTP, GatewayError, UnknownWriteOutcome, ValidationError, canonical_json


class JulesClient:
    def __init__(self, api_key: str, api_base: str = API_BASE, timeout: int = 45, opener: Callable[..., Any] | None = None):
        if not api_key:
            raise ValidationError("JULES_API_KEY_unavailable")
        self.api_key, self.api_base, self.timeout = api_key, api_base.rstrip("/"), timeout
        self._open = opener or urllib.request.urlopen

    def _request(self, method: str, path: str, body: dict[str, Any] | None = None, *, read_retry: bool = False) -> tuple[int, dict[str, Any]]:
        attempts = 3 if read_retry else 1
        for attempt in range(attempts):
            data = None if body is None else canonical_json(body).encode("utf-8")
            req = urllib.request.Request(self.api_base + path, data=data, method=method)
            req.add_header("x-goog-api-key", self.api_key)
            if data is not None:
                req.add_header("Content-Type", "application/json")
            try:
                with self._open(req, timeout=self.timeout) as response:
                    raw = response.read()
                    return response.status, json.loads(raw.decode("utf-8")) if raw else {}
            except urllib.error.HTTPError as exc:
                raw = exc.read().decode("utf-8", errors="replace")
                try:
                    payload = json.loads(raw) if raw else {}
                except json.JSONDecodeError:
                    payload = {"error_text": raw[:2000]}
                if read_retry and exc.code in TRANSIENT_HTTP and attempt + 1 < attempts:
                    time.sleep(2 ** attempt)
                    continue
                return exc.code, payload
            except (TimeoutError, urllib.error.URLError) as exc:
                if read_retry and attempt + 1 < attempts:
                    time.sleep(2 ** attempt)
                    continue
                if method != "GET":
                    raise UnknownWriteOutcome(type(exc).__name__) from exc
                raise GatewayError(type(exc).__name__) from exc
        raise GatewayError("request_failed")

    def _read(self, path: str) -> dict[str, Any]:
        status, payload = self._request("GET", path, read_retry=True)
        if status != 200:
            raise GatewayError(f"provider_read_http_{status}")
        return payload

    def list_sources(self): return self._read("/sources?pageSize=100")
    def list_sessions(self): return self._read("/sessions?pageSize=100")
    def get_session(self, sid): return self._read(f"/sessions/{urllib.parse.quote(sid)}")
    def list_activities(self, sid): return self._read(f"/sessions/{urllib.parse.quote(sid)}/activities?pageSize=100")

    def create_session(self, body):
        status, payload = self._request("POST", "/sessions", body)
        if status not in {200, 201}: raise GatewayError(f"provider_http_{status}")
        return payload

    def send_message(self, sid, prompt):
        status, payload = self._request("POST", f"/sessions/{urllib.parse.quote(sid)}:sendMessage", {"prompt": prompt})
        if status not in {200, 204}: raise GatewayError(f"provider_http_{status}")
        return payload

    def approve_plan(self, sid):
        status, payload = self._request("POST", f"/sessions/{urllib.parse.quote(sid)}:approvePlan", {})
        if status not in {200, 204}: raise GatewayError(f"provider_http_{status}")
        return payload


class GitHubClient:
    def __init__(self, token: str, repository: str = REPOSITORY, api_base: str = GITHUB_API_BASE, timeout: int = 30, opener: Callable[..., Any] | None = None):
        if not token: raise ValidationError("GITHUB_TOKEN_unavailable")
        self.token, self.repository, self.api_base, self.timeout = token, repository, api_base.rstrip("/"), timeout
        self._open = opener or urllib.request.urlopen

    def _get(self, path: str) -> dict[str, Any]:
        req = urllib.request.Request(self.api_base + path, method="GET")
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        try:
            with self._open(req, timeout=self.timeout) as response:
                raw = response.read()
                if response.status != 200: raise GatewayError(f"github_read_http_{response.status}")
                return json.loads(raw.decode("utf-8")) if raw else {}
        except urllib.error.HTTPError as exc:
            raise GatewayError(f"github_read_http_{exc.code}") from exc
        except (TimeoutError, urllib.error.URLError) as exc:
            raise GatewayError(f"github_read_{type(exc).__name__}") from exc

    def branch_sha(self, branch: str) -> str:
        payload = self._get(f"/repos/{self.repository}/branches/{urllib.parse.quote(branch, safe='')}")
        sha = str((payload.get("commit") or {}).get("sha") or "").lower()
        if not SHA_RE.fullmatch(sha): raise GatewayError("github_branch_sha_unavailable")
        return sha

    def artifact_names(self, *, max_pages: int = 5) -> list[str]:
        names: list[str] = []
        for page in range(1, max_pages + 1):
            rows = self._get(f"/repos/{self.repository}/actions/artifacts?per_page=100&page={page}").get("artifacts") or []
            names.extend(str(row.get("name") or "") for row in rows if row.get("name"))
            if len(rows) < 100: return names
        raise GatewayError("idempotency_artifact_inventory_incomplete")
