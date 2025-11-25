import type { Request } from "express";
import { extractUserId } from "../services/auth.service.js";
import { createHttpError } from "../utils/error-handler.js";

interface AuthenticatedUser {
  id: string;
}

/**
 * Paths that allow optional authentication.
 * These paths can be accessed without a token (returns public data)
 * or with a token (returns private data if authorized).
 *
 * Currently applies to:
 * - GET /api/users/:username - View user profiles (public or private based on auth)
 * - GET /users/:username - Alternative route format
 */
const OPTIONAL_AUTH_PATHS: RegExp[] = [
  /^\/api\/users\/[^/]+$/,  // Matches: /api/users/{username}
  /^\/users\/[^/]+$/,       // Matches: /users/{username}
];

function allowsAnonymous(request: Request): boolean {
  if (request.method !== "GET") {
    return false;
  }
  const path = request.path || "";
  return OPTIONAL_AUTH_PATHS.some((pattern) => pattern.test(path));
}

export async function expressAuthentication(
  request: Request,
  securityName: string
): Promise<AuthenticatedUser | undefined> {
  if (securityName !== "bearerAuth") {
    throw createHttpError({
      message: `Unsupported security scheme: ${securityName}`,
      statusCode: 500,
      code: "AUTH_ERROR",
    });
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || authHeader.trim().length === 0) {
    if (allowsAnonymous(request)) {
      return undefined;
    }
    throw createHttpError({
      message: "Authorization header missing",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  try {
    const userId = await extractUserId(request);
    return { id: userId };
  } catch (error) {
    throw error;
  }
}
