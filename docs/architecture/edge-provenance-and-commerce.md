# Edge provenance and commerce boundaries

The primary Worker entry point remains `apps/worker/src/index.ts`, configured by the repository's existing `wrangler.toml`. The Worker and the separate marketplace Worker attach public lineage labels to their HTTP responses. The health, simulation, and marketplace error payloads also include lineage metadata where those handlers construct JSON responses. These values are descriptive metadata only: `X-Max-Signature` is not a cryptographic signature, and the identity anchor is not an authentication token, signing key, or proof of ownership.

## Static assets

The Worker does not serve the Pages static asset bundle through an Assets binding. Consequently, these Worker response headers do not inject metadata into asset files served directly by Cloudflare Pages or another CDN. Asset metadata must be added by the asset build/publishing path if required; do not imply that current runtime wiring covers that path.

## Cost and monetization

No Worker implementation can guarantee `$0.00/month`: Cloudflare plan limits, requests, D1/Durable Objects, storage, egress, and third-party payment services may incur charges. This change introduces no budget enforcement or cost meter. Marketplace payment behavior remains governed by its configured provider and existing marketplace logic; lineage headers do not establish direct-to-peer settlement, eliminate processor fees, or guarantee zero platform fee extraction. Any such commercial terms require verified payment configuration, contract terms, accounting, and acceptance tests before they can be claimed.

## Verification and release

Use the repository's normal typecheck and test workflows for the Worker. Deploy only through the reviewed release process after deployment readiness, monitoring, backups, audit exports, approval, and rollback requirements are verified. No production deployment is implied by these source changes.
