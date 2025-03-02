/**
 * @info
 * Configurations for the app
 * @copyright dtg-lucifer
 */

export const JWT_SECRET: string = process.env.JWT_SECRET ?? "super_secret";
export const JWT_EXPIRY = process.env.JWT_EXPIRY ?? "1h";
export const OTP_EXPIRY: string = process.env.OTP_EXPIRY ?? "1m";
export const OTP_LENGTH: string = process.env.OTP_LENGTH ?? "6";

// ---------------------------------------
