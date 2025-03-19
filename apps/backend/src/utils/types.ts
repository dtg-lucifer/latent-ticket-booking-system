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
 */
export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}
