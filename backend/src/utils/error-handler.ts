// Unified error helper for the backend

interface HttpErrorMeta {
  statusCode: number;
  status?: number;
  code: string;
  message: string;
  details?: unknown;
}

export type HttpError = Error & Partial<HttpErrorMeta>;

interface ErrorResponsePayload {
  error: string;
  code: string;
  timestamp: string;
  details?: unknown;
}

interface ErrorResponse {
  statusCode: number;
  payload: ErrorResponsePayload;
}

interface CreateHttpErrorOptions {
  message: string;
  statusCode: number;
  code: string;
  details?: unknown;
}

const DEFAULT_STATUS = 500;
const DEFAULT_CODE = "INTERNAL_SERVER_ERROR";

export function createHttpError({
  message,
  statusCode,
  code,
  details,
}: CreateHttpErrorOptions): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  error.status = statusCode; // TSOA compatibility
  error.code = code;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

export function buildErrorResponse(error: unknown): ErrorResponse {
  const parsed = normalizeError(error);
  const payload: ErrorResponsePayload = {
    error: parsed.message,
    code: parsed.code,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production" && parsed.details !== undefined) {
    payload.details = parsed.details;
  }

  return {
    statusCode: parsed.statusCode,
    payload,
  };
}

export function getStatusCodeFromError(error: unknown): number {
  if (isHttpError(error) && typeof error.statusCode === "number") {
    return error.statusCode;
  }
  return DEFAULT_STATUS;
}

export function handleSupabaseAuthError(error: unknown): never {
  throw resolveSupabaseAuthError(error);
}

function normalizeError(error: unknown): HttpErrorMeta {
  if (isHttpError(error) && typeof error.statusCode === "number") {
    return {
      statusCode: error.statusCode,
      code: error.code ?? DEFAULT_CODE,
      message: error.message || "An unexpected error occurred",
      details: error.details,
    };
  }

  if (isSupabaseAuthError(error)) {
    const supabaseError = resolveSupabaseAuthError(error);
    return {
      statusCode: supabaseError.statusCode ?? DEFAULT_STATUS,
      code: supabaseError.code ?? DEFAULT_CODE,
      message: supabaseError.message || "Authentication failed",
      details: supabaseError.details,
    };
  }

  const fallbackMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "An unexpected error occurred";

  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : fallbackMessage || "An unexpected error occurred";

  return {
    statusCode: DEFAULT_STATUS,
    code: DEFAULT_CODE,
    message,
    details: error instanceof Error ? error.stack : error,
  };
}

function isHttpError(error: unknown): error is HttpError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as HttpError;
  return (
    typeof candidate.message === "string" &&
    ("statusCode" in candidate || "code" in candidate)
  );
}

function isSupabaseAuthError(error: unknown): error is { message?: string } {
  if (!error || typeof error !== "object") {
    return false;
  }
  const candidate = error as Record<string, unknown>;
  const message =
    typeof candidate.message === "string" ? candidate.message : "";
  const name = typeof candidate.name === "string" ? candidate.name : "";
  return name === "AuthApiError" || message.toLowerCase().includes("auth");
}

function resolveSupabaseAuthError(error: unknown): HttpError {
  const message =
    (error && typeof (error as any).message === "string"
      ? (error as any).message
      : "") || "Authentication error";
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("already registered") ||
    lowerMessage.includes("already exists")
  ) {
    return createHttpError({
      message: "An account with this email already exists",
      statusCode: 409,
      code: "CONFLICT",
    });
  }

  if (
    lowerMessage.includes("invalid login credentials") ||
    lowerMessage.includes("user not found")
  ) {
    return createHttpError({
      message: "Invalid email or password",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (lowerMessage.includes("email not confirmed")) {
    return createHttpError({
      message: "Please confirm your email address",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (lowerMessage.includes("invalid email")) {
    return createHttpError({
      message: "Invalid email format",
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  if (
    lowerMessage.includes("email") ||
    lowerMessage.includes("password") ||
    lowerMessage.includes("validation")
  ) {
    return createHttpError({
      message,
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  return createHttpError({
    message,
    statusCode: DEFAULT_STATUS,
    code: "AUTH_ERROR",
  });
}
