# SpecMine

SpecMine is a modern, full-stack web application that lets users intelligently search, explore, and compare the technical specifications of electronic devices. It bridges the gap between complex hardware details and a clean, user-friendly interface, simplifying the consumer decision-making process.

## Key Features

- **Advanced Device Search:** Quickly locate specific devices by brand name, model number, or product category using an interactive search bar with live autocomplete suggestions.
- **Multi-Category Browsing:** Seamlessly navigate through six categories — Smartphones, Laptops, Tablets, Earbuds, Headphones, and Televisions — each with dedicated pages and sidebar navigation.
- **Side-by-Side Comparisons:** Compare up to three devices simultaneously with a detailed spec table that highlights the "best value" for each specification (e.g., highest RAM, lowest price) using a custom heuristic scoring engine.
- **Detailed Specifications:** Access structured data for every device, covering processor/chipset, RAM/storage, display, battery, camera, connectivity, and more.
- **User Authentication:** Register and log in for a personalized experience using a custom JWT (HS256) implementation with scrypt password hashing.
- **Dark / Light Theme:** A class-based dark mode toggle powered by Tailwind CSS, with the preference persisted in `localStorage`.
- **Responsive Design:** A Tailwind-powered UI that ensures a flawless experience on both desktop and mobile devices.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 (bootstrapped with Vite 7) |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 3 (class-based dark mode) |
| Icons | react-icons (Feather & Font Awesome) |
| Spinner | react-spinners (FadeLoader) |
| Backend Runtime | Node.js (ES Modules) |
| Backend Framework | Express 5 |
| Database | PostgreSQL (via `pg` driver; Supabase in production) |
| Auth | Custom JWT (HS256) + scrypt password hashing (Node `crypto`) |
| Frontend Deployment | Vercel (or Netlify) |
| Backend Deployment | Render (or Vercel serverless) |
| Database Hosting | Supabase |

## Project Structure

```
SpecMine-Compare-Devices/
├── api/
│   └── [...path].js          # Vercel serverless catch-all → Express app
├── backend/
│   ├── app.js                # Express app entry point
│   ├── package.json          # Backend dependencies & scripts
│   ├── .env.example          # Backend environment template
│   ├── Config/
│   │   └── db.js             # PostgreSQL Pool, table creation, auto-seeding
│   ├── Controllers/
│   │   ├── deviceController.js
│   │   └── authController.js
│   ├── Repositories/
│   │   ├── deviceRepository.js
│   │   └── userRepository.js
│   ├── Routes/
│   │   ├── deviceRoutes.js
│   │   └── authRoutes.js
│   ├── Middleware/
│   │   ├── logger.js
│   │   ├── notFound.js
│   │   ├── errorHandler.js
│   │   └── authMiddleware.js
│   ├── Utils/
│   │   ├── normalizeDevice.js
│   │   ├── passwords.js       # scrypt hashing
│   │   └── jwt.js            # Custom HS256 JWT
│   ├── Scripts/
│   │   ├── seedDevices.js
│   │   └── importMobilesCsv.js
│   └── Data/
│       └── db.json           # Seed data
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js        # Vite config with /api proxy → localhost:8000
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Router & layout hierarchy
│       ├── Api/               # apiBase.js, deviceApi.js, authApi.js
│       ├── components/        # Navbar, Footer, SearchBar, DeviceImage, etc.
│       ├── context/           # Auth, Theme, Compare contexts
│       └── pages/            # Home, Devices, Compare, Auth, DeviceDetails
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── vercel.json                # Vercel SPA routing config
├── netlify.toml               # Netlify build & redirect config
├── render.yaml                # Render backend service blueprint
├── package.json               # Root monorepo scripts (concurrently)
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** v18+ (v22 recommended)
- **PostgreSQL** database (local install or a Supabase project)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aditya123000/CompareDevicesApp.git
   cd CompareDevicesApp
   ```

2. **Install root dependencies** (includes `concurrently` for running both apps):
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   npm install --prefix backend
   ```

4. **Install frontend dependencies:**
   ```bash
   npm install --prefix frontend
   ```

5. **Configure backend environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your PostgreSQL credentials and a strong `JWT_SECRET`. By default, the server connects via `host: localhost`, `port: 5432`, `user: postgres`, and `database: compare_devices`. Set `PGPASSWORD` to your local Postgres password.

6. **Set up the database:**
   - Either run the SQL in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in your PostgreSQL, **or**
   - Let the backend create the tables automatically on first boot.

7. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This uses `concurrently` to start:
   - The **backend** on port `8000` (via `nodemon`)
   - The **frontend** Vite dev server on port `5173`

   The Vite dev server proxies `/api` requests to `http://localhost:8000`, so no `VITE_API_BASE_URL` is needed in development.

8. **Open the app:** Navigate to `http://localhost:5173`.

> **Alternative:** You can also start the backend and frontend separately:
> ```bash
> # Terminal 1 — backend
> npm run dev --prefix backend
>
> # Terminal 2 — frontend
> npm run dev --prefix frontend
> ```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | HTML landing page |
| GET | `/api/health` | No | Health check → `{ status: "ok" }` |
| GET | `/api/devices` | No | Returns array of all devices (optional `?limit=N`) |
| GET | `/api/devices/:id` | No | Returns a single device by ID |
| POST | `/api/auth/register` | No | Register new user → `{ token, user }` |
| POST | `/api/auth/login` | No | Login → `{ token, user }` |
| GET | `/api/auth/me` | Yes (Bearer) | Get current user → `{ user }` |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port (default `8000`) |
| `CORS_ORIGIN` | Comma-separated allowed origins (supports wildcards, e.g., `https://*.vercel.app`) |
| `JWT_SECRET` | Secret for JWT signing/verification |
| `DATABASE_URL` | PostgreSQL connection string (preferred for production) |
| `PGHOST` | PostgreSQL host (if not using `DATABASE_URL`) |
| `PGPORT` | PostgreSQL port (default `5432`) |
| `PGDATABASE` | Database name (default `compare_devices`) |
| `PGUSER` | PostgreSQL user (default `postgres`) |
| `PGPASSWORD` | PostgreSQL password |
| `PG_SSL` | SSL preference: `true`/`false` (default `false`; set `true` for Supabase) |
| `AUTO_SEED_DB` | Auto-seed from `db.json` if table empty (default `true`) |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base URL. Leave empty for same-origin (Vercel serverless). Set to Render URL for split deployment. |

## Deployment

This repo supports two deployment strategies:

### Option A: Monorepo on Vercel (Frontend + Serverless API)

Deploy the entire project as a single Vercel site. The frontend builds from `frontend/` and the API runs as Vercel serverless functions via [`api/[...path].js`](api/[...path].js), which imports the Express app from `backend/app.js`.

- **Build command:** `npm run build --prefix frontend`
- **Publish directory:** `frontend/dist`
- **Environment variables (Vercel):**
  - `VITE_API_BASE_URL` — leave empty (same-origin)
  - `DATABASE_URL` — Supabase connection string
  - `JWT_SECRET` — strong random secret
  - `CORS_ORIGIN` — your Vercel URL(s)
  - `PG_SSL=true`
  - `AUTO_SEED_DB=true`

The [`vercel.json`](vercel.json) file handles SPA routing (filesystem-first, then fallback to `index.html` for non-`/api/` paths).

### Option B: Split Deployment (Vercel + Render + Supabase)

#### 1. Supabase (Database)

- Create a new Supabase project.
- In **Project Settings → Database**, copy the Postgres connection string.
- In Supabase, either:
  - run the SQL in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql), or
  - let the backend create the tables automatically on first boot.
- Use the database password/connection string in Render as `DATABASE_URL`.
- Keep `PG_SSL=true` in production.

#### 2. Render (Backend API)

- This repo includes [`render.yaml`](render.yaml) for the backend service.
- Create a new Render Blueprint or Web Service from the repo.
- Render should deploy from the `backend/` directory with:
  - build command: `npm install`
  - start command: `npm start`
- Set these environment variables in Render:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGIN`
  - `PG_SSL=true`
  - `AUTO_SEED_DB=true`
- Point `CORS_ORIGIN` to your Vercel site URL. You can also include localhost while testing, for example:
  - `http://localhost:5173,https://your-site.vercel.app`
  - If you use Vercel preview/branch deploys, you can also allow them with `https://*.vercel.app`

#### 3. Vercel (Frontend)

- This repo includes [`vercel.json`](vercel.json) for the frontend build.
- Create a new Vercel site from the repo.
- Use:
  - build command: `npm run build --prefix frontend`
  - publish directory: `frontend/dist`
- Set this environment variable in Vercel:
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com`
- The frontend reads that value through [`frontend/src/Api/apiBase.js`](frontend/src/Api/apiBase.js), so API requests go to Render in production and still use the local Vite proxy during development.

### Alternative: Netlify (Frontend)

The repo also includes [`netlify.toml`](netlify.toml) for Netlify deployment with the same build/redirect configuration.

## Available Scripts

### Root (`package.json`)

| Command | Description |
|---|---|
| `npm run dev` | Start both backend and frontend concurrently (backend on `:8000`, frontend on `:5173`) |
| `npm install` | Install root dev dependencies (`concurrently`) |

### Backend (`backend/package.json`)

| Command | Description |
|---|---|
| `npm start` | Start backend server (`node app.js`) |
| `npm run dev` | Start backend with auto-reload (`nodemon app.js`) |
| `npm run seed` | Replace all devices in the database from `Data/db.json` |
| `npm run import:mobiles` | Import phone data from a CSV file into `Data/db.json` |

### Frontend (`frontend/package.json`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port `5173`) |
| `npm run build` | Build production frontend to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Database Schema

Defined in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql):

**`devices` table:**

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `brand` | TEXT | NOT NULL |
| `model` | TEXT | NOT NULL |
| `category` | TEXT | |
| `price` | NUMERIC | |
| `payload` | JSONB | NOT NULL |

**`users` table:**

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | GENERATED BY DEFAULT AS IDENTITY, PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

> **Note:** The `devices` table stores data both in individual columns and as a full JSONB `payload`. The repository's `buildDeviceFromRow` function falls back to the individual columns when `payload` is NULL, ensuring devices are always returned even if the JSONB column wasn't populated.

## Key Design Decisions

- **Dual data storage:** Devices are stored both as individual columns and as a JSONB `payload`, with fallback to columns when `payload` is NULL.
- **Defense-in-depth null handling:** Both backend and frontend filter out null/non-object devices, preventing crashes from bad data.
- **Custom JWT implementation:** JWT (HS256) is implemented from scratch using Node's `crypto` module — no external `jsonwebtoken` dependency.
- **scrypt password hashing:** Uses Node's built-in `crypto.scrypt` instead of bcrypt, avoiding native dependencies.
- **SSL fallback:** The database connection automatically retries with SSL enabled/disabled if the initial connection fails due to SSL mismatch.
- **Heuristic processor scoring:** The compare logic uses a custom scoring algorithm for processor names (Apple, Snapdragon, Dimensity, Exynos, Tensor) to enable "best processor" highlighting.
- **Split deployment support:** The project supports both same-origin deployment (Vercel serverless via `api/[...path].js`) and split deployment (frontend on Vercel, backend on Render).

## Future Roadmap

- Advanced filtering modules (filter by exact specifications like price, RAM, or CPU power)
- Device-specific user reviews, ratings, and community discussions
- Deep integration for user accounts allowing saved cross-session device comparisons
- Enhanced visual data charting for specification highlighting

## Author

**Aditya**  
GitHub: [aditya123000](https://github.com/aditya123000)

⭐ *If you find this project helpful or interesting, please consider giving it a star on GitHub!*