# SpecMine Engineering Audit

**Audit date:** 2026-11-18  
**Scope:** Current frontend, Express API, PostgreSQL access, deployment configuration, automated tests, and dependency lockfiles.  
**Data handling:** No production records were changed. Catalog query plans were run read-only.

## Production readiness

SpecMine is **substantially hardened, but not fully release-cleared for a public multi-instance production deployment**. Verified dependency advisories are fixed, TLS verification is enabled for production PostgreSQL connections, API failure handling is covered, and the test/build/lint checks pass. Remaining release concerns are browser-accessible bearer tokens, process-local rate limiting, migration execution without an applied-version ledger, and missing browser/database-backed integration coverage.

## Findings

| ID | Severity | Status | Evidence and impact | Recommended action |
|---|---|---|---|---|
| SEC-01 | High (historical) | Fixed | The former PostgreSQL SSL config used `rejectUnauthorized: false` and could retry a connection without SSL. A network intermediary could impersonate the database or observe traffic. | Require certificate verification for explicitly enabled TLS, support an optional CA certificate, and do not downgrade explicit `PG_SSL=true`. |
| DEP-01 | Critical/High (historical) | Fixed | Live npm audits found vulnerable transitive backend packages (`proxy-addr`, `body-parser`, `path-to-regexp`, `qs`), plus frontend/root dependency advisories. | Update compatible lockfile resolutions. Removed vulnerable dev-only `nodemon` and use Node's built-in watch mode. Live audits now report zero advisories in all three dependency trees. |
| AUTH-01 | Medium | Open | `frontend/src/context/AuthContext.jsx` persists a seven-day opaque bearer token in `localStorage`. Backend tokens are random and only their SHA-256 hashes are stored, but any successful script injection in the frontend origin could read the browser token. React escapes rendered text, no `dangerouslySetInnerHTML` or direct `innerHTML` use was found, and deployment CSP now blocks inline scripts. | Plan a backward-compatible migration to `HttpOnly`, `Secure`, `SameSite` cookies with CSRF/origin protections and a transition window for existing bearer clients. |
| SEC-02 | Medium | Partially fixed | `backend/middleware/rateLimit.js` stores request buckets in process memory. Entry count is now capped and expired buckets are cleaned, but limits do not coordinate across app instances; bucket eviction under high IP churn can also weaken enforcement. | Retain the bounded in-memory limiter for a single instance. Add shared storage only if deployment uses multiple instances or observed traffic demonstrates a need. |
| DB-01 | Medium | Partially fixed | Numbered SQL files exist in `supabase/migrations/`, but the backend does not record applied migration versions. It also performs idempotent schema setup on startup. Render now explicitly sets `NODE_ENV=production`, so the existing startup seed guard is active there. | Keep applying reviewed migrations before deployment. Add a migration runner/version ledger before schema changes need automated rollout or rollback. |
| UI-01 | Medium | Open | `frontend/src/pages/compare/Compare.jsx` loads the `devices` URL parameter only on initial mount. A new comparison URL navigated to while the same page stays mounted is not reloaded. The picker also fetches only page 1 with a limit of 100, so devices beyond that result set are not selectable there. | Reconcile URL state on navigation and add picker pagination if catalog size makes the 100-result cap limiting. |
| UI-02 | Medium (fixed) | Fixed | A rejected detail request could leave `frontend/src/pages/deviceDetails/deviceDetailsPage.jsx` on a spinner, and `getDeviceById` treated all non-OK statuses as missing devices. | Return `null` only for 404, show a retryable error for other failures, and ignore stale requests after navigation. |
| API-01 | Low (fixed) | Fixed | Request logs previously included query strings, which may contain user search/filter terms. | Log `req.path` without query values. |
| API-02 | Low | Open | Catalog filtering uses parameterized SQL and a fixed sort allowlist. Text search uses `%...%` ILIKE, which does not use the current B-tree index and can require a scan as the catalog grows. | Keep current behavior at the measured catalog size. Consider trigram or another search index only after larger-data plans or load measurements show a need. |
| UI-03 | Low | Open | Specification completeness counts recorded payload fields, and some metadata can be included in that count. No browser-driven accessibility, responsive, or console-error review was completed. | Clarify the displayed denominator if metadata is counted; complete interactive browser and assistive-technology checks before broad release. |

## Security review

- **Broken access control:** Library routes apply authentication to the whole router. Favorites and saved-comparison repository queries include the authenticated `user_id`; DELETE checks both owner and record ID. Route tests cover unauthenticated rejection and owner-scoped query parameters using a mocked database.
- **Injection:** Catalog values are passed as SQL parameters. Sort expressions come from a fixed allowlist. No SQL injection path was identified in the reviewed query builder.
- **XSS:** React-rendered content is escaped. No direct HTML injection sink was found by source search. Vercel and Netlify deployment configuration now sets a CSP with `script-src 'self'`, alongside common browser security headers. The style policy permits inline styles and `connect-src` allows HTTPS API hosts; the policy should be tightened if deployment domains become fixed.
- **CSRF:** Auth uses an explicit `Authorization: Bearer` header rather than ambient cookies, so the current flow is not susceptible to conventional cookie-based CSRF. Reassess this if cookie sessions are introduced.
- **Authentication:** Passwords use salted `scrypt` and constant-time comparison. Session tokens are high-entropy, database-backed, expire after seven days, and can be revoked. Tokens remain in browser `localStorage` (AUTH-01).
- **CORS:** The API uses an origin allowlist. `trust proxy` is configured for one hop and must match the actual hosting proxy topology; review it if moving providers or adding proxies.
- **Sensitive responses:** Unexpected server errors return a generic message, code, and request ID without the stack. Error details and stack traces are written to server logs; protect log access and retention.
- **Dependencies:** Live npm audit checks on 2026-11-18 reported zero vulnerabilities for root, backend, and frontend dependency trees after lockfile updates.

## Database and performance

Read-only `EXPLAIN ANALYZE` baselines from the catalog queries on the available dataset:

| Query shape | Observed rows | Execution time | Plan observation |
|---|---:|---:|---|
| Phones, default page and count | 951 matching catalog rows | 2.9 ms count; 3.9 ms page | Sequential scan and sort |
| Phones with max price, minimum RAM, availability, RAM sort | 418 matching rows | 4.4 ms count; 4.5 ms page | Sequential scan and sort |
| Samsung brand plus substring search | 92 matching rows | 1.5 ms count; 1.7 ms page | Sequential scan; substring ILIKE does not benefit from the B-tree index |

These are single-query observations on a small catalog, not production load or latency guarantees. The count and page are separate queries, so concurrent catalog writes can briefly make response metadata inconsistent. Pagination now caps offset at 100,000 rows. Existing foreign keys and indexes are defined in the versioned SQL migrations. Catalog result sizes do not justify adding search indexes or caching at this point.

Session/favorites/saved-comparison plans were not obtained: the current local database configuration refused connections on `localhost:5432`. Their SQL ownership predicates were reviewed statically and route-tested with a mocked pool. No database writes were used for audit testing.

## Changes implemented

- Enforced verified PostgreSQL TLS when `PG_SSL=true`, with optional `PG_SSL_CA`, and blocked downgrade fallback for an explicit TLS requirement.
- Set `NODE_ENV=production` in the Render blueprint so the startup seed guard is effective in that deployment.
- Bounded per-process rate-limit state and expired-bucket cleanup.
- Capped catalog pagination offsets based on page size.
- Added retryable device-detail API error handling and distinguished 404 from server/network failures.
- Added Vercel/Netlify CSP and common browser security headers.
- Removed query-string values from request logs.
- Updated dependency lockfiles to remove all current live npm advisories; replaced `nodemon` with `node --watch` for the development script.
- Added tests for TLS configuration, password hashing, health/database failure responses, rate-limit bounds, pagination boundaries, library authorization scoping, and device-detail API failures.
- Preserved and committed the debounced price-filter update that avoids a route refresh on each typed digit.
- Updated README setup notes for Node watch mode and the optional database CA certificate.

## Verification results

- **Backend tests:** 32 passed, 0 failed.
- **Frontend tests:** 11 passed, 0 failed.
- **Frontend lint:** passed.
- **Frontend production build:** passed (Vite 7.3.8, 132 modules transformed).
- **Dependency audit:** root, backend, and frontend each reported 0 current advisories from the npm registry on 2026-11-18.
- **Catalog query plans:** completed read-only; results are shown above.
- **Deployment:** not performed or verified.
- **Interactive browser checks:** not performed; responsive behavior, keyboard/screen-reader accessibility, and browser console errors remain unverified.
- **Database integration:** no isolated integration database was available. Auth, ownership, and health endpoint tests use a mocked PostgreSQL pool; production database records were not changed.

## Remaining limitations and next steps

1. Design and test the bearer-to-cookie transition before deciding whether the current `localStorage` risk is acceptable for the audience.
2. Use shared rate-limit storage if running multiple API instances or after measured abuse/traffic requires it.
3. Add a dedicated disposable PostgreSQL integration environment for migrations, constraints, transaction behavior, database failures, and authenticated ownership tests.
4. Run browser-level checks for responsive layouts, comparison table usability, form behavior, accessibility, and console errors.
5. Revisit comparison URL synchronization and the 100-device picker limit as a focused UI change.
6. Keep applying the numbered migration files explicitly; startup DDL is not a migration ledger.

## Relevant commits

- `27632d6` — verify PostgreSQL TLS certificates
- `bb2225e` — bound in-memory rate-limit buckets
- `45c356e` — set production mode in Render blueprint
- `caff1ec` — handle device detail request failures
- `d0cbffb` — add frontend content security policy
- `aab448a` — cap catalog pagination offset
- `e000d89` — cover API database health failures
- `72b27e0` — verify library authorization boundaries
- `e7b506f` — cover password hashing and verification
- `74fc75c` — omit query values from request logs
- `ec4df4a` — debounce catalog price filter updates
- `7799a50` — update vulnerable dependency trees
