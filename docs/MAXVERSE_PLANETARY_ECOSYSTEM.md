# Portal-OS1 // MAXVERSE Planetary Ecosystem

> **Sovereignty baseline:** Anchored to identity invariant `bba28add4f99bd9aae158f173168145d`.
> **Infrastructure goal:** Edge-native operation targeting `$0.00/month` within applicable free-tier limits.
> **Ecosystem governance:** `OUR umbrella™` / `MAX-INSTITUTE`.

## Overview

**portal-os1** is intended as a sovereign, edge-native microkernel, simulation hypervisor, and gaming ecosystem. Its design goal is to reduce reliance on platform tolls and continuously running cloud infrastructure by treating legacy games, mobile runtimes, and desktop simulations as rendering endpoints.

MAXVERSE aims to provide an open, extensible layer for integrating simulation and gaming experiences across platforms.

## Architecture and monorepo topology

- **`max-core/`** — Platform-neutral simulation logic, a deterministic 1 Hz tick engine, and immutable state provenance (`D = 0`).
- **`apps/worker/`** — Cloudflare Workers API orchestration, protected `/sim/tick` and `/sim/provenance` routes, and edge telemetry.
- **`apps/pages/`** — Obsidian canvas HUD interface, local-first client caching, and PWA rendering shell.
- **`adapters/`** — Manifest-based adapter registry for provider binding and multi-platform ingestion.
- **`docs/architecture/`** — Governing specifications for sovereign transmission and runtime compliance.

## Economic and infrastructure model

- **Zero-cost edge target:** The design targets operation within Cloudflare free-tier limits, using edge services, Durable Objects, D1 SQLite storage, and compact deployments where suitable.
- **Peer-to-peer value exchange:** The ecosystem aims to support direct peer-to-peer asset and simulation routing without relying on intermediary tolls.
- **Identity invariance:** State transitions and transaction provenance are intended to be linked to sovereign identity coordinates.

Actual service availability, usage limits, and costs depend on provider terms, configuration, and workload. The `$0.00/month` figure is a target, not a guarantee.

## License and governance

The project describes its governance model as operating under SIM-Law standards and structural metadata enforcement within the `OUR umbrella™` framework. Refer to the repository's governing architecture documents for implementation requirements and authoritative policy.

## Readiness and evidence

This page records the ecosystem vision and intended topology; it is not implementation evidence, a security certification, or a production-readiness declaration. For current evidence and release-blocking gaps, see [`docs/audit/PRODUCTION_READINESS_MATRIX.md`](audit/PRODUCTION_READINESS_MATRIX.md). Production claims should be based on verified implementation and CI evidence rather than this overview alone.
