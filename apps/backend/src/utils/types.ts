/**
 * @description This file contains the types used in the application.
 * @maintainer dtg-lucifer
 */

import { User } from "@prisma/client";
import { log } from "../middlewares/logger";

/**
 * @description Safe user schema so that no sensitive data is exposed
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  number: string;
  verified: boolean;
}

/**
 * @description Response type for auth related services
 */
export interface AuthResponse {
  verified: boolean;
  done: boolean;
  requestId: string;
  user: User | null;
  token: string | null;
}

/**
 * @description Error class for authentication related errors
 * It extends the built-in Error class
 * and adds a statusCode property to indicate the HTTP status code.
 * This class can be used to throw authentication errors with specific status codes.
 * @param message - The error message
 * @param statusCode - The HTTP status code associated with the error
 * @param requestId - Optional request ID for tracking the error
 * @example
 * throw new AuthError("User not found", 404);
 * throw new AuthError("Invalid credentials", 401, requestId);
 * @example
 * const error = new AuthError("User not found", 404);
 * console.error(error.message); // "User not found"
 * console.error(error.statusCode); // 404
 * console.error(error.name); // "AuthError"
 * console.error(error.requestId); // null
 */
export class AuthError extends Error {
  statusCode: number;
  message: string;
  name: string;
  requestId: string | null;

  constructor(
    message: string,
    statusCode: number,
    requestId: string | null = null
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.name = "AuthError";
  }
}

/**
 * @description Error class for API related errors
 *
 * It extends the AuthError class
 * @param message - The error message
 * @param statusCode - The HTTP status code associated with the error
 * @param requestId - Optional request ID for tracking the error
 *
 * @example
 * ```ts
 * throw new APIError("User not found", 404);
 * throw new APIError("Invalid credentials", 401, requestId);
 * ```
 * @example
 * ```ts
 * const error = new APIError("User not found", 404);
 * console.error(error.message); // "User not found"
 * console.error(error.statusCode); // 404
 * console.error(error.name); // "APIError"
 * console.error(error.requestId); // null
 * ```
 */
export class APIError extends AuthError {
  constructor(
    message: string,
    statusCode: number,
    requestId: string | null = null
  ) {
    super(message, statusCode, requestId);
    this.name = "APIError";
  }

  logError() {
    log.error(
      `APIError: ${this.message}, StatusCode: ${this.statusCode}, RequestId: ${this.requestId}`
    );
  }
}
