/**
 * @description This file contains the error handler middleware for the application.
 * It handles errors and sends appropriate responses to the client.
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import { Request, Response, NextFunction } from "express";
import { log } from "./logger";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error for debugging purposes
  log.error(err);

  // Avoid sending response if it's already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Check if the error is a validation error
  if (err.name === "ValidationError") {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle other types of errors
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: "Internal Server Error",
    error: err.message || "Something went wrong",
  });
};
