# Portal-OS1 Architecture

This directory contains the authoritative architecture and operating documentation for the MAX Institute system. Architecture documentation takes precedence over informal product claims or implementation shortcuts.

## Layer model

MAX Institute (research authority) → USS (shared reality) → MANIFOLD (universe) → ICV (identity) → BEMAX (strategic intelligence) → ICVS (governance and execution) → Portal-OS1 (operating system) → MAX-CORE (platform-neutral foundation).

## Authority and document set

- `PLAYER_EXPERIENCE_MATRIX.md` — player-facing journeys, requirements, safeguards, and acceptance signals.
- `SOVEREIGN_TRANSMISSION_SPEC.md` — identity-linked transmission envelope, validation and replay rules.
- `provider-adapters.md` — production provider interface and lifecycle states.
- `simulation-models.md` — simulation registration, replay, provenance, and confidence.
- `institute-policies.md` — policy registry and approval controls.
- `deployment-readiness.md` — required secrets and production safeguards.
- `acceptance-tests.md` — validation and release gates.

Implementation must preserve provider independence, identity continuity, lineage, deterministic replay, governance approval, measurable confidence, monitoring, recovery, and audit exports. A checklist item or health endpoint is not itself proof of production readiness.
