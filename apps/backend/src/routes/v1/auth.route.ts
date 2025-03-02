/**
 * @info Auth related routes lies here
 * @maintainer dtg-lucifer
 */

import { generateToken, verifyToken } from "authenticator";
import { Router } from "express";
import { log } from "../../middlewares/logger";
import { __db } from "@repo/db/client";
import { bodyValidator } from "../../middlewares/body_validators";
import { SignUpOtpSchema, SignUpUserSchema } from "../../lib/schema";
import { v4 as uuidv4 } from "uuid";
import { SafeUser } from "../../utils/types";
import { StatusCodes } from "http-status-codes";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_EXPIRY, JWT_SECRET } from "../../config";

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

    let nonVeriFiedUser: User;

    try {
      nonVeriFiedUser = await __db.user.upsert({
        where: {
          number,
        },
        create: {
          email: req.body.email,
          name: req.body.name,
          number,
        },
        update: {},
      });
    } catch (e) {
      if (e instanceof Error) {
        log.error(e.message);
      } else if (e instanceof PrismaClientValidationError) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: "Failed to create or validate user",
        });
      }
      return;
    }

    if (nonVeriFiedUser.verified) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "User already verified" });
      return;
    }

    const requestId = uuidv4();
    const totp = generateToken(number + "SIGNUP");
    if (process.env.NODE_ENV === "production") {
      // TODO send the otp to the number
    }

    log.info(`Generated TOTP for ${number}: ${totp}, requestId: ${requestId}`);

    const { role, ...safeUser } = nonVeriFiedUser;

    res.status(StatusCodes.ACCEPTED).json({
      message: "Otp sent",
      requestId,
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

    if (!verifyToken(number + "SIGNUP", otp)) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid OTP" });
      return;
    }

    let user: User;
    // make the user verified if the otp is verified
    try {
      user = await __db.user.update({
        where: {
          number,
        },
        data: {
          verified: true,
        },
      });
    } catch (e) {
      if (e instanceof Error) {
        log.error(e.message);
      } else if (e instanceof PrismaClientValidationError) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: "Failed to update user",
        });
      }
      return;
    }

    const requestId = uuidv4();
    const token = jwt.sign({ id: user.id, requestId }, JWT_SECRET as string, {
      algorithm: "HS512",
      expiresIn: JWT_EXPIRY as string,
    });

    res.status(StatusCodes.OK).json({ message: "User verified", token });
  }
);

export { authRouter };
