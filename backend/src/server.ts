import express from "express";
import { sql } from "./config/database.config.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import { corsMiddleware } from "./middleware/cors.middleware.js";

//Server
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(corsMiddleware);
app.use(express.json());

//API Endpoints
app.get("/", (req, res) => {
  res.json({
    message: "lineUp ♬",
    version: "1.0.0",
  });
});

app.get("/api/profile", (req, res) => {
  res.json({
    message: "Here goes the profile data",
  });
});

app.post("/api/login", (req, res) => {
  res.json({
    message: "Here goes the login form",
  });
});

app.post("/api/signup", (req, res) => {
  res.json({
    message: "Here goes the sign up form",
  });
});

// Database connection test endpoint
app.get("/api/databasetest", requireAuth, async (req, res) => {
  try {
    const connectionTest = await sql`
      SELECT *
      FROM connection_test 
    `;
    res.json(connectionTest[0]);
  } catch (error) {
    console.error("Error getting database connection:", error);
    res.status(500).json({ error: "Failed to get database connection" });
  }
});

//Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
