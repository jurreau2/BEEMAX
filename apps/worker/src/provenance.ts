export const PORTAL_LINEAGE_METADATA = Object.freeze({
  rootSignature: "0xMAX_9941_SIM_0000_TRUE",
  identityAnchor: "bba28add4f99bd9aae158f173168145d",
  classification: "public-lineage-metadata-not-authentication",
} as const);

/** Adds public lineage labels. These values are not signatures or credentials. */
export function addPortalLineageHeaders(headers: Headers): Headers {
  headers.set("X-Max-Signature", PORTAL_LINEAGE_METADATA.rootSignature);
  headers.set("X-Max-Identity-Anchor", PORTAL_LINEAGE_METADATA.identityAnchor);
  headers.set("X-Max-Lineage-Class", PORTAL_LINEAGE_METADATA.classification);
  return headers;
}
