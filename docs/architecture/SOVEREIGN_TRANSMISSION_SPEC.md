# Sovereign Transmission Specification

Status: Required interface specification. The identity anchor is provenance metadata and must not be interpreted as a secret, signature, or proof of ownership.

## Envelope

A transmission carries a schema version, stable transmission ID, identity anchor, source and destination, creation time, payload, payload schema, dependency/model versions when applicable, and provenance references. Implementations must reject missing required fields and unsupported schema versions before processing.

## Identity and policy

- Preserve the identity anchor `bba28add4f99bd9aae158f173168145d` as lineage metadata where the approved integration requires it.
- Authenticate and authorize using the deployment's real identity mechanism; the public anchor string alone grants no authority.
- Apply adopted policy and approval gates before production actions.
- Redact credentials and sensitive payload fields from logs and audit exports.

## Deterministic replay

Replay records must include versioned inputs, model/runtime version, declared dependencies, outputs, confidence, and provenance. Replays use the same ordered inputs and deterministic model contract. Report divergence explicitly; `D1 = 0` is a validation outcome, not a promise to trust unverified output.

## Failure and recovery

Use explicit states `CONNECTED`, `DEGRADED`, `STALE`, `BLOCKED`, `DISCONNECTED`, and `UNCONFIGURED`. Preserve the source record on rejection, record a safe failure reason, and follow policy-controlled retry, fallback, or rollback procedures. Audit export validation must verify required provenance and status fields while excluding secrets.

## Acceptance criteria

1. Invalid or unsupported envelopes are rejected without side effects.
2. A valid envelope retains identity and lineage across handoff.
3. Replay records include inputs, outputs, dependencies, confidence, version, and provenance.
4. Repeated deterministic replay reports zero divergence; altered inputs or versions are not reported as equivalent.
5. Export validation rejects incomplete or secret-bearing audit records.
