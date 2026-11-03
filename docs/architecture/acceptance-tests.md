## Edge runtime and acceptance coverage

- `GET /healthz` reports adapter binding states, simulation model/version, logical tick interval, and replay validation without credentials or user data. It is an operational wiring check, not a production-readiness attestation.
- Adapter registry tests cover duplicate rejection, explicit replacement, identity lineage metadata, and the complete lifecycle-state type.
- Deterministic simulation acceptance covers versioned model, inputs, outputs, dependencies, confidence, provenance export, replay, and D1 divergence of zero.
- Audit-export acceptance requires provenance and status fields and rejects secret-bearing records; production export endpoints must apply authorization, redaction, retention, and audit controls.
- A Worker platform does not guarantee a continuously running 1Hz loop; the host must schedule logical ticks explicitly.
- Worker and marketplace response tests verify that public lineage headers carry the configured fixed metadata labels, and must not treat them as cryptographic proof or authentication.
- Static asset metadata is not covered unless the Pages/CDN build and publishing path explicitly injects and tests it.
- Cost and payment acceptance must validate observed Cloudflare usage and configured settlement terms; runtime labels cannot guarantee zero cost or zero fees.

See `edge-provenance-and-commerce.md` for the metadata, static asset, cost, and commerce boundaries.
