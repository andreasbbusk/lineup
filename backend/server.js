import express from "express";
import cors from "cors";

//Server
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
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

app.get("/api/login", (req, res) => {
  res.json({
    message: "Here goes the login from",
  });
});

app.get("/api/signup", (req, res) => {
  res.json({
    message: "Here goes the sign up form",
  });
});

//Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
