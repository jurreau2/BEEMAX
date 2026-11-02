## Edge runtime and acceptance coverage

- `GET /healthz` reports adapter binding states, simulation model/version, logical tick interval, and replay validation without credentials or user data. It is an operational wiring check, not a provider reachability or production readiness attestation.
- Adapter registry tests cover duplicate rejection, explicit replacement, identity lineage metadata, and the complete lifecycle-state type.
- Deterministic simulation acceptance covers versioned model, inputs, outputs, dependencies, confidence, provenance export, replay, and D1 divergence of zero.
- Audit-export acceptance requires provenance and status fields and rejects secret-bearing records; production export endpoints must apply authorization, redaction, retention, and audit controls.
- A Worker platform does not guarantee a continuously running 1Hz loop; the host must schedule logical ticks explicitly.
