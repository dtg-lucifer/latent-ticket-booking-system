import twilio from "twilio";
import { log } from "../middlewares/logger";
import { ACCOUNTSID, AUTHTOKEN } from "../config";
import crypto from "crypto";

/**
 * This function is meant to be used for sending the otp and important info to the user
 * @param {String} to The number where the msg is to be sent
 * @param {String} body The body of the message
 * @maintainer dtg-lucifer
 */
const sendMessage = async (to: string, body: string) => {
  const client = twilio(ACCOUNTSID, AUTHTOKEN);

  await client.messages.create(
    {
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    },
    (err, m) => {
      if (err) {
        log.error("Failed to send message : { src/lib/utils.ts }");
        log.error(err);
        return;
      }

      log.info(`Message sent to ${to} with SID: ${m?.sid}`);
      log.info(`Message details: ${JSON.stringify(m?.toJSON())}`);
    }
  );
};

/**
 * Transport method to send emails to clients and recipients about some important info
 * @param {String} to Recipient's email
 * @param {String} subject Email's subject
 * @param {String} body  Email's body
 * @maintainer dtg-lucifer
 */
const sendEmail = async (to: string, subject: string, body: string) => {};

/**
 * Generates an alphanumeric OTP (6 characters) based on provided inputs
 *
 * @param phoneNumber The user's phone number
 * @param secret The secret key for OTP generation
 * @param requestId Unique request identifier
 * @param time Optional timestamp (defaults to current time)
 * @returns A 6-character alphanumeric OTP
 */
function generateAlphanumericOTP(
  phoneNumber: string,
  secret: string,
  requestId: string,
  time?: number
): string {
  // Round time to nearest 5 minutes for consistency
  const timestamp = time || Date.now();
  const roundedTime = Math.floor(timestamp / (5 * 60 * 1000)) * (5 * 60 * 1000);

  // Create a hash using all inputs
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${phoneNumber}${requestId}${roundedTime}`);
  const hash = hmac.digest("hex");

  // Take first 6 characters and ensure alphanumeric mix
  // Use different parts of the hash to ensure mixture of characters
  const alphanumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let otp = "";

  // Get 6 characters from different parts of the hash
  for (let i = 0; i < 6; i++) {
    // Use different sections of the hash
    const index =
      parseInt(hash.substring(i * 5, i * 5 + 5), 16) % alphanumeric.length;
    otp += alphanumeric[index];
  }

  return otp;
}

/**
 * Verifies if a given OTP is valid
 *
 * @param phoneNumber The user's phone number
 * @param secret The secret key for OTP generation
 * @param requestId Unique request identifier
 * @param inputOTP The OTP to verify
 * @returns Boolean indicating whether OTP is valid
 */
function verifyAlphanumericOTP(
  phoneNumber: string,
  secret: string,
  requestId: string,
  inputOTP: string
): boolean {
  const currentTime = Date.now();

  // Check current 5-minute window
  const currentOTP = generateAlphanumericOTP(
    phoneNumber,
    secret,
    requestId,
    currentTime
  );
  if (currentOTP === inputOTP.toUpperCase()) {
    return true;
  }

  // Check previous 5-minute window for edge cases
  const previousOTP = generateAlphanumericOTP(
    phoneNumber,
    secret,
    requestId,
    currentTime - 5 * 60 * 1000
  );
  return previousOTP === inputOTP.toUpperCase();
}

/**
 * This is the wrapper for both of the methods, i didn't want to export them separately
 * also i didnt want to create a whole class for those two methods
 * @maintainer dtg-lucifer
 */
export const Transport = {
  sendMessage,
  sendEmail,
};

/**
 * This is the wrapper for both of the methods, i didn't want to export them separately
 * also i didnt want to create a whole class for those two methods
 * @maintainer dtg-lucifer
 */
export const ToTp = {
  generateAlphanumericOTP,
  verifyAlphanumericOTP,
};
