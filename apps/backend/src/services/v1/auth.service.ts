/**
 * @file auth.service.ts
 * @description This file contains the authentication service for the application.
 * It handles user signup, verification, and login.
 * @maintainer dtg-lucifer
 */

import { User } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Transport, ToTp } from "../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import { __db } from "@repo/db/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { log } from "../../middlewares/logger";
import jwt from "jsonwebtoken";
import { JWT_SECRET, OTP_SECRET } from "../../config";
import { AuthResponse } from "../../utils/types";

async function signUpUser(
  number: string,
  req: Request,
  res: Response
): Promise<AuthResponse> {
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
      log.error(e.stack);
    } else if (e instanceof PrismaClientValidationError) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to create or validate user",
      });
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
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "User already verified" });
    return {
      verified: true,
      done: true,
      requestId: "",
      user: nonVeriFiedUser,
      token: null,
    };
  }

  const requestId = uuidv4();

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
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to send OTP",
      });
      return {
        verified: false,
        done: false,
        requestId: "",
        user: null,
        token: null,
      };
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
  };
}

async function verifyUser(
  number: string,
  otp: string,
  requestId: string,
  req: Request,
  res: Response
): Promise<AuthResponse> {
  if (!ToTp.verifyAlphanumericOTP(number, OTP_SECRET, requestId, otp)) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid OTP" });
    return {
      verified: false,
      done: false,
      requestId: "",
      user: null,
      token: null,
    };
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to generate token",
    });
    return {
      verified: false,
      done: false,
      requestId: "",
      user: null,
      token: null,
    };
  }

  return {
    verified: true,
    done: true,
    requestId: newRequestId,
    token,
    user,
  };
}

async function loginUser(
  number: string,
  req: Request,
  res: Response
): Promise<AuthResponse> {
  const requestId = uuidv4();

  const user = await __db.user.findUnique({
    where: {
      number,
    },
  });

  if (!user) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "User not found" });
    return {
      verified: false,
      done: false,
      requestId: "",
      user: null,
      token: null,
    };
  }

  if (!user.verified) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "User not verified" });
    return {
      verified: false,
      done: false,
      requestId,
      user: null,
      token: null,
    };
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
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to send OTP",
      });
      return {
        verified: false,
        done: false,
        requestId: "",
        user: null,
        token: null,
      };
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
  };
}

export const AuthService = {
  signUpUser,
  verifyUser,
  loginUser,
};
