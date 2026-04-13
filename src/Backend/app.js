import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import deviceRoutes from "./Routes/deviceRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import logger from "./Middleware/logger.js";
import notFound from "./Middleware/notFound.js";
import errorHandler from "./Middleware/errorHandler.js";
import { initializeDatabase } from "./Config/db.js";

dotenv.config();

const app = express();
const PORT = Number.parseInt(globalThis.process?.env?.PORT ?? "8000", 10);
const defaultAllowedOrigins = ["http://localhost:5173", "https://specmine.vercel.app"];
const allowedOriginPatterns = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : defaultAllowedOrigins
)
  .map((origin) => origin.trim())
  .filter(Boolean);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isOriginAllowed = (origin) =>
  allowedOriginPatterns.some((pattern) => {
    if (!pattern.includes("*")) {
      return pattern === origin;
    }

    const wildcardRegex = new RegExp(
      `^${pattern.split("*").map(escapeRegex).join(".*")}$`
    );

    return wildcardRegex.test(origin);
  });

const corsOptions = {
  origin(origin, callback) {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    const corsError = new Error("Not allowed by CORS");
    corsError.status = 403;
    callback(corsError);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// app.options("/*", cors(corsOptions));

app.use(express.json());
app.use(logger);

app.get("/", (_req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Compare Devices Backend</title>
        <style>
          :root {
            color-scheme: light;
            --bg-start: #f8fafc;
            --bg-end: #dbeafe;
            --card: rgba(255, 255, 255, 0.92);
            --text: #0f172a;
            --muted: #475569;
            --accent: #0f766e;
            --accent-soft: #ccfbf1;
            --border: rgba(15, 23, 42, 0.08);
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: var(--text);
            background:
              radial-gradient(circle at top, rgba(14, 165, 233, 0.2), transparent 35%),
              linear-gradient(160deg, var(--bg-start), var(--bg-end));
            display: grid;
            place-items: center;
            padding: 24px;
          }

          .card {
            width: min(680px, 100%);
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
            backdrop-filter: blur(10px);
          }

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border-radius: 999px;
            background: var(--accent-soft);
            color: var(--accent);
            font-weight: 700;
            letter-spacing: 0.02em;
          }

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.16);
          }

          h1 {
            margin: 20px 0 12px;
            font-size: clamp(2rem, 4vw, 3rem);
            line-height: 1.05;
          }

          p {
            margin: 0;
            color: var(--muted);
            font-size: 1rem;
            line-height: 1.7;
          }

          .links {
            margin-top: 28px;
            display: grid;
            gap: 14px;
          }

          a {
            display: block;
            text-decoration: none;
            color: inherit;
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 16px;
            padding: 16px 18px;
            transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
          }

          a:hover {
            transform: translateY(-2px);
            border-color: rgba(15, 118, 110, 0.25);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          }

          strong {
            display: block;
            margin-bottom: 4px;
            font-size: 1rem;
          }

          span {
            color: var(--muted);
            font-size: 0.95rem;
          }
        </style>
      </head>
      <body>
        <main class="card">
          <div class="badge">
            <span class="dot"></span>
            Server Running
          </div>
          <h1>Everything is fine.</h1>
          <p>
            The Compare Devices backend is up, connected through Express, and ready to
            serve API requests.
          </p>
          <div class="links">
            <a href="/api/health">
              <strong>Health Check</strong>
              <span>Open <code>/api/health</code> to confirm the backend responds with status data.</span>
            </a>
            <a href="/api/devices">
              <strong>Devices API</strong>
              <span>Open <code>/api/devices</code> to view the device records coming from PostgreSQL.</span>
            </a>
          </div>
        </main>
      </body>
    </html>
  `);
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/devices", deviceRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

try {
  await initializeDatabase();

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
} catch (error) {
  console.error("Failed to start server:", error.message);
  process.exit(1);
}
