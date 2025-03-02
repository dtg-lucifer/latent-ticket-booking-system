import { NextFunction, Request, Response } from "express";
import { z, ZodIssue } from "zod";

import { StatusCodes } from "http-status-codes";

export const bodyValidator = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errMsg = e.errors.map((issue: ZodIssue) => {
          return {
            message: `${issue.path.join(".")} is ${issue.message}`,
          };
        });

        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: "Validation Error", errors: errMsg });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  };
};
