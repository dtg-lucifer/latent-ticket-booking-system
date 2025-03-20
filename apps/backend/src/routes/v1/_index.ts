/**
 * @description
 * This file contains the main router for the application.
 * It handles all the routes for the application.
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

// INFO: Library imports
import { Router } from "express";

// INFO: Route imports
import { authRouter } from "./auth.route";
import { ticketRouter } from "./ticket.route";
import { healthRouter } from "./health.route";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/ticket", ticketRouter);
mainRouter.use("/health", healthRouter);

// TODO: Add other routes here
// @user
// @event
// @admin

export { mainRouter };
