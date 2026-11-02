import { AdapterRegistry, SOVEREIGN_IDENTITY_ANCHOR } from "../../../max-core/adapters/registry.js";
import { SimulationEngine } from "../../../max-core/simulation/engine.js";
import type { Env } from "./types";

const identityAnchor = SOVEREIGN_IDENTITY_ANCHOR;

/** Assemble request-scoped bindings so health reflects the actual Worker environment. */
export function createEdgeRuntime(env: Env) {
  const adapters = new AdapterRegistry();
  adapters.register({ kind: "storage", id: "d1", identityAnchor, state: env.DB ? "CONNECTED" : "UNCONFIGURED", adapter: env.DB });
  adapters.register({ kind: "transport", id: "worker-fetch", identityAnchor, state: "CONNECTED", adapter: fetch });
  adapters.register({ kind: "telemetry", id: "worker-console", identityAnchor, state: "CONNECTED", adapter: console });
  const simulation = new SimulationEngine({
    id: "portal-edge-health",
    version: "1.0.0",
    initial: { checks: 0 },
    dependencies: ["worker-runtime"],
    confidence: 1,
    step: (state) => ({ checks: state.checks + 1 }),
  });
  return { adapters, simulation };
}
