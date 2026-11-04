# Public Marketplace storefront deployment

This deploys the separate customer-facing storefront in `apps/marketplace` and its public API Worker. It does not replace the Portal OS1 Pages project or its private Worker.

## Cloudflare setup

1. Confirm the Cloudflare account has the `max.games` zone and that the configured D1 database is the intended production database. The marketplace shares D1 with the Portal Worker; do not create a replacement database or run demo seed data remotely.
2. In Cloudflare Pages, create a project named **`max-games`** connected to this repository. Configure:
   - Root directory: `/` (repository root)
   - Build command: `npm ci && npm run build:marketplace`
   - Build output directory: `apps/marketplace/dist`
   - Node.js version: `22.12` or later
3. Attach the custom domain **`max.games`** to the Pages project. The Worker route in `wrangler.marketplace.toml` sends `max.games/api/*` to the marketplace API; the rest of the host serves the Pages storefront. The same origin is important for customer session cookies and CSRF protection.
4. Review the `[vars]` value `MARKETPLACE_ORIGIN` and Worker route in `wrangler.marketplace.toml`; both must exactly match the storefront's production origin and the Cloudflare zone. If a different domain is chosen, update both before deploying. Configure preview origins separately rather than weakening the production origin check.
5. Add the trusted `CUSTOMER_IDENTITY`, `PAYMENTS`, and `DOWNLOADS` Worker service bindings once the corresponding adapters are implemented and deployed. Do not put credentials in Pages build variables or browser code.
6. Apply any outstanding D1 migrations before deploying the Worker. Migration files are shared with the Portal Worker; Wrangler applies only pending migrations:

   ```sh
   npx wrangler d1 migrations apply DB --remote
   ```

## Validate and deploy

Run checks before release:

```sh
npm ci
npm run typecheck
npm test
npm run build:marketplace
npx wrangler deploy --dry-run --config wrangler.marketplace.toml
```

Then deploy the API and storefront:

```sh
npm run deploy:marketplace:worker
npm run deploy:marketplace:pages
```

Or configure the Pages project to build from Git on each push and deploy the Worker explicitly after reviewing changes. The Pages project build command is intentionally storefront-only; the root `npm run build` also builds the Portal Pages app.

## Production readiness limits

The public catalog can display verified releases already projected into the marketplace tables. Empty catalog data is expected until a real release is published; no production seed or invented listings are included. Customer sign-in, paid checkout, and downloads will remain unavailable until trusted identity, payment, and download bindings are configured. Complete the documented moderation, rate-limiting, payment-provider and artifact-delivery operational checks before enabling unrestricted public commerce. Deployment scripts do not deploy these third-party adapters or perform the deployment automatically.
