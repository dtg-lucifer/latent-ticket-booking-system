import express from "express";
import { info } from "./utils/logger";
import { mainRouter } from "./routes/v1/_index";

const app = express();

const API_VERSION = "/api/v1";

app.use(`${API_VERSION}/`, mainRouter);

app.listen(process.env.PORT ?? 8998, () => {
  info("Server listening at port 8998");
});
