# API Documentation

The API is served by the Express application. In local development, Vite proxies `/api` to `http://localhost:8000`. Responses use JSON unless a route returns `204 No Content`.

## Response formats

Successful JSON responses use `{ "data": ... }`; paginated catalog responses also include `meta`:

```json
{
  "data": [{ "id": "device-id", "brand": "Example", "model": "Phone" }],
  "meta": { "page": 1, "limit": 24, "total": 1, "totalPages": 1 }
}
```

Errors use `{ "message": "...", "code": "...", "requestId": "..." }`. The health route is a small operational exception and returns its status object directly. `204` routes have no response body.

## Public routes

| Method and path | Query / body | Success |
|---|---|---|
| `GET /api/health` | — | `200` with `{ status: "ok", service, requestId, timestamp }`; `503` when the database check fails |
| `GET /api/devices` | Catalog filters below | `200` paginated `{ data, meta }` |
| `GET /api/devices/brands` | Optional `category` | `200` with an array of brand names in `data` |
| `GET /api/devices/:id` | Device ID in path | `200` with one normalized device in `data`; `404` if missing |
| `POST /api/auth/register` | `{ name, email, password }` | `201` with `{ data: { token, expiresAt, user } }` |
| `POST /api/auth/login` | `{ email, password }` | `200` with `{ data: { token, expiresAt, user } }` |

### Catalog query parameters

| Parameter | Rules |
|---|---|
| `page` | Positive integer, default `1` |
| `limit` | Positive integer, default `24`, maximum `100` |
| `q` | Optional substring search over brand/model, truncated to 100 characters |
| `category` | Optional category name/alias, up to 60 characters; common aliases are phones, laptops, tablets, earbuds, headphones, and TVs |
| `brand` | Optional case-insensitive exact brand match, up to 60 characters |
| `availability` | `all` (default), `available`, or `unavailable` |
| `maxPrice` | Optional non-negative number |
| `minRam` | Optional non-negative number; rows with a parseable GB RAM value at or above it match |
| `sort` | `relevance` (default), `price_asc`, `price_desc`, `ram_desc`, or `year_desc` |

Example: `GET /api/devices?category=phones&brand=Google&minRam=8&sort=price_asc&page=1&limit=24`.

## Authenticated routes

Send the opaque session token as `Authorization: Bearer <token>`. Register/login tokens are valid for seven days. The API stores a hash of the token in PostgreSQL.

| Method and path | Body | Success |
|---|---|---|
| `GET /api/auth/me` | — | `200` with `{ data: { user } }` |
| `POST /api/auth/logout` | — | `204`; revokes the current session |
| `PUT /api/auth/profile` | At least one of `name` (max 80 chars) or `email` (max 254, valid format) | `200` with updated user |
| `PUT /api/auth/password` | `{ currentPassword, newPassword }`; new password 8–128 chars | `200`; current user sessions are revoked |
| `GET /api/library/favorites` | — | `200` with favorite device records |
| `POST /api/library/favorites/:deviceId` | — | `201`; unknown device returns `404` |
| `DELETE /api/library/favorites/:deviceId` | — | `204` |
| `GET /api/library/comparisons` | — | `200` with saved comparisons |
| `POST /api/library/comparisons` | `{ name?, deviceIds }`; 2–3 unique IDs, name max 80 chars | `201`; devices must exist and share a category |
| `DELETE /api/library/comparisons/:comparisonId` | UUID in path | `204` |

Registration requires a name (max 80), valid email, and password of 8–128 characters. Login accepts existing passwords from 1–128 characters to avoid locking out older accounts.

## Error and rate-limit behavior

Typical status codes are `400` validation, `401` authentication, `403` authorization/CORS, `404` missing resource, `409` uniqueness or reference conflict, `429` rate limit, and `500` unexpected server failure. Error responses include a request ID for log correlation. Internal exception details are not returned for `500` responses.

Rate limits are process-local: devices and library have a per-IP limit of 120 requests per minute; auth has a limit of 20 requests per 15 minutes. A rate-limit response includes `message`, `code: "RATE_LIMITED"`, and `requestId`. Deployments with multiple backend instances should use shared rate-limit storage before relying on a global limit.
