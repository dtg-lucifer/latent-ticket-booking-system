import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { JWT_SECRET } from "../config";
import { log } from "./logger";
import { __CACHE } from "..";

/**
 * Authentication guard to protect routes that verifies JWT tokens
 * Skips verification for auth-related routes (paths starting with "/api/v1/auth")
 * For protected routes, requires a valid Bearer token in Authorization header
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
const AuthGuard = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth check for auth-related routes
  if (req.path.startsWith("/api/v1/auth") && req.headers.authorization) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    log.warn(
      `Authentication failed: No valid Authorization header found for path ${req.path}`
    );
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Authentication required",
      message: "Please provide a valid authentication token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    log.warn(
      `Authentication failed: No token found in Authorization header for path ${req.path}`
    );
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Authentication required",
      message: "Please provide a valid authentication token",
    });
    return;
  }

  // verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      id: string;
      requestId: string;
      iat: number;
      exp: number;
    };
    // Attach the decoded token to the request for use in other middleware/routes
    __CACHE.set("auth_user", decoded);
    log.info(
      `Authentication successful for user ${decoded} on path ${req.path}`
    );
    next();
  } catch (err) {
    log.error(`Token verification failed: ${(err as Error).message}`);
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Invalid token",
      message: "Your authentication token is invalid or expired",
    });
    return;
  }
};

export const middlewares = {
  AuthGuard,
};
