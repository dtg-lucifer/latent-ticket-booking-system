import express from "express";
import { info, loggerMiddleware } from "./lib/logger";
import { mainRouter } from "./routes/v1/_index";

const app = express();

const API_VERSION = "/api/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.use(`${API_VERSION}/`, mainRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.listen(process.env.PORT ?? 8998, () => {
  info("Server listening at port 8998");
});
