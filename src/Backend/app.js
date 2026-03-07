import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import deviceRoutes from "./Routes/deviceRoutes.js";
import logger from "./Middleware/logger.js";
import notFound from "./Middleware/notFound.js";
import errorHandler from "./Middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = Number.parseInt(globalThis.process?.env?.PORT ?? "8000", 10);

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/devices", deviceRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
