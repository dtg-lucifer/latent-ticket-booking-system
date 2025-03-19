/**
 * @description
 * This file contains the main router for the application.
 * It handles all the routes for the application.
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import { Router } from "express";
import { authRouter } from "./auth.route";
import { log } from "../../middlewares/logger";

const mainRouter = Router();

mainRouter.use("/health", (req, res) => {
  log.info("Health check request received from: " + req.ip);
  res.status(200).json({
    message: "Server is up and running",
    status: "success",
  });
});

mainRouter.use("/auth", authRouter);

//? TODO: Add other routes here
// @ticket
// @user
// @event
// @admin

export { mainRouter };
