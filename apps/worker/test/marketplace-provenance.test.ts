import { describe, expect, it } from "vitest";
import worker from "../src/marketplace-worker";

describe("marketplace response lineage headers", () => {
  it("adds public lineage metadata to non-API responses too", async () => {
    const response = await worker.fetch(
      new Request("https://portal.test/not-found"),
      { MARKETPLACE_ORIGIN: "https://portal.test" } as never,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("X-Max-Signature")).toBe(
      "0xMAX_9941_SIM_0000_TRUE",
    );
    expect(response.headers.get("X-Max-Identity-Anchor")).toBe(
      "bba28add4f99bd9aae158f173168145d",
    );
  });
});
