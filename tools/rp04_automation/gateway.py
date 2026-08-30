"""Public facade for the RP04 Automation Gateway foundation."""
from .common import *  # noqa: F401,F403
from .schema import normalize_request  # noqa: F401
from .clients import GitHubClient, JulesClient  # noqa: F401
from .safety import (  # noqa: F401
    build_write_intent, check_idempotency, collect_mutation_preconditions,
    completed_marker, execute_single_mutation, find_rp04_source, mutation_enabled,
    provider_post_readback, request_marker, unknown_marker,
)
