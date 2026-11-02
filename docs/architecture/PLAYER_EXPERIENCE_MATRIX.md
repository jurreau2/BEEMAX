# Player Experience Matrix

Status: Architecture authority for player-facing journeys; implementation status must be evidenced by tests and operational telemetry.

| Journey | Inputs | Required behavior | Lineage and safeguards | Acceptance signal |
| --- | --- | --- | --- | --- |
| Enter Portal-OS1 | identity and client capabilities | load the shell without requiring a multi-gigabyte download; degrade gracefully when offline | identity continuity; disclose unavailable services | shell remains usable and state is explicit |
| Resume a world | identity, world/model version, cached state | restore locally available state and identify stale or unavailable remote state | provenance includes identity and source revision | replay reproduces the recorded state |
| Traverse a simulation | registered model, versioned inputs, dependencies | fixed 1Hz logical ticks; deterministic transition; report confidence | retain inputs, outputs, dependencies, version, and replay evidence | repeated replay has D1 divergence `0` |
| Connect a provider | provider config and scoped secret | expose explicit provider state; never silently treat missing credentials as healthy | audit state transitions without recording secret values | configured/unconfigured and reachable/unreachable cases are tested |
| Recover from failure | failure classification and recovery policy | preserve local state, surface actionable alert, follow documented rollback/fallback | record approval, event, and outcome | recovery and audit export can be validated |

## Client cache and cost claims

Local-first caching is an optimization, not a guarantee of zero buffering, ISP immunity, or zero operating cost. Cache only versioned, non-sensitive data under explicit retention and invalidation rules. Do not cache credentials or governance secrets. Cloudflare usage, storage, egress, and third-party provider charges remain subject to the selected plan and workload.
