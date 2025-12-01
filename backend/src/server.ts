import express, { Request, Response, NextFunction } from "express";
import { sql } from "./config/database.config.js";
import { corsMiddleware } from "./middleware/cors.middleware.js";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes/tsoa-routes.js";
import { buildErrorResponse } from "./utils/error-handler.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UploadService } from "./controllers/upload.service.js";
import { extractUserId } from "./utils/auth-helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Server
const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(corsMiddleware);
app.use(express.json());

// Configure multer for file uploads (memory storage for Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Swagger UI
try {
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, "docs", "swagger.json"), "utf8")
  );
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.error("Unable to load swagger.json", err);
}

// Custom upload route (handled before TSOA since TSOA doesn't handle file uploads well)
const apiRouter = express.Router();

// POST /api/upload - Upload media files
apiRouter.post(
  "/upload",
  upload.array("files", 4), // Max 4 files, field name is "files"
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract user ID from auth token
      const userId = await extractUserId(req);

      // Get uploaded files
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      // Upload files using the upload service
      const uploadService = new UploadService();
      const result = await uploadService.uploadFiles(files, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// TSOA Routes (all routes are prefixed with /api in tsoa.json)
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
