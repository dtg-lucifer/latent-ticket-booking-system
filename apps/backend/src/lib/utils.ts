import twilio from "twilio";
import { log } from "../middlewares/logger";
import { ACCOUNTSID, AUTHTOKEN } from "../config";

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
    // @info - Although there is no need for this callback, but it is still there
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
 * This is the wrapper for both of the methods, i didn't want to export them separately
 * also i didnt want to create a whole class for those two methods
 * @maintainer dtg-lucifer
 */
export const Transport = {
  sendMessage,
  sendEmail,
};
