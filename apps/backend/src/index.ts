/**
 * The entry point for the server
 * @maintainer dtg-lucifer
 * @repo https://github.com/dtg-lucifer/latent-ticket-booking-system
 */

import express from "express";
import { info, loggerMiddleware } from "./middlewares/logger";
import { mainRouter } from "./routes/v1/_index";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const API_VERSION = "/api/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Apply authentication middleware

app.use(`${API_VERSION}`, mainRouter);

app.get("/health", (req, res) => {
  res.status(StatusCodes.OK).json({ status: "UP" });
});

app.listen(process.env.PORT || 8080, () => {
  info(`Server listening at port ${process.env.PORT || 8080}`);
});
