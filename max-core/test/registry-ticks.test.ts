import { describe, expect, it } from "vitest";
import { AdapterRegistry, SOVEREIGN_IDENTITY_ANCHOR } from "../adapters/registry.js";
import { SimulationEngine } from "../simulation/engine.js";

describe("adapter registry public manifest API", () => {
  it("validates the anchor, rejects collisions, and resolves callable adapters", () => {
    const registry = new AdapterRegistry();
    const handler = (value: string) => value.toUpperCase();
    registry.register({ id: "renderer", version: "1.0.0", type: "renderer", identityAnchor: SOVEREIGN_IDENTITY_ANCHOR }, handler);
    expect(registry.resolve<(value: string) => string>("renderer")("hud")).toBe("HUD");
    expect(registry.listManifests()).toEqual([{ id: "renderer", version: "1.0.0", type: "renderer", identityAnchor: SOVEREIGN_IDENTITY_ANCHOR }]);
    expect(() => registry.register({ id: "bad", version: "1", type: "storage", identityAnchor: "wrong" }, handler)).toThrow("identity anchor");
    expect(() => registry.register({ id: "renderer", version: "2", type: "renderer", identityAnchor: SOVEREIGN_IDENTITY_ANCHOR }, handler)).toThrow("collision");
  });
  it("returns detached manifest copies and rejects resolving non-callable registrations", () => {
    const registry = new AdapterRegistry();
    registry.register({ kind: "storage", id: "local", identityAnchor: SOVEREIGN_IDENTITY_ANCHOR, state: "CONNECTED", adapter: {} });
    const manifest = registry.listManifests()[0]!;
    expect(() => registry.resolve("local")).toThrow("no callable handler");
    expect(Object.isFrozen(manifest)).toBe(false);
  });
});

describe("deterministic simulation tick log", () => {
  it("exports isolated replay provenance and stable state fingerprints", () => {
    const engine = new SimulationEngine({ id: "graph-traversal", version: "2", initial: { nodes: 0 }, dependencies: ["graph-v1"], confidence: 1, step: (state, { inputs }) => ({ nodes: state.nodes + Number(inputs.add ?? 1) }) });
    const first = engine.executeTick({ nodes: 4 });
    const originalHash = first.stateHash;
    first.tickId = 20;
    expect(engine.getReplayProvenance()[0]?.tickId).toBe(1);
    expect(engine.executeTick({ nodes: 4 }).stateHash).toBe(originalHash);
    expect(engine.exportProvenance().records).toHaveLength(0);
  });
});
