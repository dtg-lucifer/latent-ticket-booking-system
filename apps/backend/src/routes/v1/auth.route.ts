import { generateToken, verifyToken } from "authenticator";
import { Router } from "express";
import { log } from "../../lib/logger";
import { validPhoneNumber } from "../../lib/utils";

const authRouter = Router();

/**
 * @description
 * This route is used to send an OTP to the user's phone number.
 */
authRouter.post("/signup", (req, res) => {
  const { phoneNumber } = req.body;
  if (!validPhoneNumber(phoneNumber)) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  const totp = generateToken(phoneNumber + "SIGNUP");
  // TODO send the otp to the number

  log.info(`Generated TOTP for ${phoneNumber}: ${totp}`);
  res.status(200).json({ message: "Otp sent", id: "random_UUID" });
});

/**
 * @description
 * This route is used to verify the OTP sent to the user's phone number.
 */
authRouter.post("/signup/verify", (req, res) => {
  const { otp, phoneNumber } = req.body;
  if (!otp || !validPhoneNumber(phoneNumber)) {
    res.status(401).json({ error: "OTP and phone number are required" });
    return;
  }

  if (!verifyToken(phoneNumber + "SIGNUP", otp)) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }
});

export { authRouter };
