# RP04 Automation Gateway — Drive Contract

Drive remains the sole governed owner for RP04 current state, authority, decisions, gates, accepted evidence, and Control Events. GitHub automation must not create a second Current State.

Preferred contract: Controller reads Drive → dispatches a bounded public-safe request → gateway returns technical evidence → Controller reviews → Controller writes Drive only when a meaningful Control Event occurs.

Instruction references may use opaque `drive:<file_id>` plus a SHA-256 digest of exact governed bytes. Direct GitHub Actions-to-Drive credentials are not part of this foundation and require a separate security decision, least privilege, rotation procedure, and exfiltration threat model.
