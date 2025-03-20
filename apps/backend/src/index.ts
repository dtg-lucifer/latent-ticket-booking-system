/**
 * The entry point for the server
 * @maintainer dtg-lucifer
 * @repo https://github.com/dtg-lucifer/latent-ticket-booking-system
 */

import express, { NextFunction, Request, Response } from "express";
import { log, loggerMiddleware } from "./middlewares/logger";
import { mainRouter } from "./routes/v1/_index";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error_handler";
import { APIError } from "./utils/types";

dotenv.config();

const app = express();

const API_VERSION = "/api/v1";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Attach main router
app.use(`${API_VERSION}`, mainRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError("Not Found", 404);
  next(err);
});

app.use(errorHandler);

// Handle uncaught exceptions to prevent server from crashing
process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  log.error("Unhandled Rejection at:", promise, "reason:", reason);
});

app.listen(process.env.PORT || 8080, () => {
  log.info(`Server listening at port ${process.env.PORT || 8080}`);
});
