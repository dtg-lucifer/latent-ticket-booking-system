/**
 * @info Auth related routes lies here
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import { Request, Response, Router } from "express";
import { bodyValidator } from "../../middlewares/body_validators";
import { OtpSchema, SignUpUserSchema } from "../../lib/schema";
import { AuthError, AuthResponse, SafeUser } from "../../utils/types";
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

    let response: AuthResponse;

    try {
      response = await AuthService.signUpUser(number, req);
    } catch (error) {
      res.status((error as AuthError).statusCode).json({
        message: (error as AuthError).message,
        error: (error as AuthError).name,
        requestId: (error as AuthError).requestId,
      });
      return;
    }

    if (!response.done && !response.verified) return;

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
authRouter.post("/verify", bodyValidator(OtpSchema), async (req, res) => {
  const { otp, number, requestId } = req.body;
  const login = req.query.login;

  let response: AuthResponse;

  try {
    response = await AuthService.verifyUser(
      number,
      otp,
      requestId,
      req,
      login ? true : false
    );
  } catch (error) {
    res.status((error as AuthError).statusCode).json({
      message: (error as AuthError).message,
      error: (error as AuthError).name,
      requestId: (error as AuthError).requestId,
    });
    return;
  }

  if (!response.done) return;

  res.status(StatusCodes.OK).json({
    message: "User verified",
    error: null,
    accessToken: response.token,
    requestId: response.requestId,
  });
});

authRouter.post(
  "/login",
  bodyValidator(SignUpUserSchema),
  async (req: Request, res: Response) => {
    const { number } = req.body;

    let response: AuthResponse;

    try {
      response = await AuthService.loginUser(number, req);
    } catch (error) {
      res.status((error as AuthError).statusCode).json({
        message: (error as AuthError).message,
        error: (error as AuthError).name,
        requestId: (error as AuthError).requestId,
      });
      return;
    }

    if (!response.done) return;

    res.status(StatusCodes.OK).json({
      message: "User logged in",
      accessToken: response.token,
      requestId: response.requestId,
    });
  }
);

export { authRouter };
