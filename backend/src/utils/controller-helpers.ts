// Controller Helper Utilities

import { Controller } from "tsoa";
import { getStatusCodeFromError } from "./error-handler.js";

/**
 * Handles controller request execution with unified error handling
 * @param controller - TSOA controller instance
 * @param handler - Async function to execute
 * @param successStatus - HTTP status code for successful response (default: 200)
 * @returns Promise resolving to handler result
 */
export async function handleControllerRequest<T>(
  controller: Controller,
  handler: () => Promise<T>,
  successStatus: number = 200
): Promise<T> {
  try {
    const result = await handler();
    controller.setStatus(successStatus);
    return result;
  } catch (error) {
    controller.setStatus(getStatusCodeFromError(error));
    throw error;
  }
}
