## Runtime API status and persistence boundaries

The Worker exposes `/healthz` (and `/health`) as a read-only wiring summary. It reports configuration and registered adapter states; it is not a provider reachability probe or production-readiness attestation. `/sim/tick` and `/sim/provenance` are protected by the existing Portal access control. Tick records currently live in Worker isolate memory and can be lost when an isolate is recycled; they are not D1 or Durable Object persistence. Do not rely on them for audit retention or authoritative replay until a durable, access-controlled store is configured.

The simulation engine provides a deterministic logical 1Hz step contract, but neither a fetch request nor a scheduled Worker guarantees a continuously running one-second wall-clock loop. The host must explicitly invoke ticks at the intended cadence.

State fingerprints are stable diagnostic identifiers only, not cryptographic hashes, signatures, or proof of sovereign identity. The public identity anchor is lineage metadata, never an authentication token. Cloudflare plan, usage, D1/DO storage, egress, and third-party services can incur charges; the runtime makes no `$0.00/month` guarantee.
