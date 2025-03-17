import { User } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Transport } from "../../lib/utils";
import { generateToken, verifyToken } from "authenticator";
import { v4 as uuidv4 } from "uuid";
import { __db } from "@repo/db/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { log } from "../../middlewares/logger";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

interface AuthResponse {
  verified: boolean;
  done: boolean;
  requestId: string;
  user: User | null;
  token: string | null;
}

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
  const totp = generateToken(number + "SIGNUP");

  if (process.env.NODE_ENV === "production") {
    try {
      await Transport.sendMessage(
        `+91${number}`,
        `Your OTP is ${totp}, please verify your account.
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

  log.info(`Generated TOTP for ${number}: ${totp}, requestId: ${requestId}`);

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
  req: Request,
  res: Response
): Promise<AuthResponse> {
  if (!verifyToken(number + "SIGNUP", otp)) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid OTP" });
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

  const requestId = uuidv4();
  let token: string;

  try {
    token = jwt.sign({ id: user.id, requestId }, JWT_SECRET as string, {
      algorithm: "HS512",
      expiresIn: "1d",
    });
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
    requestId,
    token,
    user,
  };
}

async function loginUser(
  number: string,
  req: Request,
  res: Response
): Promise<AuthResponse> {}

export const AuthService = {
  signUpUser,
  verifyUser,
  loginUser,
};
