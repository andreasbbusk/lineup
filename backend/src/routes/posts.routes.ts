import express from "express";
import { createPost } from "../controllers/posts.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/posts - Create a new post
router.post("/", requireAuth, createPost);

export default router;
