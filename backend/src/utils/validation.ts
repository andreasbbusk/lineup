// Validation utilities using class-validator for LineUp API

import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { createHttpError } from "./error-handler.js";

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
 * Validates a DTO instance using class-validator
 * @param dtoClass - The DTO class to validate against
 * @param data - The plain object data to validate
 * @param skipMissingProperties - Whether to skip validation for missing properties (default: false)
 * @returns The validated and transformed DTO instance
 * @throws HttpError with formatted validation errors if validation fails
 */
export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: unknown,
  skipMissingProperties: boolean = false
): Promise<T> {
  // Transform plain object to class instance
  const dtoInstance = plainToInstance(dtoClass, data);

  // Validate the instance
  const errors = await validate(dtoInstance, {
    skipMissingProperties,
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
  });

  if (errors.length > 0) {
    const formattedErrors = formatValidationErrors(errors);
    throw createHttpError({
      message: formattedErrors[0],
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: { errors: formattedErrors },
    });
  }

  return dtoInstance;
}

/**
 * Formats class-validator errors into readable error messages
 */
function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  function extractMessages(errors: ValidationError[], parentPath: string = "") {
    for (const error of errors) {
      const propertyPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        // Get the first constraint message (usually the most relevant)
        const constraintMessages = Object.values(error.constraints);
        messages.push(`${propertyPath}: ${constraintMessages[0]}`);
      }

      // Recursively handle nested validation errors
      if (error.children && error.children.length > 0) {
        extractMessages(error.children, propertyPath);
      }
    }
  }

  extractMessages(errors);
  return messages;
}

/**
 * Validates phone number length (4-15 digits)
 * This is a custom validation that complements class-validator decorators
 */
export function validatePhoneNumberLength(phoneNumber: number): boolean {
  const phoneStr = phoneNumber.toString();
  return phoneStr.length >= 4 && phoneStr.length <= 15;
}

/**
 * Validates year of birth (must be 13+ years old)
 */
export function validateYearOfBirth(year: number): boolean {
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear - 13;
  return year >= minYear && year <= maxYear;
}
