import express, { Request, Response, NextFunction } from "express";
import { corsMiddleware } from "./middleware/cors.middleware.js";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes/tsoa-routes.js";
import { buildErrorResponse } from "./utils/error-handler.js";
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
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, "docs", "swagger.json"), "utf8")
  );
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

//Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`✅ API documentation found on http://localhost:${PORT}/docs`);
});
