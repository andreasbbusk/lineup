import { Request as ExpressRequest } from "express";
import { supabase } from "../config/supabase.config.js";
import { createHttpError } from "./error-handler.js";

/**
 * Extract and validate user ID from request Bearer token
 * @param request Express request object
 * @returns The authenticated user's ID
 * @throws UnauthorizedError if token is missing or invalid
 */
export async function extractUserId(request: ExpressRequest): Promise<string> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createHttpError({
      message: "No authorization token provided",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw createHttpError({
      message: "Invalid or expired token",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  return user.id;
}

/**
 * Extract Bearer token from Authorization header
 * @param request Express request object
 * @returns The JWT access token
 * @throws UnauthorizedError if header is missing or malformed
 */
export function extractBearerToken(request: ExpressRequest): string {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createHttpError({
      message: "No authorization token provided",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  return authHeader.split(" ")[1];
}

