// Validation Schemas using Zod for LineUp API

import { z } from "zod";
import { createHttpError } from "./error-handler.js";

// Helper regex patterns
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

// Custom validation for year of birth (must be 13+)
const yearOfBirthSchema = z.number().refine(
  (year) => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear - 13;
    return year >= minYear && year <= maxYear;
  },
  {
    message: "You must be at least 13 years old",
  }
);

// ==================== Auth Schemas ====================

export const signupSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must be less than 128 characters")
    .refine(
      (val) => /[a-z]/.test(val),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      (val) => /[A-Z]/.test(val),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (val) => /[0-9]/.test(val),
      "Password must contain at least one number"
    ),
  username: z
    .string({ error: "Username is required" })
    .regex(
      usernameRegex,
      "Username must be 3-30 characters and contain only letters, numbers, and underscores"
    ),
  firstName: z
    .string({ error: "First name is required" })
    .min(1, "First name is required")
    .trim(),
  lastName: z
    .string({ error: "Last name is required" })
    .min(1, "Last name is required")
    .trim(),
  phoneCountryCode: z
    .number({ error: "Country code is required" })
    .int("Country code must be an integer")
    .min(1, "Invalid country code")
    .max(999, "Invalid country code"),
  phoneNumber: z
    .number({ error: "Phone number is required" })
    .int("Phone number must be an integer")
    .refine(
      (val) => {
        const phoneStr = val.toString();
        return phoneStr.length >= 4 && phoneStr.length <= 15;
      },
      { message: "Phone number must be between 4 and 15 digits" }
    ),
  yearOfBirth: yearOfBirthSchema,
  location: z
    .string({ error: "Location is required" })
    .min(1, "Location is required")
    .max(100, "Location must be 100 characters or less")
    .trim(),
  userType: z
    .enum(["musician", "service_provider", "other"], {
      error: "User type is required",
    })
    .refine((val) => ["musician", "service_provider", "other"].includes(val), {
      message: "User type must be 'musician', 'service_provider', or 'other'",
    }),
});

export const loginSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

// ==================== Profile Schemas ====================

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty").trim().optional(),
  lastName: z.string().min(1, "Last name cannot be empty").trim().optional(),
  bio: z
    .string()
    .max(100, "Bio must be 100 characters or less")
    .trim()
    .optional(),
  aboutMe: z
    .string()
    .max(500, "About me must be 500 characters or less")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  location: z
    .string()
    .min(1)
    .max(100, "Location must be 100 characters or less")
    .trim()
    .optional(),
  themeColor: z
    .string()
    .regex(
      hexColorRegex,
      "Invalid color format. Must be hex color like #FF5733"
    )
    .optional(),
  spotifyPlaylistUrl: z.string().url("Invalid Spotify URL").optional(),
  phoneCountryCode: z.number().int().min(1).max(999).optional(),
  phoneNumber: z
    .number()
    .int()
    .refine(
      (val) => {
        const phoneStr = val.toString();
        return phoneStr.length >= 4 && phoneStr.length <= 15;
      },
      { message: "Phone number must be between 4 and 15 digits" }
    )
    .optional(),
  onboardingCompleted: z.boolean().optional(),
});

// ==================== Type Exports ====================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ==================== Helper Functions ====================

/**
 * Sanitize user input by trimming whitespace and removing null bytes
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input.trim().replace(/\0/g, "");
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Handles Zod validation errors by formatting them into HTTP errors
 * @throws HttpError with formatted validation errors if validation fails
 * @returns The validated data
 */
export function handleValidationError<T>(
  validationResult: { success: boolean; data?: T; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }
): T {
  if (!validationResult.success) {
    const errors = validationResult.error!.issues.map((err) => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });
    throw createHttpError({
      message: errors[0],
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: { errors },
    });
  }
  return validationResult.data!;
}
