import cors from "cors";

export const corsMiddleware = cors({
  origin: true, // Allow ALL origins temporarily
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
});
