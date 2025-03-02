import z from "zod";

/**
 * @info Auth related schemas
 */
export const SignUpUserSchema = z.object({
  number: z.string().min(10).max(10),
  name: z.string().min(3),
  email: z.string().email(),
});

export const SignUpOtpSchema = z.object({
  /**
   * This is for the otp verification part
   */
  otp: z.string().min(6).max(6),
  number: z.string().min(10).max(10),
});

// ---------------------------------------
