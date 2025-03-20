/**
 * @description This file contains the health check route for the application.
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import { Router } from "express";
import { log } from "../../middlewares/logger";
import { StatusCodes } from "http-status-codes";

const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  log.info("Health check request received from: " + req.ip);
  res.status(StatusCodes.OK).json({
    message: "Server is up and running",
    status: "success",
  });
});

export { healthRouter };
