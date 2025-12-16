import express, { Request, Response, NextFunction } from "express";
import cron from "node-cron";
import { corsMiddleware } from "./middleware/cors.middleware.js";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes/tsoa-routes.js";
import { buildErrorResponse } from "./utils/error-handler.js";
import { NotificationCleanupService } from "./jobs/notification-cleanup.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Server
const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(corsMiddleware);
app.use(express.json());

// Swagger UI
try {
  const swaggerPath = path.join(__dirname, "docs", "swagger.json");
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.error("Unable to load swagger.json", err);
}

// TSOA Routes (all routes are prefixed with /api in tsoa.json)
const apiRouter = express.Router();
RegisterRoutes(apiRouter);
app.use("/api", apiRouter);

// Global error handler middleware (must be after routes)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const { statusCode, payload } = buildErrorResponse(err);
  res.status(statusCode).json(payload);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "lineUp ♬",
    version: "1.0.0",
  });
});

// CRON job for cleaning up read notifications
// Schedule and retention period can be configured via environment variables
const CLEANUP_SCHEDULE =
  process.env.NOTIFICATION_CLEANUP_SCHEDULE || "0 2 * * *"; // Default: Daily at 2 AM
const RETENTION_DAYS = parseInt(
  process.env.NOTIFICATION_RETENTION_DAYS || "30",
  10
); // Default: 30 days

const cleanupService = new NotificationCleanupService();

// Only start CRON job if not in test environment
if (process.env.NODE_ENV !== "test") {
  cron.schedule(CLEANUP_SCHEDULE, async () => {
    try {
      await cleanupService.cleanupReadNotifications(RETENTION_DAYS);
    } catch (error) {
      // Silently handle errors
    }
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ API docs: http://localhost:${PORT}/docs`);
});
