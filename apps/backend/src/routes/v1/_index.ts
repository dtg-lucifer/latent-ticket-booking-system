/**
 * @description
 * This file contains the main router for the application.
 * It handles all the routes for the application.
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import { Router } from "express";
import { authRouter } from "./auth.route";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);

//? TODO: Add other routes here
// @ticket
// @user
// @event
// @admin

export { mainRouter };
