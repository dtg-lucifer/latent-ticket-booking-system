import { Router } from "express";
import { authRouter } from "./auth.route";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);

export { mainRouter };
