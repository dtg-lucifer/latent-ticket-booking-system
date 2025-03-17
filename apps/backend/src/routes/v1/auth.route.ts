/**
 * @info Auth related routes lies here
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import { Request, Response, Router } from "express";
import { bodyValidator } from "../../middlewares/body_validators";
import { SignUpOtpSchema, SignUpUserSchema } from "../../lib/schema";
import { SafeUser } from "../../utils/types";
import { StatusCodes } from "http-status-codes";
import { User } from "@prisma/client";
import { AuthService } from "../../services/v1/auth.service";

const authRouter = Router();

/**
 * @description
 * This route is used to send an OTP to the user's phone number.
 */
authRouter.post(
  "/signup",
  bodyValidator(SignUpUserSchema),
  async (req, res) => {
    const { number } = req.body;

    const response = await AuthService.signUpUser(number, req, res);

    if (!response.done) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "It seems like it's us not you",
      });
      return;
    }

    const { role, ...safeUser } = response.user as User;

    res.status(StatusCodes.ACCEPTED).json({
      message: "Otp sent",
      requestId: response.requestId,
      user: safeUser as SafeUser,
    });
  }
);

/**
 * @description
 * This route is used to verify the OTP sent to the user's phone number.
 */
authRouter.post(
  "/signup/verify",
  bodyValidator(SignUpOtpSchema),
  async (req, res) => {
    const { otp, number } = req.body;

    const response = await AuthService.verifyUser(otp, number, req, res);

    res.status(StatusCodes.OK).json({
      message: "User verified",
      accessToken: response.token,
      requestId: response.requestId,
    });
  }
);

authRouter.post(
  "/login",
  bodyValidator(SignUpUserSchema),
  async (req: Request, res: Response) => {
    const { number } = req.body;

    const response = await AuthService.loginUser(number, req, res);

    if (!response.done) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "It seems like it's us not you",
      });
      return;
    }
  }
);

export { authRouter };
