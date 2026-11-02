import { describe, expect, it } from "vitest";
import { AdapterRegistry, SOVEREIGN_IDENTITY_ANCHOR } from "../adapters/registry.js";
import { SimulationEngine } from "../simulation/engine.js";

describe("runtime adapter registry", () => {
  it("registers, filters, rejects duplicates, and replaces explicit bindings", () => {
    const registry = new AdapterRegistry();
    registry.register({ kind: "storage", id: "local", identityAnchor: SOVEREIGN_IDENTITY_ANCHOR, state: "CONNECTED", adapter: { ready: true } });
    expect(registry.get<{ready: boolean}>("storage", "local")?.adapter.ready).toBe(true);
    expect(registry.list("storage")).toHaveLength(1);
    expect(() => registry.register({ kind: "storage", id: "local", identityAnchor: SOVEREIGN_IDENTITY_ANCHOR, state: "CONNECTED", adapter: {} })).toThrow("already registered");
    registry.replace({ kind: "storage", id: "local", identityAnchor: SOVEREIGN_IDENTITY_ANCHOR, state: "STALE", adapter: {} });
    expect(registry.get("storage", "local")?.state).toBe("STALE");
  });
});

describe("deterministic 1Hz simulation", () => {
  it("records provenance and replays all inputs with zero D1 divergence", () => {
    const engine = new SimulationEngine({
      id: "graph-traversal", version: "2", initial: { nodes: 0 },
      dependencies: ["graph-v1"], confidence: 0.95,
      step: (state, { inputs }) => ({ nodes: state.nodes + Number(inputs.add ?? 1) }),
    });
    engine.advance({ add: 2 });
    engine.advance({ add: 3 });
    expect(engine.tick).toBe(2);
    expect(engine.snapshot).toEqual({ nodes: 5 });
    expect(engine.exportProvenance()).toMatchObject({
      modelId: "graph-traversal", modelVersion: "2", stepMs: 1000,
      records: [{ provenance: "graph-traversal@2", confidence: 0.95, divergence: 0 }],
    });
    expect(engine.verifyReplay()).toEqual({ valid: true, divergence: 0 });
  });
  it("rejects invalid confidence before model use", () => {
    expect(() => new SimulationEngine({ id: "x", version: "1", initial: 0, dependencies: [], confidence: 2, step: (state) => state })).toThrow("confidence");
  });
});
