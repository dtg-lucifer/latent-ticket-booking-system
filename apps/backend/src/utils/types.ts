/**
 * @description This file contains the types used in the application.
 * @maintainer dtg-lucifer
 */

import { User } from "@prisma/client";

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
 * It extends the AuthError class
 * and can be used to throw API errors with specific status codes.
 * @param message - The error message
 * @param statusCode - The HTTP status code associated with the error
 * @example
 * throw new APIError("Invalid API key", 401);
 * throw new APIError("Resource not found", 404);
 * @example
 * const error = new APIError("Invalid API key", 401);
 * console.error(error.message); // "Invalid API key"
 * console.error(error.statusCode); // 401
 * console.error(error.name); // "APIError"
 * console.error(error.requestId); // null
 */
export class APIError extends AuthError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = "APIError";
  }
}
