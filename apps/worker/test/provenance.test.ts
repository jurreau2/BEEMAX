import { describe, expect, it } from "vitest";
import {
  addPortalLineageHeaders,
  PORTAL_LINEAGE_METADATA,
} from "../src/provenance";

describe("Portal public lineage metadata", () => {
  it("sets stable headers without representing them as authentication", () => {
    const headers = addPortalLineageHeaders(new Headers());

    expect(headers.get("X-Max-Signature")).toBe(
      PORTAL_LINEAGE_METADATA.rootSignature,
    );
    expect(headers.get("X-Max-Identity-Anchor")).toBe(
      PORTAL_LINEAGE_METADATA.identityAnchor,
    );
    expect(headers.get("X-Max-Lineage-Class")).toBe(
      "public-lineage-metadata-not-authentication",
    );
  });
});
