/**
 * @info
 * Configurations for the app
 * @copyright dtg-lucifer
 */

import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET: string = process.env.JWT_SECRET ?? "super_secret";
export const JWT_EXPIRY = process.env.JWT_EXPIRY ?? "1h";
export const OTP_EXPIRY: string = process.env.OTP_EXPIRY ?? "1m";
export const OTP_LENGTH: string = process.env.OTP_LENGTH ?? "6";
export const OTP_SECRET: string = process.env.OTP_SECRET_KEY ?? "super_secret";

// ---------------------------------------

export const ACCOUNTSID = process.env.TWILLIO_LIVE_ACCOUNT_SID;
export const AUTHTOKEN = process.env.TWILLIO_LIVE_AUTH_TOKEN;

// ---------------------------------------

export const CORS_ORIGINS = ["localhost:3000", "http://localhost:3000"];
