import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";

const MOCK_USER_ID = "bdad3024-4403-43ed-98fd-675b0d8d030b"; // Use your actual user ID
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Development mock: If no auth header, use mock userId
    if (IS_DEVELOPMENT && !req.headers.authorization) {
      console.log("⚠️  Using mock userId for development:", MOCK_USER_ID);
      req.userId = MOCK_USER_ID;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
