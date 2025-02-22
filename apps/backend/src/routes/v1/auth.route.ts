import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", (req, res) => {
  res.send("User signed up");
});

authRouter.post("/signup/verify", (req, res) => {
  res.send("Otp verified");
});

export { authRouter };
