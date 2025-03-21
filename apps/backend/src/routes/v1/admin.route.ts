/**
 * @description
 * This file contains the routes for the admin panel.
 * It handles all the routes for the admin panel.
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import { Request, Response, Router } from "express";
import { log } from "../../middlewares/logger";
import { StatusCodes } from "http-status-codes";
import { __CACHE } from "../..";

const adminRouter = Router();

/**
 * @description
 * This is for creation of an event
 */
adminRouter.post("/event-create", (req: Request, res: Response) => {
  log.info("JWT Verified user");
  const user = __CACHE.get("auth_user");
  console.log(user);
  res.status(StatusCodes.OK).json({
    message: "OK",
  });
});

export { adminRouter };
