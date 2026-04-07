# SpecMine

SpecMine is a modern, comprehensive web application designed to help users intelligently search, explore, and compare the technical specifications of electronic devices. It bridges the gap between complex hardware details and a user-friendly interface, simplifying the consumer decision-making process.

## Key Features

- **Advanced Device Search:** Quickly locate specific devices by brand name, model number, or product category using our interactive search interface.
- **Multi-Category Browsing:** Seamlessly navigate through diverse categories, including Smartphones, Laptops, Tablets, Earbuds, Headphones, Televisions, Smartwatches, Gaming Consoles, and Monitors.
- **Side-by-Side Comparisons:** Evaluate multiple devices simultaneously to directly compare performance capabilities, display quality, battery life, and other critical hardware metrics.
- **Detailed Specifications:** Access highly structured data for every device, covering Processor/Chipset, RAM/Storage, Display, Battery, Camera, and Connectivity features.
- **User Authentication:** Create a personalized account to save your place and ensure a tailored comparison experience.
- **Responsive Design:** A beautifully crafted, Tailwind-powered user interface that ensures a flawless experience on both desktop and mobile devices.

## Technology Stack

**Frontend:**
- React (bootstrapped with Vite)
- React Router (for seamless client-side routing)
- Tailwind CSS

**Backend & Database:**
- Node.js & Express
- PostgreSQL

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL (Ensure you have a local database named `compare_devices` ready)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aditya123000/specmine.git
   cd specmine
   ```

2. **Backend Setup:**
   - Define your environment variables by copying the example file:
     ```bash
     cp src/Backend/.env.example src/Backend/.env
     ```
   - Update `src/Backend/.env` with your PostgreSQL credentials (specifically, set `PGPASSWORD`). By default, the server connects via `host: localhost`, `port: 5432`, `user: postgres`, and `database: compare_devices`.
   - Start the backend server. The database will automatically be seeded from `src/Backend/Data/db.json` upon startup if it is currently empty:
     ```bash
     npm run server
     ```

3. **Frontend Setup:**
   - In a new terminal window, install the project dependencies:
     ```bash
     npm install
     ```
   - Start the Vite development server:
     ```bash
     npm run dev
     ```
   - Open your browser and navigate to `http://localhost:5173`.

## Deployment

This repo is now structured for a split deployment:

- **Netlify** for the Vite frontend
- **Render** for the Express API
- **Supabase** for the PostgreSQL database

### 1. Supabase

- Create a new Supabase project.
- In **Project Settings -> Database**, copy the Postgres connection string.
- In Supabase, either:
  - run the SQL in [supabase/migrations/001_initial_schema.sql](/c:/Users/akash/Desktop/Compare-Device-Frontend/supabase/migrations/001_initial_schema.sql), or
  - let the backend create the tables automatically on first boot.
- Use the database password/connection string in Render as `DATABASE_URL`.
- Keep `PG_SSL=true` in production.

### 2. Render

- This repo includes [render.yaml](/c:/Users/akash/Desktop/Compare-Device-Frontend/render.yaml) for the backend service.
- Create a new Render Blueprint or Web Service from the repo.
- Render should deploy from `src/Backend` with:
  - build command: `npm install`
  - start command: `npm start`
- Set these environment variables in Render:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGIN`
  - `PG_SSL=true`
  - `AUTO_SEED_DB=true`
- Point `CORS_ORIGIN` to your Netlify site URL. You can also include localhost while testing, for example:
  - `http://localhost:5173,https://your-site.netlify.app`
  - If you use Netlify preview/branch deploys, you can also allow them with `https://*.netlify.app`

### 3. Netlify

- This repo includes [netlify.toml](/c:/Users/akash/Desktop/Compare-Device-Frontend/netlify.toml) for the frontend build.
- Create a new Netlify site from the repo.
- Use:
  - build command: `npm run build`
  - publish directory: `dist`
- Set this environment variable in Netlify:
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com`
- The frontend now reads that value through [src/Api/apiBase.js](/c:/Users/akash/Desktop/Compare-Device-Frontend/src/Api/apiBase.js), so API requests go to Render in production and still use the local Vite proxy during development.

### Environment Files

- Frontend example: [.env.example](/c:/Users/akash/Desktop/Compare-Device-Frontend/.env.example)
- Backend example: [src/Backend/.env.example](/c:/Users/akash/Desktop/Compare-Device-Frontend/src/Backend/.env.example)

### Local Development

- Frontend can keep using `/api` through the Vite proxy in [vite.config.js](/c:/Users/akash/Desktop/Compare-Device-Frontend/vite.config.js).
- If you want to bypass the proxy locally, set `VITE_API_BASE_URL=http://localhost:8000` in a local `.env`.

## Future Roadmap

- Advanced filtering modules (filter by exact specifications like price, RAM, or CPU power)
- Device-specific user reviews, ratings, and community discussions
- Deep integration for user accounts allowing saved cross-session device comparisons
- Enhanced visual data charting for specification highlighting

## Author

**Aditya**  
GitHub: [aditya123000](https://github.com/aditya123000)

⭐ *If you find this project helpful or interesting, please consider giving it a star on GitHub!*
