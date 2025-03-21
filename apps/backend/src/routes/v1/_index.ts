/**
 * @description
 * This file contains the main router for the application.
 * It handles all the routes for the application.
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

// INFO: Library imports
import { Router } from "express";

// INFO: Middleware imports
import { middlewares } from "../../middlewares/auth_middleware";

// INFO: Route imports
import { authRouter } from "./auth.route";
import { ticketRouter } from "./ticket.route";
import { healthRouter } from "./health.route";
import { eventRouter } from "./event.route";
import { adminRouter } from "./admin.route";
import { userRouter } from "./user.route";

const mainRouter = Router();

// INFO: Generate routes
mainRouter.use("/auth", authRouter);
mainRouter.use("/health", healthRouter);

// INFO: Protected routes
mainRouter.use("/ticket", middlewares.AuthGuard, ticketRouter);
mainRouter.use("/event", middlewares.AuthGuard, eventRouter);
mainRouter.use("/admin", middlewares.AuthGuard, adminRouter);
mainRouter.use("/user", middlewares.AuthGuard, userRouter);

export { mainRouter };
