/**
 * @info Auth related schemas
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import z from "zod";

/**
 * This is for signup
 */
export const SignUpUserSchema = z.object({
  number: z.string().min(10).max(10),
  name: z.string().min(3),
  email: z.string().email(),
});

/**
 * This is for the otp verification part
 */
export const OtpSchema = z.object({
  otp: z.string().min(6).max(6),
  number: z.string().min(10).max(10),
  requestId: z.string().uuid(),
});

// ---------------------------------------
