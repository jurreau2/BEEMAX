# Edge Runtime Wiring

`apps/worker/src/runtime.ts` assembles request-scoped transport, D1 storage, telemetry, and a deterministic simulation engine through MAX-CORE's `AdapterRegistry`. `/healthz` provides an unauthenticated, non-secret health summary. It reports configuration/runtime wiring, not a provider reachability probe or production readiness attestation.

`SimulationEngine` provides deterministic logical 1Hz steps and provenance export. Cloudflare Worker requests and scheduled events do not guarantee a one-second wall-clock scheduler. A host must explicitly invoke `advance()` at the desired cadence; this implementation does not claim that a continuously running 1Hz loop is active.

The runtime health payload intentionally avoids model credentials, user data, and audit contents. Audit export authorization, retention, backup verification, monitoring, and alert delivery remain governed by the deployment readiness checklist. No claim of `$0.00/month`, zero buffering, or immunity to ISP/provider outages is made; costs and availability depend on workload and deployment configuration.

## Validation

- `npm run test -w max-core` exercises registration, explicit adapter state, deterministic inputs, provenance, confidence, and replay divergence.
- Worker health checks must confirm configured bindings and expose no secret values.
- Audit export acceptance must verify required lineage fields and reject secret-bearing records before production use.
