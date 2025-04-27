/**
 * @file auth.service.ts
 * @description This file contains the authentication service for the application.
 * It handles user signup, verification, and login.
 * @maintainer dtg-lucifer
 */

import { User } from "@prisma/client";
import { Request } from "express";
import { Transport, ToTp } from "../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import { __db } from "@repo/db/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { log } from "../../middlewares/logger";
import jwt from "jsonwebtoken";
import { JWT_SECRET, OTP_SECRET } from "../../config";
import { AuthError, AuthResponse } from "../../utils/types";
import { StatusCodes } from "http-status-codes";

async function signUpUser(number: string, req: Request): Promise<AuthResponse> {
  let nonVeriFiedUser: User;
  const requestId = uuidv4();

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
      log.error(e.stack);
    } else if (e instanceof PrismaClientValidationError) {
      throw new AuthError("Failed to create or validate user", 500, requestId);
    }
    return {
      verified: false,
      done: false,
      requestId: "",
      user: null,
      token: null,
    };
  }

  if (nonVeriFiedUser.verified) {
    throw new AuthError(
      "User already verified",
      StatusCodes.ACCEPTED,
      requestId
    );
  }

  const otp = ToTp.generateAlphanumericOTP(number, OTP_SECRET, requestId);

  if (process.env.NODE_ENV === "production") {
    try {
      await Transport.sendMessage(
        `+91${number}`,
        `Your OTP is ${otp}, please verify your account.
          \n\nName: ${req.body.name}
          \nEmail: ${req.body.email}
          \nRequestId: ${requestId}`
      );
    } catch (e) {
      log.error("Inside the auth.route.ts file, while sending the otp");
      log.error(e);
      throw new AuthError(
        "Failed to send OTP",
        StatusCodes.INTERNAL_SERVER_ERROR,
        requestId
      );
    }
  }

  log.info(
    `Generated alphanumeric OTP for ${number}: ${otp}, requestId: ${requestId}`
  );

  return {
    requestId,
    user: nonVeriFiedUser,
    verified: false,
    done: true,
    token: null,
    // Expose OTP for testing (never in production)
    ...(process.env.NODE_ENV !== "production" && { otp }),
  };
}

async function verifyUser(
  number: string,
  otp: string,
  requestId: string,
  req: Request,
  isLogin: boolean = false
): Promise<AuthResponse> {
  if (!ToTp.verifyAlphanumericOTP(number, OTP_SECRET, requestId, otp)) {
    throw new AuthError("Invalid OTP", 401);
  }

  let user: User | null;
  try {
    user = await __db.user.findUnique({
      where: {
        number,
      },
    });

    if (!user) {
      throw new AuthError("User not found", 400, requestId);
    }

    /**
     * For signup verification, update the user to verified if not already
     */
    if (!isLogin && !user.verified) {
      user = await __db.user.update({
        where: {
          number,
        },
        data: {
          verified: true,
        },
      });
    } else if (isLogin && !user.verified) {
      /**
       * For login, check if the user is already verified
       * when login query is sent to the request url
       */
      throw new AuthError(
        "Please complete signup verification first",
        400,
        requestId
      );
    }
  } catch (e) {
    if (e instanceof AuthError) {
      throw e;
    }

    if (e instanceof Error) {
      log.error(e.message);
      throw new AuthError("Looks like something is broken", 500, requestId);
    } else if (e instanceof PrismaClientValidationError) {
      throw new AuthError("Failed to find user", 500, requestId);
    }

    return {
      verified: false,
      done: false,
      requestId: "",
      user: null,
      token: null,
    };
  }

  const newRequestId = uuidv4();
  let token: string;

  try {
    token = jwt.sign(
      { id: user.id, requestId: newRequestId },
      JWT_SECRET as string,
      {
        algorithm: "HS512",
        expiresIn: "1d",
      }
    );
  } catch (e) {
    log.error((e as Error).message);
    throw new AuthError("Failed to generate token", 500, requestId);
  }

  return {
    verified: true,
    done: true,
    requestId: newRequestId,
    token,
    user,
  };
}

async function loginUser(number: string, req: Request): Promise<AuthResponse> {
  const requestId = uuidv4();

  const user = await __db.user.findUnique({
    where: {
      number,
    },
  });

  if (!user) {
    throw new AuthError("User not found", 400, requestId);
  }

  if (!user.verified) {
    throw new AuthError("User not verified", 400, requestId);
  }
  const otp = ToTp.generateAlphanumericOTP(number, OTP_SECRET, requestId);

  if (process.env.NODE_ENV === "production") {
    try {
      await Transport.sendMessage(
        `+91${number}`,
        `Your OTP is ${otp}, please verify your account.
          \n\nName: ${req.body.name}
          \nEmail: ${req.body.email}
          \nRequestId: ${requestId}`
      );
    } catch (e) {
      log.error("Inside the auth.route.ts file, while sending the otp");
      log.error(e);
      throw new AuthError("Failed to send OTP", 500, requestId);
    }
  }

  log.info(
    `Generated alphanumeric OTP for +91${number}: ${otp}, requestId: ${requestId}`
  );

  return {
    requestId,
    user: user,
    verified: false,
    done: true,
    token: null,
    ...(process.env.NODE_ENV !== "production" && { otp }),
  };
}

export const AuthService = {
  signUpUser,
  verifyUser,
  loginUser,
};
